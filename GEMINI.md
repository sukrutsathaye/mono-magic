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
   - **Parallel `/teamwork` Discipline & 4-Tier Model Matrix (Max 6 Concurrent Agents)**: Follow [.gemini/skills/token-budget-guardrails/SKILL.md](.gemini/skills/token-budget-guardrails/SKILL.md):
     - Cap concurrent agents at **max 6** with strictly disjoint file/project ownership and zero survey-explorer swarms.
     - Select models from the 4-Tier Subscription Capability Matrix across Google, Anthropic, and OpenAI (`Tier 1 Frontier`: `Gemini 4 Argon (High)`, `Claude Opus 5.5`; `Tier 2 Complex Implementation`: `Claude Sonnet 5.5`, `Gemini 4 Neon`; `Tier 3 High-Throughput / Utils / Testing`: `Gemini 4 Hydrogen`, `GPT-OSS 120B (Medium)`; `Tier 4 Fast Docs / Sync / Verification`: `Gemini 3.8 Flash`) while balancing load across providers.
     - **Periodic Token Checks & Track Prioritization**: Periodically check token consumption before and between waves. If running all tracks in a wave would risk exceeding token limits, **prioritize and execute only 1–2 tracks** (`P1: Contracts -> P2: Utils/Data-Access -> P3: UI Libs -> P4: Apps/Showcases`), merge completed tracks into `dev`, and checkpoint deferred tracks in `.gemini/handovers/<branch-slug>.md`.
   - **Git (`main -> dev` Sync) & Adaptive Rate-Limit Protocol**:
     1. **Before starting any task**, always update `dev` with current `main` (`git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*" && git fetch origin && git checkout -B dev origin/dev && git merge --no-edit origin/main && git push -u origin dev`).
     2. Branch feature branches off `dev` (`git checkout -b <type>/<scope>-<slug> dev`, never work directly on `main` or `dev`).
     3. Continuously commit using Conventional Commits (`<type>(<scope>): <summary>`) and push verified slices.
     4. **All PRs MUST be opened against `dev`** (`gh pr create --base dev ...`). AI agents may freely merge passing PRs into `dev`, while the final `dev -> main` merge is strictly reserved for the human repository owner after review.
   - **Mandatory Post-Task Sync ([`repo-updater`](.gemini/skills/repo-updater/SKILL.md))**: After adding/modifying code, tests, components, protos, or skills, run `node tools/ci/generate-repo-index.mjs` and `node tools/ci/sync-readmes-and-coverage.mjs` once at the end.

---

## 2. Storybook Visual Testing (`storybook-addon-vis`)

