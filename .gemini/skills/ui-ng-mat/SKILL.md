---
name: ui-ng-mat
description: >-
  Designs and implements an Angular 22 + Angular Material v22 Atomic Design component
  in libs/ui/ng-mat following the Root Framework Superset + Smart Polymorphic Props
  pattern, with Signal inputs/models/outputs, shared host binding directives, dual
  Signal Forms + ControlValueAccessor integration, AnalogJS/Vitest unit tests (>=80%),
  7-Category State Matrix Storybook stories, and visual baselines.
---

# Angular 22 + Angular Material v22 (`ng-mat`) Component Playbook

Use this skill whenever creating, extending, or auditing an Atomic Design component (`Atom`, `Molecule`, `Organism`, or `Template`) in `libs/ui/ng-mat`.

---

## 1. Core Design Philosophy: Root Angular Material Superset + Smart Polymorphic Inputs

Every `Magic<Component>Component` (`selector: 'magic-<kebab>'`) in `@mono-magic/ng-mat` MUST expose **all capabilities of the underlying `@angular/material` family** plus **smart composite signal inputs**:

1. **100% Root Angular Material Input/Output & Projection Coverage**:
   - Implement `SignalProps<*AtomProps>` / `SignalProps<*MoleculeProps>` from `@mono-magic/atomic-design-interfaces` (`src/lib/core/signal-props.ts`) using Angular 22 signal primitives (`input()`, `model()`, `output()`, `computed()`).
   - Expose all underlying `@angular/material` inputs (`disableRipple`, `ariaLabel`, `tabIndex`, `color`, `size`, `shape`, native attributes, `TemplateRef` slot inputs) AND support Angular content projection (`<ng-content>`, `[magicPrefix]`, `[magicSuffix]`, `[magicHeader]`, `[magicFooter]`) with input fallbacks (`label`, `content`) so both `<magic-button>Save</magic-button>` and `<magic-button label="Save" />` work.
   - Remove duplicate host IDs (`host: { '[attr.id]': 'null', '[class]': 'hostClasses()' }`) and bind `[attr.id]` and `[attr.data-testid]` on the inner interactive element.
2. **Smart Polymorphic Inputs & Shared Binding Directives ("One Selector, Entire Material Family")**:
   - In Angular Material, separate appearances or kinds often use different directives (`matButton`, `matIconButton`, `matFab`, `matMiniFab`, or single vs. range `mat-slider`, or `mat-progress-bar` vs. `mat-progress-spinner`).
   - Unify them behind reactive Signal inputs (`kind`, `variant`, `mode`, `type`, `range`, `loading`, `disabledInteractive`) using `@switch` in the template and an internal shared `@Directive` (like `MagicButtonBindingDirective`) so common ARIA/event/attribute bindings are never copy-pasted across branches.
3. **Dual Angular Forms Integration (Signal Forms + Reactive/Template CVA)**:
   - Every form-capable control MUST integrate with both:
     - **Angular Signal Forms** (`FormValueControl<T>` or `FormCheckboxControl`).
     - **Reactive & Template-Driven Forms** (`formControl`, `formControlName`, `[(ngModel)]`) via `MagicValueAccessor` (`src/lib/forms/magic-cva.ts`), plus `MatFormFieldControl` when hosted inside `magic-form-field`.

---

## 2. File Structure & Implementation Steps

Create `libs/ui/ng-mat/src/lib/<tier>/<kebab-name>/` with separate standalone files:
1. **`<kebab-name>.component.ts`**:
   - Standalone component with `ChangeDetectionStrategy.OnPush`.
   - Document every class, directive, `input()`, `model()`, and `output()` with TSDoc comments (used by Compodoc for Storybook Autodocs).
2. **`<kebab-name>.component.html` & `<kebab-name>.component.scss`**:
   - Use Angular `@if`, `@for`, `@switch` control flow and Material 3 CSS token classes (`magic-size-${size()}`, `magic-color-${color()}`, `magic-shape-${shape()}`).
3. **`<kebab-name>.component.spec.ts`**:
   - Follow [`polyglot-unit-testing`](../polyglot-unit-testing/SKILL.md) using `@analogjs/vitest-angular` and `TestBed`.
   - Set signal inputs via `fixture.componentRef.setInput(...)`, test all smart polymorphic branches, test `FormControl` / `ControlValueAccessor` and projection slots, and verify `>= 80%` coverage.
4. **`<kebab-name>.component.stories.ts`**:
   - Follow [`interactive-stories`](../interactive-stories/SKILL.md) implementing the **Canonical 7-Category Component State Matrix** with categorized `argTypes`, stateful signal wrappers, and `storybook/test` `play` functions.
5. **`index.ts`**:
   - Re-export from `src/lib/<tier>/<kebab-name>/index.ts` and `src/lib/<tier>/index.ts`.

---

## 3. Verification & Post-Task Sync

```bash
# 1. Lint, typecheck, and run unit tests with V8 coverage
pnpm nx run-many -t lint typecheck -p atomic-design-interfaces,ng-mat
pnpm nx test ng-mat -- --coverage

# 2. Generate visual baselines and run Storybook browser tests
pnpm nx test-storybook ng-mat -- -u src/lib/<tier>/<kebab-name>/<kebab-name>.component.stories.ts
pnpm nx test-storybook ng-mat

# 3. Update libs/ui/ng-mat/README.md catalog and sync repo index & coverage tables
node tools/ci/generate-repo-index.mjs
node tools/ci/sync-readmes-and-coverage.mjs
```
