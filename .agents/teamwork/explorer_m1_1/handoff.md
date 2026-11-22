# Explorer M1-1 Handoff: Track A Exact Diff Context & Preservation Checklist

**Summary**: Completed full read-only inspection of all 17 Track A files (or their exact targets), UI ESLint/package/project configs, root `mono-magic` tags, and `/home/antigravity/migration.md` (lines 1–952). Verified `git status` and confirmed `docs/` does not exist. All findings below provide exact line anchors and preservation checklists for the Track A Worker.

---

## 1. Observation: Exact Line Anchors & Diff Context

### 1.1 `eslint.config.mjs` (lines 1–56) & Project Tags Interaction
- **Root `eslint.config.mjs`**:
  - Lines 1–6: Imports `@nx/eslint-plugin` and spreads `flat/base`, `flat/typescript`, `flat/javascript`.
  - Lines 7–13: `ignores: ["**/dist", "**/out-tsc", "**/vitest.config.*.timestamp*"]`.
  - Lines 14–40: Rule `@nx/enforce-module-boundaries` on `["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]`:
    - Line 25: `enforceBuildableLibDependency: true`
    - Lines 26–28: `allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"]`
    - Lines 29–36: Currently `{ sourceTag: "*", onlyDependOnLibsWithTags: ["*"] }` — replace this single catch-all object with the 6 strict `depConstraints` rules from `implementation_plan.md` lines 78–85:
      1. `{ sourceTag: "scope:utils", onlyDependOnLibsWithTags: ["scope:utils"] }`
      2. `{ sourceTag: "scope:ui", onlyDependOnLibsWithTags: ["scope:ui", "scope:utils"] }`
      3. `{ sourceTag: "scope:data-access", onlyDependOnLibsWithTags: ["scope:data-access", "scope:utils"] }`
      4. `{ sourceTag: "scope:features", onlyDependOnLibsWithTags: ["scope:features", "scope:ui", "scope:data-access", "scope:utils"] }`
      5. `{ sourceTag: "scope:app", onlyDependOnLibsWithTags: ["scope:features", "scope:ui", "scope:data-access", "scope:utils"] }`
      6. `{ sourceTag: "type:interfaces", onlyDependOnLibsWithTags: ["type:interfaces", "type:util"] }`
  - Lines 41–55: Empty override block for `**/*.{ts,tsx,cts,mts,js,jsx,cjs,mjs}`.
- **UI `eslint.config.mjs` inheritance**:
  - `libs/ui/atomic-design-interfaces/eslint.config.mjs` (lines 1–11), `libs/ui/react-mui/eslint.config.mjs` (lines 1–26), `libs/ui/ng-mat/eslint.config.mjs` (lines 1–38), `libs/ui/rn-paper/eslint.config.mjs` (lines 1–30) all spread `...baseConfig` from `../../../eslint.config.mjs` and do **not** override `@nx/enforce-module-boundaries`.
- **`enforceBuildableLibDependency: true` & Project Tags verification**:
  - Verified via `pnpm nx show project <p> --json`:
    - `mono-magic` (root `package.json` lines 1–116, `"nx": {}` at line 85): `tags: ["npm:private"]`, `targets: {}`. Does NOT carry any `scope:*` or `type:*` tag, so none of the 6 rules restrict it unless it imports a lib (and root has no TS/JS source importing workspace libs).
    - `atomic-design-interfaces` (`libs/ui/atomic-design-interfaces/package.json` lines 16–19): `tags: ["npm:private", "scope:ui", "type:interfaces"]`. `targets`: `['lint', 'test', 'test-ci', 'typecheck']` (no `build` target; `nx.json` lines 56–68 only configures `typecheck` and `build` when `tsconfig.lib.json` matches, and wait—`atomic-design-interfaces` has `emitDeclarationOnly` / no `build` target in `pnpm nx show project atomic-design-interfaces --json` because `tsconfig.lib.json` likely has `noEmit` or `composite`, meaning `react-mui`/`ng-mat`/`rn-paper` also have **no** `build` target!). Because `atomic-design-interfaces` is non-buildable (no `build` target) AND `react-mui`/`ng-mat`/`rn-paper` are ALSO non-buildable (targets: `['lint', 'test', 'test-ci', 'build-storybook', 'storybook', 'test-storybook', 'static-storybook', 'build-deps', 'watch-deps', 'typecheck', 'nx-release-publish']`), `enforceBuildableLibDependency: true` does NOT fail on `react-mui` -> `atomic-design-interfaces`. (Note for Track B: if Track B creates buildable TS libs with a `build` target, any dependency of theirs must also be buildable or `enforceBuildableLibDependency` checks buildability.)
    - `fl-mat` (`libs/ui/fl-mat/project.json` line 6): `tags: ["scope:ui", "framework:flutter", "ds:material"]`, targets: `['test', 'lint', 'widgetbook', 'build-widgetbook']`.
    - Note on `ng-mat`: `libs/ui/ng-mat/package.json` (lines 1–23) has no `"nx"` field; tags live in `libs/ui/ng-mat/project.json` line 7 (`["scope:ui", "framework:angular", "ds:material"]`) plus auto-tag `"npm:public"`.

