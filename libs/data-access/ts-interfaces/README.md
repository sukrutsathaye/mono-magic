# `@mono-magic/data-access-ts-interfaces`

Framework- and vendor-agnostic TypeScript data-access contracts, abstract base classes, and Liskov Substitution compliance test suites.

- **Nx project**: `data-access-ts-interfaces`
- **Tags**: `scope:data-access`, `type:interfaces`, `lang:ts`
- **Coverage minimum**: `>= 80%` across lines, statements, functions, and branches.

## Contracts

- `common/query.interface.ts`: `DataAccessError`, `createDataAccessError`, `QuerySpec<T>`, `FilterSpec<T>`, `SortSpec<T>`, `PaginatedResult<T>`
- `auth/auth.interface.ts`: `IAuthProvider`, `BaseAuthProvider`, `AuthSession`, `UserClaims`, `OAuthProvider`
- `repository/repository.interface.ts`: `IDataRepository<TEntity, TId>`, `BaseDataRepository<TEntity, TId>`
- `storage/storage.interface.ts`: `IStorageProvider`, `BaseStorageProvider`, `StorageObjectMeta`, `SignedUrlResponse`
- `realtime/realtime.interface.ts`: `IRealtimeProvider`, `BaseRealtimeProvider`, `RealtimeEnvelope<T>`, `PresenceState`
- `payments/payment.interface.ts`: `IPaymentProvider`, `BasePaymentProvider`, `PaymentIntent`, `Money`, `PaymentStatus`
- `@mono-magic/data-access-ts-interfaces/testing`: `runDataRepositoryContractTests`, `runAuthProviderContractTests`, `runStorageProviderContractTests`

## Nx Targets

```bash
pnpm nx lint data-access-ts-interfaces
pnpm nx typecheck data-access-ts-interfaces
pnpm nx test data-access-ts-interfaces -- --coverage
```

---

<!-- COVERAGE_TABLE_START -->
## Test & Coverage Summary

> Auto-synced by `node tools/ci/sync-readmes-and-coverage.mjs`. Updated whenever new functions or unit tests are written.

| Project | Runner | Lines | Statements | Functions | Branches | Threshold | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `data-access-ts-interfaces` | Vitest V8 (`@vitest/coverage-v8`) | **100.0%** | **100.0%** | **100.0%** | **83.3%** | `>= 80%` | Passing |
<!-- COVERAGE_TABLE_END -->
