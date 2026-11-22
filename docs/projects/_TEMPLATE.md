# Project Blueprint: `<Project Title>`

- **Status**: `Draft` | `Needs Deep-Dive Design` | `Blueprint Approved — Scheduled for Phase X`
- **Target Phases**: `<e.g., Phase 2C, Phase 3A/3C, Phase 4C, Phase 5X>`
- **Primary Domains**: `<e.g., libs/utils/*, libs/data-access/*, libs/features/*, libs/ui/*, apps/*>`
- **Owner / Last Design Review (`/grill-me`)**: `<Date / Session Notes>`

---

## 1. Problem & Goals

- **Problem Statement**: Summarize the legacy system, user pain points, or portfolio problem being solved.
- **Core Objectives**: Measurable latency, throughput, UX, portability, and maintainability goals.
- **Target Personas & Roles**: List roles, permissions, and core user journeys.
- **Non-Goals / Out of Scope**: Explicitly define what this blueprint intentionally defers.

---

## 2. Domain Boundaries (`libs/<domain>/<lang>-<name>` Mapping)

Map every responsibility strictly to `mono-magic`'s 4-domain `libs/` + `apps/` layout (`eslint.config.mjs` enforced):

| Package / App Path | Nx Project Name | Tags (`scope:*`, `type:*`, `lang:*`) | Responsibility & Forbidden Dependencies |
| --- | --- | --- | --- |
| `libs/utils/<lang>-<name>` | `<proj>` | `scope:utils`, `type:util`, `lang:<lang>` | Pure, stateless helpers only; zero I/O, zero domain contracts |
| `libs/data-access/proto-contracts` | `proto-contracts` | `scope:data-access`, `type:interfaces`, `lang:proto` | Shared wire DTOs, error enums, pagination/RPC contracts |
| `libs/data-access/<lang>-<provider>` | `<proj>` | `scope:data-access`, `type:data-access`, `lang:<lang>` | Concrete adapters, DB/broker/ML singletons, external HTTP/SDK I/O |
| `libs/features/<lang>-<name>` | `<proj>` | `scope:features`, `type:feature`, `lang:<lang>` | Feature state, view-models, orchestrators depending only on `type:interfaces` |
| `libs/ui/*` | `atomic-design-interfaces` + 4 UI libs | `scope:ui` | Bottom-up Atoms, Molecules, Organisms, Templates (presentation only) |
| `apps/<app-name>` | `<app>` | `scope:app`, `type:app`, `lang:<lang>` | Thin deployable web, mobile, or FastAPI/Spring/NestJS/Go/Rust entrypoint |

---

## 3. SOLID & Optimization Strategy

- **SRP / OCP / LSP / ISP / DIP Alignment**:
  - Identify every extension point (`Protocol` / TS `interface`) and confirm zero vendor `if/elif` switches in core orchestrators.
  - Specify which Contract Compliance Test Suites (`runDataRepositoryContractTests`, `assert_repository_contract`, etc.) concrete providers must pass.
- **Performance & Concurrency Design**:
  - Singleton resource lifecycle (e.g., FastAPI `lifespan`, connection pools, HTTP clients, ML model caches).
  - Batching, caching, N+1 prevention, async thread/process offloading (`asyncio.to_thread`, worker pools), and payload bounds.
- **Security & Secret Hygiene**:
  - Auth/AuthZ flow, input validation, least-privilege config via env/settings (zero hardcoded credentials).

---

## 4. Protobuf & Data-Access Contracts

- **Protobuf / Wire Schemas (`libs/data-access/proto-contracts`)**: New messages, enums, or RPC services required.
- **Language Trait Interfaces (`ts-interfaces` / `py-interfaces`)**: New or reused capability interfaces (`IAuthProvider`, `IDataRepository`, `IStorageProvider`, `IRealtimeProvider`, `IPaymentProvider`) and domain-specific service protocols.
- **API / Event Endpoints**: Table of HTTP/gRPC/WebSocket/SSE/MQTT contracts with request/response shapes and error codes.

---

## 5. UI Organisms & Templates (`libs/ui/*`)

- **Reused Atoms & Molecules**: List existing Wave 1/Wave 2 Atoms and Molecules composed.
- **New Domain Organisms & Templates**: Props contracts in `libs/ui/atomic-design-interfaces` (mirrored in `fl-mat` Dart models), WCAG 2.1 AA requirements, and 4-library parity plan (`react-mui`, `ng-mat`, `rn-paper`, `fl-mat`).

---

## 6. Testing & E2E Plan

Follow [`.gemini/skills/engineering-standards/SKILL.md`](../../.gemini/skills/engineering-standards/SKILL.md):
- **Unit & Utility Coverage**: `>=90%` (`lines`, `statements`, `functions`, `branches`) for `libs/utils/*`; `>=80%` for `libs/data-access/*`, `libs/features/*`, `libs/ui/*`, `apps/*`.
- **Contract Compliance Tests**: Shared LSP compliance suites executed against every concrete adapter (plus emulator/in-memory fixtures).
- **Visual Regression**: CSF3 Storybook stories + `storybook-addon-vis` baselines (`pnpm nx test-storybook <project> -- -u`) + Widgetbook use-cases.
- **End-to-End (E2E) Suites**:
  - Backend: ASGI E2E (`httpx.AsyncClient` + `ASGITransport`) / Spring Boot Testcontainers / Supertest.
  - Frontend: Playwright E2E journeys for web; integration tests for mobile.

---

## 7. Phased Milestones

1. **Milestone 1 — Contracts & Pure Utilities** (`proto-contracts`, `libs/utils/*`, `ts-interfaces`/`py-interfaces`)
2. **Milestone 2 — Data-Access Providers & Microservice Shell** (`libs/data-access/*`, `apps/api-*`)
3. **Milestone 3 — UI Organisms, Templates & Visual Baselines** (`libs/ui/*`, `libs/features/*`)
4. **Milestone 4 — Flagship App Assembly & E2E Verification** (`apps/*`, `pnpm nx affected -t lint typecheck test build`)
