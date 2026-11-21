# Project: Multi-Platform UI Component Parity (`react-mui`, `rn-paper`, `fl-mat`)

## Architecture
Bring `libs/ui/react-mui`, `libs/ui/rn-paper`, and `libs/ui/fl-mat` to full `ng-mat` component, ergonomic wrapper, Material 3 theming, Storybook 10 / Widgetbook 3.25 documentation, visual regression, and testing parity (`>=80%` coverage) backed by `@mono-magic/atomic-design-interfaces` (and its Dart mirror in `libs/ui/fl-mat/lib/src/interfaces/atomic_interfaces.dart`).

### Parallel Isolation Model
Each library track runs concurrently in an isolated `git worktree` branched cleanly off `main` (`4eaebe4`):
- **Track 1 (`M1`)**: Branch `ui/react-mui-setup` at `/home/antigravity/sukrutsathaye/wt-react-mui` — writes ONLY under `libs/ui/react-mui/**`.
- **Track 2 (`M2`)**: Branch `ui/rn-paper-setup` at `/home/antigravity/sukrutsathaye/wt-rn-paper` — writes ONLY under `libs/ui/rn-paper/**`.
- **Track 3 (`M3`)**: Branch `ui/fl-mat-setup` at `/home/antigravity/sukrutsathaye/wt-fl-mat` — writes ONLY under `libs/ui/fl-mat/**`.
- **Track 4 (`M4`)**: Cross-Library Parity, CI (`gh pr checks`), Showcase Discovery (`storybook-pages.mjs discover`), Audit, and Worktree Cleanup (`git worktree remove`).

Zero root files (`package.json`, `.gitignore`, `nx.json`, `libs/ui/atomic-design-interfaces/**`) are modified on any branch, guaranteeing conflict-free merges in any order. All Teamwork state metadata stays strictly under `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/` and is NEVER created inside or committed from any worktree.

## Code Layout
- `libs/ui/react-mui/` (Branch `ui/react-mui-setup`):
  - `project.json` (overrides `test` → `vitest run --project=react-mui`; adds `test-storybook` → `vitest run --project=react-mui-storybook`; leaves `build-storybook` inferred → `storybook-static`)
  - `vite.config.mts` (top-level `test.coverage` with `>=80%` thresholds; `test.projects`: `react-mui` jsdom + `react-mui-storybook` Playwright Chromium with `/usr/bin/chromium` fallback + `storybook-addon-vis` `optimizeDeps`)
  - `tsconfig.storybook.json` (`jsx: "react-jsx"`, `types: ["node"]`, includes `.storybook/*.d.ts`)
  - `.storybook/{main.ts, preview.tsx, DocumentationTemplate.mdx, vitest.setup.ts, typings.d.ts}`
  - `src/lib/theme/mui-theme.tsx` (7 M3 palettes, `tertiary`/`neutral` module augmentation, semantic `success`/`warning`/`neutral` tokens, size & shape metrics)
  - `src/lib/core/{icon.tsx, use-controllable-state.ts, use-controllable-state.spec.ts, form-field-context.tsx}`
  - `src/lib/atoms/{badge, button, button-toggle, check-box, chip, progress-indicator, radio-button, slide-toggle, slider, text-input, tool-tip}/{<name>.tsx, <name>.stories.tsx, <name>.spec.tsx}` + `src/lib/atoms/index.ts`
  - `src/lib/molecules/{card, form-field, menu, search-bar, select}/{<name>.tsx, <name>.stories.tsx, <name>.spec.tsx}` + `src/lib/molecules/index.ts`
  - `src/index.ts`, `README.md`
