# Handover — Wave 2 Polyglot Expansion & Phase 1 Closure

- **Updated**: 2026-11-23 (after 3rd quota stop during Milestone 5 Iteration 2 / Victory Audit rework)
- **Repo**: `sukrutsathaye/mono-magic`
- **Integration branch**: `dev` (all PRs target `dev`; **never push/merge to `main`** — the owner merges `dev` → `main` manually)
- **Approved plan**: see "Approved Plan (Condensed)" below — every design decision is final, **do not re-interview**.

---

## 0. Ground Rules for the Next Agent

1. Read `AGENTS.md`, `GEMINI.md`, `REPO_INDEX.md` first. Follow `.gemini/skills/{engineering-standards,token-budget-guardrails,python-uv-service}/SKILL.md`.
2. **Quota guardrail (owner request)**: max **2 tasks/workers in parallel** globally (`--parallel=2`). Use lower-tier models (`flash` / `pro`) for simpler/mechanical tasks.
3. Run tasks via `pnpm nx ...`. Commit with Conventional Commits; push checkpoints often.
4. **Do NOT redo Tracks A, B, C, D, M1 CI fixes, or M5 Features #9–#10** — all of them are already implemented, verified, and merged into `dev` (`d05c4fa`). Only the 3 small closure items in §2 remain!

---

## 1. Current State on `dev` (All Merged & Pushed to `origin/dev`)

All 5 Wave 2 tracks + Nx Cloud polyglot CI remediation are merged into `dev` (`d05c4fa`):

| Milestone / Track | Branch | PR | Status | Notes |
| --- | --- | --- | --- | --- |
| **Track B** — Polyglot Utils (3A) | `wave2/track-b-polyglot-utils` | **#14** | ✅ Merged | `py-common`, `py-nlp`, `ts-formatters`, `rs-pose-math`, `rs-design-tokens`, `go-core` |
| **M1** — Nx CI Polyglot Workers (`uv`/`cargo`/`go`) | `fix/ci-polyglot-workers` & `fix/ci-polyglot-workers-v2` | **#15**, **#16** | ✅ Merged | `linux-large-polyglot` validated (`nx-cloud validate` PASS); per-target Cargo `--target-dir` & Python `COVERAGE_FILE` isolation; CI runs on `bffc2fd`, `edf307d`, `a1086d1`, `509b0ad` all **SUCCESS** |
| **M2 / Track A** — UI Molecules Batch 2 (2A) | `wave2/track-a-ui-molecules` | **#17** | ✅ Merged | 6 molecules (`breadcrumbs`, `date-picker`, `list-item`, `pagination`, `rating`, `stepper`) across `atomic-design-interfaces`, `react-mui`, `ng-mat`, `rn-paper`, `fl-mat` (137/137 Flutter tests, 3/3 Storybook builds) |
| **M3 / Track D** — Vue & Svelte Atoms (4B) | `wave2/track-d-vue-svelte` | **#18** | ✅ Merged | All 11 atoms in `libs/ui/vue-vuetify` and `libs/ui/svelte-tw` (`lint`, `typecheck`, `test`, `build-storybook`) |
| **M4 / Track C** — Data-Access Providers (3C) | `wave2/track-c-data-access` | **#19** | ✅ Merged | `ts-supabase` (+ `docker/`), `ts-firebase` (+ `docker/`), `ts-reflective-api`, `py-reflective-nlp` — all passing shared contract suites |
| **M5 / Track E** — Phase 1 Closure & Index | `wave2/track-e-phase1-closure` | **#20** | 🟡 Merged, **3 minor follow-ups** | 537 visual baseline PNGs committed; coverage thresholds (80%/90%) & `storybook-pages.mjs` portal standardized; `REPO_INDEX.md` up to date (22 projects). See §2 for the 3 remaining closure items. |

**Working tree**: Clean on `dev` (no uncommitted WIP code; all merged branches are pushed to `origin`).

---

## 2. Exact Remaining Work (1 Small Closure PR → `dev`)

Create a single branch from `dev` (e.g., `fix/wave2-closure-audit`), resolve these **3 concrete items**, open PR → `dev`, verify green CI, and merge into `dev`:

### Item 1 — Fix `ng-mat:lint` Coverage HTML Conflict (Caught by Victory Audit)
- **Root cause**: Root `eslint.config.mjs` (lines 8–13) only ignores `["**/dist", "**/out-tsc", "**/vitest.config.*.timestamp*"]`. After running Vitest with `--coverage`, generated HTML reports under `libs/ui/ng-mat/test-output/vitest/coverage/**/*.ts.html` are parsed by `@angular-eslint/template-parser` (`files: ["**/*.html"]`), failing `pnpm nx lint ng-mat --skip-nx-cache` with 31 template parser errors.
- **Fix**: Add `"**/test-output/**"` and `"**/coverage/**"` to the `ignores` array in `eslint.config.mjs`.
- **Verify**: Run `pnpm nx test ng-mat --coverage --skip-nx-cache && pnpm nx lint ng-mat --skip-nx-cache`.

