# Project: mono-magic Wave 1 — Governance, Polyglot Contracts & UI Molecules Batch 1

## Architecture
- **4-Domain `libs/` Directory & Language-Prefixed Naming Standard**:
  - `libs/` contains exclusively 4 domain directories: `libs/ui/`, `libs/utils/`, `libs/data-access/`, and `libs/features/`.
  - All new non-UI libraries follow `libs/<domain>/<lang>-<name>` (existing `libs/ui/*` names remain unchanged):
    - `libs/utils/ts-core` (`@mono-magic/utils-ts-core`, Nx project `utils-ts-core`)
    - `libs/data-access/proto-contracts` (Nx project `proto-contracts`)
    - `libs/data-access/ts-interfaces` (`@mono-magic/data-access-ts-interfaces`, Nx project `data-access-ts-interfaces`)
    - `libs/data-access/py-interfaces` (Nx project `py-data-access-interfaces`)
  - Workspace globs:
    - `pyproject.toml`: `members = ["apps/api-*", "libs/*/py-*"]`
    - `pnpm-workspace.yaml`: `["apps/*", "libs/ui/*", "libs/utils/ts-*", "libs/data-access/ts-*", "libs/features/ts-*", "!libs/ui/fl-mat"]`
- **Strict Nx Module Boundary Graph (`eslint.config.mjs`)**:
  - `scope:utils` -> `["scope:utils"]` (SRP: pure stateless helpers)
  - `scope:ui` -> `["scope:ui", "scope:utils"]` (SRP / DIP: presentation-only)
  - `scope:data-access` -> `["scope:data-access", "scope:utils"]` (SRP: contracts & adapters)
  - `scope:features` -> `["scope:features", "scope:ui", "scope:data-access", "scope:utils"]` (DIP)
  - `scope:app` -> `["scope:features", "scope:ui", "scope:data-access", "scope:utils"]` (SRP)
  - `type:interfaces` -> `["type:interfaces", "type:util"]` (DIP / ISP)
- **Hybrid Polyglot Data-Access Layer**:
  - Wire DTOs, errors, pagination/query specs, and service messages defined in `libs/data-access/proto-contracts` (`buf` v2 + Protobuf).
  - Idiomatic provider trait interfaces + abstract base classes + reusable Contract Compliance Test Suites in `libs/data-access/ts-interfaces` (depending on `@mono-magic/utils-ts-core`) and `libs/data-access/py-interfaces` (Pydantic v2 + `typing.Protocol` / `abc.ABC` + `pytest`).
- **Bottom-Up Atomic Design UI Parity (`libs/ui/*`)**:
  - Framework-agnostic TS contracts in `libs/ui/atomic-design-interfaces` mirrored in Dart models in `libs/ui/fl-mat/lib/src/interfaces/atomic_interfaces.dart`.
  - 1:1 component, unit test (`>=80%` coverage), Storybook/Widgetbook story, and `storybook-addon-vis` visual baseline parity across `react-mui`, `ng-mat`, `rn-paper`, and `fl-mat`.

## Code Layout
- **Track A (Governance, Skills, Boundaries, Globs, Docs)**:
  - `.gemini/settings.json`, `.gemini/MCP.md`
  - `.gemini/skills/engineering-standards/SKILL.md`, `.gemini/skills/python-uv-service/SKILL.md`
  - `.gemini/skills/data-access-provider/SKILL.md`, `.gemini/skills/roadmap-tracker/SKILL.md`
  - `.gemini/commands/add-data-access.toml`, `.gemini/agents/data-access-architect.md` (sync stale interface paths)
  - `GEMINI.md`, `AGENTS.md`, `eslint.config.mjs`, `pyproject.toml`, `pnpm-workspace.yaml`
  - `ROADMAP.md`, `PORTFOLIO_IDEAS.md`, `docs/projects/_TEMPLATE.md`, `docs/projects/reflective-learning.md`