- `libs/ui/rn-paper/` (Branch `ui/rn-paper-setup`):
  - `project.json` (overrides `test` → `vitest run --project=rn-paper`; adds `test-storybook` → `vitest run --project=rn-paper-storybook`; leaves `build-storybook` inferred → `storybook-static`)
  - `vite.config.mts` (top-level `rnPaperWebPlugin()`, `resolve.alias`, `define`, `optimizeDeps.rolldownOptions`, top-level `test.coverage` `>=80%` thresholds; `test.projects` using `extends: true` for `rn-paper` jsdom + `rn-paper-storybook` Playwright Chromium with `/usr/bin/chromium` fallback)
  - `tsconfig.storybook.json` (`jsx: "react-jsx"`, `types: ["node"]`, includes `.storybook/*.d.ts`)
  - `.storybook/{main.ts, preview.tsx, DocumentationTemplate.mdx, vitest.setup.ts, typings.d.ts}`
  - `src/lib/theme/paper-theme.tsx` (7 M3 Paper themes, `MagicPaperSemanticContext`, `useMagicPaperColors()`, Material Icons web font renderer)
  - `src/lib/core/{icon.tsx, use-controllable-state.ts, use-controllable-state.spec.ts, form-field-context.tsx}`
  - `src/lib/atoms/{badge, button, button-toggle, check-box, chip, progress-indicator, radio-button, slide-toggle, slider, text-input, tool-tip}/{<name>.tsx, <name>.stories.tsx, <name>.spec.tsx}` + `src/lib/atoms/index.ts`
  - `src/lib/molecules/{card, form-field, menu, search-bar, select}/{<name>.tsx, <name>.stories.tsx, <name>.spec.tsx}` + `src/lib/molecules/index.ts`
  - `src/index.ts`, `README.md`
- `libs/ui/fl-mat/` (Branch `ui/fl-mat-setup`):
  - Keep `analysis_options.yaml` (`deprecated_member_use: ignore`) and `project.json` (`lint`, `test`, `widgetbook`, `build-widgetbook`) intact.
  - `lib/src/interfaces/atomic_interfaces.dart` (full 16-component Dart contract mirror)
  - `lib/src/theme/magic_theme.dart` (7 M3 themes + `MagicSemanticColors extends ThemeExtension` + `MagicSizeMetrics` + `MagicShapeRadius`)
  - `lib/src/core/{magic_icon.dart, magic_form_field_scope.dart}`
  - `lib/src/atoms/{badge, button, button_toggle, check_box, chip, progress_indicator, radio_button, slide_toggle, slider, text_input, tool_tip}/magic_<name>.dart`
  - `lib/src/molecules/{card, form_field, menu, search_bar, select}/magic_<name>.dart`
  - `lib/fl_mat.dart` (full barrel export)
  - `lib/widgetbook.dart` + `lib/widgetbook/{atoms,molecules}/*_use_cases.dart` (modular use cases with `context.knobs.*` + `MaterialThemeAddon`, `ViewportAddon`, `TextScaleAddon`, `AlignmentAddon`, `InspectorAddon`)
  - `test/fl_mat_test.dart`, `test/atoms/*_test.dart`, `test/molecules/*_test.dart`, `test/widgetbook_test.dart`
  - `README.md`

