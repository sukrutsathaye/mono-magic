# mono-magic Repository Index

> **Auto-generated** by `node tools/ci/generate-repo-index.mjs`. Do NOT hand-edit.
> **Agents & `/teamwork` workers**: Read this file FIRST instead of running `find`, `ls -R`, or repo-wide `grep`.

## 1. Quick-Start & Guardrails

- **Package Manager / Task Runner**: `pnpm nx <target> <project>` (Node/TS), `uv` (Python >=3.12), `flutter` (>=3.50), `cargo` (Rust), `go` (Go >=1.24).
- **Git & Branching (`main -> dev`)**: Always sync `dev` with `origin/main` before starting any task, branch `<type>/<scope>-<slug>` from `dev`, open all PRs against `dev`, and merge verified PRs into `dev` (`dev -> main` is owner-only).
- **Rules & Standards**: [AGENTS.md](AGENTS.md), [GEMINI.md](GEMINI.md), [.gemini/skills/engineering-standards/SKILL.md](.gemini/skills/engineering-standards/SKILL.md), [.gemini/skills/token-budget-guardrails/SKILL.md](.gemini/skills/token-budget-guardrails/SKILL.md).
- **Verification & Post-Task Commands**:
  - Affected only: `pnpm nx affected -t lint typecheck test`
  - Single project: `pnpm nx test <project>` / `pnpm nx lint <project>` / `pnpm nx typecheck <project>`
  - Refresh this index: `node tools/ci/generate-repo-index.mjs` (or `--check` in CI)
  - Sync README coverage tables: `node tools/ci/sync-readmes-and-coverage.mjs` (or `--check` in CI)

## 2. Nx Projects Catalog

