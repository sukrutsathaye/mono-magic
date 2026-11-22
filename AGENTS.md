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

- Read [GEMINI.md](GEMINI.md) for the complete architecture rules, strict 4-domain `libs/` boundaries (`libs/ui`, `libs/utils`, `libs/data-access`, `libs/features`, `apps`), `libs/<domain>/<lang>-<name>` naming & tagging, and Storybook visual testing conventions.
- **Mandatory Skills**: Always apply [`engineering-standards`](.gemini/skills/engineering-standards/SKILL.md) across all changes and [`python-uv-service`](.gemini/skills/python-uv-service/SKILL.md) for Python (`libs/*/py-*`, `apps/api-*`).
- Check [ROADMAP.md](ROADMAP.md), [PORTFOLIO_IDEAS.md](PORTFOLIO_IDEAS.md), and `docs/projects/` for the chronological phase timeline, flagship apps, and project blueprints.
- See [.gemini/MCP.md](.gemini/MCP.md) for configured local MCP servers (`nx-mcp`, `playwright`, `context7`) and opt-in credentialed MCP instructions.
- Repository-specific skills live in `.gemini/skills/` (registered via `.agents/skills.json`), custom commands live in `.gemini/commands/`, and specialist agent profiles live in `.gemini/agents/`.
