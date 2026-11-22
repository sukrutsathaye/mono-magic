# Milestone M4 Exploration Handoff — Wave 2 UI Molecules Blueprint

**Scope**: Read-only exploration across `atomic-design-interfaces`, `react-mui`, `ng-mat`, `rn-paper`, and `fl-mat` for Wave 2 molecules: **Dialog** (`MagicDialog`), **Alert / Toast** (`MagicAlert`, `MagicToast`), **Tabs** (`MagicTabs`), **Accordion** (`MagicAccordion`), and **Avatar / AvatarGroup** (`MagicAvatar`, `MagicAvatarGroup`).

---

## 1. Wave 2 Contracts Summary (`atomic-design-interfaces` & `fl-mat`)

All TS contracts live in `libs/ui/atomic-design-interfaces/src/lib/molecules/` (re-exported via `src/lib/molecules/index.ts:1-11` and `src/index.ts`), and Dart models live in `libs/ui/fl-mat/lib/src/interfaces/atomic_interfaces.dart:976-1798`.

> Common `BaseMoleculeProps` (`libs/ui/atomic-design-interfaces/src/lib/common/atomic.interface.ts:21-31`) / `BaseAtomicProps`:
> `id?: string; testId?: string; ariaLabel?: string;` (Note: Dart `BaseAtomicProps` also has `final bool disabled`, defaulted to `false` on each props class).

### 1.1 `MagicDialog`
- **TS** (`libs/ui/atomic-design-interfaces/src/lib/molecules/dialog.interface.ts:8-63`):
  - `DialogSize = 'sm' | 'md' | 'lg' | 'fullscreen'` (`DIALOG_SIZES`)
  - `DialogActionItem`: `{ id?: string; label: string; variant?: ButtonVariant; color?: ColorIntent; icon?: string; disabled?: boolean; }`
  - `DialogMoleculeProps` (`MagicDialogProps`): `open?: boolean; title?: string; subtitle?: string; content?: string; size?: DialogSize; dismissible?: boolean; closeOnBackdropClick?: boolean; closeOnEscape?: boolean; showCloseButton?: boolean; scrollable?: boolean; actions?: readonly DialogActionItem[]; alignActions?: 'start' | 'end';`
- **Dart** (`atomic_interfaces.dart:977-1129`):
  - `DialogSize { sm, md, lg, fullscreen }`, `DialogActionsAlignment { start, end }`
  - `DialogActionItem` (`icon: IconData?`, `iconName: String?`, `disabled = false`, `copyWith`)
  - `MagicDialogProps` defaults: `disabled = false`, `open = false`, `size = DialogSize.md`, `dismissible = true`, `closeOnBackdropClick = true`, `closeOnEscape = true`, `showCloseButton = true`, `scrollable = false`, `actions = const <DialogActionItem>[]`, `alignActions = DialogActionsAlignment.end`.

### 1.2 `MagicAlert`
- **TS** (`libs/ui/atomic-design-interfaces/src/lib/molecules/alert.interface.ts:7-50`):
  - `AlertSeverity = 'info' | 'success' | 'warning' | 'error'` (`ALERT_SEVERITIES`)
  - `AlertVariant = 'standard' | 'filled' | 'outlined'` (`ALERT_VARIANTS`)
  - `AlertMoleculeProps` (`MagicAlertProps`): `severity?: AlertSeverity; variant?: AlertVariant; title?: string; message: string; icon?: string; hideIcon?: boolean; dismissible?: boolean; actionLabel?: string; size?: AtomicSize;`
- **Dart** (`atomic_interfaces.dart:1132-1222`):
  - `AlertSeverity { info, success, warning, error }`, `AlertVariant { standard, filled, outlined }`
  - `MagicAlertProps` defaults: `disabled = false`, `severity = AlertSeverity.info`, `variant = AlertVariant.standard`, `required this.message`, `icon: IconData?`, `iconName: String?`, `hideIcon = false`, `dismissible = false`, `size = AtomicSize.md`.

