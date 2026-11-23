# `@mono-magic/data-access-ts-supabase`

Concrete TypeScript Supabase data-access adapters implementing `@mono-magic/data-access-ts-interfaces` (`IAuthProvider`, `IDataRepository<T, ID>`, `IStorageProvider`, `IRealtimeProvider`).

## Architecture & SOLID Compliance

- **Tags**: `scope:data-access`, `type:data-access`, `lang:ts`
- **Liskov Substitution Principle (LSP)**: Passes `runDataRepositoryContractTests`, `runAuthProviderContractTests`, and `runStorageProviderContractTests` from `@mono-magic/data-access-ts-interfaces/testing`.
- **Dependency Inversion Principle (DIP)**: Accepts any `@supabase/supabase-js`-compatible `SupabaseClientLike` instance via constructor injection (real `@supabase/supabase-js` client or `createInMemorySupabaseClient()`).
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