## Feature Inventory
Every feature from the 3 Survey Explorer reports and `ORIGINAL_REQUEST.md` is assigned to a milestone (zero unassigned features):

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | `react-mui` M3 Theme System & Core Helpers | 7 M3 palettes, `tertiary`/`neutral` augmentation, semantic tokens, `MagicIcon`, `useControllableState<T>`, `MagicFormFieldContext` | M1 | survey_1, survey_2 |
| 2 | `react-mui` Storybook 10, Autodocs, Vis & Vitest 4 Infra | `project.json`, dual-project `vite.config.mts` (`>=80%` coverage), `DocumentationTemplate.mdx`, `vitest.setup.ts`, `storybook-addon-vis` (`snapshotRootDir`), `react-docgen-typescript`, 7-palette switcher | M1 | survey_1, survey_2 |
| 3 | `react-mui` Strict `MagicFormField` + Bare `MagicTextInput` + `MagicSearchBar` | Refactor `MagicTextInput` to bare `TextInputControlProps` + `MagicFormField` + composed `MagicSearchBar` (`BREAKING CHANGE:`) | M1 | original_request, survey_1 |
| 4 | `react-mui` `MagicButton` Full Parity Upgrade | 5 variants, 5 kinds (`default`/`icon`/`fab`/`mini-fab`/`extended-fab`), 4 shapes, `loadingLabel`, icons, `children`, `sx`/`slotProps`/`ref` | M1 | survey_1, survey_2 |
| 5 | `react-mui` 9 New Atoms (`Badge`, `ButtonToggle`, `CheckBox`, `Chip`, `ProgressIndicator`, `RadioButton`, `SlideToggle`, `Slider`, `ToolTip`) | Full `atomic-design-interfaces` + `ng-mat` parity extras (subtask `tasks`, `draggable`/`input` chips, range slider + `defaultDisplayWith`) | M1 | survey_1, survey_2 |
| 6 | `react-mui` 3 New Molecules (`Card`, `Menu`, `Select`) | `MagicCard` slots/actions/chips/avatar, `MagicMenu` recursive submenus/triggers, `MagicSelect` single/multi/groups/`customTriggerSummary` | M1 | survey_1, survey_2 |
| 7 | `react-mui` Extensive Stories, `play` Tests, `>=80%` Unit Coverage & README | All 16 stories with categorized `argTypes`, JSDoc, `play` assertions, `>=80%` Vitest coverage, `test-storybook` Playwright pass, `README.md`, atomic commits & PR #1 | M1 | original_request, survey_2 |
| 8 | `rn-paper` M3 Theme System & Core Helpers | 7 M3 Paper themes, `MagicPaperSemanticContext`, `useMagicPaperColors()`, Material Icons web font `MagicIcon`, `useControllableState<T>`, `MagicFormFieldContext` | M2 | survey_1, survey_2 |
| 9 | `rn-paper` Storybook 10, Autodocs, Vis & Vitest 4 Infra | `project.json`, `extends: true` dual-project `vite.config.mts` (`>=80%` coverage), `DocumentationTemplate.mdx`, `vitest.setup.ts`, `storybook-addon-vis` (`snapshotRootDir`), docgen, 7-palette switcher | M2 | survey_1, survey_2 |
| 10 | `rn-paper` Strict `MagicFormField` + Bare `MagicTextInput` + `MagicSearchBar` | Refactor `MagicTextInput` to bare `TextInputControlProps` + `MagicFormField` + composed `MagicSearchBar` (`BREAKING CHANGE:`) | M2 | original_request, survey_1 |
| 11 | `rn-paper` `MagicButton` Full Parity Upgrade | Dynamic `useTheme()`, unified `Paper.Button`/`IconButton`/`FAB`, 5 variants, 5 kinds, 4 shapes, `loadingLabel`, icons, `children` | M2 | survey_1, survey_2 |
| 12 | `rn-paper` 9 New Atoms (`Badge`, `ButtonToggle`, `CheckBox`, `Chip`, `ProgressIndicator`, `RadioButton`, `SlideToggle`, `Slider`, `ToolTip`) | Pure-RN zero-native-dep `MagicSlider` (single/range/ticks/`displayWith`), horizontal+vertical `MagicButtonToggle`, subtask `MagicCheckBox`, 4-variant `MagicChip`, accessible `MagicToolTip` | M2 | survey_1, survey_2 |
| 13 | `rn-paper` 3 New Molecules (`Card`, `Menu`, `Select`) | `MagicCard` slots/actions/chips, `MagicMenu` drill-down submenus + `Portal`/`measureInWindow` jsdom safety, `MagicSelect` via `MagicFormField` + `Paper.Menu` | M2 | survey_1, survey_2 |
| 14 | `rn-paper` Extensive Stories, `play` Tests, `>=80%` Unit Coverage & README | All 16 stories with categorized `argTypes`, JSDoc, `play` assertions, `>=80%` Vitest coverage, `test-storybook` Playwright pass, `README.md`, atomic commits & PR #2 | M2 | original_request, survey_2 |
| 15 | `fl-mat` Local Flutter `3.50.0` SDK Setup + Dart Contracts, 7 M3 Themes & Core Helpers | Install Flutter `3.50.0` into `~/flutter`, expand `atomic_interfaces.dart` (all 16 contracts), `magic_theme.dart` (`MagicSemanticColors` `ThemeExtension`), const `MagicIcon` map, `MagicFormFieldScope` | M3 | survey_1, survey_3 |
| 16 | `fl-mat` Strict `MagicFormField` + Bare `MagicTextInput` + `MagicSearchBar` + `MagicButton` Upgrade | Refactor `MagicTextInput` to bare control + `MagicFormField` + `MagicSearchBar` (`BREAKING CHANGE:`) + full `MagicButton` parity | M3 | original_request, survey_3 |
| 17 | `fl-mat` 9 New Atoms + 3 New Molecules (Flutter 3.50 M3 Non-Deprecated APIs) | `Badge`, `ButtonToggle` (`SegmentedButton.direction`), `CheckBox` (subtasks), `Chip` (4 variants), `ProgressIndicator`, `RadioButton` (`RadioGroup`), `SlideToggle` (`Switch.activeThumbColor` + `thumbIcon`), `Slider` (`ShowValueIndicator.onDrag`), `ToolTip` (`constraints`), `Card`, `Menu` (`MenuAnchor` + `SubmenuButton`), `Select` | M3 | survey_1, survey_3 |
| 18 | `fl-mat` Modular Widgetbook 3.25 (`knobs` + Addons) + Dartdoc + `>=80%` Coverage & README | `lib/widgetbook/{atoms,molecules}/*_use_cases.dart`, `context.knobs.*`, `MaterialThemeAddon`/`ViewportAddon`/`TextScaleAddon`/`AlignmentAddon`/`InspectorAddon`, `///` Dartdoc, `flutter analyze` clean, `flutter test --coverage` >=80%, `build-widgetbook` pass, `README.md`, atomic commits & PR #3 | M3 | original_request, survey_3 |
| 19 | Cross-Library Parity, Showcase Discovery, PR CI Checks & Worktree Cleanup | Verify `node tools/ci/storybook-pages.mjs discover`, zero root/`.gitignore`/`.agents/`/PNG leakage across all 3 PRs, `gh pr checks` green on all 3 PRs, clean `git worktree remove` for all 3 temporary worktrees | M4 | original_request, survey_1 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|--------------|--------|
| M1 | `react-mui` Full Parity & PR #1 | Features #1–#7 on `ui/react-mui-setup` (`/home/antigravity/sukrutsathaye/wt-react-mui`) | none | IN_PROGRESS (`ad1818474f850d6fc377cd56dad80c65`) |
| M2 | `rn-paper` Full Parity & PR #2 | Features #8–#14 on `ui/rn-paper-setup` (`/home/antigravity/sukrutsathaye/wt-rn-paper`) | none | IN_PROGRESS (`f49c911b8a65de890a14bae7500dca4d`) |
| M3 | `fl-mat` Full Parity & PR #3 | Features #15–#18 on `ui/fl-mat-setup` (`/home/antigravity/sukrutsathaye/wt-fl-mat`) | none | IN_PROGRESS (`b851158dba1ad7b061c37c52ea01a238`) |
| M4 | Cross-Library E2E/CI Verification & Worktree Cleanup | Feature #19 across all 3 PRs and main workspace | M1, M2, M3 | PLANNED |

