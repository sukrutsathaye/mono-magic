# mono-magic

A polyglot monorepo powered by **Nx**, **pnpm**, **uv**, and **Flutter**, designed to build reusable **Atomic Design UI libraries**, **contract-first `data-access` wrappers**, and **pure shared `utils`** that accelerate multi-platform applications and polyglot microservices.

- **Roadmap & Milestones**: [ROADMAP.md](ROADMAP.md)
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
- **Visual & Unit Testing**: [Vitest](https://vitest.dev) (`v4`), `@storybook/addon-vitest`, [`storybook-addon-vis`](https://repobuddy.github.io/visual-testing/), Playwright browser mode, and `flutter_test`
- **Python**: [uv](https://docs.astral.sh/uv/) workspaces (`Python >=3.12`)
- **CI / CD**:
  - `.github/workflows/ci.yml` — Nx affected checks (`lint`, `test`, `build`) with Nx Cloud self-healing CI
  - `.github/workflows/storybook-gh-pages.yml` — Automated discovery, build, and deployment of all Storybooks and Flutter Widgetbooks to GitHub Pages

## Workspace Structure

```text
mono-magic/
├── .agents/                          # Workspace agent skills & skill registry (skills.json)
├── .gemini/                          # Primary AI orchestrator (skills, slash commands, agent profiles, settings)
├── apps/                             # Applications (pnpm: apps/*, uv: apps/api-*)
├── libs/                             # Shared libraries (pnpm: libs/*, uv: libs/py-*)
│   ├── data-access/                  # Contract-first data-access interfaces & BaaS/backend wrappers
│   ├── features/                     # Domain feature modules composing ui, data-access, and utils
│   ├── ui/
│   │   ├── atomic-design-interfaces/ # Framework-agnostic Atomic Design TypeScript contracts
│   │   ├── react-mui/                # React + MUI Material UI library + Storybook
│   │   ├── ng-mat/                   # Angular + Angular Material UI library + Storybook
│   │   ├── rn-paper/                 # Expo/React Native + React Native Paper + Storybook (web preview)
│   │   └── fl-mat/                   # Flutter Material 3 Dart package + Widgetbook
│   └── utils/                        # Pure, stateless, framework- and vendor-agnostic helper libraries
├── tools/
│   └── ci/storybook-pages.mjs        # Showcase discovery, build, and GitHub Pages portal assembler
├── AGENTS.md                         # Nx & workspace agent rules
├── GEMINI.md                         # Primary Gemini / Antigravity architectural & workflow instructions
├── ROADMAP.md                        # Chronological phase roadmap & domain deliverable checklists
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

> **Unified GitHub Pages Showcase Portal**: [https://sukrutsathaye.github.io/mono-magic/](https://sukrutsathaye.github.io/mono-magic/)

### Implemented Atomic Design Components

All 4 UI libraries currently maintain 1:1 parity across **11 Atoms** and **5 Molecules**:

- **Atoms (`11`)**:
  - `Badge` (`MagicBadge` / `MagicBadgeComponent`)
  - `Button` (`MagicButton` / `MagicButtonComponent`)
  - `ButtonToggle` (`MagicButtonToggle` / `MagicButtonToggleComponent`)
  - `CheckBox` (`MagicCheckBox` / `MagicCheckBoxComponent`)
  - `Chip` (`MagicChip` / `MagicChipComponent`)
  - `ProgressIndicator` (`MagicProgressIndicator` / `MagicProgressIndicatorComponent`)
  - `RadioButton` (`MagicRadioButton` / `MagicRadioButtonComponent`)
  - `SlideToggle` (`MagicSlideToggle` / `MagicSlideToggleComponent`)
  - `Slider` (`MagicSlider` / `MagicSliderComponent`)
  - `TextInput` (`MagicTextInput` / `MagicTextInputComponent`)
  - `ToolTip` (`MagicToolTip` / `MagicToolTipComponent`)
- **Molecules (`5`)**:
  - `Card` (`MagicCard` / `MagicCardComponent`)
  - `FormField` (`MagicFormField` / `MagicFormFieldComponent`)
  - `Menu` (`MagicMenu` / `MagicMenuComponent`)
  - `SearchBar` (`MagicSearchBar` / `MagicSearchBarComponent`)
  - `Select` (`MagicSelect` / `MagicSelectComponent`)
- **Organisms & Templates**: Tier entrypoints ready for higher-order components (see [ROADMAP.md](ROADMAP.md) for Wave 2 Molecules, Core Organisms, Domain Organisms, and Templates).

## Getting Started

### Prerequisites

- **Node.js** & **pnpm** (`12.18.0`)
- **Python** (`>=3.12`) & **uv**
- **Flutter SDK** (`>=3.50`, optional if working only on JS/TS projects)

### Install Dependencies

```bash
# Node / TypeScript dependencies
pnpm install

# Python dependencies
uv sync
```

### Common Commands

Run tasks through Nx using `pnpm`:

```bash
# List projects in the workspace
pnpm nx show projects

# Run targets on affected projects
pnpm nx affected -t lint test build

# Run a target on a specific project
pnpm nx run <project>:<target>

# Run unit tests, lint, or typecheck across all UI libraries
pnpm nx run-many -t test -p atomic-design-interfaces,react-mui,ng-mat,rn-paper,fl-mat
pnpm nx run-many -t lint -p atomic-design-interfaces,react-mui,ng-mat,rn-paper,fl-mat
pnpm nx run-many -t typecheck -p atomic-design-interfaces,react-mui,ng-mat,rn-paper
```

### Storybook & Flutter Widgetbook Commands

```bash
# Launch Storybooks locally (http://localhost:4400)
pnpm nx storybook react-mui
pnpm nx storybook ng-mat
pnpm nx storybook rn-paper

# Launch Flutter Widgetbook locally in Chrome
pnpm nx widgetbook fl-mat

# Build static Storybooks (dist/storybook/<project> or <projectRoot>/storybook-static)
pnpm nx run-many -t build-storybook -p react-mui,ng-mat,rn-paper

# Build static Flutter Widgetbook web bundle (libs/ui/fl-mat/build/web)
pnpm nx build-widgetbook fl-mat

# Discover, build, and assemble the unified GitHub Pages showcase portal (dist/storybook-pages)
node tools/ci/storybook-pages.mjs discover
node tools/ci/storybook-pages.mjs build react-mui
node tools/ci/storybook-pages.mjs build ng-mat
node tools/ci/storybook-pages.mjs build rn-paper
node tools/ci/storybook-pages.mjs build fl-mat
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
