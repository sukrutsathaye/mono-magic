# mono-magic Repository Index

> **Auto-generated** by `node tools/ci/generate-repo-index.mjs`. Do NOT hand-edit.
> **Agents & `/teamwork` workers**: Read this file FIRST instead of running `find`, `ls -R`, or repo-wide `grep`.

## 1. Quick-Start & Guardrails

- **Package Manager / Task Runner**: `pnpm nx <target> <project>` (Node/TS), `uv` (Python >=3.12), `flutter` (>=3.50).
- **Rules & Standards**: [AGENTS.md](AGENTS.md), [GEMINI.md](GEMINI.md), [.gemini/skills/engineering-standards/SKILL.md](.gemini/skills/engineering-standards/SKILL.md), [.gemini/skills/token-budget-guardrails/SKILL.md](.gemini/skills/token-budget-guardrails/SKILL.md).
- **Verification Commands**:
  - Affected only: `pnpm nx affected -t lint typecheck test`
  - Single project: `pnpm nx test <project>` / `pnpm nx lint <project>` / `pnpm nx typecheck <project>`
  - Refresh this index: `node tools/ci/generate-repo-index.mjs` (or `--check` in CI)

## 2. Nx Projects Catalog

| Project | Domain | Path | Tags | Entrypoint | Targets |
| --- | --- | --- | --- | --- | --- |
| `atomic-design-interfaces` | ui | `libs/ui/atomic-design-interfaces` | `scope:ui` `type:interfaces` | `libs/ui/atomic-design-interfaces/src/index.ts` | lint, test, test-ci, typecheck |
| `fl-mat` | ui | `libs/ui/fl-mat` | `scope:ui` `framework:flutter` `ds:material` | `libs/ui/fl-mat/lib/fl_mat.dart` | build-widgetbook, lint, test, widgetbook |
| `ng-mat` | ui | `libs/ui/ng-mat` | `scope:ui` `framework:angular` `ds:material` | `libs/ui/ng-mat/src/index.ts` | build-storybook, lint, storybook, test, test-ci, test-storybook, typecheck |
| `react-mui` | ui | `libs/ui/react-mui` | `scope:ui` `framework:react` `ds:material` | `libs/ui/react-mui/src/index.ts` | build-storybook, lint, storybook, test, test-ci, test-storybook, typecheck |
| `rn-paper` | ui | `libs/ui/rn-paper` | `scope:ui` `framework:expo` `ds:paper` | `libs/ui/rn-paper/src/index.ts` | build-storybook, lint, storybook, test, test-ci, test-storybook, typecheck |
| `data-access-ts-interfaces` | data-access | `libs/data-access/ts-interfaces` | `scope:data-access` `type:interfaces` `lang:ts` | `libs/data-access/ts-interfaces/src/index.ts` | lint, test, test-ci, typecheck |
| `proto-contracts` | data-access | `libs/data-access/proto-contracts` | `scope:data-access` `type:interfaces` `lang:proto` | `libs/data-access/proto-contracts/buf.yaml` | breaking, generate, lint |
| `py-data-access-interfaces` | data-access | `libs/data-access/py-interfaces` | `scope:data-access` `type:interfaces` `lang:py` | `libs/data-access/py-interfaces/pyproject.toml` | lint, test, typecheck |
| `utils-ts-core` | utils | `libs/utils/ts-core` | `scope:utils` `type:util` `lang:ts` | `libs/utils/ts-core/src/index.ts` | lint, test, test-ci, typecheck |
| `mono-magic` | root | `.` | — | `pyproject.toml` | — |

## 3. Module & Component Map

