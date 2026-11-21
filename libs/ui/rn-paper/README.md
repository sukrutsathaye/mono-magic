# @mono-magic/rn-paper

React Native (`0.85.x`) + React (`19.3.x`) + **React Native Paper v5** (`5.15.x`) + **React Native Web** (`0.21.x`) Material 3 component library adhering to **Atomic Design**, **contract-first interfaces** from `@mono-magic/atomic-design-interfaces`, **7 dynamic Material 3 theme palettes**, and cross-platform web + mobile support.

---

## Architectural Principles

- **Contract-first typing**: Every atom and molecule implements the framework-agnostic `*AtomProps` / `*MoleculeProps` contracts from `@mono-magic/atomic-design-interfaces` (never exposing raw `react-native-paper` internal types in public contracts).
- **React 19 ref-as-prop**: All components accept `ref` directly as a prop (`ref?: Ref<View>` / `Ref<RNTextInput>`) without legacy `React.forwardRef` wrappers.
- **Controlled & uncontrolled dual mode**: Form controls use `useControllableState` so they work seamlessly with either controlled (`value` / `checked` + change callbacks) or uncontrolled (`defaultValue` / `defaultChecked`) state.
- **Atomic purity (`MagicFormField` + `MagicTextInput`)**: `MagicTextInput` is a bare text control that consumes `MagicFormFieldContext` when nested inside `MagicFormField`. `MagicFormField` owns the Material 3 outlined/filled container chrome, floating/stacked label, helper hint, error message, character counter, and prefix/suffix adornments.
- **Zero demo data in component sources**: Component `.tsx` files contain zero hardcoded showcase defaults; sample data lives strictly inside `.stories.tsx` and `.spec.tsx`.

---

## Material 3 Theming & Palettes

`@mono-magic/rn-paper` ships 7 Material 3 theme palettes in `src/lib/theme/paper-theme.tsx` matching `@mono-magic/ng-mat` and `fl_mat`:

| Palette Key | Mode | Primary Seed | Secondary Seed | Tertiary Seed |
| --- | --- | --- | --- | --- |
| `azure-blue` _(default)_ | Light | `#005cbb` | `#565e71` | `#705574` |
| `light-theme` | Light | `#6750a4` | `#625b71` | `#984800` |
| `dark-theme` | Dark | `#7edb7b` | `#b8ccb1` | `#ffb787` |
| `rose-red` | Light | `#b9004b` | `#75565c` | `#795831` |
| `cyan-orange` | Dark | `#00dddd` | `#b1cccc` | `#ffb787` |
| `orange-red` | Light | `#984800` | `#755846` | `#626033` |
| `magenta-violet` | Dark | `#ffabf3` | `#dabfd2` | `#f5b8a7` |

### `MagicPaperProvider` & `useMagicPaperColors()`

Wrap your application or screen in `MagicPaperProvider` and consume semantic Material 3 tokens (`primary`, `secondary`, `tertiary`, `success`, `warning`, `error`, `neutral`) via `useMagicPaperColors()` or `resolveMagicColorTokens()`:

```tsx
import {
  MagicPaperProvider,
  useMagicPaperColors,
  resolveMagicColorTokens,
} from '@mono-magic/rn-paper';

export function AppRoot() {
  return (
    <MagicPaperProvider palette="azure-blue">
      <DashboardScreen />
    </MagicPaperProvider>
  );
}
```

---

## Component Catalog

### Atoms (11)

| Component | Contract | Description |
| --- | --- | --- |
| `MagicBadge` | `BadgeAtomProps` | Standalone or child-wrapping status badge with numeric count, `maxCount` truncation (`99+`), dot mode, 4 corner positions, 5 sizes, and 7 semantic colors. |
| `MagicButton` | `ButtonAtomProps` | Material 3 button supporting 4 variants (`filled`, `outlined`, `text`, `tonal`), 4 kinds (`standard`, `elevated`, `fab`, `mini-fab`), 3 shapes (`pill`, `rounded`, `square`), 5 sizes (`xs`..`xl`), leading/trailing icons, loading spinner, and `fullWidth`. |
| `MagicButtonToggle` | `ButtonToggleAtomProps` | Segmented button toggle group supporting single (`value`) and multi-select (`values` / `multiple`), horizontal/vertical orientation, `standard` and `legacy` appearances, icons, and per-option disablement. |
| `MagicCheckBox` | `CheckBoxAtomProps` | Tri-state Material 3 checkbox (`checked`, `unchecked`, `indeterminate`) with configurable label placement (`before`/`after`), required indicator, and hierarchical `task` checklists with automatic parent tri-state aggregation. |
| `MagicChip` | `ChipAtomProps` | Material 3 chip supporting `selectable` filter chips, `removable` input chips, `draggable` step adjustment (`ArrowLeft`/`ArrowRight`), avatar/leading/remove icons, horizontal/vertical stack lists (`items`), and 7 semantic colors. |
| `MagicProgressIndicator` | `ProgressIndicatorAtomProps` | Linear (`bar`) and circular (`spinner`) Material 3 progress indicators supporting `determinate`, `indeterminate`, `buffer` (`bufferValue`), and `query` modes with custom `diameter` and `strokeWidth`. |
| `MagicRadioButton` | `RadioButtonAtomProps` | Accessible Material 3 radio group (`role="radiogroup"`) with single-selection keyboard/press handling, horizontal/vertical orientation, label positioning (`before`/`after`), and per-option disablement. |
| `MagicSlideToggle` | `SlideToggleAtomProps` | Material 3 switch atom with animated track/thumb, optional `showIcons` check/close glyphs, configurable `iconChecked` / `iconUnchecked`, `labelPosition`, and `required` state. |
| `MagicSlider` | `SliderAtomProps` | Single-thumb (`value`) and dual-thumb range (`rangeStart` / `rangeEnd`) Material 3 slider with `step` quantization, `discrete` value bubble (`displayWith`), `showTickMarks`, and keyboard arrow/Home/End navigation. |
| `MagicTextInput` | `TextInputAtomProps` | Bare Material 3 text input control supporting `type` (`text`, `email`, `password`, `number`, `search`, `tel`, `url`), `multiline` textarea, `readOnly`, `maxLength`, and automatic integration with `MagicFormField`. |
| `MagicToolTip` | `ToolTipAtomProps` | Accessible Material 3 tooltip (`role="tooltip"`) supporting 6 placements (`above`, `below`, `left`, `right`, `before`, `after`), `showDelay` / `hideDelay`, `touchGestures` (`auto`, `on`, `off`), and fallback `MagicButton` trigger. |

