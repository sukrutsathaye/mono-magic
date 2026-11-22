"""In-memory reference adapters used to self-test py-data-access-interfaces contracts."""

from __future__ import annotations

from collections.abc import Awaitable, Callable, Mapping
from copy import deepcopy
from datetime import UTC, datetime, timedelta
from typing import Any, Literal
from uuid import uuid4

from py_data_access_interfaces import (
    AuthSession,
    BaseAuthProvider,
    BaseDataRepository,
    BasePaymentProvider,
    BaseRealtimeProvider,
    BaseStorageProvider,
    DataAccessError,
    DataRepository,
    ErrorCode,
    FilterOperator,
    FilterSpec,
    Money,
    OAuthProvider,
    PaginatedResult,
    PaymentIntent,
    PaymentStatus,
    PresenceState,
    QuerySpec,
    RealtimeEnvelope,
    RealtimeHandler,
    Result,
    SignedUrlResponse,
    SortDirection,
    StorageObjectMeta,
    UnsubscribeFn,
    UserClaims,
    err,
    is_err,
    ok,
)
from pydantic import BaseModel


def _matches_filter(entity: BaseModel, spec: FilterSpec) -> bool:
    actual = getattr(entity, spec.field, None)
    match spec.operator:
        case FilterOperator.EQ:
            return actual == spec.value
        case FilterOperator.NEQ:
            return actual != spec.value
        case FilterOperator.IN:
            return actual in spec.value
        case FilterOperator.GT:
            return actual is not None and actual > spec.value
        case FilterOperator.GTE:
            return actual is not None and actual >= spec.value
        case FilterOperator.LT:
            return actual is not None and actual < spec.value
        case FilterOperator.LTE:
            return actual is not None and actual <= spec.value
        case FilterOperator.CONTAINS:
            return actual is not None and str(spec.value) in str(actual)


class InMemoryDataRepository[TModel: BaseModel](BaseDataRepository[TModel, str]):
    """In-memory ``BaseDataRepository`` supporting filtering, sorting, and rollback."""

    def __init__(self, id_field: str = "id") -> None:
        self._id_field = id_field
        self._store: dict[str, TModel] = {}

    async def find_by_id(self, entity_id: str) -> Result[TModel | None, DataAccessError]:
        item = self._store.get(entity_id)
        return ok(item.model_copy(deep=True) if item is not None else None)

    async def find_many(
        self,
        query: QuerySpec | None = None,
    ) -> Result[PaginatedResult[TModel], DataAccessError]:
        spec = query or QuerySpec()
        items = [
            item.model_copy(deep=True)
            for item in self._store.values()
            if all(_matches_filter(item, f) for f in spec.filters)
        ]
        for sort in reversed(spec.sorts):
            items.sort(
                key=lambda item, field=sort.field: getattr(item, field),
                reverse=sort.direction == SortDirection.DESC,
            )
        total = len(items)
        sliced = items[spec.offset : spec.offset + spec.limit]
        has_more = spec.offset + len(sliced) < total
        return ok(
            PaginatedResult(
                items=sliced,
                total=total,
                limit=spec.limit,
                offset=spec.offset,
                has_more=has_more,
            )
        )

    async def create(self, entity: TModel) -> Result[TModel, DataAccessError]:
        entity_id = str(getattr(entity, self._id_field))
        if entity_id in self._store:
            return err(
                DataAccessError(
                    code=ErrorCode.CONFLICT,
                    message=f"Entity '{entity_id}' already exists.",
                    provider="in_memory",
                )
            )
        stored = entity.model_copy(deep=True)
        self._store[entity_id] = stored
        return ok(stored.model_copy(deep=True))

    async def update(
        self,
        entity_id: str,
        patch: Mapping[str, Any],
    ) -> Result[TModel, DataAccessError]:
        existing = self._store.get(entity_id)
        if existing is None:
            return err(
                DataAccessError(
                    code=ErrorCode.NOT_FOUND,
                    message=f"Entity '{entity_id}' not found.",
                    provider="in_memory",
                )
            )
        updated = existing.model_copy(update=dict(patch))
        self._store[entity_id] = updated
        return ok(updated.model_copy(deep=True))

    async def delete(self, entity_id: str) -> Result[None, DataAccessError]:
        if entity_id not in self._store:
            return err(
                DataAccessError(
                    code=ErrorCode.NOT_FOUND,
                    message=f"Entity '{entity_id}' not found.",
                    provider="in_memory",
                )
            )
        del self._store[entity_id]
        return ok(None)

    async def transaction[TOut](
        self,
        fn: Callable[[DataRepository[TModel, str]], Awaitable[Result[TOut, DataAccessError]]],
    ) -> Result[TOut, DataAccessError]:
        snapshot = deepcopy(self._store)
        try:
            outcome = await fn(self)
        except Exception as exc:
            self._store = snapshot
            return err(
                DataAccessError(
                    code=ErrorCode.INTERNAL,
                    message="Transaction failed with unexpected exception.",
                    provider="in_memory",
                    cause=str(exc),
                )
            )
        if is_err(outcome):
            self._store = snapshot
        return outcome


