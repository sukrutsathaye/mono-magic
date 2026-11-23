---
name: polyglot-ui-component
description: >-
  Designs and implements an Atomic Design UI component (Atom, Molecule, Organism, or Template)
  with 1:1 contract parity across @mono-magic/atomic-design-interfaces, react-mui, ng-mat,
  rn-paper, and fl-mat (Flutter Material 3), including unit tests, Storybook stories,
  Widgetbook use-cases, and visual regression baselines. Use whenever adding, updating,
  or auditing a UI component in libs/ui/*.
---

# Polyglot UI Component Workflow

Use this skill whenever adding, extending, or auditing an Atomic Design component across `libs/ui/*`.

## 1. Verify Tier Dependency Order

Always build strictly bottom-up:
1. **Atoms** (`src/lib/atoms/<kebab-name>/`) — Foundational primitives with zero dependencies on molecules/organisms.
2. **Molecules** (`src/lib/molecules/<kebab-name>/`) — Composed of one or more existing Atoms.
3. **Core Organisms** (`src/lib/organisms/<kebab-name>/`) — Composed of existing Atoms and Molecules.
4. **Domain Organisms & Templates** (`src/lib/organisms/` or `src/lib/templates/`) — Composed of existing Atoms, Molecules, and Core Organisms.

Before starting a Molecule, Organism, or Template, verify that every lower-tier component it composes already exists in:
- `libs/ui/atomic-design-interfaces`
- `libs/ui/react-mui`
- `libs/ui/ng-mat`
- `libs/ui/rn-paper`
- `libs/ui/fl-mat`
- `libs/ui/vue-vuetify`
- `libs/ui/svelte-tw`

---

## 2. Step-by-Step Implementation Order

### Step 1 — Define the Contract in `atomic-design-interfaces`
1. Create `libs/ui/atomic-design-interfaces/src/lib/<tier>/<kebab-name>.interface.ts`:
   - Reuse shared tokens from `../common` (`MagicColor`, `MagicSize`, `MagicAppearance`, etc.).
   - Prefix public types and interfaces with `Magic` (e.g., `MagicDialogProps`, `MagicDialogSize`).
   - Document every property with JSDoc comments and framework-agnostic callback types.
2. Export the contract from `libs/ui/atomic-design-interfaces/src/lib/<tier>/index.ts` (and ensure `src/index.ts` re-exports `<tier>`).
3. Add contract/type tests in `libs/ui/atomic-design-interfaces/src/lib/interfaces.spec.ts`.
4. Verify:
   ```bash
   pnpm nx run-many -t lint typecheck test -p atomic-design-interfaces
   ```

### Step 2 — Implement in `react-mui` (`libs/ui/react-mui`)
1. Create `libs/ui/react-mui/src/lib/<tier>/<kebab-name>/`:
   - `<kebab-name>.tsx` implementing `Magic<Component>Props` from `@mono-magic/atomic-design-interfaces` using `@mui/material`.
   - `<kebab-name>.spec.tsx` with `@testing-library/react` covering variants, sizes, colors, states, accessibility roles, and event callbacks (`>=80%` coverage).
   - `<kebab-name>.stories.tsx` with CSF3 stories covering default, variants, sizes, colors, disabled/loading states, and dark theme.
   - `index.ts` barrel export, re-exported in `src/lib/<tier>/index.ts`.
2. Verify:
   ```bash
   pnpm nx run-many -t lint typecheck test -p react-mui
   ```

### Step 3 — Implement in `ng-mat` (`libs/ui/ng-mat`)
1. Create `libs/ui/ng-mat/src/lib/<tier>/<kebab-name>/`:
   - `<kebab-name>.component.ts` (standalone Angular 22 component `Magic<Component>Component`, selector `magic-<kebab-name>`, using Angular signals/inputs and `@angular/material`; integrate `MagicCvaDirective` / `ControlValueAccessor` for form controls).
   - `<kebab-name>.component.spec.ts` (Vitest + AnalogJS unit tests with `>=80%` coverage).
   - `<kebab-name>.component.stories.ts` (CSF3 `@storybook/angular-vite` stories).
   - `index.ts` barrel export, re-exported in `src/lib/<tier>/index.ts`.
2. Verify:
   ```bash
   pnpm nx run-many -t lint typecheck test -p ng-mat
   ```

### Step 4 — Implement in `rn-paper` (`libs/ui/rn-paper`)
1. Create `libs/ui/rn-paper/src/lib/<tier>/<kebab-name>/`:
   - `<kebab-name>.tsx` implementing `Magic<Component>Props` using `react-native` and `react-native-paper` (compatible with `react-native-web` for Storybook).
   - `<kebab-name>.spec.tsx` (Vitest unit tests with `>=80%` coverage).
   - `<kebab-name>.stories.tsx` (CSF3 `@storybook/react-vite` stories).
   - `index.ts` barrel export, re-exported in `src/lib/<tier>/index.ts`.
2. Verify:
   ```bash
   pnpm nx run-many -t lint typecheck test -p rn-paper
   ```

### Step 5 — Implement in `fl-mat` (`libs/ui/fl-mat`)
1. Create `libs/ui/fl-mat/lib/src/<tier>/<snake_name>/`:
   - Mirror the contract props in Dart enums/classes (`Magic<Component>` widget using Flutter Material 3).
   - Export from `lib/src/<tier>/<tier>.dart` and `lib/fl_mat.dart`.
2. Register Widgetbook use-cases in `libs/ui/fl-mat/lib/widgetbook/` and `lib/widgetbook.dart`.
3. Add widget tests in `libs/ui/fl-mat/test/<tier>/<snake_name>_test.dart`.
4. Verify:
   ```bash
   pnpm nx run-many -t lint test build-widgetbook -p fl-mat
   ```

### Step 5b — Implement in `vue-vuetify` (`libs/ui/vue-vuetify`) & `svelte-tw` (`libs/ui/svelte-tw`)
1. Mirror the contract in `libs/ui/vue-vuetify/src/lib/<tier>/<kebab-name>/Magic<Component>.vue` and `libs/ui/svelte-tw/src/lib/<tier>/<kebab-name>/Magic<Component>.svelte` (with unit tests `*.spec.ts` `>=80%` coverage and CSF3 stories `Magic<Component>.stories.ts`).
2. **Mandatory Interactive Story & `play` Function Rule (All Storybook Libraries)**:
   - Every component's `*.stories.ts(x)` across `react-mui`, `ng-mat`, `rn-paper`, `vue-vuetify`, and `svelte-tw` **MUST** include:
     1. Full `argTypes` + `args` so Storybook **Controls** interactively update the component.
     2. At least one **stateful interactive story** (using `useState`, Angular `signal`, Vue `ref`, or a Svelte `$state` demo wrapper) so users can click, type, toggle, or drag in the live preview.
     3. At least one Storybook `play` function (using `expect`, `userEvent`, `within` from `storybook/test`) that exercises real user interaction and asserts DOM/state changes in the Storybook **Interactions** panel and `test-storybook`.

### Step 6 — Generate Visual Baselines & Verify Showcases
1. Generate/update Storybook visual baselines (`storybook-addon-vis`):
   ```bash
   pnpm nx test-storybook react-mui -- -u
   pnpm nx test-storybook ng-mat -- -u
   pnpm nx test-storybook rn-paper -- -u
   pnpm nx test-storybook vue-vuetify -- -u
   pnpm nx test-storybook svelte-tw -- -u
   ```
2. Run Storybook visual & interaction tests:
   ```bash
   pnpm nx run-many -t test-storybook -p react-mui,ng-mat,rn-paper,vue-vuetify,svelte-tw
   ```
3. Build static Storybooks and Widgetbook:
   ```bash
   pnpm nx run-many -t build-storybook -p react-mui,ng-mat,rn-paper
   pnpm nx build-widgetbook fl-mat
   ```
