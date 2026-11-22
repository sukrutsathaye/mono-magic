"""Unit tests for DTOs, enums, Result primitives, and Pydantic v2 validation."""

from __future__ import annotations

from datetime import UTC, datetime

import pytest
from py_data_access_interfaces import (
    AuthSession,
    DataAccessError,
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
    Result,
    SignedUrlResponse,
    SortDirection,
    SortSpec,
    StorageObjectMeta,
    UserClaims,
    err,
    is_err,
    is_ok,
    ok,
)
from pydantic import ValidationError


def test_result_ok_and_err_operations() -> None:
    success: Result[int, DataAccessError] = ok(21)
    assert success.is_ok() is True
    assert success.is_err() is False
    assert is_ok(success) is True
    assert is_err(success) is False
    assert success.unwrap() == 21
    assert success.unwrap_or(0) == 21
    assert success.map(lambda n: n * 2) == ok(42)
    assert success.flat_map(lambda n: ok(str(n))) == ok("21")

    failure_error = DataAccessError(
        code=ErrorCode.NOT_FOUND,
        message="missing record",
        retryable=False,
        provider="postgres",
        details={"id": "42"},
    )
    failure: Result[int, DataAccessError] = err(failure_error)
    assert failure.is_ok() is False
    assert failure.is_err() is True
    assert is_ok(failure) is False
    assert is_err(failure) is True
    assert failure.unwrap_or(99) == 99
    assert failure.map(lambda n: n * 2) == failure
    assert failure.flat_map(lambda n: ok(str(n))) == failure

    with pytest.raises(ValueError, match=r"Called unwrap\(\) on Err"):
        failure.unwrap()


def test_dto_immutability_and_validation() -> None:
    error = DataAccessError(code=ErrorCode.TIMEOUT, message="Request timed out", retryable=True)
    with pytest.raises(ValidationError):
        error.message = "mutated"  # type: ignore[misc]

    with pytest.raises(ValidationError):
        DataAccessError(code=ErrorCode.INTERNAL, message="")

    query = QuerySpec(
        filters=[FilterSpec(field="status", operator=FilterOperator.EQ, value="active")],
        sorts=[SortSpec(field="created_at", direction=SortDirection.DESC)],
        limit=25,
        offset=50,
    )
    assert query.limit == 25
    assert query.filters[0].operator == FilterOperator.EQ
    assert query.sorts[0].direction == SortDirection.DESC

    with pytest.raises(ValidationError):
        QuerySpec(limit=0)

    with pytest.raises(ValidationError):
        QuerySpec(offset=-1)

    page = PaginatedResult[str](items=["a", "b"], total=5, limit=2, offset=0, has_more=True)
    round_tripped = PaginatedResult[str].model_validate_json(page.model_dump_json())
    assert round_tripped == page


def test_domain_dtos_validation_and_serialization() -> None:
    claims = UserClaims(
        user_id="user-1",
        email="ada@example.com",
        email_verified=True,
        roles=["admin"],
    )
    session = AuthSession(
        access_token="tok-123",
        refresh_token="ref-123",
        expires_at=datetime.now(UTC),
        user=claims,
    )
    assert session.token_type == "Bearer"
    assert OAuthProvider.KEYCLOAK == "keycloak"

    meta = StorageObjectMeta(key="docs/guide.pdf", size_bytes=1024)
    assert meta.content_type == "application/octet-stream"
    signed = SignedUrlResponse(
        url="https://example.com/signed",
        expires_at=datetime.now(UTC),
        method="PUT",
    )
    assert signed.method == "PUT"

    envelope = RealtimeEnvelope(channel="room-1", event="joined", payload={"user": "ada"})
    presence = PresenceState(channel="room-1", user_id="user-1", status="online")
    assert envelope.channel == "room-1"
    assert presence.status == "online"

    money = Money(amount_minor=1500, currency=" usd ")
    assert money.currency == "USD"
    with pytest.raises(ValidationError):
        Money(amount_minor=-1, currency="USD")
    with pytest.raises(ValidationError):
        Money(amount_minor=100, currency="US")
    with pytest.raises(ValidationError):
        Money.model_validate({"amount_minor": 100, "currency": 123})

    intent = PaymentIntent(
        id="pi_123",
        amount=money,
        status=PaymentStatus.REQUIRES_CONFIRMATION,
    )
    assert intent.status == PaymentStatus.REQUIRES_CONFIRMATION
