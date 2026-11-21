---
name: data-access-provider
description: >-
  Designs and scaffolds contract-first data-access libraries under libs/data-access/*,
  starting from vendor-agnostic interfaces and abstract base classes in
  libs/data-access/data-access-interfaces and implementing concrete providers for Firebase,
  Supabase, NestJS, Spring Boot (Java/Kotlin + Keycloak + PostgreSQL), AWS, GCP, or Azure.
  Use whenever creating or extending data-access modules or backend wrappers.
---

# Contract-First Data-Access Provider Workflow

Use this skill when designing, scaffolding, or implementing any `libs/data-access/*` library.

## 1. Architectural Rules

1. **Contract-First Dependency Inversion**:
   - Every capability (`Auth`, `Repository/CRUD`, `Storage`, `Realtime`, `Payments`) MUST be defined first as a vendor-agnostic interface and abstract base class inside `libs/data-access/data-access-interfaces` (`@mono-magic/data-access-interfaces`, tags: `scope:data-access`, `type:interfaces`).
   - Application and feature code (`apps/*`, `libs/features/*`) must depend on `@mono-magic/data-access-interfaces` tokens/contracts—never directly on vendor SDK models.
2. **Domain Boundaries**:
   - Keep `data-access-interfaces` inside `libs/data-access/data-access-interfaces` (mirroring `libs/ui/atomic-design-interfaces` inside `libs/ui/`).
   - Pure error primitives (`Result<T, E>`, `AppError`), retry/backoff, and serialization helpers belong in `libs/utils/core` (`@mono-magic/utils-core`).
3. **Shared Contract Compliance Suite**:
   - Every concrete provider (`firebase`, `supabase`, `nestjs-*`, `spring-boot-*`, `aws`, `gcp`, `azure`) must execute and pass the shared contract test suite exported by `data-access-interfaces`.

---

## 2. Core Contracts in `libs/data-access/data-access-interfaces`

When creating or extending `libs/data-access/data-access-interfaces/src/lib/`:
- **`auth.interface.ts`**:
  - `IAuthProvider` & `BaseAuthProvider`: `signInWithEmail`, `signUpWithEmail`, `signInWithOAuth`, `signOut`, `getCurrentSession`, `refreshToken`, `verifyToken`, `onAuthStateChanged`.
- **`repository.interface.ts`**:
  - `IDataRepository<TEntity, TId>` & `BaseDataRepository<TEntity, TId>`: `findById`, `findMany(QuerySpec)`, `create`, `update`, `delete`, `transaction`.
  - Portable `QuerySpec<T>` supporting filters (`eq`, `in`, `gt`, `lt`, `contains`), sorting, and cursor/offset pagination (`PaginatedResult<T>`).
- **`storage.interface.ts`**:
  - `IStorageProvider` & `BaseStorageProvider`: `upload`, `download`, `getSignedUrl`, `delete`, `list`.
- **`realtime.interface.ts`**:
  - `IRealtimeProvider` & `BaseRealtimeProvider`: `publish`, `subscribe`, `presence`.

---

## 3. Concrete Provider Implementation Blueprint

### Step 1 — Scaffold the Library via Nx
Invoke the `nx-generate` skill first to scaffold the library under `libs/data-access/<provider>` with tags `scope:data-access,type:data-access,provider:<provider>`, then link workspace dependencies using `link-workspace-packages`.

### Step 2 — Implement the Adapter Pattern
Map vendor SDK responses and errors into standard `Result<T, DataAccessError>` envelopes:
- **Firebase (`libs/data-access/firebase`)**: Wraps Firebase Auth, Cloud Firestore, Cloud Storage, and Firestore snapshots.
- **Supabase (`libs/data-access/supabase`)**: Wraps Supabase Auth, PostgREST (`supabase-js`), Supabase Storage, and Realtime channels.
- **NestJS (`libs/data-access/nestjs-*`)**: Wraps `ConfigurableModuleBuilder` dynamic modules, Guards/Strategies, Prisma/TypeORM repositories, and WebSocket gateways.
- **Spring Boot (`libs/data-access/spring-boot-*`)**: Java/Kotlin Spring Boot starter wrapping **Keycloak** (OAuth2/OIDC), **PostgreSQL** (Spring Data JPA + Flyway), **S3/MinIO**, and **WebSocket/Redis** with identical REST/gRPC contracts.
- **Cloud SDKs (`libs/data-access/{aws,gcp,azure}`)**: Wraps Cognito/DynamoDB/S3, GCP Identity/Firestore/GCS, or Azure Entra/CosmosDB/Blob Storage.

### Step 3 — Run Contract Compliance & Unit Tests
```bash
pnpm nx run-many -t lint typecheck test -p data-access-interfaces,data-access-<provider>
```
