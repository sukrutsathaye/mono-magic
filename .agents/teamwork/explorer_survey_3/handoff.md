# Track C Survey Handoff: Polyglot UI Wave 2 Molecules Batch 1 Patterns & Visual Testing

**Summary**: All 5 UI libraries (`atomic-design-interfaces`, `react-mui`, `ng-mat`, `rn-paper`, `fl-mat`) share clean contract-first patterns and working JS/TS unit + Playwright Chromium Storybook test runners, but **Flutter/Dart is NOT installed in this container** and **no `__vis__/*/__baselines__` PNGs exist yet** (including for existing Wave 1 components). Parallelizing Wave 2 Molecules Batch 1 safely requires isolating per-component folders from 9 shared barrel/registry/theme files.

---

## 1. Observation

### 1.1 Workspace & Skills Architecture
- `.gemini/skills/polyglot-ui-component/SKILL.md:17-105` defines strict bottom-up order (`Atoms -> Molecules -> Core Organisms -> Domain Organisms -> Templates`) and 6-step per-component sequence: `atomic-design-interfaces` -> `react-mui` -> `ng-mat` -> `rn-paper` -> `fl-mat` -> `test-storybook -- -u` & `build-storybook` / `build-widgetbook`.
- `.gemini/skills/storybook-visual-testing/SKILL.md:22-48` and `.gitignore:34-37`:
  - Snapshots resolve under `libs/ui/<project>/__vis__/<local|platform>/`.
  - `.gitignore:35-37` ignores `**/__vis__/**/__diffs__`, `**/__vis__/**/__results__`, and `**/__vis__/local`. Currently, `ls -la libs/ui/*/__vis__` returned `no __vis__ dirs` across the entire repo.
- `.gemini/skills/coverage-and-quality/SKILL.md:17-42` specifies `@vitest/coverage-v8` (`80%` threshold on lines/statements/functions/branches, excluding stories/specs/`index.ts`) and `flutter test --coverage`.