### 1.3 `MagicToast`
- **TS** (`libs/ui/atomic-design-interfaces/src/lib/molecules/toast.interface.ts:5-44`):
  - `ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'` (`TOAST_POSITIONS`)
  - `ToastMoleculeProps` (`MagicToastProps`): `open?: boolean; severity?: AlertSeverity; title?: string; message: string; duration?: number | null; position?: ToastPosition; dismissible?: boolean; actionLabel?: string;`
- **Dart** (`atomic_interfaces.dart:1225-1301`):
  - `ToastPosition { topLeft, topCenter, topRight, bottomLeft, bottomCenter, bottomRight }`
  - `MagicToastProps` defaults: `disabled = false`, `open = false`, `severity = AlertSeverity.info`, `required this.message`, `duration = 4000`, `position = ToastPosition.bottomRight`, `dismissible = true`.

### 1.4 `MagicTabs`
- **TS** (`libs/ui/atomic-design-interfaces/src/lib/molecules/tabs.interface.ts:8-64`):
  - `TabsOrientation = 'horizontal' | 'vertical'` (`TABS_ORIENTATIONS`)
  - `TabsVariant = 'primary' | 'secondary'` (`TABS_VARIANTS`)
  - `TabItem`: `{ id: string; label: string; icon?: string; badgeContent?: string | number; disabled?: boolean; content?: string; }`
  - `TabsMoleculeProps` (`MagicTabsProps`): `items: readonly TabItem[]; activeTabId?: string; defaultActiveTabId?: string; orientation?: TabsOrientation; variant?: TabsVariant; scrollable?: boolean; lazy?: boolean; color?: ColorIntent; size?: AtomicSize;`
- **Dart** (`atomic_interfaces.dart:1304-1438`):
  - `TabsOrientation { horizontal, vertical }`, `TabsVariant { primary, secondary }`
  - `TabItem` (`required id`, `required label`, `icon: IconData?`, `iconName: String?`, `badgeContent: Object?`, `disabled = false`, `content: String?`, `copyWith`)
  - `MagicTabsProps` defaults: `disabled = false`, `required items`, `orientation = TabsOrientation.horizontal`, `variant = TabsVariant.primary`, `scrollable = false`, `lazy = false`, `color = ColorIntent.primary`, `size = AtomicSize.md`.

### 1.5 `MagicAccordion`
- **TS** (`libs/ui/atomic-design-interfaces/src/lib/molecules/accordion.interface.ts:7-50`):
  - `AccordionAppearance = 'outlined' | 'raised'` (`ACCORDION_APPEARANCES`)
  - `AccordionItem`: `{ id: string; title: string; summary?: string; content?: string; icon?: string; disabled?: boolean; expanded?: boolean; }`
  - `AccordionMoleculeProps` (`MagicAccordionProps`): `items: readonly AccordionItem[]; multiple?: boolean; expandedIds?: readonly string[]; defaultExpandedIds?: readonly string[]; appearance?: AccordionAppearance; size?: AtomicSize;`
- **Dart** (`atomic_interfaces.dart:1441-1560`):
  - `AccordionAppearance { outlined, raised }`
  - `AccordionItem` (`required id`, `required title`, `summary`, `content`, `icon: IconData?`, `iconName: String?`, `disabled = false`, `expanded = false`, `copyWith`)
  - `MagicAccordionProps` defaults: `disabled = false`, `required items`, `multiple = false`, `appearance = AccordionAppearance.outlined`, `size = AtomicSize.md`.

### 1.6 `MagicAvatar` & `MagicAvatarGroup`
- **TS** (`libs/ui/atomic-design-interfaces/src/lib/molecules/avatar.interface.ts:8-82`):
  - `AvatarStatus = 'online' | 'busy' | 'offline'` (`AVATAR_STATUSES`)
  - `AvatarShape = 'circle' | 'rounded' | 'square'` (`AVATAR_SHAPES`)
  - `AvatarGroupSpacing = 'tight' | 'normal'` (`AVATAR_GROUP_SPACINGS`)
  - `AvatarMoleculeProps` (`MagicAvatarProps`): `src?: string; alt?: string; name?: string; initials?: string; icon?: string; size?: AtomicSize; color?: ColorIntent; shape?: AvatarShape; status?: AvatarStatus; statusLabel?: string;`
  - `AvatarGroupItem extends Omit<AvatarMoleculeProps, 'size'> { id?: string; }`
  - `AvatarGroupMoleculeProps` (`MagicAvatarGroupProps`): `items: readonly AvatarGroupItem[]; max?: number; size?: AtomicSize; spacing?: AvatarGroupSpacing;`
