# Milestone M3 Briefing — Track B (Core TS Utils, Protobuf Contracts, TS & Python Data-Access Interfaces)

## Identity & Role
- **Role**: Sub-Orchestrator for Milestone M3 (Features F9–F12)
- **Parent Conversation ID**: `c60cfeb3f87423422591f4dc488219d6`
- **State Folder**: `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/sub_orch_m3`
- **Model Tier Policy**:
  - `pro`: Implementation Workers ONLY (Stage 1: `utils-ts-core` + `proto-contracts`; Stage 2: `data-access-ts-interfaces` and `py-data-access-interfaces`)
  - `flash`: Explorers, Reviewers (2x), Challengers (2x), Forensic Auditor (1x)

## Objective
Deliver Milestone M3 (Track B, Features F9–F12) in `/home/antigravity/sukrutsathaye/mono-magic`:
1. **F9 — `libs/utils/ts-core`** (`@mono-magic/utils-ts-core`, Nx `utils-ts-core`, tags `["scope:utils", "type:util", "lang:ts"]`):
   - `Result<T, E>` (`ok`, `err`, `isOk`, `isErr`, `mapResult`, `flatMapResult`, `unwrapOr`)
   - `AppError` + `ErrorCode` (`VALIDATION`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `CONFLICT`, `RATE_LIMITED`, `TIMEOUT`, `UNAVAILABLE`, `INTERNAL`)
   - `retryWithBackoff` (exponential backoff + jitter + `AbortSignal` + `shouldRetry`)
   - `TypedEventBus<TEvents>` (`on`, `once`, `off`, `emit`, `clear`)
   - `invariant`
   - Full TSDoc, `README.md`, Vitest `watch: false`, `>=90%` coverage thresholds (`lines`, `statements`, `functions`, `branches`)
2. **F10 — `libs/data-access/proto-contracts`** (Nx `proto-contracts`, tags `["scope:data-access", "type:interfaces", "lang:proto"]`):
   - `@bufbuild/buf` in root `package.json` `devDependencies`
   - `buf.yaml` (v2), `buf.gen.yaml` (v2), `project.json` (`lint`, `breaking`, `generate`), `README.md`
   - 6 schemas under `proto/monomagic/`:
     - `common/v1/errors.proto`
     - `common/v1/pagination.proto`
     - `auth/v1/auth.proto`
     - `storage/v1/storage.proto`
     - `realtime/v1/realtime.proto`
     - `payments/v1/payments.proto`
3. **F11 — `libs/data-access/ts-interfaces`** (`@mono-magic/data-access-ts-interfaces`, Nx `data-access-ts-interfaces`, tags `["scope:data-access", "type:interfaces", "lang:ts"]`, depends on `@mono-magic/utils-ts-core`):
   - `common/query.interface.ts`
   - `auth/auth.interface.ts` (`IAuthProvider`, `BaseAuthProvider`)
   - `repository/repository.interface.ts` (`IDataRepository<TEntity, TId>`, `BaseDataRepository<TEntity, TId>`)
   - `storage/storage.interface.ts` (`IStorageProvider`, `BaseStorageProvider`)
   - `realtime/realtime.interface.ts` (`IRealtimeProvider`, `BaseRealtimeProvider`)
   - `payments/payment.interface.ts` (`IPaymentProvider`, `BasePaymentProvider`)
   - `testing/contract-compliance.ts` (`runDataRepositoryContractTests`, `runAuthProviderContractTests`, `runStorageProviderContractTests`, plus realtime/payment compliance tests as needed) + in-memory reference adapters self-testing all compliance suites (`>=80%` coverage thresholds)
   - Full TSDoc, `README.md`, Vitest `watch: false`
4. **F12 — `libs/data-access/py-interfaces`** (Nx `py-data-access-interfaces`, tags `["scope:data-access", "type:interfaces", "lang:py"]`):
   - `pyproject.toml` (`requires-python = ">=3.12"`, `pydantic`), `project.json` (`lint`=`ruff`, `typecheck`=`pyright`, `test`=`pytest --cov >=80%`), `README.md`
   - Pydantic v2 DTOs (frozen/immutable), `typing.Protocol` / `abc.ABC` (`AuthProvider`, `DataRepository[TEntity, TId]`, `StorageProvider`, `RealtimeProvider`, `PaymentProvider`)
   - `pytest` compliance suite (`assert_repository_contract`, `assert_auth_contract`, etc.) + in-memory reference adapter tests (`>=80%` coverage)
   - Google-style docstrings, `py.typed` marker, `uv sync` clean

## Mandatory References
- `.agents/teamwork/ORIGINAL_REQUEST.md`
- `/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/59a048a4-9216-4cda-b439-043b6566a6e2/implementation_plan.md`
- `PROJECT.md`
- `.agents/teamwork/explorer_survey_2/handoff.md`
- `.gemini/skills/engineering-standards/SKILL.md`
- `.gemini/skills/python-uv-service/SKILL.md`
- `.gemini/skills/data-access-provider/SKILL.md`
