# mono-magic — Gemini & Antigravity Workspace Rules

This repository is a polyglot monorepo powered by **Nx** (`v24.0.6`), **pnpm** (`v12.18.0`), **uv** (`Python >=3.12`), and **Flutter** (`>=3.50`).

`.gemini/` is the primary AI orchestration hub for this repository, paired with `.agents/skills.json` so both **Google Antigravity** and **Gemini CLI** automatically discover all workspace skills, slash commands, and specialist agent profiles.

---

## 1. Core Workspace Rules

1. **Always Run Tasks Through Nx (`pnpm nx ...`)**:
   - Prefix all Nx commands with `pnpm nx` (e.g., `pnpm nx show projects`, `pnpm nx run-many -t test`, `pnpm nx affected -t lint test build`).
   - Do **not** read `project.json` directly to assume a project's full targets—use `pnpm nx show project <project> --json` (see the `nx-workspace` skill).
2. **Actual Nx Project Names**:
   - The UI projects are named `atomic-design-interfaces`, `react-mui`, `ng-mat`, `rn-paper`, and `fl-mat` (do **not** use stale `ui-*` prefixes like `ui-react-mui` or `ui-fl-mat`).
   - Flutter uses **Widgetbook** (`pnpm nx widgetbook fl-mat`, `pnpm nx build-widgetbook fl-mat`), while the JS/TS UI libraries use **Storybook** (`pnpm nx storybook <project>`, `pnpm nx build-storybook <project>`, `pnpm nx test-storybook <project>`).
3. **Strict Domain & Folder Boundaries**:
   - `libs/ui/atomic-design-interfaces` (`@mono-magic/atomic-design-interfaces`, tags: `scope:ui`, `type:interfaces`): Framework-agnostic TypeScript Atomic Design component contracts.
   - `libs/ui/{react-mui,ng-mat,rn-paper,fl-mat}` (`scope:ui`): Concrete framework implementations. Every component added to `atomic-design-interfaces` must maintain 1:1 parity across all 4 UI libraries (and Dart models in `fl-mat`), ordered strictly bottom-up (`Atoms -> Molecules -> Core Organisms -> Domain Organisms -> Templates`).
   - `libs/data-access/*` (`scope:data-access`): Contract-first data providers. Define vendor-agnostic interfaces and abstract base classes in `libs/data-access/data-access-interfaces` (`type:interfaces`) before implementing concrete BaaS or backend wrappers (Firebase, Supabase, NestJS, Spring Boot + Keycloak + PostgreSQL, AWS, GCP, Azure).
   - `libs/utils/*` (`scope:utils`, `type:util`): Pure, stateless, framework- and vendor-agnostic utilities (`core`, `formatters`, `pose-math`, `design-tokens`, `py-common`). Domain contracts do **not** go in `libs/utils/`.
   - `libs/features/*` (`scope:features`): Feature modules composing `ui`, `data-access`, and `utils`.
   - `apps/*`: End-user applications and polyglot microservices (`apps/api-*`).

---

## 2. Storybook Visual Testing (`storybook-addon-vis`)

- `react-mui`, `ng-mat`, and `rn-paper` use `@storybook/addon-vitest` + `storybook-addon-vis` (`vitest-plugin-vis`) with Playwright Chromium.
- Snapshot directories resolve under `libs/ui/<project>/__vis__/<local|platform>/`:
  - `__baselines__/` — Expected baseline images
  - `__results__/` — Latest test run output images
  - `__diffs__/` — Visual diff images on failure
- **First-Run / Missing Baselines**:
  - Running `pnpm nx test-storybook <project>` without `-u` when `__baselines__/` is empty writes only to `__results__/` and fails with a missing baseline error.
  - The Storybook Web **Vis** panel filters out stories that only have a `result` image without a `baseline` or `diff`, displaying `"There is no snapshots for this story"` until baselines exist.
  - Generate or update baselines with:
    ```bash
    pnpm nx test-storybook <project> -- -u
    ```

---

## 3. Repository Skills, Commands & Specialist Agents (`.gemini/`)

### Custom Skills (`.gemini/skills/`)
- **`polyglot-ui-component`** ([.gemini/skills/polyglot-ui-component/SKILL.md](.gemini/skills/polyglot-ui-component/SKILL.md)): End-to-end workflow for adding or updating an Atomic Design component across `atomic-design-interfaces`, `react-mui`, `ng-mat`, `rn-paper`, and `fl-mat`.
- **`storybook-visual-testing`** ([.gemini/skills/storybook-visual-testing/SKILL.md](.gemini/skills/storybook-visual-testing/SKILL.md)): Runbook for `storybook-addon-vis` baselines (`-- -u`), diff triage, and assembling the GitHub Pages showcase portal (`tools/ci/storybook-pages.mjs`).
- **`coverage-and-quality`** ([.gemini/skills/coverage-and-quality/SKILL.md](.gemini/skills/coverage-and-quality/SKILL.md)): Runbook for Unit test coverage (`@vitest/coverage-v8`, `flutter test --coverage`), Storybook browser test coverage, 80% threshold enforcement, and static coverage portal generation.
- **`data-access-provider`** ([.gemini/skills/data-access-provider/SKILL.md](.gemini/skills/data-access-provider/SKILL.md)): Blueprint for designing contract-first `libs/data-access/*` interfaces and provider implementations (Firebase, Supabase, NestJS, Spring Boot + Keycloak + Postgres, Cloud SDKs).
- **`roadmap-tracker`** ([.gemini/skills/roadmap-tracker/SKILL.md](.gemini/skills/roadmap-tracker/SKILL.md)): Workflow for picking up, verifying, and updating milestone checklists in [ROADMAP.md](ROADMAP.md).

### Custom Gemini CLI Slash Commands (`.gemini/commands/`)
- `/add-ui-component` ([.gemini/commands/add-ui-component.toml](.gemini/commands/add-ui-component.toml))
- `/visual-test` ([.gemini/commands/visual-test.toml](.gemini/commands/visual-test.toml))
- `/coverage-report` ([.gemini/commands/coverage-report.toml](.gemini/commands/coverage-report.toml))
- `/add-data-access` ([.gemini/commands/add-data-access.toml](.gemini/commands/add-data-access.toml))
- `/roadmap` ([.gemini/commands/roadmap.toml](.gemini/commands/roadmap.toml))
- `/monitor-ci` ([.gemini/commands/monitor-ci.toml](.gemini/commands/monitor-ci.toml))

### Specialist Agent Profiles (`.gemini/agents/`)
- **Polyglot UI Architect** ([.gemini/agents/polyglot-ui-architect.md](.gemini/agents/polyglot-ui-architect.md))
- **Data-Access & Backend Architect** ([.gemini/agents/data-access-architect.md](.gemini/agents/data-access-architect.md))
- **QA, Visual Regression & Coverage Specialist** ([.gemini/agents/qa-visual-coverage-specialist.md](.gemini/agents/qa-visual-coverage-specialist.md))