### 1.2 Workspace Globs: `pyproject.toml` & `pnpm-workspace.yaml`
- **`pyproject.toml`** (lines 1–8):
  - Line 7: `members = ["apps/api-*", "libs/py-*"]` -> change to `members = ["apps/api-*", "libs/*/py-*"]`.
- **`pnpm-workspace.yaml`** (lines 1–14):
  - Lines 1–5:
    ```yaml
    packages:
      - "apps/*"
      - "libs/*"
      - "libs/ui/*"
      - "!libs/ui/fl-mat"
    ```
    Replace `- "libs/*"` (line 3) with:
    ```yaml
      - "libs/utils/ts-*"
      - "libs/data-access/ts-*"
      - "libs/features/ts-*"
    ```
    while keeping `"apps/*"`, `"libs/ui/*"`, `"!libs/ui/fl-mat"` and preserving lines 7–14 (`allowBuilds` block).

### 1.3 `.gemini/settings.json` & `.gemini/MCP.md`
- **`.gemini/settings.json`** (lines 1–17):
  - Lines 3–10: `"nx-mcp": { "type": "stdio", "command": "npx", "args": ["nx", "mcp"] }`. Keep this and lines 12–15 (`"contextFileName": ["GEMINI.md", "AGENTS.md"]`).
  - Add:
    - `"playwright": { "type": "stdio", "command": "npx", "args": ["-y", "@playwright/mcp@latest"] }`
    - `"context7": { "type": "stdio", "command": "npx", "args": ["-y", "@upstash/context7-mcp"] }`
- **`.gemini/MCP.md`** [NEW]:
  - Document local zero-secret stdio MCPs (`nx-mcp`, `playwright`, `context7`) and opt-in credentialed MCPs without committing secrets (Supabase `@supabase/mcp-server-supabase` / `https://mcp.supabase.com/mcp` with `SUPABASE_ACCESS_TOKEN`, Firebase `npx -y firebase-tools@latest experimental:mcp`, Storybook `@storybook/addon-mcp`, GitHub MCP / `gh` CLI).

### 1.4 `.gemini/skills/*/SKILL.md` Formatting & Stale Path Sync
- **Skill Frontmatter & Style Convention** (verified in `polyglot-ui-component/SKILL.md` lines 1–106, `coverage-and-quality/SKILL.md` lines 1–75, `storybook-visual-testing/SKILL.md` lines 1–84, `data-access-provider/SKILL.md` lines 1–60, `roadmap-tracker/SKILL.md` lines 1–41):
  - YAML frontmatter (`---` ... `---`) with `name: <kebab-case>` and `description: >-` (2-space indented block ending with `"Use when..."` / `"Use whenever..."`).
  - Body: `# <Title>`, one-line `"Use this skill..."`, numbered sections (`## 1. ...`, `## 2. ...`) separated by `---`, fenced bash/code blocks with `pnpm nx ...` commands.
- **New Skills to Create**:
  - `.gemini/skills/engineering-standards/SKILL.md` (`name: engineering-standards`)
  - `.gemini/skills/python-uv-service/SKILL.md` (`name: python-uv-service`)
