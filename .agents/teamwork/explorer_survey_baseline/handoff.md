# Survey Explorer 1 Handoff Report — Baseline & Repository Environment

**Executive Summary**: `@mono-magic/atomic-design-interfaces` already defines complete, strongly typed contracts for all 16 baseline components (11 atoms + 5 molecules), and `libs/ui/ng-mat` implements all 16 with 7 Material 3 palettes, CSS custom property tokens, Storybook 10 (`autodocs` + `a11y` + `vitest` + `storybook-addon-vis`), and 111 stories. Root `package.json` already ships every required React, MUI v9, RN 0.85 / RN Paper v5, Storybook 10, Vitest 4, and Playwright dependency; `main` is clean, `gh` is authenticated as `sukrutsathaye`, `/home/antigravity/sukrutsathaye/` is writable for sibling git worktrees, and `/usr/bin/chromium` is present locally (though `~/.cache/ms-playwright` is empty and `flutter` is not installed).

---

## 1. Observation

### 1.1 `@mono-magic/atomic-design-interfaces` Full Contract Catalog

Root barrel: `libs/ui/atomic-design-interfaces/src/index.ts:1-5` re-exports `./lib/common/atomic.interface.js`, `./lib/atoms/index.js`, `./lib/molecules/index.js`, `./lib/organisms/index.js`, `./lib/templates/index.js`.

#### Common Base Types (`libs/ui/atomic-design-interfaces/src/lib/common/atomic.interface.ts:1-34`)
- `AtomicTier` (line 1): `'atom' | 'molecule' | 'organism' | 'template'`
- `ATOMIC_TIERS` (lines 3-8): `readonly AtomicTier[] = ['atom', 'molecule', 'organism', 'template'] as const`
- `AtomicSize` (line 10): `'xs' | 'sm' | 'md' | 'lg' | 'xl'`
- `ColorIntent` (lines 12-19): `'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'neutral'`
- `BaseAtomicProps` (lines 21-25): `{ id?: string; testId?: string; ariaLabel?: string }`
- `BaseAtomProps` (lines 27-29): `extends BaseAtomicProps { disabled?: boolean }`
- `BaseMoleculeProps`, `BaseOrganismProps`, `BaseTemplateProps` (lines 31-33): aliases of `BaseAtomicProps`

#### Atom Interfaces (`libs/ui/atomic-design-interfaces/src/lib/atoms/*.interface.ts`)

| # | File & Lines | Exported Types / Helper Interfaces | Main Interface & Exact Props (all inherit `BaseAtomProps`: `id?`, `testId?`, `ariaLabel?`, `disabled?`) |
|---|---|---|---|
| 1 | `badge.interface.ts:7-31` | `BadgePosition = 'above after' \| 'above before' \| 'below after' \| 'below before' \| 'above' \| 'below' \| 'before' \| 'after'` | **`BadgeAtomProps`**: `content?: string \| number`, `color?: ColorIntent`, `size?: AtomicSize`, `position?: BadgePosition`, `overlap?: boolean`, `hidden?: boolean`, `description?: string`, `label?: string`, `icon?: string` |
| 2 | `button.interface.ts:7-48` | `ButtonVariant = 'filled' \| 'tonal' \| 'outlined' \| 'elevated' \| 'text'`; `ButtonKind = 'default' \| 'icon' \| 'fab' \| 'mini-fab' \| 'extended-fab'`; `ButtonShape = 'default' \| 'square' \| 'rounded' \| 'pill'`; `ButtonType = 'button' \| 'submit' \| 'reset'` | **`ButtonAtomProps`**: **`label: string` (required)**, `variant?: ButtonVariant`, `color?: ColorIntent`, `size?: AtomicSize`, `loading?: boolean`, `fullWidth?: boolean`, `leadingIcon?: string`, `trailingIcon?: string`, `kind?: ButtonKind`, `shape?: ButtonShape`, `disabledInteractive?: boolean`, `disableRipple?: boolean` |
| 3 | `button-toggle.interface.ts:7-30` | `ButtonToggleSelectionMode = 'single' \| 'multiple'`; `ButtonToggleAppearance = 'standard' \| 'legacy'`; `ButtonToggleOption<T = string> { value: T; label: string; icon?: string; disabled?: boolean; ariaLabel?: string }` | **`ButtonToggleAtomProps<T = string>`**: **`options: readonly ButtonToggleOption<T>[]` (required)**, `value?: T \| readonly T[]`, `selectionMode?: ButtonToggleSelectionMode`, `vertical?: boolean`, `appearance?: ButtonToggleAppearance`, `hideSelectionIndicator?: boolean`, `disabledInteractive?: boolean`, `size?: AtomicSize`, `color?: ColorIntent`, `name?: string`, `required?: boolean` |
| 4 | `check-box.interface.ts:7-30` | `CheckBoxLabelPosition = 'before' \| 'after'`; `CheckBoxTask { id?: string; name: string; checked?: boolean; disabled?: boolean; subtasks?: readonly CheckBoxTask[] }` | **`CheckBoxAtomProps`**: `label?: string`, `checked?: boolean`, `indeterminate?: boolean`, `required?: boolean`, `labelPosition?: CheckBoxLabelPosition`, `disableRipple?: boolean`, `disabledInteractive?: boolean`, `color?: ColorIntent`, `size?: AtomicSize`, `name?: string`, `checkboxValue?: string`, `tasks?: readonly CheckBoxTask[]` |
| 5 | `chip.interface.ts:7-37` | `ChipVariant = 'basic' \| 'selectable' \| 'input' \| 'draggable'`; `ChipOrientation = 'horizontal' \| 'vertical'`; `ChipItem { id?: string; label: string; removable?: boolean; disabled?: boolean; editable?: boolean; selectable?: boolean; selected?: boolean; avatarSrc?: string; avatarAlt?: string; leadingIcon?: string }` | **`ChipAtomProps`**: `chips?: readonly ChipItem[]`, `label?: string`, `variant?: ChipVariant`, `color?: ColorIntent`, `size?: AtomicSize`, `removable?: boolean`, `editable?: boolean`, `selectable?: boolean`, `multiple?: boolean`, `hideSelectionIndicator?: boolean`, `orientation?: ChipOrientation`, `disableRipple?: boolean`, `inputPlaceholder?: string` |
| 6 | `progress-indicator.interface.ts:7-23` | `ProgressIndicatorType = 'bar' \| 'spinner'`; `ProgressIndicatorMode = 'determinate' \| 'indeterminate' \| 'buffer' \| 'query'` | **`ProgressIndicatorAtomProps`**: `type?: ProgressIndicatorType`, `mode?: ProgressIndicatorMode`, `value?: number`, `bufferValue?: number`, `diameter?: number`, `strokeWidth?: number`, `color?: ColorIntent`, `size?: AtomicSize` |
| 7 | `radio-button.interface.ts:7-28` | `RadioLabelPosition = 'before' \| 'after'`; `RadioOption<T = string> { value: T; label: string; disabled?: boolean; labelPosition?: RadioLabelPosition; required?: boolean }` | **`RadioButtonAtomProps<T = string>`**: **`options: readonly RadioOption<T>[]` (required)**, `value?: T`, `name?: string`, `labelPosition?: RadioLabelPosition`, `required?: boolean`, `disabledInteractive?: boolean`, `disableRipple?: boolean`, `vertical?: boolean`, `color?: ColorIntent`, `size?: AtomicSize` |
| 8 | `slide-toggle.interface.ts:7-20` | `SlideToggleLabelPosition = 'before' \| 'after'` | **`SlideToggleAtomProps`**: `label?: string`, `checked?: boolean`, `required?: boolean`, `hideIcon?: boolean`, `labelPosition?: SlideToggleLabelPosition`, `disableRipple?: boolean`, `disabledInteractive?: boolean`, `color?: ColorIntent`, `size?: AtomicSize`, `name?: string` |
| 9 | `slider.interface.ts:7-21` | *(none)* | **`SliderAtomProps`**: `min?: number`, `max?: number`, `step?: number`, `value?: number`, `range?: boolean`, `startValue?: number`, `endValue?: number`, `discrete?: boolean`, `showTickMarks?: boolean`, `disableRipple?: boolean`, `color?: ColorIntent`, `size?: AtomicSize`, `displayWith?: (value: number) => string` |
| 10 | `text-input.interface.ts:3-46` | `TextInputVariant = 'outlined' \| 'filled'`; `TextInputType = 'text' \| 'email' \| 'password' \| 'search' \| 'tel' \| 'url' \| 'number'`; Legacy **`TextInputAtomProps`** (lines 10-20: `label: string`, `value?`, `placeholder?`, `helperText?`, `errorText?`, `variant?`, `size?`, `required?`, `readOnly?`) | **Target strict contract `TextInputControlProps`** (lines 35-46): `type?: TextInputType`, `name?: string`, `value?: string`, `placeholder?: string`, `size?: AtomicSize`, `required?: boolean`, `readOnly?: boolean`, `autocomplete?: string`, `minLength?: number`, `maxLength?: number` |
| 11 | `tool-tip.interface.ts:3-20` | `ToolTipPosition = 'above' \| 'below' \| 'left' \| 'right' \| 'before' \| 'after'`; `ToolTipTouchGestures = 'auto' \| 'on' \| 'off'` | **`ToolTipAtomProps`**: **`message: string` (required)**, `label?: string`, `position?: ToolTipPosition`, `showDelay?: number`, `hideDelay?: number`, `touchGestures?: ToolTipTouchGestures` |