### 1.2 Environment Readiness (Verified via Commands)
| Tool / Target | Status | Direct Observation / Evidence |
| --- | --- | --- |
| JS/TS Unit Tests (`atomic-design-interfaces`, `react-mui`, `ng-mat`, `rn-paper`) | **Working** | `pnpm nx run atomic-design-interfaces:test -- --coverage --reporter=dot` (0), `pnpm nx run react-mui:test -- --reporter=dot src/lib/molecules/card/card.spec.tsx` (0), `pnpm nx run ng-mat:test -- --reporter=dot src/lib/molecules/card/card.component.spec.ts` (0), `pnpm nx run rn-paper:test -- --reporter=dot src/lib/molecules/card/card.spec.tsx` (0). |
| Playwright + Headless Chromium (`test-storybook`) | **Working** (via `/usr/bin/chromium` fallback) | Bundled `/home/antigravity/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome` is absent (`false`) and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` is unset, **but** `/usr/bin/chromium` (`Chromium 156.0.8078.79`) launches cleanly (`Chromium launch OK: 156.0.8078.79`). All 3 `vite.config.mts` files fall back to `/usr/bin/chromium`. Running `pnpm nx run react-mui:test-storybook -- src/lib/molecules/card/card.stories.tsx` rendered all 7 stories and wrote PNGs to `libs/ui/react-mui/__vis__/local/__results__/lib/molecules/card/card.stories.tsx/*.png` (exited non-zero solely because no `__baselines__/` existed without `-- -u`). Temporary `__vis__` and `test-output` artifacts were cleaned afterwards. |
| Flutter / Dart SDK (`fl-mat`) | **NOT INSTALLED** | `flutter: command not found`; `which dart flutter` found neither binary; `find / -name "flutter" -type f` found nothing. In GitHub Actions, `.github/actions/setup-flutter/action.yml:8` installs Flutter `3.50.0` (`stable`). |
| Nx Cloud Remote Cache | **Warning (non-fatal)** | Every `pnpm nx` command printed `NX Nx Cloud encountered some problems ... status code 400 ... x-goog-iap-egress-jwt-assertion` when storing artifacts, while local execution succeeded. |

### 1.3 Nx Targets Across All 5 UI Projects (`pnpm nx show project <name> --json`)
| Project | Package / Root | Tags | Targets |
| --- | --- | --- | --- |
| `atomic-design-interfaces` | `@mono-magic/atomic-design-interfaces` (`libs/ui/atomic-design-interfaces`) | `npm:private`, `scope:ui`, `type:interfaces` | `lint`, `test`, `test-ci`, `typecheck` |
| `react-mui` | `@mono-magic/react-mui` (`libs/ui/react-mui`) | `npm:public`, `scope:ui`, `framework:react`, `ds:material` | `lint`, `test`, `test-ci`, `typecheck`, `storybook`, `build-storybook`, `test-storybook`, `static-storybook`, `build-deps`, `watch-deps`, `nx-release-publish` |
| `ng-mat` | `@mono-magic/ng-mat` (`libs/ui/ng-mat`) | `npm:public`, `scope:ui`, `framework:angular`, `ds:material` | `lint`, `test`, `test-ci`, `typecheck`, `storybook`, `build-storybook`, `test-storybook`, `static-storybook`, `build-deps`, `watch-deps`, `nx-release-publish` |
| `rn-paper` | `@mono-magic/rn-paper` (`libs/ui/rn-paper`) | `npm:public`, `scope:ui`, `framework:expo`, `ds:paper` | `lint`, `test`, `test-ci`, `typecheck`, `storybook`, `build-storybook`, `test-storybook`, `static-storybook`, `build-deps`, `watch-deps`, `nx-release-publish` |
| `fl-mat` | `fl_mat` (`libs/ui/fl-mat`) | `scope:ui`, `framework:flutter`, `ds:material` | `lint` (`flutter analyze`), `test` (`flutter test`), `widgetbook`, `build-widgetbook` |

### 1.4 Library-by-Library Patterns Observed

#### A. `libs/ui/atomic-design-interfaces`
- **Common tokens** (`src/lib/common/atomic.interface.ts:1-33`):
  - `AtomicTier` (`'atom' | 'molecule' | 'organism' | 'template'`), `ATOMIC_TIERS`
  - `AtomicSize` (`'xs' | 'sm' | 'md' | 'lg' | 'xl'`)
  - `ColorIntent` (`'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'neutral'`)
  - `BaseAtomicProps` (`id?`, `testId?`, `ariaLabel?`), `BaseAtomProps` (`disabled?`), `BaseMoleculeProps = BaseAtomicProps`
- **Molecules** (`src/lib/molecules/`): `card.interface.ts`, `form-field.interface.ts`, `menu.interface.ts`, `search-bar.interface.ts`, `select.interface.ts`, barrel `src/lib/molecules/index.ts` (uses `.js` ESM extensions: `export * from './card.interface.js';`).
  - **Naming convention note**: Existing interfaces are named `<Name>MoleculeProps` (e.g., `CardMoleculeProps`, `MenuMoleculeProps`, `SelectMoleculeProps`), NOT `Magic<Name>Props` (that `Magic*Props` wrapper name is used in `react-mui`/`rn-paper` or `Magic*Props` in `fl-mat`). Keep `<Name>MoleculeProps` in `atomic-design-interfaces` (or export alias if desired) so contracts stay uniform!
  - Existing atoms include `BadgeAtomProps` (`badge.interface.ts`), `ButtonVariant` / `ButtonAtomProps` (`button.interface.ts`), `ChipItem` (`chip.interface.ts`), `ProgressIndicatorAtomProps` (`progress-indicator.interface.ts`), `ToolTipAtomProps` (`tool-tip.interface.ts`).
- **Tests & Coverage** (`src/lib/interfaces.spec.ts`, `vitest.config.mts:1-19`):
  - `interfaces.spec.ts` imports and type-checks all atom and molecule prop interfaces.
  - `vitest.config.mts` only sets `provider: 'v8'` and `reportsDirectory: './test-output/vitest/coverage'` — NO `thresholds` or `include`/`exclude` (and pure `.interface.ts` files show `0%` coverage because TS types emit no JS runtime statements).

#### B. `libs/ui/react-mui`
- **Stack**: React 19 (`^19.0.0`), `@mui/material` `^9.5.0`, `@emotion/react`, `@emotion/styled`, `@testing-library/react` `16.3.0`, `@storybook/react-vite` `^10.6.2`.
- **Component pattern** (`src/lib/molecules/card/card.tsx`, `menu/menu.tsx`):
  - `<Name>Props` extends `<Name>MoleculeProps` (using `Omit<..., ...>` when widening `string` icon/content props to `string | ReactNode`) + React 19 `ref?: Ref<...>` direct prop (no `forwardRef`), `sx?: SxProps<Theme>`, `className?: string`, `children?: ReactNode`, and event callbacks (`onActionClick`, `onItemSelect`, etc.).
  - Theme integration via `useTheme()` + `resolveMagicIntentColors(theme, color)` and `theme.palette.magic` from `src/lib/theme/mui-theme.tsx:19-34,566-583`.
  - **CRITICAL MUI Theme Gap**: `src/lib/theme/mui-theme.tsx:50-167` only declares `tertiary` and `neutral` module augmentation color overrides for `Button`, `IconButton`, `Fab`, `Badge`, `Chip`, `Checkbox`, `Radio`, `Switch`, `Slider`, `LinearProgress`, `CircularProgress`, `ToggleButton`, `ToggleButtonGroup`, `FormControl`, `InputBase`, `FormLabel`, `Icon`. It does **NOT** declare `Alert`, `Tabs`, `Tab`, `Avatar`, etc. (so passing `color="tertiary"` or `color="neutral"` directly to `<MuiAlert>` or `<Tabs>` will fail TypeScript unless handled via `sx` + `resolveMagicIntentColors` or `mui-theme.tsx` augmentation).
  - Controlled/uncontrolled state helper: `useControllableState` in `src/lib/core/use-controllable-state.ts`.
  - Icons: `MagicIcon` in `src/lib/core/icon.tsx`.
  - Barrel pattern: `src/lib/molecules/<name>/index.ts` re-exported from `src/lib/molecules/index.ts` -> `src/index.ts`.
- **Stories & Visual Testing**:
  - CSF3 stories (`tags: ['autodocs', 'snapshot']`), `storybook/test` (`expect, fn, userEvent, within`) play functions.
  - `.storybook/preview.tsx` wraps every story in `<MagicMuiThemeProvider>` with 7 M3 palettes (default `'azure-blue'`) and loads Material Icons Google Font.
  - `.storybook/vitest.setup.ts` disables CSS animations/transitions and awaits Material Icons font before `vis.setup({ animations: 'disabled', auto: ... })`.
  - `vite.config.mts:49-65` enforces **80% coverage thresholds** (`lines`, `statements`, `functions`, `branches`) on `src/lib/**/*.{ts,tsx}` excluding `*.stories.*`, `*.spec.*`, `*.test.*`, `**/index.ts`.

#### C. `libs/ui/ng-mat`
- **Stack**: Angular `~22.2.0`, `@angular/material` `^22.2.7`, `@angular/cdk` `^22.2.7`, `@analogjs/vite-plugin-angular` `^2.7.5`, `@storybook/angular-vite` `^10.6.7`.
- **Component pattern** (`src/lib/molecules/card/card.component.ts`, `menu/menu.component.ts`, `select/select.component.ts`):
  - Standalone component (`ChangeDetectionStrategy.OnPush`), selector `magic-<kebab-name>` (`eslint.config.mjs:21-28` enforces `magic` kebab-case element selector & `magic` camelCase attribute directive selector).
  - **Strict Contract Enforcement**: `implements SignalProps<...MoleculeProps>` (`src/lib/core/signal-props.ts:12-14`), meaning **every property on `<Name>MoleculeProps` MUST be a Signal (`input()`, `model()`, or `computed()`) on the component class**, or `tsc` will fail!
  - Host cleanup: `host: { '[attr.id]': 'null', '[class]': 'hostClasses()' }` moves `id` and `data-testid` onto inner Material element.
  - Content projection slots via typed directives (`@Directive({ selector: '[magic...]' })`) + attribute fallbacks.
  - Theme styling via CSS custom properties in `src/theme/_tokens.scss` (`.magic-color-*`, `.magic-size-*`, `.magic-shape-*`) and Material 3 `--mat-sys-*` vars (`src/theme/styles.scss`).
  - `tsconfig.json:11,14-19`: `noPropertyAccessFromIndexSignature: true`, `strictTemplates: true`, `strictInputAccessModifiers: true`.
  - `tsconfig.lib.json:11-30` includes `src/**/*.ts` and excludes `*.spec.ts`, `*.stories.ts`, `src/test-setup.ts`.
  - `ng-mat` has **no** `MagicIcon` component; templates use `<mat-icon>{{ icon }}</mat-icon>`.
- **Stories & Visual Testing**:
  - `.storybook/preview.ts` provides `provideAnimationsAsync()`, `provideNativeDateAdapter()`, and applies palette class to `document.body`.
  - `vite.config.mts:59-62`: **Note** — `ng-mat` `vite.config.mts` lacks `include`/`exclude`/`thresholds` in `coverage` config (coverage is still written to `./test-output/vitest/coverage` when `-- --coverage` is passed, so workers must manually check `>=80%` on their files).
  - Notice `libs/ui/ng-mat/.storybook/documentation.json` (Compodoc output, 699KB) is checked into Git; adding new components works without regenerating it unless Compodoc docs are updated.
  - **Dialog/Snackbar Storybook Pitfall**: `MatDialog` and `MatSnackBar` are service-driven overlays (`inject(MatDialog)`, `inject(MatSnackBar)`), NOT purely inline declarative elements unless wrapped cleanly in a component (e.g., `MagicDialogComponent` supporting inline `open` input / declarative `<ng-template>` / `TemplatePortal` or trigger-opened modal, plus `MagicToastComponent` supporting inline/fixed toast or `MatSnackBar` trigger).

#### D. `libs/ui/rn-paper`
- **Stack**: `react-native` `0.85.3`, `react-native-paper` `^5.15.4`, `react-native-web` `^0.21.4`, `react` `^19.0.0`, `@storybook/react-vite`.
- **Web/Storybook Compatibility (`vite.config.mts:12-128`, `src/test-setup.ts`)**:
  - `vite.config.mts` aliases `'react-native'` -> `react-native-web`, `'react-native-paper'` -> `lib/module/index.js`, `'react-native-safe-area-context'` -> `lib/module/index.js`, and stubs `@expo/vector-icons` via `VIRTUAL_VECTOR_ICONS_ID` + regex transform on `MaterialCommunityIcon`.
  - `src/test-setup.ts` polyfills `HTMLElement.prototype.getBoundingClientRect` (non-zero fallback `120x40`), `window.matchMedia`, and `ResizeObserver` for jsdom.
  - `MagicIcon` (`src/lib/core/icon.tsx`) renders Material Icons ligatures on `Platform.OS === 'web'` via `fontFamily: '"Material Icons"'` inside `<Text>`.
  - `MagicPaperProvider` (`src/lib/theme/paper-theme.tsx`) provides all 7 palettes + `useMagicPaperColors()` (`theme`, `colors`, `semantic`, `dark`, `resolveIntent`).
  - **CRITICAL `react-native-paper` Primitive Gaps**:
    - `node_modules/react-native-paper/src/components/` has `Avatar` (`Avatar.Image`, `Avatar.Text`, `Avatar.Icon`), `Dialog`, `Modal`, `Portal`, `Snackbar`, `Banner`, `List` (`List.Accordion`), `Surface`, `Divider` — it has **NO `Tabs` component** and **NO `Alert` component**!
    - Look at `rn-paper/src/lib/molecules/menu/menu.tsx:67-86,155-478` and `rn-paper/src/lib/atoms/tool-tip/tool-tip.tsx`: `MagicMenu` and `MagicToolTip` deliberately use pure RN `View` + `Pressable` + `Text` + `Platform.select({ web: { boxShadow / position: 'fixed' }, default: { elevation } })` rather than Paper `Portal` overlays when `Portal` complicates web/jsdom/storybook layout! For `MagicTabs` and `MagicAlert`, custom M3 `View`/`Pressable`/`Text` implementations using `useMagicPaperColors()` are required. For `MagicDialog`, avoid `react-native-paper`'s `Modal` if it requires `SafeAreaProvider` or full-screen `Portal` quirks in Storybook/jsdom—test carefully or render in a controlled `Portal` / web `position: 'fixed'` overlay + `MagicPaperProvider` wrapper.
- **Stories & Coverage**:
  - `vite.config.mts:140-157` enforces **80% coverage thresholds** (`lines`, `statements`, `functions`, `branches`) on `src/lib/**/*.{ts,tsx}`.

#### E. `libs/ui/fl-mat`
- **Actual File Layout** (differs from prompt's assumption of `lib/src/common/` & `lib/src/molecules/molecules.dart`):
  - **NO** `lib/src/common/` directory and **NO** `lib/src/molecules/molecules.dart` barrel exist!
  - All shared enums & prop/item classes live in a single file: `lib/src/interfaces/atomic_interfaces.dart` (975 lines).
  - Public exports are listed directly in `lib/fl_mat.dart:1-26` (lines 19-23 list the 5 existing molecules).
  - Molecule implementations live in `lib/src/molecules/<snake_name>/magic_<snake_name>.dart` (e.g., `lib/src/molecules/card/magic_card.dart`, `menu/magic_menu.dart`).
  - Icons must use `MagicIcon` (`lib/src/core/magic_icon.dart:12-151`) with compile-time constant `magicIconMap` entries (for `--tree-shake-icons` compatibility!). **Check `magicIconMap`** for needed alert/tab/avatar/dialog icons (`info`, `check_circle`, `warning`, `error`, `close`, `expand_more`, `expand_less`, `person`, etc. — many already exist, verify any new defaults!).
  - Theme tokens live in `lib/src/theme/magic_theme.dart` (`MagicTheme.resolveIntent(context, intent)`, `MagicTheme.metricsFor(size)`).
  - Widgetbook use cases live in `lib/widgetbook/molecules/<snake_name>_use_cases.dart` and are registered in `lib/widgetbook.dart:19-23,63-72`.
  - **Crucial Test File**: `test/widgetbook_test.dart:61-115,166-191` explicitly imports all molecule use-case files and asserts exact component count/names and renders every use case cleanly!

---

## 2. Logic Chain — Wave 2 Molecules Batch 1 Mapping & Pitfalls

### 2.1 Component Contract & Cross-Framework Mapping

1. **`Dialog` (`MagicDialog`)**
   - **Contract** (`dialog.interface.ts`):
     - `DialogSize = 'sm' | 'md' | 'lg' | 'fullscreen'`
     - `DialogActionItem` (or reuse `CardActionItem`-like shape: `id?`, `label`, `variant?`, `color?`, `icon?`, `disabled?`)
     - `DialogMoleculeProps extends BaseMoleculeProps`: `open?: boolean`, `title?: string`, `subtitle?: string`, `content?: string`, `size?: DialogSize`, `dismissible?: boolean` (backdrop/Escape), `closeOnBackdropClick?: boolean`, `closeOnEscape?: boolean`, `showCloseButton?: boolean`, `scrollable?: boolean`, `actions?: readonly DialogActionItem[]`, `alignActions?: 'start' | 'end'`.
   - **Cross-framework mapping**:
     - `react-mui`: MUI `Dialog`, `DialogTitle`, `DialogContent` (`dividers` when `scrollable`), `DialogActions`, `MagicButton` + `MagicIcon` close button. `fullScreen={size === 'fullscreen'}`, `maxWidth` (`'sm' | 'md' | 'lg'`).
     - `ng-mat`: Wrap `MatDialog` / declarative inline modal or CDK `Dialog` + `CdkTrapFocus` + `mat-dialog-title` / `mat-dialog-content` / `mat-dialog-actions` styling. **Pitfall**: A pure service `MatDialog.open()` cannot be rendered declaratively as `<magic-dialog [open]="true">` without a component wrapper that opens/closes a `TemplateRef` via `MatDialog` in an `effect()`, OR renders a declarative M3 dialog surface with `cdkTrapFocus`. Using `MatDialog` via `TemplateRef` + `effect()` gives real Material 3 dialog + backdrop + focus trap + ARIA `role="dialog"`.
     - `rn-paper`: `Portal` + `Dialog` (from `react-native-paper`) or controlled fixed/absolute overlay + `Surface` + `ScrollView` + `MagicButton` actions. **Pitfall**: In `rn-paper` Storybook (`MagicPaperProvider`), `PaperProvider` already includes `Portal.Host`, **but** unit tests must wrap with `<MagicPaperProvider>` and Storybook stories with `open={true}` need enough container height (`minHeight: 360`) or `position: 'fixed'` on web so `storybook-addon-vis` captures the dialog!
     - `fl-mat`: Both `MagicDialog` widget (M3 `Dialog` / `Dialog.fullscreen` with `AlertDialog`-like header, `SingleChildScrollView` body, `MagicButton` actions) AND optional `showMagicDialog(context, ...)` helper. Note: `Widgetbook` use-case should render `MagicDialog` inline or via trigger + preview so `widgetbook_test.dart` renders cleanly without unmounted overlay errors.

2. **`Alert` & `Toast` (`MagicAlert` & `MagicToast`)**
   - **Contract** (`alert.interface.ts` — or split `alert.interface.ts` & `toast.interface.ts`; keeping both in `alert.interface.ts` or separate files needs clear naming):
     - `AlertSeverity = 'info' | 'success' | 'warning' | 'error'`
     - `AlertVariant = 'standard' | 'filled' | 'outlined'`
     - `ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'`
     - `AlertMoleculeProps extends BaseMoleculeProps`: `severity?: AlertSeverity`, `variant?: AlertVariant`, `title?: string`, `message: string`, `icon?: string`, `hideIcon?: boolean`, `dismissible?: boolean`, `actionLabel?: string`, `size?: AtomicSize`.
     - `ToastMoleculeProps extends BaseMoleculeProps`: `open?: boolean`, `severity?: AlertSeverity`, `title?: string`, `message: string`, `duration?: number` (auto-hide ms; `0` or `null` disables), `position?: ToastPosition`, `dismissible?: boolean`, `actionLabel?: string`.
   - **Pitfall — `info` severity vs `ColorIntent`**: `ColorIntent` (`atomic.interface.ts:12-19`) has `'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error' | 'neutral'` — it does **NOT** have `'info'`! Map `'info'` -> `'primary'` (or dedicated info token) consistently across all 4 libraries!
   - **Pitfall — Auto-hide timers in Storybook visual tests**: `storybook-addon-vis` runs `play` and waits for fonts/stability; if `MagicToast` has a short default `duration` (e.g., 4000ms) it's fine, or pass `duration={0}` / `autoHideDuration={null}` in open snapshot stories so the toast doesn't disappear mid-capture. Use `role="alert"` / `aria-live="polite"` (or `"assertive"` for `error`).
   - **Cross-framework mapping**:
     - `react-mui`: `MuiAlert` (`AlertTitle`, `severity`, `variant`, `onClose`, `action`) + `MuiSnackbar` wrapping `MagicAlert` (or custom M3 toast). Note `MuiAlert` `color` prop only accepts `'success' | 'info' | 'warning' | 'error'`.
     - `ng-mat`: Custom M3 `MagicAlertComponent` (Angular Material has no `MatAlert`) using `--magic-intent*` / `--mat-sys-*` tokens + `MagicToastComponent` using `MatSnackBar` (service-backed via `effect()` on `open()` or `show()`) or positioned live-region overlay + `MagicButtonComponent` action.
     - `rn-paper`: Custom M3 `MagicAlert` (`View` + `MagicIcon` + `Text` + `MagicButton`) + `MagicToast` (`Snackbar` from `react-native-paper` or custom positioned M3 toast surface with `useEffect` timer + `accessibilityLiveRegion="polite"`).
     - `fl-mat`: Custom M3 `MagicAlert` widget (`Card`/`Container` + `MagicIcon` + `MagicButton`) + `MagicToast` widget + `showMagicToast(context, ...)` `ScaffoldMessenger` helper.

