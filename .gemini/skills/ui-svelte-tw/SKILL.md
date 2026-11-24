---
name: ui-svelte-tw
description: >-
  Designs and implements a Svelte 5 (runes) + Tailwind CSS v4 + Bits UI Atomic Design
  component in libs/ui/svelte-tw following the Root Framework Superset + Smart
  Polymorphic Props pattern, with $props()/$bindable() runes, Snippet slots,
  @testing-library/svelte Vitest unit tests (>=80%), 7-Category State Matrix Storybook
  stories, and visual baselines.
---

# Svelte 5 + Tailwind CSS v4 + Bits UI (`svelte-tw`) Component Playbook

Use this skill whenever creating, extending, or auditing an Atomic Design component (`Atom`, `Molecule`, `Organism`, or `Template`) in `libs/ui/svelte-tw`.

---

## 1. Core Design Philosophy: Root Bits UI / HTML Superset + Smart Polymorphic Props

Every `Magic<Component>.svelte` in `@mono-magic/svelte-tw` MUST expose **all capabilities of the underlying Bits UI / native HTML element(s)** plus **smart composite props**:

1. **100% Root Bits UI / Native HTML Prop & Snippet Coverage**:
   - Extend the canonical `*AtomProps` / `*MoleculeProps` contract from `@mono-magic/atomic-design-interfaces`.
   - Use **Svelte 5 Runes** (`let { ... }: Magic<Component>Props = $props()`):
     - Use `$bindable()` for two-way bindable state props (`value = $bindable()`, `checked = $bindable()`, `open = $bindable()`, `expandedIds = $bindable()`).
     - Support Svelte 5 `Snippet` slots (`children?: Snippet`, `leading?: Snippet`, `trailing?: Snippet`, `headerSlot?: Snippet`, `footerSlot?: Snippet`) alongside string/config prop fallbacks (`label`, `title`, `content`, `leadingIcon`, `trailingIcon`).
     - Accept `class?: string` / `className?: string` and forward native HTML rest attributes (`...restProps`) directly to the underlying root DOM element.
2. **Smart Polymorphic & Composite Props ("One Component, Multiple Primitives")**:
   - Automatically switch or compose internal structures and Material 3-aligned Tailwind v4 classes via smart discriminator props:
     - *Example (`MagicButton`)*: `kind: 'default' | 'icon' | 'fab' | 'mini-fab' | 'extended-fab'`, `variant: 'filled' | 'tonal' | 'outlined' | 'elevated' | 'text'`, `shape: 'default' | 'square' | 'rounded' | 'pill'`, `loading` + `loadingLabel`, and `disabledInteractive` (`aria-disabled="true"` while remaining focusable).
     - *Example (`MagicProgressIndicator`)*: `type: 'bar' | 'spinner'` + `mode: 'determinate' | 'indeterminate' | 'buffer' | 'query'` switching between linear progress track and circular SVG spinner.
     - *Example (`MagicSlider`)*: `range: boolean` switching between single-thumb and dual-thumb range slider with tick marks and value tooltips.
     - *Example (`MagicCheckBox`)*: Supports both a single tri-state checkbox (`checked`, `indeterminate`) and a recursive `CheckBoxTask` subtask tree.

---

## 2. File Structure & Implementation Steps

Create `libs/ui/svelte-tw/src/lib/<tier>/<kebab-name>/`:
1. **`Magic<Component>.svelte`**:
   - Define and export `Magic<Component>Props` in `<script lang="ts" module>` or `<script lang="ts">` with complete TSDoc comments per [`code-doc-generator`](../code-doc-generator/SKILL.md).
   - Ensure full WCAG 2.1 AA ARIA attributes (`role`, `aria-label`, `aria-disabled`, `aria-busy`, `aria-expanded`, `aria-invalid`) and keyboard event handlers.
2. **`Magic<Component>.spec.ts`**:
   - Follow [`polyglot-unit-testing`](../polyglot-unit-testing/SKILL.md) using `@testing-library/svelte` (`render`, `fireEvent`, `screen`).
   - Test all smart polymorphic switches (`kind`, `variant`, `mode`, `range`), callback props, `disabled` / `disabledInteractive` / `loading`, keyboard interactions, and ARIA roles (`>= 80%` coverage).
3. **`Magic<Component>.stories.ts`**:
   - Follow [`interactive-stories`](../interactive-stories/SKILL.md) implementing the **Canonical 7-Category Component State Matrix** (`Default`, `Variants`, `SizesAndColors`, `DisabledAndLoading`, `ErrorAndEdgeCases`, `CustomSlotsAndComposition`, `DarkTheme`) with categorized `argTypes` and `storybook/test` `play` functions.
4. **`index.ts`**:
   - Export `Magic<Component>` and its prop types from `src/lib/<tier>/<kebab-name>/index.ts` and `src/index.ts`.

---

## 3. Verification & Post-Task Sync

```bash
# 1. Lint, typecheck (svelte-check), and run unit tests with V8 coverage
pnpm nx run-many -t lint typecheck -p atomic-design-interfaces,svelte-tw
pnpm nx test svelte-tw -- --coverage

# 2. Generate visual baselines and run Storybook browser tests
pnpm nx test-storybook svelte-tw -- -u src/lib/<tier>/<kebab-name>/Magic<Component>.stories.ts
pnpm nx test-storybook svelte-tw

# 3. Update libs/ui/svelte-tw/README.md catalog and sync repo index & coverage tables
node tools/ci/generate-repo-index.mjs
node tools/ci/sync-readmes-and-coverage.mjs
```