- **Stale References Confirmed Across `.gemini/`, `GEMINI.md`, `AGENTS.md`, `ROADMAP.md`**:
  - `GEMINI.md`:
    - Line 20: `libs/data-access/data-access-interfaces` -> update to `libs/data-access/proto-contracts`, `libs/data-access/ts-interfaces`, `libs/data-access/py-interfaces`, and strict 4-domain `libs/<domain>/<lang>-<name>` layout (`ts-firebase`, `ts-supabase`, `ts-nestjs-*`, `java-spring-boot-*`, `ts-aws`, `ts-gcp`, `ts-azure`).
    - Line 21: `libs/utils/*` examples (`core`, `formatters`, `pose-math`, `design-tokens`, `py-common`) -> update to `ts-core`, `ts-formatters`, `ts-pose-math`, `ts-design-tokens`, `py-common`, `py-nlp`.
    - Lines 46–52: Add `engineering-standards` and `python-uv-service` to Custom Skills list as mandatory guidance, plus reference `.gemini/MCP.md`.
  - `AGENTS.md`:
    - Lines 1–24: **Preserve** `<!-- nx configuration start-->` ... `<!-- nx configuration end-->` verbatim!
    - Lines 26–31: Update `# mono-magic AI Orchestration & Workspace Guide` to reference `libs/<domain>/<lang>-<name>` naming, mandatory `engineering-standards` & `python-uv-service` skills, and `.gemini/MCP.md`.
  - `.gemini/skills/data-access-provider/SKILL.md`:
    - Stale lines: 6, 18, 19, 21, 22, 24, 28, 30, 50–54, 58 (`data-access-interfaces`, `libs/utils/core`, `@mono-magic/utils-core`, provider paths without `<lang>-` prefix like `libs/data-access/firebase`).
    - Update to hybrid workflow: `libs/data-access/proto-contracts` (`buf` + Protobuf IDL) + `libs/data-access/ts-interfaces` (`@mono-magic/data-access-ts-interfaces`) + `libs/data-access/py-interfaces` (`py-data-access-interfaces`), error/Result primitives from `libs/utils/ts-core` (`@mono-magic/utils-ts-core`), `<lang>-<provider>` naming (`ts-firebase`, `ts-supabase`, `ts-nestjs-*`, `java-spring-boot-*`, `ts-aws`, `ts-gcp`, `ts-azure`, `py-reflective-nlp`), and tags `scope:data-access,type:data-access,lang:<lang>,provider:<provider>`.
  - `.gemini/skills/roadmap-tracker/SKILL.md`:
    - Line 24: `Phase 3B: Data-Access Contracts (libs/data-access/data-access-interfaces)` -> update to `Phase 3B: Data-Access Contracts (proto-contracts, ts-interfaces, py-interfaces)`.
    - Line 26: Also lists `apps/yoga-live`, `apps/knitted-showcase` -> can add `apps/reflective-learning`, `apps/couples-journal` / Phase 5A–5D mention to stay consistent with updated `ROADMAP.md`.
  - `.gemini/commands/add-data-access.toml`:
    - Line 11: `libs/data-access/data-access-interfaces` -> `libs/data-access/proto-contracts`, `libs/data-access/ts-interfaces`, `libs/data-access/py-interfaces`.
    - Line 12: `libs/utils/core` -> `libs/utils/ts-core` (and `libs/utils/py-common` for Python).
  - `.gemini/agents/data-access-architect.md`:
    - Line 4: `libs/data-access/data-access-interfaces` -> `libs/data-access/{proto-contracts,ts-interfaces,py-interfaces}`.
    - Line 16: `libs/data-access/data-access-interfaces` -> `libs/data-access/ts-interfaces` / `py-interfaces` + `proto-contracts`.
    - Line 19: Note `ts-firebase`, `ts-supabase`, `ts-nestjs-*`, `java-spring-boot-*`, `ts-aws`, `ts-gcp`, `ts-azure`.
  - **Clean check on other `.gemini/` files**:
    - `.gemini/agents/polyglot-ui-architect.md`, `.gemini/agents/qa-visual-coverage-specialist.md`, `.gemini/commands/{add-ui-component,coverage-report,monitor-ci,roadmap,visual-test}.toml`, `.gemini/skills/{polyglot-ui-component,coverage-and-quality,storybook-visual-testing}/SKILL.md`, and `.agents/skills.json` have **zero** stale `data-access-interfaces`, `libs/utils/core`, or `libs/py-*` references.

