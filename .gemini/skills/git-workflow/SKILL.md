---
name: git-workflow
description: >-
  Mandatory Git branching, micro-atomic commit discipline, Conventional Commits, and GitHub CLI
  (gh) PR/issue workflow for mono-magic. Enforces dev-based branching, function/story/test-level
  atomic commits (prohibiting whole-file mega-commits except for generator scaffolding), hunk-level
  staging, pre-PR commit history audits, and GitHub Project #3 issue linking.
---

# mono-magic Git Workflow & Micro-Atomic Commit Standards

Every human contributor and AI agent in `mono-magic` **MUST** follow this workflow on every task. Clean, micro-atomic commit history makes code reviews effortless, `git bisect` surgical, and reverts safe.

---

## 1. Branching Model & Pre-Task `main -> dev` Sync

1. **Always Sync `dev` with `origin/main` Before Starting**:
   ```bash
   git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
   git fetch origin
   git checkout -B dev origin/dev
   git merge --no-edit origin/main
   git push -u origin dev
   ```
2. **Branch Off `dev` Using Conventional Branch Naming**:
   - Pattern: `<type>/<scope>-<slug>`
   - Allowed `<type>` prefixes: `feat`, `fix`, `refactor`, `test`, `docs`, `perf`, `build`, `ci`, `chore`.
   - Examples:
     - `feat/react-mui-magic-navbar`
     - `fix/rs-pose-math-remove-expect`
     - `test/ts-interfaces-realtime-contract`
     - `chore/skills-git-workflow`
   - **Never** commit directly to `main` or `dev`.
3. **Pull Request & Merge Rules**:
   - **All PRs MUST target `--base dev`**: `gh pr create --base dev ...`
   - AI agents may merge green, verified PRs into `dev`.
   - **Final `dev -> main` merge** is strictly reserved for the human repository owner after review.
   - Prefer `gh pr merge --rebase` or `--merge` when preserving a clean sequence of micro-atomic commits into `dev`; use `--squash` only for single-concern, single-task PRs.

---

## 2. Micro-Atomic Commit Discipline (Mandatory)

### The Golden Rule
Every commit MUST represent **one single logical unit of change** — broken down to the level of:
- **One function, method, hook, or helper** (e.g., adding a single helper function or fixing one bug in a method),
- **One interface, type contract, or Protobuf message**,
- **One Storybook story / Widgetbook use-case** (or one closely related story category),
- **One unit test case or focused `describe` block**,
- **One small, cohesive collection of lines** serving a single purpose,

paired with a clear, meaningful Conventional Commit message explaining **what** and **why**.

### Strictly Prohibited Anti-Patterns
- **No Whole-File Mega-Commits**: Do NOT hand-author an entire multi-function file (or multiple files across implementation + tests + stories + docs) and commit it all in one `feat(ui): implement component` commit.
- **No Mixed Concerns**: Never combine implementation code + unit tests + Storybook stories + README updates + unrelated formatting/lint fixes in the same commit.
- **No Vague Messages**: Never write `chore: updates`, `fix: stuff`, or `feat: wip`.

### Sole Permitted Whole-File / Multi-File Exception: Generators & Automated Codegen
Whole-file or multi-file commits are **ONLY** acceptable when files are generated automatically by an official tool:
- Nx generators (`pnpm nx g ...`)
- Protobuf codegen (`pnpm nx generate proto-contracts`, `buf generate`)
- Language/framework scaffolding (`cargo init`, `flutter create`, `uv init`)
- Automated visual regression baselines (`pnpm nx test-storybook <project> -- -u`)
- Automated index/README sync scripts (`node tools/ci/generate-repo-index.mjs`, `node tools/ci/sync-readmes-and-coverage.mjs`)

**Mandatory Isolation Rule for Generators**:
- Commit generated boilerplate in its **own dedicated commit** (`chore(<scope>): scaffold <name> via nx generator`) **immediately** before making any manual edits, so subsequent atomic commits show clean, reviewable hand-authored diffs.

### How to Author Micro-Atomic Commits

