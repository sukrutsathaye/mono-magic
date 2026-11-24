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

### B. Bounded Fan-Out (Max 6 Concurrent Agents), Zero Explorer Swarms & Single-Reviewer Gate
- **Maximum Concurrent Agents**: **Up to 6 agents at the same time** across `/teamwork` waves.
  - This enables 1:1 parallel sharding across all 6 UI libraries (`react-mui`, `ng-mat`, `rn-paper`, `fl-mat`, `vue-vuetify`, `svelte-tw`) once shared contracts in `atomic-design-interfaces` are landed, or up to 6 disjoint domain workers across `utils`, `data-access`, and `ui`.
- **Zero Survey Explorers**: Because `REPO_INDEX.md` already catalogs every project, entrypoint, component, module, proto, skill, and command, orchestrators MUST NOT spawn "survey explorer" subagents (Wave 1 burned 7 explorer agents and ~1,500 lines of redundant survey handoffs before `REPO_INDEX.md` existed). The coordinator reads `REPO_INDEX.md` + 1–2 contract files directly.
- **Single-Pass Verification (No 5-Agent Verification Swarms)**: Never spawn 5-agent verification waves (1 auditor + 2 reviewers + 2 challengers) per sub-milestone. Rely on deterministic Nx checks (`pnpm nx affected -t lint typecheck test`, `generate-repo-index.mjs --check`, `sync-readmes-and-coverage.mjs --check`) plus **at most 1 combined reviewer pass** per track.
- **No overlapping edits**: Two concurrent workers MUST NEVER edit the same project, barrel file, or `REPO_INDEX.md`.
- **Sequentialize shared contracts**: Always land shared interfaces (`atomic-design-interfaces`, `proto-contracts`, `ts-interfaces`, `py-interfaces`) **before** fanning out concrete provider/UI workers.

### C. Multi-Provider Model Capability & Task Complexity Matrix

`/teamwork` orchestrators and subagents may select from the **7 models available in the workspace subscription** across Google Gemini, Anthropic Claude, and OpenAI (`GPT-OSS`), mapped to 4 task complexity tiers (and to `pro` / `flash` / `flash_lite` / `inherit` when calling `invoke_subagent`):

| Tier | Task Complexity & Specialist Roles | Available Subscription Models | `invoke_subagent` Alias | Ideal Workloads in `mono-magic` |
| --- | --- | --- | --- | --- |
| **Tier 1: Frontier Architecture & Orchestration** | High reasoning, cross-domain architecture, root `/teamwork` orchestration, final track verification | **`Gemini 4 Argon (High)`**<br/>**`Claude Opus 5.5 (Medium)`** | `pro` / `inherit` | Designing contract-first schemas (`atomic-design-interfaces`, `proto-contracts`, `ts-interfaces`, `py-interfaces`), Root Framework Superset + Smart Polymorphic Prop contracts, complex polyglot architecture (Rust FFI/WASM, Go concurrency, FastAPI `lifespan`), and final track Victory Audits. |
| **Tier 2: Complex Feature, UI & Data-Access Implementation** | Multi-file component & adapter engineering, intricate state/form integration, interactive stories | **`Claude Sonnet 5.5 (Medium)`**<br/>**`Gemini 4 Neon (Medium)`** | `pro` / `inherit` | Implementing Core/Domain Organisms & Molecules (`ui-react-mui`, `ui-ng-mat`, `ui-rn-paper`, `ui-fl-mat`, `ui-vue-vuetify`, `ui-svelte-tw`), concrete data-access providers (`ts-firebase`, `ts-supabase`, `py-reflective-nlp`), and 7-Category State Matrix stories with `play` tests (`interactive-stories`). |
| **Tier 3: High-Throughput Parallel Implementation & Unit Testing** | Pattern-guided parallel execution, algorithmic utils, exhaustive unit & compliance test suites | **`Gemini 4 Hydrogen (Medium)`**<br/>**`GPT-OSS 120B (Medium)`** | `flash` | Parallel 6-way UI component sharding once a contract & reference component exist, pure stateless utilities (`libs/utils/{ts-*,py-*,rs-*,go-*}`), comprehensive unit/contract compliance test suites (`polyglot-unit-testing`), and cross-provider load balancing. |
| **Tier 4: Fast Mechanical Tasks, Docs & Repo Sync** | Low-latency, deterministic edits, inline documentation, index/coverage sync, targeted verification | **`Gemini 3.8 Flash (Medium)`** | `flash` / `flash_lite` | Generating inline docstrings & package `README.md` catalogs (`code-doc-generator`), running `generate-repo-index.mjs` & `sync-readmes-and-coverage.mjs` (`repo-updater`), mechanical lint/typecheck fixes, and single-project verification runs. |

