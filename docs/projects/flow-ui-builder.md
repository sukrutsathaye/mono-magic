# Project Blueprint: XYFlow Visual Atomic Page & Navigation Builder

- **Status**: `Blueprint Approved — Scheduled for Phase 4A / Phase 5`
- **Target Phases**: `Phase 2B/2C, Phase 4A, Phase 5`
- **Primary Domains**: `libs/ui/proto-ui-contracts`, `libs/features/ts-flow-studio`, `libs/ui/*`, `apps/flow-ui-builder-web`
- **Owner / Last Design Review (`/grill-me`)**: `2026-11-25`

---

## 1. Problem & Goals

- **Problem Statement**: As `mono-magic` scales across 7 UI libraries (`react-mui`, `ng-mat`, `rn-paper`, `fl-mat`, `vue-vuetify`, `svelte-tw`, `kt-compose`) and dozens of Atoms/Molecules/Organisms, assembling pages, templates, and navigation flows manually in every framework is repetitive and slows down rapid prototyping.
- **Core Objectives**:
  - Provide a LangGraph-inspired visual node-graph canvas (`@xyflow/react`) where users drag-and-drop **Atoms, Molecules, Organisms, and Page Templates**, configure props/slots in a live property inspector, and draw **directed edges to wire navigation & routing**.
  - Allow switching **Target Framework + Design System** (`react-mui`, `ng-mat`, `vue-vuetify`, `svelte-tw`, `rn-paper`, `fl-mat`, `kt-compose`) and exporting both a **language-agnostic `PageGraph` Protobuf/JSON AST** (`libs/ui/proto-ui-contracts`) and clean **starter source code** for the chosen framework.
  - Sub-50ms canvas interaction latency with 200+ nodes, undo/redo history, and deterministic code generation.
- **Target Personas & Roles**:
  - **UI/Product Designer & Developer**: Composes pages, organisms, and navigation graphs visually, previews live, and exports starter files into `apps/*`.
  - **Design-System Maintainer**: Audits component composition and exports reusable template graphs.
- **Non-Goals / Out of Scope**:
  - Not a pixel-level freeform vector editor (Figma replacement) — layout strictly follows Atomic Design slots, responsive grids, and design tokens.
  - Not a full IDE or arbitrary backend logic editor (workflow/business logic belongs in [`bpmn-claims-studio.md`](bpmn-claims-studio.md)).

---

## 2. Domain Boundaries (`libs/<domain>/<lang>-<name>` Mapping)

### Stack Selection Justification
Per [`docs/ARCHITECTURE_DECISION_MATRIX.md`](../ARCHITECTURE_DECISION_MATRIX.md):
- **Frontend (`react-mui` + `@xyflow/react`)**: React has the flagship first-party `@xyflow/react` engine, richest canvas/inspector ecosystem, and direct TypeScript access to `@mono-magic/atomic-design-interfaces` metadata.
- **Shared Studio Engine (`libs/features/ts-flow-studio`)**: Shared between **Flow UI Builder** and **BPMN Studio** to eliminate duplicated canvas, minimap, undo/redo, keyboard shortcuts, and inspector boilerplate.
- **Contracts (`libs/ui/proto-ui-contracts`)**: Keeps UI enums (`MagicColor`, `MagicSize`, `UiFramework`, `DesignSystem`) and `PageGraph` AST strictly inside `scope:ui` with zero `scope:data-access` coupling.

### Package & App Mapping

| Package / App Path | Nx Project Name | Tags (`scope:*`, `type:*`, `lang:*`) | Responsibility & Forbidden Dependencies |
| --- | --- | --- | --- |
| `libs/ui/proto-ui-contracts` | `proto-ui-contracts` | `scope:ui`, `type:interfaces`, `lang:proto` | Canonical `tokens.proto` & `page_graph.proto` AST; zero `data-access` imports |
| `libs/utils/ts-core` | `utils-ts-core` | `scope:utils`, `type:util`, `lang:ts` | Pure `Result<T, E>` validation & graph cycle/topological helpers |
| `libs/features/ts-flow-studio` | `features-ts-flow-studio` | `scope:features`, `type:feature`, `lang:ts` | Shared `@xyflow/react` canvas shell, undo/redo command stack, palette & inspector abstractions |
| `libs/features/ts-page-codegen` | `features-ts-page-codegen` | `scope:features`, `type:feature`, `lang:ts` | Pluggable `IFrameworkCodeEmitter` implementations (React/MUI, Angular/Mat, Vue/Vuetify, Svelte/TW, RN/Paper, Flutter, Jetpack Compose) |
| `apps/flow-ui-builder-web` | `flow-ui-builder-web` | `scope:app`, `type:app`, `lang:ts` | Thin React 19 + `react-mui` studio app hosting live preview, framework selector, and export drawer |

