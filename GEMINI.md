# mono-magic — Gemini & Antigravity Workspace Rules

This repository is a polyglot monorepo powered by **Nx** (`v24.0.6`), **pnpm** (`v12.18.0`), **uv** (`Python >=3.12`), and **Flutter** (`>=3.50`).

`.gemini/` is the primary AI orchestration hub for this repository, paired with `.agents/skills.json` so both **Google Antigravity** and **Gemini CLI** automatically discover all workspace skills, slash commands, and specialist agent profiles.

---

## 1. Core Workspace Rules

1. **Always Run Tasks Through Nx (`pnpm nx ...`)**:
   - Prefix all Nx commands with `pnpm nx` (e.g., `pnpm nx show projects`, `pnpm nx run-many -t test`, `pnpm nx affected -t lint test build`).
   - Do **not** read `project.json` directly to assume a project's full targets—use `pnpm nx show project <project> --json` (see the `nx-workspace` skill).
   - **Mandatory Standards Gate**: Every change MUST follow `.gemini/skills/engineering-standards/SKILL.md` (SOLID, immutability, explicit `Result`/error handling, strict typing, docs, `>=80%` / `>=90%` utils coverage, E2E suites). Python libraries and FastAPI services MUST additionally follow `.gemini/skills/python-uv-service/SKILL.md`.
2. **Actual Nx Project Names**:
   - The UI projects are named `atomic-design-interfaces`, `react-mui`, `ng-mat`, `rn-paper`, and `fl-mat` (do **not** use stale `ui-*` prefixes like `ui-react-mui` or `ui-fl-mat`).
   - Flutter uses **Widgetbook** (`pnpm nx widgetbook fl-mat`, `pnpm nx build-widgetbook fl-mat`), while the JS/TS UI libraries use **Storybook** (`pnpm nx storybook <project>`, `pnpm nx build-storybook <project>`, `pnpm nx test-storybook <project>`).
3. **Strict 4-Domain `libs/` Structure, Naming & Tagging Standard**:
   - `libs/` contains **exclusively 4 domain directories**: `libs/ui/`, `libs/utils/`, `libs/data-access/`, and `libs/features/`.
   - All new non-UI libraries follow `libs/<domain>/<lang>-<name>` (existing `libs/ui/*` names remain unchanged) and carry `scope:<ui|utils|data-access|features|app>`, `type:<interfaces|util|data-access|feature|ui|app>`, and `lang:<ts|py|java|dart|proto|rust|go>` tags enforced by `eslint.config.mjs`:
     - `libs/ui/atomic-design-interfaces` (`@mono-magic/atomic-design-interfaces`, `scope:ui`, `type:interfaces`): Framework-agnostic TypeScript Atomic Design component contracts.
     - `libs/ui/{react-mui,ng-mat,rn-paper,fl-mat}` (`scope:ui`): Concrete framework implementations maintaining 1:1 parity across all 4 UI libraries (and Dart models in `fl-mat`), ordered strictly bottom-up (`Atoms -> Molecules -> Core Organisms -> Domain Organisms -> Templates`).
     - `libs/data-access/*` (`scope:data-access`): **Hybrid `buf`/Protobuf + Idiomatic Trait workflow**. Wire DTOs, errors, and query/pagination schemas live in `libs/data-access/proto-contracts` (`buf`); idiomatic provider interfaces + Contract Compliance Test Suites live in `libs/data-access/ts-interfaces` (`@mono-magic/data-access-ts-interfaces`) and `libs/data-access/py-interfaces` (`py-data-access-interfaces`) (plus future `dart-interfaces`, `java-interfaces`), backed by concrete wrappers (`ts-firebase`, `ts-supabase`, `ts-nestjs-*`, `java-spring-boot-*`, `ts-aws`, `ts-gcp`, `ts-azure`, `py-reflective-nlp`, `ts-reflective-api`, `ts-livekit`).
     - `libs/utils/*` (`scope:utils`, `type:util`): Pure, stateless, framework- and vendor-agnostic utilities (`ts-core`, `ts-formatters`, `ts-pose-math`, `ts-design-tokens`, `py-common`, `py-nlp`). Domain contracts and external I/O do **not** go in `libs/utils/`.
     - `libs/features/*` (`scope:features`): Feature modules (`ts-*`, `py-*`) composing `ui`, `data-access`, and `utils` via `type:interfaces` abstractions.
     - `apps/*` (`scope:app`): Thin deployable end-user apps and polyglot microservices (`apps/api-*`).
