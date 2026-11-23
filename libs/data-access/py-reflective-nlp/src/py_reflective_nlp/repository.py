"""Async SQLite repository implementing DataRepository[TEntity, TId] contract."""

from __future__ import annotations

import asyncio
import sqlite3
from collections.abc import Awaitable, Callable, Mapping
from typing import Any

from py_data_access_interfaces import (
    BaseDataRepository,
    DataAccessError,
    DataRepository,
    ErrorCode,
    FilterOperator,
    FilterSpec,
    PaginatedResult,
    QuerySpec,
    Result,
    SortDirection,
    err,
    is_ok,
    ok,
)
from pydantic import BaseModel


def _matches_filter(entity: BaseModel, spec: FilterSpec) -> bool:
    data = entity.model_dump(mode="python")
    if spec.field not in data:
        return False
    val = data[spec.field]
    target = spec.value

    if spec.operator == FilterOperator.EQ:
        return bool(val == target)
    if spec.operator == FilterOperator.NEQ:
        return bool(val != target)
    if spec.operator == FilterOperator.IN:
        return bool(isinstance(target, (list, tuple, set, frozenset)) and val in target)
    if spec.operator == FilterOperator.GT:
        return bool(val is not None and val > target)
    if spec.operator == FilterOperator.GTE:
        return bool(val is not None and val >= target)
    if spec.operator == FilterOperator.LT:
        return bool(val is not None and val < target)
    if spec.operator == FilterOperator.LTE:
        return bool(val is not None and val <= target)
    if spec.operator == FilterOperator.CONTAINS:
        if isinstance(val, str) and isinstance(target, str):
            return target.lower() in val.lower()
        if isinstance(val, (list, tuple, set, frozenset)):
            return target in val
    return False