class InMemoryAuthProvider(BaseAuthProvider):
    """In-memory ``BaseAuthProvider`` supporting email/password, OAuth, and token rotation."""

    def __init__(self) -> None:
        self._users: dict[str, tuple[str, UserClaims]] = {}
        self._sessions: dict[str, AuthSession] = {}
        self._refresh_tokens: dict[str, str] = {}

    def _issue_session(self, claims: UserClaims) -> AuthSession:
        access = f"acc_{uuid4().hex}"
        refresh = f"ref_{uuid4().hex}"
        session = AuthSession(
            access_token=access,
            refresh_token=refresh,
            expires_at=datetime.now(UTC) + timedelta(hours=1),
            user=claims,
        )
        self._sessions[access] = session
        self._refresh_tokens[refresh] = access
        return session

    async def sign_in_with_email(
        self,
        email: str,
        password: str,
    ) -> Result[AuthSession, DataAccessError]:
        record = self._users.get(email)
        if record is None or record[0] != password:
            return err(
                DataAccessError(
                    code=ErrorCode.UNAUTHORIZED,
                    message="Invalid email or password.",
                    provider="in_memory",
                )
            )
        return ok(self._issue_session(record[1]))

    async def sign_up_with_email(
        self,
        email: str,
        password: str,
        *,
        display_name: str | None = None,
    ) -> Result[AuthSession, DataAccessError]:
        if email in self._users:
            return err(
                DataAccessError(
                    code=ErrorCode.CONFLICT,
                    message=f"User '{email}' already exists.",
                    provider="in_memory",
                )
            )
        claims = UserClaims(
            user_id=f"usr_{uuid4().hex[:8]}",
            email=email,
            email_verified=False,
            display_name=display_name,
            roles=["user"],
        )
        self._users[email] = (password, claims)
        return ok(self._issue_session(claims))

    async def sign_in_with_oauth(
        self,
        provider: OAuthProvider,
        *,
        redirect_uri: str | None = None,
        code: str | None = None,
    ) -> Result[AuthSession, DataAccessError]:
        claims = UserClaims(
            user_id=f"oauth_{provider.value}_{uuid4().hex[:8]}",
            email=f"{provider.value}@example.com",
            email_verified=True,
            display_name=f"{provider.value.title()} User",
        )
        return ok(self._issue_session(claims))

    async def sign_out(
        self,
        access_token: str | None = None,
    ) -> Result[None, DataAccessError]:
        if access_token is not None:
            session = self._sessions.pop(access_token, None)
            if session is not None and session.refresh_token is not None:
                self._refresh_tokens.pop(session.refresh_token, None)
        return ok(None)

    async def get_current_session(
        self,
        access_token: str | None = None,
    ) -> Result[AuthSession | None, DataAccessError]:
        if access_token is None:
            return ok(None)
        return ok(self._sessions.get(access_token))

    async def refresh_token(
        self,
        refresh_token: str,
    ) -> Result[AuthSession, DataAccessError]:
        old_access = self._refresh_tokens.pop(refresh_token, None)
        if old_access is None:
            return err(
                DataAccessError(
                    code=ErrorCode.UNAUTHORIZED,
                    message="Invalid or expired refresh token.",
                    provider="in_memory",
                )
            )
        old_session = self._sessions.pop(old_access, None)
        if old_session is None:
            return err(
                DataAccessError(
                    code=ErrorCode.UNAUTHORIZED,
                    message="Session no longer active.",
                    provider="in_memory",
                )
            )
        return ok(self._issue_session(old_session.user))

    async def verify_token(
        self,
        token: str,
    ) -> Result[UserClaims, DataAccessError]:
        session = self._sessions.get(token)
        if session is None or session.expires_at <= datetime.now(UTC):
            return err(
                DataAccessError(
                    code=ErrorCode.UNAUTHORIZED,
                    message="Invalid or expired access token.",
                    provider="in_memory",
                )
            )
        return ok(session.user)


