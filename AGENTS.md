<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax


<!-- nx configuration end-->

# mono-magic AI Orchestration & Workspace Guide

- Read [REPO_INDEX.md](REPO_INDEX.md) **first** before exploring the repo (do not run full-repo `find`/`ls -R`/`grep`). Refresh it with `node tools/ci/generate-repo-index.mjs` after adding/removing projects or exports.
- **Keep All `README.md` Files & Coverage Tables Up to Date ([`repo-updater`](.gemini/skills/repo-updater/SKILL.md))**: Whenever adding or modifying code, components, libraries, or tests across any domain (`libs/ui`, `libs/utils`, `libs/data-access`, `libs/features`, `apps`), update the owning package's `libs/<domain>/<project>/README.md`, run `node tools/ci/sync-readmes-and-coverage.mjs` to update test & coverage tables, and keep root [README.md](README.md) (directory tree, links to individual library READMEs, component counts, and coverage metrics) 100% in sync with [REPO_INDEX.md](REPO_INDEX.md).
- Read [GEMINI.md](GEMINI.md) for the complete architecture rules, strict 4-domain `libs/` boundaries (`libs/ui`, `libs/utils`, `libs/data-access`, `libs/features`, `apps`), `libs/<domain>/<lang>-<name>` naming & tagging, and Storybook visual testing conventions.
- **Mandatory Skills & Specialist Agents**:
  - Core Standards: [`engineering-standards`](.gemini/skills/engineering-standards/SKILL.md), [`token-budget-guardrails`](.gemini/skills/token-budget-guardrails/SKILL.md), [`python-uv-service`](.gemini/skills/python-uv-service/SKILL.md), [`rust-go-systems`](.gemini/skills/rust-go-systems/SKILL.md).
  - Specialist Quality Phases (Required on Every Task):
    1. **Unit Testing**: [`polyglot-unit-testing`](.gemini/skills/polyglot-unit-testing/SKILL.md) (`.gemini/agents/polyglot-unit-test-specialist.md`)
    2. **Interactive State-Complete Stories**: [`interactive-stories`](.gemini/skills/interactive-stories/SKILL.md) (`.gemini/agents/interactive-story-specialist.md`)
    3. **Code & Package README Documentation**: [`code-doc-generator`](.gemini/skills/code-doc-generator/SKILL.md) (`.gemini/agents/code-doc-generator.md`)
    4. **Post-Task Repo, README, Coverage & Roadmap Sync**: [`repo-updater`](.gemini/skills/repo-updater/SKILL.md) (`.gemini/agents/repo-updater.md`)
- **Git, Branching (`main -> dev` Pre-Task Sync & `dev` as AI Integration Branch) & Rate-Limit Discipline (All Agents)**:
  - **Before starting ANY task**, always sync `dev` with the latest `main` (`git fetch origin && git checkout -B dev origin/dev && git merge --no-edit origin/main && git push -u origin dev`) and branch off `dev` (`git checkout -b <type>/<scope>-<slug> dev`, never work directly on `main` or `dev`).
  - **All PRs MUST be opened against `dev`** (`gh pr create --base dev ...`). AI agents may freely merge green, verified PRs into `dev`.
  - **Final `dev` → `main` Merge**: Only the human repository owner reviews and merges `dev` → `main` manually.
  - Continuously commit (Conventional Commits) and push verified checkpoints; orchestrators must monitor rate limits, pause/stop child agents on pressure to continue 1-by-1, and if limits are nearly reached, write `.gemini/handovers/<branch-slug>.md` + push WIP before stopping.
- Check [ROADMAP.md](ROADMAP.md), [PORTFOLIO_IDEAS.md](PORTFOLIO_IDEAS.md), and `docs/projects/` for the chronological phase timeline, flagship apps, and project blueprints.
- See [.gemini/MCP.md](.gemini/MCP.md) for configured local MCP servers (`nx-mcp`, `playwright`, `context7`) and opt-in credentialed MCP instructions.
- Repository-specific skills live in `.gemini/skills/` (registered via `.agents/skills.json`), custom commands live in `.gemini/commands/`, and specialist agent profiles live in `.gemini/agents/`.