#### Molecule Interfaces (`libs/ui/atomic-design-interfaces/src/lib/molecules/*.interface.ts`)

| # | File & Lines | Exported Types / Helper Interfaces | Main Interface & Exact Props (all inherit `BaseMoleculeProps`: `id?`, `testId?`, `ariaLabel?`) |
|---|---|---|---|
| 12 | `card.interface.ts:5-36` | `CardAppearance = 'outlined' \| 'raised'`; `CardVariant = 'basic' \| 'with-actions' \| 'with-chips'`; `CardImageSize = 'small' \| 'medium' \| 'large' \| 'extra-large' \| 'full'`; `CardActionItem { id?: string; label: string; variant?: ButtonVariant; color?: ColorIntent; icon?: string; disabled?: boolean }` | **`CardMoleculeProps`**: `title?: string`, `subtitle?: string`, `content?: string`, `imageSrc?: string`, `imageAlt?: string`, `imageSize?: CardImageSize`, `appearance?: CardAppearance`, `variant?: CardVariant`, `width?: string`, `actions?: readonly CardActionItem[]`, `chips?: readonly ChipItem[]`, `alignActions?: 'start' \| 'end'` |
| 13 | `form-field.interface.ts:3-18` | `FormFieldAppearance = 'outlined' \| 'filled'`; `FormFieldFloatLabel = 'auto' \| 'always'`; `FormFieldSubscriptSizing = 'fixed' \| 'dynamic'` | **`FormFieldMoleculeProps`**: `label?: string`, `hint?: string`, `errorText?: string`, `appearance?: FormFieldAppearance`, `size?: AtomicSize`, `floatLabel?: FormFieldFloatLabel`, `subscriptSizing?: FormFieldSubscriptSizing`, `hideRequiredMarker?: boolean` |
| 14 | `menu.interface.ts:7-35` | `MenuTriggerType = 'button' \| 'icon'`; `MenuPositionX = 'before' \| 'after'`; `MenuPositionY = 'above' \| 'below'`; `MenuCloseReason = void \| 'click' \| 'keydown' \| 'tab'`; `MenuItem { id?: string; label: string; icon?: string; link?: string; disabled?: boolean; role?: 'menuitem' \| 'menuitemradio' \| 'menuitemcheckbox'; disableRipple?: boolean; children?: readonly MenuItem[] }` | **`MenuMoleculeProps`**: **`items: readonly MenuItem[]` (required)**, `triggerLabel?: string`, `triggerIcon?: string`, `triggerType?: MenuTriggerType`, `xPosition?: MenuPositionX`, `yPosition?: MenuPositionY`, `overlapTrigger?: boolean`, `hasBackdrop?: boolean`, `disabled?: boolean`, `size?: AtomicSize`, `color?: ColorIntent` |
| 15 | `search-bar.interface.ts:8-18` | *(imports `ButtonVariant`, `AtomicSize`, `ColorIntent`, `BaseMoleculeProps`)* | **`SearchBarMoleculeProps`**: `query?: string`, `placeholder?: string`, `label?: string`, `submitLabel?: string`, `buttonVariant?: ButtonVariant`, `buttonColor?: ColorIntent`, `size?: AtomicSize`, `disabled?: boolean`, `loading?: boolean` |
| 16 | `select.interface.ts:3-27` | `SelectOption<T = string \| number> { value: T; label: string; disabled?: boolean }`; `SelectOptionGroup<T = string \| number> { label: string; disabled?: boolean; options: readonly SelectOption<T>[] }` | **`SelectMoleculeProps<T = string \| number>` extends `FormFieldMoleculeProps`**: `options?: readonly SelectOption<T>[]`, `optionGroups?: readonly SelectOptionGroup<T>[]`, `value?: T \| readonly T[] \| null`, `placeholder?: string`, `multiple?: boolean`, `required?: boolean`, `disabled?: boolean`, `disableRipple?: boolean`, `customTriggerSummary?: boolean`, `panelClass?: string` |

