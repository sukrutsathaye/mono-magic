---
name: ui-vue-vuetify
description: >-
  Designs and implements a Vue 3.5 + Vuetify 3.12 Atomic Design SFC component in
  libs/ui/vue-vuetify following the Root Framework Superset + Smart Polymorphic Props
  pattern, with v-model bindings, named slots, Vite optimizeDeps pre-bundling,
  @vue/test-utils Vitest unit tests (>=80%), 7-Category State Matrix Storybook stories,
  and visual baselines.
---

# Vue 3.5 + Vuetify 3.12 (`vue-vuetify`) Component Playbook

Use this skill whenever creating, extending, or auditing an Atomic Design component (`Atom`, `Molecule`, `Organism`, or `Template`) in `libs/ui/vue-vuetify`.

---

## 1. Core Design Philosophy: Root Vuetify 3 Superset + Smart Polymorphic Props

Every `Magic<Component>.vue` in `@mono-magic/vue-vuetify` MUST expose **all capabilities of the underlying Vuetify 3 (`v-*`) component family** plus **smart composite props**:

1. **100% Root Vuetify 3 Prop, Event & Slot Coverage**:
   - Extend the canonical `*AtomProps` / `*MoleculeProps` contract from `@mono-magic/atomic-design-interfaces` in `defineProps<Magic<Component>Props>()`.
   - Support idiomatic Vue `v-model` two-way binding (`modelValue` + `update:modelValue`, `checked` + `update:checked`, `open` + `update:open`) alongside contract callbacks (`change`, `click`, `close`, `actionClick`).
   - Expose named Vue `<slot>`s (`default`, `prepend`, `append`, `header`, `media`, `footer`, `trigger`) with prop fallbacks (`label`, `title`, `content`, `leadingIcon`, `trailingIcon`) and forward `$attrs` (`v-bind="$attrs"`) to the primary interactive root element.
2. **Smart Polymorphic & Composite Props ("One Component, Multiple Vuetify Primitives")**:
   - Automatically switch or configure internal Vuetify 3 primitives based on smart discriminator props:
     - *Example (`MagicButton`)*: `kind: 'default' | 'icon' | 'fab' | 'mini-fab' | 'extended-fab'` + `variant: 'filled' | 'tonal' | 'outlined' | 'elevated' | 'text'` maps to Vuetify `v-btn` (`variant="flat" | "tonal" | "outlined" | "elevated" | "text"`, `icon`, `rounded`, `size`, `density`) while handling `loading`, `loadingLabel`, and `disabledInteractive` (`aria-disabled="true"`).
     - *Example (`MagicProgressIndicator`)*: `type: 'bar' | 'spinner'` switches internally between `<v-progress-linear>` and `<v-progress-circular>` across `determinate`, `indeterminate`, `buffer`, and `query` modes.
     - *Example (`MagicSlider`)*: `range: true` switches internally between `<v-slider>` and `<v-range-slider>`.
     - *Example (`MagicCheckBox`)*: Renders either a single `<v-checkbox>` (`indeterminate`) or a recursive `CheckBoxTask` parent/subtask tree.
3. **Mandatory Vite `optimizeDeps.include` Pre-Bundling Rule**:
   - Whenever importing a new `vuetify/components/<VComponent>` module, verify that it is pre-bundled in `optimizeDeps.include` inside [libs/ui/vue-vuetify/vite.config.mts](../../../libs/ui/vue-vuetify/vite.config.mts). This prevents Vite from triggering a mid-test page reload during Playwright Storybook visual tests (`test-storybook`).

---

## 2. File Structure & Implementation Steps

Create `libs/ui/vue-vuetify/src/lib/<tier>/<kebab-name>/`:
1. **`Magic<Component>.vue`**:
   - Use `<script setup lang="ts">` with `withDefaults(defineProps<Magic<Component>Props>(), { ... })` and typed `defineEmits<{ ... }>()`.
   - Document exported prop types and emits with TSDoc comments per [`code-doc-generator`](../code-doc-generator/SKILL.md).
2. **`Magic<Component>.spec.ts`**:
   - Follow [`polyglot-unit-testing`](../polyglot-unit-testing/SKILL.md) using `@vue/test-utils` (`mount`) with the shared Vuetify test plugin.
   - Test all smart polymorphic switches (`kind`, `variant`, `mode`, `range`), `v-model` updates, slot rendering, `disabled` / `disabledInteractive` / `loading`, keyboard events, and ARIA attributes (`>= 80%` coverage).
3. **`Magic<Component>.stories.ts`**:
   - Follow [`interactive-stories`](../interactive-stories/SKILL.md) implementing the **Canonical 7-Category Component State Matrix** (`Default`, `Variants`, `SizesAndColors`, `DisabledAndLoading`, `ErrorAndEdgeCases`, `CustomSlotsAndComposition`, `DarkTheme`) with categorized `argTypes`, reactive `ref()` state in `setup()`, and `storybook/test` `play` functions.
4. **`index.ts`**:
   - Export `Magic<Component>` and its prop types from `src/lib/<tier>/<kebab-name>/index.ts` and `src/index.ts`.

---

## 3. Verification & Post-Task Sync

```bash
# 1. Lint, typecheck (vue-tsc), and run unit tests with V8 coverage
pnpm nx run-many -t lint typecheck -p atomic-design-interfaces,vue-vuetify
pnpm nx test vue-vuetify -- --coverage

# 2. Generate visual baselines and run Storybook browser tests
pnpm nx test-storybook vue-vuetify -- -u src/lib/<tier>/<kebab-name>/Magic<Component>.stories.ts
pnpm nx test-storybook vue-vuetify

# 3. Update libs/ui/vue-vuetify/README.md catalog and sync repo index & coverage tables
node tools/ci/generate-repo-index.mjs
node tools/ci/sync-readmes-and-coverage.mjs
```
