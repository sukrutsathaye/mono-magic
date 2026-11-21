## 2026-11-21T01:22:32Z

You are Survey Explorer 2 (`react-mui` & `rn-paper` Codebase).

**MANDATORY FIRST STEP**: Read `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/ORIGINAL_REQUEST.md` and `/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/b39c754e-2c2f-442d-b476-7fed0f448c4f/implementation_plan.md` in full before investigating.

**Working directory**: `/home/antigravity/sukrutsathaye/mono-magic`
**Your state folder**: `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/explorer_survey_react_rn` (write your `handoff.md` here; NEVER modify source files).

**Objectives**:
1. Inspect everything currently in `libs/ui/react-mui/`:
   - `package.json`, `project.json` (if any), `tsconfig*.json`, `vite.config.mts`, `eslint.config.*`, `.storybook/*`, `README.md`.
   - All existing source files under `src/` (`index.ts`, `lib/theme/*`, `lib/atoms/*`, `lib/molecules/*`, existing tests and stories).
   - Check how Nx currently infers targets for `react-mui` (e.g., `pnpm exec nx show project react-mui --json` — read-only).
   - Check installed versions/exports of `@mui/material`, `@storybook/react-vite`, `@storybook/addon-docs`, `@storybook/addon-a11y`, `@storybook/addon-vitest`, `storybook-addon-vis`, `vitest`, `@vitest/coverage-v8`, `@vitest/browser-playwright`, `react-docgen-typescript`, `@testing-library/react`, `@testing-library/user-event` in `node_modules` / root `package.json`.
   - Identify any potential pitfalls (e.g., MUI v9 API changes, `slotProps` vs deprecated props, React 19 `ref` typing, Vitest 4 `test.projects` syntax, Playwright browser binaries installed in VM, eslint rules).
2. Inspect everything currently in `libs/ui/rn-paper/`:
   - `package.json`, `project.json` (if any), `tsconfig*.json`, `vite.config.mts`, `eslint.config.*`, `.storybook/*`, `README.md`.
   - All existing source files under `src/` (`index.ts`, `lib/theme/*`, `lib/atoms/*`, `lib/molecules/*`, existing tests and stories).
   - Check how Nx currently infers targets for `rn-paper` (`pnpm exec nx show project rn-paper --json`).
   - Check `rnPaperWebPlugin`, `react-native-web` aliasing, `react-native-paper` version and exact exported components (Badge, Button, IconButton, FAB, SegmentedButtons, Checkbox, Chip, ProgressBar, ActivityIndicator, RadioButton, Switch, TextInput, Tooltip, Card, HelperText, Menu, Portal, List, Divider, etc.), and how `react-docgen-typescript` / Storybook / Vitest jsdom & browser behave with `react-native-web` and `react-native-paper`.
   - Check if Playwright Chromium binary is already installed on the VM (read-only check).

**Output**: Write a detailed, structured report to `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/explorer_survey_react_rn/handoff.md` with exact file paths, current code structure, Nx targets, package versions, and technical pitfalls/recommendations for both libraries. Then send a concise completion message to your parent (`ebfed8123aa4623566770de48e20c027`).
