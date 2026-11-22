---
name: data-access-provider
description: >-
  Designs and scaffolds contract-first data-access libraries under libs/data-access/*,
  starting from Protobuf wire schemas in libs/data-access/proto-contracts (buf) and
  idiomatic provider interfaces in libs/data-access/ts-interfaces and
  libs/data-access/py-interfaces, then implementing concrete providers for Firebase,
  Supabase, NestJS, Spring Boot (Java/Kotlin + Keycloak + PostgreSQL), AWS, GCP, Azure,
  or domain services. Use whenever creating or extending data-access modules or backend wrappers.
---

# Contract-First Data-Access Provider Workflow

Use this skill when designing, scaffolding, or implementing any `libs/data-access/*` library. Follow [engineering-standards](../engineering-standards/SKILL.md) alongside this runbook.

## 1. Architectural Rules (Hybrid `buf` + Idiomatic Language Traits)

1. **Wire Contracts First (`libs/data-access/proto-contracts`)**:
   - Canonical DTOs, error codes (`ErrorCode`, `DataAccessError`), pagination/filter specs (`QuerySpec`, `PageInfo`), and service messages live in `libs/data-access/proto-contracts` (`proto-contracts`, tags: `scope:data-access`, `type:interfaces`, `lang:proto`) validated by `@bufbuild/buf`.
2. **Idiomatic Language Interfaces & Compliance Suites**:
   - **TypeScript**: `libs/data-access/ts-interfaces` (`@mono-magic/data-access-ts-interfaces`, tags: `scope:data-access`, `type:interfaces`, `lang:ts`) exports ISP-aligned capability interfaces (`IAuthProvider`, `IDataRepository<T, ID>`, `IStorageProvider`, `IRealtimeProvider`, `IPaymentProvider`), abstract base classes, and reusable compliance test suites (`@mono-magic/data-access-ts-interfaces/testing`).
   - **Python**: `libs/data-access/py-interfaces` (`py-data-access-interfaces`, tags: `scope:data-access`, `type:interfaces`, `lang:py`) exports Pydantic v2 DTOs, `typing.Protocol` / `abc.ABC` interfaces, and `pytest` contract assertions (`assert_repository_contract`, `assert_auth_contract`).
   - **Future Languages**: `libs/data-access/dart-interfaces` and `libs/data-access/java-interfaces`.
   - Application and feature code (`apps/*`, `libs/features/*`) MUST depend on `type:interfaces` contracts—never directly on vendor SDK models.
3. **Domain Boundaries & Naming (`libs/<domain>/<lang>-<name>`)**:
   - Keep `proto-contracts` and `<lang>-interfaces` inside `libs/data-access/` (mirroring `libs/ui/atomic-design-interfaces` inside `libs/ui/`).
   - Pure error primitives (`Result<T, E>`, `AppError`, `ErrorCode`), retry/backoff, and event helpers belong in `libs/utils/ts-core` (`@mono-magic/utils-ts-core`) for TypeScript and `libs/utils/py-common` for Python.
4. **Mandatory Shared Contract Compliance Suite (LSP Gate)**:
   - Every concrete provider (`ts-firebase`, `ts-supabase`, `ts-nestjs-*`, `java-spring-boot-*`, `ts-aws`, `ts-gcp`, `ts-azure`, `py-reflective-nlp`, `ts-reflective-api`) must execute and pass the shared contract compliance suite exported by `ts-interfaces` or `py-interfaces` with `>=80%` unit test coverage.

---

## 2. Core Contracts in `libs/data-access/{ts-interfaces,py-interfaces}`

When extending `libs/data-access/ts-interfaces/src/lib/` (and mirrored in `libs/data-access/py-interfaces`):
- **`common/query.interface.ts`**:
  - `QuerySpec<T>`, `FilterSpec<T>` (`eq`, `neq`, `in`, `gt`, `gte`, `lt`, `lte`, `contains`), `SortSpec<T>`, `PaginatedResult<T>`, and `DataAccessError`.
- **`auth/auth.interface.ts`**:
  - `IAuthProvider` & `BaseAuthProvider`: `signInWithEmail`, `signUpWithEmail`, `signInWithOAuth`, `signOut`, `getCurrentSession`, `refreshToken`, `verifyToken`, `onAuthStateChanged`.
- **`repository/repository.interface.ts`**:
  - `IDataRepository<TEntity, TId>` & `BaseDataRepository<TEntity, TId>`: `findById`, `findMany(QuerySpec)`, `create`, `update`, `delete`, `transaction`.
- **`storage/storage.interface.ts`**:
  - `IStorageProvider` & `BaseStorageProvider`: `upload`, `download`, `getSignedUrl`, `delete`, `list`.
- **`realtime/realtime.interface.ts`**:
  - `IRealtimeProvider` & `BaseRealtimeProvider`: `publish`, `subscribe`, `presence`.
- **`payments/payment.interface.ts`**:
  - `IPaymentProvider` & `BasePaymentProvider`: `createPaymentIntent`, `confirmPaymentIntent`, `getPaymentIntent`, `refundPayment`.

---

## 3. Concrete Provider Implementation Blueprint

### Step 1 — Scaffold the Library via Nx
Invoke the `nx-generate` skill first to scaffold the library under `libs/data-access/<lang>-<provider>` with tags `scope:data-access,type:data-access,lang:<lang>,provider:<provider>`, then link workspace dependencies using `link-workspace-packages` (or `[tool.uv.sources]` for Python).

### Step 2 — Implement the Adapter Pattern
Map vendor SDK responses and errors into standard `Result<T, DataAccessError>` envelopes:
- **Firebase (`libs/data-access/ts-firebase`)**: Wraps Firebase Auth, Cloud Firestore, Cloud Storage, and Firestore snapshots.
- **Supabase (`libs/data-access/ts-supabase`)**: Wraps Supabase Auth, PostgREST (`supabase-js`), Supabase Storage, and Realtime channels.
- **NestJS (`libs/data-access/ts-nestjs-*`)**: Wraps `ConfigurableModuleBuilder` dynamic modules, Guards/Strategies, Prisma/TypeORM repositories, and WebSocket gateways.
- **Spring Boot (`libs/data-access/java-spring-boot-*`)**: Java/Kotlin Spring Boot starter wrapping **Keycloak** (OAuth2/OIDC), **PostgreSQL** (Spring Data JPA + Flyway), **S3/MinIO**, and **WebSocket/Redis** with identical Protobuf/REST/gRPC contracts.
- **Cloud SDKs (`libs/data-access/{ts-aws,ts-gcp,ts-azure}`)**: Wraps Cognito/DynamoDB/S3, GCP Identity/Firestore/GCS, or Azure Entra/CosmosDB/Blob Storage.
- **Domain Backend/Client Wrappers (`libs/data-access/py-reflective-nlp`, `libs/data-access/ts-reflective-api`, `libs/data-access/ts-livekit`)**: Domain protocols and REST/SSE/WebRTC client adapters.

### Step 3 — Run Contract Compliance, Lint & Typecheck Gates
```bash
# Lint Protobuf contracts
pnpm nx lint proto-contracts

# TypeScript contracts & concrete provider
pnpm nx run-many -t lint typecheck test -p data-access-ts-interfaces,data-access-<lang>-<provider> -- --coverage

# Python contracts & concrete provider
pnpm nx run-many -t lint typecheck test -p py-data-access-interfaces
```
