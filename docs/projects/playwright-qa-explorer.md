# Project Blueprint: Autonomous Playwright Visual-Crawl QA Explorer

- **Status**: `Blueprint Approved — Scheduled for Phase 4A / Quality Platform`
- **Target Phases**: `Phase 4A, Phase 5`
- **Primary Domains**: `libs/utils/ts-core`, `libs/data-access/ts-playwright-crawler`, `libs/features/ts-qa-explorer`, `apps/qa-explorer-web`
- **Owner / Last Design Review (`/grill-me`)**: `2026-11-25`

---

## 1. Problem & Goals

- **Problem Statement**: Manually writing and maintaining E2E, accessibility, and visual smoke tests across 7 UI Storybooks and 5+ Flagship Apps misses edge-case states, broken links, console errors, and WCAG regressions.
- **Core Objectives**:
  - **Wrap Proven OSS Instead of Reinventing**: Follow `mono-magic`'s NestJS-style wrapper philosophy by composing **Playwright**, **`@axe-core/playwright`** (WCAG 2.1 AA audits), **`storybook-addon-vis`** (existing visual diff baselines), and optional **Stagehand / Playwright MCP / `ts-ai-sdk`** for intelligent action planning.
  - **Dogfood `mono-magic` Directly**: Crawl our own deployed Storybooks (`react-mui`, `ng-mat`, `rn-paper`, `vue-vuetify`, `svelte-tw`) and Flagship Apps, detect uncaught console/network 5xx errors, WCAG violations, and layout regressions, and **emit clean, reproducible `.spec.ts` Playwright test files**.
  - Bounded deterministic crawl budgets (max depth, max pages, domain allowlist) so CI runs remain fast and predictable.
- **Target Personas & Roles**:
  - **QA / Frontend Engineer**: Runs `pnpm nx run qa-explorer:crawl --target=<url>`, reviews triage report, and commits generated `.spec.ts` regression tests.
- **Non-Goals / Out of Scope**:
  - Building a custom browser automation engine from scratch or performing offensive penetration testing on external sites.

---

## 2. Domain Boundaries (`libs/<domain>/<lang>-<name>` Mapping)

### Stack Selection Justification
Per [`docs/ARCHITECTURE_DECISION_MATRIX.md`](../ARCHITECTURE_DECISION_MATRIX.md):
- **Crawler & Wrapper (`ts-playwright-crawler` — TypeScript)**: Playwright, `@axe-core/playwright`, and Stagehand are first-class TypeScript libraries, allowing direct reuse of `@mono-magic/utils-ts-core` (`Result<T, E>`, `retryWithBackoff`).
- **Triage Console (`react-mui`)**: Reuses `MagicDataTable`, `Dialog`, `Tabs`, and `Chip` to inspect screenshots, console/network logs, axe violations, and generated `.spec.ts` diffs.

### Package & App Mapping

| Package / App Path | Nx Project Name | Tags (`scope:*`, `type:*`, `lang:*`) | Responsibility & Forbidden Dependencies |
| --- | --- | --- | --- |
| `libs/utils/ts-core` | `utils-ts-core` | `scope:utils`, `type:util`, `lang:ts` | `Result<T, E>`, URL normalization, crawl-budget & dedup helpers |
| `libs/data-access/ts-playwright-crawler` | `data-access-ts-playwright-crawler` | `scope:data-access`, `type:data-access`, `lang:ts` | Opinionated wrapper around Playwright + `@axe-core/playwright` + optional Stagehand/LLM action planner |
| `libs/features/ts-qa-explorer` | `features-ts-qa-explorer` | `scope:features`, `type:feature`, `lang:ts` | Finding deduplication, severity classification, and deterministic `.spec.ts` test emitter |
| `apps/qa-explorer-web` | `qa-explorer-web` | `scope:app`, `type:app`, `lang:ts` | Thin React + `react-mui` report viewer & crawl launcher (plus CLI entrypoint) |

---

## 3. SOLID & Optimization Strategy

- **SRP / OCP / LSP / ISP / DIP Alignment**:
  - `IExplorationStrategy`: Implemented by `DeterministicBfsCrawler` (zero LLM cost, fast CI default) and `AgenticStagehandCrawler` (optional LLM-guided form/flow exploration via `ts-ai-sdk`) (OCP/LSP).
  - `IFindingAuditor`: Pluggable auditors (`ConsoleErrorAuditor`, `NetworkFailureAuditor`, `AxeWcagAuditor`, `VisualDiffAuditor`).
- **Performance & Concurrency Design**:
  - Reuses a single Chromium browser instance with pooled `BrowserContext`s; enforces strict `maxPages`, `maxDepth`, and per-page timeouts.
- **Security & Secret Hygiene**:
  - Strict origin/localhost allowlist (refuses to crawl external domains unless explicitly configured); redacts `Authorization`/`Cookie` headers from saved traces.

---

## 4. Protobuf & Data-Access Contracts

- **Types**: `CrawlConfig`, `CrawlFinding` (`CONSOLE_ERROR | NETWORK_ERROR | A11Y_VIOLATION | VISUAL_DIFF`), `CrawlReport`, `GeneratedSpecFile` (aligned with `proto-contracts` / `ts-interfaces`).
- **CLI & API**: `qa-crawl --url http://localhost:4400 --max-pages 50 --emit-specs ./e2e/generated/`.

---

## 5. UI Organisms & Templates (`libs/ui/*`)

- **Reused Atoms & Molecules**: `Card`, `Chip`, `Badge`, `Tabs`, `Dialog`, `Alert`, `ProgressIndicator`, `Accordion`.
- **New Organisms & Templates**: `MagicDataTable` (findings list), `MagicAppShellTemplate`.

---

## 6. Testing & E2E Plan

- **Unit Coverage**: `>=90%` on URL dedup, severity classification, and `.spec.ts` code emitter; `>=80%` on `ts-playwright-crawler` and `ts-qa-explorer`.
- **Self-Test Fixture**: Spins up a tiny local HTML fixture with 1 intentional console error, 1 broken image (404), and 1 missing `alt` WCAG violation, and asserts all 3 findings + a runnable `.spec.ts` are emitted.
- **Dogfood CI Gate**: Runs deterministic crawl against built `react-mui` Storybook static output to verify zero console errors or critical axe violations.

---

## 7. Phased Milestones

1. **Milestone 1 — Wrapper & Deterministic Auditors**: Build `libs/data-access/ts-playwright-crawler` wrapping Playwright + `@axe-core/playwright`.
2. **Milestone 2 — Finding Triage & `.spec.ts` Emitter**: Build `libs/features/ts-qa-explorer` with self-test fixture suite.
3. **Milestone 3 — Optional Agentic Planner**: Wire Stagehand / `ts-ai-sdk` behind `IExplorationStrategy`.
4. **Milestone 4 — Dogfood & Report Viewer**: Run against `mono-magic` Storybooks and assemble `apps/qa-explorer-web`.
