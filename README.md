# mono-magic

A polyglot monorepo powered by **Nx**, **pnpm**, and **uv**.

## Tech Stack & Tooling

- **Monorepo & Orchestration**: [Nx](https://nx.dev) (`v24.0.6`) with Nx Cloud
- **JavaScript / TypeScript**: [pnpm](https://pnpm.io) (`v12.18.0`) & TypeScript (`^7.0.2`)
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
│   └── utils/
├── nx.json               # Nx workspace configuration
├── package.json          # Root Node/pnpm configuration
├── pnpm-workspace.yaml   # pnpm workspace packages
└── pyproject.toml        # Python / uv workspace configuration
```

## Getting Started

### Prerequisites

- **Node.js** & **pnpm** (`12.18.0`)
- **Python** (`>=3.12`) & **uv**

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
```

## License

[MIT](LICENSE)
