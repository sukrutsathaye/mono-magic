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

### B. Bounded Fan-Out & Disjoint Ownership
- **Default cap**: **Max 3–4 parallel workers** per wave.
  - *Allowed exception*: 1:1 sharding across the 4 independent UI libraries (`react-mui`, `ng-mat`, `rn-paper`, `fl-mat`) when implementing an already-specified contract.
- **No overlapping edits**: Two concurrent workers MUST NEVER edit the same project, barrel file, or `REPO_INDEX.md`.
- **Sequentialize shared contracts**: Always land shared interfaces (`atomic-design-interfaces`, `proto-contracts`, `ts-interfaces`) **before** fanning out concrete provider/UI workers.

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

## 4. Git Branching, Continuous Commit/Push & Handover Protocol

1. **Immediate Meaningful Branching & Grouping**:
   - Before making any edits, check `git branch --show-current`. If on `main` or an unrelated branch, immediately `git checkout -b <type>/<scope>-<short-slug>` (e.g., `feat/ui-tooltip-parity`, `fix/ts-interfaces-auth`, `chore/ci-repo-index`, `docs/roadmap-sync`, `refactor/ts-core-result`).
   - Group cohesive, related changes on one scoped branch; never mix unrelated tasks on the same branch or commit directly to `main`.
2. **Continuous Commits & Pushes (Conventional Commits)**:
   - Commit and push incrementally as each logical slice/milestone passes its targeted checks—do **not** hoard all changes until the end of a long `/teamwork` run.
   - Use **Conventional Commits**: `<type>(<scope>): <imperative summary>` (e.g., `feat(react-mui): add Tooltip atom with a11y tests`), with a brief body when the *why* is non-obvious.
   - Push each checkpoint to the remote feature branch (`git push -u origin <branch>`). In multi-worker runs, workers commit to their assigned workspace/branch and the coordinator lands and pushes cleanly.
3. **Periodic Rate-Limit Checks & Sequential Fallback**:
   - The `/teamwork` orchestrator MUST periodically check rate-limit / quota headroom between waves and immediately upon any `429`, quota warning, or latency spike.
   - When limits tighten: **pause or stop** excess parallel child agents, halt new parallel fan-outs, and **continue remaining tasks one by one** (sequentially) to preserve quota.
4. **Near-Limit Handover & WIP Push**:
   - If usage or rate limits are almost reached before completion:
     1. Stop launching new tasks and stabilize the current in-flight edit.
     2. Write a concise handover doc at `.gemini/handovers/<branch-slug>.md` covering: active branch, completed vs. remaining tasks, exact modified files, last verification command + outcome, and the exact next step to resume.
     3. Commit remaining WIP + the handover doc (`wip(<scope>): checkpoint <short-desc> and add handover`) and `git push -u origin <branch>` before stopping.

---

## 5. Hard Stop Checklist (Forbidden Actions)

- [ ] Running `find .`, `ls -R`, or `rg` at repo root when `REPO_INDEX.md` answers the question
- [ ] Reading full files >200 lines when only one function/class is needed
- [ ] Spawning >4 parallel workers without disjoint per-project sharding
- [ ] Sending vague worker briefs that force each worker to re-explore the codebase
- [ ] Running `pnpm nx run-many` across unaffected projects during feature iteration
- [ ] Pasting full files or verbose logs in subagent/swarm messages
- [ ] Editing directly on `main` or hoarding unpushed work across long multi-agent runs
- [ ] Continuing parallel fan-out during rate-limit pressure instead of falling back to 1-by-1 execution or writing a handover + WIP push
