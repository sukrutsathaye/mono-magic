# Track A Survey Handoff Report (Governance, MCP, Skills, Boundaries, Globs, and Docs)

**Summary**: Read-only survey of `/home/antigravity/sukrutsathaye/mono-magic` confirms that existing `libs/ui/*` projects already carry compatible `scope:ui` and `type:interfaces` tags, `lint` and `typecheck` pass cleanly across all 4 JS/TS UI projects, `docs/` does not yet exist, and `tools/ci/storybook-pages.mjs` / `.github/workflows/*` are safe under the planned `pnpm-workspace.yaml` glob refactor. Key Track A reconciliation items and edge cases are documented below.

---

## 1. Observation

### 1.1 Existing AI Configuration & Skills Registration
- **`.gemini/settings.json`** (lines 1–17):
  ```json
  {
    "mcpServers": {
      "nx-mcp": { "type": "stdio", "command": "npx", "args": ["nx", "mcp"] }
    },
    "contextFileName": ["GEMINI.md", "AGENTS.md"]
  }
  ```
- **`.agents/skills.json`** (lines 1–14):
  Registers `entries` with paths `".gemini/skills"`, `".agents/skills"`, `"node_modules/storybook-addon-vis/skills"`.
- **`.gemini/skills/`** (5 existing directories, each containing only `SKILL.md`):
  - `coverage-and-quality/SKILL.md`
  - `data-access-provider/SKILL.md`
  - `polyglot-ui-component/SKILL.md`
  - `roadmap-tracker/SKILL.md`
  - `storybook-visual-testing/SKILL.md`
- **Exact frontmatter & markdown convention of `.gemini/skills/*/SKILL.md`**:
  - YAML frontmatter delimited by `---`:
    - `name: <kebab-case-skill-name>`
    - `description: >-` followed by indented 2-space multi-line summary ending with a `"Use when..."` trigger clause.
  - Body starts with `# <Title>`, short intro line `"Use this skill whenever..."`, then numbered sections (`## 1. ...`, `## 2. ...`) separated by `---` horizontal rules, with fenced bash/code blocks and explicit `pnpm nx ...` commands.
- **`.gemini/commands/`** (6 `.toml` files): `add-data-access.toml`, `add-ui-component.toml`, `coverage-report.toml`, `monitor-ci.toml`, `roadmap.toml`, `visual-test.toml`.
  - Note: `add-data-access.toml` (lines 11–12) still references `libs/data-access/data-access-interfaces` and `libs/utils/core`.
- **`.gemini/agents/`** (3 `.md` files): `data-access-architect.md`, `polyglot-ui-architect.md`, `qa-visual-coverage-specialist.md`.
  - Note: `data-access-architect.md` (lines 4, 16) still references `libs/data-access/data-access-interfaces`.
- **`.claude/settings.json`** (lines 1–32): Configures `nx@nx-claude-plugins` marketplace and `/tmp/.nx`, `~/.nx` sandbox permissions.
- **`.codex/config.toml`** (lines 1–11) & **`.codex/agents/ci-monitor-subagent.toml`**: Configures `[mcp_servers.nx-mcp]` (`npx nx mcp`), `multi_agent = true`, and `ci-monitor-subagent`.
- **Root Markdown docs**:
  - `AGENTS.md` (lines 1–31): Nx auto-generated section (`<!-- nx configuration start/end -->`) + `# mono-magic AI Orchestration & Workspace Guide` linking `GEMINI.md`, `ROADMAP.md`, `.gemini/skills/`, `.gemini/commands/`, `.gemini/agents/`.
  - `CLAUDE.md` (lines 1–24): Only contains the Nx auto-generated section (`<!-- nx configuration start/end -->`).
  - `GEMINI.md` (lines 1–65): Documents Nx v24.0.6, pnpm v12.18.0, uv Python >=3.12, Flutter >=3.50; section 1 (Core Workspace Rules, naming, domain boundaries referencing `libs/data-access/data-access-interfaces`, `libs/utils/*` (`core`, `formatters`, `pose-math`, `design-tokens`, `py-common`)); section 2 (`storybook-addon-vis`); section 3 (5 skills, 6 commands, 3 specialist agents).
  - `README.md` (lines 1–177): Documents tech stack, `libs/` structure (`libs/py-*` at line 31), UI catalog (11 Atoms + 5 Molecules), getting started, Storybook/Widgetbook commands.
  - `ROADMAP.md` (lines 1–303):
    - Section 1–2: Architectural vision, Mermaid diagram, Phase 0–5B table (currently ends at `Phase 5B`).
    - Section 3: Track 1 (Phase 0–1), Track 2 (Phase 2A–2C, 4B), Track 3 (Phase 3A: `libs/utils/core`, `libs/utils/py-common`, etc.), Track 4 (Phase 3B: `libs/data-access/data-access-interfaces`, `fl-data-access-interfaces`, `py-data-access-interfaces`, Phase 3C.1–3C.4), Track 5 (Phase 4A & 4C), Track 6 (Phase 5A Yoga Live & Phase 5B Knitted Showcase).