#### Multi-Provider Quota Balancing Rule
- Never funnel all 6 concurrent workers through a single Tier 1 frontier model.
- Mix providers and tiers across parallel workers (e.g., `Gemini 4 Argon` or `Claude Opus 5.5` for the orchestrator, `Claude Sonnet 5.5` + `Gemini 4 Neon` for complex tracks, `Gemini 4 Hydrogen` + `GPT-OSS 120B` for parallel UI/utils/testing shards, and `Gemini 3.8 Flash` for docs and repo sync) so no single model family's token bucket is exhausted prematurely.

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

## 4. Git Branching (`main -> dev`), Token-Consumption Monitoring, Track Prioritization & Handover Protocol

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
4. **Periodic Token-Consumption Checks & Priority-Ordered Track Gating (1–2 Tracks When Tight)**:
   - **Pre-Wave & Inter-Wave Token Audit**: Before launching any wave—and at the end of every sub-wave or track—the `/teamwork` orchestrator MUST check token consumption, cumulative tool-call volume, and quota headroom across active providers.
   - **Prioritize 1–2 Tracks When Full Wave Would Exceed Token Limits**:
     - If executing all tracks in the current wave would risk exceeding token or quota limits, the orchestrator MUST **not** launch all tracks at once. Instead, select and execute **only the top 1–2 tracks** according to this strict priority order:
       1. **`Priority 1 (Foundational Contracts)`**: Shared interfaces & wire schemas (`atomic-design-interfaces`, `proto-contracts`, `ts-interfaces`, `py-interfaces`).
       2. **`Priority 2 (Core Logic & Data-Access)`**: Pure shared utilities (`libs/utils/*`) and concrete data-access providers (`libs/data-access/*`).
       3. **`Priority 3 (UI Component Implementations)`**: Concrete Atomic Design UI libraries (`react-mui`, `ng-mat`, `rn-paper`, `fl-mat`, `vue-vuetify`, `svelte-tw`).
       4. **`Priority 4 (Applications, Showcases & Closure)`**: Feature/app composition (`libs/features/*`, `apps/*`), visual baselines, and portal assembly.
     - Bring the prioritized 1–2 tracks to 100% completion (tests, stories, docs, `repo-updater`), open their PR(s) against `dev`, and **merge them into `dev`** before launching the next track slice.
   - **Dynamic Down-Tiering & Sequential Fallback**:
     - When token consumption crosses ~60% of session budget or upon any `429` / quota warning / latency spike: shift remaining workers to Tier 3 / Tier 4 models (`Gemini 4 Hydrogen`, `GPT-OSS 120B (Medium)`, `Gemini 3.8 Flash`), reduce active concurrency from 6 down to 1–2 sequential workers, and complete the active track cleanly.
5. **Near-Limit Handover & WIP Push**:
   - If usage or token limits are almost reached before all wave tracks finish:
     1. Ensure any finished track is merged into `dev` and stabilize any in-flight branch.
     2. Write a concise handover doc at `.gemini/handovers/<branch-slug>.md` covering: completed tracks (already merged to `dev`), deferred/remaining tracks in priority order, exact modified files, last verification command + outcome, and the exact next command to resume.
     3. Commit remaining WIP + the handover doc (`wip(<scope>): checkpoint <short-desc> and add handover`) and `git push -u origin <branch>` before stopping.

---

## 5. Hard Stop Checklist (Forbidden Actions)

- [ ] Starting a task without first merging `origin/main` into `dev` and branching from `dev`
- [ ] Opening a PR against `main` instead of `dev`, or merging `dev` into `main` without the repository owner
- [ ] Running `find .`, `ls -R`, or `rg` at repo root when `REPO_INDEX.md` answers the question
- [ ] Reading full files >200 lines when only one function/class is needed
- [ ] Spawning >6 concurrent agents, or spawning survey explorer / 5-agent verification swarms
- [ ] Launching all tracks in a wave concurrently when token budget only safely fits 1–2 prioritized tracks
- [ ] Funneling all parallel workers through a single Tier 1 frontier model instead of balancing across the 4-Tier Capability Matrix (`Gemini 4 Argon/Neon/Hydrogen`, `Gemini 3.8 Flash`, `Claude Opus/Sonnet 5.5`, `GPT-OSS 120B`)
- [ ] Running `pnpm nx run-many` across unaffected projects during feature iteration
- [ ] Skipping `polyglot-unit-testing`, `interactive-stories`, `code-doc-generator`, or `repo-updater` before finishing a task
- [ ] Continuing wide parallel fan-out during token/rate-limit pressure instead of prioritizing 1–2 tracks, down-tiering models, or writing a handover + WIP push