| Project | Domain | Path | Tags | Entrypoint | Targets |
| --- | --- | --- | --- | --- | --- |
| `atomic-design-interfaces` | ui | `libs/ui/atomic-design-interfaces` | `scope:ui` `type:interfaces` | `libs/ui/atomic-design-interfaces/src/index.ts` | lint, test, test-ci, typecheck |
| `fl-mat` | ui | `libs/ui/fl-mat` | `scope:ui` `framework:flutter` `ds:material` | `libs/ui/fl-mat/lib/fl_mat.dart` | build-widgetbook, lint, test, test-coverage, widgetbook |
| `ng-mat` | ui | `libs/ui/ng-mat` | `scope:ui` `framework:angular` `ds:material` | `libs/ui/ng-mat/src/index.ts` | build-storybook, lint, storybook, test, test-ci, test-storybook, test-storybook-coverage, typecheck, update-snapshots |
| `proto-ui-contracts` | ui | `libs/ui/proto-ui-contracts` | `scope:ui` `type:interfaces` `lang:proto` | `libs/ui/proto-ui-contracts/buf.yaml` | breaking, generate, lint |
| `react-mui` | ui | `libs/ui/react-mui` | `scope:ui` `framework:react` `ds:material` | `libs/ui/react-mui/src/index.ts` | build-storybook, lint, storybook, test, test-ci, test-storybook, test-storybook-coverage, typecheck, update-snapshots |
| `rn-paper` | ui | `libs/ui/rn-paper` | `scope:ui` `framework:expo` `ds:paper` | `libs/ui/rn-paper/src/index.ts` | build-storybook, lint, storybook, test, test-ci, test-storybook, test-storybook-coverage, typecheck, update-snapshots |
| `svelte-tw` | ui | `libs/ui/svelte-tw` | `scope:ui` `framework:svelte` `ds:tailwind` `lang:ts` | `libs/ui/svelte-tw/src/index.ts` | build-storybook, lint, storybook, test, test-ci, test-storybook, test-storybook-coverage, typecheck, update-snapshots |
| `vue-vuetify` | ui | `libs/ui/vue-vuetify` | `scope:ui` `framework:vue` `ds:material` `lang:ts` | `libs/ui/vue-vuetify/src/index.ts` | build-storybook, lint, storybook, test, test-ci, test-storybook, test-storybook-coverage, typecheck, update-snapshots |
| `data-access-ts-firebase` | data-access | `libs/data-access/ts-firebase` | `scope:data-access` `type:data-access` `lang:ts` | `libs/data-access/ts-firebase/src/index.ts` | emulator-down, emulator-up, lint, test, test-ci, test-integration, typecheck |
| `data-access-ts-interfaces` | data-access | `libs/data-access/ts-interfaces` | `scope:data-access` `type:interfaces` `lang:ts` | `libs/data-access/ts-interfaces/src/index.ts` | lint, test, test-ci, typecheck |
| `data-access-ts-reflective-api` | data-access | `libs/data-access/ts-reflective-api` | `scope:data-access` `type:data-access` `lang:ts` | `libs/data-access/ts-reflective-api/src/index.ts` | lint, test, test-ci, typecheck |
| `data-access-ts-supabase` | data-access | `libs/data-access/ts-supabase` | `scope:data-access` `type:data-access` `lang:ts` | `libs/data-access/ts-supabase/src/index.ts` | emulator-down, emulator-up, lint, test, test-ci, test-integration, typecheck |
| `proto-contracts` | data-access | `libs/data-access/proto-contracts` | `scope:data-access` `type:interfaces` `lang:proto` | `libs/data-access/proto-contracts/pyproject.toml` | breaking, generate, lint |
| `py-data-access-interfaces` | data-access | `libs/data-access/py-interfaces` | `scope:data-access` `type:interfaces` `lang:py` | `libs/data-access/py-interfaces/pyproject.toml` | lint, test, typecheck |
| `py-reflective-nlp` | data-access | `libs/data-access/py-reflective-nlp` | `scope:data-access` `type:data-access` `lang:py` | `libs/data-access/py-reflective-nlp/pyproject.toml` | lint, test, typecheck |
| `go-utils-core` | utils | `libs/utils/go-core` | `scope:utils` `type:util` `lang:go` | `libs/utils/go-core/go.mod` | build, lint, test |
| `py-utils-common` | utils | `libs/utils/py-common` | `scope:utils` `type:util` `lang:py` | `libs/utils/py-common/pyproject.toml` | lint, test, typecheck |
| `py-utils-nlp` | utils | `libs/utils/py-nlp` | `scope:utils` `type:util` `lang:py` | `libs/utils/py-nlp/pyproject.toml` | lint, test, typecheck |
| `rs-utils-design-tokens` | utils | `libs/utils/rs-design-tokens` | `scope:utils` `type:util` `lang:rust` | `libs/utils/rs-design-tokens/src/lib.rs` | build, lint, test |
| `rs-utils-pose-math` | utils | `libs/utils/rs-pose-math` | `scope:utils` `type:util` `lang:rust` | `libs/utils/rs-pose-math/src/lib.rs` | build, lint, test |
| `utils-ts-core` | utils | `libs/utils/ts-core` | `scope:utils` `type:util` `lang:ts` | `libs/utils/ts-core/src/index.ts` | lint, test, test-ci, typecheck |
| `utils-ts-formatters` | utils | `libs/utils/ts-formatters` | `scope:utils` `type:util` `lang:ts` | `libs/utils/ts-formatters/src/index.ts` | lint, test, test-ci, typecheck |
| `mono-magic` | root | `.` | — | `pyproject.toml` | — |

## 3. Module & Component Map