### Molecules (5)

| Component | Contract | Composes / Description |
| --- | --- | --- |
| `MagicCard` | `CardMoleculeProps` | Material 3 card (`outlined` / `raised`) composing `MagicChip` (`chips`) and `MagicButton` (`actions`) with title, subtitle, header/media/content/actions slots, and 5 `imageSize` presets (`small`, `medium`, `large`, `extra-large`, `full`). |
| `MagicFormField` | `FormFieldMoleculeProps` | Material 3 form-field decorator (`outlined` / `filled`, `floatLabel`, `hint`, `errorMessage`, `maxLength` counter, `prefix` / `suffix` slots) providing `MagicFormFieldContext` to nested controls (`MagicTextInput`). |
| `MagicMenu` | `MenuMoleculeProps` | Anchored Material 3 menu composing `MagicButton` (`triggerType="button"` / `"icon"`) or custom `triggerSlot`, supporting recursive nested submenus (`children` drill-down with Back navigation), dividers, and keyboard dismissal (`Escape` / `Tab`). |
| `MagicSearchBar` | `SearchBarMoleculeProps` | Search landmark (`role="search"`) composing `MagicFormField`, `MagicTextInput`, and `MagicButton` with live query change (`onValueChange`), clear action (`onClear`), and submit action (`onSearch`). |
| `MagicSelect` | `SelectMoleculeProps` | Material 3 dropdown select supporting single (`value`) and multi-select (`values` / `multiple` with checkboxes), flat `options` or grouped `optionGroups`, `panelWidth`, and custom `triggerSlot` / `optionRenderer` / `footerSlot`. |

---

## Usage Examples

### Atomic Form Field + Text Input Composition

```tsx
import { useState } from 'react';
import { MagicFormField, MagicTextInput, MagicIcon } from '@mono-magic/rn-paper';

export function EmailInputField() {
  const [email, setEmail] = useState('');
  const isInvalid = email.length > 0 && !email.includes('@');

  return (
    <MagicFormField
      label="Work Email"
      appearance="outlined"
      hint="We'll never share your email."
      invalid={isInvalid}
      errorMessage="Please enter a valid email address"
      required
      maxLength={64}
      valueLength={email.length}
      prefix={<MagicIcon name="mail" />}
    >
      <MagicTextInput
        type="email"
        placeholder="alex@mono-magic.dev"
        value={email}
        onValueChange={setEmail}
      />
    </MagicFormField>
  );
}
```

### Card with Chips and Actions

```tsx
import { MagicCard } from '@mono-magic/rn-paper';

export function ProjectCard() {
  return (
    <MagicCard
      appearance="raised"
      title="Material 3 Design System"
      subtitle="React Native Paper v5"
      content="Cross-platform atomic components for Expo and React Native Web."
      chips={[
        { id: 'rn', label: 'React Native', selected: true },
        { id: 'm3', label: 'Material 3' },
      ]}
      actions={[
        { id: 'docs', label: 'Documentation', variant: 'text' },
        { id: 'explore', label: 'Explore', variant: 'filled', color: 'primary' },
      ]}
    />
  );
}
```

---

## Development & Verification Commands

Run all commands from the workspace root via Nx:

```bash
# Lint source, test, and story files
pnpm exec nx run rn-paper:lint

# Type-check declarations and strict TypeScript contracts
pnpm exec nx run rn-paper:typecheck

# Run Vitest unit tests with V8 coverage (>= 80% across lines, statements, functions, branches)
pnpm exec nx run rn-paper:test -- --coverage

# Launch interactive Storybook dev server
pnpm exec nx run rn-paper:storybook

# Build static Storybook showcase
pnpm exec nx run rn-paper:build-storybook

# Run Storybook play interaction and accessibility tests in headless Chromium
pnpm exec nx run rn-paper:test-storybook
```