### Item 2 — Update `ROADMAP.md` Checklists & Phase Summary (Missed in Commit `2dc060b`)
- **Root cause**: Commit `2dc060b` (`docs(roadmap): ...`) only modified `REPO_INDEX.md` and never touched `ROADMAP.md`.
- **Fix**: Update `ROADMAP.md` to reflect all completed Wave 1 & Wave 2 deliverables:
  - **Phase Summary table (§2, lines 57–65)**:
    - `Phase 1` → `Completed`
    - `Phase 2A` → `Completed`
    - `Phase 3A` → `Completed`
    - `Phase 3B` → `Completed (TS/Py/Proto)`
    - `Phase 3C` → `In Progress`
    - `Phase 4B` → `In Progress`
  - **Checkboxes (`[x]`)**:
    - Phase 1.2 (visual regression baselines tracked + `update-snapshots`)
    - Phase 1.3 (coverage standardization 80%/90%, Storybook/Flutter coverage, GitHub Pages portal)
    - Phase 2A (all 10 Wave 2 Molecule items: Batch 1 + Batch 2 across all 4 UI libs + contracts)
    - Phase 3A (`ts-core`, `ts-formatters`, `py-common`, `py-nlp`, `rs-pose-math`, `rs-design-tokens`, `go-core`)
    - Phase 3B (`proto-contracts`, `ts-interfaces`, `py-interfaces` + contract compliance suites)
    - Phase 3C.1 (`ts-firebase`, `ts-supabase` + Docker emulator suites)
    - Phase 3C.4 (`py-reflective-nlp`, `ts-reflective-api`)
    - Phase 4B (`vue-vuetify`, `svelte-tw` — 11 Atoms complete; Molecules deferred to Wave 3)

### Item 3 — Fix `vue-vuetify:typecheck` Failure on Nx Cloud CI (`dev` Run `45155292787`)
- **Symptom**: On `dev` commit `d05c4fa` (GitHub Actions run `45155292787`, Nx Cloud run `https://cloud.nx.app/runs/NH0s9iZigl`), **59/60 tasks passed** (all Rust/Cargo, Python/`uv`, Go, Flutter, Proto, and TS tasks succeeded!), and only **`vue-vuetify:typecheck`** failed (`https://cloud.nx.app/logs/pOBSxxPzjv`).
- **Context**: `pnpm nx typecheck vue-vuetify --skip-nx-cache` passes locally, which strongly suggests either:
  1. Missing `dependsOn: ["^build"]` on `vue-vuetify:typecheck` in `libs/ui/vue-vuetify/project.json` (on a fresh Nx Cloud worker without prior `atomic-design-interfaces` build output), or
  2. Minor config issue in `libs/ui/vue-vuetify/vite.config.mts` (note: commit `33aa6ac` added `reporter:` alongside existing `reporters:`).
- **Fix**: Inspect `https://cloud.nx.app/logs/pOBSxxPzjv` (or check `libs/ui/vue-vuetify/project.json` + `tsconfig.lib.json` + `vite.config.mts`), fix the root cause, and confirm the PR CI run and subsequent `dev` CI run are **100% green**.

### Optional Housekeeping Before Merging `dev` → `main`
- Check whether root `PROJECT.md` (created by `/teamwork` orchestration) should be removed or archived before the owner merges `dev` → `main`.
- Re-run `node tools/ci/generate-repo-index.mjs --check` to ensure `REPO_INDEX.md` stays in sync.

---

## 3. Final Verification Commands (Run with `--parallel=2`)

```bash
pnpm exec nx-cloud validate --workflow-file=.nx/pipelines/ci.yaml
node tools/ci/generate-repo-index.mjs --check
pnpm nx lint ng-mat --skip-nx-cache
pnpm nx typecheck vue-vuetify --skip-nx-cache
pnpm nx affected -t lint typecheck test build --base=origin/dev --parallel=2
```

---

## 4. Approved Plan (Condensed Decisions)

- **3A language matrix**: Python `py-common`, `py-nlp`; TS `ts-formatters`; Rust `rs-pose-math`, `rs-design-tokens`; Go `go-core`. **All merged.**
- **3C**: `ts-supabase` + `ts-firebase` (each with its own `docker/`), `ts-reflective-api`, `py-reflective-nlp`. **All merged.**
- **4B**: `vue-vuetify` + `svelte-tw`, 11 Atoms now, Molecules in Wave 3. **All merged.**
- **Branching**: one PR per track → `dev`; owner merges `dev` → `main`.