- **`atomic-design-interfaces`** (`libs/ui/atomic-design-interfaces`): **atoms**: badge.interface, button-toggle.interface, button.interface, check-box.interface, chip.interface, index, progress-indicator.interface, radio-button.interface, slide-toggle.interface, slider.interface, text-input.interface, tool-tip.interface | **molecules**: accordion.interface, alert.interface, avatar.interface, breadcrumbs.interface, card.interface, date-picker.interface, dialog.interface, form-field.interface, index, list-item.interface, menu.interface, pagination.interface, rating.interface, search-bar.interface, select.interface, stepper.interface, tabs.interface, toast.interface | **organisms**: index | **templates**: index
- **`fl-mat`** (`libs/ui/fl-mat`): **atoms**: badge, button, button_toggle, check_box, chip, progress_indicator, radio_button, slide_toggle, slider, text_input, tool_tip | **molecules**: accordion, alert, avatar, breadcrumbs, card, date_picker, dialog, form_field, list_item, menu, pagination, rating, search_bar, select, stepper, tabs, toast | **organisms**: organisms | **templates**: templates
- **`ng-mat`** (`libs/ui/ng-mat`): **atoms**: badge, button, button-toggle, check-box, chip, index, progress-indicator, radio-button, slide-toggle, slider, text-input, tool-tip | **molecules**: accordion, alert, avatar, breadcrumbs, card, date-picker, dialog, form-field, index, list-item, menu, pagination, rating, search-bar, select, stepper, tabs, toast | **organisms**: index | **templates**: index
- **`react-mui`** (`libs/ui/react-mui`): **atoms**: badge, button, button-toggle, check-box, chip, index, progress-indicator, radio-button, slide-toggle, slider, text-input, tool-tip | **molecules**: accordion, alert, avatar, breadcrumbs, card, date-picker, dialog, form-field, index, list-item, menu, pagination, rating, search-bar, select, stepper, tabs, toast | **organisms**: index | **templates**: index
- **`rn-paper`** (`libs/ui/rn-paper`): **atoms**: badge, button, button-toggle, check-box, chip, index, progress-indicator, radio-button, slide-toggle, slider, text-input, tool-tip | **molecules**: accordion, alert, avatar, breadcrumbs, card, date-picker, dialog, form-field, index, list-item, menu, pagination, rating, search-bar, select, stepper, tabs, toast | **organisms**: index | **templates**: index
- **`svelte-tw`** (`libs/ui/svelte-tw`): **atoms**: badge, button, button-toggle, check-box, chip, index, progress-indicator, radio-button, slide-toggle, slider, text-input, tool-tip
- **`vue-vuetify`** (`libs/ui/vue-vuetify`): **atoms**: badge, button, button-toggle, check-box, chip, index, progress-indicator, radio-button, slide-toggle, slider, text-input, tool-tip
- **`data-access-ts-firebase`** (`libs/data-access/ts-firebase`): modules: firebase-auth.provider, firebase-error, firebase-firestore.repository, firebase-memory-client, firebase-query-mapper, firebase-realtime.provider, firebase-storage.provider, firebase-types
- **`data-access-ts-interfaces`** (`libs/data-access/ts-interfaces`): modules: auth, common, payments, proto, realtime, reflective, repository, storage, testing
- **`data-access-ts-reflective-api`** (`libs/data-access/ts-reflective-api`): modules: reflective-api-error, reflective-api-memory-transport, reflective-api-types, reflective-api.client
- **`data-access-ts-supabase`** (`libs/data-access/ts-supabase`): modules: supabase-auth.provider, supabase-data.repository, supabase-error, supabase-memory-client, supabase-query-mapper, supabase-realtime.provider, supabase-storage.provider, supabase-types
- **`proto-contracts`** (`libs/data-access/proto-contracts`): protos: proto/monomagic/ai/v1/ai.proto, proto/monomagic/auth/v1/auth.proto, proto/monomagic/cache/v1/cache.proto, proto/monomagic/common/v1/errors.proto, proto/monomagic/common/v1/pagination.proto, proto/monomagic/payments/v1/payments.proto, proto/monomagic/realtime/v1/realtime.proto, proto/monomagic/reflective/v1/reflective.proto, proto/monomagic/storage/v1/storage.proto
- **`py-data-access-interfaces`** (`libs/data-access/py-interfaces`): modules: py_data_access_interfaces/auth, py_data_access_interfaces/common, py_data_access_interfaces/payments, py_data_access_interfaces/proto, py_data_access_interfaces/realtime, py_data_access_interfaces/repository, py_data_access_interfaces/storage, py_data_access_interfaces/testing
- **`py-reflective-nlp`** (`libs/data-access/py-reflective-nlp`): modules: py_reflective_nlp/grading, py_reflective_nlp/llm_generator, py_reflective_nlp/protocols, py_reflective_nlp/repository, py_reflective_nlp/schemas, py_reflective_nlp/sources
- **`go-utils-core`** (`libs/utils/go-core`): modules: apperror, logging, retry, telemetry
- **`py-utils-common`** (`libs/utils/py-common`): modules: py_utils_common/errors, py_utils_common/logging, py_utils_common/settings
- **`py-utils-nlp`** (`libs/utils/py-nlp`): modules: py_utils_nlp/cleaning, py_utils_nlp/keywords, py_utils_nlp/masking, py_utils_nlp/segmentation, py_utils_nlp/similarity
- **`rs-utils-design-tokens`** (`libs/utils/rs-design-tokens`): modules: cli, color, emit, main, wcag
- **`rs-utils-pose-math`** (`libs/utils/rs-pose-math`): modules: angle, filter, pose, similarity, vector
- **`utils-ts-core`** (`libs/utils/ts-core`): modules: error, event-bus, result, retry
- **`utils-ts-formatters`** (`libs/utils/ts-formatters`): modules: crafting, currency, datetime

