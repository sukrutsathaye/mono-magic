# `fl_mat` — Flutter Material 3 Atomic Design Component Library

`fl_mat` is Mono-Magic's Flutter 3.50 Material 3 UI library implementing strict interface parity with `@mono-magic/atomic-design-interfaces` and Angular Material (`libs/ui/ng-mat`).

---

## Architecture & Design Principles

- **Atomic Design Taxonomy**: Organized into `atoms`, `molecules`, `organisms`, and `templates`, with unified contracts in `lib/src/interfaces/atomic_interfaces.dart`.
- **Material 3 Theme & Semantic Tokens**: Dynamic `ColorScheme` resolution plus `MagicSemanticColors` (`ThemeExtension`) for `success`, `warning`, and `neutral` roles alongside `primary`, `secondary`, `tertiary`, and `error`.
- **Strict Form Field Composition**: `MagicTextInput` is a bare input control (`TextInputControlProps`). Labels, hints, validation errors, container appearance (`outlined` / `filled`), floating labels, and affixes belong on `MagicFormField`, propagated via `MagicFormFieldScope` without double borders.
- **Tree-Shake-Safe Icons**: `MagicIcon` and `resolveMagicIconData` map string icon names (`snake_case` / `kebab-case`) to compile-time `Icons.*` constants so `flutter build web --release --tree-shake-icons` succeeds without `--no-tree-shake-icons`.

---

## Material 3 Palettes (`MagicTheme` & `MagicSemanticColors`)

`MagicTheme` provides 7 Material 3 palettes matching `ng-mat`:

| Palette (`MagicPaletteName`) | ID | Brightness | Display Name |
| --- | --- | --- | --- |
| `MagicPaletteName.azureBlue` | `azure-blue` | Light | Azure Blue (Light) |
| `MagicPaletteName.lightTheme` | `light-theme` | Light | Violet / Orange (Light) |
| `MagicPaletteName.darkTheme` | `dark-theme` | Dark | Green / Orange (Dark) |
| `MagicPaletteName.roseRed` | `rose-red` | Light | Rose Red (Light) |
| `MagicPaletteName.cyanOrange` | `cyan-orange` | Dark | Cyan Orange (Dark) |
| `MagicPaletteName.orangeRed` | `orange-red` | Light | Orange Red (Light) |
| `MagicPaletteName.magentaViolet` | `magenta-violet` | Dark | Magenta Violet (Dark) |

### Applying a Palette

```dart
import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: MagicTheme.byPalette(MagicPaletteName.azureBlue),
      darkTheme: MagicTheme.byPalette(MagicPaletteName.darkTheme),
      home: const HomeScreen(),
    );
  }
}
```

Use `MagicTheme.resolveIntent(context, ColorIntent.success)` to resolve `(main, onMain, container, onContainer)` for any of the 7 `ColorIntent` values (`primary`, `secondary`, `tertiary`, `success`, `warning`, `error`, `neutral`), and `MagicTheme.metricsFor(AtomicSize.md)` for standardized `xs`–`xl` sizing metrics.

---

## Component Catalog

### Atoms (11)

| Component | Key Features |
| --- | --- |
| `MagicBadge` | Numeric/string pill or dot badge, 8 `BadgePosition` placements, `overlap`, `hidden`/`disabled`, `child`/`icon`/`label` fallback |
| `MagicButton` | 5 `ButtonVariant`s (`filled`, `tonal`, `outlined`, `elevated`, `text`), 5 `ButtonKind`s (`standard`, `icon`, `fab`, `miniFab`, `extendedFab`), 4 `ButtonShape`s, loading spinner, `disabledInteractive` |
| `MagicButtonToggle` | `SegmentedButton`-backed `single`/`multiple` selection, horizontal & vertical (`Axis.vertical`) orientation, `standard`/`legacy` appearance, `hideSelectionIndicator` |
| `MagicCheckBox` | Single tri-state (`checked`/`indeterminate`) checkbox and immutable recursive `CheckBoxTask` subtask trees with automatic parent aggregation |
| `MagicChip` | 4 `ChipVariant`s (`basic`, `selectable`, `input`, `draggable`), horizontal/vertical layout, avatars/icons, inline add/edit/remove, accessible reorder controls |
| `MagicProgressIndicator` | Linear `bar` and circular `spinner` across `determinate`, `indeterminate`, `buffer`, and `query` modes on a `0..100` scale |
| `MagicRadioButton` | `RadioGroup<T>` + `Radio<T>` options, vertical/horizontal layouts, per-option `labelPosition`, `disabledInteractive`, clickable labels |
| `MagicSlideToggle` | Material 3 `Switch` with `activeThumbColor`/`thumbColor`/`trackColor`/`thumbIcon`, `hideIcon`, `before`/`after` label placement |
| `MagicSlider` | Single-thumb `Slider` and dual-thumb `RangeSlider`, `discrete` value indicators (`defaultMagicSliderDisplayWith`), step `showTickMarks` |
| `MagicTextInput` | Bare `TextFormField` implementing `MagicTextInputControlProps`, 7 `TextInputTypeKind`s, `autofillHints`, `MagicFormFieldScope` integration |
| `MagicToolTip` | `Tooltip` with `constraints`, `showDelay`/`hideDelay`, 6 `ToolTipPosition`s, `ToolTipTouchGestures`, and `disabled` suppression |

