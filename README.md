# mono-magic

A polyglot monorepo powered by **Nx**, **pnpm**, **uv**, **Flutter**, **Rust (Cargo)**, and **Go**, designed to build reusable **Atomic Design UI libraries**, **contract-first `data-access` wrappers**, and **pure shared `utils`** that accelerate multi-platform applications and polyglot microservices.

- **Roadmap & Milestones**: [ROADMAP.md](ROADMAP.md) · [REPO_INDEX.md](REPO_INDEX.md)
- **Live Component Showcases (GitHub Pages)**: [https://sukrutsathaye.github.io/mono-magic/](https://sukrutsathaye.github.io/mono-magic/)
- **AI Orchestration Rules & Skills**: [GEMINI.md](GEMINI.md) · [AGENTS.md](AGENTS.md) · [`.gemini/`](.gemini/)

## Tech Stack & Tooling

- **Monorepo & Orchestration**: [Nx](https://nx.dev) (`v24.0.6`) with Nx Cloud
- **JavaScript / TypeScript**: [pnpm](https://pnpm.io) (`v12.18.0`) & TypeScript (`~6.0.0`)
- **UI Frameworks & Design Systems**:
  - React 19 (`@mui/material` v9)
  - Angular 22 (`@angular/material` v22)
  - Expo 56 / React Native 0.85 (`react-native-paper` v5 + `react-native-web`)
  - Flutter (`>=3.50`, Material 3 + `Widgetbook` v3)
  - Vue 3 (`vuetify` v3)
  - Svelte 5 (`tailwindcss` v4)
- **Visual & Unit Testing**: [Vitest](https://vitest.dev) (`v4`), `@storybook/addon-vitest`, [`storybook-addon-vis`](https://repobuddy.github.io/visual-testing/), Playwright browser mode, and `flutter_test`
- **Python**: [uv](https://docs.astral.sh/uv/) workspaces (`Python >=3.12`)
- **Systems & Backend**: Rust (Cargo workspace), Go (`go.work` workspace), and Protobuf (`buf`)
- **CI / CD**:
  - `.github/workflows/ci.yml` — Nx affected checks (`lint`, `typecheck`, `test`, `build`) across polyglot toolchains with Nx Cloud self-healing CI
  - `.github/workflows/storybook-gh-pages.yml` — Automated discovery, build, coverage collection, and deployment of all Storybooks and Flutter Widgetbooks to GitHub Pages (on `main` and `dev`)

## Workspace Structure

```text
mono-magic/
├── .agents/                          # Workspace agent skills & skill registry (skills.json)
├── .gemini/                          # Primary AI orchestrator (skills, slash commands, agent profiles, settings)
├── apps/                             # Deployable applications & polyglot microservices
├── libs/                             # Strictly 4 domain directories:
│   ├── data-access/                  # Contract-first Protobuf/TS/Py interfaces & BaaS/domain providers
│   │   ├── proto-contracts/          # Canonical Protobuf (buf) wire schemas & DTOs
│   │   ├── ts-interfaces/            # TypeScript data-access interfaces & contract test suites
│   │   ├── py-interfaces/            # Python async Protocol interfaces & pytest contract suites
│   │   ├── ts-firebase/              # Firebase Auth, Firestore, Realtime & Storage providers
│   │   ├── ts-supabase/              # Supabase Auth, Data, Realtime & Storage providers
│   │   ├── ts-reflective-api/        # Reflective Learning TypeScript API client
│   │   └── py-reflective-nlp/        # Reflective Learning Python NLP & repository providers
│   ├── features/                     # Domain feature modules composing ui, data-access, and utils
│   ├── ui/
│   │   ├── atomic-design-interfaces/ # Framework-agnostic Atomic Design TypeScript contracts
│   │   ├── react-mui/                # React + MUI Material UI library + Storybook
│   │   ├── ng-mat/                   # Angular + Angular Material UI library + Storybook
│   │   ├── rn-paper/                 # Expo/React Native + React Native Paper + Storybook (web preview)
│   │   ├── fl-mat/                   # Flutter Material 3 Dart package + Widgetbook
│   │   ├── vue-vuetify/              # Vue 3 + Vuetify UI library + Storybook
│   │   └── svelte-tw/                # Svelte 5 + Tailwind UI library + Storybook
│   └── utils/                        # Pure, stateless, framework- and vendor-agnostic helper libraries
│       ├── ts-core/                  # Core TS primitives (Result, Error, EventBus, Retry)
│       ├── ts-formatters/            # TS domain-agnostic formatters (currency, datetime, crafting)
│       ├── py-common/                # Python shared settings, logging, and error utilities
│       ├── py-nlp/                   # Python NLP cleaning, keywords, masking, segmentation, similarity
│       ├── rs-pose-math/             # Rust pose & geometry math library
│       ├── rs-design-tokens/         # Rust design-token utilities
│       └── go-core/                  # Go core utility library
├── tools/
│   ├── ci/generate-repo-index.mjs    # REPO_INDEX.md generator & drift checker
│   └── ci/storybook-pages.mjs        # Showcase discovery, build, and GitHub Pages portal assembler
├── AGENTS.md                         # Nx & workspace agent rules
├── GEMINI.md                         # Primary Gemini / Antigravity architectural & workflow instructions
├── REPO_INDEX.md                     # Auto-generated workspace project & module index
├── ROADMAP.md                        # Chronological phase roadmap & domain deliverable checklists
├── Cargo.toml                        # Rust workspace configuration
├── go.work                           # Go workspace configuration
├── nx.json                           # Nx workspace configuration
├── package.json                      # Root Node/pnpm configuration
├── pnpm-workspace.yaml               # pnpm workspace packages
└── pyproject.toml                    # Python / uv workspace configuration
```

## Polyglot UI Libraries (`libs/ui/`)

Each UI library follows **Atomic Design** (`atoms/`, `molecules/`, `organisms/`, `templates/`) backed by framework-agnostic contracts in `@mono-magic/atomic-design-interfaces` (and mirrored in Dart models for Flutter):

| Nx Project | Package / Location | Framework & Design System | Component Catalog | Live Showcase (GitHub Pages) |
| --- | --- | --- | --- | --- |
| `atomic-design-interfaces` | `@mono-magic/atomic-design-interfaces` (`libs/ui/atomic-design-interfaces`) | Framework-agnostic TypeScript | — | — |
| `react-mui` | `@mono-magic/react-mui` (`libs/ui/react-mui`) | React 19 + MUI Material | Storybook (`@storybook/react-vite`) | [react-mui Storybook](https://sukrutsathaye.github.io/mono-magic/react-mui/) |
| `ng-mat` | `@mono-magic/ng-mat` (`libs/ui/ng-mat`) | Angular 22 + Angular Material | Storybook (`@storybook/angular-vite`) | [ng-mat Storybook](https://sukrutsathaye.github.io/mono-magic/ng-mat/) |
| `rn-paper` | `@mono-magic/rn-paper` (`libs/ui/rn-paper`) | Expo / React Native + RN Paper | Storybook (`@storybook/react-vite` + `react-native-web`) | [rn-paper Storybook](https://sukrutsathaye.github.io/mono-magic/rn-paper/) |
| `fl-mat` | `fl_mat` (`libs/ui/fl-mat`) | Flutter Material 3 | Widgetbook (`lib/widgetbook.dart`) | [fl-mat Widgetbook](https://sukrutsathaye.github.io/mono-magic/fl-mat/) |
| `vue-vuetify` | `@mono-magic/vue-vuetify` (`libs/ui/vue-vuetify`) | Vue 3 + Vuetify | Storybook (`@storybook/vue3-vite`) | [vue-vuetify Storybook](https://sukrutsathaye.github.io/mono-magic/vue-vuetify/) |
| `svelte-tw` | `@mono-magic/svelte-tw` (`libs/ui/svelte-tw`) | Svelte 5 + Tailwind | Storybook (`@storybook/svelte-vite`) | [svelte-tw Storybook](https://sukrutsathaye.github.io/mono-magic/svelte-tw/) |

> **Unified GitHub Pages Showcase Portal**: [https://sukrutsathaye.github.io/mono-magic/](https://sukrutsathaye.github.io/mono-magic/)

### Implemented Atomic Design Components

`react-mui`, `ng-mat`, `rn-paper`, and `fl-mat` maintain 1:1 parity across **11 Atoms** and **17 Molecules** (`vue-vuetify` and `svelte-tw` currently implement all **11 Atoms**):

- **Atoms (`11`)**:
  - `Badge`, `Button`, `ButtonToggle`, `CheckBox`, `Chip`, `ProgressIndicator`, `RadioButton`, `SlideToggle`, `Slider`, `TextInput`, `ToolTip`
- **Molecules (`17`)**:
  - `Accordion`, `Alert`, `Avatar`, `Breadcrumbs`, `Card`, `DatePicker`, `Dialog`, `FormField`, `ListItem`, `Menu`, `Pagination`, `Rating`, `SearchBar`, `Select`, `Stepper`, `Tabs`, `Toast`
- **Organisms & Templates**: Tier entrypoints ready for higher-order components (see [ROADMAP.md](ROADMAP.md)).

## Data-Access Libraries (`libs/data-access/`)

Contract-first data-access layer backed by Protobuf (`buf`) wire schemas, idiomatic TypeScript/Python interfaces with shared Contract Compliance Test Suites, and concrete provider implementations:

| Nx Project | Location | Language / Stack | Role |
| --- | --- | --- | --- |
| `proto-contracts` | `libs/data-access/proto-contracts` | Protobuf (`buf`) | Canonical wire DTOs, errors, pagination, auth, storage, realtime, payments |
| `data-access-ts-interfaces` | `libs/data-access/ts-interfaces` | TypeScript | Provider interfaces + shared contract compliance test suites |
| `py-data-access-interfaces` | `libs/data-access/py-interfaces` | Python (`uv`) | Async `Protocol` interfaces + shared pytest contract suites |
| `data-access-ts-firebase` | `libs/data-access/ts-firebase` | TypeScript | Firebase Auth, Firestore, Realtime, Storage providers + Docker emulator suite |
| `data-access-ts-supabase` | `libs/data-access/ts-supabase` | TypeScript | Supabase Auth, Data, Realtime, Storage providers + Docker emulator suite |
| `data-access-ts-reflective-api` | `libs/data-access/ts-reflective-api` | TypeScript | Reflective Learning API client + in-memory transport |
| `py-reflective-nlp` | `libs/data-access/py-reflective-nlp` | Python (`uv`) | Reflective Learning NLP grading, LLM generator, and repository providers |

## Polyglot Utility Libraries (`libs/utils/`)

Pure, stateless, framework- and vendor-agnostic utilities:

| Nx Project | Location | Language | Capabilities |
| --- | --- | --- | --- |
| `utils-ts-core` | `libs/utils/ts-core` | TypeScript | `Result`, typed errors, event bus, retry helpers |
| `utils-ts-formatters` | `libs/utils/ts-formatters` | TypeScript | Currency, datetime, and crafting formatters |
| `py-utils-common` | `libs/utils/py-common` | Python (`uv`) | Shared settings, structured logging, typed errors |
| `py-utils-nlp` | `libs/utils/py-nlp` | Python (`uv`) | Text cleaning, keyword extraction, masking, segmentation, similarity |
| `rs-utils-pose-math` | `libs/utils/rs-pose-math` | Rust (`cargo`) | Pose & geometry math primitives |
| `rs-utils-design-tokens` | `libs/utils/rs-design-tokens` | Rust (`cargo`) | Design-token helpers |
| `go-utils-core` | `libs/utils/go-core` | Go (`go.work`) | Core Go utility helpers |

## Getting Started

### Prerequisites

- **Node.js** & **pnpm** (`12.18.0`)
- **Python** (`>=3.12`) & **uv**
- **Flutter SDK** (`>=3.50`, optional if working only on non-Flutter projects)
- **Rust** (`cargo`, `clippy`, `rustfmt`) & **Go** (`>=1.24`, optional if working only on JS/Py/Flutter)

### Install Dependencies

```bash
# Node / TypeScript dependencies
pnpm install

# Python dependencies
uv sync --all-packages
```

### Common Commands

Run tasks through Nx using `pnpm`:

```bash
# List projects in the workspace
pnpm nx show projects

# Run targets on affected projects
pnpm nx affected -t lint typecheck test build

# Run a target on a specific project
pnpm nx run <project>:<target>

# Run unit tests, lint, or typecheck across all UI libraries
pnpm nx run-many -t test -p atomic-design-interfaces,react-mui,ng-mat,rn-paper,fl-mat,vue-vuetify,svelte-tw
pnpm nx run-many -t lint -p atomic-design-interfaces,react-mui,ng-mat,rn-paper,fl-mat,vue-vuetify,svelte-tw
pnpm nx run-many -t typecheck -p atomic-design-interfaces,react-mui,ng-mat,rn-paper,vue-vuetify,svelte-tw
```

### Storybook & Flutter Widgetbook Commands

```bash
# Launch Storybooks locally (http://localhost:4400)
pnpm nx storybook react-mui
pnpm nx storybook ng-mat
pnpm nx storybook rn-paper
pnpm nx storybook vue-vuetify
pnpm nx storybook svelte-tw

# Launch Flutter Widgetbook locally in Chrome
pnpm nx widgetbook fl-mat

# Build static Storybooks
pnpm nx run-many -t build-storybook -p react-mui,ng-mat,rn-paper,vue-vuetify,svelte-tw

# Build static Flutter Widgetbook web bundle (libs/ui/fl-mat/build/web)
pnpm nx build-widgetbook fl-mat

# Discover, build, and assemble the unified GitHub Pages showcase portal (dist/storybook-pages)
node tools/ci/storybook-pages.mjs discover
node tools/ci/storybook-pages.mjs build react-mui
node tools/ci/storybook-pages.mjs assemble
```

### Storybook Interaction & Visual Regression Testing (`storybook-addon-vis`)

Each Storybook library integrates `@storybook/addon-vitest` and `storybook-addon-vis` (`vitest-plugin-vis`) running in headless Chromium via Playwright.

- Snapshots live under `libs/ui/<project>/__vis__/<local|platform>/`:
  - `__baselines__/` — Expected baseline images
  - `__results__/` — Images rendered during the latest test run
  - `__diffs__/` — Pixel/SSIM diff images when a comparison fails
- **Important**: On a first run when `__baselines__/` does not exist yet, running `test-storybook` without `-u` writes only to `__results__/` and fails with a missing baseline error. Additionally, the Storybook Web **Vis** panel intentionally displays `"There is no snapshots for this story"` until a baseline image exists in `__baselines__/`.

```bash
# Create or update visual baseline images (__vis__/local/__baselines__)
pnpm nx test-storybook react-mui -- -u
pnpm nx test-storybook ng-mat -- -u
pnpm nx test-storybook rn-paper -- -u

# Run Storybook interaction & visual regression tests against existing baselines
pnpm nx run-many -t test-storybook -p react-mui,ng-mat,rn-paper
```

## License

[MIT](LICENSE)
