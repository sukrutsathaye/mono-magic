# `@mono-magic/data-access-ts-firebase`

Concrete TypeScript Firebase data-access adapters implementing `@mono-magic/data-access-ts-interfaces` (`IAuthProvider`, `IDataRepository<T, ID>`, `IStorageProvider`, `IRealtimeProvider`).

## Architecture & SOLID Compliance

- **Tags**: `scope:data-access`, `type:data-access`, `lang:ts`
- **Liskov Substitution Principle (LSP)**: Passes `runDataRepositoryContractTests`, `runAuthProviderContractTests`, and `runStorageProviderContractTests` from `@mono-magic/data-access-ts-interfaces/testing`.
- **Dependency Inversion Principle (DIP)**: Accepts any `FirebaseServicesLike` bundle (`auth`, `firestore`, `storage`, `realtime`) via constructor injection (Firebase Web/Admin SDK adapters or `createInMemoryFirebaseServices()`).
- **Explicit Error Normalization**: Maps `auth/*`, `firestore/*`, and `storage/*` error codes to canonical `Result<T, DataAccessError>` envelopes via `normalizeFirebaseError`.
- **Query Translation**: Maps vendor-agnostic `QuerySpec<T>` (`eq`, `neq`, `in`, `gt`, `gte`, `lt`, `lte`, `contains`, `sort`, `limit`, `offset`, `cursor`) to Firestore query constraints via `buildFirestoreQueryPlan` and `applyQueryPlanToFirestore`.

## Nx Targets

```bash
pnpm nx lint data-access-ts-firebase
pnpm nx typecheck data-access-ts-firebase
pnpm nx test data-access-ts-firebase
pnpm nx emulator-up data-access-ts-firebase
pnpm nx test-integration data-access-ts-firebase
pnpm nx emulator-down data-access-ts-firebase
```

---

<!-- COVERAGE_TABLE_START -->
## Test & Coverage Summary

> Auto-synced by `node tools/ci/sync-readmes-and-coverage.mjs`. Updated whenever new functions or unit tests are written.

| Project | Runner | Lines | Statements | Functions | Branches | Threshold | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `data-access-ts-firebase` | Vitest V8 + Contract Compliance Suite | **91.8%** | **91.6%** | **98.9%** | **81.9%** | `>= 80%` | Passing |
<!-- COVERAGE_TABLE_END -->
