---
name: ui-react-mui
description: >-
  Designs and implements a React 19 + MUI v9 (@mui/material) Atomic Design component
  in libs/ui/react-mui following the Root Framework Superset + Smart Polymorphic Props
  pattern, with controlled/uncontrolled ergonomics, direct React 19 ref forwarding,
  Vitest unit tests (>=80%), 7-Category State Matrix Storybook stories, and visual baselines.
---

# React 19 + MUI v9 (`react-mui`) Component Playbook

Use this skill whenever creating, extending, or auditing an Atomic Design component (`Atom`, `Molecule`, `Organism`, or `Template`) in `libs/ui/react-mui`.

---

## 1. Core Design Philosophy: Root MUI Superset + Smart Polymorphic Props

Every `Magic<Component>` in `@mono-magic/react-mui` MUST act as both a **complete superset of the underlying MUI v9 component(s)** and an **intelligent composite facade**:

1. **100% Root MUI & Native HTML Prop Coverage**:
   - Extend the canonical `*AtomProps` / `*MoleculeProps` contract from `@mono-magic/atomic-design-interfaces`.
   - Expose all native MUI v9 capabilities and escape hatches:
     - `sx?: SxProps<Theme>` (merged cleanly via array syntax `[baseSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]`).
     - `slotProps?: Magic<Component>SlotProps` allowing consumers to pass any native HTML/MUI props directly to internal slots (`root`, `input`, `paper`, `backdrop`, etc.).
     - `className?: string`, `id?: string`, `testId?: string` (`data-testid`), `ariaLabel?: string`.
     - **React 19 Direct `ref` Prop**: Accept `ref?: Ref<HTMLElement>` directly in props (never use legacy `React.forwardRef`).
     - **Dual Controlled & Uncontrolled Mode**: Use `useControllableState` (`src/lib/core/use-controllable-state.ts`) so `value` + `onChange` and `defaultValue` both work seamlessly.
2. **Smart Polymorphic & Composite Props ("One Component, Multiple MUI Primitives")**:
   - Combine related MUI primitives and multi-prop patterns behind smart discriminator props that switch or compose internal elements automatically:
     - *Example (`MagicButton`)*: `kind: 'default' | 'icon' | 'fab' | 'mini-fab' | 'extended-fab'` switches internally between `<MuiButton>`, `<MuiIconButton>`, and `<MuiFab>`, while `variant: 'filled' | 'tonal' | 'outlined' | 'elevated' | 'text'` computes Material 3 surface/container colors via `resolveMagicIntentColors(theme, color)`.
     - *Example (`MagicProgressIndicator`)*: `type: 'bar' | 'spinner'` switches between `<LinearProgress>` and `<CircularProgress>` across all 4 `mode`s (`determinate`, `indeterminate`, `buffer`, `query`).
     - *Example (`MagicSlider`)*: `range: boolean` switches between single-number and `[rangeStart, rangeEnd]` dual-thumb MUI `<Slider>`.
     - *Example (`loading` & `disabledInteractive`)*: Automatically render an inline `<CircularProgress>`, set `aria-busy="true"`, and block clicks when `loading` is true; keep the element focusable with `aria-disabled="true"` (instead of native `disabled`) when `disabledInteractive` is true so tooltips and screen readers still work.
     - *Example (`MagicFormFieldContext`)*: Input controls (`MagicTextInput`, `MagicSelect`, `MagicDatePicker`) automatically consume `useMagicFormFieldContext()` when nested inside `MagicFormField`, or render standalone when used outside.

---

## 2. File Structure & Implementation Steps

Create `libs/ui/react-mui/src/lib/<tier>/<kebab-name>/`:
1. **`<kebab-name>.tsx`**:
   - Export `Magic<Component>Props`, `Magic<Component>SlotProps`, and `Magic<Component>`.
   - Consume tokens from `src/lib/theme/mui-theme.ts` (`MAGIC_SIZE_METRICS`, `MAGIC_SHAPE_RADIUS`, `resolveMagicIntentColors`).
   - Add complete TSDoc comments on the interface, every prop, and the component function per [`code-doc-generator`](../code-doc-generator/SKILL.md).
2. **`<kebab-name>.spec.tsx`**:
   - Follow [`polyglot-unit-testing`](../polyglot-unit-testing/SKILL.md) using `@testing-library/react` wrapped in `MagicMuiThemeProvider`.
   - Test all smart prop switches (`kind`, `variant`, `mode`, `range`), controlled vs. uncontrolled state, `loading` / `disabled` / `disabledInteractive`, `slotProps` / `ref` forwarding, keyboard navigation, and ARIA roles (`>= 80%` coverage across lines, statements, functions, branches).
3. **`<kebab-name>.stories.tsx`**:
   - Follow [`interactive-stories`](../interactive-stories/SKILL.md) implementing the **Canonical 7-Category Component State Matrix**:
     1. `Default` (with `Stateful<Component>Demo`, categorized `argTypes`, and `play` test)
     2. `Variants` / `Appearances`
     3. `SizesAndColors` (`xs`..`xl` + all 7 `ColorIntent`s)
     4. `DisabledAndLoading` (`disabled`, `disabledInteractive`, `readOnly`, `loading`)
     5. `ErrorAndEdgeCases` (validation errors, empty states, overflow)
     6. `CustomSlotsAndComposition` (icons, `slotProps`, custom slots)
     7. `DarkTheme` (wrapped in `<MagicMuiThemeProvider palette="dark-theme">`)
4. **`index.ts`**:
   - Re-export from `src/lib/<tier>/<kebab-name>/index.ts` and `src/lib/<tier>/index.ts`.

---

## 3. Verification & Post-Task Sync

```bash
# 1. Lint, typecheck, and run unit tests with V8 coverage
pnpm nx run-many -t lint typecheck -p atomic-design-interfaces,react-mui
pnpm nx test react-mui -- --coverage

# 2. Generate visual baselines and run Storybook browser tests
pnpm nx test-storybook react-mui -- -u src/lib/<tier>/<kebab-name>/<kebab-name>.stories.tsx
pnpm nx test-storybook react-mui

# 3. Update libs/ui/react-mui/README.md catalog and sync repo index & coverage tables
node tools/ci/generate-repo-index.mjs
node tools/ci/sync-readmes-and-coverage.mjs
```
