"""Shared data-access primitives, error envelopes, Result union, and query/pagination DTOs."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from enum import StrEnum
from typing import Any, Literal, NoReturn, TypeGuard, cast

from pydantic import BaseModel, ConfigDict, Field


class ErrorCode(StrEnum):
    """Canonical vendor-agnostic error classification codes for data-access boundaries."""

    VALIDATION = "VALIDATION"
    NOT_FOUND = "NOT_FOUND"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    CONFLICT = "CONFLICT"
    RATE_LIMITED = "RATE_LIMITED"
    TIMEOUT = "TIMEOUT"
    UNAVAILABLE = "UNAVAILABLE"
    INTERNAL = "INTERNAL"


class DataAccessError(BaseModel):
    """Immutable, serializable error envelope returned by all data-access operations."""

    model_config = ConfigDict(frozen=True)

    code: ErrorCode = Field(..., description="Canonical error category.")
    message: str = Field(..., min_length=1, description="Human-readable error description.")
    retryable: bool = Field(
        default=False,
        description="Whether retrying the same operation may succeed.",
    )
    provider: str | None = Field(
        default=None,
        description="Optional concrete provider identifier (e.g., 'supabase', 'postgres').",
    )
    details: dict[str, Any] = Field(
        default_factory=dict,
        description="Optional structured diagnostic metadata.",
    )
    cause: str | None = Field(
        default=None,
        description="Optional serialized cause or underlying exception summary.",
    )


@dataclass(frozen=True, slots=True)
class Ok[T]:
    """Successful outcome of a fallible operation holding ``value``."""

    value: T

    def is_ok(self) -> Literal[True]:
        """Return ``True`` because this variant represents success."""
        return True

    def is_err(self) -> Literal[False]:
        """Return ``False`` because this variant represents success."""
        return False

    def unwrap(self) -> T:
        """Return the contained success value."""
        return self.value

    def unwrap_or(self, default: object) -> T:
        """Return the contained success value, ignoring ``default``."""
        return self.value

    def map[U](self, fn: Callable[[T], U]) -> Ok[U]:
        """Apply ``fn`` to the contained value and wrap the result in ``Ok``."""
        return Ok(fn(self.value))

    def flat_map[U, E2](self, fn: Callable[[T], Result[U, E2]]) -> Result[U, E2]:
        """Chain another fallible operation on the contained value."""
        return fn(self.value)


@dataclass(frozen=True, slots=True)
class Err[E]:
    """Failed outcome of a fallible operation holding ``error``."""

    error: E

    def is_ok(self) -> Literal[False]:
        """Return ``False`` because this variant represents failure."""
        return False

    def is_err(self) -> Literal[True]:
        """Return ``True`` because this variant represents failure."""
        return True

    def unwrap(self) -> NoReturn:
        """Raise ``ValueError`` because no success value is present."""
        raise ValueError(f"Called unwrap() on Err: {self.error}")

    def unwrap_or[U](self, default: U) -> U:
        """Return ``default`` because this variant represents failure."""
        return default

    def map(self, fn: Callable[[Any], Any]) -> Err[E]:
        """Short-circuit mapping and preserve the existing error."""
        return self

    def flat_map(self, fn: Callable[[Any], Any]) -> Err[E]:
        """Short-circuit chaining and preserve the existing error."""
        return self


type Result[TVal, TErr] = Ok[TVal] | Err[TErr]
type DataAccessResult[TVal] = Result[TVal, DataAccessError]


def ok[T](value: T) -> Ok[T]:
    """Construct a successful ``Ok`` result."""
    return Ok(value)


def err[E](error: E) -> Err[E]:
    """Construct a failed ``Err`` result."""
    return Err(error)


def is_ok[T, E](result: Result[T, E]) -> TypeGuard[Ok[T]]:
    """Return ``True`` if ``result`` is an ``Ok`` variant, narrowing its static type."""
    return isinstance(result, Ok)


def is_err[T, E](result: Result[T, E]) -> TypeGuard[Err[E]]:
    """Return ``True`` if ``result`` is an ``Err`` variant, narrowing its static type."""
    return isinstance(result, Err)


class SortDirection(StrEnum):
    """Ordering direction for repository query sort specifications."""

    ASC = "asc"
    DESC = "desc"


class SortSpec(BaseModel):
    """Single field sort directive for repository queries."""

    model_config = ConfigDict(frozen=True)

    field: str = Field(..., min_length=1, description="Entity field path to sort by.")
    direction: SortDirection = Field(
        default=SortDirection.ASC,
        description="Sort direction ('asc' or 'desc').",
    )


class FilterOperator(StrEnum):
    """Portable filter comparison operators aligned with ``proto-contracts``."""

    EQ = "eq"
    NEQ = "neq"
    IN = "in"
    GT = "gt"
    GTE = "gte"
    LT = "lt"
    LTE = "lte"
    CONTAINS = "contains"


class FilterSpec(BaseModel):
    """Single predicate filter directive for repository queries."""

    model_config = ConfigDict(frozen=True)

    field: str = Field(..., min_length=1, description="Entity field path to filter on.")
    operator: FilterOperator = Field(..., description="Comparison operator.")
    value: Any = Field(..., description="Comparison operand (or collection for 'in').")


class QuerySpec(BaseModel):
    """Portable query specification combining filters, sorts, and pagination."""

    model_config = ConfigDict(frozen=True)

    filters: list[FilterSpec] = Field(
        default_factory=list[FilterSpec],
        description="Predicates combined with logical AND.",
    )
    sorts: list[SortSpec] = Field(
        default_factory=list[SortSpec],
        description="Ordered list of sort specifications.",
    )
    limit: int = Field(
        default=50,
        ge=1,
        le=1000,
        description="Maximum number of records to return per page.",
    )
    offset: int = Field(
        default=0,
        ge=0,
        description="Zero-based offset for offset pagination.",
    )
    cursor: str | None = Field(
        default=None,
        description="Opaque cursor token for keyset/cursor pagination.",
    )


class PaginatedResult[TItem](BaseModel):
    """Immutable paginated collection returned by list and search operations."""

    model_config = ConfigDict(frozen=True)

    items: list[TItem] = Field(
        default_factory=lambda: cast(list[TItem], []),
        description="Page items matching the query.",
    )
    total: int = Field(
        default=0,
        ge=0,
        description="Total number of matching items across all pages (when known).",
    )
    limit: int = Field(
        default=50,
        ge=0,
        description="Requested page size.",
    )
    offset: int = Field(
        default=0,
        ge=0,
        description="Offset of the returned page.",
    )
    has_more: bool = Field(
        default=False,
        description="Whether additional items exist beyond this page.",
    )
    next_cursor: str | None = Field(
        default=None,
        description="Opaque cursor for fetching the subsequent page.",
    )