- **Dart** (`atomic_interfaces.dart:1563-1798`):
  - `AvatarStatus { online, busy, offline }`, `AvatarShape { circle, rounded, square }`, `AvatarGroupSpacing { tight, normal }`
  - `MagicAvatarProps` defaults: `disabled = false`, `size = AtomicSize.md`, `color = ColorIntent.primary`, `shape = AvatarShape.circle`.
  - `AvatarGroupItem` (`id`, `testId`, `ariaLabel`, `src`, `alt`, `name`, `initials`, `icon: IconData?`, `iconName: String?`, `color: ColorIntent?`, `shape: AvatarShape?`, `status: AvatarStatus?`, `statusLabel`, `copyWith`).
  - `MagicAvatarGroupProps` defaults: `disabled = false`, `required items`, `max: int?`, `size = AtomicSize.md`, `spacing = AvatarGroupSpacing.normal`.

---

## 2. Per-Library Worker Blueprints, Imports & Pitfalls

### 2.1 `worker_m4_react` (`libs/ui/react-mui/src/lib/molecules/**`)
**Exclusive Ownership**: `libs/ui/react-mui/src/lib/molecules/**`, `libs/ui/react-mui/__vis__/**` (do NOT modify `src/lib/theme/mui-theme.tsx`).

- **Exact Internal Imports** (from `src/lib/molecules/<name>/<name>.tsx`):
  - `MagicIcon`: `import { MagicIcon } from '../../core/icon';` (`core/icon.tsx:36`)
  - `MagicButton`: `import { MagicButton } from '../../atoms/button/button';` (`atoms/button/button.tsx`)
  - `MagicBadge`: `import { MagicBadge } from '../../atoms/badge/badge';` (`atoms/badge/badge.tsx`)
  - `useControllableState`: `import { useControllableState } from '../../core/use-controllable-state';` (`core/use-controllable-state.ts:16-55`) — returns `readonly [T, (next: T | ((prev: T) => T)) => void]`. Note: omit unnecessary `useEffect` sync when using this hook!
  - Theme helpers (`src/lib/theme/mui-theme.tsx:443,657,690`):
    - `import { MAGIC_SIZE_METRICS, resolveMagicIntentColors, MagicMuiThemeProvider } from '../../theme/mui-theme';`
    - `resolveMagicIntentColors(theme, color)` returns `{ main, contrastText, container, onContainer }`.
- **Theme Overrides Already Configured in `mui-theme.tsx:169-186, 552-624`**:
  - Module augmentations exist for `@mui/material/Alert` (`AlertPropsColorOverrides`: `primary`, `secondary`, `tertiary`, `neutral`) and `@mui/material/Tabs` (`TabsPropsIndicatorColorOverrides`: `tertiary`, `neutral`, `success`, `warning`, `error`).
  - `styleOverrides` exist for `MuiDialog` (`paper`), `MuiAlert`, `MuiTabs`, `MuiTab`, `MuiAccordion` (`::before { display: none }`), `MuiAvatar` (`colorDefault`), `MuiSnackbar`.
