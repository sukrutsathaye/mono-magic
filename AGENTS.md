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
- **Keep `README.md` Up to Date**: Whenever adding or removing libraries or apps across any domain (`libs/ui`, `libs/utils`, `libs/data-access`, `libs/features`, `apps`), update [README.md](README.md) in the same PR so it accurately reflects all workspace libraries, languages, and capabilities (not just `libs/ui`).
- Read [GEMINI.md](GEMINI.md) for the complete architecture rules, strict 4-domain `libs/` boundaries (`libs/ui`, `libs/utils`, `libs/data-access`, `libs/features`, `apps`), `libs/<domain>/<lang>-<name>` naming & tagging, and Storybook visual testing conventions.
- **Mandatory Skills**: Always apply [`engineering-standards`](.gemini/skills/engineering-standards/SKILL.md) across all changes, [`token-budget-guardrails`](.gemini/skills/token-budget-guardrails/SKILL.md) for `/teamwork` and parallel subagents, and [`python-uv-service`](.gemini/skills/python-uv-service/SKILL.md) for Python (`libs/*/py-*`, `apps/api-*`).
- **Git, Branching (`dev` as Integration Branch) & Rate-Limit Discipline (All Agents)**:
  - `dev` is the AI integration branch ("your new `main`"): branch from `dev` (`<type>/<scope>-<slug>`, never work directly on `main`), open PRs against `dev`, and feel free to merge green PRs into `dev` while implementing features. Only the repository owner reviews and merges `dev` → `main` manually.
  - Continuously commit (Conventional Commits) and push verified checkpoints; orchestrators must monitor rate limits, pause/stop child agents on pressure to continue 1-by-1, and if limits are nearly reached, write `.gemini/handovers/<branch-slug>.md` + push WIP before stopping.
- Check [ROADMAP.md](ROADMAP.md), [PORTFOLIO_IDEAS.md](PORTFOLIO_IDEAS.md), and `docs/projects/` for the chronological phase timeline, flagship apps, and project blueprints.
- See [.gemini/MCP.md](.gemini/MCP.md) for configured local MCP servers (`nx-mcp`, `playwright`, `context7`) and opt-in credentialed MCP instructions.
- Repository-specific skills live in `.gemini/skills/` (registered via `.agents/skills.json`), custom commands live in `.gemini/commands/`, and specialist agent profiles live in `.gemini/agents/`.
