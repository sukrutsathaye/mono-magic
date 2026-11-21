# Sub-Milestone SM1 Handoff — `libs/ui/react-mui` (`ui/react-mui-setup`)

## Summary
Completed Sub-Milestone SM1 for `libs/ui/react-mui` in isolated worktree `/home/antigravity/sukrutsathaye/wt-react-mui` (branch `ui/react-mui-setup`, branched cleanly off `main` at `4eaebe4`) with **2 clean atomic commits**. Zero root files, zero `libs/ui/atomic-design-interfaces` files, zero `.agents/` files, and zero `.png` / `storybook-static` artifacts were modified or committed.

---

## Atomic Commits

### Commit #1 — `42818a127597cdc46bd4e18a35ef76ca72c21969`
- **Message**: `feat(react-mui): add Material 3 theme palettes, semantic tokens, and core helpers`
- **Files Created / Modified** (all strictly under `libs/ui/react-mui/`):
  - `libs/ui/react-mui/src/lib/theme/mui-theme.tsx` *(modified)* — All 7 exact Material 3 palettes (`azure-blue`, `light-theme`, `dark-theme`, `rose-red`, `cyan-orange`, `orange-red`, `magenta-violet`), light/dark semantic tokens (`error`, `success`, `warning`, `neutral`), MUI v9 `Palette`/`PaletteOptions` (`tertiary`, `neutral`, `magic`) and `*PropsColorOverrides` module augmentations (`Button`, `IconButton`, `Fab`, `Badge`, `Chip`, `Checkbox`, `Radio`, `Switch`, `Slider`, `LinearProgress`, `CircularProgress`, `ToggleButton`, `ToggleButtonGroup`, `FormControl`, `InputBase`, `FormLabel`, `Icon`), `MAGIC_SIZE_METRICS`, `MAGIC_SHAPE_RADIUS`, `createMagicMuiTheme`, `MAGIC_MUI_THEMES`, `magicMuiTheme`, `resolveMagicIntentColors`, `MagicMuiThemeProvider`, and `Roboto, "Open Sans", sans-serif` typography.
  - `libs/ui/react-mui/src/lib/core/icon.tsx` *(created)* — `MagicIcon` supporting Material Icons font ligature strings (`@mui/material/Icon`) and custom `ReactNode` icons, `AtomicSize | number` sizing, `ColorIntent | 'inherit'` coloring, and clean decorative vs. semantic ARIA handling (explicitly clearing MUI `Icon`'s default `aria-hidden="true"` when `ariaLabel` is supplied).
  - `libs/ui/react-mui/src/lib/core/use-controllable-state.ts` *(created)* — React 19 `useControllableState<T>` supporting controlled/uncontrolled modes, functional updaters, sequential updates, and zero `useEffect` synchronization.
  - `libs/ui/react-mui/src/lib/core/form-field-context.tsx` *(created)* — React 19 `MagicFormFieldContext` (consumed via `<MagicFormFieldContext value={...}>`) and `useMagicFormFieldContext()`.
  - `libs/ui/react-mui/src/lib/core/index.ts` *(created)* — Barrel export for core helpers.
  - `libs/ui/react-mui/src/index.ts` *(modified)* — Added `export * from './lib/core';` while preserving all existing exports.
  - `libs/ui/react-mui/src/lib/theme/mui-theme.spec.tsx` *(created)* — 5 unit tests (100% coverage on `mui-theme.tsx`).
  - `libs/ui/react-mui/src/lib/core/use-controllable-state.spec.ts` *(created)* — 5 unit tests (100% coverage on `use-controllable-state.ts`).
  - `libs/ui/react-mui/src/lib/core/icon.spec.tsx` *(created)* — 5 unit tests (100% coverage on `icon.tsx`).
  - `libs/ui/react-mui/src/lib/core/form-field-context.spec.tsx` *(created)* — 2 unit tests (100% coverage on `form-field-context.tsx`).

### Commit #2 — `5861f561617439bab0cb724bb2abc8855042e28b`
- **Message**: `chore(react-mui): configure Storybook autodocs, visual testing, and Vitest coverage thresholds`
- **Files Created / Modified** (all strictly under `libs/ui/react-mui/`):
  - `libs/ui/react-mui/project.json` *(created)* — Isolates `test` to `vitest run --project=react-mui` (CI-safe jsdom, forwards `-- --coverage` cleanly) and adds `test-storybook` (`vitest run --project=react-mui-storybook`); leaves `build-storybook` inferred (`libs/ui/react-mui/storybook-static`) for `tools/ci/storybook-pages.mjs` compatibility.
  - `libs/ui/react-mui/vite.config.mts` *(modified)* — Top-level `plugins: [react()]`, top-level `test.coverage` (v8, `>=80%` thresholds on `lines`, `statements`, `functions`, `branches`), dual `test.projects` (`react-mui` jsdom + `react-mui-storybook` Playwright Chromium with dynamic `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` -> bundled -> `/usr/bin/chromium` fallback and `storybook-addon-vis` `optimizeDeps`).
  - `libs/ui/react-mui/tsconfig.storybook.json` *(modified)* — Set `"jsx": "react-jsx"`, added `"types": ["node"]`, and included `.storybook/*.d.ts`.
  - `libs/ui/react-mui/.storybook/typings.d.ts` *(created)* — `declare module '*.mdx'`.
  - `libs/ui/react-mui/.storybook/DocumentationTemplate.mdx` *(created)* — Autodocs template mirroring `ng-mat` (`Title`, `Subtitle`, `Description`, `Primary`, `## Props & Events`, `<Controls />`, `## Variations & States`, `<Stories includePrimary={false} />`).
  - `libs/ui/react-mui/.storybook/vitest.setup.ts` *(created)* — `setProjectAnnotations([a11yAddonAnnotations, projectAnnotations])`, disabled CSS animations/transitions style injection, and `vis.setup` Material Icons font loader with 3s fallback timeout.
  - `libs/ui/react-mui/.storybook/main.ts` *(modified)* — Added `@storybook/addon-docs`, `@storybook/addon-a11y`, `@storybook/addon-vitest`, `defineStorybookVis` (`snapshotRootDir` routing local runs to `__vis__/local` and CI runs to `__vis__/<platform>`), and `react-docgen-typescript` pointed at `./tsconfig.lib.json` filtering out `node_modules`.
  - `libs/ui/react-mui/.storybook/preview.tsx` *(modified)* — `tags: ['autodocs', 'snapshot']`, `beforeEach: visAnnotations.beforeEach`, Material Icons stylesheet injection, 7-palette toolbar switcher, `MagicMuiThemeProvider` + themed surface wrapper decorator, `a11y: { test: 'todo' }`, expanded `controls`, and `docs: { toc: true, page: DocumentationTemplate }`.

---

## Verification Commands & Results (All Executed in `/home/antigravity/sukrutsathaye/wt-react-mui`)

| # | Command | Exit Code | Verbatim Summary Output |
|---|---|---|---|
| 1 | `pnpm install --offline` | `0` | `Packages: +1918 ... Done in 10s using pnpm v12.18.0` |
| 2 | `pnpm exec nx run react-mui:lint` *(post-Commit #1 & #2)* | `0` | `Successfully ran target lint for project react-mui` |
| 3 | `pnpm exec nx run react-mui:typecheck` *(post-Commit #1 & #2)* | `0` | `Successfully ran target typecheck for project react-mui and 1 task it depends on` (`tsc --build --emitDeclarationOnly`) |
| 4 | `pnpm exec nx run react-mui:test -- --coverage` | `0` | `vitest run --project=react-mui --coverage` — `Test Files 7 passed (7)`, `Tests 22 passed (22)`. Coverage: **All files 97.05% Stmts / 93.25% Branch / 93.33% Funcs / 97.05% Lines** (`mui-theme.tsx`, `icon.tsx`, `use-controllable-state.ts`, `form-field-context.tsx` all 100%/100%/100%/100%). |
| 5 | `pnpm exec nx run react-mui:build-storybook` | `0` | `Building storybook v10.6.7`, `Vite v8.3.8`, `✓ 708 modules transformed`, output verified at `libs/ui/react-mui/storybook-static/index.html`. |
| 6 | `pnpm exec nx run react-mui:test-storybook` *(initial run)* | `1` *(expected)* | Launched `/usr/bin/chromium`, rendered all 6 stories across 3 files, wrote actual snapshots to `./__vis__/local/__results__/...` and reported missing baselines. |
| 7 | `pnpm exec nx run react-mui:test-storybook -- -u && pnpm exec nx run react-mui:test-storybook` | `0` | Both `-u` baseline generation and verification run passed: `Test Files 3 passed (3)`, `Tests 6 passed (6)` in Chromium against `__vis__/local/__baselines__/`. |
| 8 | `node tools/ci/storybook-pages.mjs discover` | `0` | Confirmed `react-mui` discovered with `"type": "storybook"` and `"outputDir": "libs/ui/react-mui/storybook-static"`. |
| 9 | `git status --short` *(after Commit #2)* | `0` | Clean working tree (empty output). Confirmed `storybook-static/` and `__vis__/local/` are gitignored and zero `.png` or out-of-scope files are tracked. |

---

## Notable Findings & Notes for Downstream Workers
1. **MUI v9 `InputLabel` color augmentation**: In `@mui/material@9.5.0`, `InputLabelProps['color']` references `FormLabelProps['color']` (there is no `InputLabelPropsColorOverrides`), so `FormLabelPropsColorOverrides` (plus `IconPropsColorOverrides`) was augmented in `mui-theme.tsx` — giving `InputLabel`, `FormLabel`, and `Icon` full `tertiary` and `neutral` support.
2. **MUI `Icon` default `aria-hidden`**: `@mui/material/Icon` sets `aria-hidden={true}` by default; `MagicIcon` explicitly passes `'aria-hidden': undefined` when `ariaLabel` is supplied so semantic icons with `role="img"` remain accessible.
3. **Vitest 4 + TypeScript `extends: true as const`**: Inside `defineConfig(() => ({ ... }))`, `extends: true` widens to `boolean` and fails `tsc --build`; `extends: true as const` resolves this cleanly.
4. **Storybook 10.6 `setProjectAnnotations` info notice**: Storybook 10.6 logs an informational notice that `@storybook/addon-vitest` auto-provisions preview annotations since 10.3 when `setProjectAnnotations` is present in `vitest.setup.ts`; it works cleanly with zero errors.
5. **Local vis baselines**: `libs/ui/react-mui/__vis__/local/` is populated and gitignored; downstream workers adding/updating stories can refresh local snapshots via `pnpm exec nx run react-mui:test-storybook -- -u` before verifying `pnpm exec nx run react-mui:test-storybook`.