- **CRITICAL MUI v9 Type Pitfall**:
  - `AlertPropsColorOverrides` widens MUI `<Alert>`'s `severity` union too, and `MuiTab`/`MuiAvatar`/`MuiAvatarGroup`/`MuiDialog`/`MuiAccordion`/`MuiSnackbar` do NOT have `*ColorOverrides`.
  - Keep `MagicAlertProps['severity']` strictly typed as `AlertSeverity` (from `@mono-magic/atomic-design-interfaces`). Map `'info'` -> MUI `severity="info"` (or `color="primary"` / `resolveMagicIntentColors(theme, ...)` via `sx` for custom M3 standard/filled/outlined tones).
  - For `MagicTabs` and `MagicAvatar`, resolve `ColorIntent` via `resolveMagicIntentColors(theme, color)` + `sx` rather than passing unsupported colors directly to MUI `Tab`/`Avatar`.
- **React 19 & Component Pattern** (`card.tsx`, `menu.tsx`):
  - Direct `ref?: Ref<HTMLDivElement>` prop (no `forwardRef`).
  - `testId` maps to `data-testid={testId}`, sub-elements use `${testId}-...`.
  - `sx?: SxProps<Theme>; className?: string; children?: ReactNode;` + event callbacks (e.g., `onClose`, `onActionClick`, `onDismiss`, `onAction`, `onTabChange`/`onChange`, `onExpandedChange`).
  - Barrel exports: `libs/ui/react-mui/src/lib/molecules/<name>/index.ts` -> re-export in `libs/ui/react-mui/src/lib/molecules/index.ts`.
- **Tests & Coverage** (`vite.config.mts:48-76`):
  - `import { cleanup, fireEvent, render, screen } from '@testing-library/react';` + `afterEach(cleanup);` (required!).
  - Wrap renders in `<MagicMuiThemeProvider>`.
  - Coverage threshold in `vite.config.mts:59-64`: **>=80%** for `lines`, `statements`, `functions`, `branches` in `src/lib/**/*.{ts,tsx}` (excludes `*.stories.*`, `*.spec.*`, `**/index.ts`). Reports in `libs/ui/react-mui/test-output/vitest/coverage/`.
- **Stories** (`card.stories.tsx`, `.storybook/preview.tsx`, `.storybook/vitest.setup.ts`):
  - `import type { Meta, StoryObj } from '@storybook/react-vite';`
  - `import { expect, fn, userEvent, within } from 'storybook/test';`
  - `.storybook/preview.tsx:58` already sets `tags: ['autodocs', 'snapshot']`, `MagicMuiThemeProvider`, and loads Material Icons font.
  - **Vis Snapshot Pitfall for Portals (`MagicDialog`, `MagicToast`)**: `storybook-addon-vis` captures the story root (`#storybook-root`) or page depending on setup, and `vitest.setup.ts:25` disables CSS animations. For `MagicDialog` / `MagicToast` stories meant for visual snapshots, either render an inline/contained preview variant OR pass `disablePortal` / container prop when appropriate so portal overlays don't escape `#storybook-root` with 0x0 story box or obscure controls—while still testing real modal behavior in interactive `play` tests and unit tests. Verify `play` tests query `within(document.body)` if portaled!

### 2.2 `worker_m4_angular` (`libs/ui/ng-mat/src/lib/molecules/**`)
**Exclusive Ownership**: `libs/ui/ng-mat/src/lib/molecules/**` (do NOT run `test-storybook -- -u` in Stage 2; defer Chromium vis runs to Stage 3).

- **`SignalProps<P>` & Host Forwarding Pattern** (`card.component.ts:64-87`, `menu.component.ts:42-53`, `core/signal-props.ts:12-14`):
  - `export class Magic<Name>Component implements SignalProps<<Name>MoleculeProps>`
  - Every property on `<Name>MoleculeProps` MUST be a signal (`input()`, `model()`, or `computed()`). Keep `BaseMoleculeProps` (`id`, `testId`, `ariaLabel`) as `input<string>()`.
  - Forward `id` cleanly so host doesn't duplicate IDs: `host: { '[attr.id]': 'null', '[class]': 'hostClasses()' }`, and bind `[attr.id]="id() || null"`, `[attr.data-testid]="testId() || null"`, `[attr.aria-label]="ariaLabel() || null"` on the inner Material/semantic element.
  - `changeDetection: ChangeDetectionStrategy.OnPush`, standalone component (`imports: [...]`, no `standalone: true` needed in Angular 22).
