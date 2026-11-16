# mono-magic

A polyglot monorepo powered by **Nx**, **pnpm**, and **uv**.

## Tech Stack & Tooling

- **Monorepo & Orchestration**: [Nx](https://nx.dev) (`v24.0.6`) with Nx Cloud
- **JavaScript / TypeScript**: [pnpm](https://pnpm.io) (`v12.18.0`) & TypeScript (`~6.0.0`)
- **UI Frameworks & Design Systems**: React (`@mui/material`), Angular (`@angular/material`), Expo / React Native (`react-native-paper`), Flutter (`Widgetbook` + Material 3)
- **Python**: [uv](https://docs.astral.sh/uv/) workspaces (`Python >=3.12`)
- **CI**: GitHub Actions (`.github/workflows/ci.yml`) with Nx affected checks and Nx Cloud self-healing CI

## Workspace Structure

```text
mono-magic/
├── apps/                 # Applications (pnpm: apps/*, uv: apps/api-*)
├── libs/                 # Shared libraries (pnpm: libs/*, uv: libs/py-*)
│   ├── data-access/
│   ├── features/
│   ├── ui/
│   │   ├── interfaces/   # Framework-agnostic Atomic Design TypeScript contracts
│   │   ├── react-mui/    # React + MUI Material UI library + Storybook
│   │   ├── ng-mat/       # Angular + Angular Material UI library + Storybook
│   │   ├── rn-paper/     # Expo/React Native + React Native Paper + Storybook (web preview)
│   │   └── fl-mat/       # Flutter Material 3 Dart package + Widgetbook
│   └── utils/
├── nx.json               # Nx workspace configuration
├── package.json          # Root Node/pnpm configuration
├── pnpm-workspace.yaml   # pnpm workspace packages
└── pyproject.toml        # Python / uv workspace configuration
```

## Polyglot UI Libraries (`libs/ui/`)

Each UI library follows **Atomic Design** (`atoms/`, `molecules/`, `organisms/`, `templates/`) backed by framework-agnostic contracts in `@mono-magic/ui-interfaces` (and mirrored in Dart for Flutter):

| Nx Project | Package / Location | Framework & Design System | Component Catalog |
| --- | --- | --- | --- |
| `ui-interfaces` | `@mono-magic/ui-interfaces` (`libs/ui/interfaces`) | Framework-agnostic TypeScript | — |
| `ui-react-mui` | `@mono-magic/ui-react-mui` (`libs/ui/react-mui`) | React 19 + MUI Material | Storybook (`@storybook/react-vite`) |
| `ui-ng-mat` | `@mono-magic/ui-ng-mat` (`libs/ui/ng-mat`) | Angular 22 + Angular Material | Storybook (`@storybook/angular`) |
| `ui-rn-paper` | `@mono-magic/ui-rn-paper` (`libs/ui/rn-paper`) | Expo / React Native + RN Paper | Storybook (`@storybook/react-vite` + `react-native-web`) |
| `ui-fl-mat` | `ui_fl_mat` (`libs/ui/fl-mat`) | Flutter 3.50 Material 3 | Widgetbook |

Starter Atomic Design components included across all 4 UI implementations:
- **Atoms**: `Button` (`MagicButton` / `MagicButtonComponent`), `TextInput` (`MagicTextInput` / `MagicTextInputComponent`)
- **Molecules**: `SearchBar` (`MagicSearchBar` / `MagicSearchBarComponent`, composing the `TextInput` and `Button` atoms)
- **Organisms & Templates**: Tier entrypoints ready for higher-order components

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

# Run a target on affected projects
pnpm nx affected -t lint test build

# Run a target on a specific project
pnpm nx run <project>:<target>

# Run tests, lint, or typecheck across all UI libraries
pnpm nx run-many -t test -p ui-interfaces,ui-react-mui,ui-ng-mat,ui-rn-paper,ui-fl-mat
pnpm nx run-many -t lint -p ui-interfaces,ui-react-mui,ui-ng-mat,ui-rn-paper,ui-fl-mat
pnpm nx run-many -t typecheck -p ui-interfaces,ui-react-mui,ui-ng-mat,ui-rn-paper

# Launch Storybook / Widgetbook locally
pnpm nx storybook ui-react-mui
pnpm nx storybook ui-ng-mat
pnpm nx storybook ui-rn-paper
pnpm nx storybook ui-fl-mat

# Build static Storybooks
pnpm nx run-many -t build-storybook -p ui-react-mui,ui-ng-mat,ui-rn-paper
```

## License

[MIT](LICENSE)
