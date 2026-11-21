# @mono-magic/react-mui

React 19 (`19.3.x`) + Material UI (`@mui/material` `9.5.x`) design-system component library adhering to **Atomic Design**, **contract-first interfaces** from `@mono-magic/atomic-design-interfaces`, **Material 3 (MD3) theming** across 7 curated palettes, and dual controlled/uncontrolled React ergonomics with direct React 19 `ref` prop forwarding.

## Architecture & Conventions

- **Component prefix**: `Magic*` (`MagicButton`, `MagicFormField`, etc.), matching `@mono-magic/ng-mat` feature-for-feature.
- **Contract-first typing**: every component extends its corresponding `*AtomProps` or `*MoleculeProps` contract from `@mono-magic/atomic-design-interfaces`, keeping shared design contracts framework-agnostic.
- **React 19 ergonomics**:
  - Direct `ref` prop forwarding without `forwardRef` wrappers.
  - Controlled (`value` / `checked` + `onChange`) and uncontrolled (`defaultValue` / `defaultChecked`) support via `useControllableState`.
- **Strict Atomic Design boundaries**:
  - **Atoms** (`MagicTextInput`, `MagicButton`, `MagicChip`, etc.) are bare, single-purpose UI primitives. `MagicTextInput` renders only an input control (`OutlinedInput` / `FilledInput` / `InputBase`) and never renders a `FormControl`, `<label>`, or helper text on its own.
  - **Molecules** (`MagicFormField`, `MagicSearchBar`, `MagicCard`, `MagicMenu`, `MagicSelect`) compose atoms and provide layout, labels, hints, validation messages, and prefix/suffix slots via `MagicFormFieldContext`.
- **Zero demo data in component source**: showcase fixtures live strictly in `.stories.tsx` and `.spec.tsx`.

---

## Material 3 Theming

`@mono-magic/react-mui` ships 7 Material 3 theme palettes matching `@mono-magic/ng-mat`:

| Palette Name | Mode | Primary | Secondary | Tertiary | Surface |
| --- | --- | --- | --- | --- | --- |
| `azure-blue` *(default)* | `light` | `#1976d2` | `#26a69a` | `#7e57c2` | `#faf9fd` |
| `light-theme` | `light` | `#6750a4` | `#625b71` | `#7d5260` | `#fef7ff` |
| `dark-theme` | `dark` | `#d0bcff` | `#ccc2dc` | `#efb8c8` | `#141218` |
| `rose-red` | `light` | `#c2185b` | `#ad1457` | `#7b1fa2` | `#fff8f8` |
| `cyan-orange` | `dark` | `#00bcd4` | `#ff9800` | `#26c6da` | `#101417` |
| `orange-red` | `dark` | `#ff5722` | `#ff7043` | `#ffa726` | `#1a110f` |
| `magenta-violet` | `dark` | `#e91e63` | `#9c27b0` | `#ba68c8` | `#181116` |

### Theme Provider & Factory Usage

Wrap your application in `MagicMuiThemeProvider` (or build a custom MUI `Theme` with `createMagicMuiTheme`):

```tsx
import {
  MagicMuiThemeProvider,
  createMagicMuiTheme,
  MagicButton,
} from '@mono-magic/react-mui';

export function App() {
  return (
    <MagicMuiThemeProvider palette="azure-blue">
      <MagicButton label="Save Changes" variant="contained" color="primary" />
    </MagicMuiThemeProvider>
  );
}

// Or construct a theme instance directly:
const customDarkTheme = createMagicMuiTheme('cyan-orange');
```

### Semantic Tokens

- **Color Intents (`ColorIntent`)**: `'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'neutral'`
- **Atomic Sizes (`AtomicSize`)**: `'xs' | 'sm' | 'md' | 'lg' | 'xl'` (accessible via `MAGIC_SIZE_METRICS`)
- **Shapes (`ButtonShape`)**: `'square' | 'rounded' | 'pill'` (accessible via `MAGIC_SHAPE_RADIUS`)

---

## Component Catalog

### Atoms (11)

| Component | Contract | Description |
| --- | --- | --- |
| `MagicBadge` | `BadgeAtomProps` | Notification badge overlay supporting content counts, dot indicator, overlap, 4 corner positions, hidden/disabled states, and standalone or wrapped children. |
| `MagicButton` | `ButtonAtomProps` | Material 3 button supporting 4 visual variants (`contained`, `outlined`, `text`, `tonal`), 4 kinds (`regular`, `icon`, `fab`, `mini-fab`), 3 shapes (`square`, `rounded`, `pill`), leading/trailing icons, loading spinner, and `disabledInteractive`. |
| `MagicButtonToggle` | `ButtonToggleAtomProps` | Segmented toggle group supporting exclusive (`single`) and multi-selection (`multiple`), horizontal/vertical orientation, `standard`/`legacy` appearance, per-option icons, and disabled states. |
| `MagicCheckBox` | `CheckBoxAtomProps` | Checkbox atom supporting `checked`, `indeterminate`, label positioning (`before`/`after`), recursive hierarchical task trees (`task` + `subtasks` with `allComplete` / `someComplete`), and `disabledInteractive`. |
| `MagicChip` | `ChipAtomProps` | Interactive chip supporting `selectable`, `removable`, `editable` (double-click or Enter inline editing), `draggable` (HTML5 drag events + Arrow key reordering), avatars, leading/remove icons, and vertical stacked layout. |
| `MagicProgressIndicator` | `ProgressIndicatorAtomProps` | Linear (`bar`) and circular (`spinner`) progress indicators supporting `determinate`, `indeterminate`, `buffer`, and `query` modes across all 5 sizes and 7 color intents. |
| `MagicRadioButton` | `RadioButtonAtomProps` | Radio group atom supporting horizontal/vertical layout, label positioning (`before`/`after`), per-option disabled state, and `disabledInteractive`. |
| `MagicSlideToggle` | `SlideToggleAtomProps` | Material 3 switch atom with checked/unchecked track icons (`hideIcon`), label positioning (`before`/`after`), and `disabledInteractive`. |
| `MagicSlider` | `SliderAtomProps` | Single-thumb and dual-thumb (`range`) slider supporting discrete steps, tick marks (`showTickMarks`), value tooltip formatting (`displayWith`), and all 7 color intents. |
| `MagicTextInput` | `TextInputAtomProps` | Bare input control atom (`text`, `email`, `password`, `number`, `search`, `tel`, `url`) that automatically binds to enclosing `MagicFormField` context or renders standalone. |
| `MagicToolTip` | `ToolTipAtomProps` | Accessible tooltip wrapper supporting 6 placements (`above`, `below`, `left`, `right`, `before`, `after`), show/hide delays, touch gestures, and standalone fallback trigger. |

