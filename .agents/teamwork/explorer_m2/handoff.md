# Explorer M2 Handoff — Wave 2 Molecule Contracts, Dart Models/Icons, and MUI Theme Prep

**Status**: Complete. All files in M2's scope (`atomic-design-interfaces`, `fl-mat` contracts/icons/tests, `react-mui/src/lib/theme/mui-theme.tsx`) were inspected directly, MUI v9 `.d.ts` definitions were checked, and the baseline check `pnpm nx run-many -t lint typecheck test -p atomic-design-interfaces,react-mui` passed (`exit 0`).

---

## 1. `libs/ui/atomic-design-interfaces` Findings

### 1.1 Entrypoints, Module Format & Tooling
- `package.json`: `"name": "@mono-magic/atomic-design-interfaces"`, `"type": "module"`, tags `["scope:ui", "type:interfaces"]`.
- `src/index.ts` (lines 1–6) re-exports:
  ```ts
  export * from './lib/common/atomic.interface.js';
  export * from './lib/atoms/index.js';
  export * from './lib/molecules/index.js';
  export * from './lib/organisms/index.js';
  export * from './lib/templates/index.js';
  ```
- **ESM `.js` extensions required** in all relative imports and barrel exports (`molecules/index.ts` lines 1–5 use `export * from './card.interface.js';` etc.).
- `tsconfig.lib.json` includes `src/**/*.ts`, excludes `*.test.*` / `*.spec.*`, and runs with `emitDeclarationOnly: true`.
- `vitest.config.mts`: `environment: 'node'`, `globals: true` (`describe`, `it`, `expect` available globally without import, matching `interfaces.spec.ts`), `coverage.provider: 'v8'`.
- `eslint.config.mjs`: inherits root `../../../eslint.config.mjs`.

### 1.2 Common Tokens (`src/lib/common/atomic.interface.ts`)
- `AtomicTier` (`'atom' | 'molecule' | 'organism' | 'template'`), `ATOMIC_TIERS: readonly AtomicTier[] = [...] as const`
- `AtomicSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'`
- `ColorIntent = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'neutral'`
  - **Important**: `'info'` is NOT in `ColorIntent`. For `AlertSeverity = 'info' | 'success' | 'warning' | 'error'`, downstream implementations map `'info'` -> `'primary'` (or MUI `'info'` / M3 primary).
- `BaseAtomicProps`: `{ id?: string; testId?: string; ariaLabel?: string; }`
- `BaseMoleculeProps = BaseAtomicProps` (does **NOT** include `disabled?: boolean` — unlike `BaseAtomProps`!). Any molecule that supports `disabled` declares it explicitly on its interface (see `MenuMoleculeProps` line 32, `SearchBarMoleculeProps` line 16, `SelectMoleculeProps` line 23).

### 1.3 Existing Molecule & Atom Contract Conventions
Inspected all 5 existing molecule files + `button.interface.ts`, `badge.interface.ts`, `chip.interface.ts`:
- **Type & Constant Array Naming**:
  - `ATOMIC_TIERS: readonly AtomicTier[] = [...] as const;` (`atomic.interface.ts:3-8`). Follow the same pattern for Wave 2 constant arrays listed in `SCOPE.md`:
    - `DIALOG_SIZES: readonly DialogSize[] = ['sm', 'md', 'lg', 'fullscreen'] as const;`
    - `ALERT_SEVERITIES: readonly AlertSeverity[] = ['info', 'success', 'warning', 'error'] as const;`
    - `ALERT_VARIANTS: readonly AlertVariant[] = ['standard', 'filled', 'outlined'] as const;`
    - `TOAST_POSITIONS: readonly ToastPosition[] = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const;`
    - `TABS_ORIENTATIONS: readonly TabsOrientation[] = ['horizontal', 'vertical'] as const;`
    - `TABS_VARIANTS: readonly TabsVariant[] = ['primary', 'secondary'] as const;`
    - `ACCORDION_APPEARANCES: readonly AccordionAppearance[] = ['outlined', 'raised'] as const;`
    - `AVATAR_STATUSES: readonly AvatarStatus[] = ['online', 'busy', 'offline'] as const;`
    - `AVATAR_SHAPES: readonly AvatarShape[] = ['circle', 'rounded', 'square'] as const;`
    - `AVATAR_GROUP_SPACINGS: readonly AvatarGroupSpacing[] = ['tight', 'normal'] as const;`