#### Workflow A — Incremental Authoring (Recommended for AI Agents & Humans)
Build bottom-up and commit immediately after each logical unit instead of waiting until the end of the task:
1. Define the contract/types → `git commit -m "feat(atomic-design-interfaces): define IMagicNavbarProps"`
2. Add helper/hook/layout shell → `git commit -m "feat(react-mui): add MagicNavbar layout shell and brand slot"`
3. Add next cohesive behavior (e.g., search & actions) → `git commit -m "feat(react-mui): wire MagicSearchBar and action badges into MagicNavbar"`
4. Add barrel export → `git commit -m "feat(react-mui): export MagicNavbar from organisms index"`
5. Add unit test block 1 → `git commit -m "test(react-mui): add MagicNavbar rendering and brand slot tests"`
6. Add unit test block 2 → `git commit -m "test(react-mui): add MagicNavbar menu interaction and a11y tests"`
7. Add story group 1 → `git commit -m "docs(react-mui): add Default and Variants stories for MagicNavbar"`
8. Add story group 2 → `git commit -m "docs(react-mui): add DarkTheme and play interaction stories for MagicNavbar"`
9. Commit generated visual baselines → `git commit -m "test(react-mui): add MagicNavbar visual regression baselines"`

> [!TIP]
> Order commits bottom-up (types → helpers → implementation → exports → tests → stories) so every commit in the branch compiles cleanly.

#### Workflow B — Splitting Existing Unstaged Changes (Hunk-Level Staging)
If multiple logical edits already exist in a file:
- **Interactive (Human)**:
  ```bash
  git add -p <file>          # Stage individual hunks (use 's' to split, 'e' to edit lines)
  git diff --cached          # Verify the staged diff is one atomic unit
  git commit -m "<type>(<scope>): <summary>"
  ```
- **Non-Interactive (AI Agents without TTY)**:
  Never fall back to `git add <whole-file>` when a file contains multiple logical changes! Instead:
  1. Write/apply one logical unit at a time and commit immediately, **OR**
  2. Inspect `git diff <file>`, extract a single logical hunk into a minimal unified patch, stage it with `git apply --cached`, verify with `git diff --cached`, and commit.

---

## 3. Conventional Commit Format

```text
<type>(<scope>): <imperative summary in <=72 chars>

[optional body explaining WHY, constraints, or trade-offs]

[optional footer: Refs #96 / Closes #96]
```

| Type | When to Use |
| --- | --- |
| `feat` | New user-facing or library functionality (a function, prop, component slot, endpoint) |
| `fix` | Bug fix or behavioral correction |
| `refactor` | Structural code change with no external behavior change |
| `test` | Adding or updating unit, contract, integration, E2E tests, or visual baselines |
| `docs` | Stories, TSDoc/docstrings, READMEs, roadmaps, or skill/workflow docs |
| `perf` | Measurable performance optimization |
| `style` | Pure formatting / lint-only changes (never mixed with logic) |
| `build` / `ci` | Build system, Nx targets, dependencies, GitHub Actions, CI scripts |
| `chore` | Generator scaffolding, repo index sync, tooling maintenance |

- **`<scope>`** MUST name the owning Nx project or domain (e.g., `react-mui`, `rs-pose-math`, `ts-interfaces`, `skills`, `ci`, `repo`).

---

## 4. GitHub CLI (`gh`) & Agile Issue Linking

- **Link Every PR to Its Agile Issue**: Include `Closes #<issue>` (for completing a task) or `Part of #<issue>` (for partial progress on an Epic/Wave) in the PR body so GitHub Issues and Project #3 stay synchronized.
- **Standard `gh` Commands**:
  ```bash
  # Inspect current sprint issues
  gh issue list -R sukrutsathaye/mono-magic --state open --label task --limit 30

  # Open PR targeting dev
  gh pr create --base dev --head <branch> --title "<type>(<scope>): <summary>" --body "Closes #<id>\n\n..."

  # Verify CI checks before merging
  gh pr checks <pr-number>

  # Sync local Project #3 board after adding/updating issues
  node tools/ci/sync-github-project.mjs
  ```

---

## 5. Pre-PR Atomic Commit Audit Checklist

Before opening or merging a PR against `dev`, run:
```bash
git log --oneline --stat origin/dev..HEAD
```
Verify every item:
1. Branch was created off up-to-date `dev` (synced with `origin/main`) using `<type>/<scope>-<slug>`.
2. Every commit message strictly follows Conventional Commits (`<type>(<scope>): <summary>`).
3. Every hand-authored commit is **micro-atomic** (function, story, test block, or small cohesive line group) — zero whole-file mega-commits outside isolated generator/codegen commits.
4. No commit mixes unrelated concerns (implementation vs. tests vs. stories vs. docs vs. formatting).
5. `pnpm nx affected -t lint typecheck test` passes, and `REPO_INDEX.md` / README sync checks are clean.
6. PR targets `--base dev` and links the corresponding GitHub Issue (`Closes #<id>` or `Part of #<id>`).
