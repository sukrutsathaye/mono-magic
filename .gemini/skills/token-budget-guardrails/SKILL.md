---
name: token-budget-guardrails
description: >-
  Enforces token-budget, rate-limit, and tool-call guardrails for /teamwork,
  swarm, and parallel subagent tasks. Mandates index-first discovery via
  REPO_INDEX.md, scoped searches, bounded parallel fan-out, disjoint file
  ownership, model tiering, and affected-only verification without sacrificing
  engineering quality.
---

# Token Budget & Rate-Limit Guardrails (`/teamwork` & Parallel Agents)

Use this skill as a **mandatory operating framework** for `/teamwork` coordinators, swarm workers, and subagents so parallel work completes cleanly without burning tokens or hitting API rate limits.

---

## 1. Index-First Discovery (Zero Full-Repo Scans)

1. **Read [REPO_INDEX.md](../../../REPO_INDEX.md) FIRST** (1 tool call). It already lists every Nx project, path, tag, entrypoint, target, UI component, proto schema, skill, and doc.
2. **Never run full-repo scans**:
   - **FORBIDDEN**: `find .`, `ls -R`, `tree`, or `rg` / `grep -rn` across `.` or `libs/`.
   - **REQUIRED**: Scope searches to the exact project directory from `REPO_INDEX.md`, e.g., `rg -n "IAuthProvider" libs/data-access/ts-interfaces/src`.
3. **Slice-Read Only**:
   - Never read whole files `>200` lines. Read only the relevant `StartLine`–`EndLine` range (`<=150` lines) around `rg` hits.
   - Never re-read a file you already read in the current turn/session unless it changed.
4. **Refresh the Index Only Once at the End**:
   - If you add/remove an Nx project, UI component, proto, or skill, run `node tools/ci/generate-repo-index.mjs` once after all edits land (never inside parallel workers).

---

## 2. Parallel `/teamwork` & Swarm Framework

### A. Coordinator Pre-Briefing (Read Once, Share Precisely)
- The coordinator reads `REPO_INDEX.md` plus the **1–2** shared contract/interface files (e.g., `atomic-design-interfaces` or `ts-interfaces`) **once**.
- Every worker brief MUST include:
  1. **Exact file paths & symbol names** to reference (so workers do NOT re-discover the repo).
  2. **Disjoint file ownership**: the exact directory/files this worker owns and MUST NOT edit outside.
  3. **Exact verification command(s)** for its owned project.
  4. **Explicit "do not scan" rule**: tell workers to read only their assigned files + `REPO_INDEX.md` if needed.

### B. Bounded Fan-Out, Zero Explorer Swarms & Single-Reviewer Gate
- **Zero Survey Explorers**: Because `REPO_INDEX.md` already catalogs every project, entrypoint, component, module, proto, skill, and command, orchestrators MUST NOT spawn "survey explorer" subagents (Wave 1 burned 7 explorer agents and ~1,500 lines of redundant survey handoffs before `REPO_INDEX.md` existed). The coordinator reads `REPO_INDEX.md` + 1–2 contract files directly.
- **Default Worker Cap**: **Max 3–4 parallel workers** per wave.
  - *Allowed exception*: 1:1 sharding across the independent UI libraries (`react-mui`, `ng-mat`, `rn-paper`, `fl-mat`, `vue-vuetify`, `svelte-tw`) when implementing an already-specified contract, using each library's dedicated skill (`ui-react-mui`, `ui-ng-mat`, `ui-rn-paper`, `ui-fl-mat`, `ui-vue-vuetify`, `ui-svelte-tw`).
- **Single-Pass Verification (No 5-Agent Verification Swarms)**: Never spawn 5-agent verification waves (1 auditor + 2 reviewers + 2 challengers) per sub-milestone. Rely on deterministic Nx checks (`pnpm nx affected -t lint typecheck test`, `generate-repo-index.mjs --check`, `sync-readmes-and-coverage.mjs --check`) plus **at most 1 combined reviewer pass** per track.
- **No overlapping edits**: Two concurrent workers MUST NEVER edit the same project, barrel file, or `REPO_INDEX.md`.
- **Sequentialize shared contracts**: Always land shared interfaces (`atomic-design-interfaces`, `proto-contracts`, `ts-interfaces`, `py-interfaces`) **before** fanning out concrete provider/UI workers.

### C. Model Tiering
- **`flash` / `flash_lite`**: Use for read-only audits, mechanical refactors, test/Storybook boilerplate, and single-project verification.
- **`inherit` / `pro`**: Reserve for coordinator planning, cross-cutting architecture, complex business logic, and final integration review.

### D. Reactive Waiting & Compact Handoffs
- **Zero polling**: After launching subagents or background commands, **stop calling tools** and wait for the system wakeup. Never poll status in a loop.
- **Compact worker reports**: Return only:
  - Files created/modified (paths only)
  - Public symbols added/updated
  - Exact verification command run + pass/fail/coverage summary
  - Blockers (if any)
  - **Never** paste full file contents, long diffs, or raw build logs into messages.

---

## 3. Tool-Call & Verification Discipline (Quality Without Bloat)