- **Primary Interface Naming (`*MoleculeProps` vs `Magic*Props`)**:
  - Every existing molecule contract uses `<Name>MoleculeProps extends BaseMoleculeProps` (`CardMoleculeProps`, `FormFieldMoleculeProps`, `MenuMoleculeProps`, `SearchBarMoleculeProps`, `SelectMoleculeProps`).
  - As specified in `SCOPE.md`, export `<Name>MoleculeProps` as the canonical interface AND export optional `export type Magic<Name>Props = <Name>MoleculeProps;` aliases (`MagicDialogProps`, `MagicAlertProps`, `MagicToastProps`, `MagicTabsProps`, `MagicAccordionProps`, `MagicAvatarProps`, `MagicAvatarGroupProps`).
  - **Watch out for name collisions in `react-mui`/`rn-paper`**: `react-mui` and `rn-paper` define their own `export interface MagicCardProps extends CardMoleculeProps`. They import `CardMoleculeProps` from `@mono-magic/atomic-design-interfaces` (never `MagicCardProps`), so having the alias in `atomic-design-interfaces` won't break existing imports, and Stage 2 workers should continue importing `<Name>MoleculeProps` in `react-mui`/`rn-paper`/`ng-mat`.
- **Action Item Reuse (`card.interface.ts:14-21` & `button.interface.ts:7-12`)**:
  - `CardActionItem` (`card.interface.ts:14-21`) has:
    ```ts
    export interface CardActionItem {
      id?: string;
      label: string;
      variant?: ButtonVariant;
      color?: ColorIntent;
      icon?: string;
      disabled?: boolean;
    }
    ```
  - `DialogActionItem` (`dialog.interface.ts`) should match this exact shape (or extend/alias `CardActionItem` / declare identical fields with JSDoc; keeping `DialogActionItem` as its own exported interface or `export interface DialogActionItem extends CardActionItem {}` guarantees identical properties plus clean symbol name `DialogActionItem`). Note `DialogMoleculeProps.actions?: readonly DialogActionItem[]` and `alignActions?: 'start' | 'end'` match `CardMoleculeProps` lines 33 & 35!
- **JSDoc Style**:
  - Concise single-line `/** ... */` or multi-line `/** ... */` comments on interfaces and non-obvious fields (see `form-field.interface.ts:7,11`, `button.interface.ts:14-19,27,41-46`, `badge.interface.ts:18,25-30`).
- **CRITICAL Angular `SignalProps` Constraint (`ng-mat/src/lib/core/signal-props.ts:12-14`)**:
  - `export type SignalProps<P> = { readonly [K in keyof P]-?: Signal<P[K] | undefined>; };`
  - Every property placed on `<Name>MoleculeProps` MUST be implemented as an Angular `input()` / `model()` / `computed()` signal on `Magic<Name>Component` in Stage 2! Keep contracts clean, minimal, and strictly framework-agnostic (no callbacks like `onClose` on `*MoleculeProps` — callbacks are added in framework-specific props/outputs, just like `CardMoleculeProps` omits `onActionClick` and `MenuMoleculeProps` omits `onItemSelect`).
