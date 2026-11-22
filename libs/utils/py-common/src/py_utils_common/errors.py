"""Standardized application error codes, immutable exceptions, and API envelopes."""

from __future__ import annotations

from collections.abc import Mapping
from enum import StrEnum
from types import MappingProxyType
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from py_utils_common.logging import get_correlation_id

_EXCEPTION_INTERNAL_ATTRS: frozenset[str] = frozenset(
    {
        "__cause__",
        "__context__",
        "__notes__",
        "__suppress_context__",
        "__traceback__",
    }
)


class ErrorCode(StrEnum):
    """Canonical domain-agnostic error codes for cross-service error handling."""

    VALIDATION = "VALIDATION"
    NOT_FOUND = "NOT_FOUND"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    CONFLICT = "CONFLICT"
    RATE_LIMITED = "RATE_LIMITED"
    TIMEOUT = "TIMEOUT"
    UNAVAILABLE = "UNAVAILABLE"
    INTERNAL = "INTERNAL"


class ErrorEnvelope(BaseModel):
    """Immutable Pydantic v2 wire model for standardized API error responses."""

    model_config = ConfigDict(frozen=True)

    code: ErrorCode
    message: str = Field(min_length=1)
    details: dict[str, Any] = Field(default_factory=dict)
    retryable: bool = False
    correlation_id: str | None = None


class AppError(Exception):
    """Immutable application exception convertible to an :class:`ErrorEnvelope`.

    Attributes:
        code: Canonical :class:`ErrorCode` classifying the failure.
        message: Human-readable error summary.
        details: Read-only mapping of structured diagnostic metadata.
        retryable: Whether callers may safely retry the failed operation.
    """

    code: ErrorCode
    message: str
    details: Mapping[str, Any]
    retryable: bool

    def __init__(
        self,
        code: ErrorCode,
        message: str,
        *,
        details: Mapping[str, Any] | None = None,
        retryable: bool = False,
    ) -> None:
        """Initialize an immutable ``AppError``.

        Args:
            code: Canonical error code.
            message: Human-readable description of the error.
            details: Optional structured key-value metadata (copied into a read-only proxy).
            retryable: Whether the caller should consider retrying the request.
        """
        super().__init__(message)
        object.__setattr__(self, "code", code)
        object.__setattr__(self, "message", message)
        object.__setattr__(
            self,
            "details",
            MappingProxyType(dict(details) if details is not None else {}),
        )
        object.__setattr__(self, "retryable", retryable)

    def __setattr__(self, name: str, value: Any) -> None:
        if name in _EXCEPTION_INTERNAL_ATTRS:
            object.__setattr__(self, name, value)
            return
        raise AttributeError(f"AppError is immutable; cannot set attribute {name!r}")

    def __delattr__(self, name: str) -> None:
        raise AttributeError(f"AppError is immutable; cannot delete attribute {name!r}")

    def to_envelope(self, *, correlation_id: str | None = None) -> ErrorEnvelope:
        """Serialize this exception into a frozen :class:`ErrorEnvelope`.

        Args:
            correlation_id: Optional explicit correlation ID. When omitted, the
                current context correlation ID from :func:`get_correlation_id` is used.

        Returns:
            An immutable :class:`ErrorEnvelope` suitable for API responses.
        """
        resolved_cid = correlation_id if correlation_id is not None else get_correlation_id()
        return ErrorEnvelope(
            code=self.code,
            message=self.message,
            details=dict(self.details),
            retryable=self.retryable,
            correlation_id=resolved_cid,
        )

    def __repr__(self) -> str:
        return (
            f"AppError(code={self.code!r}, message={self.message!r}, "
            f"details={dict(self.details)!r}, retryable={self.retryable!r})"
        )

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, AppError):
            return NotImplemented
        return (
            self.code == other.code
            and self.message == other.message
            and dict(self.details) == dict(other.details)
            and self.retryable == other.retryable
        )
