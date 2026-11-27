"""Vendor-agnostic generic data repository Protocol."""

from __future__ import annotations

from collections.abc import Awaitable, Callable, Mapping
from typing import Any, Protocol, runtime_checkable

from ..common import DataAccessError, PaginatedResult, QuerySpec, Result


@runtime_checkable
class DataRepository[TEntity, TId](Protocol):
    """Structural repository contract for CRUD, querying, and transactional persistence."""

    async def find_by_id(self, entity_id: TId) -> Result[TEntity | None, DataAccessError]:
        """Return ``Ok(entity)`` if found, ``Ok(None)`` if absent, or ``Err`` on failure."""
        ...

    async def find_many(
        self,
        query: QuerySpec | None = None,
    ) -> Result[PaginatedResult[TEntity], DataAccessError]:
        """Execute a filtered, sorted, paginated query against stored entities."""
        ...

    async def create(self, entity: TEntity) -> Result[TEntity, DataAccessError]:
        """Persist a new entity, returning ``Err(CONFLICT)`` if its identifier exists."""
        ...

    async def update(
        self,
        entity_id: TId,
        patch: Mapping[str, Any],
    ) -> Result[TEntity, DataAccessError]:
        """Apply partial field updates to an existing entity, or ``Err(NOT_FOUND)``."""
        ...

    async def delete(self, entity_id: TId) -> Result[None, DataAccessError]:
        """Delete an existing entity by ID, returning ``Err(NOT_FOUND)`` if missing."""
        ...

    async def transaction[TOut](
        self,
        fn: Callable[[DataRepository[TEntity, TId]], Awaitable[Result[TOut, DataAccessError]]],
    ) -> Result[TOut, DataAccessError]:
        """Execute ``fn`` atomically, committing on ``Ok`` and rolling back on ``Err``/exception."""
        ...
