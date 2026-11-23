# Project: mono-magic — Wave 2 Polyglot Expansion & Nx CI Remediation

## Architecture
- Polyglot Nx (`v24.0.6`) monorepo with `pnpm` (`v12.18.0`), `uv` (`Python >=3.12`), `cargo`/`rustc`, `go` (`1.24.3`), and `flutter` (`>=3.50`).
- Strict 4-domain `libs/` layout:
  - `libs/ui/` (`atomic-design-interfaces`, `react-mui`, `ng-mat`, `rn-paper`, `fl-mat`, `vue-vuetify`, `svelte-tw`)
  - `libs/utils/` (`ts-core`, `ts-formatters`, `py-common`, `py-nlp`, `rs-pose-math`, `rs-design-tokens`, `go-core`)
  - `libs/data-access/` (`proto-contracts`, `ts-interfaces`, `py-interfaces`, `ts-supabase`, `ts-firebase`, `ts-reflective-api`, `py-reflective-nlp`)
  - `libs/features/`
- Integration branch: `dev` (all PRs target `dev`; NEVER push/merge to `main`).
- CI architecture: GitHub Actions (`.github/workflows/ci.yml`) invokes `pnpm nx-cloud start-workers` + `pnpm nx affected -t lint typecheck test build` backed by Nx Cloud worker templates in `.nx/pipelines/ci.yaml`.

## Code Layout
- `.nx/pipelines/ci.yaml` — Nx Cloud worker launch templates (`linux-large-polyglot`) and worker templates
- `.github/workflows/ci.yml` — Main CI workflow (`push` to `main`/`dev`, `pull_request`, `workflow_dispatch`)
- `.github/workflows/storybook-gh-pages.yml` — Storybook + Widgetbook + coverage portal deployment
- `tools/ci/storybook-pages.mjs` — Static portal & coverage badge/link generator
- `tools/ci/generate-repo-index.mjs` — Regenerates `REPO_INDEX.md`
- `libs/ui/{atomic-design-interfaces,react-mui,ng-mat,rn-paper,fl-mat,vue-vuetify,svelte-tw}/` — UI contracts & framework libraries
- `libs/utils/{rs-design-tokens,rs-pose-math,py-common,py-nlp,ts-core,ts-formatters,go-core}/` — Stateless polyglot utilities
- `libs/data-access/{proto-contracts,ts-interfaces,py-interfaces,ts-supabase,ts-firebase,ts-reflective-api,py-reflective-nlp}/` — Data-access contracts & concrete providers
- `ROADMAP.md`, `REPO_INDEX.md` — Living roadmap and repo index

## Feature Inventory
Every feature discovered in Survey (`explorer_survey_1`, `explorer_survey_2`, `explorer_survey_3`) is assigned to a milestone:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Nx Cloud `.nx/pipelines/ci.yaml` schema & shell fix | Fix `nx-cloud validate` (`invalid field: workers`), replace `set -euo pipefail` with POSIX-safe shell, fix `PATH` propagation, pin Python 3.12 (`uv python install 3.12`), cache `~/.local/share/uv/python` & `~/.local/bin`, rename `linux-large-polyglot` | M1 | survey_2, survey_3 |
| 2 | GitHub Actions `ci.yml` concurrency & Cargo target isolation | Add `concurrency` guard + `workflow_dispatch` to `.github/workflows/ci.yml`; add distinct `--target-dir` & `outputs` in `rs-design-tokens`/`rs-pose-math` `project.json`; prove uncached `uv` & `cargo` pass on Nx Cloud workers | M1 | survey_2, survey_3 |
| 3 | Track A: UI Molecules Batch 2 (`wave2/track-a-ui-molecules`) | Fetch & rebase onto `dev`; verify/fix 6 molecules (`breadcrumbs`, `date-picker`, `list-item`, `pagination`, `rating`, `stepper`) across `atomic-design-interfaces`, `react-mui`, `ng-mat`, `rn-paper`, `fl-mat`; `>=80%` coverage + interactive stories; PR → `dev` | M2 | survey_1 |
| 4 | Track D: Vue & Svelte UI Libraries (`wave2/track-d-vue-svelte`) | Fetch & rebase onto `dev`; verify/fix `libs/ui/vue-vuetify` and `libs/ui/svelte-tw` (all 11 atoms, `lint`, `typecheck`, `test`, `build-storybook`, `test-storybook`, `>=80%` coverage, interactive stories); PR → `dev` | M3 | survey_1 |
| 5 | Track C: `ts-supabase` provider + Docker emulator | Scaffold & implement `@mono-magic/data-access-ts-supabase` (`IAuthProvider`, `IDataRepository`, `IStorageProvider`, `IRealtimeProvider`), `docker/` local stack, `emulator-up`/`down`/`test-integration`, `>=80%` coverage | M4 | survey_1 |
| 6 | Track C: `ts-firebase` provider + Docker emulator | Scaffold & implement `@mono-magic/data-access-ts-firebase` (Auth, Firestore, Storage, Realtime), `docker/` Firebase Emulator Suite, `emulator-up`/`down`/`test-integration`, `>=80%` coverage | M4 | survey_1 |
| 7 | Track C: `ts-reflective-api` REST + SSE client | Scaffold & implement `@mono-magic/data-access-ts-reflective-api` (`IReflectiveLearningService`, `Result` + `retryWithBackoff`), `>=80%` coverage | M4 | survey_1 |
| 8 | Track C: `py-reflective-nlp` Python `uv` provider | Scaffold & implement `libs/data-access/py-reflective-nlp` (`ContentSourceProvider`, `SemanticGrader`/`FastEmbedSemanticGrader`, `LLMQuestionGenerator`, async SQLModel/SQLite repo), `uv.lock`, `>=80%` coverage | M4 | survey_1 |
| 9 | Track E: Visual regression baselines (`Phase 1.2`) | Track `__vis__/*/__baselines__/` in git for all 5 Storybook UI libs, add `update-snapshots` Nx target, commit initial baseline PNGs | M5 | survey_1 |
| 10 | Track E: Coverage standardization & GitHub Pages (`Phase 1.3`) | Standardize `@vitest/coverage-v8` (80%/90%), add `test-storybook-coverage` & `fl-mat:test-coverage`, extend `tools/ci/storybook-pages.mjs` & `.github/workflows/storybook-gh-pages.yml` | M5 | survey_1 |
| 11 | Track E: `ROADMAP.md` & `REPO_INDEX.md` closure | Tick completed Wave 1 & Wave 2 checkboxes + Phase Summary in `ROADMAP.md`, regenerate `REPO_INDEX.md` via `node tools/ci/generate-repo-index.mjs` | M5 | survey_1 |

