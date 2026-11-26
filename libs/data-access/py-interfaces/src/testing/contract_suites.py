"""Reusable pytest contract compliance assertions for data-access providers."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from ..auth import AuthProvider, OAuthProvider
from ..common import DataAccessError, Err, ErrorCode, Ok, QuerySpec, Result, err, is_err, is_ok, ok
from ..payments import Money, PaymentProvider, PaymentStatus
from ..realtime import RealtimeEnvelope, RealtimeProvider
from ..repository import DataRepository
from ..storage import StorageProvider


def _unwrap_ok[TVal](result: Result[TVal, DataAccessError], context: str) -> TVal:
    assert is_ok(result), f"Expected Ok for {context}, got Err: {result}"
    return result.value


def _unwrap_err(
    result: Result[Any, DataAccessError],
    expected_code: ErrorCode,
    context: str,
) -> DataAccessError:
    assert is_err(result), f"Expected Err({expected_code}) for {context}, got Ok: {result}"
    assert result.error.code == expected_code, (
        f"Expected {expected_code} for {context}, got {result.error.code}: {result.error.message}"
    )
    return result.error


async def assert_repository_contract[TEntity, TId](
    repo_or_factory: DataRepository[TEntity, TId] | Callable[[], DataRepository[TEntity, TId]],
    *,
    make_entity: Callable[[int], TEntity],
    get_id: Callable[[TEntity], TId],
    make_patch: Callable[[TEntity], dict[str, Any]],
    missing_id: TId,
    verify_patched: Callable[[TEntity], bool] | None = None,
) -> None:
    """Verify Liskov Substitution for any ``DataRepository`` implementation.

    Exercises missing reads, create, duplicate-create ``CONFLICT``, partial update,
    missing-update ``NOT_FOUND``, paginated ``find_many``, delete, missing-delete
    ``NOT_FOUND``, and atomic transaction commit + rollback semantics.
    """
    repo = repo_or_factory() if callable(repo_or_factory) else repo_or_factory
    assert isinstance(repo, DataRepository), "Repository must satisfy DataRepository protocol."

    # 1. Reading a missing ID returns Ok(None)
    missing = _unwrap_ok(await repo.find_by_id(missing_id), "find_by_id(missing)")
    assert missing is None

    # 2. Create and retrieve
    entity_1 = make_entity(1)
    id_1 = get_id(entity_1)
    created = _unwrap_ok(await repo.create(entity_1), "create(entity_1)")
    assert get_id(created) == id_1

    found = _unwrap_ok(await repo.find_by_id(id_1), "find_by_id(entity_1)")
    assert found is not None
    assert get_id(found) == id_1

    # 3. Duplicate create fails with CONFLICT
    _unwrap_err(await repo.create(entity_1), ErrorCode.CONFLICT, "duplicate create")

    # 4. Update existing and reject missing
    updated = _unwrap_ok(await repo.update(id_1, make_patch(entity_1)), "update(entity_1)")
    assert get_id(updated) == id_1
    if verify_patched is not None:
        assert verify_patched(updated), "Patched entity failed verify_patched predicate."

    _unwrap_err(
        await repo.update(missing_id, make_patch(entity_1)),
        ErrorCode.NOT_FOUND,
        "update(missing_id)",
    )

    # 5. Pagination via find_many
    entity_2 = make_entity(2)
    entity_3 = make_entity(3)
    _unwrap_ok(await repo.create(entity_2), "create(entity_2)")
    _unwrap_ok(await repo.create(entity_3), "create(entity_3)")

    page_1 = _unwrap_ok(
        await repo.find_many(QuerySpec(limit=2, offset=0)),
        "find_many(limit=2, offset=0)",
    )
    assert len(page_1.items) == 2
    assert page_1.total >= 3
    assert page_1.has_more is True

    page_2 = _unwrap_ok(
        await repo.find_many(QuerySpec(limit=2, offset=2)),
        "find_many(limit=2, offset=2)",
    )
    assert len(page_2.items) >= 1

    # 6. Delete existing and reject missing
    _unwrap_ok(await repo.delete(id_1), "delete(entity_1)")
    after_delete = _unwrap_ok(await repo.find_by_id(id_1), "find_by_id after delete")
    assert after_delete is None
    _unwrap_err(await repo.delete(missing_id), ErrorCode.NOT_FOUND, "delete(missing_id)")

    # 7. Transaction commit persists writes
    entity_4 = make_entity(4)
    id_4 = get_id(entity_4)

    async def _commit_tx(tx_repo: DataRepository[TEntity, TId]) -> Result[TId, DataAccessError]:
        tx_res = await tx_repo.create(entity_4)
        if isinstance(tx_res, Err):
            return tx_res
        return ok(get_id(tx_res.value))

    tx_id = _unwrap_ok(await repo.transaction(_commit_tx), "transaction commit")
    assert tx_id == id_4
    committed = _unwrap_ok(await repo.find_by_id(id_4), "find_by_id after tx commit")
    assert committed is not None

    # 8. Transaction rollback reverts writes on Err
    entity_5 = make_entity(5)
    id_5 = get_id(entity_5)

    async def _rollback_tx(tx_repo: DataRepository[TEntity, TId]) -> Result[None, DataAccessError]:
        tx_res = await tx_repo.create(entity_5)
        if isinstance(tx_res, Err):
            return tx_res
        return err(DataAccessError(code=ErrorCode.VALIDATION, message="intentional rollback"))

    _unwrap_err(await repo.transaction(_rollback_tx), ErrorCode.VALIDATION, "transaction rollback")
    rolled_back = _unwrap_ok(await repo.find_by_id(id_5), "find_by_id after tx rollback")
    assert rolled_back is None


async def assert_auth_contract(
    provider: AuthProvider,
    *,
    email: str = "contract-user@example.com",
    password: str = "StrongPass!123",
    oauth_provider: OAuthProvider = OAuthProvider.GOOGLE,
) -> None:
    """Verify Liskov Substitution for any ``AuthProvider`` implementation.

    Exercises email sign-up, duplicate sign-up ``CONFLICT``, bad-password
    ``UNAUTHORIZED``, email sign-in, token verification, session lookup,
    refresh token lifecycle, OAuth sign-in, and sign-out invalidation.
    """
    assert isinstance(provider, AuthProvider), "Provider must satisfy AuthProvider protocol."

    # 1. Sign up
    signup_session = _unwrap_ok(
        await provider.sign_up_with_email(email, password, display_name="Contract User"),
        "sign_up_with_email",
    )
    assert signup_session.access_token
    assert signup_session.user.email == email

    # 2. Duplicate sign up returns CONFLICT
    _unwrap_err(
        await provider.sign_up_with_email(email, password),
        ErrorCode.CONFLICT,
        "duplicate sign_up_with_email",
    )

    # 3. Wrong password returns UNAUTHORIZED
    _unwrap_err(
        await provider.sign_in_with_email(email, "incorrect-password-xyz"),
        ErrorCode.UNAUTHORIZED,
        "sign_in_with_email wrong password",
    )

    # 4. Valid sign in
    session = _unwrap_ok(
        await provider.sign_in_with_email(email, password),
        "sign_in_with_email",
    )
    assert session.user.email == email

    # 5. Verify valid & invalid tokens
    claims = _unwrap_ok(await provider.verify_token(session.access_token), "verify_token(valid)")
    assert claims.user_id == session.user.user_id
    _unwrap_err(
        await provider.verify_token("invalid-access-token"),
        ErrorCode.UNAUTHORIZED,
        "verify_token(invalid)",
    )

    # 6. Get current session
    current = _unwrap_ok(
        await provider.get_current_session(session.access_token),
        "get_current_session",
    )
    assert current is not None
    assert current.user.user_id == session.user.user_id

    # 7. Refresh token if issued
    if session.refresh_token is not None:
        refreshed = _unwrap_ok(
            await provider.refresh_token(session.refresh_token),
            "refresh_token(valid)",
        )
        assert refreshed.user.user_id == session.user.user_id
        _unwrap_err(
            await provider.refresh_token("invalid-refresh-token"),
            ErrorCode.UNAUTHORIZED,
            "refresh_token(invalid)",
        )

    # 8. OAuth sign in
    oauth_session = _unwrap_ok(
        await provider.sign_in_with_oauth(oauth_provider, code="contract-oauth-code"),
        "sign_in_with_oauth",
    )
    assert oauth_session.access_token

    # 9. Sign out revokes active token
    _unwrap_ok(await provider.sign_out(session.access_token), "sign_out")
    _unwrap_err(
        await provider.verify_token(session.access_token),
        ErrorCode.UNAUTHORIZED,
        "verify_token after sign_out",
    )
    after_signout = await provider.get_current_session(session.access_token)
    assert (isinstance(after_signout, Ok) and after_signout.value is None) or (
        isinstance(after_signout, Err) and after_signout.error.code == ErrorCode.UNAUTHORIZED
    ), f"Expected empty session or UNAUTHORIZED after sign_out, got {after_signout}"


async def assert_storage_contract(
    provider: StorageProvider,
    *,
    prefix: str = "contract-test",
) -> None:
    """Verify Liskov Substitution for any ``StorageProvider`` implementation.

    Exercises upload, download, missing-download ``NOT_FOUND``, pre-signed URLs,
    prefix-scoped listing, delete, and missing-delete ``NOT_FOUND``.
    """
    assert isinstance(provider, StorageProvider), "Provider must satisfy StorageProvider protocol."

    key_1 = f"{prefix}/hello.txt"
    key_2 = f"{prefix}/nested/data.bin"
    payload = b"hello mono-magic storage"

    # 1. Upload & download
    meta = _unwrap_ok(
        await provider.upload(
            key_1,
            payload,
            content_type="text/plain",
            metadata={"env": "contract"},
        ),
        "upload(key_1)",
    )
    assert meta.key == key_1
    assert meta.size_bytes == len(payload)
    assert meta.content_type == "text/plain"

    downloaded = _unwrap_ok(await provider.download(key_1), "download(key_1)")
    assert downloaded == payload
    _unwrap_err(
        await provider.download(f"{prefix}/missing.txt"),
        ErrorCode.NOT_FOUND,
        "download(missing)",
    )

    # 2. Signed URL
    signed = _unwrap_ok(
        await provider.get_signed_url(key_1, expires_in_seconds=120, method="GET"),
        "get_signed_url",
    )
    assert signed.url
    assert signed.method == "GET"

    # 3. List objects with prefix
    _unwrap_ok(await provider.upload(key_2, b"\x00\x01\x02"), "upload(key_2)")
    listed = _unwrap_ok(await provider.list_objects(prefix=f"{prefix}/"), "list_objects")
    listed_keys = {item.key for item in listed.items}
    assert key_1 in listed_keys
    assert key_2 in listed_keys

    # 4. Delete & verify removal
    _unwrap_ok(await provider.delete(key_1), "delete(key_1)")
    _unwrap_err(await provider.download(key_1), ErrorCode.NOT_FOUND, "download after delete")
    _unwrap_err(
        await provider.delete(f"{prefix}/never-existed.txt"),
        ErrorCode.NOT_FOUND,
        "delete(missing)",
    )


async def assert_realtime_contract(
    provider: RealtimeProvider,
    *,
    channel: str = "contract-room",
) -> None:
    """Verify Liskov Substitution for any ``RealtimeProvider`` implementation."""
    assert isinstance(provider, RealtimeProvider), (
        "Provider must satisfy RealtimeProvider protocol."
    )

    received: list[RealtimeEnvelope] = []

    async def _handler(envelope: RealtimeEnvelope) -> None:
        received.append(envelope)

    unsubscribe = _unwrap_ok(
        await provider.subscribe(channel, _handler),
        "subscribe",
    )
    published = _unwrap_ok(
        await provider.publish(channel, "ping", {"seq": 1}, sender_id="tester"),
        "publish(1)",
    )
    assert published.channel == channel
    assert published.event == "ping"
    assert len(received) == 1
    assert received[0].payload == {"seq": 1}

    presence_list = _unwrap_ok(await provider.presence(channel), "presence")
    assert isinstance(presence_list, list)

    await unsubscribe()
    _unwrap_ok(await provider.publish(channel, "ping", {"seq": 2}), "publish(2) after unsub")
    assert len(received) == 1


async def assert_payment_contract(
    provider: PaymentProvider,
    *,
    amount_minor: int = 2500,
    currency: str = "USD",
) -> None:
    """Verify Liskov Substitution for any ``PaymentProvider`` implementation."""
    assert isinstance(provider, PaymentProvider), "Provider must satisfy PaymentProvider protocol."

    created = _unwrap_ok(
        await provider.create_payment_intent(
            Money(amount_minor=amount_minor, currency=currency),
            customer_id="cust_contract",
            description="Contract compliance charge",
        ),
        "create_payment_intent",
    )
    assert created.amount.amount_minor == amount_minor
    assert created.amount.currency == currency

    fetched = _unwrap_ok(await provider.get_payment_intent(created.id), "get_payment_intent")
    assert fetched.id == created.id

    _unwrap_err(
        await provider.get_payment_intent("missing-intent-id"),
        ErrorCode.NOT_FOUND,
        "get_payment_intent(missing)",
    )

    confirmed = _unwrap_ok(
        await provider.confirm_payment_intent(created.id, payment_method_id="pm_test"),
        "confirm_payment_intent",
    )
    assert confirmed.status == PaymentStatus.SUCCEEDED

    refunded = _unwrap_ok(
        await provider.refund_payment(created.id, amount_minor=amount_minor, reason="test"),
        "refund_payment",
    )
    assert refunded.status == PaymentStatus.REFUNDED
