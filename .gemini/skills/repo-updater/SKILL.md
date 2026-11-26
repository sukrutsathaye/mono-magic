---
name: repo-updater
description: >-
  Synchronizes repository-level documentation and indexes after completing any task:
  regenerates REPO_INDEX.md, syncs per-library and root README.md tables (including
  clickable links to individual library READMEs and live test/coverage metrics),
  updates ROADMAP.md checkboxes and phase status, and updates GEMINI.md/AGENTS.md.
---

# Repository Updater & Post-Task Sync Playbook

Use this skill at the **end of every feature, bugfix, refactor, or roadmap task** before opening or merging a pull request into `dev`.

---

## 1. Mandatory Post-Task Synchronization Checklist

Every completed task MUST leave repository metadata, documentation, coverage tables, and indexes 100% consistent:

### Step 1 — Refresh & Verify `REPO_INDEX.md`
Run the repository index generator so all Nx projects, targets, UI components, TypeScript/Python/Rust/Go modules, Protobuf contracts, skills, specialist agents, and slash commands are indexed:
```bash
node tools/ci/generate-repo-index.mjs
node tools/ci/generate-repo-index.mjs --check
```

### Step 2 — Sync Per-Library `README.md` Coverage Tables & Root `README.md`
Follow [`project-readme-standard`](../project-readme-standard/SKILL.md) to ensure touched packages include applicable official docs/algorithm/design-system links, local Docker/emulator setup runbooks, and Protobuf codegen commands, then run the automated README & coverage synchronizer:
```bash
node tools/ci/sync-readmes-and-coverage.mjs
node tools/ci/sync-readmes-and-coverage.mjs --check
```
And verify that root [README.md](../../../README.md) reflects:
1. **`Workspace Structure` Directory Tree**: Every directory under `libs/ui/`, `libs/data-access/`, `libs/utils/`, `libs/features/`, `apps/`, `.gemini/`, and `tools/ci/`.
2. **Domain Library Tables (`libs/ui/`, `libs/data-access/`, `libs/utils/`, `libs/features/`)**:
   - Every library row MUST include a direct clickable link to its detailed `[README.md](libs/<domain>/<project>/README.md)`.
   - Every library row MUST display its current **Unit Test Coverage** percentage (from the latest coverage summary).
3. **Implemented Atomic Design Component Counts**:
   - Exact counts and alphabetical lists of Atoms, Molecules, Organisms, and Templates across all UI libraries.

### Step 3 — Update `ROADMAP.md` Milestones & Checklists
Follow [roadmap-tracker](../roadmap-tracker/SKILL.md):
1. Verify all acceptance criteria for completed items (`lint`, `typecheck`, `test` with `>=80%`/`>=90%` coverage, `test-storybook` visual baselines, `build-storybook`/`build-widgetbook`).
2. Mark completed items `- [x]` in Section 3 of [ROADMAP.md](../../../ROADMAP.md).
3. Update the Phase Status table in Section 2 (`Planned` -> `In Progress` -> `Completed`) whenever a phase starts or finishes.

### Step 4 — Sync `AGENTS.md` & `GEMINI.md` (When Governance or Tooling Changes)
Whenever adding or updating workspace skills (`.gemini/skills/`), specialist agents (`.gemini/agents/`), slash commands (`.gemini/commands/`), or architectural conventions:
- Update the catalog in [GEMINI.md](../../../GEMINI.md) Section 3 and [AGENTS.md](../../../AGENTS.md).
- Re-run `node tools/ci/generate-repo-index.mjs` so Section 4 of `REPO_INDEX.md` matches.

---

## 2. Git Integration & PR to `dev`

After `repo-updater` completes and `git status` shows all documentation and indexes updated:
1. Verify drift checks pass:
   ```bash
   node tools/ci/generate-repo-index.mjs --check
   node tools/ci/sync-readmes-and-coverage.mjs --check
   ```
2. Commit documentation & index updates using Conventional Commits:
   ```bash
   git add REPO_INDEX.md README.md ROADMAP.md AGENTS.md GEMINI.md libs/
   git commit -m "docs(repo): sync README coverage tables, REPO_INDEX, and ROADMAP"
   git push -u origin <feature-branch>
   ```
3. Open (or update) the Pull Request targeting **`dev`** (`gh pr create --base dev ...`), verify checks pass, and merge into `dev`. (Never merge `dev` into `main`—that final review and merge belongs exclusively to the repository owner.)