class InMemoryStorageProvider(BaseStorageProvider):
    """In-memory ``BaseStorageProvider`` storing bytes and object metadata."""

    def __init__(self) -> None:
        self._objects: dict[str, tuple[bytes, StorageObjectMeta]] = {}

    async def upload(
        self,
        key: str,
        data: bytes,
        *,
        content_type: str = "application/octet-stream",
        metadata: Mapping[str, str] | None = None,
    ) -> Result[StorageObjectMeta, DataAccessError]:
        meta = StorageObjectMeta(
            key=key,
            content_type=content_type,
            size_bytes=len(data),
            etag=f"etag-{len(data)}-{hash(data) & 0xFFFF:04x}",
            updated_at=datetime.now(UTC),
            metadata=dict(metadata or {}),
        )
        self._objects[key] = (bytes(data), meta)
        return ok(meta)

    async def download(self, key: str) -> Result[bytes, DataAccessError]:
        entry = self._objects.get(key)
        if entry is None:
            return err(
                DataAccessError(
                    code=ErrorCode.NOT_FOUND,
                    message=f"Object '{key}' not found.",
                    provider="in_memory",
                )
            )
        return ok(entry[0])

    async def get_signed_url(
        self,
        key: str,
        *,
        expires_in_seconds: int = 3600,
        method: Literal["GET", "PUT", "DELETE"] = "GET",
    ) -> Result[SignedUrlResponse, DataAccessError]:
        if expires_in_seconds <= 0:
            return err(
                DataAccessError(
                    code=ErrorCode.VALIDATION,
                    message="expires_in_seconds must be positive.",
                    provider="in_memory",
                )
            )
        return ok(
            SignedUrlResponse(
                url=f"https://storage.local/{key}?method={method}",
                expires_at=datetime.now(UTC) + timedelta(seconds=expires_in_seconds),
                method=method,
            )
        )

    async def delete(self, key: str) -> Result[None, DataAccessError]:
        if key not in self._objects:
            return err(
                DataAccessError(
                    code=ErrorCode.NOT_FOUND,
                    message=f"Object '{key}' not found.",
                    provider="in_memory",
                )
            )
        del self._objects[key]
        return ok(None)

    async def list_objects(
        self,
        *,
        prefix: str = "",
        limit: int = 100,
        cursor: str | None = None,
    ) -> Result[PaginatedResult[StorageObjectMeta], DataAccessError]:
        matching = sorted(
            (meta for k, (_, meta) in self._objects.items() if k.startswith(prefix)),
            key=lambda m: m.key,
        )
        offset = int(cursor) if cursor is not None else 0
        sliced = matching[offset : offset + limit]
        has_more = offset + len(sliced) < len(matching)
        next_cursor = str(offset + len(sliced)) if has_more else None
        return ok(
            PaginatedResult(
                items=sliced,
                total=len(matching),
                limit=limit,
                offset=offset,
                has_more=has_more,
                next_cursor=next_cursor,
            )
        )