### Molecules (5)

| Component | Contract | Composes / Description |
| --- | --- | --- |
| `MagicCard` | `CardMoleculeProps` | Content container composing `MagicButton` actions and `MagicChip` tags with header title/subtitle, avatar slot, media image sizing (`sm`, `md`, `lg`, `full`), `outlined`/`raised` appearances, and footer slot. |
| `MagicFormField` | `FormFieldMoleculeProps` | Form field decorator providing `FormControl`, floating label (`auto`/`always`), required marker (`hideRequiredMarker`), prefix/suffix slots, hint text, and live `role="alert"` error messages via `MagicFormFieldContext`. |
| `MagicMenu` | `MenuMoleculeProps` | Action dropdown menu composing `MagicButton` trigger, Material icons, dividers, per-item disabled states, and recursive nested submenus (`MagicMenuSubmenu`) with hover and keyboard navigation. |
| `MagicSearchBar` | `SearchBarMoleculeProps` | Semantic `role="search"` landmark composing `MagicFormField`, `MagicTextInput`, clear action, and `MagicButton` submit trigger with Enter key submission and loading state. |
| `MagicSelect` | `SelectMoleculeProps<T>` | Dropdown select molecule composing `MagicFormField` and MUI `Select` with flat `options`, grouped `optionGroups`, multi-select checkboxes, and `customTriggerSummary` (`"First (+N others)"`). |

---

## Usage Examples

### Atomic Form Field + Text Input Composition

`MagicFormField` owns the field chrome (label, prefix/suffix, hint, error text) while `MagicTextInput` provides the bare input control:

```tsx
import { useState } from 'react';
import { MagicFormField, MagicTextInput, MagicIcon } from '@mono-magic/react-mui';

export function EmailField() {
  const [email, setEmail] = useState('');
  const hasError = email.length > 0 && !email.includes('@');

  return (
    <MagicFormField
      label="Work Email"
      appearance="outlined"
      hint="We'll never share your email."
      errorText={hasError ? 'Please enter a valid email address' : undefined}
      required
      prefix={<MagicIcon name="mail" />}
    >
      <MagicTextInput
        type="email"
        placeholder="alex@example.com"
        value={email}
        onChange={setEmail}
      />
    </MagicFormField>
  );
}
```

### Select with Option Groups & Custom Multi-Select Summary

```tsx
import { useState } from 'react';
import { MagicSelect } from '@mono-magic/react-mui';

export function PokemonSelect() {
  const [selected, setSelected] = useState<string[]>(['bulbasaur', 'pikachu']);

  return (
    <MagicSelect<string>
      label="Starter Pokémon"
      multiple
      customTriggerSummary
      value={selected}
      onChange={(next) => setSelected((next as string[]) ?? [])}
      optionGroups={[
        {
          label: 'Grass',
          options: [
            { value: 'bulbasaur', label: 'Bulbasaur' },
            { value: 'chikorita', label: 'Chikorita' },
          ],
        },
        {
          label: 'Electric',
          options: [{ value: 'pikachu', label: 'Pikachu' }],
        },
      ]}
    />
  );
}
```

### Card with Chips & Actions

```tsx
import { MagicCard } from '@mono-magic/react-mui';

export function ProjectCard() {
  return (
    <MagicCard
      title="Material 3 Design System"
      subtitle="React 19 + MUI v9.5"
      appearance="outlined"
      content="Contract-first atomic components with 7 Material 3 theme palettes."
      chips={['React 19', 'MUI v9', 'Material 3']}
      actions={[
        { label: 'Documentation', variant: 'text' },
        { label: 'Explore', variant: 'tonal', color: 'primary' },
      ]}
    />
  );
}
```

---

## Development & Verification Commands

Run all commands from the workspace root via Nx:

```bash
# Lint the library
pnpm exec nx run react-mui:lint

# Typecheck library, unit tests, and Storybook stories
pnpm exec nx run react-mui:typecheck

# Run unit tests with V8 coverage (>= 80% threshold enforced)
pnpm exec nx run react-mui:test -- --coverage

# Launch interactive Storybook dev server
pnpm exec nx run react-mui:storybook

# Build static Storybook showcase
pnpm exec nx run react-mui:build-storybook

# Run Storybook interaction (play) and accessibility tests in headless Chromium
pnpm exec nx run react-mui:test-storybook
```