- `react-mui`, `ng-mat`, `rn-paper`, `vue-vuetify`, and `svelte-tw` use `@storybook/addon-vitest` + `storybook-addon-vis` (`vitest-plugin-vis`) with Playwright Chromium.
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
- **`git-workflow`** *(Mandatory)* ([.gemini/skills/git-workflow/SKILL.md](.gemini/skills/git-workflow/SKILL.md)): `main -> dev` pre-task sync, `<type>/<scope>-<slug>` branching, micro-atomic commits (function/story/test-level; whole-file commits allowed only for isolated generator scaffolding), Conventional Commits, pre-PR commit audits, and `gh` PR/issue linking.
- **`token-budget-guardrails`** *(Mandatory for `/teamwork` & Subagents)* ([.gemini/skills/token-budget-guardrails/SKILL.md](.gemini/skills/token-budget-guardrails/SKILL.md)): Index-first discovery via [REPO_INDEX.md](REPO_INDEX.md), `main -> dev` pre-task sync, PRs against `dev`, bounded parallel fan-out, disjoint file ownership, model tiering, and affected-only verification.
- **`polyglot-unit-testing`** *(Mandatory)* ([.gemini/skills/polyglot-unit-testing/SKILL.md](.gemini/skills/polyglot-unit-testing/SKILL.md)): Per-language unit and contract compliance testing playbooks across TS/Vitest (Node, React 19, Angular 22, RN Paper, Vue 3, Svelte 5), Python (`pytest`), Flutter (`flutter_test`), Rust (`cargo test`), and Go (`go test -race -cover`), plus automated `README.md` coverage table syncing.
- **`interactive-stories`** *(Mandatory for UI)* ([.gemini/skills/interactive-stories/SKILL.md](.gemini/skills/interactive-stories/SKILL.md)): Canonical 7-Category Component State Matrix across Storybook (`react-mui`, `ng-mat`, `rn-paper`, `vue-vuetify`, `svelte-tw`) and Flutter Widgetbook (`fl-mat`) with categorized Controls/knobs, stateful wrappers, `play` tests, and visual baselines.
- **`code-doc-generator`** *(Mandatory)* ([.gemini/skills/code-doc-generator/SKILL.md](.gemini/skills/code-doc-generator/SKILL.md)): Inline code documentation standards (TSDoc/JSDoc, Google Python docstrings, Dartdoc `///`, Rustdoc `//!`/`///`, Godoc, Protobuf) and per-package `libs/<domain>/<project>/README.md` maintenance.
- **`project-readme-standard`** *(Mandatory)* ([.gemini/skills/project-readme-standard/SKILL.md](.gemini/skills/project-readme-standard/SKILL.md)): Applicability-scoped project README playbook enforcing official framework/language/design-system/algorithm links, Docker/emulator local setup runbooks, and Protobuf language codegen commands.
- **`grill-me`** ([.gemini/skills/grill-me/SKILL.md](.gemini/skills/grill-me/SKILL.md)): Deep multi-branch architectural interview playbook that explains all options (pros/cons) before every question.
- **`repo-updater`** *(Mandatory Post-Task)* ([.gemini/skills/repo-updater/SKILL.md](.gemini/skills/repo-updater/SKILL.md)): End-of-task synchronization across `REPO_INDEX.md`, per-library and root `README.md` (with clickable links to individual library READMEs and live test/coverage tables), `ROADMAP.md`, and `GEMINI.md`/`AGENTS.md`.
- **`python-uv-service`** *(Mandatory for Python)* ([.gemini/skills/python-uv-service/SKILL.md](.gemini/skills/python-uv-service/SKILL.md)): `uv` workspace standards for `libs/*/py-*` & `apps/api-*`, Nx `ruff`/`pyright`/`pytest --cov` targets, FastAPI `lifespan` singletons, Pydantic v2, and SOLID `Protocol`s.
- **`rust-go-systems`** *(Mandatory for Rust & Go)* ([.gemini/skills/rust-go-systems/SKILL.md](.gemini/skills/rust-go-systems/SKILL.md)): Cargo (`clippy -D warnings`, `rustfmt`, `#[repr(C)]` FFI/WASM, `cargo test`) and Go (`go.work`, `go vet`, table-driven `go test -race -cover`) workspace standards.
- **`polyglot-ui-component`** ([.gemini/skills/polyglot-ui-component/SKILL.md](.gemini/skills/polyglot-ui-component/SKILL.md)): End-to-end workflow for adding or updating an Atomic Design component across `atomic-design-interfaces`, `react-mui`, `ng-mat`, `rn-paper`, `fl-mat`, `vue-vuetify`, and `svelte-tw` following the **Root Framework Superset + Smart Polymorphic Props** rule.
- **`ui-react-mui`** ([.gemini/skills/ui-react-mui/SKILL.md](.gemini/skills/ui-react-mui/SKILL.md)): React 19 + MUI v9 component playbook (`sx`, `slotProps`, direct `ref`, `useControllableState`, smart internal MUI primitive switching).
- **`ui-ng-mat`** ([.gemini/skills/ui-ng-mat/SKILL.md](.gemini/skills/ui-ng-mat/SKILL.md)): Angular 22 + Angular Material v22 component playbook (`SignalProps`, shared host binding directives, dual Signal Forms + `MagicValueAccessor` CVA).
- **`ui-rn-paper`** ([.gemini/skills/ui-rn-paper/SKILL.md](.gemini/skills/ui-rn-paper/SKILL.md)): Expo 56 / React Native 0.85 + React Native Paper v5 component playbook (`useMagicPaperColors`, React Native Web parity, smart Paper primitive switching).
- **`ui-fl-mat`** ([.gemini/skills/ui-fl-mat/SKILL.md](.gemini/skills/ui-fl-mat/SKILL.md)): Flutter `>=3.50` Material 3 widget playbook (Dart contracts, `MagicTheme`, tree-shake-safe icons, `Semantics`, Widgetbook use-cases).
- **`ui-vue-vuetify`** ([.gemini/skills/ui-vue-vuetify/SKILL.md](.gemini/skills/ui-vue-vuetify/SKILL.md)): Vue 3.5 + Vuetify 3.12 SFC playbook (`v-model`, named `<slot>`s, Vite `optimizeDeps.include` pre-bundling, smart Vuetify primitive switching).
- **`ui-svelte-tw`** ([.gemini/skills/ui-svelte-tw/SKILL.md](.gemini/skills/ui-svelte-tw/SKILL.md)): Svelte 5 runes + Tailwind CSS v4 + Bits UI component playbook (`$props()`, `$bindable()`, `Snippet` slots, smart primitive switching).
- **`storybook-visual-testing`** ([.gemini/skills/storybook-visual-testing/SKILL.md](.gemini/skills/storybook-visual-testing/SKILL.md)): Runbook for `storybook-addon-vis` baselines (`-- -u`), diff triage, and assembling the GitHub Pages showcase & coverage portal (`tools/ci/storybook-pages.mjs`).
- **`coverage-and-quality`** ([.gemini/skills/coverage-and-quality/SKILL.md](.gemini/skills/coverage-and-quality/SKILL.md)): Runbook for polyglot unit test coverage, Storybook browser coverage, `>=80%`/`>=90%` threshold enforcement, and static coverage portal generation.
- **`data-access-provider`** ([.gemini/skills/data-access-provider/SKILL.md](.gemini/skills/data-access-provider/SKILL.md)): Blueprint for designing hybrid `proto-contracts` + `ts-interfaces`/`py-interfaces` contracts and provider implementations (`ts-firebase`, `ts-supabase`, `ts-nestjs-*`, `java-spring-boot-*`, Cloud SDKs).
- **`roadmap-tracker`** ([.gemini/skills/roadmap-tracker/SKILL.md](.gemini/skills/roadmap-tracker/SKILL.md)): Workflow for picking up, verifying, and updating milestone checklists in [ROADMAP.md](ROADMAP.md) (plus links to [PORTFOLIO_IDEAS.md](PORTFOLIO_IDEAS.md) and `docs/projects/`).