#### Organism & Template Extension Points (Placeholder Contracts)
- `libs/ui/atomic-design-interfaces/src/lib/organisms/index.ts:8-12`: `CardOrganismProps extends BaseOrganismProps { title: string; subtitle?: string; elevated?: boolean }`
- `libs/ui/atomic-design-interfaces/src/lib/templates/index.ts:8-11`: `PageLayoutTemplateProps extends BaseTemplateProps { title?: string; maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full' }`

---

### 1.2 `libs/ui/ng-mat/` Baseline Component Inventory & Ergonomic Extras

Public barrel `libs/ui/ng-mat/src/index.ts:1-6` exports `signal-props`, `magic-cva`, `atoms`, `molecules`, `organisms`, `templates`.

#### Shared Core & Forms Helpers
- `SignalProps<P>` (`libs/ui/ng-mat/src/lib/core/signal-props.ts:12-14`): enforces every interface key is exposed as a Signal.
- `MagicCvaTarget<T>`, `MagicValueAccessor<T>`, `provideMagicValueAccessor`, `bindMagicValueAccessor` (`libs/ui/ng-mat/src/lib/forms/magic-cva.ts:22-118`): bridges Signal Forms (`FormValueControl` / `FormCheckboxControl`) with Reactive & Template-driven forms via `value`/`checked` `model()`, `touch` output, and `formDisabled` signal.

#### All 16 Components (Selectors, Defaults, Events & Ergonomic Extras Beyond `atomic-design-interfaces`)