## 4. Workspace Skills, Agents & Docs

### Skills (`.gemini/skills/`)
- **`code-doc-generator`** ([SKILL.md](.gemini/skills/code-doc-generator/SKILL.md)): Generates and audits thorough inline code documentation (TSDoc/JSDoc, Google-style Python docstrings, Dartdoc, Rustdoc, Godoc, Protobuf c...
- **`coverage-and-quality`** ([SKILL.md](.gemini/skills/coverage-and-quality/SKILL.md)): Runs and configures unit test coverage, Storybook browser test coverage, static analysis (lint), and typechecking across JS/TS (Vitest V8...
- **`data-access-provider`** ([SKILL.md](.gemini/skills/data-access-provider/SKILL.md)): Designs and scaffolds contract-first data-access libraries under libs/data-access/*, starting from Protobuf wire schemas in libs/data-acc...
- **`engineering-standards`** ([SKILL.md](.gemini/skills/engineering-standards/SKILL.md)): Enforces mono-magic's mandatory SOLID architecture, clean code, performance hygiene, documentation gates, unit/E2E testing thresholds, an...
- **`grill-me`** ([SKILL.md](.gemini/skills/grill-me/SKILL.md)): Deep, structured architectural interview skill. Walks systematically through every branch of the design tree (problem/scope, domain bound...
- **`interactive-stories`** ([SKILL.md](.gemini/skills/interactive-stories/SKILL.md)): Designs and implements comprehensive, state-complete interactive Storybook stories (react-mui, ng-mat, rn-paper, vue-vuetify, svelte-tw) ...
- **`polyglot-ui-component`** ([SKILL.md](.gemini/skills/polyglot-ui-component/SKILL.md)): Designs and implements an Atomic Design UI component (Atom, Molecule, Organism, or Template) with 1:1 contract parity across @mono-magic/...
- **`polyglot-unit-testing`** ([SKILL.md](.gemini/skills/polyglot-unit-testing/SKILL.md)): Writes, audits, and executes comprehensive unit and contract compliance tests across TypeScript/JavaScript (Vitest V8 for Node, React 19,...
- **`project-readme-standard`** ([SKILL.md](.gemini/skills/project-readme-standard/SKILL.md)): Authors and audits project-level README.md files under libs/<domain>/<project>/ and apps/<app>/ with applicability-scoped sections: Offic...
- **`python-uv-service`** ([SKILL.md](.gemini/skills/python-uv-service/SKILL.md)): Standards and runbook for developing Python >=3.12 libraries (libs/*/py-*) and FastAPI microservices (apps/api-*) inside mono-magic's uv ...
- **`repo-updater`** ([SKILL.md](.gemini/skills/repo-updater/SKILL.md)): Synchronizes repository-level documentation and indexes after completing any task: regenerates REPO_INDEX.md, syncs per-library and root ...
- **`roadmap-tracker`** ([SKILL.md](.gemini/skills/roadmap-tracker/SKILL.md)): Reads, plans, validates, and updates milestone progress in ROADMAP.md. Use when the user asks what to work on next, wants to plan a task ...
- **`rust-go-systems`** ([SKILL.md](.gemini/skills/rust-go-systems/SKILL.md)): Standards and runbook for developing Rust crates (libs/*/rs-*, apps/*) and Go modules (libs/*/go-*, apps/*) inside mono-magic's Cargo and...
- **`storybook-visual-testing`** ([SKILL.md](.gemini/skills/storybook-visual-testing/SKILL.md)): Manages Storybook Vitest browser testing, storybook-addon-vis visual regression baselines (__vis__/*/__baselines__), visual failure diff ...
- **`token-budget-guardrails`** ([SKILL.md](.gemini/skills/token-budget-guardrails/SKILL.md)): Enforces token-budget, rate-limit, and tool-call guardrails for /teamwork, swarm, and parallel subagent tasks. Mandates index-first disco...
- **`ui-fl-mat`** ([SKILL.md](.gemini/skills/ui-fl-mat/SKILL.md)): Designs and implements a Flutter >=3.50 Material 3 Atomic Design widget in libs/ui/fl-mat following the Root Framework Superset + Smart P...
- **`ui-ng-mat`** ([SKILL.md](.gemini/skills/ui-ng-mat/SKILL.md)): Designs and implements an Angular 22 + Angular Material v22 Atomic Design component in libs/ui/ng-mat following the Root Framework Supers...
- **`ui-react-mui`** ([SKILL.md](.gemini/skills/ui-react-mui/SKILL.md)): Designs and implements a React 19 + MUI v9 (@mui/material) Atomic Design component in libs/ui/react-mui following the Root Framework Supe...
- **`ui-rn-paper`** ([SKILL.md](.gemini/skills/ui-rn-paper/SKILL.md)): Designs and implements an Expo 56 / React Native 0.85 + React Native Paper v5 Atomic Design component in libs/ui/rn-paper following the R...
- **`ui-svelte-tw`** ([SKILL.md](.gemini/skills/ui-svelte-tw/SKILL.md)): Designs and implements a Svelte 5 (runes) + Tailwind CSS v4 + Bits UI Atomic Design component in libs/ui/svelte-tw following the Root Fra...
- **`ui-vue-vuetify`** ([SKILL.md](.gemini/skills/ui-vue-vuetify/SKILL.md)): Designs and implements a Vue 3.5 + Vuetify 3.12 Atomic Design SFC component in libs/ui/vue-vuetify following the Root Framework Superset ...

### Specialist Agents (`.gemini/agents/`)
- **`code-doc-generator`**: [.gemini/agents/code-doc-generator.md](.gemini/agents/code-doc-generator.md)
- **`data-access-architect`**: [.gemini/agents/data-access-architect.md](.gemini/agents/data-access-architect.md)
- **`interactive-story-specialist`**: [.gemini/agents/interactive-story-specialist.md](.gemini/agents/interactive-story-specialist.md)
- **`polyglot-ui-architect`**: [.gemini/agents/polyglot-ui-architect.md](.gemini/agents/polyglot-ui-architect.md)
- **`polyglot-unit-test-specialist`**: [.gemini/agents/polyglot-unit-test-specialist.md](.gemini/agents/polyglot-unit-test-specialist.md)
- **`qa-visual-coverage-specialist`**: [.gemini/agents/qa-visual-coverage-specialist.md](.gemini/agents/qa-visual-coverage-specialist.md)
- **`repo-updater`**: [.gemini/agents/repo-updater.md](.gemini/agents/repo-updater.md)

### Custom Slash Commands (`.gemini/commands/`): `/add-data-access`, `/add-fl-mat-component`, `/add-ng-mat-component`, `/add-polyglot-util`, `/add-react-mui-component`, `/add-rn-paper-component`, `/add-svelte-tw-component`, `/add-ui-component`, `/add-vue-vuetify-component`, `/audit-ui-parity`, `/coverage-report`, `/doc-gen`, `/grill-me`, `/monitor-ci`, `/pre-pr-check`, `/roadmap`, `/unit-test`, `/update-project-readmes`, `/update-repo`, `/visual-test`, `/write-stories`

### Roadmaps & Blueprints: [ROADMAP.md](ROADMAP.md) | [PORTFOLIO_IDEAS.md](PORTFOLIO_IDEAS.md) | [docs/projects/bpmn-claims-studio.md](docs/projects/bpmn-claims-studio.md) | [docs/projects/couples-journal.md](docs/projects/couples-journal.md) | [docs/projects/flow-ui-builder.md](docs/projects/flow-ui-builder.md) | [docs/projects/knitted-showcase.md](docs/projects/knitted-showcase.md) | [docs/projects/ml-rl-data-pipeline.md](docs/projects/ml-rl-data-pipeline.md) | [docs/projects/osm-ev-truck-routing.md](docs/projects/osm-ev-truck-routing.md) | [docs/projects/playwright-qa-explorer.md](docs/projects/playwright-qa-explorer.md) | [docs/projects/quanti-fit.md](docs/projects/quanti-fit.md) | [docs/projects/reflective-learning.md](docs/projects/reflective-learning.md) | [docs/projects/sensor-lidar-controller.md](docs/projects/sensor-lidar-controller.md) | [docs/projects/smarthome-mqtt-hub.md](docs/projects/smarthome-mqtt-hub.md)