### 1.5 `ROADMAP.md` (lines 1–303) Diff Anchors
- Lines 13–16: Replace `libs/data-access/data-access-interfaces` and `utils/core`, `utils/formatters`, `utils/pose-math`, `utils/design-tokens`, `utils/py-common` with `proto-contracts`, `ts-interfaces`, `py-interfaces`, and `ts-core`, `ts-formatters`, `ts-pose-math`, `ts-design-tokens`, `py-common`, `py-nlp` (`libs/<domain>/<lang>-<name>`).
- Lines 26–50 (Mermaid) & lines 52–67 (Phase table):
  - `P2O2` / `Phase 2C`: add Reflective Learning organisms/templates (`TopicCatalogGrid`, `ChapterReader`, `McqQuizRunner`, `SubjectiveQuizRunner`, `KeywordCurationDeck`, `QuestionCurationPanel`, `TopicIngestionPanel` + `TopicLibraryTemplate`, `StudyReaderTemplate`, `AssessmentTemplate`, `CurationWorkspaceTemplate`).
  - `P3U` / `Phase 3A`: `ts-core`, `ts-formatters`, `ts-pose-math`, `ts-design-tokens`, `py-common`, `py-nlp`.
  - `P3C` / `Phase 3B`: `proto-contracts`, `ts-interfaces`, `py-interfaces`.
  - `P3B` / `Phase 3C`: `ts-firebase`, `ts-supabase`, `ts-nestjs-*`, `java-spring-boot-*`, `ts-aws`, `ts-gcp`, `ts-azure`, `py-reflective-nlp`, `ts-reflective-api`.
  - `Phase 4C`: include `apps/api-reflective-learning`.
  - `P5` / `Phase 5A–5D`: expand to 5A (Interactive Live Coaching & Learning Platform: Yoga + PoseNet + Reels + Math/Science/Languages/Gym + Smart Whiteboard & auto-transcripts + Chat + Payments), 5B (Hand-Knitted Showcase & Ordering), 5C (Reflective Learning App — Wiki, Raw Text/Markdown, Books/PDF/EPUB), 5D (Couples Relationship Journal App).
  - Add links to `PORTFOLIO_IDEAS.md` and `docs/projects/` (e.g., `docs/projects/_TEMPLATE.md`, `docs/projects/reflective-learning.md`).
- Lines 146–158 (Phase 2C checklist): Add Reflective Learning organisms & templates.
- Lines 166–180 (Phase 3A checklist): Normalize paths to `libs/utils/ts-core`, `ts-formatters`, `ts-pose-math`, `ts-design-tokens`, `py-common`, and add `libs/utils/py-nlp`.
- Lines 233–266 (Phase 3B–3C checklist): Normalize to `proto-contracts`, `ts-interfaces`, `py-interfaces`, `dart-interfaces`, `java-interfaces`, `ts-firebase`, `ts-supabase`, `ts-nestjs-*`, `java-spring-boot-*`, `ts-aws`, `ts-gcp`, `ts-azure`, and add `libs/data-access/py-reflective-nlp` and `libs/data-access/ts-reflective-api`.
- Lines 277–282 (Phase 4C): Add `apps/api-reflective-learning`.
- Lines 285–303 (Phase 5): Expand 5A, keep 5B, add 5C (`apps/reflective-learning-*`) and 5D (`apps/couples-journal-*`), and link `PORTFOLIO_IDEAS.md` & `docs/projects/`.

---

## 2. Exhaustive Preservation Checklist for `docs/projects/reflective-learning.md` (`/home/antigravity/migration.md` Sections 1–7)

### 2.1 Path Normalization Table (Every Legacy Path -> Target Path)
| `migration.md` Path | Normalized Target Path in `docs/projects/reflective-learning.md` |
|---|---|
| `libs/py-utils-text/` (or `libs/utils/py-text`) | `libs/utils/py-nlp/` (`scope:utils`, `type:util`, `lang:py`) |
| `libs/py-reflective-nlp/` | `libs/data-access/py-reflective-nlp/` (`scope:data-access`, `type:data-access`, `lang:py`) |
| `libs/data-access/data-access-interfaces/` | `libs/data-access/ts-interfaces/` (and `proto-contracts` / `py-interfaces`) |
| `libs/data-access/reflective-learning-api/` | `libs/data-access/ts-reflective-api/` (`scope:data-access`, `type:data-access`, `lang:ts`) |
| `libs/features/reflective-learning/` | `libs/features/ts-reflective-learning/` (`scope:features`, `type:feature`, `lang:ts`) |
| `apps/api-reflective-learning/` | `apps/api-reflective-learning/` (`scope:app`, `type:app`, `lang:py`) |
| `apps/reflective-learning-web/`, `apps/reflective-learning-mobile/` | `apps/reflective-learning-web/`, `apps/reflective-learning-mobile/` |

