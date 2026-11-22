# Model Context Protocol (MCP) Guide

`.gemini/settings.json` configures workspace-wide **zero-secret local stdio MCP servers** that work out-of-the-box for any contributor. Project-specific or credentialed MCP servers are documented below as opt-in user/environment configurations so secrets are never committed to Git.

---

## 1. Local Zero-Secret Stdio MCP Servers (Enabled in `.gemini/settings.json`)

| Server Key | Package / Command | Purpose & When to Use |
| --- | --- | --- |
| `nx-mcp` | `npx nx mcp` | Workspace project graph inspection, Nx target discovery, generator lookup, and official Nx documentation (`nx_docs`). Always prefer `nx-mcp` / `pnpm nx show` before guessing workspace structure. |
| `playwright` | `npx -y @playwright/mcp@latest` | Interactive headless/headed browser automation, DOM & accessibility snapshot inspection, E2E test debugging, and Storybook/Widgetbook visual failure verification. |
| `context7` | `npx -y @upstash/context7-mcp` | Live, version-accurate framework & library documentation lookup (React 19, Angular 22, MUI 9, Flutter 3.50, FastAPI, Pydantic v2, Spring Boot 3, `buf`, `fastembed`). |

---

## 2. Opt-In & Credentialed MCP Servers (Never Commit Secrets)

Enable the servers below only when working on projects that require them, using local CLI authentication or user-scoped settings.

### Supabase MCP
- **Use when**: Building or inspecting `libs/data-access/ts-supabase`, Postgres schemas, RLS policies, migrations, or Supabase Edge Functions.
- **Options**:
  - **Local stdio** (`@supabase/mcp-server-supabase`): requires `SUPABASE_ACCESS_TOKEN` exported in your shell or `.env.local` (add `--read-only` when inspecting production).
    ```json
    {
      "mcpServers": {
        "supabase": {
          "type": "stdio",
          "command": "npx",
          "args": ["-y", "@supabase/mcp-server-supabase@latest", "--project-ref", "<PROJECT_REF>"],
          "env": {
            "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
          }
        }
      }
    }
    ```
  - **Hosted MCP**: `https://mcp.supabase.com/mcp` via OAuth in your personal Gemini/IDE MCP client settings.

### Firebase MCP
- **Use when**: Working on `libs/data-access/ts-firebase`, Firestore rules/indexes, Firebase Auth, Storage, or local Firebase Emulator Suite workflows.
- **Setup**: Authenticate locally with `npx firebase login` (or run against local emulators), then register in your user-level config:
  ```json
  {
    "mcpServers": {
      "firebase": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "firebase-tools@latest", "experimental:mcp"]
      }
    }
  }
  ```

### Storybook MCP (`@storybook/addon-mcp`)
- **Use when**: Introspecting live component stories, args/prop controls, and design-system docs directly from a running Storybook server (`pnpm nx storybook <project>`).
- **Setup**: Install and enable `@storybook/addon-mcp` in the target UI library's `.storybook/main.ts`, then connect your MCP client to the running Storybook MCP endpoint (default local dev port `4400`, e.g., `http://localhost:4400/mcp`).

### GitHub MCP / `gh` CLI
- **Use when**: Inspecting PRs, issues, GitHub Actions CI logs, releases, or cross-repo code references.
- **Setup**: Already connected in Antigravity via the GitHub workspace plugin and authenticated `gh` CLI (`gh pr`, `gh run`, `gh api`). Do not embed GitHub Personal Access Tokens in `.gemini/settings.json`.

---

## 3. Security Rules (Mandatory)

1. **Zero Secrets in Git**: NEVER hardcode API keys, PATs, service-account JSONs, database URLs with passwords, or `SUPABASE_ACCESS_TOKEN` values inside repo-tracked `.gemini/settings.json`, `.codex/config.toml`, or `.claude/settings.json`.
2. **User-Level & Env Overrides**: Put personal tokens or project-scoped MCP entries in `~/.gemini/settings.json` (user scope) or untracked `.env.local` files referencing `${ENV_VAR}` interpolation.
3. **Least Privilege & Read-Only Default**: Prefer emulator endpoints during local development and pass `--read-only` flags whenever attaching an MCP server to shared staging/production environments.
4. **Commit Guard**: Before staging changes, verify `.gemini/settings.json` contains only zero-secret stdio definitions.
