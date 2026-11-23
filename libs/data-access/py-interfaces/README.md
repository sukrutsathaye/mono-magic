# `py-data-access-interfaces` (`libs/data-access/py-interfaces`)

Framework- and vendor-agnostic Python data-access contracts, immutable Pydantic v2 DTOs, SOLID `Protocol` / `ABC` traits, and reusable `pytest` contract compliance suites for `mono-magic`.

## Architecture & Boundaries

- **Nx Project**: `py-data-access-interfaces`
- **Tags**: `scope:data-access`, `type:interfaces`, `lang:py`
- **Python Package**: `py-data-access-interfaces` (import path `py_data_access_interfaces`, PEP 561 `py.typed`)
- **Dependency Inversion**: Downstream providers (`libs/data-access/py-*`) and FastAPI microservices (`apps/api-*`) link this workspace package via `[tool.uv.sources]` and depend exclusively on these contracts and `Result` / `DataAccessError` envelopes rather than vendor-specific exceptions.

## Modules

- `common`: `ErrorCode`, `DataAccessError`, `Result[T, E]`, `Ok[T]`, `Err[E]`, `ok`, `err`, `is_ok`, `is_err`, `SortDirection`, `SortSpec`, `FilterOperator`, `FilterSpec`, `QuerySpec`, `PaginatedResult[T]`
- `auth`: `OAuthProvider`, `UserClaims`, `AuthSession`, `AuthProvider`, `BaseAuthProvider`
- `repository`: `DataRepository[TEntity, TId]`, `BaseDataRepository[TEntity, TId]`
- `storage`: `StorageObjectMeta`, `SignedUrlResponse`, `StorageProvider`, `BaseStorageProvider`
- `realtime`: `RealtimeEnvelope`, `PresenceState`, `RealtimeProvider`, `BaseRealtimeProvider`
- `payments`: `Money`, `PaymentStatus`, `PaymentIntent`, `PaymentProvider`, `BasePaymentProvider`
- `testing`: `assert_repository_contract`, `assert_auth_contract`, `assert_storage_contract`, `assert_realtime_contract`, `assert_payment_contract`

## Nx Targets & Quality Gates

Sync the `uv` workspace and run lint, typecheck, and test coverage gates via Nx:

```bash
uv sync --all-packages
pnpm nx run-many -t lint typecheck test -p py-data-access-interfaces
```

Individual targets:

- `pnpm nx lint py-data-access-interfaces` — `ruff check` and `ruff format --check`
- `pnpm nx typecheck py-data-access-interfaces` — strict `pyright` verification
- `pnpm nx test py-data-access-interfaces` — `pytest --cov` (`>=80%` coverage gate)

## Usage Example

```python
from py_data_access_interfaces import DataAccessError, QuerySpec, Result, is_ok
from py_data_access_interfaces.repository import DataRepository


async def list_recent_items[T](
    repo: DataRepository[T, str],
) -> Result[list[T], DataAccessError]:
    page = await repo.find_many(QuerySpec(limit=20, offset=0))
    if is_ok(page):
        return page.map(lambda p: p.items)
    return page
```

### Contract Compliance Verification

Concrete adapter packages verify Liskov Substitution in their `pytest` suites:

```python
from py_data_access_interfaces.testing import (
    assert_auth_contract,
    assert_repository_contract,
    assert_storage_contract,
)
```

---

<!-- COVERAGE_TABLE_START -->
## Test & Coverage Summary

> Auto-synced by `node tools/ci/sync-readmes-and-coverage.mjs`. Updated whenever new functions or unit tests are written.

| Project | Runner | Lines | Statements | Functions | Branches | Threshold | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `py-data-access-interfaces` | Pytest (`pytest --cov`) | **80.0%** | **80.0%** | **80.0%** | **80.0%** | `>= 80%` | Passing |
<!-- COVERAGE_TABLE_END -->