- **Existing `interfaces.spec.ts` (`src/lib/interfaces.spec.ts:1-116`)**:
  - Imports `ATOMIC_TIERS` and type-only `type ...Props` from `'../index.js'`.
  - Tests `ATOMIC_TIERS` runtime values with `expect(...).toEqual([...])`.
  - Instantiates typed `const x: ...MoleculeProps = { ... };` objects and asserts property values with `expect(...)`.
  - **Recommendation for M2**: Test all 10 new runtime `const` arrays (`DIALOG_SIZES`, `ALERT_SEVERITIES`, `ALERT_VARIANTS`, `TOAST_POSITIONS`, `TABS_ORIENTATIONS`, `TABS_VARIANTS`, `ACCORDION_APPEARANCES`, `AVATAR_STATUSES`, `AVATAR_SHAPES`, `AVATAR_GROUP_SPACINGS`) AND all 7 new prop contracts (`DialogMoleculeProps`, `AlertMoleculeProps`, `ToastMoleculeProps`, `TabsMoleculeProps`, `AccordionMoleculeProps`, `AvatarMoleculeProps`, `AvatarGroupMoleculeProps` + `Magic*Props` aliases and item types).

---

## 2. `libs/ui/fl-mat` Findings

### 2.1 `lib/src/interfaces/atomic_interfaces.dart` (975 lines)
- **File header**:
  ```dart
  /// Atomic Design taxonomy and shared property contracts for Flutter Material 3
  /// components, mirroring `@mono-magic/atomic-design-interfaces`.
  library;

  import 'package:flutter/widgets.dart';
  ```
- **Enum style**:
  - `///` Dartdoc on every enum and every enum value (lines 7–615).
  - LowerCamelCase values (`withActions`, `extraLarge`, `topLeft`, etc.). Note `DialogSize`: `'sm' | 'md' | 'lg' | 'fullscreen'` -> `sm`, `md`, `lg`, `fullscreen` (matching `AtomicSize`: `xs, sm, md, lg, xl`).
  - `ToastPosition`: `topLeft`, `topCenter`, `topRight`, `bottomLeft`, `bottomCenter`, `bottomRight`.
  - `AlertSeverity`: `info`, `success`, `warning`, `error`.
  - `AlertVariant`: `standard`, `filled`, `outlined`.
  - `TabsOrientation`: `horizontal`, `vertical`.
  - `TabsVariant`: `primary`, `secondary`.
  - `AccordionAppearance`: `outlined`, `raised`.
  - `AvatarStatus`: `online`, `busy`, `offline`.
  - `AvatarShape`: `circle`, `rounded`, `square`.
  - `AvatarGroupSpacing`: `tight`, `normal`.
  - Reuse `CardActionsAlignment` or define `DialogActionsAlignment` (`start`, `end`) — defining `DialogActionsAlignment` (or `CardActionsAlignment`) keeps naming parallel to `CardActionsAlignment` (lines 554–560).
- **Item / Descriptor Class style** (see `CardActionItem` lines 517–551, `ChipItem` lines 270–349, `MenuItemData` lines 616–650):
  - `@immutable` annotation.
  - `const` constructor with named parameters (`required` for non-nullable required fields, sensible defaults like `this.disabled = false`).
  - `final` fields with `///` Dartdoc on constructor and every field.
  - **Dual Icon Convention in Dart models**: Every item class with an icon has BOTH `final IconData? icon;` AND `final String? iconName;` (see `CardActionItem` lines 544–547, `MenuItemData` lines 637–640, `ButtonToggleOption` lines 180–183, `ChipItem` lines 316–319). Follow this exact convention on `DialogActionItem`, `TabItem`, `AccordionItem`!
  - `copyWith(...)` method is included on mutable-state item classes like `CheckBoxTask` (lines 229–243) and `ChipItem` (lines 322–349). Adding `copyWith` on `TabItem`, `AccordionItem`, `AvatarGroupItem` (and/or `DialogActionItem`) is helpful and tested in `test/core_theme_test.dart:493-558`.