- **Track B (TS Utils & Polyglot Data-Access Contracts)**:
  - `package.json` (`@bufbuild/buf` devDependency), `tsconfig.base.json`, `tsconfig.json`, `pyproject.toml` (only if workspace dev deps needed, or inside `py-interfaces/pyproject.toml` after Track A finishes `pyproject.toml`)
  - `libs/utils/ts-core/` (`package.json`, `tsconfig*.json`, `vitest.config.mts`, `eslint.config.mjs`, `README.md`, `src/index.ts`, `src/lib/*`)
  - `libs/data-access/proto-contracts/` (`project.json`, `buf.yaml`, `buf.gen.yaml`, `README.md`, `proto/monomagic/{common,auth,storage,realtime,payments}/v1/*.proto`)
  - `libs/data-access/ts-interfaces/` (`package.json`, `tsconfig*.json`, `vitest.config.mts`, `eslint.config.mjs`, `README.md`, `src/index.ts`, `src/testing.ts`, `src/lib/{common,auth,repository,storage,realtime,payments,testing}/*`)
  - `libs/data-access/py-interfaces/` (`project.json`, `pyproject.toml`, `README.md`, `src/py_data_access_interfaces/*`, `tests/*`)
- **Track C (Wave 2 UI Molecules Batch 1)**:
  - Contracts & Prep:
    - `libs/ui/atomic-design-interfaces/src/lib/molecules/{dialog,alert,toast,tabs,accordion,avatar}.interface.ts`, `index.ts`, `src/lib/interfaces.spec.ts`
    - `libs/ui/fl-mat/lib/src/interfaces/atomic_interfaces.dart`, `libs/ui/fl-mat/lib/src/core/magic_icon.dart`
    - `libs/ui/react-mui/src/lib/theme/mui-theme.tsx`
  - Implementations, Tests, Stories, Visual Baselines:
    - `libs/ui/react-mui/src/lib/molecules/{dialog,alert,toast,tabs,accordion,avatar}/*` + `molecules/index.ts` + `__vis__/`
    - `libs/ui/ng-mat/src/lib/molecules/{dialog,alert,toast,tabs,accordion,avatar}/*` + `molecules/index.ts` + `__vis__/`
    - `libs/ui/rn-paper/src/lib/molecules/{dialog,alert,toast,tabs,accordion,avatar}/*` + `molecules/index.ts` + `__vis__/`
    - `libs/ui/fl-mat/lib/src/molecules/{dialog,alert,toast,tabs,accordion,avatar}/*`, `lib/fl_mat.dart`, `lib/widgetbook/molecules/*`, `lib/widgetbook.dart`, `test/molecules/*`, `test/widgetbook_test.dart`