- **Directives & Sub-components** (`card.component.ts:36-51`, `menu.component.ts:30-33`):
  - Export content-projection directives (e.g., `MagicDialogActionsDirective`, `MagicTabPanelDirective`, etc. as needed) alongside the component in `molecules/index.ts`.
  - Re-export all new components & directives from `libs/ui/ng-mat/src/lib/molecules/index.ts:1-6`.
- **Theme Tokens (`src/theme/_tokens.scss:7-85`)**:
  - Host classes `magic-size-${this.size()}` and `magic-color-${this.color()}` expose CSS custom properties:
    - `--magic-intent`, `--magic-on-intent`, `--magic-intent-container`, `--magic-on-intent-container`
    - `--magic-success*`, `--magic-warning*` (available via `var(--magic-success)`, etc.)
    - `--magic-control-height`, `--magic-font-size`, `--magic-icon-size`, `--magic-control-padding`
  - **NOTE on `MatDialog` / `MatSnackBar` Overlays**: `MatDialog` and `MatSnackBar` render inside CDK `OverlayContainer` outside the component host, so `.magic-color-*` / `.magic-size-*` on `:host` do NOT cascade into CDK overlay panes unless applied to `panelClass` or styled globally via `--mat-sys-*` / `--magic-*` tokens!
  - Note `provideAnimationsAsync()` is configured in `.storybook/preview.ts:51`.
- **AnalogJS / Vitest Unit Tests** (`card.component.spec.ts`, `menu.component.spec.ts`, `src/test-setup.ts:1-6`):
  - `TestBed.configureTestingModule({ imports: [Magic...Component] }).compileComponents();`
  - Use `fixture.componentRef.setInput(name, value)` + `fixture.detectChanges()`.
  - For overlay tests (`MatDialog`, `MatSnackBar` or custom overlay), inject `OverlayContainer` (`overlayContainer = TestBed.inject(OverlayContainer)`) and call `overlayContainer.ngOnDestroy()` in `afterEach`.
  - Coverage output path (`vite.config.mts:59-62`): `./test-output/vitest/coverage` (provider `'v8'`). Run `pnpm nx test ng-mat -- --coverage`.
- **CSF3 Stories** (`card.component.stories.ts`, `form-field.component.stories.ts`):
  - `import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';`
  - `import { expect, fn, userEvent, within } from 'storybook/test';`
  - Note in `select.component.stories.ts:111` & `menu.component.stories.ts:107`: CDK overlays attach to `document.body`, so `play` functions query `const doc = within(document.body);` for open dialogs/toasts/menus.
  - For `MagicDialog` / `MagicToast`, consider an inline/embedded preview or trigger-button story so `Default` doesn't permanently block the Storybook docs/canvas or make sure `play` tests clean up/close overlays if needed.

### 2.3 `worker_m4_rn` (`libs/ui/rn-paper/src/lib/molecules/**`)
**Exclusive Ownership**: `libs/ui/rn-paper/src/lib/molecules/**` (do NOT run `test-storybook -- -u` in Stage 2; defer Chromium vis runs to Stage 3).

- **Exact Internal Imports** (`card.tsx`, `menu.tsx`, `atoms/badge/badge.tsx`):
  - `MagicIcon`, `renderPaperIcon`, `type MagicIconValue`: `import { MagicIcon, renderPaperIcon, type MagicIconValue } from '../../core/icon';` (`core/icon.tsx:34-94`)
  - `MagicButton`: `import { MagicButton } from '../../atoms/button/button';`
  - `MagicBadge`: `import { MagicBadge } from '../../atoms/badge/badge';`
  - `useControllableState`: `import { useControllableState } from '../../core/use-controllable-state';` (`core/use-controllable-state.ts:18-56`)
  - Theme helpers (`theme/paper-theme.tsx:97, 373, 430, 498`):
    - `import { MAGIC_PAPER_SIZE_METRICS, resolveMagicPaperIntent, useMagicPaperColors, MagicPaperProvider } from '../../theme/paper-theme';`
    - `useMagicPaperColors()` returns `{ theme, colors, semantic, dark, resolveIntent }`.
    - `resolveIntent(intent)` resolves all 7 `ColorIntent`s (`primary`, `secondary`, `tertiary`, `success`, `warning`, `error`, `neutral`) into `{ main, onMain, container, onContainer }`!
