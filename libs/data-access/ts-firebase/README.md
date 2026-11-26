# `@mono-magic/data-access-ts-firebase`

> Concrete TypeScript Firebase data-access adapters implementing `@mono-magic/data-access-ts-interfaces` (`IAuthProvider`, `IDataRepository<T, ID>`, `IStorageProvider`, `IRealtimeProvider`).

- **Nx Project**: `data-access-ts-firebase`
- **Tags**: `scope:data-access`, `type:data-access`, `lang:ts`

---

## Official Documentation & References

| Topic / Technology | Reference | Why It Is Used Here |
| :--- | :--- | :--- |
| **Firebase Docs** | [Firebase Documentation](https://firebase.google.com/docs) | Core BaaS platform (Authentication, Cloud Firestore, Cloud Storage, Realtime Database). |
| **Firebase JS SDK (Modular v10+)** | [Firebase Web SDK Guide](https://firebase.google.com/docs/web/setup) | Underlying SDK wrapped behind `FirebaseServicesLike` (DIP). |
| **Firebase Local Emulator Suite** | [Emulator Suite Docs](https://firebase.google.com/docs/emulator-suite) | Local offline Auth, Firestore, Storage, and RTDB emulators for integration testing without cloud billing. |
| **Cloud Firestore Queries** | [Firestore Querying Guide](https://firebase.google.com/docs/firestore/query-data/queries) | Target constraint model translated from `QuerySpec<T>` via `buildFirestoreQueryPlan`. |

---

## Local Setup & Emulator Runbook

> **Prerequisites**: Java 21+ (required by Firebase Emulator Suite) and `firebase-tools` (`npx firebase-tools`).

```bash
# 1. Start local Firebase Emulators (Auth, Firestore, Storage, RTDB)
pnpm nx emulator-up data-access-ts-firebase

# 2. Point local clients to emulator hosts
export FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
export FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
export FIREBASE_STORAGE_EMULATOR_HOST="127.0.0.1:9199"

# 3. Run integration tests against the local Emulator Suite
pnpm nx test-integration data-access-ts-firebase

# 4. Stop local emulators
pnpm nx emulator-down data-access-ts-firebase
```

- **Default Local Ports**: Emulator UI `4000`, Firestore `8080`, Auth `9099`, Storage `9199`, RTDB `9000`.

---

## Architecture & SOLID Compliance

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