| Tier | Component Class & Selector | Key Defaults (verified from `.component.ts`) | Outputs / Methods | Ergonomic Extras & Slots Beyond Interface |
|---|---|---|---|---|
| Atom | `MagicBadgeComponent` (`magic-badge`) `badge.component.ts:39-83` | `color='primary'`, `size='md'` (`xs/sm`→`small`, `md`→`medium`, `lg/xl`→`large`), `position='above after'`, `overlap=true`, `hidden=false`, `disabled=false`, `label=''` | *(none)* | Default `<ng-content>` projection with fallback priority: projected content → `icon` (`mat-icon`) → `label` text (`badge.component.html:14-20`). |
| Atom | `MagicButtonComponent` (`magic-button`) + `MagicButtonBindingDirective` `button.component.ts:37-162` | `label=''`, `variant='filled'`, `kind='default'`, `shape='default'`, `color='primary'`, `size='md'`, `disabled=false`, `loading=false`, `type='button'` | `clicked: MouseEvent` | **`loadingLabel?: string`** (replaces body text while loading), **`type: ButtonType`** (not in `ButtonAtomProps`, imported separately), default `<ng-content>` overriding `label`/icon, `resolvedAriaLabel` auto-fallback (`ariaLabel → label → leadingIcon` for icon-only), `isDisabled = disabled || loading`, spinner diameter `24` (FAB) / `18` (others), `aria-busy`. |
| Atom | `MagicButtonToggleComponent<T>` (`magic-button-toggle`) `button-toggle.component.ts:52-119` | `options=[]`, `selectionMode='single'`, `vertical=false`, `appearance='standard'`, `hideSelectionIndicator=false`, `color='primary'`, `size='md'`, `name=''` | `changed`, `touch` | Re-exports `ButtonToggleOption`; Signal Forms `invalid`/`touched`/`dirty` inputs; two-way `value = model()`. |
| Atom | `MagicCheckBoxComponent` (`magic-check-box`) `check-box.component.ts:51-161` | `checked=false`, `indeterminate=false`, `labelPosition='after'`, `color='primary'`, `size='md'`, `tasks=[]` | `changed: boolean`, `tasksChanged: readonly CheckBoxTask[]`, `touch` | Default `<ng-content>` with `label` fallback (`check-box.component.html:62`); immutable parent/subtask tree via `isPartiallyComplete(taskIndex)` & `toggleTask(taskIndex, subtaskIndex?, nextChecked?)`; Signal Forms `invalid`/`touched`/`dirty`. |
| Atom | `MagicChipComponent` (`magic-chip`) `chip.component.ts:80-201` | `chips=[]`, `variant='basic'`, `color='primary'`, `size='md'`, `removable=false`, `editable=false`, `selectable=true`, `multiple=false`, `orientation='horizontal'`, `inputPlaceholder='New chip...'` | `chipAdded`, `chipRemoved`, `chipEdited`, `chipReordered`, `selectionChanged: { chip, selected }` | Single-chip `<ng-content>` fallback in `basic` mode when `chips` is empty (`chip.component.html:143-145`); `input` variant wraps `<mat-chip-grid>` inside `<magic-form-field>` (`chip.component.html:3-43`); `LiveAnnouncer` a11y announcements; public methods `removeChip`, `addChip`, `editChip`, `onDrop`. |
| Atom | `MagicProgressIndicatorComponent` (`magic-progress-indicator`) `progress-indicator.component.ts:55-104` | `type='bar'`, `mode='indeterminate'`, `value=0`, `bufferValue=0`, `color='primary'`, `size='md'` | *(none)* | Size-to-spinner map (`SIZE_DIAMETERS`: `xs:20, sm:28, md:40, lg:56, xl:72`; `SIZE_STROKES`: `xs:2, sm:3, md:4, lg:5, xl:6`) when `diameter`/`strokeWidth` unset; clamps spinner mode to `'determinate' \| 'indeterminate'`. |
| Atom | `MagicRadioButtonComponent<T>` (`magic-radio-button`) `radio-button.component.ts:49-110` | `options=[]`, `labelPosition='after'`, `vertical=true`, `color='primary'`, `size='md'`, `name=''` | `changed`, `touch` | Re-exports `RadioOption`; per-option `labelPosition`/`disabled`/`required`; Signal Forms `invalid`/`touched`/`dirty`. |
| Atom | `MagicSlideToggleComponent` (`magic-slide-toggle`) `slide-toggle.component.ts:46-106` | `checked=false`, `hideIcon=false`, `labelPosition='after'`, `color='primary'`, `size='md'` | `changed: boolean`, `touch` | Default `<ng-content>` with `label` fallback; Signal Forms `invalid`/`touched`/`dirty`. |
| Atom | `MagicSliderComponent` (`magic-slider`) `slider.component.ts:59-141` | `min=0`, `max=100`, `step=1`, `value=0`, `range=false`, `startValue=0`, `endValue=100`, `discrete=false`, `showTickMarks=false`, `color='primary'`, `size='md'` | `changed: number`, `rangeChanged: readonly [number, number]`, `touch` | Built-in **`defaultDisplayWith`** compact formatter (`>=1e9 → B`, `>=1e6 → M`, `>=1e3 → k`, else raw number) (`slider.component.ts:27-38`); two-way `value`, `startValue`, `endValue` models; Signal Forms `invalid`/`touched`/`dirty`. |
| Atom | `MagicTextInputComponent` (`magic-text-input`) `text-input.component.ts:127-265` | `type='text'`, `name=''`, `value=''`, `placeholder=''`, `size='md'`, `disabled=false`, `required=false`, `readOnly=false` | `touch`, `submitted: string` (Enter key); methods: `focus(options?)`, `reset()` | Implements strict **`TextInputControlProps`**; provides `MatFormFieldControl<string>` bridge (`MagicTextInputFormFieldControl`) so `<magic-form-field>` controls floating label, `id`, `aria-describedby`, and `forcedError`; Signal Forms `invalid`/`touched`/`dirty`. |
| Atom | `MagicToolTipComponent` (`magic-tool-tip`) `tool-tip.component.ts:36-76` | `message=''`, `label=''`, `position='below'`, `showDelay=0`, `hideDelay=0`, `disabled=false`, `touchGestures='auto'` | Methods: `show(delay?)`, `hide(delay?)`, `toggle()` | Default `<ng-content>` trigger projection with `label` fallback (`tool-tip.component.html:13`). |
| Molecule | `MagicCardComponent` (`magic-card`) + `MagicCardHeaderDirective`, `MagicCardActionsDirective`, `MagicCardFooterDirective` `card.component.ts:36-164` | `imageSize='medium'`, `appearance='raised'`, `variant='basic'`, `actions=[]`, `chips=[]`, `alignActions='start'`, `avatarAlt=''`, `imageAlt=''` | `actionClicked: CardActionItem` | Extra inputs **`avatarSrc?: string`**, **`avatarAlt: string = ''`** (not on `CardMoleculeProps`); slot directives `[magicCardHeader]` (and `[card-header]`), default body `<ng-content>`, `[magicCardActions]` (and `[card-actions]`), `[magicCardFooter]` (and `[card-footer]`); binds `--card-width` CSS var; composes `MagicButtonComponent` (`variant ?? 'text'`) & `MagicChipComponent`. |
| Molecule | `MagicFormFieldComponent` (`magic-form-field`) + `MagicPrefixDirective` (`[magicPrefix]`), `MagicSuffixDirective` (`[magicSuffix]`) `form-field.component.ts:37-145` | `appearance='outlined'` (mapped to Material `'outline'`/`'fill'`), `size='md'`, `floatLabel='auto'`, `subscriptSizing='fixed'`, `hideRequiredMarker=false` | *(none)* | Only component rendering `mat-form-field`; projects `[magicPrefix]` / `[magicSuffix]` affix slots + default control slot; propagates `Boolean(errorText())` into child control via `setForcedError`. |
| Molecule | `MagicMenuComponent` (`magic-menu`) + `MagicMenuTriggerDirective` (`[magicMenuTrigger]`) + internal `MagicMenuSubmenuComponent` `menu.component.ts:30-127`, `menu-submenu.component.ts:33-84` | `items=[]`, `triggerLabel='Menu'`, `triggerType='button'`, `triggerVariant='tonal'`, `xPosition='after'`, `yPosition='below'`, `overlapTrigger=false`, `hasBackdrop=true`, `restoreFocus=true`, `size='md'`, `color='primary'` | `itemSelected: MenuItem`, `closed: MenuCloseReason`, `opened: void`; methods: `openMenu()`, `closeMenu()` | Extra inputs beyond `MenuMoleculeProps`: **`triggerVariant: ButtonVariant = 'tonal'`**, **`ariaLabelledby`**, **`ariaDescribedby`**, **`backdropClass`**, **`panelClass`**, **`restoreFocus`**, **`menuData`**; custom `[magicMenuTrigger]` slot; icon trigger defaults to `'more_vert'` (`menu.component.html:19`); recursive arbitrary-depth submenus; `testId` applies `testId` to wrapper and `${testId}-button` to default button. |
| Molecule | `MagicSearchBarComponent` (`magic-search-bar`) `search-bar.component.ts:31-68` | `query=''`, `placeholder='Search...'`, `label='Search'`, `submitLabel='Search'`, `buttonVariant='filled'`, `buttonColor='primary'`, `size='md'`, `disabled=false`, `loading=false` | `searched: string` | `<form role="search">` composing `MagicFormField` (`subscriptSizing="dynamic"`) + `MagicTextInput` (`type="search"`) + `MagicButton` (`type="submit"`); forwards `${testId}-input` and `${testId}-submit` (`search-bar.component.html:1-35`). |
| Molecule | `MagicSelectComponent<T>` (`magic-select`) `select.component.ts:68-269` | `appearance='outlined'`, `size='md'`, `floatLabel='auto'`, `subscriptSizing='fixed'`, `options=[]`, `optionGroups=[]`, `value=null`, `multiple=false`, `customTriggerSummary=false`, `typeaheadDebounceInterval=200`, `panelWidth='auto'`, `tabIndex=0` | `changed`, `openedChanged: boolean`, `touch`; methods: `focus(options?)`, `reset()` | Extra inputs beyond `SelectMoleculeProps`: **`compareWith`**, **`hideSingleSelectionIndicator`**, **`disableOptionCentering`**, **`typeaheadDebounceInterval`**, **`sortComparator`**, **`panelWidth`**, **`canSelectNullableOptions`**, **`ariaLabelledby`**, **`tabIndex`**, **`name`**, plus Signal Forms `invalid`/`touched`/`dirty`. `customTriggerSummary` formats multi-selection as `` `${firstLabel} (+${n} ${n === 1 ? 'other' : 'others'})` `` (`select.component.ts:196-200`). Forwards `${testId}-field` to `MagicFormField`. |