## Feature Inventory
Every Survey feature is assigned a Milestone (none unassigned):
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | MCP Server Configuration & Guide | Add `playwright` and `context7` stdio MCPs alongside `nx-mcp` in `.gemini/settings.json`; create `.gemini/MCP.md` documenting local & opt-in credentialed MCPs | M1 | Plan Track A / Survey 1 |
| F2 | Engineering Standards Skill | Create `.gemini/skills/engineering-standards/SKILL.md` with concrete SOLID rules, clean code/perf hygiene, JSDoc/docstring/Dartdoc/README gates, >=80% (>=90% utils) test gates, and tagging | M1 | Plan Track A / Survey 1 |
| F3 | Python `uv` Service Skill | Create `.gemini/skills/python-uv-service/SKILL.md` covering `libs/*/py-*` & `apps/api-*`, `ruff`, `pyright`, `pytest --cov`, FastAPI `lifespan`, Pydantic v2, SOLID `Protocol` | M1 | Plan Track A / Survey 1 |
| F4 | Workspace Guidance & Skill Path Sync | Update `GEMINI.md`, `AGENTS.md`, `.gemini/skills/data-access-provider/SKILL.md`, and sync stale interface paths in `.gemini/skills/roadmap-tracker/SKILL.md`, `.gemini/commands/add-data-access.toml`, `.gemini/agents/data-access-architect.md` | M1 | Plan Track A / Survey 1 |
| F5 | Strict ESLint Module Boundaries | Replace `* -> *` catch-all in `eslint.config.mjs` with the 6 strict `depConstraints` rules (`scope:*` and `type:interfaces`) | M1 | Plan Track A / Survey 1 |
| F6 | Workspace Globs Alignment | Update `pyproject.toml` (`members = ["apps/api-*", "libs/*/py-*"]`) and `pnpm-workspace.yaml` (`libs/utils/ts-*`, `libs/data-access/ts-*`, `libs/features/ts-*`) | M1 | Plan Track A / Survey 1 |
| F7 | Focused Roadmap Updates | Update `ROADMAP.md` (Phase 2C Reflective Learning, Phase 3A-3C paths, Phase 4C `apps/api-reflective-learning`, Phase 5A-5D flagship apps, links to `PORTFOLIO_IDEAS.md` & `docs/projects/`) | M1 | Plan Track A / Survey 1 |
| F8 | Portfolio Backlog & Project Docs | Create `PORTFOLIO_IDEAS.md` (8 projects marked `Needs Deep-Dive Design`), `docs/projects/_TEMPLATE.md`, and `docs/projects/reflective-learning.md` (full `migration.md` blueprint normalized to `libs/<domain>/<lang>-<name>`) | M1 | Plan Track A / Survey 1 |
| F9 | Core TS Utils (`utils-ts-core`) | Create `libs/utils/ts-core` (`@mono-magic/utils-ts-core`) exporting `Result<T, E>`, `AppError`/`ErrorCode`, `retryWithBackoff`, `TypedEventBus`, `invariant` with >=90% Vitest coverage & TSDoc | M3 | Plan Track B / Survey 2 |
| F10 | Protobuf Contracts (`proto-contracts`) | Install `@bufbuild/buf`, create `libs/data-access/proto-contracts` (`buf.yaml`, `buf.gen.yaml`, `project.json` `lint`/`breaking`/`generate`, 6 `.proto` schemas under `monomagic/{common,auth,storage,realtime,payments}/v1/`) | M3 | Plan Track B / Survey 2 |
| F11 | TS Data-Access Interfaces (`data-access-ts-interfaces`) | Create `libs/data-access/ts-interfaces` depending on `utils-ts-core` with `QuerySpec`/`PaginatedResult`/`DataAccessError`, `IAuthProvider`, `IDataRepository`, `IStorageProvider`, `IRealtimeProvider`, `IPaymentProvider` + Base classes + reusable compliance test suites & in-memory self-tests (>=80% coverage) | M3 | Plan Track B / Survey 2 |
| F12 | Python Data-Access Interfaces (`py-data-access-interfaces`) | Create `libs/data-access/py-interfaces` with Pydantic v2 DTOs, `Protocol`/`ABC` mirrors, reusable `pytest` compliance suite + in-memory tests (>=80% coverage), `ruff`/`pyright`/`pytest` Nx targets | M3 | Plan Track B / Survey 2 |
| F13 | Wave 2 Molecule Contracts & Prep | Define `Dialog`, `Alert`, `Toast`, `Tabs`, `Accordion`, `Avatar`/`AvatarGroup` TS contracts in `atomic-design-interfaces`, Dart contracts & icons in `fl-mat`, MUI theme overrides in `react-mui`, plus Flutter SDK env assessment/prep | M2 | Plan Track C / Survey 3 |
| F14 | Wave 2 Molecules in `react-mui` | Implement all 5 Wave 2 Molecules (+ `MagicAvatarGroup`) with >=80% Vitest coverage and CSF3 Storybook stories in `libs/ui/react-mui` | M4 | Plan Track C / Survey 3 |
| F15 | Wave 2 Molecules in `ng-mat` | Implement all 5 Wave 2 Molecules (+ `MagicAvatarGroupComponent`) with >=80% Vitest coverage and CSF3 Storybook stories in `libs/ui/ng-mat` | M4 | Plan Track C / Survey 3 |
| F16 | Wave 2 Molecules in `rn-paper` | Implement all 5 Wave 2 Molecules (+ `MagicAvatarGroup`) with >=80% Vitest coverage and CSF3 Storybook stories in `libs/ui/rn-paper` | M4 | Plan Track C / Survey 3 |
| F17 | Wave 2 Molecules in `fl-mat` | Implement all 5 Wave 2 Molecules (+ `MagicAvatarGroup`) with widget tests and Widgetbook use-cases in `libs/ui/fl-mat` | M4 | Plan Track C / Survey 3 |
| F18 | Storybook Visual Baselines & Builds | Generate `storybook-addon-vis` baselines (`pnpm nx test-storybook <project> -- -u`) and verify `test-storybook` + `build-storybook` across `react-mui`, `ng-mat`, `rn-paper` + `build-widgetbook` for `fl-mat` | M4 | Plan Track C / Survey 3 |
| F19 | Full Verification Plan & Whole-Project Audit | Execute complete Verification Plan across Tracks A, B, C (including boundary violation negative test, `affected` gate) + Whole-Project Forensic Integrity Audit | M5 | Plan Verification / Audit |

