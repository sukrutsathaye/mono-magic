---
name: ui-fl-mat
description: >-
  Designs and implements a Flutter >=3.50 Material 3 Atomic Design widget in
  libs/ui/fl-mat following the Root Framework Superset + Smart Polymorphic Props
  pattern, with mirrored Dart contract models, MagicTheme semantic tokens,
  tree-shake-safe icons, Semantics accessibility, flutter_test widget tests (>=80%),
  and 7-Category State Matrix Widgetbook use-cases.
---

# Flutter Material 3 (`fl-mat`) Widget Playbook

Use this skill whenever creating, extending, or auditing an Atomic Design widget (`Atom`, `Molecule`, `Organism`, or `Template`) in `libs/ui/fl-mat`.

---

## 1. Core Design Philosophy: Root Flutter Material 3 Superset + Smart Polymorphic Parameters

Every `Magic<Component>` widget in `fl_mat` MUST expose **all capabilities of the underlying Flutter Material 3 widget family** plus **smart composite parameters**:

1. **100% Root Flutter Material 3 Parameter Coverage**:
   - Mirror the TypeScript contract from `@mono-magic/atomic-design-interfaces` in `libs/ui/fl-mat/lib/src/interfaces/atomic_interfaces.dart` (strongly typed Dart enums, immutable model classes, and widget constructor parameters with sound null safety and zero `dynamic`).
   - Expose native Flutter Material 3 widget parameters:
     - `super.key`, `id`, `testId`, `ariaLabel` / `semanticsLabel`, `focusNode`, `autofocus`, `mouseCursor`, `style` (`ButtonStyle`, `TextStyle`, etc.), `padding`, `constraints`, `clipBehavior`, and custom `Widget` slot parameters (`child`, `leading`, `trailing`, `headerSlot`, `mediaSlot`, `footerSlot`).
     - Support both controlled (external value + `onChanged` callback) and uncontrolled/internal stateful fallback where appropriate.
2. **Smart Polymorphic & Composite Parameters ("One Widget, Entire Material 3 Family")**:
   - Combine fragmented Flutter Material 3 widgets behind ergonomic discriminator parameters:
     - *Example (`MagicButton`)*: `kind: ButtonKind` (`standard`, `icon`, `fab`, `miniFab`, `extendedFab`) and `variant: ButtonVariant` (`filled`, `tonal`, `outlined`, `elevated`, `text`) internally switch between `FilledButton`, `FilledButton.tonal`, `OutlinedButton`, `ElevatedButton`, `TextButton`, `IconButton`, `FloatingActionButton.small`, `FloatingActionButton`, and `FloatingActionButton.extended`.
     - *Example (`MagicSlider`)*: `range: true` (or `rangeValues`) switches internally between Flutter's `Slider` and `RangeSlider`.
     - *Example (`MagicProgressIndicator`)*: `type: ProgressIndicatorType` (`bar` vs. `spinner`) and `mode: ProgressIndicatorMode` (`determinate`, `indeterminate`, `buffer`, `query`) unify `LinearProgressIndicator` and `CircularProgressIndicator`.
     - *Example (`MagicCheckBox`)*: Supports both a single tri-state `Checkbox` (`tristate: true`) and a recursive `CheckBoxTask` tree with automatic parent aggregation.
     - *Example (`MagicFormFieldScope`)*: `MagicTextInput`, `MagicSelect`, and `MagicDatePicker` read `MagicFormFieldScope.maybeOf(context)` so they automatically adopt the enclosing `MagicFormField`'s label, hint, error text, appearance (`outlined`/`filled`), and affixes without double borders.
3. **Tree-Shake-Safe Icons & Accessibility (`Semantics`)**:
   - Resolve string icon names via `MagicIcon` / `resolveMagicIconData` (`lib/src/core/magic_icon.dart`) so `flutter build web --release --tree-shake-icons` always succeeds.
   - Wrap interactive widgets in `Semantics(identifier: testId, label: ariaLabel, enabled: !disabled, button: ..., toggled: ..., ...)` for deterministic accessibility and screen-reader support.

---

## 2. File Structure & Implementation Steps

1. **Contract & Widget (`libs/ui/fl-mat/lib/src/<tier>/<snake_name>/`)**:
   - Add/update Dart contract models in `lib/src/interfaces/atomic_interfaces.dart`.
   - Implement `lib/src/<tier>/<snake_name>/magic_<snake_name>.dart` with complete `///` Dartdoc comments on every class, enum, enum value, and constructor field per [`code-doc-generator`](../code-doc-generator/SKILL.md).
   - Export from `lib/src/<tier>/<tier>.dart` and `lib/fl_mat.dart`.
2. **Widgetbook Use-Cases (`libs/ui/fl-mat/lib/widgetbook/<tier>/<snake_name>_use_cases.dart`)**:
   - Follow [`interactive-stories`](../interactive-stories/SKILL.md) to build use-cases covering the **Canonical 7-Category Component State Matrix**:
     1. `Interactive Playground` (wired to `context.knobs.*` + `StatefulWidget` preview)
     2. `Variants & Appearances`
     3. `Sizes & Color Intents`
     4. `Disabled & Loading States`
     5. `Error & Edge Cases`
     6. `Custom Slots & Icons`
     7. `Dark Theme Preview` (`Theme(data: MagicTheme.byPalette(MagicPaletteName.darkTheme), child: ...)`)
   - Register `buildMagic<Component>Component()` in `libs/ui/fl-mat/lib/widgetbook.dart`.
3. **Widget Tests (`libs/ui/fl-mat/test/<tier>/<snake_name>_test.dart`)**:
   - Follow [`polyglot-unit-testing`](../polyglot-unit-testing/SKILL.md) using `testWidgets` to verify all smart polymorphic branches, gestures, keyboard events, and `Semantics` nodes (`>= 80%` coverage).

---

## 3. Verification & Post-Task Sync

```bash
# 1. Analyze Dart code, run widget tests with LCOV coverage, and build Widgetbook web
pnpm nx lint fl-mat
pnpm nx test-coverage fl-mat
pnpm nx build-widgetbook fl-mat

# 2. Update libs/ui/fl-mat/README.md catalog and sync repo index & coverage tables
node tools/ci/generate-repo-index.mjs
node tools/ci/sync-readmes-and-coverage.mjs
```