### Molecules (5)

| Component | Key Features |
| --- | --- |
| `MagicCard` | `outlined`/`raised` M3 surface, `basic`/`withActions`/`withChips` variants, `headerSlot`/`mediaSlot`/`footerSlot`, `CardImageSize` presets, `onActionClick`/`onChipSelect` |
| `MagicFormField` | `outlined`/`filled` container, `auto`/`always` `floatLabel`, `fixed`/`dynamic` `subscriptSizing`, `hint`/`errorText`, `prefix`/`suffix`, `MagicFormFieldScope` |
| `MagicMenu` | `MenuAnchor` + `MenuItemButton` + recursive `SubmenuButton` cascades, `button`/`icon` trigger, `xPosition`/`yPosition`/`overlapTrigger`/`hasBackdrop` |
| `MagicSearchBar` | Composes `MagicFormField`, `MagicTextInput` (`search`), and `MagicButton` with controlled/uncontrolled query state and `loading`/`disabled` handling |
| `MagicSelect` | Composes `MagicFormField` and `MenuAnchor` for single-select & multi-select checkboxes, flat `options` & `optionGroups`, and `customTriggerSummary` |

---

## Usage Examples

### Buttons & Badges

```dart
MagicBadge(
  content: 3,
  color: ColorIntent.error,
  position: BadgePosition.aboveAfter,
  child: MagicButton(
    label: 'Notifications',
    variant: ButtonVariant.tonal,
    leadingIconName: 'notifications',
    onPressed: () {},
  ),
)
```

### Strict `MagicFormField` + `MagicTextInput` Composition

```dart
MagicFormField(
  label: 'Work Email',
  hint: 'Used for workspace notifications',
  appearance: FormFieldAppearance.outlined,
  requiredField: true,
  prefix: const Icon(Icons.email_outlined),
  child: MagicTextInput(
    type: TextInputTypeKind.email,
    placeholder: 'ada@lovelace.dev',
    autocomplete: 'email',
    onChanged: (value) {},
  ),
)
```

### Multi-Select with Option Groups (`MagicSelect`)

```dart
MagicSelect<String>(
  label: 'Enabled Palettes',
  multiple: true,
  customTriggerSummary: true,
  values: const ['azure-blue', 'dark-theme'],
  optionGroups: const [
    SelectOptionGroup(
      label: 'Light Palettes',
      options: [
        SelectOption(value: 'azure-blue', label: 'Azure Blue'),
        SelectOption(value: 'rose-red', label: 'Rose Red'),
      ],
    ),
    SelectOptionGroup(
      label: 'Dark Palettes',
      options: [
        SelectOption(value: 'dark-theme', label: 'Green / Orange'),
        SelectOption(value: 'cyan-orange', label: 'Cyan Orange'),
      ],
    ),
  ],
  onMultiChanged: (selected) {},
)
```

---

## Widgetbook 3.25 Catalog

`lib/widgetbook.dart` configures `Widgetbook.material` with:
- **Addons**: `MaterialThemeAddon` (all 7 `MagicPaletteName` palettes), `ViewportAddon` (none, iPhone 13, Galaxy S20, MacBook Pro), `TextScaleAddon` (`0.75`–`2.0`), `AlignmentAddon`, and `InspectorAddon`.
- **Categories**:
  - **Atoms** (`lib/widgetbook/atoms/*_use_cases.dart`): Interactive Playground knobs and visual galleries for all 11 atoms.
  - **Molecules** (`lib/widgetbook/molecules/*_use_cases.dart`): Interactive Playgrounds and variant galleries for all 5 molecules.

---

## Nx Workspace Commands

Run all commands from the repository root with Flutter on `PATH`:

```bash
# Static analysis (flutter analyze)
pnpm exec nx run fl-mat:lint

# Run full widget test suite
pnpm exec nx run fl-mat:test

# Launch interactive Widgetbook in Chrome
pnpm exec nx run fl-mat:widgetbook

# Build release Widgetbook web bundle (verifies --tree-shake-icons)
pnpm exec nx run fl-mat:build-widgetbook
```

To verify test line coverage locally:

```bash
(cd libs/ui/fl-mat && flutter test --coverage)
```