class InMemoryRealtimeProvider(BaseRealtimeProvider):
    """In-memory ``BaseRealtimeProvider`` dispatching events to subscribed handlers."""

    def __init__(self) -> None:
        self._subscribers: dict[str, dict[str, RealtimeHandler]] = {}
        self._presence: dict[str, list[PresenceState]] = {}

    def set_presence(self, channel: str, states: list[PresenceState]) -> None:
        """Seed active presence states for a channel in tests."""
        self._presence[channel] = list(states)

    async def publish(
        self,
        channel: str,
        event: str,
        payload: dict[str, Any],
        *,
        sender_id: str | None = None,
    ) -> Result[RealtimeEnvelope, DataAccessError]:
        envelope = RealtimeEnvelope(
            channel=channel,
            event=event,
            payload=dict(payload),
            sender_id=sender_id,
            message_id=f"msg_{uuid4().hex[:8]}",
        )
        handlers = list(self._subscribers.get(channel, {}).values())
        for handler in handlers:
            await handler(envelope)
        return ok(envelope)

    async def subscribe(
        self,
        channel: str,
        handler: RealtimeHandler,
    ) -> Result[UnsubscribeFn, DataAccessError]:
        sub_id = uuid4().hex
        self._subscribers.setdefault(channel, {})[sub_id] = handler

        async def _unsubscribe() -> None:
            self._subscribers.get(channel, {}).pop(sub_id, None)

        return ok(_unsubscribe)

    async def presence(
        self,
        channel: str,
    ) -> Result[list[PresenceState], DataAccessError]:
        return ok(list(self._presence.get(channel, [])))


class InMemoryPaymentProvider(BasePaymentProvider):
    """In-memory ``BasePaymentProvider`` simulating payment intent lifecycle."""

    def __init__(self) -> None:
        self._intents: dict[str, PaymentIntent] = {}
        self._idempotency: dict[str, str] = {}

    async def create_payment_intent(
        self,
        amount: Money,
        *,
        customer_id: str | None = None,
        description: str | None = None,
        metadata: Mapping[str, str] | None = None,
        idempotency_key: str | None = None,
    ) -> Result[PaymentIntent, DataAccessError]:
        if idempotency_key is not None and idempotency_key in self._idempotency:
            existing_id = self._idempotency[idempotency_key]
            return ok(self._intents[existing_id])
        intent_id = f"pi_{uuid4().hex[:10]}"
        intent = PaymentIntent(
            id=intent_id,
            amount=amount,
            status=PaymentStatus.REQUIRES_CONFIRMATION,
            customer_id=customer_id,
            client_secret=f"{intent_id}_secret_{uuid4().hex[:8]}",
            description=description,
            metadata=dict(metadata or {}),
        )
        self._intents[intent_id] = intent
        if idempotency_key is not None:
            self._idempotency[idempotency_key] = intent_id
        return ok(intent)

    async def confirm_payment_intent(
        self,
        intent_id: str,
        *,
        payment_method_id: str | None = None,
    ) -> Result[PaymentIntent, DataAccessError]:
        intent = self._intents.get(intent_id)
        if intent is None:
            return err(
                DataAccessError(
                    code=ErrorCode.NOT_FOUND,
                    message=f"PaymentIntent '{intent_id}' not found.",
                    provider="in_memory",
                )
            )
        confirmed = intent.model_copy(update={"status": PaymentStatus.SUCCEEDED})
        self._intents[intent_id] = confirmed
        return ok(confirmed)

    async def get_payment_intent(
        self,
        intent_id: str,
    ) -> Result[PaymentIntent, DataAccessError]:
        intent = self._intents.get(intent_id)
        if intent is None:
            return err(
                DataAccessError(
                    code=ErrorCode.NOT_FOUND,
                    message=f"PaymentIntent '{intent_id}' not found.",
                    provider="in_memory",
                )
            )
        return ok(intent)

    async def refund_payment(
        self,
        intent_id: str,
        *,
        amount_minor: int | None = None,
        reason: str | None = None,
    ) -> Result[PaymentIntent, DataAccessError]:
        intent = self._intents.get(intent_id)
        if intent is None:
            return err(
                DataAccessError(
                    code=ErrorCode.NOT_FOUND,
                    message=f"PaymentIntent '{intent_id}' not found.",
                    provider="in_memory",
                )
            )
        if intent.status != PaymentStatus.SUCCEEDED:
            return err(
                DataAccessError(
                    code=ErrorCode.VALIDATION,
                    message="Only succeeded payment intents can be refunded.",
                    provider="in_memory",
                )
            )
        if amount_minor is not None and (
            amount_minor <= 0 or amount_minor > intent.amount.amount_minor
        ):
            return err(
                DataAccessError(
                    code=ErrorCode.VALIDATION,
                    message="Refund amount exceeds captured amount or is non-positive.",
                    provider="in_memory",
                )
            )
        refunded = intent.model_copy(update={"status": PaymentStatus.REFUNDED})
        self._intents[intent_id] = refunded
        return ok(refunded)
