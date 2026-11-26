# `@mono-magic/data-access-ts-supabase`

> Concrete TypeScript Supabase data-access adapters implementing `@mono-magic/data-access-ts-interfaces` (`IAuthProvider`, `IDataRepository<T, ID>`, `IStorageProvider`, `IRealtimeProvider`).

- **Nx Project**: `data-access-ts-supabase`
- **Tags**: `scope:data-access`, `type:data-access`, `lang:ts`

---

## Official Documentation & References

| Topic / Technology | Reference | Why It Is Used Here |
| :--- | :--- | :--- |
| **Supabase Docs** | [Supabase Documentation](https://supabase.com/docs) | Core BaaS platform (Postgres, GoTrue Auth, PostgREST, Storage, Realtime). |
| **Supabase JS SDK** | [`@supabase/supabase-js` Reference](https://supabase.com/docs/reference/javascript/introduction) | Underlying typed client injected via `SupabaseClientLike` (DIP). |
| **Supabase Local CLI & Docker** | [Supabase Local Development](https://supabase.com/docs/guides/local-development) | Runs a complete local Postgres + Auth + Storage + Realtime stack in Docker for integration tests. |
| **PostgreSQL Row-Level Security** | [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) | Enforces tenant- and user-scoped data isolation directly inside Postgres. |
| **PostgREST** | [PostgREST Filter Syntax](https://docs.postgrest.org/en/stable/references/api/tables_views.html) | Target query syntax mapped from vendor-agnostic `QuerySpec<T>` via `applyQuerySpecToPostgrest`. |

---

## Local Setup & Docker Runbook

> **Prerequisites**: Docker Desktop / Docker Engine running locally.

```bash
# 1. Start the local Supabase Docker stack (Postgres, GoTrue, PostgREST, Storage, Studio)
pnpm nx emulator-up data-access-ts-supabase
# Or directly with the Supabase CLI:
# npx supabase start

# 2. Export local credentials into your shell or .env.local (printed by `supabase start`)
export SUPABASE_URL="http://127.0.0.1:54321"
export SUPABASE_ANON_KEY="<local-anon-key>"

# 3. Run integration tests against the local Docker instance
pnpm nx test-integration data-access-ts-supabase

# 4. Stop and clean up local Supabase Docker containers
pnpm nx emulator-down data-access-ts-supabase
```

- **Default Local Ports**: API Gateway `54321`, Postgres `54322`, Supabase Studio `54323`, Inbucket Email UI `54324`.

---

## Architecture & SOLID Compliance

- **Liskov Substitution Principle (LSP)**: Passes `runDataRepositoryContractTests`, `runAuthProviderContractTests`, and `runStorageProviderContractTests` from `@mono-magic/data-access-ts-interfaces/testing`.
- **Dependency Inversion Principle (DIP)**: Accepts any `@supabase/supabase-js`-compatible `SupabaseClientLike` instance via constructor injection (real client or `createInMemorySupabaseClient()`).
- **Explicit Error Normalization**: Maps PostgREST, GoTrue, Storage, and Realtime errors to canonical `Result<T, DataAccessError>` envelopes via `normalizeSupabaseError`.
- **Query Translation**: Maps vendor-agnostic `QuerySpec<T>` (`eq`, `neq`, `in`, `gt`, `gte`, `lt`, `lte`, `contains`, `sort`, `limit`, `offset`, `cursor`) to PostgREST filter builders via `applyQuerySpecToPostgrest`.

## Nx Targets

```bash
pnpm nx lint data-access-ts-supabase
pnpm nx typecheck data-access-ts-supabase
pnpm nx test data-access-ts-supabase
pnpm nx emulator-up data-access-ts-supabase
pnpm nx test-integration data-access-ts-supabase
pnpm nx emulator-down data-access-ts-supabase
```

---

<!-- COVERAGE_TABLE_START -->
## Test & Coverage Summary

> Auto-synced by `node tools/ci/sync-readmes-and-coverage.mjs`. Updated whenever new functions or unit tests are written.

| Project | Runner | Lines | Statements | Functions | Branches | Threshold | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `data-access-ts-supabase` | Vitest V8 + Contract Compliance Suite | **95.1%** | **95.0%** | **99.0%** | **81.5%** | `>= 80%` | Passing |
<!-- COVERAGE_TABLE_END -->