3. **`Tabs` (`MagicTabs`)**
   - **Contract** (`tabs.interface.ts`):
     - `TabsOrientation = 'horizontal' | 'vertical'`
     - `TabsVariant = 'primary' | 'secondary'` (M3 primary vs secondary tabs) or `'standard' | 'scrollable' | 'fullWidth'`
     - `TabItem`: `id: string`, `label: string`, `icon?: string`, `badgeContent?: string | number`, `disabled?: boolean`, `content?: string`.
     - `TabsMoleculeProps extends BaseMoleculeProps`: `items: readonly TabItem[]`, `activeTabId?: string`, `defaultActiveTabId?: string`, `orientation?: TabsOrientation`, `variant?: TabsVariant`, `scrollable?: boolean`, `lazy?: boolean`, `color?: ColorIntent`, `size?: AtomicSize`.
   - **Cross-framework mapping**:
     - `react-mui`: MUI `Tabs` + `Tab` + `MagicBadge` + `MagicIcon` + `role="tabpanel"` panels (`aria-controls` / `aria-labelledby`). MUI `Tabs` supports `orientation="horizontal" | "vertical"`, `variant="scrollable" | "fullWidth" | "standard"`, and keyboard arrow navigation built-in.
     - `ng-mat`: `MatTabGroup` + `MatTab` (`ng-template mat-tab-label` for icon + label + `magic-badge`, `ng-template matTabContent` when `lazy()` is true). **Pitfall**: Angular Material `MatTabGroup` does NOT support native `orientation="vertical"` out of the box! Either implement vertical layout via CSS flex / CDK `Listbox` or custom tablist + `aria-orientation="vertical"` with `ArrowUp`/`ArrowDown` keyboard handler when `orientation() === 'vertical'`.
     - `rn-paper`: **No `Tabs` in `react-native-paper`**. Build M3 `MagicTabs` with `ScrollView` + `View` + `Pressable` + `MagicIcon` + `MagicBadge` + active indicator bar, implementing `role="tablist"` / `role="tab"` / `role="tabpanel"` and `ArrowLeft`/`ArrowRight`/`ArrowUp`/`ArrowDown`/`Home`/`End` keyboard navigation on web (`Platform.OS === 'web'`).
     - `fl-mat`: `DefaultTabController` / `TabController` (`TickerProviderStateMixin`) + `TabBar` + `TabBarView` for horizontal; custom vertical `NavigationRail`-style or vertical tab strip + content pane for `TabsOrientation.vertical`, composing `MagicIcon` and `MagicBadge`. **Pitfall**: In `fl-mat`, `TabBarView` requires bounded height inside unconstrained parents (e.g., `Column` / `SingleChildScrollView` in tests); give a sensible intrinsic/flexible layout or `IndexedStack` when height is unbounded!