---

### 1.3 `libs/ui/ng-mat` Material 3 Theme Palettes & Design Tokens

Defined in `libs/ui/ng-mat/src/theme/_palettes.scss:1-40`, `_tokens.scss:1-86`, `_index.scss:1-37`, `styles.scss:1-9`, backed by Angular Material's M3 palettes (`node_modules/@angular/material/core/theming/_palettes.scss`).

#### Shared Typography (`_palettes.scss:6-12`)
- `plain-family`: `Roboto`, `brand-family`: `'Open Sans'`, weights: `regular: 400`, `medium: 500`, `bold: 700`, `density: 0`.

#### Exact 7 Theme Palettes (with Verified Angular Material M3 Tonal Hexes)

In Material 3 light mode, primary/secondary/tertiary/error use tone **40** (on: 100, container: **90**, on-container: **10**), surface uses neutral **98** (container-highest: **90**), on-surface uses neutral **10**, on-surface-variant uses neutral-variant **30**, outline uses neutral-variant **50**.
In Material 3 dark mode, primary/secondary/tertiary/error use tone **80** (on: **20**, container: **30**, on-container: **90**), surface uses neutral **6** (container-highest: **22**), on-surface uses neutral **90**, on-surface-variant uses neutral-variant **80**, outline uses neutral-variant **60**.

| Palette Name (`preview.ts` Title) | Mode | Angular Mat Palettes (`primary`, `tertiary`) | Primary (Main / Container) | Secondary (Main / Container) | Tertiary (Main / Container) | Surface / Container-Highest / On-Surface / Outline |
|---|---|---|---|---|---|---|
| `azure-blue` *(Default)* (`Azure Blue (Light)`) | `light` | `mat.$azure-palette`, `mat.$blue-palette` | `#005cbb` / `#d7e3ff` | `#565e71` / `#dae2f9` | `#343dff` / `#e0e0ff` | `#faf9fd` / `#e3e2e6` / `#1a1b1f` / `#74777f` |
| `light-theme` (`Violet / Orange (Light)`) | `light` | `mat.$violet-palette`, `mat.$orange-palette` | `#7d00fa` / `#ecdcff` | `#645b70` / `#eadef7` | `#964900` / `#ffdcc7` | `#fef8fc` / `#e6e1e6` / `#1d1b1e` / `#7b757f` |
| `dark-theme` (`Green / Orange (Dark)`) | `dark` | `mat.$green-palette`, `mat.$orange-palette` | `#02e600` / `#015300` | `#bbcbb2` / `#3c4b37` | `#ffb787` / `#723600` | `#121410` / `#333531` / `#e2e3dc` / `#8d9387` |
| `rose-red` (`Rose Red (Light)`) | `light` | `mat.$rose-palette`, `mat.$red-palette` | `#ba005c` / `#ffd9e1` | `#74565d` / `#ffd9e1` | `#c00100` / `#ffdad4` | `#fff8f8` / `#ece0e1` / `#201a1b` / `#847376` |
| `cyan-orange` (`Cyan Orange (Dark)`) | `dark` | `mat.$cyan-palette`, `mat.$orange-palette` | `#00dddd` / `#004f4f` | `#b0cccb` / `#324b4b` | `#ffb787` / `#723600` | `#101414` / `#313635` / `#e0e3e2` / `#889392` |
| `orange-red` (`Orange Red (Light)`) | `light` | `mat.$orange-palette`, `mat.$red-palette` | `#964900` / `#ffdcc7` | `#755846` / `#ffdcc7` | `#c00100` / `#ffdad4` | `#fff8f5` / `#ece0da` / `#201a17` / `#84746a` |
| `magenta-violet` (`Magenta Violet (Dark)`) | `dark` | `mat.$magenta-palette`, `mat.$violet-palette` | `#ffabf3` / `#810081` | `#dabfd2` / `#554151` | `#d5baff` / `#5f00c0` | `#161215` / `#383337` / `#e9e0e4` / `#9a8d95` |

*For Flutter `ColorScheme.fromSeed(seedColor: ..., brightness: ...)`*: use each palette's tone-40 primary seed (`#005cbb`, `#7d00fa`, `#026e00`, `#ba005c`, `#006a6a`, `#964900`, `#a900a9`) with optional `tertiary` override from tone-40/80 above.

#### Semantic Error, Success, Warning & Neutral Tokens (`_tokens.scss:7-51` & Mat error palette)
- **Error** (M3 standard across all 7 palettes):
  - Light: `error: #ba1a1a`, `on-error: #ffffff`, `error-container: #ffdad6`, `on-error-container: #410002`
  - Dark: `error: #ffb4ab`, `on-error: #690005`, `error-container: #93000a`, `on-error-container: #ffdad6`
- **Success** (`_tokens.scss:8-11`, via CSS `light-dark()`):
  - Light: `#1b6e3a`, on: `#ffffff`, container: `#a0f5b4`, on-container: `#00210c`
  - Dark: `#7fdc99`, on: `#00391a`, container: `#00522a`, on-container: `#a0f5b4`
- **Warning** (`_tokens.scss:13-16`, via CSS `light-dark()`):
  - Light: `#8a5100`, on: `#ffffff`, container: `#ffdcbd`, on-container: `#2d1600`
  - Dark: `#ffb870`, on: `#4a2800`, container: `#693c00`, on-container: `#ffdcbd`
- **Neutral** (`_tokens.scss:46-51`):
  - `intent`: `on-surface-variant`, `on-intent`: `surface`, `intent-container`: `surface-container-highest`, `on-intent-container`: `on-surface`

#### Size & Shape Metrics (`_tokens.scss:55-85`)
- **Size scale** (`height` / `fontSize` / `iconSize` / `horizontalPadding`):
  - `xs`: `28px` / `0.75rem` (12px) / `16px` / `12px`
  - `sm`: `32px` / `0.8125rem` (13px) / `18px` / `14px`
  - `md`: `40px` / `0.875rem` (14px) / `18px` / `24px`
  - `lg`: `48px` / `1rem` (16px) / `22px` / `28px`
  - `xl`: `56px` / `1.125rem` (18px) / `24px` / `32px`
- **Shape radii**: `default` (design system default), `square: 0`, `rounded: 8px`, `pill: 999px`.

