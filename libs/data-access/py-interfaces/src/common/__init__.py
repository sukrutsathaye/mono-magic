"""Common Result, error, query, and pagination contracts."""

from .query_interface import (
    DataAccessError,
    DataAccessResult,
    Err,
    ErrorCode,
    FilterOperator,
    FilterSpec,
    Ok,
    PaginatedResult,
    QuerySpec,
    Result,
    SortDirection,
    SortSpec,
    err,
    is_err,
    is_ok,
    ok,
)

__all__ = [
    "DataAccessError",
    "DataAccessResult",
    "Err",
    "ErrorCode",
    "FilterOperator",
    "FilterSpec",
    "Ok",
    "PaginatedResult",
    "QuerySpec",
    "Result",
    "SortDirection",
    "SortSpec",
    "err",
    "is_err",
    "is_ok",
    "ok",
]