- **`atomic-design-interfaces`** (`libs/ui/atomic-design-interfaces`): **atoms**: badge.interface, button-toggle.interface, button.interface, check-box.interface, chip.interface, index, progress-indicator.interface, radio-button.interface, slide-toggle.interface, slider.interface, text-input.interface, tool-tip.interface | **molecules**: accordion.interface, alert.interface, avatar.interface, card.interface, dialog.interface, form-field.interface, index, menu.interface, search-bar.interface, select.interface, tabs.interface, toast.interface | **organisms**: index | **templates**: index
- **`fl-mat`** (`libs/ui/fl-mat`): **atoms**: badge, button, button_toggle, check_box, chip, progress_indicator, radio_button, slide_toggle, slider, text_input, tool_tip | **molecules**: accordion, alert, avatar, card, dialog, form_field, menu, search_bar, select, tabs, toast | **organisms**: organisms | **templates**: templates
- **`ng-mat`** (`libs/ui/ng-mat`): **atoms**: badge, button, button-toggle, check-box, chip, index, progress-indicator, radio-button, slide-toggle, slider, text-input, tool-tip | **molecules**: accordion, alert, avatar, card, dialog, form-field, index, menu, search-bar, select, tabs, toast | **organisms**: index | **templates**: index
- **`react-mui`** (`libs/ui/react-mui`): **atoms**: badge, button, button-toggle, check-box, chip, index, progress-indicator, radio-button, slide-toggle, slider, text-input, tool-tip | **molecules**: accordion, alert, avatar, card, dialog, form-field, index, menu, search-bar, select, tabs, toast | **organisms**: index | **templates**: index
- **`rn-paper`** (`libs/ui/rn-paper`): **atoms**: badge, button, button-toggle, check-box, chip, index, progress-indicator, radio-button, slide-toggle, slider, text-input, tool-tip | **molecules**: accordion, alert, avatar, card, dialog, form-field, index, menu, search-bar, select, tabs, toast | **organisms**: index | **templates**: index
- **`data-access-ts-interfaces`** (`libs/data-access/ts-interfaces`): modules: auth, common, payments, realtime, repository, storage, testing
- **`proto-contracts`** (`libs/data-access/proto-contracts`): protos: proto/monomagic/auth/v1/auth.proto, proto/monomagic/common/v1/errors.proto, proto/monomagic/common/v1/pagination.proto, proto/monomagic/payments/v1/payments.proto, proto/monomagic/realtime/v1/realtime.proto, proto/monomagic/storage/v1/storage.proto
- **`py-data-access-interfaces`** (`libs/data-access/py-interfaces`): modules: py_data_access_interfaces/auth, py_data_access_interfaces/common, py_data_access_interfaces/payments, py_data_access_interfaces/realtime, py_data_access_interfaces/repository, py_data_access_interfaces/storage, py_data_access_interfaces/testing
- **`utils-ts-core`** (`libs/utils/ts-core`): modules: error, event-bus, result, retry

## 4. Workspace Skills, Agents & Docs

### Skills (`.gemini/skills/`)
- **`coverage-and-quality`** ([SKILL.md](.gemini/skills/coverage-and-quality/SKILL.md)): Runs and configures unit test coverage, Storybook browser test coverage, static analysis (lint), and typechecking across JS/TS (Vitest V8...
- **`data-access-provider`** ([SKILL.md](.gemini/skills/data-access-provider/SKILL.md)): Designs and scaffolds contract-first data-access libraries under libs/data-access/*, starting from Protobuf wire schemas in libs/data-acc...
- **`engineering-standards`** ([SKILL.md](.gemini/skills/engineering-standards/SKILL.md)): Enforces mono-magic's mandatory SOLID architecture, clean code, performance hygiene, documentation gates, unit/E2E testing thresholds, an...
- **`polyglot-ui-component`** ([SKILL.md](.gemini/skills/polyglot-ui-component/SKILL.md)): Designs and implements an Atomic Design UI component (Atom, Molecule, Organism, or Template) with 1:1 contract parity across @mono-magic/...
- **`python-uv-service`** ([SKILL.md](.gemini/skills/python-uv-service/SKILL.md)): Standards and runbook for developing Python >=3.12 libraries (libs/*/py-*) and FastAPI microservices (apps/api-*) inside mono-magic's uv ...
- **`roadmap-tracker`** ([SKILL.md](.gemini/skills/roadmap-tracker/SKILL.md)): Reads, plans, validates, and updates milestone progress in ROADMAP.md. Use when the user asks what to work on next, wants to plan a task ...
- **`storybook-visual-testing`** ([SKILL.md](.gemini/skills/storybook-visual-testing/SKILL.md)): Manages Storybook Vitest browser testing, storybook-addon-vis visual regression baselines (__vis__/*/__baselines__), visual failure diff ...
- **`token-budget-guardrails`** ([SKILL.md](.gemini/skills/token-budget-guardrails/SKILL.md)): Enforces token-budget, rate-limit, and tool-call guardrails for /teamwork, swarm, and parallel subagent tasks. Mandates index-first disco...

### Specialist Agents (`.gemini/agents/`)
- **`data-access-architect`**: [.gemini/agents/data-access-architect.md](.gemini/agents/data-access-architect.md)
- **`polyglot-ui-architect`**: [.gemini/agents/polyglot-ui-architect.md](.gemini/agents/polyglot-ui-architect.md)
- **`qa-visual-coverage-specialist`**: [.gemini/agents/qa-visual-coverage-specialist.md](.gemini/agents/qa-visual-coverage-specialist.md)

### Custom Slash Commands (`.gemini/commands/`): `/add-data-access`, `/add-ui-component`, `/coverage-report`, `/monitor-ci`, `/roadmap`, `/visual-test`

### Roadmaps & Blueprints: [ROADMAP.md](ROADMAP.md) | [PORTFOLIO_IDEAS.md](PORTFOLIO_IDEAS.md) | [docs/projects/reflective-learning.md](docs/projects/reflective-learning.md)