### Custom Gemini CLI Slash Commands (`.gemini/commands/`)
- `/add-ui-component` ([.gemini/commands/add-ui-component.toml](.gemini/commands/add-ui-component.toml))
- `/add-react-mui-component` ([.gemini/commands/add-react-mui-component.toml](.gemini/commands/add-react-mui-component.toml))
- `/add-ng-mat-component` ([.gemini/commands/add-ng-mat-component.toml](.gemini/commands/add-ng-mat-component.toml))
- `/add-rn-paper-component` ([.gemini/commands/add-rn-paper-component.toml](.gemini/commands/add-rn-paper-component.toml))
- `/add-fl-mat-component` ([.gemini/commands/add-fl-mat-component.toml](.gemini/commands/add-fl-mat-component.toml))
- `/add-vue-vuetify-component` ([.gemini/commands/add-vue-vuetify-component.toml](.gemini/commands/add-vue-vuetify-component.toml))
- `/add-svelte-tw-component` ([.gemini/commands/add-svelte-tw-component.toml](.gemini/commands/add-svelte-tw-component.toml))
- `/audit-ui-parity` ([.gemini/commands/audit-ui-parity.toml](.gemini/commands/audit-ui-parity.toml))
- `/add-polyglot-util` ([.gemini/commands/add-polyglot-util.toml](.gemini/commands/add-polyglot-util.toml))
- `/pre-pr-check` ([.gemini/commands/pre-pr-check.toml](.gemini/commands/pre-pr-check.toml))
- `/atomic-commit` ([.gemini/commands/atomic-commit.toml](.gemini/commands/atomic-commit.toml))
- `/write-stories` ([.gemini/commands/write-stories.toml](.gemini/commands/write-stories.toml))
- `/unit-test` ([.gemini/commands/unit-test.toml](.gemini/commands/unit-test.toml))
- `/doc-gen` ([.gemini/commands/doc-gen.toml](.gemini/commands/doc-gen.toml))
- `/update-project-readmes` ([.gemini/commands/update-project-readmes.toml](.gemini/commands/update-project-readmes.toml))
- `/grill-me` ([.gemini/commands/grill-me.toml](.gemini/commands/grill-me.toml))
- `/update-repo` ([.gemini/commands/update-repo.toml](.gemini/commands/update-repo.toml))
- `/visual-test` ([.gemini/commands/visual-test.toml](.gemini/commands/visual-test.toml))
- `/coverage-report` ([.gemini/commands/coverage-report.toml](.gemini/commands/coverage-report.toml))
- `/add-data-access` ([.gemini/commands/add-data-access.toml](.gemini/commands/add-data-access.toml))
- `/roadmap` ([.gemini/commands/roadmap.toml](.gemini/commands/roadmap.toml))
- `/monitor-ci` ([.gemini/commands/monitor-ci.toml](.gemini/commands/monitor-ci.toml))

### Specialist Agent Profiles (`.gemini/agents/`)
- **Polyglot UI Architect** ([.gemini/agents/polyglot-ui-architect.md](.gemini/agents/polyglot-ui-architect.md))
- **Data-Access & Backend Architect** ([.gemini/agents/data-access-architect.md](.gemini/agents/data-access-architect.md))
- **QA, Visual Regression & Coverage Specialist** ([.gemini/agents/qa-visual-coverage-specialist.md](.gemini/agents/qa-visual-coverage-specialist.md))
- **Polyglot Unit Test Specialist** ([.gemini/agents/polyglot-unit-test-specialist.md](.gemini/agents/polyglot-unit-test-specialist.md))
- **Interactive Story & Widgetbook Specialist** ([.gemini/agents/interactive-story-specialist.md](.gemini/agents/interactive-story-specialist.md))
- **Code Documentation Generator Specialist** ([.gemini/agents/code-doc-generator.md](.gemini/agents/code-doc-generator.md))
- **Repository Updater Specialist** ([.gemini/agents/repo-updater.md](.gemini/agents/repo-updater.md))