### 1.2 Existing Workspace Governance & Config Files
- **`eslint.config.mjs`** (lines 1–56):
  - Uses `@nx/eslint-plugin` flat configs (`flat/base`, `flat/typescript`, `flat/javascript`).
  - Ignores `["**/dist", "**/out-tsc", "**/vitest.config.*.timestamp*"]`.
  - Lines 22–38: `@nx/enforce-module-boundaries` currently has `enforceBuildableLibDependency: true` and only a permissive catch-all: `{ sourceTag: "*", onlyDependOnLibsWithTags: ["*"] }`.
- **`pyproject.toml`** (lines 1–8):
  ```toml
  [project]
  name = "mono-repo-magic-python"
  version = "0.0.0"
  requires-python = ">=3.12"

  [tool.uv.workspace]
  members = ["apps/api-*", "libs/py-*"]
  ```
- **`pnpm-workspace.yaml`** (lines 1–14):
  ```yaml
  packages:
    - "apps/*"
    - "libs/*"
    - "libs/ui/*"
    - "!libs/ui/fl-mat"
  ```
  Plus `allowBuilds` for `nx`, `esbuild`, `@parcel/watcher: false`, `unrs-resolver: false`, `lmdb: false`, `msgpackr-extract: false`.
- **`.gitignore`** (lines 1–38): Ignores `.nx/cache`, `.nx/workspace-data`, `node_modules`, `dist/`, `storybook-static`, `out-tsc/`, `test-output/`, `coverage/`, `**/__vis__/**/__diffs__`, `**/__vis__/**/__results__`, `**/__vis__/local`.
- **`nx.json`** (lines 1–85): `nxCloudId` set; plugins `@nx/eslint/plugin` (`lint`), `@nx/vitest` (`test`/`test-ci`), `@nx/expo/plugin`, `@nx/storybook/plugin`, `@nx/js/typescript` (`typecheck` / `build`). Note: `targetDefaults.test` has `dependsOn: ["^build"]`.
- **`package.json`** (lines 1–116): `type: "module"`, `packageManager: "pnpm@12.18.0"`, `nx: "24.0.6"`, `typescript: "~6.0.0"`, `vitest: "^4.0.8"`, `@vitest/coverage-v8: "^4.0.8"`, `eslint: "^9.8.0"`. Does **not** have `@bufbuild/buf` yet (Track B owns `package.json` for `@bufbuild/buf`).
- **`tsconfig.base.json`** (lines 1–34): `module: "nodenext"`, `moduleResolution: "nodenext"`, `customConditions: ["mono-magic"]`, `strict: true`, `composite: true`, `emitDeclarationOnly: true`. Currently `paths` only maps `@mono-magic/atomic-design-interfaces` and `@mono-magic/ng-mat` (note: `react-mui` and `rn-paper` resolve via pnpm workspace `exports`).
- **`tsconfig.json`** (lines 1–20): Solution-style `references` listing the 4 JS/TS UI libs under `./libs/ui/*`.

### 1.3 Existing Projects, Tags & Boundary Compliance
`pnpm nx show projects --json` returned: `["atomic-design-interfaces","react-mui","rn-paper","fl-mat","ng-mat","mono-magic"]`.
Inspected tags via `pnpm nx show project <p> --json` and `package.json` / `project.json`:
- `atomic-design-interfaces` (`libs/ui/atomic-design-interfaces/package.json`): `tags: ["npm:private", "scope:ui", "type:interfaces"]` (no `project.json`).
- `react-mui` (`libs/ui/react-mui/package.json` + `project.json`): `tags: ["npm:public", "scope:ui", "framework:react", "ds:material"]`.
- `ng-mat` (`libs/ui/ng-mat/project.json`): `tags: ["npm:public", "scope:ui", "framework:angular", "ds:material"]` (note: `ng-mat/package.json` has no `nx` block; `project.json` defines `tags`).
- `rn-paper` (`libs/ui/rn-paper/package.json` + `project.json`): `tags: ["npm:public", "scope:ui", "framework:expo", "ds:paper"]`.
- `fl-mat` (`libs/ui/fl-mat/project.json`): `tags: ["scope:ui", "framework:flutter", "ds:material"]`.
- `mono-magic` (root `package.json`): `tags: ["npm:private"]`.