## Interface Contracts

### 1. Exact 7 Material 3 Palettes (Shared Across All 3 Libraries)
| Palette ID | Display Name | Mode | Primary / Container | Secondary / Container | Tertiary / Container | Surface / Container-Highest / On-Surface / Outline |
|---|---|---|---|---|---|---|
| `azure-blue` *(default)* | Azure Blue (Light) | light | `#005cbb` / `#d7e3ff` | `#565e71` / `#dae2f9` | `#343dff` / `#e0e0ff` | `#faf9fd` / `#e3e2e6` / `#1a1b1f` / `#74777f` |
| `light-theme` | Violet / Orange (Light) | light | `#7d00fa` / `#ecdcff` | `#645b70` / `#eadef7` | `#964900` / `#ffdcc7` | `#fef8fc` / `#e6e1e6` / `#1d1b1e` / `#7b757f` |
| `dark-theme` | Green / Orange (Dark) | dark | `#02e600` / `#015300` | `#bbcbb2` / `#3c4b37` | `#ffb787` / `#723600` | `#121410` / `#333531` / `#e2e3dc` / `#8d9387` |
| `rose-red` | Rose Red (Light) | light | `#ba005c` / `#ffd9e1` | `#74565d` / `#ffd9e1` | `#c00100` / `#ffdad4` | `#fff8f8` / `#ece0e1` / `#201a1b` / `#847376` |
| `cyan-orange` | Cyan Orange (Dark) | dark | `#00dddd` / `#004f4f` | `#b0cccb` / `#324b4b` | `#ffb787` / `#723600` | `#101414` / `#313635` / `#e0e3e2` / `#889392` |
| `orange-red` | Orange Red (Light) | light | `#964900` / `#ffdcc7` | `#755846` / `#ffdcc7` | `#c00100` / `#ffdad4` | `#fff8f5` / `#ece0da` / `#201a17` / `#84746a` |
| `magenta-violet` | Magenta Violet (Dark) | dark | `#ffabf3` / `#810081` | `#dabfd2` / `#554151` | `#d5baff` / `#5f00c0` | `#161215` / `#383337` / `#e9e0e4` / `#9a8d95` |

