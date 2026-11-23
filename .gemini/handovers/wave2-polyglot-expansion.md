# Handover — Wave 2 Polyglot Expansion & Phase 1 Closure

- **Written**: 2026-11-23 (after the 2nd quota stop of `/teamwork`)
- **Repo**: `sukrutsathaye/mono-magic`
- **Integration branch**: `dev` (all track PRs target `dev`; **never push/merge to `main`** — the owner merges `dev` → `main` manually)
- **Approved plan**: see "Approved Plan (Condensed)" below — every design decision is final, **do not re-interview**.

---

## 0. Ground Rules for the Next Agent

1. Read `AGENTS.md`, `GEMINI.md`, `REPO_INDEX.md` first. Follow `.gemini/skills/{engineering-standards,token-budget-guardrails,python-uv-service}/SKILL.md`.
2. **Quota guardrail (owner request)**: max **2 tasks/workers in parallel** globally. Prefer `flash` for mechanical verification/test/story work.
3. Run tasks via `pnpm nx ...`. Commit with Conventional Commits; push checkpoints often. If quota gets close, update this file and push WIP.
4. Each track: branch from `dev` → verify → PR into `dev` → merge into `dev` once green.

---

## 1. Current State (all pushed to `origin`)

| Branch | Head | Status |
| --- | --- | --- |
| `dev` | `d598744` | Created from `main` (`5110afd`) + **Track B merged (PR #14)** |
| `fix/ci-polyglot-workers` | PR **#15** → `dev` | **CI fix, open** — merge first (see §2) |
| `wave2/track-b-polyglot-utils` | `917d7e8` | ✅ **DONE & merged** into `dev` |
| `wave2/track-a-ui-molecules` | WIP checkpoint | 🟡 Implemented; verification/fixes in progress |
| `wave2/track-d-vue-svelte` | WIP checkpoint | 🟡 Mostly implemented; finish + verify |
| `wave2/track-c-data-access` | = `dev` (`d598744`) | ⚪ Not started (branch only) |
| `wave2/track-e-phase1-closure` | — | ⚪ Not started (runs last) |

Local worktrees used previously (recreate if on a new machine):
`../mono-magic-wt/track-{a,b,c,d}` via `git worktree add ../mono-magic-wt/track-x <branch>`, then `pnpm install` and `uv sync --all-packages`.

---

## 2. CI Failure on `dev` after Track B — Root Cause & Fix (PR #15)

- **Symptom**: CI run `45103716364` on `dev` failed with `uv: not found` and `cargo: not found` for `py-utils-nlp`, `py-utils-common`, `py-data-access-interfaces`, and the `rs-*` crates.
- **Root cause**: `.github/workflows/ci.yml` calls `pnpm nx-cloud start-workers`, so `nx affected` tasks run on **Nx Cloud workers**, not on the GitHub runner. The `setup-uv` / `rust-toolchain` / `setup-go` steps in `ci.yml` only install on the runner. Workers use the `linux-large-flutter` launch template in **`.nx/pipelines/ci.yaml`**, which only installed Node + Flutter (that is why `fl-mat` passed).
- **Fix (PR #15, `fix/ci-polyglot-workers` → `dev`)**: adds two worker `init-steps` to `.nx/pipelines/ci.yaml`:
  1. cache restore for `~/.cache/uv`, `~/.cargo`, `~/.rustup`, `~/go-sdk`;
  2. install uv, Rust stable (+clippy, rustfmt), Go 1.24.3, export `PATH` via `$NX_CLOUD_ENV`, then `uv sync --all-packages`.
- **To do**: watch PR #15 CI. If green, merge into `dev`, then re-run CI on `dev`. If a worker step fails, check the Nx Cloud run logs (link printed in the CI log). Possible follow-ups: Python version (uv should provision `>=3.12` automatically; add `uv python install 3.12` if not) and renaming the template to `linux-large-polyglot` (update `worker-templates.default.workers` too).
- The `setup-uv`/rust/go steps in `ci.yml` can stay (they're needed for anything run on the main job, e.g. `uv sync`).

---

## 3. Remaining Work (Recommended Order, ≤2 in Parallel)

### Pair 1 — Track A + Track D

**Track A — `wave2/track-a-ui-molecules`** (Phase 2A Batch 2)
- Done: `atomic-design-interfaces` contracts (`f92285f`); 6 molecules (`breadcrumbs`, `date-picker`, `list-item`, `pagination`, `rating`, `stepper`) with specs and stories in `react-mui`, `ng-mat`, `rn-paper`, `fl-mat` (+ Widgetbook use-cases). `ng-mat` was last reported as passing (317 tests, 92.2% lines) before the latest fix checkpoint.
- Last WIP commit includes in-progress fixes to `ng-mat` date-picker/pagination/stepper/list-item and `react-mui` rating/stepper. **Re-verify these first.**
- Verify:
  ```bash
  pnpm nx run-many -t lint typecheck test -p atomic-design-interfaces,react-mui,ng-mat,rn-paper
  pnpm nx run-many -t build-storybook -p react-mui,ng-mat,rn-paper
  pnpm nx run-many -t lint test -p fl-mat
  ```
- Acceptance: ≥80% coverage; **extensive, stateful, interactive stories** (controls/actions, `play` tests where supported) for every molecule; 1:1 parity across the 4 libs. Then PR → `dev`.

**Track D — `wave2/track-d-vue-svelte`** (Phase 4B)
- Done: scaffold (`acd114d`) for `libs/ui/vue-vuetify` (Vue 3 + Vuetify 3) and `libs/ui/svelte-tw` (Svelte 5 + Tailwind + Bits UI). Naming rule: `<framework>-<design-system>`.
- `vue-vuetify`: 9/11 atoms with spec + stories. **Missing: `TextInput`, `ToolTip`** (component + spec + stories, and export in `src/index.ts`).
- `svelte-tw`: all 11 `.svelte` atoms. Specs and `*.stories.ts` + `*StoryDemo.svelte` exist for most. **Check and fill gaps** (at least `slider` stories, plus `text-input` and `tool-tip` spec/stories).
- Verify:
  ```bash
  pnpm nx run-many -t lint typecheck test build-storybook -p vue-vuetify,svelte-tw
  ```
- Acceptance: all 11 atoms implement `@mono-magic/atomic-design-interfaces`, ≥80% coverage, interactive stories, Storybook wired with `@storybook/addon-vitest` + `storybook-addon-vis`. Then PR → `dev`.

### Pair 2 — Track C (can start now; it can pair with A or D if a slot is free)

**Track C — `wave2/track-c-data-access`** (Phase 3C; ≥80% coverage; depends only on `type:interfaces` + `scope:utils`)
- `libs/data-access/ts-supabase` (`@mono-magic/data-access-ts-supabase`, tags `scope:data-access`, `type:data-access`, `lang:ts`): implements `IAuthProvider`, `IDataRepository<T, ID>`, `IStorageProvider`, `IRealtimeProvider` with `@supabase/supabase-js`, `DataAccessError` normalization, and `QuerySpec` → PostgREST mapping.
  - Co-located **`libs/data-access/ts-supabase/docker/`**: `docker-compose.yml` (Postgres, GoTrue, PostgREST, Storage, Realtime, gateway) + `init.sql` + `README.md`, with static local keys and no cloud org.
  - Targets: `test` (mocks + `run*ContractTests` from `data-access-ts-interfaces`), `emulator-up`, `emulator-down`, `test-integration` (the same contract suites run against Docker).
- `libs/data-access/ts-firebase` (same tags): Firebase Auth, Firestore repo + query mapping, Cloud Storage, `onSnapshot`/RTDB realtime.
  - Co-located **`libs/data-access/ts-firebase/docker/`**: Firebase Emulator Suite (Auth 9099, Firestore 8080, Storage 9199, RTDB 9000, UI 4000; project `demo-mono-magic`) + `firebase.json` + rules + `README.md`.
  - Same targets: `test`, `emulator-up`, `emulator-down`, `test-integration`.
- `libs/data-access/ts-reflective-api`: typed REST + SSE client implementing `IReflectiveLearningService`, using `utils-ts-core` `Result` + `retryWithBackoff`.
- `libs/data-access/py-reflective-nlp` (uv; uses `py-utils-common`, `py-utils-nlp`, `py-data-access-interfaces`): `ContentSourceProvider` (Wikipedia/httpx, Raw Text/Markdown, PDF/EPUB adapter interface), `SemanticGrader` + `FastEmbedSemanticGrader` (injectable embedding backend), `LLMQuestionGenerator` Protocol, async SQLModel/SQLite repo that passes `assert_repository_contract`. See `docs/projects/reflective-learning.md`.
- Use the `nx-generate` skill for scaffolding. Docker is available in the dev VM; integration tests are optional in CI.

### Final (sequential) — Track E — `wave2/track-e-phase1-closure` (after A, C, D are merged into `dev`)
- Track `__vis__/*/__baselines__/` in git (keep `__results__/` and `__diffs__/` ignored) for `react-mui`, `ng-mat`, `rn-paper`, `vue-vuetify`, `svelte-tw`. Add an `update-snapshots` target (`test-storybook -- -u`) and commit the baselines.
- Standardize coverage: `@vitest/coverage-v8` with reporters `text, html, lcov, json-summary`; thresholds 80% (UI/data-access) and 90% (`libs/utils/*`). Add a `test-storybook-coverage` target and an `fl-mat` `test-coverage` target (`flutter test --coverage`).
- Extend `tools/ci/storybook-pages.mjs` and `.github/workflows/storybook-gh-pages.yml` to publish unit + Storybook coverage reports and badges per project card.
- Tick the `ROADMAP.md` boxes (Wave 1: 2A Batch 1, `utils-ts-core`, 3B; Wave 2: 1.2, 1.3, 2A Batch 2, 3A, 3C, 4B partial) and run `node tools/ci/generate-repo-index.mjs`.
- PR → `dev`.

---

## 4. Approved Plan (Condensed Decisions)

- **3A language matrix**: Python `py-common`, `py-nlp`; TS `ts-formatters`; Rust `rs-pose-math`, `rs-design-tokens` (math- and compute-heavy work goes to Rust; pure crates with FFI/WASM-ready APIs and a CLI emitter for CSS/TS/Dart; `wasm-bindgen`/PyO3 deferred to Phase 4); Go `go-core`. **All merged.**
- Root `Cargo.toml` globs: `libs/utils/rs-*`, `libs/data-access/rs-*`, `libs/features/rs-*`, `apps/api-rs-*`. Root `go.work`.
- **3C**: `ts-supabase` + `ts-firebase` (each with its own `docker/`), `ts-reflective-api`, `py-reflective-nlp`.
- **4B**: `vue-vuetify` + `svelte-tw`, 11 Atoms now, Molecules in Wave 3.
- **Stories**: extensive and interactive for every component.
- **Branching**: one PR per track → `dev`; owner merges `dev` → `main`.

## 5. Track B Delivered (for reference)

`py-common` (98.3% cov), `py-nlp` (98.9%), `ts-formatters` (100%), `rs-pose-math` + `rs-design-tokens` (36 tests), `go-core` (95.8–100%, `-race`). It passed review (r2 APPROVED) and the forensic audit (CLEAN), then merged as PR #14.