4. **MCP Server Configuration**:
   - Local zero-secret stdio MCPs (`nx-mcp`, `playwright`, `context7`) are enabled in `.gemini/settings.json`. See [.gemini/MCP.md](.gemini/MCP.md) for usage and opt-in credentialed MCPs (`supabase`, `firebase`, `storybook`, `github`)—never commit tokens or secrets.
5. **Token-Budget & `/teamwork` Guardrails (Mandatory)**:
   - **Index-First**: Always read [REPO_INDEX.md](REPO_INDEX.md) first; never run full-repo `find`/`ls -R`/root `grep`. Scope `rg -n` to a single project and read `<=150`-line slices.
   - **Parallel `/teamwork` Discipline**: Follow [.gemini/skills/token-budget-guardrails/SKILL.md](.gemini/skills/token-budget-guardrails/SKILL.md) — coordinator pre-reads shared contracts once and embeds exact paths/symbols in briefs; cap parallel waves to `3–4` workers (or 1:1 UI library sharding) with disjoint file ownership; tier models (`flash` for mechanical/verification, `inherit`/`pro` for architecture); never poll; run `pnpm nx affected` or targeted `pnpm nx test <project>` instead of repo-wide `run-many`.
   - **Git & Adaptive Rate-Limit Protocol**: Immediately checkout a meaningful grouped branch (`<type>/<scope>-<slug>`, never work directly on `main`); continuously commit using Conventional Commits (`<type>(<scope>): <summary>`) and push verified slices; orchestrators must periodically check rate limits, pause/stop child agents on pressure and continue sequentially 1-by-1, and if limits are nearly exhausted, write `.gemini/handovers/<branch-slug>.md` and push remaining WIP before stopping.
   - **Keep Index Fresh**: After adding/removing projects, components, protos, or skills, run `node tools/ci/generate-repo-index.mjs` once at the end.

---

## 2. Storybook Visual Testing (`storybook-addon-vis`)

- `react-mui`, `ng-mat`, and `rn-paper` use `@storybook/addon-vitest` + `storybook-addon-vis` (`vitest-plugin-vis`) with Playwright Chromium.
- Snapshot directories resolve under `libs/ui/<project>/__vis__/<local|platform>/`:
  - `__baselines__/` — Expected baseline images
  - `__results__/` — Latest test run output images
  - `__diffs__/` — Visual diff images on failure
- **First-Run / Missing Baselines**:
  - Running `pnpm nx test-storybook <project>` without `-u` when `__baselines__/` is empty writes only to `__results__/` and fails with a missing baseline error.
  - The Storybook Web **Vis** panel filters out stories that only have a `result` image without a `baseline` or `diff`, displaying `"There is no snapshots for this story"` until baselines exist.
  - Generate or update baselines with:
    ```bash
    pnpm nx test-storybook <project> -- -u
    ```

---

## 3. Repository Skills, Commands & Specialist Agents (`.gemini/`)