Internal `@mono-magic/*` import scan across `libs/`:
- `libs/ui/atomic-design-interfaces/src/`: **zero** `@mono-magic/*` imports (only relative `./` and `../` imports inside the package).
- `libs/ui/react-mui`, `libs/ui/ng-mat`, `libs/ui/rn-paper`: only import `@mono-magic/atomic-design-interfaces` (which has `scope:ui`, `type:interfaces`).
- `pnpm nx run-many -t lint -p atomic-design-interfaces,react-mui,ng-mat,rn-paper` exited `0` (4/4 passed).
- `pnpm nx run-many -t typecheck -p atomic-design-interfaces,react-mui,ng-mat,rn-paper` exited `0` (4/4 passed).
- Toolchain check: `uv 0.13.7` is installed at `/usr/local/bin/uv` and `/usr/bin/python3` is available.

### 1.4 `docs/`, `tools/`, and `.github/workflows/`
- `docs/` directory **does not exist** (`ls: cannot access .../docs: No such file or directory`).
- `tools/` contains only `tools/ci/storybook-pages.mjs` (lines 1–472):
  - `readExcludedPaths()` (lines 49–63) parses `pnpm-workspace.yaml` **only** for negated entries (`!path`), and `walk()` (lines 82–158) recursively scans `apps` and `libs` for `.storybook/main.*` or `pubspec.yaml` + `lib/widgetbook.dart`. Changing `pnpm-workspace.yaml` to `libs/utils/ts-*`, `libs/data-access/ts-*`, `libs/features/ts-*` will **not** break `storybook-pages.mjs`.
- `.github/workflows/`:
  - `ci.yml`: runs `pnpm nx affected -t lint test build`.
  - `storybook-gh-pages.yml`: calls `node tools/ci/storybook-pages.mjs discover --matrix`, `build`, `assemble`.
  - `.github/actions/setup-flutter/action.yml` (line 30): `find apps libs -maxdepth 4 -name "pubspec.yaml" ...` — works with `libs/<domain>/<lang>-<name>` (depth 3).
  - Neither `tools/` nor `.github/` references `ROADMAP.md` or `libs/*` globs.

---

## 2. Logic Chain