4. **`Accordion` (`MagicAccordion`)**
   - **Contract** (`accordion.interface.ts`):
     - `AccordionItem`: `id: string`, `title: string`, `summary?: string`, `content?: string`, `icon?: string`, `disabled?: boolean`, `expanded?: boolean`.
     - `AccordionMoleculeProps extends BaseMoleculeProps`: `items: readonly AccordionItem[]`, `multiple?: boolean`, `expandedIds?: readonly string[]`, `defaultExpandedIds?: readonly string[]`, `appearance?: 'outlined' | 'raised'` (or `'separated' | 'grouped'`), `size?: AtomicSize`.
   - **Cross-framework mapping**:
     - `react-mui`: MUI `Accordion`, `AccordionSummary` (`expandIcon={<MagicIcon icon="expand_more" />}`), `AccordionDetails`. Manage expanded IDs via `useControllableState`.
     - `ng-mat`: `MatAccordion` (`[multi]="multiple()"`) + `MatExpansionPanel` (`[expanded]`, `[disabled]`, `(opened)`, `(closed)`) + `MatExpansionPanelHeader` + `MatPanelTitle` + `MatPanelDescription`. **Pitfall**: Disable expansion animations in tests/vis or ensure `provideAnimationsAsync()` works cleanly.
     - `rn-paper`: `List.Accordion` (from `react-native-paper`) or M3 `Surface`/`Pressable` expansion panels with `MagicIcon` (`expand_more`/`expand_less`) and `accessibilityState={{ expanded, disabled }}`. Note: `List.Accordion` in `react-native-paper` uses `MaterialCommunityIcon` internally if no custom `right` render prop is given — always pass `right={({ isExpanded }) => <MagicIcon icon={isExpanded ? 'expand_less' : 'expand_more'} />}` to avoid the stubbed `@expo/vector-icons` returning `null`!
     - `fl-mat`: Flutter `ExpansionPanelList` (supports single-expand `ExpansionPanelList.radio` and multi-expand `ExpansionPanelList`, plus `expansionCallback`) or `ExpansionTile` group. Note `ExpansionPanelList` requires unique `value` / stateful expansion tracking and works cleanly inside `SingleChildScrollView` or `Column`.

