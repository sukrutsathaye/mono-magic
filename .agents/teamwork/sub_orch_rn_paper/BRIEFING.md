# Milestone M2 Briefing — `libs/ui/rn-paper` (`ui/rn-paper-setup`)

## Core Objective
Bring `libs/ui/rn-paper` (`@mono-magic/rn-paper`) to full 16-component parity with `libs/ui/ng-mat` and `@mono-magic/atomic-design-interfaces`, with all 7 Material 3 Paper palettes, Storybook 10 Autodocs + a11y + `play` + `storybook-addon-vis`, Vitest 4 `>=80%` unit coverage thresholds, atomic Conventional Commits, and a Ready-for-Review PR #2 against `main`.

## Critical Architecture & Pitfalls (Verified)
1. **Worktree Isolation**: Work exclusively in `/home/antigravity/sukrutsathaye/wt-rn-paper` on branch `ui/rn-paper-setup`. Modify ONLY `libs/ui/rn-paper/**`. Never touch root `package.json`, `.gitignore`, `nx.json`, or `libs/ui/atomic-design-interfaces/**`. Never create `.agents/` or commit `*.png` in the worktree.
2. **7 Exact M3 Palettes**: `azure-blue` (default, light), `light-theme` (light), `dark-theme` (dark), `rose-red` (light), `cyan-orange` (dark), `orange-red` (light), `magenta-violet` (dark) with exact hex values from `PROJECT.md`, plus `MagicPaperSemanticContext` / `useMagicPaperColors()` for `success`/`warning`/`neutral`/`error` light/dark tokens and `MAGIC_PAPER_SIZE_METRICS` / `MAGIC_PAPER_SHAPE_RADIUS`. Always read colors dynamically via `useTheme()` + `useMagicPaperColors()`.
3. **React 19 + RN 0.85 + RN Paper v5 + Web**:
   - `ref` as regular prop (NO `React.forwardRef`), `<MagicFormFieldContext value={...}>` (NO `.Provider`), `useId()`, `useControllableState<T>`.
   - Zero native-only binary deps; 100% `react-native-web` compatibility (`Pressable`, `StyleSheet.create`, `accessibilityRole`/`accessibilityState`/`accessibilityValue`/`accessibilityLabel`).
   - Material Icons ligature web font (`fontFamily: '"Material Icons"'`) in `MagicPaperProvider` `settings.icon` & `MagicIcon`, plus custom `ReactNode` support.
   - `Paper.Menu` `measureInWindow` jsdom safety in `src/test-setup.ts` and component logic.
   - `Paper.SegmentedButtons` is horizontal-only -> horizontal uses `Paper.SegmentedButtons` (`multiSelect`), vertical uses accessible `Pressable` group.
   - `Paper.Tooltip` lacks `position`/`disabled` -> wrap cleanly (return unwrapped `children` when `disabled || !message`, accessible tooltip display).
4. **Storybook 10 & Vitest 4**:
   - `project.json`: override `test` -> `vitest run --project=rn-paper`, add `test-storybook` -> `vitest run --project=rn-paper-storybook`, leave `build-storybook` inferred (`storybook-static`).
   - `vite.config.mts`: top-level `rnPaperWebPlugin()`, `resolve.alias`, `resolve.extensions`, `define: { __DEV__: false }`, Vite 8 `optimizeDeps.rolldownOptions`, top-level `test.coverage` (`>=80%` thresholds); `test.projects` with `extends: true` for `rn-paper` (jsdom) and `rn-paper-storybook` (Playwright Chromium w/ `/usr/bin/chromium` fallback + `storybook-addon-vis` `optimizeDeps` for `ssim.js` & `pngjs`).
   - `.storybook/`: `main.ts` (`react-docgen-typescript` w/ `tsconfigPath: './tsconfig.lib.json'`, fallback to `'react-docgen'` only on parser error; `defineStorybookVis` mirroring `ng-mat` `snapshotRootDir`), `preview.tsx` (`tags: ['autodocs', 'snapshot']`, 7-palette switcher, Material Icons font loader, `DocumentationTemplate`), `DocumentationTemplate.mdx`, `vitest.setup.ts` (`setProjectAnnotations` + `vis.setup`), `typings.d.ts`, `tsconfig.storybook.json` (`jsx: "react-jsx"`, `types: ["node"]`).
   - Use `fireEvent` from `@testing-library/react` in `*.spec.tsx` (`@testing-library/user-event` is not a direct root dep) and `userEvent`/`expect`/`within`/`fn` from `storybook/test` in `*.stories.tsx`.