## Milestones
| # | Name | Scope | Dependencies | Tier Strategy | Status |
|---|------|-------|-------------|---------------|--------|
| M1 | Track A: Governance, MCP, Skills, Boundaries, Globs & Docs | F1–F8 | none | `pro` Sub-Orch & Worker; `flash` Verifiers/Auditor | in-progress |
| M2 | Track C Stage 1: Wave 2 Molecule Contracts, Dart Models & Theme Prep | F13 | none | `flash` Sub-Orch, Worker, Verifiers, Auditor | in-progress |
| M3 | Track B: Core TS Utils, Protobuf Contracts, TS & Python Data-Access Interfaces | F9–F12 | M1 (workspace globs & boundaries) | `pro` Sub-Orch & Workers; `flash` Explorers/Verifiers/Auditor | planned |
| M4 | Track C Stage 2: 4-Library UI Implementations, Coverage, Stories & Vis Baselines | F14–F18 | M2 (contracts & Dart models) | `flash` Sub-Orch, 4 parallel Library Workers, Verifiers, Auditor | planned |
| M5 | Final Verification & Cross-Track E2E Gate | F19 | M1, M2, M3, M4 | `flash` Verification Sub-Orch & Whole-Project Auditor (`pro` only if Track B remediation needed) | planned |

## Interface Contracts

### Workspace Boundaries & Globs (`M1` <-> `M3`, `M4`)
- `pyproject.toml`: `[tool.uv.workspace] members = ["apps/api-*", "libs/*/py-*"]`
- `pnpm-workspace.yaml`: `["apps/*", "libs/ui/*", "libs/utils/ts-*", "libs/data-access/ts-*", "libs/features/ts-*", "!libs/ui/fl-mat"]`
- `eslint.config.mjs`: `@nx/enforce-module-boundaries` enforces `scope:utils`, `scope:ui`, `scope:data-access`, `scope:features`, `scope:app`, `type:interfaces`.

### `utils-ts-core` <-> `data-access-ts-interfaces` (`M3`)
- `@mono-magic/utils-ts-core` exports:
  - `Result<T, E>` (`{ readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: E }`), `ok`, `err`, `isOk`, `isErr`, `mapResult`, `flatMapResult`, `unwrapOr`
  - `ErrorCode` (`'VALIDATION' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'CONFLICT' | 'RATE_LIMITED' | 'TIMEOUT' | 'UNAVAILABLE' | 'INTERNAL'`)
  - `AppError` (extends `Error`, readonly `code`, `details`, `cause`, `retryable`)
  - `retryWithBackoff<T>(fn, options?: { maxAttempts?, baseDelayMs?, maxDelayMs?, jitter?, signal?, shouldRetry? }): Promise<T>`
  - `TypedEventBus<TEvents extends Record<string, unknown>>` (`on`, `once`, `off`, `emit`, `clear`)
  - `invariant(condition: unknown, message: string, code?: ErrorCode): asserts condition`
- `@mono-magic/data-access-ts-interfaces` exports:
  - Uses `Result<T, DataAccessError>` and `ErrorCode` from `@mono-magic/utils-ts-core`.
  - `QuerySpec<T>`, `FilterSpec<T>`, `FilterOperator`, `SortSpec<T>`, `SortDirection`, `PaginatedResult<T>`, `DataAccessError`
  - `IAuthProvider` / `BaseAuthProvider` (`signInWithEmail`, `signUpWithEmail`, `signInWithOAuth`, `signOut`, `getCurrentSession`, `refreshToken`, `verifyToken`, `onAuthStateChanged`)
  - `IDataRepository<TEntity, TId>` / `BaseDataRepository<TEntity, TId>` (`findById`, `findMany`, `create`, `update`, `delete`, `transaction`)
  - `IStorageProvider` / `BaseStorageProvider` (`upload`, `download`, `getSignedUrl`, `delete`, `list`)
  - `IRealtimeProvider` / `BaseRealtimeProvider` (`publish`, `subscribe`, `presence`)
  - `IPaymentProvider` / `BasePaymentProvider` (`createPaymentIntent`, `confirmPaymentIntent`, `getPaymentIntent`, `refundPayment`)
  - Compliance testing exports (`@mono-magic/data-access-ts-interfaces/testing` and re-export if appropriate): `runDataRepositoryContractTests`, `runAuthProviderContractTests`, `runStorageProviderContractTests` (+ realtime/payment suites if included).

