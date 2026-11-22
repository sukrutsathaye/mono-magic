"""Tests executing the shared contract compliance suites against in-memory providers."""

from __future__ import annotations

from collections.abc import Mapping
from datetime import UTC, datetime
from typing import Any

import pytest
from py_data_access_interfaces import (
    AuthProvider,
    DataAccessError,
    DataRepository,
    ErrorCode,
    FilterOperator,
    FilterSpec,
    Money,
    PaymentProvider,
    PresenceState,
    QuerySpec,
    RealtimeProvider,
    Result,
    SortDirection,
    SortSpec,
    StorageProvider,
    err,
    is_err,
    is_ok,
)
from py_data_access_interfaces.testing import (
    assert_auth_contract,
    assert_payment_contract,
    assert_realtime_contract,
    assert_repository_contract,
    assert_storage_contract,
)
from pydantic import BaseModel

from .in_memory import (
    InMemoryAuthProvider,
    InMemoryDataRepository,
    InMemoryPaymentProvider,
    InMemoryRealtimeProvider,
    InMemoryStorageProvider,
)


class SampleEntity(BaseModel):
    """Sample entity model for repository contract compliance verification."""

    id: str
    name: str
    score: int = 0


def _make_sample(index: int) -> SampleEntity:
    return SampleEntity(id=f"item-{index}", name=f"Item {index}", score=index * 10)


async def test_repository_contract_compliance() -> None:
    repo = InMemoryDataRepository[SampleEntity]()
    assert isinstance(repo, DataRepository)

    await assert_repository_contract(
        repo,
        make_entity=_make_sample,
        get_id=lambda entity: entity.id,
        make_patch=lambda entity: {"name": f"{entity.name} Updated"},
        missing_id="does-not-exist",
        verify_patched=lambda entity: entity.name.endswith("Updated"),
    )


async def test_repository_contract_with_factory_and_queries() -> None:
    await assert_repository_contract(
        lambda: InMemoryDataRepository[SampleEntity](),
        make_entity=_make_sample,
        get_id=lambda entity: entity.id,
        make_patch=lambda entity: {"score": entity.score + 5},
        missing_id="missing",
    )

    repo = InMemoryDataRepository[SampleEntity]()
    for idx in range(1, 5):
        await repo.create(_make_sample(idx))

    filtered = await repo.find_many(
        QuerySpec(
            filters=[
                FilterSpec(field="score", operator=FilterOperator.GTE, value=20),
                FilterSpec(field="score", operator=FilterOperator.LT, value=40),
            ],
            sorts=[SortSpec(field="score", direction=SortDirection.DESC)],
        )
    )
    assert is_ok(filtered)
    assert [item.id for item in filtered.value.items] == ["item-3", "item-2"]

    async def _boom(_tx: DataRepository[SampleEntity, str]) -> Result[str, DataAccessError]:
        raise RuntimeError("boom")

    tx_err = await repo.transaction(_boom)
    assert is_err(tx_err)
    assert tx_err.error.code == ErrorCode.INTERNAL


async def test_auth_contract_compliance() -> None:
    provider = InMemoryAuthProvider()
    assert isinstance(provider, AuthProvider)
    await assert_auth_contract(provider)

    empty = await provider.get_current_session()
    assert is_ok(empty) and empty.value is None


async def test_storage_contract_compliance() -> None:
    provider = InMemoryStorageProvider()
    assert isinstance(provider, StorageProvider)
    await assert_storage_contract(provider)


async def test_realtime_contract_compliance() -> None:
    provider = InMemoryRealtimeProvider()
    assert isinstance(provider, RealtimeProvider)
    provider.set_presence(
        "contract-room",
        [PresenceState(channel="contract-room", user_id="u1", last_seen_at=datetime.now(UTC))],
    )
    await assert_realtime_contract(provider)


async def test_payment_contract_compliance() -> None:
    provider = InMemoryPaymentProvider()
    assert isinstance(provider, PaymentProvider)
    await assert_payment_contract(provider)

    idempotent_1 = await provider.create_payment_intent(
        Money(amount_minor=500, currency="EUR"),
        idempotency_key="idem-1",
    )
    idempotent_2 = await provider.create_payment_intent(
        Money(amount_minor=500, currency="EUR"),
        idempotency_key="idem-1",
    )
    assert is_ok(idempotent_1) and is_ok(idempotent_2)
    assert idempotent_1.value.id == idempotent_2.value.id


async def test_contract_helpers_fail_on_broken_provider() -> None:
    class BrokenRepo(InMemoryDataRepository[SampleEntity]):
        async def find_by_id(self, entity_id: str) -> Result[SampleEntity | None, DataAccessError]:
            return err(DataAccessError(code=ErrorCode.INTERNAL, message="broken"))

    with pytest.raises(AssertionError, match="Expected Ok"):
        await assert_repository_contract(
            BrokenRepo(),
            make_entity=_make_sample,
            get_id=lambda e: e.id,
            make_patch=lambda e: {"name": "x"},
            missing_id="missing",
        )

    class WrongErrRepo(InMemoryDataRepository[SampleEntity]):
        async def update(
            self,
            entity_id: str,
            patch: Mapping[str, Any],
        ) -> Result[SampleEntity, DataAccessError]:
            if entity_id == "missing":
                return err(DataAccessError(code=ErrorCode.INTERNAL, message="wrong code"))
            return await super().update(entity_id, patch)

    with pytest.raises(AssertionError, match=r"Expected NOT_FOUND"):
        await assert_repository_contract(
            WrongErrRepo(),
            make_entity=_make_sample,
            get_id=lambda e: e.id,
            make_patch=lambda e: {"name": "x"},
            missing_id="missing",
        )


async def test_structural_protocol_without_abc_inheritance() -> None:
    """Verify duck-typed Protocol compatibility without Base* inheritance."""

    class StructuralStorage:
        def __init__(self) -> None:
            self._delegate = InMemoryStorageProvider()

        async def upload(
            self,
            key: str,
            data: bytes,
            *,
            content_type: str = "application/octet-stream",
            metadata: Mapping[str, str] | None = None,
        ) -> Any:
            return await self._delegate.upload(
                key,
                data,
                content_type=content_type,
                metadata=metadata,
            )

        async def download(self, key: str) -> Any:
            return await self._delegate.download(key)

        async def get_signed_url(
            self,
            key: str,
            *,
            expires_in_seconds: int = 3600,
            method: Any = "GET",
        ) -> Any:
            return await self._delegate.get_signed_url(
                key,
                expires_in_seconds=expires_in_seconds,
                method=method,
            )

        async def delete(self, key: str) -> Any:
            return await self._delegate.delete(key)

        async def list_objects(
            self,
            *,
            prefix: str = "",
            limit: int = 100,
            cursor: str | None = None,
        ) -> Any:
            return await self._delegate.list_objects(
                prefix=prefix,
                limit=limit,
                cursor=cursor,
            )

    structural = StructuralStorage()
    assert isinstance(structural, StorageProvider)
    await assert_storage_contract(structural, prefix="structural")
