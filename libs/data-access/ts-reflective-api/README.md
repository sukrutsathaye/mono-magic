# `@mono-magic/data-access-ts-reflective-api` (`data-access-ts-reflective-api`)

Typed TypeScript REST + Server-Sent Events (SSE) client adapter implementing `IReflectiveLearningService` from `@mono-magic/data-access-ts-interfaces`.

## Features

- **Contract-First Compliance**: Implements `IReflectiveLearningService` (`BaseReflectiveLearningService`) and passes `runReflectiveLearningServiceContractTests`.
- **Resilient Transport**: Integrates `Result<T, DataAccessError>` and `retryWithBackoff` from `@mono-magic/utils-ts-core` for automatic exponential backoff on transient failures (`RATE_LIMITED`, `TIMEOUT`, `UNAVAILABLE`).
- **Injectable HTTP & SSE Transports**: Accepts custom `fetchFn` and `eventSourceFactory` implementations alongside `createInMemoryReflectiveTransport()` for deterministic offline unit and integration testing.

## Nx Targets

```bash
pnpm nx lint data-access-ts-reflective-api
pnpm nx typecheck data-access-ts-reflective-api
pnpm nx test data-access-ts-reflective-api
```

---

<!-- COVERAGE_TABLE_START -->
## Test & Coverage Summary

> Auto-synced by `node tools/ci/sync-readmes-and-coverage.mjs`. Updated whenever new functions or unit tests are written.

| Project | Runner | Lines | Statements | Functions | Branches | Threshold | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `data-access-ts-reflective-api` | Vitest V8 (`@vitest/coverage-v8`) | **94.8%** | **93.7%** | **95.7%** | **83.2%** | `>= 80%` | Passing |
<!-- COVERAGE_TABLE_END -->