### 2.2 Complete Content Preservation Checklist (Nothing Dropped)
1. **Section 1 — Executive Summary & 6 Legacy Bugs Fixed** (`migration.md` lines 8–26):
   - Kivy + `.pkl` -> Client–API–Domain decoupling (`libs/data-access/*` + `libs/ui/*`), Selenium/ChromeDriver removal, `lifespan` singletons, ~1–2 GB `glove-wiki-gigaword-300`/`en_use_lg` -> ONNX `fastembed` (`BAAI/bge-small-en-v1.5`) + optional LLM, SQLModel/SQLAlchemy 2.0 async + Pydantic v2.
   - All **6 legacy bugs** fixed:
     1. `ScrapeText.get_raw_text()`: `zip(paras, heads)` interleaved mismatched headings/paragraphs & dropped trailing paragraphs.
     2. `ProcessText`: mutating `self.paragraphs` / `self.text_per_para` with `.pop()` during `enumerate()`; `normalize_case()` reassigned loop var `words = words.lower()`; `remove_punctuations()` discarded `re.sub()` return value.
     3. `ExtractKeyWords.get_kw_freq()`: single shared counter `i` across all keywords instead of per-keyword frequency counts.
     4. `CorrectKWScreen`: incremented `self.srno += 1` while calling `self.updated_unchecked.remove(...)`, skipping every other keyword.
     5. `StudentTopic` / `SubjectiveQuestionScreen`: referenced undefined `rl.qag` / `self.rl.qag` fallback when `.pkl` files were absent.
     6. `MainScreen`: hardcoded plaintext credentials (`'s': '1'`, `'t': 'a'`, `'a': 'q'`).
2. **Section 2 — Roles, Flow Diagram, 10 Features & 10 `.pkl` Schemas** (`migration.md` lines 29–90):
   - 3 user roles (`Student`, `Teacher`, `Admin`), Mermaid flow diagram, 10-row legacy feature table (`1. Topic Scraping` through `10. Teacher Keyword & Question Curation`).
   - All **10 `.pkl` schemas** (verified against `Topics/Black Hole/`, `len=94`): `text.pkl`, `keywords.pkl`, `people_names.pkl`, `similar_words.pkl`, `questions.pkl`, `options.pkl` (index `0` correct before server-side shuffle), `subj_questions.pkl`, `subj_answers.pkl`, `unchecked_kw.pkl` / `checked_kw.pkl` / `correct_kw.pkl`, `csubj_questions.pkl`.
3. **Section 3 — Target Architecture & `libs/utils` vs `libs/data-access` Split** (`migration.md` lines 93–133):
   - Pure utilities in `libs/utils/py-nlp`: `clean_text()`, `sentences_per_parra()` / sentence segmentation, `plural_to_singular()` / `singular_to_plural()`, pure algorithmic keyword extractors (`yake` / `TextRank` / `TF-IDF`), `mask_keyword_in_sentence()`, `cosine_similarity(v1, v2)`.
   - Stateful/I/O in `libs/data-access/py-reflective-nlp`: generalized `ContentSourceProvider` (Wikipedia, Raw Text/Markdown, PDF/EPUB), LLM SDK clients, embedding/spaCy singletons, SQL repositories.
   - Thin deployable FastAPI shell in `apps/api-reflective-learning`.