- **Molecule `*Props` Classes** (see `MagicFormFieldProps` lines 861–918, `MagicSearchBarProps` lines 921–974):
  - `@immutable class Magic<Name>Props implements BaseAtomicProps`
  - Note `BaseAtomicProps` (lines 693–705) requires `String? get id;`, `String? get testId;`, `String? get ariaLabel;`, `bool get disabled;` (so every `implements BaseAtomicProps` class has `@override final String? id;`, `@override final String? testId;`, `@override final String? ariaLabel;`, `@override final bool disabled;` defaulting `this.disabled = false`).
  - Also note: `MagicCard`, `MagicMenu`, `MagicSelect` didn't even have `Magic*Props` wrapper classes in `atomic_interfaces.dart` (only `MagicButtonProps`, `MagicTextInputControlProps`, `MagicFormFieldProps`, `MagicSearchBarProps` do), whereas `SCOPE.md` explicitly asks `atomic_interfaces.dart` to mirror all Wave 2 molecule enums, item classes, AND prop/model classes (`MagicDialogProps`, `MagicAlertProps`, `MagicToastProps`, `MagicTabsProps`, `MagicAccordionProps`, `MagicAvatarProps`, `MagicAvatarGroupProps`). Including all 7 `Magic*Props implements BaseAtomicProps` classes in `atomic_interfaces.dart` fulfills `SCOPE.md` cleanly.
  - Note `MagicFormFieldProps` / `MagicTextInputControlProps` use `requiredField` instead of `required` (reserved keyword in Dart — none of the Wave 2 props use `required`, though avoid `default` as an enum/field name too; use `defaultActiveTabId`, `defaultExpandedIds`).
  - Check `TabItem.badgeContent`: in TS it's `string | number`; in Dart `String?` or `Object?` (prefer `String?` or `Object?` — `MagicBadge` in `fl-mat` can check `libs/ui/fl-mat/lib/src/atoms/badge/magic_badge.dart`; `Object?` accepts both `String` and `int`).

### 2.2 `lib/src/core/magic_icon.dart` (`magicIconMap` lines 12–151)
All 8 icons explicitly mentioned in `SCOPE.md` and `explorer_m2` prompt are **ALREADY PRESENT** in `magicIconMap`:
- `'info': Icons.info` (line 86) & `'info_outline': Icons.info_outline` (line 87)
- `'check_circle': Icons.check_circle` (line 37)
- `'warning': Icons.warning` (line 148) & `'warning_amber': Icons.warning_amber` (line 149)
- `'error': Icons.error` (line 60) & `'error_outline': Icons.error_outline` (line 61)
- `'close': Icons.close` (line 41) & `'clear': Icons.clear` (line 40)
- `'expand_more': Icons.expand_more` (line 64)
- `'expand_less': Icons.expand_less` (line 63)
- `'person': Icons.person` (line 113) & `'person_outline': Icons.person_outline` (line 114) & `'account_circle': Icons.account_circle` (line 13) & `'group': Icons.group` (line 80)

Additional check of potentially useful Wave 2 icons:
- Already present: `check`, `check_circle`, `cancel`, `notifications`, `notifications_active`, `notifications_none`, `chevron_left`, `chevron_right`, `arrow_back`, `arrow_forward`, `settings`, `home`, `star`, `favorite`, `help_outline`, `visibility`, `edit`, `delete`, `refresh`, `schedule`.
- **Missing** (useful if stories/variants use outlined check or keyboard arrows for tabs/accordion):
  - `'check_circle_outline': Icons.check_circle_outline`
  - `'keyboard_arrow_down': Icons.keyboard_arrow_down`
  - `'keyboard_arrow_up': Icons.keyboard_arrow_up`
  - `'keyboard_arrow_left': Icons.keyboard_arrow_left`
  - `'keyboard_arrow_right': Icons.keyboard_arrow_right`
  - `'person_add': Icons.person_add`
  - `'fullscreen': Icons.fullscreen`
  - `'fullscreen_exit': Icons.fullscreen_exit`
  (Adding these to `magicIconMap` in alphabetical order is completely safe and keeps `--tree-shake-icons` compatibility.)