### `proto-contracts` <-> `ts-interfaces` & `py-interfaces` (`M3`)
- Canonical schemas in `libs/data-access/proto-contracts/proto/monomagic/`:
  - `common/v1/errors.proto`: `ErrorCode`, `DataAccessError`
  - `common/v1/pagination.proto`: `SortDirection`, `SortSpec`, `FilterOperator`, `FilterSpec`, `QuerySpec`, `PageInfo`
  - `auth/v1/auth.proto`: `OAuthProvider`, `UserClaims`, `AuthSession`, `SignInRequest`
  - `storage/v1/storage.proto`: `StorageObjectMeta`, `SignedUrlResponse`
  - `realtime/v1/realtime.proto`: `RealtimeEnvelope`, `PresenceState`
  - `payments/v1/payments.proto`: `Money`, `PaymentStatus`, `PaymentIntent`
- `py-data-access-interfaces` (`libs/data-access/py-interfaces`): Pydantic v2 DTOs + `Protocol`/`ABC` (`AuthProvider`, `DataRepository[TEntity, TId]`, `StorageProvider`, `RealtimeProvider`, `PaymentProvider`) + `pytest` contract compliance helpers (`assert_repository_contract`, `assert_auth_contract`, etc.).

### `atomic-design-interfaces` & `fl-mat` Contracts <-> 4 UI Libraries (`M2` <-> `M4`)
- Naming in `atomic-design-interfaces`: `<Name>MoleculeProps` (consistent with Wave 1 `CardMoleculeProps`, `MenuMoleculeProps`, etc.) and `Magic<Name>` in component libraries.
- `Dialog` (`dialog.interface.ts`): `DialogSize = 'sm' | 'md' | 'lg' | 'fullscreen'`, `DialogActionItem`, `DialogMoleculeProps` (`open?`, `title?`, `subtitle?`, `content?`, `size?`, `dismissible?`, `closeOnBackdropClick?`, `closeOnEscape?`, `showCloseButton?`, `scrollable?`, `actions?`, `alignActions?`).
- `Alert` & `Toast` (`alert.interface.ts`, `toast.interface.ts`): `AlertSeverity = 'info' | 'success' | 'warning' | 'error'`, `AlertVariant = 'standard' | 'filled' | 'outlined'`, `ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'`, `AlertMoleculeProps`, `ToastMoleculeProps` (mapping `'info'` consistently to `'primary'` intent token where `ColorIntent` applies).
- `Tabs` (`tabs.interface.ts`): `TabsOrientation = 'horizontal' | 'vertical'`, `TabsVariant = 'primary' | 'secondary'`, `TabItem` (`id`, `label`, `icon?`, `badgeContent?`, `disabled?`, `content?`), `TabsMoleculeProps` (`items`, `activeTabId?`, `defaultActiveTabId?`, `orientation?`, `variant?`, `scrollable?`, `lazy?`, `color?`, `size?`).
- `Accordion` (`accordion.interface.ts`): `AccordionAppearance = 'outlined' | 'raised'`, `AccordionItem` (`id`, `title`, `summary?`, `content?`, `icon?`, `disabled?`, `expanded?`), `AccordionMoleculeProps` (`items`, `multiple?`, `expandedIds?`, `defaultExpandedIds?`, `appearance?`, `size?`).
- `Avatar` (`avatar.interface.ts`): `AvatarStatus = 'online' | 'busy' | 'offline'`, `AvatarShape = 'circle' | 'rounded' | 'square'`, `AvatarMoleculeProps` (`src?`, `alt?`, `name?`, `initials?`, `icon?`, `size?`, `color?`, `shape?`, `status?`, `statusLabel?`), `AvatarGroupItem`, `AvatarGroupMoleculeProps` (`items`, `max?`, `size?`, `spacing?`).