---

### 1.4 `libs/ui/ng-mat` Storybook 10, Visual Regression & Story Structure

- **`.storybook/main.ts` (`libs/ui/ng-mat/.storybook/main.ts:1-45`)**:
  - `stories`: `['../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))']`
  - `addons`: `['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest', defineStorybookVis({ visProjects: [{ snapshotRootDir, snapshotSubpath }] })]`
  - **Exact `storybook-addon-vis` path config (lines 11, 19-36)**:
    ```ts
    const visRootDir = resolve(storybookDir, '../__vis__');
    defineStorybookVis({
      visProjects: [
        {
          snapshotRootDir: ({ ci, platform }) =>
            relative(process.cwd(), resolve(visRootDir, ci ? platform : 'local')) || '.',
          snapshotSubpath: ({ subpath }) =>
            trimCommonFolder(
              subpath
                .replace(/^\.\//, '')
                .replace(/^libs\/ui\/ng-mat\//, '') // adapt to react-mui / rn-paper!
                .replace(/^\.\.\//, ''),
            ),
        },
      ],
    })
    ```
- **`.storybook/preview.ts` (`libs/ui/ng-mat/.storybook/preview.ts:1-95`)**:
  - `tags: ['autodocs', 'snapshot']`, `beforeEach: visAnnotations.beforeEach`
  - Dynamically injects Google Fonts `<link id="magic-material-icons-font" href="https://fonts.googleapis.com/icon?family=Material+Icons">`
  - `globalTypes.theme` toolbar with `icon: 'paintbrush'`, `defaultValue: 'azure-blue'`, `dynamicTitle: true`, and all 7 palette items (`azure-blue`, `light-theme`, `dark-theme`, `rose-red`, `cyan-orange`, `orange-red`, `magenta-violet`)
  - `parameters`: `a11y: { test: 'todo' }`, `controls: { expanded: true, matchers: { color: /(background|color)$/i, date: /Date$/ } }`, `docs: { toc: true, page: DocumentationTemplate }`
- **`.storybook/DocumentationTemplate.mdx` (`libs/ui/ng-mat/.storybook/DocumentationTemplate.mdx:1-20`)**:
  - Imports `{ Title, Subtitle, Description, Primary, Controls, Stories }` from `'@storybook/addon-docs/blocks'`, renders `<Title /> <Subtitle /> <Description /> <Primary />`, heading `## Inputs & Outputs` + `<Controls />`, `---`, heading `## Variations & States` + `<Stories includePrimary={false} />`.
  - Paired with `.storybook/typings.d.ts:1-5` declaring `module '*.mdx'` for TypeScript.
- **`.storybook/vitest.setup.ts` (`libs/ui/ng-mat/.storybook/vitest.setup.ts:1-42`)**:
  - Injects `<style id="magic-vis-disable-animations">*, *::before, *::after { animation: none !important; transition: none !important; }</style>`
  - Calls `vis.setup({ animations: 'disabled', auto: async () => { /* awaits magic-material-icons-font link load + document.fonts.load('24px "Material Icons"') + document.fonts.ready */ } })`.
  - *(Note for React/RN)*: React Storybook projects should also call `setProjectAnnotations([a11yAddonAnnotations, projectAnnotations])` or `@storybook/react` `setProjectAnnotations` per Storybook 10 `@storybook/addon-vitest` docs.
- **`vite.config.mts` (`libs/ui/ng-mat/vite.config.mts:1-75`)**:
  - Uses Vitest 4 `test.projects` with two projects:
    1. `ng-mat`: `jsdom`, `globals: true`, `coverage: { reportsDirectory: './test-output/vitest/coverage', provider: 'v8' }`
    2. `ng-mat-storybook`: plugins `[..., storybookTest({ configDir }), storybookVis()]`, `optimizeDeps: { exclude: ['storybook-addon-vis', 'vitest-plugin-vis'], include: ['storybook-addon-vis > vitest-plugin-vis > ssim.js', 'storybook-addon-vis > vitest-plugin-vis > pngjs'] }`, `browser: { enabled: true, headless: true, api: { allowWrite: true }, provider: playwright(), instances: [{ browser: 'chromium', viewport: { width: 1280, height: 720 } }] }`, `setupFiles: ['./.storybook/vitest.setup.ts']`.
- **`project.json` (`libs/ui/ng-mat/project.json:1-77`)**:
  - Defines `storybook` (port 4400), `build-storybook` (`outputDir: "dist/storybook/ng-mat"`), `static-storybook`, and `test-storybook` (`nx:run-commands`, `cwd: "libs/ui/ng-mat"`, `command: "vitest run --project=ng-mat-storybook"`).
- **Stories & `argTypes` Conventions** (verified across all 16 `*.stories.ts` files — **111 stories total**, all 16 files include `play` functions and JSDoc comments on `meta` and every story):
  - Story counts: `button` (21), `text-input` (9), `check-box` (8), `select` (8), `progress-indicator` (7), `slide-toggle` (7), `chip` (6), `card` (6), `form-field` (6), `menu` (6), `search-bar` (6), `radio-button` (5), `slider` (5), `badge` (4), `button-toggle` (4), `tool-tip` (3).
  - Standard `argTypes` `table.category` names (ordered by frequency): `Appearance`, `State`, `Accessibility`, `Content`, `Events`, `Behavior`, `Value`, `Validation`, `Data`, `Field`, `Media`, `Layout`, `Positioning`, `Trigger`, `Range`, `Icons`, `Timing`, `Spinner`, `Attributes`, `Button`, `Actions`, `Footer`, `Checklist`, `Input`, `Variant`, `Type`, `Mode`.

---

### 1.5 Repository Root Infrastructure, CI & Environment Facts

