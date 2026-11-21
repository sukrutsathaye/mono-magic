# Sub-Milestone SM2 Handoff — `libs/ui/react-mui` (`ui/react-mui-setup`)

## Summary
Completed Sub-Milestone SM2 for `libs/ui/react-mui` in isolated worktree `/home/antigravity/sukrutsathaye/wt-react-mui` (branch `ui/react-mui-setup`) with **2 clean, lint-passing, typecheck-passing, fully tested atomic commits** (Commits #3 and #4). Zero root files, zero `libs/ui/atomic-design-interfaces` files, zero `.agents/` files, and zero `.png` / `storybook-static` artifacts were modified or committed.

---

## Atomic Commits

### Commit #3 — `44b8599726694cb4f3db9dc95c1930fda9f5eea6`
- **Message**:
  ```
  refactor(react-mui): decouple MagicTextInput into bare control and add MagicFormField

  Align MagicTextInput with ng-mat strict atomic separation by moving
  labels, hints, error messages, and prefix/suffix slots into the new
  MagicFormField molecule wired via React 19 MagicFormFieldContext, and
  compose MagicFormField + MagicTextInput + MagicButton in MagicSearchBar.

  BREAKING CHANGE: MagicTextInput now implements bare TextInputControlProps
  and no longer accepts label, helperText, errorText, or variant props.
  Wrap MagicTextInput in MagicFormField for labels, hints, errors, and affixes.
  ```
- **Files Created / Modified** (all strictly under `libs/ui/react-mui/`):
  - `libs/ui/react-mui/src/lib/molecules/form-field/form-field.tsx` *(created)* — `MagicFormField` & `MagicFormFieldProps` extending `FormFieldMoleculeProps` with `children`, `prefix`, `suffix`, `fullWidth` (default `true`), `required`, `disabled`, `sx`, `className`, and React 19 direct `ref`. Wraps `@mui/material/FormControl`, `@mui/material/InputLabel`, `@mui/material/FormHelperText`, and renders `<MagicFormFieldContext value={contextValue}>` directly (no `.Provider`), supporting `outlined`/`filled`, `floatLabel` (`auto`/`always`), `subscriptSizing` (`fixed`/`dynamic`), `hideRequiredMarker`, `errorText` precedence over `hint` with `role="alert"`, and upward `required`/`disabled`/`focused`/`filled` synchronization.
  - `libs/ui/react-mui/src/lib/molecules/form-field/form-field.stories.tsx` *(created)* — 8 stories (`Default`, `Filled`, `WithHint`, `WithError`, `WithAffixes`, `FloatLabelAlways`, `RequiredAndHideMarker`, `Sizes`) with JSDoc, categorized `argTypes`, and `play` assertions.
  - `libs/ui/react-mui/src/lib/molecules/form-field/form-field.spec.tsx` *(created)* — 9 unit tests (100% Stmts / 97.22% Branch / 100% Funcs / 100% Lines).
  - `libs/ui/react-mui/src/lib/atoms/text-input/text-input.tsx` *(modified)* — Strict breaking refactor implementing bare `TextInputControlProps` (zero `label`, `helperText`, `errorText`, or `variant` props) with `defaultValue` via `useControllableState`, `invalid`, `fullWidth`, `autoComplete`, `onChange`, `onSubmit`, `onFocus`, `onBlur`, `sx`, MUI v9 `slotProps`, `className`, and React 19 direct `ref`. Renders `@mui/material/OutlinedInput` or `@mui/material/FilledInput` via `useMagicFormFieldContext()`, wires `startAdornment`/`endAdornment` (`MagicIcon` for string icon names or custom `ReactNode`), and works standalone and with native `<form>` / `FormData`.
  - `libs/ui/react-mui/src/lib/atoms/text-input/text-input.stories.tsx` *(modified)* — 8 stories (`Default`, `Standalone`, `InputTypes`, `Sizes`, `States`, `WithAffixes`, `ErrorAndValidation`, `Uncontrolled`) with JSDoc, categorized `argTypes`, and `play` assertions.
  - `libs/ui/react-mui/src/lib/atoms/text-input/text-input.spec.tsx` *(modified)* — 5 unit tests (100% Stmts / 96.66% Branch / 100% Funcs / 100% Lines).
  - `libs/ui/react-mui/src/lib/molecules/search-bar/search-bar.tsx` *(modified)* — Refactored into semantic `<Box component="form" role="search">` composing `MagicFormField` (`prefix={<MagicIcon icon="search" size={size} />}`) + bare `MagicTextInput` (`type="search"`) + `MagicButton` (`type="submit"`), using `useControllableState` for controlled `query` and uncontrolled `defaultQuery`.
  - `libs/ui/react-mui/src/lib/molecules/search-bar/search-bar.stories.tsx` *(modified)* — 6 stories (`Default`, `WithInitialQuery`, `Loading`, `Disabled`, `Sizes`, `ButtonVariants`) with JSDoc, categorized `argTypes`, and `play` assertions.
  - `libs/ui/react-mui/src/lib/molecules/search-bar/search-bar.spec.tsx` *(modified)* — 4 unit tests (100% Stmts / 89.47% Branch / 100% Funcs / 100% Lines).
  - `libs/ui/react-mui/src/lib/molecules/index.ts` *(modified)* — Exports `./form-field/form-field` and `./search-bar/search-bar`.

### Commit #4 — `5827927aa8f6373814cae4a3c173438ee15ee9b2`
- **Message**: `feat(react-mui): upgrade MagicButton with kinds, shapes, icons, and full parity`
- **Files Modified** (all strictly under `libs/ui/react-mui/`):
  - `libs/ui/react-mui/src/lib/atoms/button/button.tsx` *(modified)* — Full Material 3 parity upgrade unifying `@mui/material/Button`, `@mui/material/IconButton`, and `@mui/material/Fab`:
    - All 5 variants (`filled`, `tonal`, `outlined`, `elevated`, `text`) using `resolveMagicIntentColors(theme, color)`
    - All 5 kinds (`default`, `icon`, `fab`, `mini-fab`, `extended-fab`)
    - All 4 shapes (`default`, `square`, `rounded`, `pill`) via `MAGIC_SHAPE_RADIUS`
    - All 5 sizes (`xs`..`xl`) via `MAGIC_SIZE_METRICS` and all 7 `ColorIntent` values
    - Native MUI v9 `loading` on `Button` & `IconButton`, spinner indicator on `Fab`, `loadingLabel` support with `loadingPosition="start"`, `aria-busy`
    - `disabledInteractive` (`aria-disabled="true"` keeping focusable/hoverable while preventing clicks)
    - String (`MagicIcon`) and custom `ReactNode` `leadingIcon` / `trailingIcon`, `children` overriding `label`, `slotProps`, `sx`, `className`, and React 19 direct `ref`
  - `libs/ui/react-mui/src/lib/atoms/button/button.stories.tsx` *(modified)* — 11 stories (`Default`, `Variants`, `Colors`, `Sizes`, `Shapes`, `Kinds`, `WithIcons`, `Loading`, `DisabledAndDisabledInteractive`, `FullWidth`, `CustomChildren`) with JSDoc, categorized `argTypes`, and `play` assertions.
  - `libs/ui/react-mui/src/lib/atoms/button/button.spec.tsx` *(modified)* — 7 comprehensive unit tests (98.03% Stmts / 93.15% Branch / 100% Funcs / 98.03% Lines).

---

## Verification Commands & Results (All Executed in `/home/antigravity/sukrutsathaye/wt-react-mui`)

| # | Command | Exit Code | Verbatim Summary Output |
|---|---|---|---|
| 1 | `pnpm exec nx run react-mui:lint` *(post-Commit #3 & #4)* | `0` | `Successfully ran target lint for project react-mui` |
| 2 | `pnpm exec nx run react-mui:typecheck` *(post-Commit #3 & #4)* | `0` | `Successfully ran target typecheck for project react-mui and 1 task it depends on` (`tsc --build --emitDeclarationOnly`) |
| 3 | `pnpm exec nx run react-mui:test -- --coverage` *(Commit #3)* | `0` | `Test Files 8 passed (8)`, `Tests 37 passed (37)` — Coverage: **All files 100% Stmts / 97.04% Branch / 100% Funcs / 100% Lines** |
| 4 | `pnpm exec nx run react-mui:test -- --coverage` *(Commit #4)* | `0` | `Test Files 8 passed (8)`, `Tests 42 passed (42)` — Coverage: **All files 99.42% Stmts / 95.09% Branch / 100% Funcs / 99.42% Lines** (well above `>=80%` threshold across every metric) |
| 5 | `pnpm exec nx run react-mui:build-storybook` | `0` | Built `libs/ui/react-mui/storybook-static/index.html` cleanly |
| 6 | `pnpm exec nx run react-mui:test-storybook -- -u` | `0` | `Test Files 4 passed (4)`, `Tests 33 passed (33)` in Playwright Chromium (`button`: 11, `text-input`: 8, `form-field`: 8, `search-bar`: 6) |
| 7 | `pnpm exec nx run react-mui:test-storybook` | `0` | `Test Files 4 passed (4)`, `Tests 33 passed (33)` in Playwright Chromium — all play assertions, a11y checks, and visual snapshots matched `__vis__/local/__baselines__/` |
| 8 | `git status --short` *(after Commit #4)* | `0` | Clean working tree (empty output). Zero `.png`, zero `storybook-static/`, zero `.agents/` tracked. |

---

## Notes & Caveats for Downstream Workers
1. **Vitest unit test assertions**: `@testing-library/jest-dom` is not globally registered in the `react-mui` jsdom Vitest project, so unit tests in `*.spec.tsx` use standard Vitest DOM assertions (`el.getAttribute(...)`, `input.disabled`, etc.) while `*.stories.tsx` `play` tests use `storybook/test` matchers (`toBeInTheDocument`, `toHaveAttribute`, `toBeDisabled`, etc.).
2. **Vite dependency optimization in `test-storybook`**: When introducing new `@mui/material/*` subpaths for the first time, Vite's browser optimizer may trigger a single mid-run reload on the initial `test-storybook` run until the newly optimized modules are cached; re-running `test-storybook` immediately runs cleanly with zero reloads.
3. **MUI v9 `Button` `slotProps`**: `@mui/material@9.5.0`'s `ButtonOwnProps` does not declare a `slotProps` prop, so `MagicButton` exports `MagicButtonSlotProps` (`{ root?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color' | 'onClick' | 'type'> }`) and forwards `slotProps?.root` consistently across `Button`, `IconButton`, and `Fab`.