5. **`Avatar` (`MagicAvatar` & `MagicAvatarGroup`)**
   - **Contract** (`avatar.interface.ts`):
     - `AvatarStatus = 'online' | 'busy' | 'offline' | 'away'` (at minimum `'online' | 'busy' | 'offline'`)
     - `AvatarShape = 'circle' | 'rounded' | 'square'`
     - `AvatarMoleculeProps extends BaseMoleculeProps`: `src?: string`, `alt?: string`, `name?: string` (used to auto-compute initials fallback if `initials` omitted), `initials?: string`, `icon?: string`, `size?: AtomicSize`, `color?: ColorIntent`, `shape?: AvatarShape`, `status?: AvatarStatus`, `statusLabel?: string`.
     - `AvatarGroupItem`: `id?: string` + `Omit<AvatarMoleculeProps, 'size'>`
     - `AvatarGroupMoleculeProps extends BaseMoleculeProps`: `items: readonly AvatarGroupItem[]`, `max?: number`, `size?: AtomicSize`, `spacing?: 'tight' | 'normal'`.
   - **Cross-framework mapping**:
     - `react-mui`: MUI `Avatar` + `AvatarGroup` + status dot `Box` (or `MagicBadge`). **Pitfall**: In JSDOM unit tests and offline visual tests, `src="https://..."` never fires `onLoad` and may fail network; test image fallback (`onError` -> initials -> icon) AND use inline `data:image/svg+xml;utf8,...` URIs in Storybook stories (just like `card.stories.tsx:85-86`) so `storybook-addon-vis` captures crisp deterministic snapshots offline!
     - `ng-mat`: Custom M3 `MagicAvatarComponent` + `MagicAvatarGroupComponent` (Angular Material has no `MatAvatar`). Render `<img>` with `(error)` fallback to initials `<span>` or `<mat-icon>`, plus status indicator dot and overlapping `MagicAvatarGroupComponent` with `+N` overflow avatar.
     - `rn-paper`: `Avatar.Image`, `Avatar.Text`, `Avatar.Icon` (from `react-native-paper`) or custom `View`/`Image`/`Text`/`MagicIcon` with status dot and negative-margin `MagicAvatarGroup` stack (`zIndex` ordering + `+N` overflow). **Pitfall**: Check how `Avatar.Image` behaves in `react-native-web` + jsdom when `source={{ uri }}` errors; handling `onError` state fallback to `Avatar.Text` / `Avatar.Icon` ensures reliability.
     - `fl-mat`: `CircleAvatar` / clipped `Container` (for `circle`/`rounded`/`square`) + `Image.network` with `errorBuilder` fallback to initials `Text` or `MagicIcon` + `Positioned` status dot (`Stack`) + `MagicAvatarGroup` using `Stack` or overlapping `Row` with `+N` overflow chip/avatar.