#### Root `package.json` Installed Versions (`package.json:1-116`)
- Package manager: `pnpm@12.18.0` (`"type": "module"`)
- **Frameworks & UI**: `react@^19.0.0`, `react-dom@^19.0.0`, `@types/react@^19.0.0`, `@types/react-dom@^19.0.0`, `@mui/material@^9.5.0`, `@emotion/react@^11.14.0`, `@emotion/styled@^11.14.1`, `react-native@0.85.3`, `react-native-paper@^5.15.4`, `react-native-web@^0.21.4`, `react-native-safe-area-context@^5.11.1`, `react-native-svg@15.12.1`, `@expo/vector-icons@^15.1.1`, `expo@~56.0.0`, `@angular/core@~22.2.0`, `@angular/material@^22.2.7`
- **Storybook & Visual Testing**: `storybook@^10.6.2`, `@storybook/react@^10.6.2`, `@storybook/react-vite@^10.6.2`, `@storybook/addon-docs@^10.6.7`, `@storybook/addon-a11y@^10.6.7`, `@storybook/addon-vitest@^10.6.7`, `storybook-addon-vis@^4.8.0`
- **Vitest / Testing / Playwright**: `vitest@^4.0.8`, `@vitest/browser@^4.1.12`, `@vitest/browser-playwright@^4.1.12`, `@vitest/coverage-v8@^4.0.8`, `playwright@^1.65.1`, `@testing-library/react@16.3.0`, `@testing-library/dom@10.4.0`, `jsdom@^27.1.0`, `vite@^8.0.0`, `@vitejs/plugin-react@^6.0.0`
- **Nx / Lint / TypeScript**: `nx@24.0.6`, `@nx/{eslint,expo,js,react,storybook,vitest,web,workspace}@24.0.6`, `eslint@^9.8.0`, `eslint-plugin-react@^7.35.0`, `eslint-plugin-react-hooks@5.0.0`, `eslint-plugin-jsx-a11y@6.10.1`, `typescript@~6.0.0`, `typescript-eslint@^8.58.0`

#### Root `.gitignore` (`.gitignore:1-38`)
- Lines 34-37:
  ```gitignore
  # Visual testing (storybook-addon-vis)
  **/__vis__/**/__diffs__
  **/__vis__/**/__results__
  **/__vis__/local
  ```
- **`.agents/` is NOT in `.gitignore`** — `.agents/teamwork/` currently shows as untracked on `main`. Because isolated sibling worktrees (`../wt-*`) only check out tracked git files, they will stay clean as long as no agent creates `.agents/` inside the worktree.

#### CI Workflows & GitHub Pages Discovery
- **`.github/workflows/ci.yml:1-29`**: Runs on `push` to `main` and `pull_request`: `actions/checkout@v7` (`fetch-depth: 0`) → `nrwl/nx-set-shas@v4` → `./.github/actions/setup-pnpm` (Node 22 + pnpm 12.18.0 + `pnpm ci`) → `./.github/actions/setup-flutter` (Flutter `3.50.0` stable + `flutter pub get` in every `pubspec.yaml` under `apps`/`libs`) → `pnpm nx-cloud start-workers` → **`pnpm nx affected -t lint test build`** → `pnpm nx fix-ci`.
- **`.github/workflows/storybook-gh-pages.yml:1-90`**: Runs on push to `main` / `workflow_dispatch`:
  1. `discover`: `node tools/ci/storybook-pages.mjs discover --matrix`
  2. `build`: Matrix per discovered showcase; sets up Flutter only when `matrix.type == 'widgetbook'`; runs `node tools/ci/storybook-pages.mjs build "<name>"`
  3. `assemble` & `deploy`: generates portal `index.html` + `.nojekyll` and deploys to GitHub Pages.
- **`tools/ci/storybook-pages.mjs:78-243`** (`node tools/ci/storybook-pages.mjs discover` verified output):
  - Discovers all 4 UI libraries right now:
    - `fl-mat` (`widgetbook`, `outputDir: "libs/ui/fl-mat/build/web"`, `hasCiConfig: false`) — invokes `pnpm exec nx run fl-mat:build-widgetbook --args=--base-href=...`
    - `ng-mat` (`storybook`, `outputDir: "dist/storybook/ng-mat"`, `hasCiConfig: true`, `hasCompodoc: true`)
    - `react-mui` (`storybook`, `outputDir: "libs/ui/react-mui/storybook-static"`, `hasCiConfig: false`, `hasCompodoc: false`)
    - `rn-paper` (`storybook`, `outputDir: "libs/ui/rn-paper/storybook-static"`, `hasCiConfig: false`, `hasCompodoc: false`)
  - **Important `outputDir` contract (`storybook-pages.mjs:101-105, 210-222`)**:
    `storybook-pages.mjs` reads `project.json` ONLY (not `package.json` `nx.targets`) for `buildTarget = projectJson?.targets?.['build-storybook']`, and sets `outputDir = buildTarget?.options?.outputDir ?? '<root>/storybook-static'`, then asserts `index.html` exists at `outputDir` after running `nx run <name>:build-storybook[:ci]`.
    Currently, `@nx/storybook/plugin` infers `build-storybook` as `storybook build` (which writes to `<projectRoot>/storybook-static`). Therefore:
    - If `react-mui` / `rn-paper` add a `project.json` with `test-storybook`, **either** leave `build-storybook` inferred (writes to `storybook-static`, which `storybook-pages.mjs` already expects), **or** if explicitly setting `options.outputDir: "dist/storybook/<lib>"` in `project.json`, the `build-storybook` command MUST pass `-o ../../../dist/storybook/<lib>` so `index.html` actually lands there!
- **Nx Resolved Targets (`nx.json:13-69` & `pnpm exec nx show project <lib> --json`)**:
  - `react-mui` & `rn-paper` currently have targets: `lint`, `test`, `test-ci`, `build-storybook`, `storybook`, `static-storybook`, `build-deps`, `watch-deps`, `typecheck`, `nx-release-publish` (note: **no `test-storybook`** yet, and **no `build`** target because `package.json` has `main: "./src/index.ts"` / source-only TS project — Nx `affected -t lint test build` skips `build` for projects without a `build` target).
  - `fl-mat` (excluded from pnpm via `pnpm-workspace.yaml:5` `"!libs/ui/fl-mat"`) has targets: `test`, `lint`, `widgetbook`, `build-widgetbook`.