- **Semantic tokens**:
  - Error: Light `#ba1a1a` (on `#ffffff`, container `#ffdad6`, on-container `#410002`); Dark `#ffb4ab` (on `#690005`, container `#93000a`, on-container `#ffdad6`).
  - Success: Light `#1b6e3a` (on `#ffffff`, container `#a0f5b4`, on-container `#00210c`); Dark `#7fdc99` (on `#00391a`, container `#00522a`, on-container `#a0f5b4`).
  - Warning: Light `#8a5100` (on `#ffffff`, container `#ffdcbd`, on-container `#2d1600`); Dark `#ffb870` (on `#4a2800`, container `#693c00`, on-container `#ffdcbd`).
  - Neutral: `on-surface-variant` / `surface` / `surface-container-highest` / `on-surface`.
- **Size metrics (`AtomicSize`)**: `xs` (28/12/16/12), `sm` (32/13/18/14), `md` (40/14/18/24), `lg` (48/16/22/28), `xl` (56/18/24/32) — `[height / fontSize / iconSize / horizontalPadding]` in px/dp.
- **Shape radii**: `square` = 0, `rounded` = 8, `pill` = 999, `default` / `standard` = M3 component default.

### 2. Strict Atomic Separation Contract (`BREAKING CHANGE`)
- `MagicTextInput` implements bare `TextInputControlProps` ONLY (NO `label`, `helperText`, `errorText`, or `variant` props). It consumes `MagicFormFieldContext` (React/RN) or `MagicFormFieldScope` (Flutter) when wrapped in `MagicFormField`, and remains usable standalone.
- `MagicFormField` owns `label`, `hint`, `errorText`, `appearance`, `size`, `floatLabel`, `subscriptSizing`, `hideRequiredMarker`, `prefix`, and `suffix`.
- `MagicSearchBar` composes `MagicFormField` + `MagicTextInput` + `MagicButton`.

### 3. Visual Regression, `.gitignore` & Git Hygiene Contract
- `.gitignore` stays UNTOUCHED.
- `storybook-addon-vis` mirrors `ng-mat` `snapshotRootDir: ({ ci, platform }) => relative(process.cwd(), resolve(visRootDir, ci ? platform : 'local')) || '.'`.
- ZERO `.png` baselines and ZERO `.agents/` files may be committed on any branch.
- Atomic Conventional Commits (`feat(<lib>): ...`, `chore(<lib>): ...`, `refactor(<lib>): ...` with `BREAKING CHANGE:` footer, `test(<lib>): ...`, `docs(<lib>): ...`), each leaving the branch compiling and lint-clean.

### 4. Model Tiering ("Hydrogen") Contract
- **`inherit` (Primary)**: Sub-orchestrators, Explorers, Reviewers, Challengers, Forensic Auditors, and Workers handling architecture, theming, Storybook/Vis/Widgetbook infra, `MagicFormField`/`MagicTextInput`/`MagicSearchBar`, `MagicButton`, complex components (`MagicCheckBox`, `MagicChip`, `MagicSlider`, `MagicCard`, `MagicMenu`, `MagicSelect`), and final verification fixes.
- **`flash` (Hydrogen)**: Workers handling straightforward atoms (`MagicBadge`, `MagicButtonToggle`, `MagicProgressIndicator`, `MagicRadioButton`, `MagicSlideToggle`, `MagicToolTip`), extensive story/Widgetbook variant galleries, JSDoc/Dartdoc/README docs, and unit test coverage expansion.