---

## 3. SOLID & Optimization Strategy

- **SRP / OCP / LSP / ISP / DIP Alignment**:
  - `IFrameworkCodeEmitter` (`emit(graph: PageGraphDocument): Result<GeneratedFile[], AppError>`) enables adding new UI frameworks (e.g., `kt-compose`, `react-shadcn`) without modifying the canvas or exporter core (OCP).
  - `INodePaletteRegistry` registers component metadata cleanly per tier (`atom`, `molecule`, `organism`, `template`).
- **Performance & Concurrency Design**:
  - Memoized custom XYFlow node components; inspector edits update only the selected node slice (no full-graph re-render).
  - Code generation runs in a Web Worker for large graphs to keep canvas panning at 60fps.
- **Security & Secret Hygiene**:
  - Pure client-side AST editing by default; all user-entered prop strings are escaped/sanitized before code emission to prevent template injection.

---

## 4. Protobuf & Data-Access Contracts

- **Protobuf (`libs/ui/proto-ui-contracts/proto/monomagic/ui/v1/`)**:
  - `tokens.proto`: `MagicColor`, `MagicSize`, `MagicAppearance`, `MagicSeverity`, `UiFramework`, `DesignSystem`.
  - `page_graph.proto`: `PageGraphDocument`, `PageNode`, `ComponentNode`, `SlotBinding`, `NavigationEdge` (`route_path`, `trigger_event`, `guard_expr`).
- **Optional Persistence**: Uses `IDataRepository<PageGraphRecord, string>` from `ts-interfaces` (swappable localStorage / `ts-supabase` / `ts-firebase`).

---

## 5. UI Organisms & Templates (`libs/ui/*`)

- **Reused Atoms & Molecules**: `Button`, `ButtonToggle`, `Select`, `TextInput`, `SlideToggle`, `Chip`, `Tabs`, `Accordion`, `Dialog`, `Toast`, `SearchBar`, `ToolTip`, `Card`.
- **New Organisms & Templates**: `MagicNavbar`, `MagicSidebar`, `MagicAppShellTemplate` + specialized canvas shell inside `libs/features/ts-flow-studio`.

---

## 6. Testing & E2E Plan

- **Unit Coverage**: `>=90%` on graph validation/codegen emitters (`ts-page-codegen`); `>=80%` on `ts-flow-studio` state & undo/redo stack.
- **Snapshot & Golden Codegen Tests**: Golden-file tests asserting deterministic React, Angular, Vue, Svelte, Flutter, and Kotlin output from sample `PageGraphDocument` fixtures.
- **E2E (Playwright)**: Drag two pages + atoms onto canvas, connect navigation edge, switch framework selector, verify live preview + exported bundle downloads cleanly.

---

## 7. Phased Milestones

1. **Milestone 1 — UI Protobuf Contracts**: Ship `libs/ui/proto-ui-contracts` (`tokens.proto`, `page_graph.proto`) with `buf lint` & `buf generate`.
2. **Milestone 2 — Shared Flow Studio Engine**: Build `libs/features/ts-flow-studio` (`@xyflow/react` shell, undo/redo, inspector, serialization).
3. **Milestone 3 — Multi-Framework Code Emitters**: Implement `IFrameworkCodeEmitter` for `react-mui`, `ng-mat`, `vue-vuetify`, `svelte-tw`, `rn-paper`, `fl-mat`, and `kt-compose`.
4. **Milestone 4 — Studio App & E2E**: Assemble `apps/flow-ui-builder-web` with live preview sandbox and Playwright E2E suite.
