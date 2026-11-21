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

## 1. Unit Test Coverage

### JavaScript / TypeScript Libraries (`@vitest/coverage-v8`)
Projects: `atomic-design-interfaces`, `react-mui`, `ng-mat`, `rn-paper`

```bash
# Run unit tests with V8 coverage for a single project
pnpm nx test react-mui -- --coverage
pnpm nx test ng-mat -- --coverage
pnpm nx test rn-paper -- --coverage
pnpm nx test atomic-design-interfaces -- --coverage

# Run unit tests across all JS/TS UI libraries
pnpm nx run-many -t test -p atomic-design-interfaces,react-mui,ng-mat,rn-paper -- --coverage
```

- **Output Directory**: `libs/ui/<project>/test-output/vitest/coverage/`
- **Standard Reporters**: `text`, `html`, `lcov`, `json-summary`
- **Target Thresholds**: `80%` across `lines`, `statements`, `functions`, and `branches` (excluding `*.stories.*`, `*.spec.*`, `*.test.*`, and barrel `index.ts` files).

### Flutter Material Library (`fl-mat`)
```bash
# Run Flutter widget & unit tests
pnpm nx test fl-mat

# Generate LCOV coverage report (libs/ui/fl-mat/coverage/lcov.info)
cd libs/ui/fl-mat && flutter test --coverage
```

---

## 2. Storybook Interaction & Visual Test Coverage

Storybook tests run via `@storybook/addon-vitest` in Playwright Chromium (`--project=<project>-storybook`).

```bash
# Run Storybook tests with browser coverage enabled
pnpm nx test-storybook react-mui -- --coverage.enabled=true --coverage.reportsDirectory=./test-output/storybook/coverage
pnpm nx test-storybook ng-mat -- --coverage.enabled=true --coverage.reportsDirectory=./test-output/storybook/coverage
pnpm nx test-storybook rn-paper -- --coverage.enabled=true --coverage.reportsDirectory=./test-output/storybook/coverage
```

- **Output Directory**: `libs/ui/<project>/test-output/storybook/coverage/`

---

## 3. Workspace Quality Gates (Lint & Typecheck)

Always run full quality gates before completing a feature or maintenance task:

```bash
# Lint all UI libraries (ESLint for JS/TS + flutter analyze for fl-mat)
pnpm nx run-many -t lint -p atomic-design-interfaces,react-mui,ng-mat,rn-paper,fl-mat

# Typecheck all TypeScript libraries
pnpm nx run-many -t typecheck -p atomic-design-interfaces,react-mui,ng-mat,rn-paper

# Run all affected checks (as executed in CI)
pnpm nx affected -t lint test build
```