### 2.2 Shared File Ownership & Parallel Worker Collision Matrix

If Track C spawns multiple parallel workers (e.g., 1 worker per molecule across all 5 packages, OR 1 worker per UI library), **these 10 shared files will cause merge/edit collisions unless strictly owned**:

| Shared File | Affected By | Safe Ownership Rule |
| --- | --- | --- |
| `libs/ui/atomic-design-interfaces/src/lib/molecules/index.ts` | All 5 molecules | **Single Integrator** (or Sequential Step 1 before parallel library workers) |
| `libs/ui/atomic-design-interfaces/src/lib/interfaces.spec.ts` | All 5 molecules | **Single Integrator** (Step 1) |
| `libs/ui/react-mui/src/lib/theme/mui-theme.tsx` | Potentially `Alert`, `Tabs`, `Avatar` (module overrides) | **Single Owner** (`react-mui` lead or Step 1 prep) |
| `libs/ui/react-mui/src/lib/molecules/index.ts` | All 5 molecules | **Single `react-mui` Integrator** (or final wire-up) |
| `libs/ui/ng-mat/src/lib/molecules/index.ts` | All 5 molecules | **Single `ng-mat` Integrator** |
| `libs/ui/rn-paper/src/lib/molecules/index.ts` | All 5 molecules | **Single `rn-paper` Integrator** |
| `libs/ui/fl-mat/lib/src/interfaces/atomic_interfaces.dart` | All 5 molecules | **Single `fl-mat` Contract Author** (or Step 1 alongside TS contracts) |
| `libs/ui/fl-mat/lib/src/core/magic_icon.dart` | Any new default icon names not in `magicIconMap` | **Single `fl-mat` Integrator** (or pre-seed missing icons in Step 1) |
| `libs/ui/fl-mat/lib/fl_mat.dart` | All 5 molecules | **Single `fl-mat` Integrator** |
| `libs/ui/fl-mat/lib/widgetbook.dart` & `libs/ui/fl-mat/test/widgetbook_test.dart` | All 5 molecules | **Single `fl-mat` Integrator** |