1. **Strict `eslint.config.mjs` `depConstraints` Compatibility**:
   - Existing `libs/ui/*` projects all carry `scope:ui`, and `atomic-design-interfaces` additionally carries `type:interfaces`.
   - The only cross-project imports in `libs/ui/` are `react-mui`/`ng-mat`/`rn-paper` -> `@mono-magic/atomic-design-interfaces`.
   - Under the planned constraints (`scope:ui` -> `["scope:ui", "scope:utils"]`; `type:interfaces` -> `["type:interfaces", "type:util"]`), all existing imports are satisfied (`scope:ui` -> `scope:ui`, and `react-mui`/`ng-mat`/`rn-paper` do not carry `type:interfaces` so the `type:interfaces` rule doesn't constrain them, while `atomic-design-interfaces` has zero external dependencies).
   - **Important ESLint edge case**: Keep `{ sourceTag: "*", onlyDependOnLibsWithTags: ["*"] }` **removed** (or ensure every new project gets `scope:*` and `type:*` tags), AND note that `atomic-design-interfaces` has `"npm:private"` and `react-mui`/`ng-mat`/`rn-paper` have `"npm:public"` auto-tags from pnpm/Nx. Because `@nx/enforce-module-boundaries` checks *all* matching `depConstraints` rules (AND semantics across matching `sourceTag`s), if a rule targets `scope:ui` and `type:interfaces`, projects without `scope:*` (e.g., root `mono-magic` which only has `npm:private`) will still pass unless a catch-all rule restricts untagged projects, whereas any project WITH `scope:ui` will only be allowed to depend on `scope:ui` or `scope:utils`. Also note `libs/ui/ng-mat/eslint.config.mjs`, `react-mui/eslint.config.mjs`, `rn-paper/eslint.config.mjs`, and `atomic-design-interfaces/eslint.config.mjs` all spread `...baseConfig` from root `eslint.config.mjs`, so updating root `eslint.config.mjs` automatically enforces the rules across all JS/TS projects.

2. **`pnpm-workspace.yaml` Glob Edge Case**:
   - Currently `"libs/*"` matches `libs/ui`, `libs/data-access`, `libs/utils`, `libs/features` as *directories*, not packages, and `"libs/ui/*"` matches the 5 UI libs.
   - Replacing `"libs/*"` with `"libs/utils/ts-*"`, `"libs/data-access/ts-*"`, `"libs/features/ts-*"` (while keeping `"apps/*"`, `"libs/ui/*"`, `"!libs/ui/fl-mat"`) matches the exact directory depth of Track B (`libs/utils/ts-core`, `libs/data-access/ts-interfaces`) without accidentally treating `libs/data-access/proto-contracts` or `libs/data-access/py-interfaces` as pnpm packages.
   - **Check on `proto-contracts` (`libs/data-access/proto-contracts`)**: `implementation_plan.md` line 26 explicitly omits `proto-contracts` from `pnpm-workspace.yaml`: `["apps/*", "libs/ui/*", "libs/utils/ts-*", "libs/data-access/ts-*", "libs/features/ts-*", "!libs/ui/fl-mat"]`, and places `@bufbuild/buf` in root `package.json` `devDependencies` (Track B). Thus `proto-contracts` is an Nx project via `project.json` without needing a pnpm workspace entry.

3. **`pyproject.toml` Glob Change**:
   - Currently `members = ["apps/api-*", "libs/py-*"]`.
   - Changing to `members = ["apps/api-*", "libs/*/py-*"]` (per `implementation_plan.md` line 25 & 146) aligns with the 4-domain `libs/<domain>/<lang>-<name>` layout (`libs/data-access/py-interfaces`, `libs/utils/py-common`, `libs/utils/py-nlp`, `libs/data-access/py-reflective-nlp`), unblocking Track B's `uv sync`.

4. **Stale Path References to Reconcile in Track A**:
   - `rg` across the repo showed `libs/data-access/data-access-interfaces`, `libs/utils/core`, `libs/utils/py-common`, and `libs/py-*` appear in:
     - `GEMINI.md` (lines 20–21)
     - `ROADMAP.md` (lines 13–16, 33–34, 59–60, 171, 179, 233–238)
     - `.gemini/skills/data-access-provider/SKILL.md` (lines 6, 18–24, 28, 30, 58)
     - `.gemini/skills/roadmap-tracker/SKILL.md` (line 24)
     - `.gemini/commands/add-data-access.toml` (lines 11–12)
     - `.gemini/agents/data-access-architect.md` (lines 4, 16)
     - `README.md` (line 31 — `uv: libs/py-*`, though `README.md` is not listed in Track A's file ownership table, flag for awareness or minor sync if desired; Track A's table lists `ROADMAP.md`, `PORTFOLIO_IDEAS.md`, `docs/projects/*`, `GEMINI.md`, `AGENTS.md`, `eslint.config.mjs`, `pyproject.toml`, `pnpm-workspace.yaml`, `.gemini/settings.json`, `.gemini/MCP.md`, `.gemini/skills/*`).
   - **Important**: `implementation_plan.md` specifies `libs/data-access/ts-interfaces` (`@mono-magic/data-access-ts-interfaces`), `libs/data-access/py-interfaces` (`py-data-access-interfaces`), `libs/data-access/proto-contracts`, and `libs/utils/ts-core` (`@mono-magic/utils-ts-core`) instead of `data-access-interfaces` and `libs/utils/core`. All Track A docs and skills (`GEMINI.md`, `ROADMAP.md`, `data-access-provider/SKILL.md`, `roadmap-tracker/SKILL.md`, and `engineering-standards/SKILL.md`) should consistently use the new `libs/<domain>/<lang>-<name>` naming!

5. **Complete Track A Deliverables & Requirements Checklist**:
   - **`.gemini/settings.json`**: Keep `contextFileName: ["GEMINI.md", "AGENTS.md"]` and `nx-mcp` (`npx nx mcp`), add zero-secret local stdio MCP servers: `playwright` (`npx -y @playwright/mcp@latest`) and `context7` (`npx -y @upstash/context7-mcp`).
   - **`.gemini/MCP.md`** [NEW]: Document usage of local MCPs (`nx-mcp`, `playwright`, `context7`) + opt-in/credentialed MCP setup without committing secrets (Supabase MCP `@supabase/mcp-server-supabase` / `https://mcp.supabase.com/mcp` with `SUPABASE_ACCESS_TOKEN`, Firebase MCP `npx -y firebase-tools@latest experimental:mcp`, Storybook MCP `@storybook/addon-mcp`, GitHub MCP / `gh` CLI).
   - **`.gemini/skills/engineering-standards/SKILL.md`** [NEW]: Follow `.gemini/skills/*/SKILL.md` YAML frontmatter (`name: engineering-standards`, `description: >- ...`). Cover:
     - Concrete SOLID rules for `mono-magic` (SRP across 4 `libs/` domains + `apps/`, OCP via `Protocol`/interface strategies, LSP via mandatory shared Contract Compliance Test Suites, ISP capability-focused interfaces, DIP depending on `type:interfaces` only).
     - Clean code & optimization hygiene (`readonly`/`frozen=True`, `Result<T, E>` over untyped exceptions, strict TS/Python/Dart typing, zero hardcoded secrets/magic numbers, N+1 avoidance, `lifespan`/DI client singletons, batching, WCAG 2.1 AA).
     - Documentation gates (JSDoc/TSDoc, Google-style Python docstrings, Dartdoc, `README.md` per lib/app).
     - Testing gates (`>=80%` lines/statements/functions/branches; `>=90%` for `libs/utils/*`; E2E required for `apps/*`).
     - Naming & tagging standard (`libs/<domain>/<lang>-<name>`, tags `scope:<domain>`, `type:<interfaces|util|data-access|feature|ui|app>`, `lang:<ts|py|java|dart|proto|rust|go>`).
   - **`.gemini/skills/python-uv-service/SKILL.md`** [NEW]: Follow `.gemini/skills/*/SKILL.md` format (`name: python-uv-service`). Cover `libs/*/py-*` and `apps/api-*` in `uv` workspace (`members = ["apps/api-*", "libs/*/py-*"]`), `pyproject.toml` with `requires-python = ">=3.12"` and `[tool.uv.sources]`, `project.json` Nx targets (`lint` via `ruff`, `typecheck` via `pyright`, `test` via `pytest --cov`), FastAPI `lifespan` singletons, Pydantic v2 DTOs, and SOLID `typing.Protocol` design.
   - **`.gemini/skills/data-access-provider/SKILL.md`** [MODIFY]: Update to hybrid workflow (`libs/data-access/proto-contracts` with `buf` + idiomatic traits in `libs/data-access/ts-interfaces` and `libs/data-access/py-interfaces`), update `@mono-magic/utils-core` -> `@mono-magic/utils-ts-core` (`libs/utils/ts-core`), update package names/paths, include `lang:<lang>` tag convention.
   - **`GEMINI.md` & `AGENTS.md`** [MODIFY]: Document the strict 4-domain `libs/` structure (`ui`, `utils`, `data-access`, `features`), `libs/<domain>/<lang>-<name>` naming standard, hybrid `buf`/Protobuf + trait workflow, `.gemini/MCP.md` reference, and register `engineering-standards` & `python-uv-service` skills as mandatory guidance.
   - **`eslint.config.mjs`** [MODIFY]: Replace wildcard `depConstraints` with the 6 strict rules (`scope:utils`, `scope:ui`, `scope:data-access`, `scope:features`, `scope:app`, `type:interfaces`) from `implementation_plan.md` lines 78–85.
   - **`pyproject.toml`** [MODIFY]: Update `members = ["apps/api-*", "libs/*/py-*"]`.
   - **`pnpm-workspace.yaml`** [MODIFY]: Update `packages` to `["apps/*", "libs/ui/*", "libs/utils/ts-*", "libs/data-access/ts-*", "libs/features/ts-*", "!libs/ui/fl-mat"]`.
   - **`ROADMAP.md`** [MODIFY]:
     - Update Phase 2C to include Reflective Learning organisms/templates (`TopicCatalogGrid`, `ChapterReader`, `McqQuizRunner`, `SubjectiveQuizRunner`, `KeywordCurationDeck`, `QuestionCurationPanel`, `TopicIngestionPanel` + `TopicLibraryTemplate`, `StudyReaderTemplate`, `AssessmentTemplate`, `CurationWorkspaceTemplate`).
     - Update Phase 3A–3C paths to `libs/<domain>/<lang>-<name>` (`libs/utils/ts-core`, `libs/utils/ts-formatters`, `libs/utils/ts-pose-math`, `libs/utils/ts-design-tokens`, `libs/utils/py-common`, `libs/utils/py-nlp`; Phase 3B: `libs/data-access/proto-contracts`, `libs/data-access/ts-interfaces`, `libs/data-access/py-interfaces`, `libs/data-access/dart-interfaces`, `libs/data-access/java-interfaces`; Phase 3C: `libs/data-access/ts-firebase`, `ts-supabase`, `ts-nestjs-*`, `java-spring-boot-*`, `ts-aws`, `ts-gcp`, `ts-azure`, plus `py-reflective-nlp` & `ts-reflective-api`).
     - Update Phase 4A/4C (`apps/api-reflective-learning` in Phase 4C).
     - Expand **Phase 5** to 4 flagship apps:
       - **5A**: Interactive Live Coaching & Learning Platform (Yoga + PoseNet + Reels + Math/Science/Languages/Gym + Smart Whiteboard & auto-transcripts + Chat + Payments)
       - **5B**: Hand-Knitted Articles Showcase & Ordering Platform
       - **5C**: Reflective Learning App (Wikipedia + Raw Text/Markdown + Books/PDF/EPUB, semantic + optional LLM grading)
       - **5D**: Couples Relationship Journal App
     - Link `PORTFOLIO_IDEAS.md` and `docs/projects/`.
   - **`PORTFOLIO_IDEAS.md`** [NEW]: Master index of the remaining **8 portfolio projects**, each marked `Status: Needs Deep-Dive Design` (requiring its own `/grill-me` / architectural & optimization plan before implementation):
     1. SmartHome / Home Assistant + MQTT
     2. Universal Sensor / SICK LiDAR Controller
     3. ROS Path Planning
     4. OSM EV Truck Routing
     5. Web3 / Ethereum + ROS-Smart-Contract Bridge + Hyperledger FireFly / Besu
     6. BPMN Editor + Business Rules Engine + Kafka Claims
     7. Python Multiprocessing Scraping / Cleaning / Training Pipeline
     8. Autonomous Playwright Visual-Crawl QA Explorer
   - **`docs/projects/_TEMPLATE.md`** [NEW]: Standardized blueprint template with sections: Problem & Goals, Domain Boundaries, SOLID & Optimization Strategy, Protobuf / Data-Access Contracts, UI Organisms / Templates, Testing & E2E Plan, Phased Milestones.
   - **`docs/projects/reflective-learning.md`** [NEW]: Preserve the complete generalized Reflective Learning architectural blueprint from `/home/antigravity/migration.md` + `/grill-me` decisions:
     - **Path Alignment Edge Case**: `migration.md` (written earlier) uses `libs/py-utils-text`, `libs/py-reflective-nlp`, `libs/data-access/data-access-interfaces`, `libs/data-access/reflective-learning-api`, and `libs/features/reflective-learning`. In `docs/projects/reflective-learning.md`, normalize these to the locked `libs/<domain>/<lang>-<name>` convention from `implementation_plan.md`:
       - `libs/utils/py-nlp` (pure text cleaning, segmentation, plural/singular, algorithmic keyword extractors, blank masking, cosine math)
       - `libs/data-access/py-reflective-nlp` (generalized `ContentSourceProvider` for Wikipedia, Raw Text/Markdown, and PDF/EPUB; `FastEmbedSemanticGrader`; pluggable `LLMQuestionGenerator` with `ChapterQuestionBundle` & Bloom levels; SQLModel/SQLAlchemy async persistence)
       - `libs/data-access/ts-reflective-api` (REST + SSE client implementing `IReflectiveLearningService` & `ts-interfaces`)
       - `libs/features/ts-reflective-learning`
       - `apps/api-reflective-learning` (thin FastAPI shell with `lifespan` singletons, SSE ingestion progress, 2-tier grading)
       - `apps/reflective-learning-web` / `apps/reflective-learning-mobile`
     - Preserve all details from `migration.md`: 6 legacy bugs fixed, 10 legacy `.pkl` schemas + `export_legacy_pickles.py` migration script for the 10 existing topics, 11 API endpoint contracts, Two-Tier Hybrid Grading (`<15ms` `fastembed` `BAAI/bge-small-en-v1.5` + borderline LLM rubric evaluation), Atomic Design mapping (7 Organisms + 5 Page Templates + TS contract skeletons), and phased implementation milestones.

---

## 3. Caveats

- `fl-mat` `lint` (`flutter analyze`) was not executed during this read-only survey, though `libs/ui/fl-mat/project.json` tags were verified (`["scope:ui", "framework:flutter", "ds:material"]`) and `fl-mat` has no TS/JS files checked by ESLint.
- `.gemini/commands/add-data-access.toml`, `.gemini/agents/data-access-architect.md`, `.gemini/skills/roadmap-tracker/SKILL.md`, and `README.md` also contain references to `data-access-interfaces` / `libs/utils/core` / `libs/py-*`. While Track A's explicit file table lists `.gemini/skills/*`, `GEMINI.md`, `AGENTS.md`, `ROADMAP.md`, updating those secondary references (or noting them for cleanup) prevents agent confusion.
- Note that `implementation_plan.md` line 151 mentions `ts-reflective-api` in Phase 3C while `migration.md` used `reflective-learning-api` and `libs/py-reflective-nlp`. Track A docs (`ROADMAP.md` and `docs/projects/reflective-learning.md`) must consistently use the locked `libs/<domain>/<lang>-<name>` pattern.

---

## 4. Conclusion

1. **No blocking regressions**: Existing `libs/ui/*` projects already conform to `scope:ui` / `type:interfaces` tagging, and `lint` + `typecheck` pass across all 4 JS/TS UI projects. Applying the strict `depConstraints` in `eslint.config.mjs` and updating `pnpm-workspace.yaml` and `pyproject.toml` globs is safe and non-breaking for both existing UI libraries and `tools/ci/storybook-pages.mjs`.
2. **Track A execution priorities**:
   - Update `pyproject.toml` and `pnpm-workspace.yaml` early so Track B can run `uv sync` and `pnpm install` without waiting on docs.
   - Apply strict `eslint.config.mjs` boundaries (removing the `* -> *` rule).
   - Update `.gemini/settings.json` + add `.gemini/MCP.md`, add `.gemini/skills/engineering-standards/SKILL.md` and `.gemini/skills/python-uv-service/SKILL.md`, and update `.gemini/skills/data-access-provider/SKILL.md` (plus `roadmap-tracker/SKILL.md`), `GEMINI.md`, and `AGENTS.md`.
   - Update `ROADMAP.md` (Phases 2C, 3A–3C, 4C, 5A–5D) and create `PORTFOLIO_IDEAS.md` (8 projects), `docs/projects/_TEMPLATE.md`, and `docs/projects/reflective-learning.md` (normalizing `migration.md` paths to `libs/utils/py-nlp`, `libs/data-access/py-reflective-nlp`, `libs/data-access/ts-reflective-api`, `libs/features/ts-reflective-learning`, `apps/api-reflective-learning` while preserving every schema, endpoint, LLM strategy, and Atomic Design contract).

---

## 5. Verification Method

After Track A implementation completes, independently verify with:
1. **Lint & Typecheck**:
   ```bash
   pnpm nx run-many -t lint typecheck --all
   ```
2. **Python `uv` workspace glob resolution** (check once Track B creates `py-interfaces` or dry-run `uv tree` / `python3 -c` TOML parse):
   ```bash
   python3 -c "import tomllib; print(tomllib.load(open('pyproject.toml','rb'))['tool']['uv']['workspace'])"
   ```
3. **JSON/YAML/Skills syntax & consistency**:
   - Validate `.gemini/settings.json` is valid JSON (`node -e "JSON.parse(require('fs').readFileSync('.gemini/settings.json','utf8'))"`).
   - Confirm all `.gemini/skills/*/SKILL.md` start with valid `---` YAML frontmatter (`name`, `description`).
   - Run `node tools/ci/storybook-pages.mjs discover` to verify showcase discovery still finds `react-mui`, `ng-mat`, `rn-paper`, `fl-mat`.
   - Run `rg -n "data-access-interfaces|libs/utils/core|libs/py-" GEMINI.md AGENTS.md ROADMAP.md .gemini/ docs/` to confirm no stale un-migrated paths remain in Track A files.
