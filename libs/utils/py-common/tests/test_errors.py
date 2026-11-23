"""Unit tests for py_utils_common.errors."""

from __future__ import annotations

import pytest
from py_utils_common import AppError, ErrorCode, ErrorEnvelope, correlation_context
from pydantic import ValidationError


def test_error_code_values() -> None:
    expected = {
        "VALIDATION",
        "NOT_FOUND",
        "UNAUTHORIZED",
        "FORBIDDEN",
        "CONFLICT",
        "RATE_LIMITED",
        "TIMEOUT",
        "UNAVAILABLE",
        "INTERNAL",
    }
    assert {code.value for code in ErrorCode} == expected


def test_app_error_is_immutable_and_raisable() -> None:
    source_details = {"field": "email"}
    err = AppError(
        ErrorCode.VALIDATION,
        "Invalid email address",
        details=source_details,
        retryable=False,
    )
    source_details["field"] = "mutated"
    assert err.details["field"] == "email"

    with pytest.raises(AttributeError, match="immutable"):
        err.message = "changed"  # type: ignore[misc]

    with pytest.raises(AttributeError, match="immutable"):
        del err.code

    with pytest.raises(TypeError):
        err.details["new_key"] = "nope"  # type: ignore[index]

    with pytest.raises(AppError) as exc_info:
        raise err
    assert exc_info.value.code is ErrorCode.VALIDATION
    assert str(exc_info.value) == "Invalid email address"


def test_app_error_to_envelope_uses_context_or_explicit_cid() -> None:
    err = AppError(
        ErrorCode.RATE_LIMITED,
        "Too many requests",
        details={"retry_after_seconds": 30},
        retryable=True,
    )

    with correlation_context("ctx-cid-1"):
        env_from_ctx = err.to_envelope()
        assert env_from_ctx.correlation_id == "ctx-cid-1"
        assert env_from_ctx.code is ErrorCode.RATE_LIMITED
        assert env_from_ctx.retryable is True
        assert env_from_ctx.details == {"retry_after_seconds": 30}

        env_explicit = err.to_envelope(correlation_id="override-cid")
        assert env_explicit.correlation_id == "override-cid"

    env_none = err.to_envelope()
    assert env_none.correlation_id is None


def test_error_envelope_is_frozen_and_serializable() -> None:
    env = ErrorEnvelope(code=ErrorCode.NOT_FOUND, message="Resource missing")
    dumped = env.model_dump_json()
    restored = ErrorEnvelope.model_validate_json(dumped)
    assert restored == env

    with pytest.raises(ValidationError):
        env.message = "mutated"  # type: ignore[misc]


def test_app_error_repr_and_equality() -> None:
    err1 = AppError(ErrorCode.CONFLICT, "Duplicate key", details={"id": 1})
    err2 = AppError(ErrorCode.CONFLICT, "Duplicate key", details={"id": 1})
    err3 = AppError(ErrorCode.INTERNAL, "Boom")

    assert err1 == err2
    assert err1 != err3
    assert err1 != "not-an-error"
    assert "CONFLICT" in repr(err1)
    assert "Duplicate key" in repr(err1)