class SqliteReflectiveRepository[TEntity: BaseModel, TId](BaseDataRepository[TEntity, TId]):
    """Async SQLite repository backed by ``sqlite3`` + ``asyncio.to_thread``.

    Stores validated Pydantic v2 entities as JSON documents indexed by primary key,
    supports nested savepoint transactions with commit/rollback semantics, and passes
    ``assert_repository_contract`` from ``py-data-access-interfaces``.
    """

    def __init__(
        self,
        model_cls: type[TEntity],
        *,
        database: str = ":memory:",
        table_name: str = "reflective_entities",
        id_field: str = "id",
        id_serializer: Callable[[TId], str] = str,
        _shared_conn: sqlite3.Connection | None = None,
        _shared_lock: asyncio.Lock | None = None,
        _in_transaction: bool = False,
    ) -> None:
        """Initialize the SQLite repository for ``model_cls``."""
        if not table_name.replace("_", "").isalnum():
            raise ValueError(f"Invalid SQLite table_name: {table_name!r}")
        self._model_cls = model_cls
        self._table_name = table_name
        self._id_field = id_field
        self._id_serializer = id_serializer
        self._in_transaction = _in_transaction
        self._lock = _shared_lock or asyncio.Lock()
        self._tx_depth = 0

        if _shared_conn is not None:
            self._conn = _shared_conn
        else:
            self._conn = sqlite3.connect(
                database,
                check_same_thread=False,
                isolation_level=None,
            )
            self._conn.execute(
                f"CREATE TABLE IF NOT EXISTS {self._table_name} ("
                "id TEXT PRIMARY KEY, "
                "payload TEXT NOT NULL"
                ")"
            )

    def _extract_id(self, entity: TEntity) -> str:
        raw_id = getattr(entity, self._id_field)
        return self._id_serializer(raw_id)

    def _find_by_id_sync(self, key: str) -> TEntity | None:
        cursor = self._conn.execute(
            f"SELECT payload FROM {self._table_name} WHERE id = ?",
            (key,),
        )
        row = cursor.fetchone()
        if row is None:
            return None
        return self._model_cls.model_validate_json(row[0])

    async def find_by_id(self, entity_id: TId) -> Result[TEntity | None, DataAccessError]:
        """Return ``Ok(entity)`` if found, ``Ok(None)`` if absent, or ``Err`` on failure."""
        key = self._id_serializer(entity_id)
        try:
            if self._in_transaction:
                entity = await asyncio.to_thread(self._find_by_id_sync, key)
            else:
                async with self._lock:
                    entity = await asyncio.to_thread(self._find_by_id_sync, key)
            return ok(entity)
        except Exception as exc:
            return err(
                DataAccessError(
                    code=ErrorCode.INTERNAL,
                    message=f"SQLite find_by_id failed: {exc}",
                    provider="sqlite",
                    cause=str(exc),
                )
            )

    def _load_all_sync(self) -> list[TEntity]:
        cursor = self._conn.execute(f"SELECT payload FROM {self._table_name} ORDER BY rowid ASC")
        return [self._model_cls.model_validate_json(row[0]) for row in cursor.fetchall()]

    async def find_many(
        self,
        query: QuerySpec | None = None,
    ) -> Result[PaginatedResult[TEntity], DataAccessError]:
        """Execute a filtered, sorted, paginated query against stored entities."""
        spec = query or QuerySpec()
        try:
            if self._in_transaction:
                items = await asyncio.to_thread(self._load_all_sync)
            else:
                async with self._lock:
                    items = await asyncio.to_thread(self._load_all_sync)

            for f_spec in spec.filters:
                items = [item for item in items if _matches_filter(item, f_spec)]

            for s_spec in reversed(spec.sorts):
                reverse = s_spec.direction == SortDirection.DESC
                items.sort(
                    key=lambda ent, field=s_spec.field: (
                        getattr(ent, field, None) is None,
                        getattr(ent, field, ""),
                    ),
                    reverse=reverse,
                )

            total = len(items)
            sliced = items[spec.offset : spec.offset + spec.limit]
            has_more = (spec.offset + len(sliced)) < total
            next_cursor = str(spec.offset + len(sliced)) if has_more else None

            return ok(
                PaginatedResult[TEntity](
                    items=sliced,
                    total=total,
                    limit=spec.limit,
                    offset=spec.offset,
                    has_more=has_more,
                    next_cursor=next_cursor,
                )
            )
        except Exception as exc:
            return err(
                DataAccessError(
                    code=ErrorCode.INTERNAL,
                    message=f"SQLite find_many failed: {exc}",
                    provider="sqlite",
                    cause=str(exc),
                )
            )

    def _create_sync(self, key: str, payload: str) -> None:
        self._conn.execute(
            f"INSERT INTO {self._table_name} (id, payload) VALUES (?, ?)",
            (key, payload),
        )

    async def create(self, entity: TEntity) -> Result[TEntity, DataAccessError]:
        """Persist a new entity, returning ``Err(CONFLICT)`` if its identifier exists."""
        key = self._extract_id(entity)
        payload = entity.model_dump_json()
        try:
            if self._in_transaction:
                await asyncio.to_thread(self._create_sync, key, payload)
            else:
                async with self._lock:
                    await asyncio.to_thread(self._create_sync, key, payload)
            return ok(entity)
        except sqlite3.IntegrityError as exc:
            return err(
                DataAccessError(
                    code=ErrorCode.CONFLICT,
                    message=f"Entity with id {key!r} already exists.",
                    provider="sqlite",
                    cause=str(exc),
                )
            )
        except Exception as exc:
            return err(
                DataAccessError(
                    code=ErrorCode.INTERNAL,
                    message=f"SQLite create failed: {exc}",
                    provider="sqlite",
                    cause=str(exc),
                )
            )

    def _update_sync(self, key: str, patch: Mapping[str, Any]) -> TEntity | None:
        existing = self._find_by_id_sync(key)
        if existing is None:
            return None
        merged = existing.model_dump(mode="python")
        merged.update(patch)
        merged[self._id_field] = getattr(existing, self._id_field)
        updated = self._model_cls.model_validate(merged)
        self._conn.execute(
            f"UPDATE {self._table_name} SET payload = ? WHERE id = ?",
            (updated.model_dump_json(), key),
        )
        return updated

    async def update(
        self,
        entity_id: TId,
        patch: Mapping[str, Any],
    ) -> Result[TEntity, DataAccessError]:
        """Apply partial field updates to an existing entity, or ``Err(NOT_FOUND)``."""
        key = self._id_serializer(entity_id)
        try:
            if self._in_transaction:
                updated = await asyncio.to_thread(self._update_sync, key, patch)
            else:
                async with self._lock:
                    updated = await asyncio.to_thread(self._update_sync, key, patch)
            if updated is None:
                return err(
                    DataAccessError(
                        code=ErrorCode.NOT_FOUND,
                        message=f"Entity {key!r} not found for update.",
                        provider="sqlite",
                    )
                )
            return ok(updated)
        except Exception as exc:
            return err(
                DataAccessError(
                    code=ErrorCode.VALIDATION,
                    message=f"SQLite update failed: {exc}",
                    provider="sqlite",
                    cause=str(exc),
                )
            )

    def _delete_sync(self, key: str) -> bool:
        cursor = self._conn.execute(
            f"DELETE FROM {self._table_name} WHERE id = ?",
            (key,),
        )
        return cursor.rowcount > 0

    async def delete(self, entity_id: TId) -> Result[None, DataAccessError]:
        """Delete an existing entity by ID, returning ``Err(NOT_FOUND)`` if missing."""
        key = self._id_serializer(entity_id)
        try:
            if self._in_transaction:
                deleted = await asyncio.to_thread(self._delete_sync, key)
            else:
                async with self._lock:
                    deleted = await asyncio.to_thread(self._delete_sync, key)
            if not deleted:
                return err(
                    DataAccessError(
                        code=ErrorCode.NOT_FOUND,
                        message=f"Entity {key!r} not found for delete.",
                        provider="sqlite",
                    )
                )
            return ok(None)
        except Exception as exc:
            return err(
                DataAccessError(
                    code=ErrorCode.INTERNAL,
                    message=f"SQLite delete failed: {exc}",
                    provider="sqlite",
                    cause=str(exc),
                )
            )

    async def transaction[TOut](
        self,
        fn: Callable[[DataRepository[TEntity, TId]], Awaitable[Result[TOut, DataAccessError]]],
    ) -> Result[TOut, DataAccessError]:
        """Execute ``fn`` atomically using SQLite ``SAVEPOINT``, rolling back on ``Err``."""
        async with self._lock:
            self._tx_depth += 1
            savepoint = f"sp_reflective_{self._tx_depth}"
            await asyncio.to_thread(self._conn.execute, f"SAVEPOINT {savepoint}")
            tx_repo = SqliteReflectiveRepository[TEntity, TId](
                self._model_cls,
                table_name=self._table_name,
                id_field=self._id_field,
                id_serializer=self._id_serializer,
                _shared_conn=self._conn,
                _shared_lock=self._lock,
                _in_transaction=True,
            )
            try:
                result = await fn(tx_repo)
                if is_ok(result):
                    await asyncio.to_thread(
                        self._conn.execute,
                        f"RELEASE SAVEPOINT {savepoint}",
                    )
                else:
                    await asyncio.to_thread(
                        self._conn.execute,
                        f"ROLLBACK TO SAVEPOINT {savepoint}",
                    )
                    await asyncio.to_thread(
                        self._conn.execute,
                        f"RELEASE SAVEPOINT {savepoint}",
                    )
                return result
            except Exception as exc:
                await asyncio.to_thread(
                    self._conn.execute,
                    f"ROLLBACK TO SAVEPOINT {savepoint}",
                )
                await asyncio.to_thread(
                    self._conn.execute,
                    f"RELEASE SAVEPOINT {savepoint}",
                )
                return err(
                    DataAccessError(
                        code=ErrorCode.INTERNAL,
                        message=f"SQLite transaction rolled back on exception: {exc}",
                        provider="sqlite",
                        cause=str(exc),
                    )
                )
            finally:
                self._tx_depth -= 1

    async def close(self) -> None:
        """Close the underlying SQLite connection."""
        async with self._lock:
            await asyncio.to_thread(self._conn.close)