### Custom Skills (`.gemini/skills/`)
- **`engineering-standards`** *(Mandatory)* ([.gemini/skills/engineering-standards/SKILL.md](.gemini/skills/engineering-standards/SKILL.md)): Concrete SOLID principles, clean code & performance hygiene, documentation gates, unit/E2E coverage thresholds, and `libs/<domain>/<lang>-<name>` naming/tagging.
- **`token-budget-guardrails`** *(Mandatory for `/teamwork` & Subagents)* ([.gemini/skills/token-budget-guardrails/SKILL.md](.gemini/skills/token-budget-guardrails/SKILL.md)): Index-first discovery via [REPO_INDEX.md](REPO_INDEX.md), scoped searches, bounded parallel fan-out, disjoint file ownership, model tiering, and affected-only verification.
- **`python-uv-service`** *(Mandatory for Python)* ([.gemini/skills/python-uv-service/SKILL.md](.gemini/skills/python-uv-service/SKILL.md)): `uv` workspace standards for `libs/*/py-*` & `apps/api-*`, Nx `ruff`/`pyright`/`pytest --cov` targets, FastAPI `lifespan` singletons, Pydantic v2, and SOLID `Protocol`s.
- **`polyglot-ui-component`** ([.gemini/skills/polyglot-ui-component/SKILL.md](.gemini/skills/polyglot-ui-component/SKILL.md)): End-to-end workflow for adding or updating an Atomic Design component across `atomic-design-interfaces`, `react-mui`, `ng-mat`, `rn-paper`, and `fl-mat`.
- **`storybook-visual-testing`** ([.gemini/skills/storybook-visual-testing/SKILL.md](.gemini/skills/storybook-visual-testing/SKILL.md)): Runbook for `storybook-addon-vis` baselines (`-- -u`), diff triage, and assembling the GitHub Pages showcase portal (`tools/ci/storybook-pages.mjs`).
- **`coverage-and-quality`** ([.gemini/skills/coverage-and-quality/SKILL.md](.gemini/skills/coverage-and-quality/SKILL.md)): Runbook for Unit test coverage (`@vitest/coverage-v8`, `flutter test --coverage`), Storybook browser test coverage, 80% threshold enforcement, and static coverage portal generation.
- **`data-access-provider`** ([.gemini/skills/data-access-provider/SKILL.md](.gemini/skills/data-access-provider/SKILL.md)): Blueprint for designing hybrid `proto-contracts` + `ts-interfaces`/`py-interfaces` contracts and provider implementations (`ts-firebase`, `ts-supabase`, `ts-nestjs-*`, `java-spring-boot-*`, Cloud SDKs).
- **`roadmap-tracker`** ([.gemini/skills/roadmap-tracker/SKILL.md](.gemini/skills/roadmap-tracker/SKILL.md)): Workflow for picking up, verifying, and updating milestone checklists in [ROADMAP.md](ROADMAP.md) (plus links to [PORTFOLIO_IDEAS.md](PORTFOLIO_IDEAS.md) and `docs/projects/`).

### Custom Gemini CLI Slash Commands (`.gemini/commands/`)
- `/add-ui-component` ([.gemini/commands/add-ui-component.toml](.gemini/commands/add-ui-component.toml))
- `/visual-test` ([.gemini/commands/visual-test.toml](.gemini/commands/visual-test.toml))
- `/coverage-report` ([.gemini/commands/coverage-report.toml](.gemini/commands/coverage-report.toml))
- `/add-data-access` ([.gemini/commands/add-data-access.toml](.gemini/commands/add-data-access.toml))
- `/roadmap` ([.gemini/commands/roadmap.toml](.gemini/commands/roadmap.toml))
- `/monitor-ci` ([.gemini/commands/monitor-ci.toml](.gemini/commands/monitor-ci.toml))

### Specialist Agent Profiles (`.gemini/agents/`)
- **Polyglot UI Architect** ([.gemini/agents/polyglot-ui-architect.md](.gemini/agents/polyglot-ui-architect.md))
- **Data-Access & Backend Architect** ([.gemini/agents/data-access-architect.md](.gemini/agents/data-access-architect.md))
- **QA, Visual Regression & Coverage Specialist** ([.gemini/agents/qa-visual-coverage-specialist.md](.gemini/agents/qa-visual-coverage-specialist.md))