**Recommended Parallelization Topology for Track C (Zero File Collisions)**:
1. **Stage 1 (Sequential / 1 Worker — Contracts & Theme Prep)**:
   - Create all 5 interface files in `libs/ui/atomic-design-interfaces/src/lib/molecules/` (`dialog.interface.ts`, `alert.interface.ts`, `tabs.interface.ts`, `accordion.interface.ts`, `avatar.interface.ts`), update `molecules/index.ts` and `interfaces.spec.ts`.
   - Mirror all Wave 2 molecule enums/item classes in `libs/ui/fl-mat/lib/src/interfaces/atomic_interfaces.dart` and verify `magicIconMap` in `magic_icon.dart` has all needed icons.
   - Add any needed `@mui/material` theme overrides in `libs/ui/react-mui/src/lib/theme/mui-theme.tsx`.
   - Verify `pnpm nx run-many -t lint typecheck test -p atomic-design-interfaces`.
2. **Stage 2 (4 Parallel Workers — 1 Worker Per UI Library: `react-mui`, `ng-mat`, `rn-paper`, `fl-mat`)**:
   - Each worker owns **exclusively** one `libs/ui/<lib>/` directory!
   - Zero shared-file conflicts because all 5 molecules inside `react-mui` are owned by Worker `react-mui`, all 5 in `ng-mat` by Worker `ng-mat`, all 5 in `rn-paper` by Worker `rn-paper`, and all 5 in `fl-mat` by Worker `fl-mat`.
   - Each worker writes components + unit tests (`>=80%` coverage) + stories/use-cases + barrel updates in its own library and runs `lint`, `typecheck`, and `test -- --coverage` on its own library.
