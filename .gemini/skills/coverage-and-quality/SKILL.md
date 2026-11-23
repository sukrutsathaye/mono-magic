---
name: coverage-and-quality
description: >-
  Runs and configures unit test coverage, Storybook browser test coverage, static analysis
  (lint), and typechecking across JS/TS (Vitest V8), Flutter (flutter test --coverage),
  and Python (uv / pytest), enforcing 80% minimum coverage thresholds and producing static
  HTML/LCOV reports. Use when checking code coverage, investigating coverage gaps, or running
  quality gates.
---

# Coverage & Quality Gates Runbook

Use this skill to execute, configure, or troubleshoot unit test coverage, Storybook test coverage, linting, and typechecking across the monorepo.

## 1. Unit Test Coverage Across All Polyglot Stacks

See [`polyglot-unit-testing`](../polyglot-unit-testing/SKILL.md) for per-language test authoring patterns.

### JavaScript / TypeScript Libraries (`@vitest/coverage-v8`)
- **UI Libraries (`>=80%`)**: `atomic-design-interfaces`, `react-mui`, `ng-mat`, `rn-paper`, `vue-vuetify`, `svelte-tw`
- **Data-Access Libraries (`>=80%`)**: `data-access-ts-interfaces`, `data-access-ts-firebase`, `data-access-ts-supabase`, `data-access-ts-reflective-api`
- **Pure Utility Libraries (`>=90%`)**: `utils-ts-core`, `utils-ts-formatters`

```bash
# Run unit tests with V8 coverage for a single project
pnpm nx test <project> -- --coverage
```

- **Output Directory**: `libs/<domain>/<project>/test-output/vitest/coverage/`
- **Standard Reporters**: `text`, `html`, `lcov`, `json-summary`

### Flutter Material Library (`fl-mat`, `>=80%`)
```bash
pnpm nx test-coverage fl-mat
```

### Python Libraries (`uv` / `pytest --cov`, `>=90%` utils / `>=80%` data-access)
Projects: `py-utils-common`, `py-utils-nlp`, `py-data-access-interfaces`, `py-reflective-nlp`
```bash
pnpm nx run-many -t test -p py-utils-common,py-utils-nlp,py-data-access-interfaces,py-reflective-nlp
```

### Rust & Go Utility Libraries (`>=90%`)
Projects: `rs-utils-pose-math`, `rs-utils-design-tokens`, `go-utils-core`
```bash
pnpm nx run-many -t test -p rs-utils-pose-math,rs-utils-design-tokens,go-utils-core
```

---

## 2. Storybook Interaction & Visual Test Coverage

Storybook tests run via `@storybook/addon-vitest` in Playwright Chromium (`--project=<project>-storybook`).

```bash
pnpm nx test-storybook-coverage react-mui
pnpm nx test-storybook-coverage ng-mat
pnpm nx test-storybook-coverage rn-paper
pnpm nx test-storybook-coverage vue-vuetify
pnpm nx test-storybook-coverage svelte-tw
```

- **Output Directory**: `libs/ui/<project>/test-output/storybook/coverage/`

---

## 3. Syncing README Coverage Tables & GitHub Pages Portal

Whenever new functions or unit tests are written:
```bash
# 1. Sync Test & Coverage Summary tables in libs/*/*/README.md and root README.md
node tools/ci/sync-readmes-and-coverage.mjs

# 2. Build non-UI library coverage reports into dist/storybook-pages/coverage/<project>
node tools/ci/storybook-pages.mjs build-coverage

# 3. Assemble the unified GitHub Pages showcase & coverage portal
node tools/ci/storybook-pages.mjs assemble
```

---

## 4. Workspace Quality Gates (Lint & Typecheck)

Always run affected quality gates before completing a task:

```bash
pnpm nx affected -t lint typecheck test
node tools/ci/generate-repo-index.mjs --check
node tools/ci/sync-readmes-and-coverage.mjs --check
```