### 2.3 `libs/ui/fl-mat/test/`
- `test/core_theme_test.dart:492-559` has `group('Atomic interface contracts', ...)` testing constructors & `copyWith` across existing models. `worker_m2` can add Wave 2 contract constructor/`copyWith` assertions there (since `test/core_theme_test.dart` is inside `libs/ui/fl-mat/test/`, check if `SCOPE.md` allows editing it — `SCOPE.md` only lists `atomic_interfaces.dart` and `magic_icon.dart` under `libs/ui/fl-mat/`, so leave `test/core_theme_test.dart` for Stage 2 `fl-mat` worker or only touch `SCOPE.md` files!).
- Remember: `flutter` / `dart` binaries are **not installed** in this container, so `fl-mat` Dart changes cannot be analyzed/tested locally here.

---

## 3. `libs/ui/react-mui/src/lib/theme/mui-theme.tsx` Findings

### 3.1 Existing Module Augmentations (`mui-theme.tsx:36-167`)
- `Palette` & `PaletteOptions` (`@mui/material/styles`, lines 36–48): already declare `tertiary`, `neutral`, `magic: MagicPaletteTokens`.
- Existing color override augmentations (lines 50–167): `Button`, `IconButton`, `Fab`, `Badge`, `Chip`, `Checkbox`, `Radio`, `Switch`, `Slider`, `LinearProgress`, `CircularProgress`, `ToggleButton`, `ToggleButtonGroup`, `FormControl`, `InputBase`, `FormLabel`, `Icon` (all adding `tertiary: true; neutral: true;`).
- **Existing usage pattern** (`card.tsx` & `badge.tsx`):
  - `card.tsx` uses `theme.palette.magic?.surface` and `theme.palette.magic?.outline` with fallbacks (`theme.palette.background.paper`, `theme.palette.divider`).
  - `badge.tsx` calls `resolveMagicIntentColors(theme, color)` from `mui-theme.tsx:566-583` to style custom intents (`tertiary`, `neutral`, etc.) via `sx`.

### 3.2 Exact MUI v9.5.0 `.d.ts` Augmentation Interfaces Verified in `node_modules/@mui/material/`
Checked all 7 target MUI component `.d.ts` files (`Alert`, `Tabs`, `Tab`, `Avatar`, `AvatarGroup`, `Dialog`, `Accordion`, `Snackbar`) and `styles/components.d.ts`:

1. **`@mui/material/Alert`** (`Alert.d.ts:12-13,105,110`):
   - Has `AlertPropsColorOverrides` (used by both `color` and `severity` props, and `iconMapping`!).
   - Has `AlertPropsVariantOverrides` (default `'standard' | 'filled' | 'outlined'`).
   - Augmenting `AlertPropsColorOverrides` with `primary: true; secondary: true; tertiary: true; neutral: true;` (or `tertiary: true; neutral: true;`) allows `<Alert color="tertiary">` / `<Alert color="neutral">` if ever needed. Note: `AlertColor` already includes `'success' | 'info' | 'warning' | 'error'`, and `theme.palette.info` exists on MUI's default `Palette` (verified `createPalette.d.ts:90`).
2. **`@mui/material/Tabs`** (`Tabs.d.ts:10-11,157,191`):
   - **GOTCHA**: There is **NO** `TabsPropsColorOverrides`! The actual interface name in `@mui/material/Tabs` is **`TabsPropsIndicatorColorOverrides`** (`indicatorColor?: OverridableStringUnion<'secondary' | 'primary', TabsPropsIndicatorColorOverrides>`), and **`TabsPropsVariantOverrides`**. `textColor` is hardcoded to `'secondary' | 'primary' | 'inherit'` (not overridable via module augmentation).
   - So augmenting `@mui/material/Tabs` should augment `TabsPropsIndicatorColorOverrides` (e.g., `tertiary: true; neutral: true; success: true; warning: true; error: true;`), NOT a non-existent `TabsPropsColorOverrides`!