4. **Section 4 — Python `>=3.12` Modernization, Generalized `ContentSourceProvider`, 11 Endpoints, Two-Tier Grading & LLM Generator** (`migration.md` lines 136–650 + `implementation_plan.md` line 158):
   - Performance upgrade table (7 rows: Wikipedia/Sources fetch, Text Processing `nlp.pipe`, Keyword Extraction, 3-Tier Distractor Generation, ONNX Subjective Grading, SQLModel Async Persistence, BackgroundTasks/Taskiq + SSE).
   - Generalized **`ContentSourceProvider`** (`Protocol`) supporting:
     - `WikipediaApiSource` (MediaWiki Action API `extracts`)
     - Raw Text / Markdown ingestion source (heading-aware section splitting)
     - Books / PDF / EPUB ingestion source (chapter/page extraction into `ParagraphDTO`)
   - `uv` workspace `pyproject.toml` snippets updated for `libs/utils/py-nlp`, `libs/data-access/py-reflective-nlp`, and `apps/api-reflective-learning`.
   - Domain DTOs (`IngestionStatus`, `GradeBand`, `ParagraphDTO`, `KeywordDTO`, `MCQQuestionDTO`, `SubjectiveQuestionDTO`, `SubjectiveGradeResult`, `TopicSummaryDTO`) & Protocols (`ContentSourceProvider`/`TopicSourceProvider`, `KeywordExtractor`, `DistractorGenerator`, `SemanticGrader`).
   - `WikipediaApiSource`, `FastEmbedSemanticGrader` (`BAAI/bge-small-en-v1.5`, bands `>=0.75`, `0.40–0.75`, `0.20–0.40`, `<0.20`), FastAPI `lifespan` `AppState` skeleton.
   - All **11 API endpoints** (`POST /api/v1/topics/ingest`, `GET /api/v1/topics/{id}/events` SSE, `GET /api/v1/topics`, `GET /api/v1/topics/{id}/chapters`, `POST /api/v1/topics/{id}/quizzes/mcq`, `POST /api/v1/quizzes/mcq/{session_id}/submit`, `GET /api/v1/topics/{id}/subjective-questions`, `POST /api/v1/subjective-questions/{qid}/grade`, `GET/PATCH /api/v1/topics/{id}/curation/keywords`, `GET/PATCH /api/v1/topics/{id}/curation/questions`, `GET /api/v1/topics/{id}/debug/extractors`).
   - **Two-Tier Hybrid Grading**: Tier 1 `<15ms` `fastembed` (`>=0.82` clear pass, `<0.15` off-topic/empty) + Tier 2 borderline `0.15–0.82` / on-demand *"Explain"* LLM rubric evaluation against `rubric_key_points`.
   - **Smart LLM Generator (`LLMQuestionGenerator`)**: `BloomLevel` (`recall`, `understand`, `apply`), `DistractorChoice` (`text`, `misconception_note`), `SmartMCQItem`, `SmartSubjectiveItem`, `ChapterQuestionBundle`, `CHAPTER_PROMPT` — running once asynchronously at ingestion time for zero runtime quiz latency.
5. **Section 5 — UI Extraction & Atomic Design Mapping** (`migration.md` lines 654–881):
   - Legacy Kivy widget -> existing 11 Atoms + 5 Molecules table + Wave 2 Molecules note.
   - **7 Domain Organisms**: `TopicCatalogGrid`, `ChapterReader`, `QuizLauncherCard` / `McqQuizRunner`, `SubjectiveQuizRunner`, `KeywordCurationDeck`, `QuestionCurationPanel`, `TopicIngestionPanel` (plus `QuizAnalysisSummary`, `SubjectiveAnalysisSummary`, `ExtractorComparisonPanel`).
   - **5 Page Templates**: `AuthTemplate`, `TopicLibraryTemplate`, `StudyReaderTemplate`, `AssessmentTemplate`, `CurationWorkspaceTemplate` (`AdminIngestionTemplate`).
   - TypeScript contract skeletons (`TopicCardItem`, `TopicCatalogOrganismProps`, `ChapterReaderOrganismProps`, `McqOptionItem`, `McqQuizOrganismProps`, `SubjectiveQuizOrganismProps`, `KeywordCurationOrganismProps`; `TopicLibraryTemplateProps`, `StudyReaderTemplateProps`, `AssessmentTemplateProps`, `CurationWorkspaceTemplateProps`) + `McqQuizOrganism` React composition example (normalized to `libs/features/ts-reflective-learning`).
6. **Section 6 — Legacy Data Migration Script** (`migration.md` lines 884–931):
   - Full `scripts/export_legacy_pickles.py` preserving all 10 existing topics (`Artificial Intelligence`, `Black Hole`, `Car`, `Electron`, `India`, `Proton`, `Saturn`, `Star`, `Supernova`, `Water`) and all `.pkl` fields.
7. **Section 7 — Phased Migration Roadmap** (`migration.md` lines 935–952):
   - Normalized 4-phase execution path (`libs/utils/py-nlp` + `libs/data-access/py-reflective-nlp` + `apps/api-reflective-learning` -> `libs/data-access/ts-reflective-api` + `libs/features/ts-reflective-learning` -> `atomic-design-interfaces` + 4 UI libs -> `apps/reflective-learning-{web,mobile}`), plus E2E & coverage gates (`>=80%` / `>=90%` utils).

---

## 3. Git Status & `docs/` Verification
- `git status`: On `main` (ahead of `origin/main` by 45 commits); no modified tracked files; only `.agents/teamwork/` and `PROJECT.md` are untracked.
- `ls -la docs`: `docs/` does not exist yet (`No such file or directory`), so Track A will create `docs/projects/_TEMPLATE.md` and `docs/projects/reflective-learning.md`.
