---
name: ui-rn-paper
description: >-
  Designs and implements an Expo 56 / React Native 0.85 + React Native Paper v5
  Atomic Design component in libs/ui/rn-paper following the Root Framework Superset
  + Smart Polymorphic Props pattern, with React Native Web accessibility parity,
  controlled/uncontrolled state, Vitest unit tests (>=80%), 7-Category State Matrix
  Storybook stories, and visual baselines.
---

# React Native 0.85 + React Native Paper v5 (`rn-paper`) Component Playbook

Use this skill whenever creating, extending, or auditing an Atomic Design component (`Atom`, `Molecule`, `Organism`, or `Template`) in `libs/ui/rn-paper`.

---

## 1. Core Design Philosophy: Root RN Paper Superset + Smart Polymorphic Props

Every `Magic<Component>` in `@mono-magic/rn-paper` MUST expose **all capabilities of the underlying `react-native-paper` v5 and `react-native` primitives** plus **smart cross-platform props**:

1. **100% Root React Native & Paper Prop Coverage**:
   - Extend `*AtomProps` / `*MoleculeProps` from `@mono-magic/atomic-design-interfaces`.
   - Expose native React Native & Paper styling/accessibility props:
     - `style?: StyleProp<ViewStyle>`, `contentStyle?: StyleProp<ViewStyle>`, `labelStyle?: StyleProp<TextStyle>`.
     - Accept both cross-platform contract callbacks (`onClick`, `onValueChange`, `testId`, `ariaLabel`) AND React Native idioms (`onPress`, `testID`, `accessibilityLabel`, `accessibilityHint`, `accessibilityState`).
     - Forward React 19 `ref?: Ref<View>` directly as a prop (no `forwardRef`).
     - Support controlled (`value` / `checked`) and uncontrolled (`defaultValue` / `defaultChecked`) modes via `useControllableState`.
2. **Smart Polymorphic & Composite Props ("One Component, Multiple Paper Primitives")**:
   - Automatically switch or compose internal `react-native-paper` / `react-native` primitives via smart props:
     - *Example (`MagicButton`)*: `kind: 'default' | 'icon' | 'fab' | 'mini-fab' | 'extended-fab'` switches internally between Paper `Button`, `IconButton`, and `FAB`, while `variant: 'filled' | 'tonal' | 'outlined' | 'elevated' | 'text'` and `shape: 'default' | 'square' | 'rounded' | 'pill'` apply Material 3 token colors from `useMagicPaperColors()`.
     - *Example (`MagicProgressIndicator`)*: `type: 'bar' | 'spinner'` + `mode: 'determinate' | 'indeterminate' | 'buffer' | 'query'` switches between linear bar and circular SVG/ActivityIndicator spinner.
     - *Example (`inline` / `disablePortal` for Overlays)*: Modal/overlay molecules (`MagicDialog`, `MagicMenu`, `MagicSelect`, `MagicDatePicker`, `MagicToast`) support `inline?: boolean` so Storybook visual regression snapshots capture the surface inside the story bounding box while production modals render through `<Portal>` / `<Modal>`.
     - *Example (`MagicFormFieldContext`)*: `MagicTextInput`, `MagicSelect`, and `MagicDatePicker` automatically bind to an enclosing `MagicFormField` via `useMagicFormFieldContext()` or render standalone.
3. **React Native Web & WCAG Accessibility Parity**:
   - Set explicit web + native accessibility roles (`role` / `accessibilityRole`), states (`aria-disabled`, `aria-expanded`, `aria-checked`, `aria-busy`, `accessibilityState`), and keyboard handlers (`Escape`, `Enter`, `Space`, `Arrow*`) so components work identically on iOS, Android, and React Native Web / Storybook.

---

## 2. File Structure & Implementation Steps

Create `libs/ui/rn-paper/src/lib/<tier>/<kebab-name>/`:
1. **`<kebab-name>.tsx`**:
   - Export `Magic<Component>Props` and `Magic<Component>`.
   - Resolve Material 3 palette tokens via `useMagicPaperColors()` / `resolveMagicColorTokens()` (`src/lib/theme/paper-theme.tsx`).
   - Document every interface, prop, and component with TSDoc comments per [`code-doc-generator`](../code-doc-generator/SKILL.md).
2. **`<kebab-name>.spec.tsx`**:
   - Follow [`polyglot-unit-testing`](../polyglot-unit-testing/SKILL.md) wrapped in `MagicPaperProvider`.
   - Test all smart prop switches, controlled/uncontrolled state, both `onClick` and `onPress`, `disabled` / `disabledInteractive` / `loading`, keyboard interactions, and ARIA roles (`>= 80%` coverage).
3. **`<kebab-name>.stories.tsx`**:
   - Follow [`interactive-stories`](../interactive-stories/SKILL.md) implementing the **Canonical 7-Category Component State Matrix** (`Default`, `Variants`, `SizesAndColors`, `DisabledAndLoading`, `ErrorAndEdgeCases`, `CustomSlotsAndComposition`, `DarkTheme`) with stateful wrappers and `storybook/test` `play` functions.
4. **`index.ts`**:
   - Re-export from `src/lib/<tier>/<kebab-name>/index.ts` and `src/lib/<tier>/index.ts`.

---

## 3. Verification & Post-Task Sync

```bash
# 1. Lint, typecheck, and run unit tests with V8 coverage
pnpm nx run-many -t lint typecheck -p atomic-design-interfaces,rn-paper
pnpm nx test rn-paper -- --coverage

# 2. Generate visual baselines and run Storybook browser tests
pnpm nx test-storybook rn-paper -- -u src/lib/<tier>/<kebab-name>/<kebab-name>.stories.tsx
pnpm nx test-storybook rn-paper

# 3. Update libs/ui/rn-paper/README.md catalog and sync repo index & coverage tables
node tools/ci/generate-repo-index.mjs
node tools/ci/sync-readmes-and-coverage.mjs
```