## Milestones
Execution is sequential across milestones to honor the global `<= 2 tasks in parallel` constraint and single git working tree cleanly (with verification waves inside each milestone batched at `<= 2` concurrent agents).

| # | Name | Branch → Base | Scope | Dependencies | Status |
|---|------|---------------|-------|-------------|--------|
| M1 | Nx CI `cargo` & `uv` Remediation | `fix/ci-polyglot-workers-v2` → `dev` | Features #1, #2 | none | DONE (`bffc2fd` merged into `dev`, PR #16 CI run `45112350844` SUCCESS, `nx-cloud validate` & 15/15 tasks PASS) |
| M2 | Track A — UI Molecules Batch 2 | `wave2/track-a-ui-molecules` → `dev` | Feature #3 | M1 | DONE (12/12 JS tasks + 3 Storybook builds + 137/137 fl-mat tests PASS, PR #17 merged into `dev`) |
| M3 | Track D — Vue & Svelte Atoms | `wave2/track-d-vue-svelte` → `dev` | Feature #4 | M1 | DONE (all 11 atoms in `vue-vuetify` & `svelte-tw` verified, `lint`/`typecheck`/`test`/`build-storybook` PASS, PR #18 → `dev`, Gate PASS) |
| M4 | Track C — Data-Access Providers | `wave2/track-c-data-access` → `dev` | Features #5, #6, #7, #8 | M1 | DONE (`ts-supabase`, `ts-firebase`, `ts-reflective-api`, `py-reflective-nlp` implemented with >90% coverage, 14/14 tasks PASS, PR #19 → `dev`, Gate PASS) |
| M5 | Track E — Phase 1 Closure & Index | `wave2/track-e-phase1-closure` → `dev` | Features #9, #10, #11 | M1, M2, M3, M4 | DONE (Visual baselines tracked, coverage standardized, README/roadmap updated, PR #20 ready) |

## Interface Contracts
- **UI Contracts**: `@mono-magic/atomic-design-interfaces` (`libs/ui/atomic-design-interfaces`) defines framework-agnostic TypeScript interfaces for all 11 atoms and 11 molecules (Batch 1 + Batch 2). All UI libraries (`react-mui`, `ng-mat`, `rn-paper`, `fl-mat`, `vue-vuetify`, `svelte-tw`) must maintain 1:1 prop/event parity.
- **Data-Access Contracts**:
  - TS: `@mono-magic/data-access-ts-interfaces` (`IAuthProvider`, `IDataRepository<T, ID>`, `IStorageProvider`, `IRealtimeProvider`, `IReflectiveLearningService`, `DataAccessError`, `QuerySpec`, and `run*ContractTests`).
  - Python: `py-data-access-interfaces` (`assert_repository_contract`, protocols, domain models).
- **CI Contract**: `pnpm exec nx-cloud validate --workflow-file=.nx/pipelines/ci.yaml` must pass, and GitHub Actions CI on `dev` PRs must execute `uv` and `cargo` targets on Nx Cloud workers with exit code 0.
