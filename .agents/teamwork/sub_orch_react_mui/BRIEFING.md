# Briefing — Milestone M1 (`libs/ui/react-mui`)

## Core Objective
Bring `libs/ui/react-mui` (`@mono-magic/react-mui`) to full 16-component parity with `libs/ui/ng-mat` and `@mono-magic/atomic-design-interfaces`, on branch `ui/react-mui-setup` in isolated git worktree `/home/antigravity/sukrutsathaye/wt-react-mui`, ready for PR #1 against `main`.

## Non-Negotiable Technical Contracts
1. **Strict Scope**: Only modify/create files inside `/home/antigravity/sukrutsathaye/wt-react-mui/libs/ui/react-mui/**`. NEVER touch root `package.json`, `.gitignore`, `nx.json`, or `libs/ui/atomic-design-interfaces/**`. NEVER commit `.agents/` or `*.png` baselines.
2. **7 Exact M3 Palettes & Tokens** (`src/lib/theme/mui-theme.tsx`):
   - `azure-blue` (default, Light), `light-theme` (Light), `dark-theme` (Dark), `rose-red` (Light), `cyan-orange` (Dark), `orange-red` (Light), `magenta-violet` (Dark) — exact hexes from `PROJECT.md`.
   - MUI v9 TypeScript module augmentation for `tertiary` & `neutral` + `*PropsColorOverrides`.
   - Semantic tokens (`error`, `success`, `warning`, `neutral`), `MAGIC_SIZE_METRICS` (`xs`..`xl`), `MAGIC_SHAPE_RADIUS` (`default`, `square`, `rounded`, `pill`).
3. **React 19 & MUI v9 Best Practices**:
   - `ref` as regular prop (NO `React.forwardRef`).
   - `<MagicFormFieldContext value={...}>` (NO `.Provider`).
   - `useId()` for SSR-safe ARIA IDs; shared `useControllableState<T>`.
   - MUI v9 `slotProps` API ONLY (NO deprecated `InputProps`, `MenuListProps`, `PaperProps`).
   - Native `loading` on `Button`/`IconButton`.
   - `MagicIcon` via `@mui/material/Icon` (Material Icons font) OR custom `ReactNode`.
4. **Storybook 10, Autodocs, Vis & Vitest 4**:
   - `project.json`: override `test` -> `vitest run --project=react-mui`; add `test-storybook` -> `vitest run --project=react-mui-storybook`; omit `build-storybook` override (keep inferred `storybook-static` for `tools/ci/storybook-pages.mjs`).
   - `vite.config.mts`: top-level `test.coverage` (v8, `include: ['src/lib/**/*.{ts,tsx}']`, excluding stories/specs/barrels, `thresholds: { lines: 80, statements: 80, functions: 80, branches: 80 }`); `test.projects`: `react-mui` (jsdom) + `react-mui-storybook` (Playwright Chromium with dynamic `/usr/bin/chromium` fallback + `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`, `storybook-addon-vis` `optimizeDeps` for `ssim.js` & `pngjs`).
   - `.storybook/{main.ts, preview.tsx, DocumentationTemplate.mdx, vitest.setup.ts, typings.d.ts}` + `tsconfig.storybook.json` (`jsx: "react-jsx"`, `types: ["node"]`): `react-docgen-typescript` with `tsconfigPath: './tsconfig.lib.json'` & `propFilter` excluding `node_modules`; `defineStorybookVis` mirroring `ng-mat` `snapshotRootDir`; `setProjectAnnotations`; 7-palette toolbar; `tags: ['autodocs', 'snapshot']`; Material Icons font loader + disabled animations.
5. **Testing Packages Note**: `@testing-library/user-event` and `@mui/icons-material` are NOT root deps. Use `fireEvent` from `@testing-library/react` in `*.spec.tsx` and `userEvent`/`expect`/`within`/`fn` from `storybook/test` in `*.stories.tsx`.
6. **Breaking Refactor**: `MagicTextInput` -> bare `TextInputControlProps` consuming `MagicFormFieldContext`; new `MagicFormField`; refactored `MagicSearchBar` composing `MagicFormField` + `MagicTextInput` + `MagicButton` (commit with `BREAKING CHANGE:` footer).