- **RN Web Compatibility & Pitfalls** (`card.tsx:65-77`, `menu.tsx:68-105, 289-296, 415-422`, `vite.config.mts:28-66`, `src/test-setup.ts:1-92`):
  - **Icons**: `vite.config.mts` stubs `@expo/vector-icons` and `MaterialCommunityIcon`. Always use `MagicIcon` (renders `<Text>` with `"Material Icons"` font on web) or `renderPaperIcon(icon)` when passing to RNP components (`PaperDialog`, etc.)—never import `@expo/vector-icons` directly.
  - **Shadows**: Use `Platform.select({ web: { boxShadow: '...' }, default: { elevation: ..., shadowColor: ..., shadowOffset: ..., shadowOpacity: ..., shadowRadius: ... } })`.
  - **Fixed/Overlay positioning on web**: In `menu.tsx:70`, web backdrop uses `position: 'fixed' as unknown as 'absolute'`. Also note RNP `Portal` / `Dialog` requires `<MagicPaperProvider>` (which wraps `<PaperProvider>`); in unit tests always wrap with `<MagicPaperProvider>`.
  - **Web ARIA / Keyboard**: `Platform.OS === 'web'` attaches web-only props like `role`, `aria-modal`, `aria-live`, `aria-selected`, `aria-expanded`, `aria-controls` alongside RN `accessibilityRole`, `accessibilityLabel`, `accessibilityState`, `accessibilityLiveRegion`. Also guard `typeof window !== 'undefined'` for `window.addEventListener('keydown', ...)` (e.g. `Escape` in Dialog, arrow keys in Tabs).
  - **Props mapping**: `nativeID={id}`, `testID={testId}`, `accessibilityLabel={ariaLabel}`, `style?: StyleProp<ViewStyle>`, React 19 `ref?: Ref<View>`.
  - Barrel exports: `molecules/<name>/index.ts` -> re-export in `libs/ui/rn-paper/src/lib/molecules/index.ts`.
- **Tests & Stories**:
  - `card.spec.tsx`: `import { cleanup, fireEvent, render, screen } from '@testing-library/react';` + `afterEach(cleanup);`, wrapped in `<MagicPaperProvider>`.
  - `card.stories.tsx`: `import type { Meta, StoryObj } from '@storybook/react';` (note `@storybook/react` in `rn-paper`, NOT `@storybook/react-vite`), `import { expect, fn, userEvent, within } from 'storybook/test';`.
  - Coverage (`vite.config.mts:140-157`): `>=80%` threshold for `lines`, `statements`, `functions`, `branches`; reports in `./test-output/vitest/coverage`.

### 2.4 `worker_m4_flutter` (`libs/ui/fl-mat/**`)
**Exclusive Ownership**: `libs/ui/fl-mat/lib/src/molecules/**`, `libs/ui/fl-mat/lib/fl_mat.dart`, `libs/ui/fl-mat/lib/widgetbook/**`, `libs/ui/fl-mat/lib/widgetbook.dart`, `libs/ui/fl-mat/test/**` (FORBIDDEN: `lib/src/interfaces/atomic_interfaces.dart` — already completed in M2!).

- **Environment & Tooling**:
  - `flutter` is at `/home/antigravity/.local/flutter/bin/flutter` (Flutter 3.50.0, Dart 3.14.0). If not on default `PATH`, prepend `PATH="/home/antigravity/.local/flutter/bin:$PATH"`.
  - `libs/ui/fl-mat/.dart_tool` is already hydrated (`package_config.json`, `package_graph.json`, `flutter_build`).
  - Nx targets (`pnpm nx lint fl-mat`, `pnpm nx test fl-mat`, `pnpm nx build-widgetbook fl-mat`). For coverage: run `flutter test --coverage` inside `libs/ui/fl-mat` (produces `coverage/lcov.info`).