3. **`@mui/material/Tab`** (`Tab.d.ts:7-54`):
   - Has **NO** `*ColorOverrides` interface at all! Colors are styled via `MuiTab.styleOverrides` or `sx`.
4. **`@mui/material/Avatar`** (`Avatar.d.ts:26`) & **`@mui/material/AvatarGroup`** (`AvatarGroup.d.ts:8`):
   - Have **NO** `*ColorOverrides` interface (only `AvatarPropsVariantOverrides` / `AvatarGroupPropsVariantOverrides`). Colors are styled via `sx` + `resolveMagicIntentColors(theme, color)` or `MuiAvatar.styleOverrides`.
5. **`@mui/material/Dialog`** (`Dialog.d.ts`), **`@mui/material/Accordion`** (`Accordion.d.ts`), **`@mui/material/Snackbar`** (`Snackbar.d.ts`):
   - Have **NO** `*ColorOverrides` interfaces.
6. **`components` Theme Overrides in `createMagicMuiTheme()` (`mui-theme.tsx:523-533`)**:
   - Verified in `node_modules/@mui/material/styles/components.d.ts` that all of these keys exist on `Components<Theme>`:
     - `MuiAlert`, `MuiAlertTitle` (lines 10–18)
     - `MuiAvatar`, `MuiAvatarGroup` (lines 30–38)
     - `MuiDialog`, `MuiDialogActions`, `MuiDialogContent`, `MuiDialogContentText`, `MuiDialogTitle` (lines 140–163)
     - `MuiAccordion`, `MuiAccordionActions`, `MuiAccordionDetails`, `MuiAccordionSummary` (lines 175–193)
     - `MuiSnackbar`, `MuiSnackbarContent` (lines 424–432)
     - `MuiTab`, `MuiTabs` (lines 502–505, 557–560)
   - Currently `createMagicMuiTheme()` only sets `MuiButton.styleOverrides` (lines 524–532). Adding M3-aligned `styleOverrides` for `MuiDialog` (`paper` borderRadius/background), `MuiAlert` (borderRadius, `standardInfo`/`filledInfo`/`outlinedInfo` or surface alignment), `MuiTabs` / `MuiTab` (`textTransform: 'none'`, `fontWeight: 600`), `MuiAccordion` (`backgroundColor: def.surface`, `borderColor: def.outline`), `MuiAvatar` (fontWeight/background), and `MuiSnackbar` keeps M3 parity across all 7 palettes while remaining backwards-compatible with `mui-theme.spec.tsx`.
   - **Safety check**: `mui-theme.spec.tsx` tests `MAGIC_PALETTE_DEFINITIONS`, `MAGIC_MUI_THEMES`, `resolveMagicIntentColors`, `MAGIC_SIZE_METRICS`, `MAGIC_SHAPE_RADIUS`, and `MagicMuiThemeProvider`. Adding `components` overrides & `AlertPropsColorOverrides` / `TabsPropsIndicatorColorOverrides` won't break any existing assertion in `mui-theme.spec.tsx`.

---

## 4. Baseline Verification Output

Ran:
```bash
pnpm nx run-many -t lint typecheck test -p atomic-design-interfaces,react-mui
```
Result: **PASSED (exit code 0)**:
- `atomic-design-interfaces:typecheck` ✔ [local cache]
- `atomic-design-interfaces:lint` ✔ [cache]
- `react-mui:lint` ✔ [cache]
- `react-mui:typecheck` ✔ [local cache]
- `atomic-design-interfaces:test` ✔
- `react-mui:test` ✔
- Note: Nx Cloud artifact download printed a non-fatal 400 warning (`x-goog-iap-egress-jwt-assertion`), which did not affect local execution or exit status.