#### Git, Store, Auth & Local VM Environment
- **Git**: Branch `main` up to date with `origin/main` at `4eaebe4` (`Merge pull request #5 from sukrutsathaye/ui/ng-mat`). Only untracked path is `.agents/teamwork/`.
- **Recent commit style** (`git log -n 10 --oneline`): Conventional Commits (`feat: ...`, `fix: ...`, `refactor: ...`, `chore: ...`, `docs: ...`, `docs(ng-mat): ...`).
- **pnpm store**: `/home/antigravity/.local/share/pnpm/store/v11` (`pnpm` v12.18.0, `node` v24.22.3).
- **GitHub CLI**: `gh auth status` verified — logged in to `github.com` as `sukrutsathaye` (HTTPS, active token).
- **Worktree parent dir**: `/home/antigravity/sukrutsathaye/` owned by `antigravity:antigravity` (`drwxr-xr-x`), containing only `mono-magic` — ready for sibling worktrees (`wt-react-mui`, `wt-rn-paper`, `wt-fl-mat`).
- **Local browser & Flutter status**:
  - `flutter`: **not installed** in VM (CI uses Flutter `3.50.0`).
  - Playwright browser cache `~/.cache/ms-playwright`: **does not exist**, **HOWEVER** system `/usr/bin/chromium` and `/usr/bin/google-chrome` ARE pre-installed in the VM! (Implementers can either run `pnpm exec playwright install chromium` or pass/configure `executablePath` / `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` if downloads are restricted — note `vite.config.mts` should remain portable for CI.)

---

## 2. Logic Chain

1. **Zero-conflict parallel worktree feasibility**: Root `package.json` already contains all dependencies (`@mui/material@^9.5.0`, `react-native-paper@^5.15.4`, Storybook `10.6.x`, Vitest `4.0.8`/`4.1.12`, `storybook-addon-vis@^4.8.0`, `playwright@^1.65.1`) and `@mono-magic/atomic-design-interfaces` already exports all 16 component contracts (Observations 1.1, 1.5). Therefore, `ui/react-mui-setup`, `ui/rn-paper-setup`, and `ui/fl-mat-setup` require zero modifications to root files or `atomic-design-interfaces`, guaranteeing conflict-free merges.
2. **Exact theme parity across 3 platforms**: `ng-mat` derives its 7 themes from specific Angular Material M3 palette pairs + two `light-dark()` semantic tokens (`success`, `warning`) + fixed size/shape scales (Observation 1.3). Extracting the exact M3 tonal hex values directly from `node_modules/@angular/material/core/theming/_palettes.scss` gives `react-mui`, `rn-paper`, and `fl-mat` authoritative, visually matching color values without guesswork.
3. **Critical `storybook-pages.mjs` / `project.json` alignment**: Observation 1.5 shows `storybook-pages.mjs` reads `project.json` `build-storybook.options.outputDir` (defaulting to `<root>/storybook-static`) and verifies `index.html` exists there. Setting `outputDir` in `project.json` without matching `-o` in `storybook build` would break GitHub Pages deployment on merge.
4. **Vitest + Playwright Storybook testing in this VM**: Observation 1.5 shows `~/.cache/ms-playwright` is absent while `/usr/bin/chromium` is present, and `ng-mat/vite.config.mts` requires `optimizeDeps` exclusions/inclusions for `storybook-addon-vis` (`ssim.js`, `pngjs`). Target tracks must carry over the `optimizeDeps` block and handle Chromium availability cleanly.

---

## 3. Caveats

- This survey intentionally did **not** inspect the existing source files inside `libs/ui/react-mui/`, `libs/ui/rn-paper/`, or `libs/ui/fl-mat/` (outside their Nx resolved project metadata and `storybook-pages.mjs` discovery output); those belong to Survey Explorer 2.
- `ng-mat` component `.scss` and `.spec.ts` files were not read in full; behavioral/DOM assertions in `ng-mat` specs were inferred from `.component.ts`, `.component.html`, and `.component.stories.ts`.
- `nx show project` emitted a benign socket fallback warning because `/tmp` and `/home` are owned by another user in this sandbox, falling back cleanly to `.nx/workspace-data/d/*.sock`; `pnpm exec nx` commands still succeed with exit code 0.
- `pnpm exec nx run <lib>:build` is listed in `implementation_plan.md` verification commands, but currently `react-mui`, `rn-paper`, and `ng-mat` do **not** have a `build` target (only `typecheck` and `build-storybook`). Implementers should verify with `typecheck` (and add/check `build` only if appropriate for the library's `tsconfig.lib.json` setup).

---

## 4. Conclusion

The baseline is completely verified and ready for parallel execution across three isolated git worktrees (`/home/antigravity/sukrutsathaye/wt-react-mui`, `wt-rn-paper`, `wt-fl-mat`):
1. Implement all **16 components** strictly honoring `atomic-design-interfaces` (especially refactoring `MagicTextInput` to bare `TextInputControlProps` + `MagicFormField` + composed `MagicSearchBar`) plus `ng-mat`'s documented ergonomic extras (`loadingLabel`, `avatarSrc`, `triggerVariant`, `defaultDisplayWith`, `customTriggerSummary` `"First (+N other/others)"`, slots, and `focus()`/`reset()`/`show()`/`hide()`).
2. Implement all **7 exact M3 palettes** (`azure-blue` default, `light-theme`, `dark-theme`, `rose-red`, `cyan-orange`, `orange-red`, `magenta-violet`), semantic `success`/`warning`/`neutral` tokens, and `xs`..`xl` size + shape metrics from Section 1.3.
3. Mirror `ng-mat`'s Storybook 10 + `DocumentationTemplate.mdx` + `storybook-addon-vis` (`snapshotRootDir` using `ci ? platform : 'local'`, `optimizeDeps` for `ssim.js`/`pngjs`, Material Icons font loader + disabled animations) while keeping `build-storybook` output aligned with `tools/ci/storybook-pages.mjs` and leaving `.gitignore` untouched.

---

## 5. Verification Method

Re-verify any observation directly from `/home/antigravity/sukrutsathaye/mono-magic`:
- **Interfaces**: Inspect `libs/ui/atomic-design-interfaces/src/lib/{common,atoms,molecules}/*.ts` or run `pnpm exec nx test atomic-design-interfaces`.
- **Palettes & Storybook config**: Inspect `libs/ui/ng-mat/src/theme/{_palettes,_tokens,_index}.scss`, `libs/ui/ng-mat/.storybook/{main.ts,preview.ts,DocumentationTemplate.mdx,vitest.setup.ts}`, `libs/ui/ng-mat/vite.config.mts`, and `libs/ui/ng-mat/project.json`.
- **Showcase discovery & Nx targets**: Run `node tools/ci/storybook-pages.mjs discover` and `pnpm exec nx show project <name> --json`.
- **Environment**: Run `git status`, `git log -n 10 --oneline`, `pnpm store path`, `gh auth status`, `which chromium`.
- **Invalidation conditions**: Any commit modifying `libs/ui/atomic-design-interfaces/src/`, `libs/ui/ng-mat/src/theme/`, root `package.json`, or `tools/ci/storybook-pages.mjs` on `main`.