- **Available Icons (`magic_icon.dart:12-159`)**:
  - `magicIconMap` has 146 entries including all Wave 2 essentials: `info`, `info_outline`, `check_circle`, `check_circle_outline`, `warning`, `warning_amber`, `error`, `error_outline`, `close`, `expand_more`, `expand_less`, `keyboard_arrow_down`, `keyboard_arrow_up`, `keyboard_arrow_left`, `keyboard_arrow_right`, `fullscreen`, `fullscreen_exit`, `person`, `person_add`, `person_outline`, `account_circle`, `notifications`.
- **Component & Theme Conventions** (`magic_card.dart`, `magic_menu.dart`, `magic_theme.dart:540-619`, `magic_badge.dart`):
  - Import `package:flutter/material.dart`, `../../interfaces/atomic_interfaces.dart`, `../../theme/magic_theme.dart`, `../../core/magic_icon.dart`, `../../atoms/...`.
  - Theme helpers: `MagicTheme.resolveIntent(context, color)` -> `MagicIntentColorSet(main, onMain, container, onContainer)` supporting all 7 `ColorIntent`s including `success`, `warning`, `neutral`; `MagicTheme.metricsFor(size)` -> `MagicSizeMetrics`.
  - `testId != null ? ValueKey<String>(testId!) : null`, `Semantics(container: true, enabled: !disabled, label: ariaLabel ?? ..., child: ...)`.
  - Dual icon support for items & widgets: `IconData? icon` and `String? iconName`, passed as `MagicIcon(icon: ..., iconName: ...)`.
  - Use Flutter 3.50 APIs (`.withValues(alpha: ...)` instead of deprecated `.withOpacity(...)`, `WidgetStateProperty` instead of `MaterialStateProperty`).
  - Export all 7 new molecules (`magic_dialog.dart`, `magic_alert.dart`, `magic_toast.dart`, `magic_tabs.dart`, `magic_accordion.dart`, `magic_avatar.dart` — or `magic_avatar_group.dart` if split) from `libs/ui/fl-mat/lib/fl_mat.dart:19-25`.
- **Widgetbook & Pitfalls** (`widgetbook.dart:63-72`, `widgetbook/molecules/card_use_cases.dart`, `test/widgetbook_test.dart:166-191`):
  - Register all new molecule `WidgetbookComponent`s in `widgetbook.dart` under `WidgetbookCategory(name: 'Molecules', ...)`.
  - Use `widgetbook_helpers.dart` (`colorIntentKnob`, `atomicSizeKnob`, `buttonVariantKnob`).
  - **CRITICAL `widgetbook_test.dart` PITFALL**: `test/widgetbook_test.dart` has hardcoded counts/lists (`all 11 atom and 5 molecule builders` at line 61, `renders all 5 molecule use cases cleanly` at line 166)! `worker_m4_flutter` MUST update `test/widgetbook_test.dart` to include the new Wave 2 molecule builders (and interactive tests) so `widgetbook_test.dart` covers and verifies all 11/12 molecules!
  - **CRITICAL `MagicToast` / `MagicDialog` Widget Test Pitfall**: If `MagicToast` schedules a `Timer` (`duration`) or uses `Overlay` / `ScaffoldMessenger`, dispose timers cleanly in `dispose()` to avoid `A Timer is still pending even after the widget tree was disposed` failures in `flutter test` and `widgetbook_test.dart`! And in `Widgetbook` use cases, make sure `MagicDialog` / `MagicToast` either renders visibly or has a safe trigger button + inline preview so `tester.pump()` in `widgetbook_test.dart` renders cleanly without pending timers or missing `Navigator` exceptions.
- **Test Location Convention**: Note `libs/ui/fl-mat/test/molecules/magic_card_test.dart` (prefix is `magic_<name>_test.dart`, NOT `<name>_test.dart`).