3. **Stage 3 (Sequential Visual Baseline Generation)**:
   - Run `pnpm nx test-storybook <project> -- -u` for `react-mui`, `ng-mat`, `rn-paper`, then verify `pnpm nx run-many -t test-storybook,build-storybook -p react-mui,ng-mat,rn-paper`.
   - Note: Stage 3 currently writes to `__vis__/local/` (which is gitignored per `.gitignore:37`) unless Phase 1.2 also updates `.gitignore`/`.storybook/main.ts` — keep `implementation_plan.md` line 239-242 commands exact (`pnpm nx test-storybook <project> -- -u`).

---

## 3. Caveats

1. **Flutter SDK Absent Locally**: `flutter` and `dart` are NOT installed in this container (`flutter: command not found`). Track C workers cannot execute `pnpm nx run-many -t lint test build-widgetbook -p fl-mat` locally unless Flutter SDK is provisioned in the environment or verified in CI (`setup-flutter` action). Any `fl-mat` Dart code written locally will be uncompiled until Flutter is available.
2. **Existing Stories Have No `__baselines__` Either**: Because `libs/ui/*/__vis__/` does not exist yet, running `pnpm nx test-storybook <project>` without `-- -u` will fail on existing Wave 1 atoms/molecules too, and running `pnpm nx test-storybook <project> -- -u` will generate baselines for **all** stories (Wave 1 + Wave 2) under `__vis__/local/`.
3. **Overlay Components (`Dialog`, `Toast`) in `storybook-addon-vis`**: `storybook-addon-vis` captures screenshots of the story render area (`#storybook-root` or page depending on setup). For `MagicDialog` and `MagicToast`, stories with `open: true` must ensure the dialog/toast is visible inside the viewport at initial render (without requiring a `play` click if the baseline should show the open state, or with a `play` function that leaves it open).
4. **`ng-mat` Missing Coverage Thresholds in `vite.config.mts`**: Unlike `react-mui` and `rn-paper`, `libs/ui/ng-mat/vite.config.mts:59-62` does not enforce `thresholds: { lines: 80, ... }` automatically; workers must inspect the V8 coverage table output manually (or Phase 1.3 updates it).
5. **Nx Cloud 400 Warning**: Remote cache upload returns HTTP 400 (`x-goog-iap-egress-jwt-assertion`), which is harmless noise; local task execution and exit codes remain valid.

---

## 4. Conclusion

Track C is ready to begin immediately in parallel with Track A and Track B. The optimal execution structure is:
1. **Stage 1 (1 worker)**: Author all 5 Wave 2 molecule contracts in `atomic-design-interfaces` + Dart contracts/icons in `fl-mat` + any MUI module overrides in `mui-theme.tsx`.
2. **Stage 2 (4 parallel `flash` / hydrogen workers, 1 per UI library)**: Implement all 5 molecules, `>=80%` unit tests, and stories/use-cases in `react-mui`, `ng-mat`, `rn-paper`, and `fl-mat` with **zero file overlap**.
3. **Stage 3**: Generate and verify Storybook visual baselines via `pnpm nx test-storybook <project> -- -u` using the pre-configured `/usr/bin/chromium` fallback, and flag `fl-mat` verification as blocked on local Flutter SDK installation unless Flutter is installed or verified via CI.

---

## 5. Verification Method

Run these read-only / test commands to independently verify this report and Track C deliverables:
1. **Verify JS/TS Contracts, Lint, Typecheck & Coverage**:
   ```bash
   pnpm nx run-many -t lint typecheck test -p atomic-design-interfaces,react-mui,ng-mat,rn-paper -- --coverage
   ```
2. **Verify Storybook Visual Baselines & Builds** (uses `/usr/bin/chromium` fallback in `vite.config.mts`):
   ```bash
   pnpm nx test-storybook react-mui -- -u
   pnpm nx test-storybook ng-mat -- -u
   pnpm nx test-storybook rn-paper -- -u
   pnpm nx run-many -t test-storybook build-storybook -p react-mui,ng-mat,rn-paper
   ```
3. **Verify Flutter (`fl-mat`)** (requires Flutter SDK `>=3.50.0` in `PATH` — currently absent in container):
   ```bash
   flutter --version
   pnpm nx run-many -t lint test build-widgetbook -p fl-mat
   ```
4. **Files to inspect for barrel/contract parity**:
   - `libs/ui/atomic-design-interfaces/src/lib/molecules/index.ts` & `src/lib/interfaces.spec.ts`
   - `libs/ui/{react-mui,ng-mat,rn-paper}/src/lib/molecules/index.ts`
   - `libs/ui/fl-mat/lib/src/interfaces/atomic_interfaces.dart`, `libs/ui/fl-mat/lib/fl_mat.dart`, `libs/ui/fl-mat/lib/widgetbook.dart`, `libs/ui/fl-mat/test/widgetbook_test.dart`
