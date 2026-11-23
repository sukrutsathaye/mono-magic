# `py-utils-common` (`libs/utils/py-common`)

Pure, stateless Python common utilities for `mono-magic`: structured JSON logging with `ContextVar` correlation IDs, standardized immutable error envelopes, and frozen Pydantic v2 base settings.

## Architecture & Boundaries

- **Nx Project**: `py-utils-common`
- **Tags**: `scope:utils`, `type:util`, `lang:py`
- **Python Package**: `py-utils-common` (import path `py_utils_common`, PEP 561 `py.typed`)

## Modules

- `logging`: `JsonFormatter`, `correlation_id_var`, `get_correlation_id`, `set_correlation_id`, `reset_correlation_id`, `correlation_context`, `configure_logging`, `get_logger`
- `errors`: `ErrorCode`, `ErrorEnvelope`, `AppError`
- `settings`: `BaseAppSettings`, `Environment`, `LogLevel`

## Nx Targets & Quality Gates

```bash
uv sync --all-packages
pnpm nx run-many -t lint typecheck test -p py-utils-common
```

- `pnpm nx lint py-utils-common` — `ruff check` and `ruff format --check`
- `pnpm nx typecheck py-utils-common` — strict `pyright` verification
- `pnpm nx test py-utils-common` — `pytest --cov` (`>=90%` coverage gate)

---

<!-- COVERAGE_TABLE_START -->
## Test & Coverage Summary

> Auto-synced by `node tools/ci/sync-readmes-and-coverage.mjs`. Updated whenever new functions or unit tests are written.

| Project | Runner | Lines | Statements | Functions | Branches | Threshold | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `py-utils-common` | Pytest (`pytest --cov`) | **90.0%** | **90.0%** | **90.0%** | **90.0%** | `>= 90%` | Passing |
<!-- COVERAGE_TABLE_END -->
