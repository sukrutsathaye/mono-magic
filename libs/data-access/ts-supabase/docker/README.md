# Local Supabase Docker Stack (`@mono-magic/data-access-ts-supabase`)

Self-contained local Supabase emulator stack for zero-cloud development and contract integration testing.

## Services & Ports

| Service | Container | Local Port | Description |
| --- | --- | --- | --- |
| API Gateway (Kong) | `mono-magic-supabase-gateway` | `http://localhost:54321` | Unified entrypoint (`/auth/v1`, `/rest/v1`, `/storage/v1`, `/realtime/v1`) |
| Postgres 15 | `mono-magic-supabase-db` | `54322` | PostgreSQL database initialized with `init.sql` (`public.contract_entities`) |
| GoTrue Auth | `mono-magic-supabase-auth` | internal `9999` | Email/password & OAuth authentication (`GOTRUE_MAILER_AUTOCONFIRM=true`) |
| PostgREST | `mono-magic-supabase-rest` | internal `3000` | RESTful table queries mapped from `QuerySpec<T>` |
| Storage API | `mono-magic-supabase-storage` | internal `5000` | Local filesystem-backed object storage |
| Realtime | `mono-magic-supabase-realtime` | internal `4000` | Broadcast & presence channels |

## Static Local Keys (Zero Cloud Account Required)

- **Supabase URL**: `http://localhost:54321`
- **JWT Secret**: `super-secret-jwt-token-with-at-least-32-characters-long`
- **Anon Key**:
  ```text
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
  ```
- **Service Role Key**:
  ```text
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
  ```

## Nx Commands

```bash
# Start the local Supabase Docker stack
pnpm nx emulator-up data-access-ts-supabase

# Run integration tests against the local stack
pnpm nx test-integration data-access-ts-supabase

# Tear down containers and volumes
pnpm nx emulator-down data-access-ts-supabase
```
