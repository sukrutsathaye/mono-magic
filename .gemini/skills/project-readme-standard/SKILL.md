---
name: project-readme-standard
description: >-
  Authors and audits project-level README.md files under libs/<domain>/<project>/
  and apps/<app>/ with applicability-scoped sections: Official Documentation,
  Design System & Algorithm References, Local Setup & Docker/Emulator Runbooks,
  Language Codegen Commands (for Protobuf/schema libs), Public API / Component
  Catalogs, Usage Examples, and Auto-Synced Coverage Tables.
---

# Project-Level README Standard Playbook

Use this skill whenever creating a new library/app or auditing an existing `libs/<domain>/<project>/README.md` or `apps/<app>/README.md`.

> [!IMPORTANT]
> **Applicability-Scoped Rule**: Only include sections that are genuinely relevant to the package. Never pad a pure utility library with empty Docker setup instructions, and never omit emulator/Docker or algorithm references where they apply.

---

## 1. Mandatory Core Sections (All `libs/*` & `apps/*`)

Every project-level `README.md` MUST contain:

1. **Title, Package Identity & Domain Boundary**
   - Package name (npm/PyPI/Crate/Go module/Gradle artifact), Nx project name, canonical Nx tags (`scope:*`, `type:*`, `lang:*`, and `framework:*`/`ds:*`/`provider:*` where applicable), and explicit responsibility + forbidden dependencies.
2. **Official Documentation, Frameworks, Design Systems & Algorithms** *(see Section 2 for domain-specific requirements)*
   - A structured table of authoritative upstream links so any engineer or AI agent can jump directly to official specs.
3. **Component Catalog or Public API Table**
   - `libs/ui/*`: Tables of implemented **Atoms**, **Molecules**, **Organisms**, and **Templates** with contract names and concise descriptions.
   - `libs/utils/*`, `libs/data-access/*`, `libs/features/*`: Tables of exported modules, traits/interfaces, classes/structs, and functions.
4. **Nx Targets & Verification Commands**
   - Copy-pasteable `pnpm nx lint <project>`, `pnpm nx typecheck <project>`, `pnpm nx test <project>`, and Storybook/Widgetbook/build commands.
5. **Idiomatic Usage Examples**
   - Real, copy-pasteable code showing composition, `Result<T, E>` error handling, DI wiring, or theming.
6. **Auto-Synced Test & Coverage Summary**
   - Bounded by `<!-- COVERAGE_TABLE_START -->` and `<!-- COVERAGE_TABLE_END -->` and maintained via `node tools/ci/sync-readmes-and-coverage.mjs`.

---

## 2. Applicability-Scoped Sections (Include Where Relevant)

| Package Category | Required Extra Sections & Authoritative Links |
| :--- | :--- |
| **UI Contracts (`atomic-design-interfaces`, `proto-ui-contracts`)** | Links to [Atomic Design (Brad Frost)](https://atomicdesign.bradfrost.com/), [WCAG 2.1 AA](https://www.w3.org/TR/WCAG21/), [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/), and TypeScript/Buf docs. |
| **UI Implementations (`react-mui`, `ng-mat`, `rn-paper`, `fl-mat`, `vue-vuetify`, `svelte-tw`, `kt-compose`)** | Links to the framework docs (React 19, Angular 22, Expo/RN, Flutter, Vue 3, Svelte 5, Jetpack Compose), Design System docs (Material Design 3 / MUI / Angular Material / RN Paper / Vuetify / Tailwind CSS v4 + Bits UI), and Storybook/Widgetbook visual testing commands (`-- -u`). |
| **BaaS / DB / Broker / Cloud Wrappers (`ts-supabase`, `ts-firebase`, `ts-redis`, `py-redis`, `ts-nestjs`, `py-nest`, `kt-spring-boot`, `ts-mqtt`, `ts-kafka`)** | **Official SDK/Platform Docs** (Supabase, Firebase, Redis/Valkey, NestJS, FastAPI, Spring Boot, Keycloak, Kafka/Redpanda, Temporal, GraphQL, OpenAPI/Swagger/Scalar) **PLUS a step-by-step Local Setup & Docker / Emulator Runbook** (exact Docker Compose / CLI commands, required `.env` variables, ports, healthcheck, and teardown commands). |
| **Protobuf & Schema Contracts (`proto-contracts`, `proto-ui-contracts`)** | Links to [Protocol Buffers v3](https://protobuf.dev/programming-guides/proto3/), [Buf v2 Documentation](https://buf.build/docs/), and **Per-Language Codegen Commands & Output Map** (`buf lint`, `buf breaking`, `pnpm nx run <project>:generate`, and exact mapping to `gen/ts`, `gen/py`, `gen/kt`, `gen/go`, `gen/rs`, `gen/dart` + consumer wiring). |
| **Algorithms, Math, NLP, ML & RL (`py-utils-nlp`, `py-reflective-nlp`, `rs-pose-math`, `rs-design-tokens`, `py-ml-core`, `py-rl-core`, `py-agent-graph`)** | **Algorithms & Research References Table**: Links to every underlying library and algorithm used (e.g., [spaCy](https://spacy.io/), [YAKE](https://github.com/LIAAD/yake), [TextRank](https://web.eecs.umich.edu/~mihalcea/papers/mihalcea.emnlp04.pdf), [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf), [FastEmbed / BGE](https://qdrant.github.io/fastembed/), [One-Euro Filter](https://gery.casiez.net/1euro/), [WCAG 2.1 Relative Luminance](https://www.w3.org/TR/WCAG21/#dfn-relative-luminance), [LangGraph](https://langchain-ai.github.io/langgraph/), [Gymnasium](https://gymnasium.farama.org/), [Stable-Baselines3](https://stable-baselines3.readthedocs.io/)). |
| **Apps (`apps/*`)** | Link to the owning blueprint in `docs/projects/<slug>.md`, stack justification link (`docs/ARCHITECTURE_DECISION_MATRIX.md`), local full-stack boot instructions (Docker + backend + frontend), and E2E test commands. |

---

## 3. Recommended Section Template

```markdown
# `<package-name>` (`<path>`)

> Concise 1–2 sentence architectural summary.

- **Nx Project**: `<nx-project-name>`
- **Tags**: `scope:<domain>`, `type:<type>`, `lang:<lang>`

## Official Documentation & References

| Topic / Technology | Reference | Why It Is Used Here |
| :--- | :--- | :--- |
| ... | [Docs](https://...) | ... |

## Local Setup & Infrastructure (Include Only Where Applicable)

```bash
# Exact Docker / Emulator / CLI startup, env vars, and teardown commands
```

## Language Codegen Commands (Include Only For Protobuf / Schema Libs)

```bash
pnpm nx lint <project>
pnpm nx run <project>:generate
```

## Public API / Component Catalog

| Symbol / Component | Kind | Description |
| :--- | :--- | :--- |

## Usage Examples

## Nx Targets

<!-- COVERAGE_TABLE_START -->
<!-- COVERAGE_TABLE_END -->
```

---

## 4. Audit & Verification Workflow

1. Inspect the package's `project.json`, `package.json`/`pyproject.toml`/`Cargo.toml`/`go.mod`/`pubspec.yaml`, and exported symbols.
2. Add or update all applicable sections from Sections 1 & 2, verifying that every external URL is an official, accurate documentation link.
3. Run `node tools/ci/sync-readmes-and-coverage.mjs` and `node tools/ci/sync-readmes-and-coverage.mjs --check` to ensure coverage tables and root `README.md` links remain 100% synchronized.