1. **Batch independent tool calls** (e.g., 2–4 `read_file` slices) in a single turn instead of 1-per-turn loops.
2. **Affected-only verification**:
   - Prefer `pnpm nx affected -t lint typecheck test` or targeted `pnpm nx test <project>`.
   - **Never** run `pnpm nx run-many -t test` across the entire monorepo unless explicitly requested for a release/CI gate.
3. **Single-pass test + coverage**:
   - Run `pnpm nx test <project> -- --coverage` once instead of running tests twice (once without coverage, once with).
4. **Preserve full engineering quality**:
   - All [engineering-standards](../engineering-standards/SKILL.md) rules (SOLID, immutability, `Result<T, E>`, strict typing, docstrings, `>=80%` coverage) remain **100% mandatory**. Token efficiency comes from eliminating redundant discovery and duplicate reads—never from skipping tests, types, or lint.

---

## 4. Git Branching (`main -> dev`), Specialist Phases, Continuous Commit/Push & Handover Protocol

1. **Always Sync `dev` with Current `main` Before Starting Any Task**:
   - `dev` is the AI integration branch. **Before starting any task**, configure the full remote fetch refspec (in case the VM was cloned with `--single-branch`), fetch, merge `origin/main` into `dev`, and push `origin/dev`:
     ```bash
     git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
     git fetch origin
     git checkout -B dev origin/dev || git checkout -B dev origin/main
     git merge --no-edit origin/main
     git push -u origin dev
     ```
   - Never commit directly to `main` or `dev`. Immediately branch off `dev`:
     ```bash
     git checkout -b <type>/<scope>-<short-slug> dev
     ```
     (e.g., `feat/ui-navbar-organism`, `fix/ts-interfaces-auth`, `chore/ci-repo-index`, `docs/roadmap-sync`).
2. **Mandatory Specialist Phases Before Task Completion**:
   - Every task or `/teamwork` wave MUST execute the applicable specialist workflows before opening/merging a PR:
     1. **Unit Tests** ([`polyglot-unit-testing`](../polyglot-unit-testing/SKILL.md) / `polyglot-unit-test-specialist`): `>=90%` coverage for `libs/utils/*`, `>=80%` for all other domains.
     2. **Interactive Stories** ([`interactive-stories`](../interactive-stories/SKILL.md) / `interactive-story-specialist`, for UI tasks): Canonical 7-Category Component State Matrix + `play` tests + visual baselines (`-- -u`).
     3. **Code & Package Documentation** ([`code-doc-generator`](../code-doc-generator/SKILL.md) / `code-doc-generator`): Inline docstrings on every symbol + updated `libs/<domain>/<project>/README.md`.
     4. **Post-Task Repository Sync** ([`repo-updater`](../repo-updater/SKILL.md) / `repo-updater`): Run `node tools/ci/generate-repo-index.mjs` and `node tools/ci/sync-readmes-and-coverage.mjs`, and update root `README.md` and `ROADMAP.md`.
3. **Continuous Commits, PRs Against `dev` & Agent Merge Authority**:
   - Commit and push incrementally using **Conventional Commits** (`<type>(<scope>): <imperative summary>`).
   - **All PRs MUST be opened against `dev`**:
     ```bash
     gh pr create --base dev --head <branch> --title "<type>(<scope>): <summary>" --body "..."
     ```
   - **AI agents may freely merge their verified, passing PRs into `dev`** (`gh pr merge --squash --delete-branch`).
   - **Final `dev -> main` Merge**: Reserved **strictly for the human repository owner** after review. Agents must never merge into `main`.
4. **Periodic Rate-Limit Checks & Sequential Fallback**:
   - The `/teamwork` orchestrator MUST periodically check rate-limit / quota headroom between waves and immediately upon any `429`, quota warning, or latency spike.
   - When limits tighten: **pause or stop** excess parallel child agents, halt new parallel fan-outs, and **continue remaining tasks one by one** (sequentially) to preserve quota.
5. **Near-Limit Handover & WIP Push**:
   - If usage or rate limits are almost reached before completion:
     1. Stop launching new tasks and stabilize the current in-flight edit.
     2. Write a concise handover doc at `.gemini/handovers/<branch-slug>.md` covering: active branch, completed vs. remaining tasks, exact modified files, last verification command + outcome, and the exact next step to resume.
     3. Commit remaining WIP + the handover doc (`wip(<scope>): checkpoint <short-desc> and add handover`) and `git push -u origin <branch>` before stopping.

---

## 5. Hard Stop Checklist (Forbidden Actions)

- [ ] Starting a task without first merging `origin/main` into `dev` and branching from `dev`
- [ ] Opening a PR against `main` instead of `dev`, or merging `dev` into `main` without the repository owner
- [ ] Running `find .`, `ls -R`, or `rg` at repo root when `REPO_INDEX.md` answers the question
- [ ] Reading full files >200 lines when only one function/class is needed
- [ ] Spawning >4 parallel workers without disjoint per-project sharding
- [ ] Sending vague worker briefs that force each worker to re-explore the codebase
- [ ] Running `pnpm nx run-many` across unaffected projects during feature iteration
- [ ] Skipping `polyglot-unit-testing`, `interactive-stories`, `code-doc-generator`, or `repo-updater` before finishing a task
- [ ] Continuing parallel fan-out during rate-limit pressure instead of falling back to 1-by-1 execution or writing a handover + WIP push
