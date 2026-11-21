# Survey Explorer 3 Handoff: `fl-mat` & Flutter 3.50 / Widgetbook 3.25 Environment

> **Executive Summary**: `libs/ui/fl-mat` is currently a minimal Flutter 3.50 / Dart 3.14 package containing 3 components (`MagicButton`, legacy composite `MagicTextInput`, `MagicSearchBar`), a bare-bones `lib/widgetbook.dart` with zero knobs/addons, and 5 widget tests. Although Flutter is not preinstalled in the VM, `storage.googleapis.com`, `pub.dev`, and `github.com` are all reachable (HTTP 200) with 18 GB free disk space in `/home/antigravity` and `tar`/`xz`/`curl` present, so installing Flutter `3.50.0` into `~/flutter` during execution is fully feasible. Crucially, Flutter `3.50.0` formally `@Deprecated` `package:flutter/material.dart` (explaining `deprecated_member_use: ignore` in `analysis_options.yaml`), and `widgetbook 3.25.0` deprecated `DeviceFrameAddon`, `AccessibilityAddon`, `TextScaleAddon.scales`, and `knobs.list`—all exact non-deprecated replacement APIs are verified below.

---

## 1. Observation

### 1.1 Current `libs/ui/fl-mat` File Inventory & Configuration

Files currently present under `/home/antigravity/sukrutsathaye/mono-magic/libs/ui/fl-mat`:
- **Package/Tooling**:
  - `pubspec.yaml` (lines 1–56): `name: fl_mat`, `environment: { sdk: ^3.14.0, flutter: ">=1.17.0" }`, `dependencies: { flutter: { sdk: flutter }, widgetbook: ^3.25.0 }`, `dev_dependencies: { flutter_test: { sdk: flutter }, flutter_lints: ^6.0.0 }`.
  - `.gitignore` (lines 25–33): ignores `/pubspec.lock` (Dart library convention), `**/doc/api/`, `.dart_tool/`, `/build/`, `/coverage/`, `.widget_preview/`. No `pubspec.lock` is committed.
  - `analysis_options.yaml` (lines 1–17):
    ```yaml
    include: package:flutter_lints/flutter.yaml
    analyzer:
      errors:
        deprecated_member_use: ignore
      exclude:
        - build/**
        - android/**
        - ios/**
        - web/**
        - windows/**
        - macos/**
        - linux/**
    ```
  - `flutter_lints 6.0.0` (`lib/flutter.yaml`, verified directly from pub.dev archive): includes `package:lints/recommended.yaml` plus `avoid_print`, `avoid_unnecessary_containers`, `avoid_web_libraries_in_flutter`, `no_logic_in_create_state`, `prefer_const_constructors_in_immutables`, `sized_box_for_whitespace`, `sort_child_properties_last`, `use_build_context_synchronously`, `use_full_hex_values_for_flutter_colors`, `use_key_in_widget_constructors`.
  - `README.md` (lines 1–40): default Flutter package boilerplate with `TODO:` placeholders.
  - `web/index.html` (lines 1–24): uses `<base href="$FLUTTER_BASE_HREF">` and `<script src="flutter_bootstrap.js" async></script>`.
- **Source (`lib/`)**:
  - `lib/fl_mat.dart` (lines 1–9): barrel exporting `atomic_interfaces.dart`, `magic_button.dart`, `magic_text_input.dart`, `magic_search_bar.dart`, `organisms.dart`, `templates.dart`.
  - `lib/src/interfaces/atomic_interfaces.dart` (lines 1–119): defines `AtomicTier`, `AtomicSize`, `ColorIntent`, `ButtonVariant`, `TextInputVariant`, `BaseAtomicProps`, `MagicButtonProps`, legacy `MagicTextInputProps` (with `label`/`helperText`/`errorText`/`variant`), `MagicSearchBarProps`.
  - `lib/src/atoms/button/magic_button.dart` (lines 1–123): supports `ButtonVariant` (`filled`, `tonal`, `outlined`, `elevated`, `text`), `ColorIntent`, `AtomicSize`, `disabled`, `loading`, `fullWidth`, `leadingIcon` (`IconData?`), `testId`, `ariaLabel`, `onPressed`. Uses `WidgetStatePropertyAll`. Hardcodes `success` (`0xFF2E7D32`) & `warning` (`0xFFED6C02`) rather than a `ThemeExtension`. Missing `kind`, `shape`, `trailingIcon`, `disabledInteractive`, `disableRipple`, `loadingLabel`, `child`, string icon support.
  - `lib/src/atoms/text_input/magic_text_input.dart` (lines 1–98): legacy composite widget requiring `label` and owning `helperText`/`errorText`/`variant` via `InputDecoration` directly on `TextField`. Must be refactored into bare control (`TextInputControlProps`) consuming `MagicFormFieldScope`.
  - `lib/src/molecules/search_bar/magic_search_bar.dart` (lines 1–117): composes `MagicTextInput` + `MagicButton` in a `Row`. Must be updated to compose `MagicFormField` + bare `MagicTextInput` + `MagicButton`.
  - `lib/src/organisms/organisms.dart` & `lib/src/templates/templates.dart`: empty placeholder libraries.
  - `lib/widgetbook.dart` (lines 1–127): `Widgetbook.material(directories: [...])` with 3 components (`MagicButton`, `MagicTextInput`, `MagicSearchBar`), zero `addons`, zero `context.knobs.*`, and monolithic single-file use cases.
- **Tests (`test/`)**:
  - `test/fl_mat_test.dart` (lines 1–125): 5 `testWidgets` cases (2 for `MagicButton`, 2 for legacy `MagicTextInput`, 1 for `MagicSearchBar`).

### 1.2 Nx Project Configuration & CI Workflows

- **`pnpm exec nx show project fl-mat --json`** (verified output):
  - `name`: `"fl-mat"`, `root`: `"libs/ui/fl-mat"`, `sourceRoot`: `"libs/ui/fl-mat/lib"`, `projectType`: `"library"`, `tags`: `["scope:ui", "framework:flutter", "ds:material"]`.
  - Targets (all `executor: "nx:run-commands"`, `cwd: "libs/ui/fl-mat"`):
    - `lint`: `flutter analyze`
    - `test`: `flutter test` (`cache: true`, `dependsOn: ["^build"]`)
    - `widgetbook`: `flutter run -d chrome -t lib/widgetbook.dart`
    - `build-widgetbook`: `flutter build web --release -t lib/widgetbook.dart` (`outputs: ["{projectRoot}/build/web"]`)
  - Note: There is NO `build` target on `fl-mat` (only `lint`, `test`, `widgetbook`, `build-widgetbook`).
- **`.github/actions/setup-flutter/action.yml`** (lines 1–31):
  - Installs Flutter `3.50.0` (`channel: 'stable'`) via `subosito/flutter-action@v2` with `cache: true`.
  - Loops over all `pubspec.yaml` under `apps`/`libs` (maxdepth 4) and runs `flutter pub get`.
- **`.github/workflows/ci.yml`** (lines 1–29):
  - Triggers on `push` to `main` and `pull_request`.
  - Runs `setup-pnpm`, `setup-flutter`, `pnpm nx-cloud start-workers`, then `pnpm nx affected -t lint test build` (for `fl-mat`, runs `fl-mat:lint` -> `flutter analyze` and `fl-mat:test` -> `flutter test`).
- **`.github/workflows/storybook-gh-pages.yml`** (lines 1–90) & **`tools/ci/storybook-pages.mjs`** (lines 87–195):
  - `node tools/ci/storybook-pages.mjs discover` detects `fl-mat` automatically (`pubspec.yaml` + `lib/widgetbook.dart` + `build-widgetbook` target), returning:
    `{ "name": "fl-mat", "type": "widgetbook", "outputDir": "libs/ui/fl-mat/build/web", "hasCiConfig": false }`.
  - In `storybook-gh-pages.yml` (runs on push to `main` / `workflow_dispatch`), builds `fl-mat` via:
    `pnpm exec nx run fl-mat:build-widgetbook --args=--base-href=/<base>/fl-mat/`
    and verifies `libs/ui/fl-mat/build/web/index.html` exists.
  - **Important**: Do NOT rename `lib/widgetbook.dart`, `build-widgetbook` target, or change its output path from `libs/ui/fl-mat/build/web` — `storybook-pages.mjs` relies on those exact paths/names.

### 1.3 VM SDK Availability & Network Reachability

Verified directly via shell checks:
- **Installed SDKs**: `flutter: NOT FOUND`, `dart: NOT FOUND` (`PATH=/tmp/exebox-escape-...:/opt/antigravity/bin:/usr/local/sbin:...`; `/home/antigravity` and `/opt` contain no Flutter installation).
- **OS / Arch / Disk**: `Linux x86_64`, `/home/antigravity` has **18G available** (`20G` total, `2.2G` used, 11%).
- **VM Archive/CLI Tools**: `/usr/bin/tar`, `/usr/bin/xz`, `/usr/bin/unzip`, `/usr/bin/git`, `/usr/bin/curl`, `/usr/bin/jq` are all present. `lcov`/`genhtml` are NOT installed (use Node/awk to compute coverage from `coverage/lcov.info`).
- **Network Reachability (all HTTP 200)**:
  - `https://storage.googleapis.com/flutter_infra_release/releases/releases_linux.json` → **HTTP/2 200**
  - `https://github.com/flutter/flutter` → **HTTP/2 200**
  - `https://pub.dev/api/packages/widgetbook` → **HTTP/2 200**
- **Exact Flutter `3.50.0` Official Archive** (verified from `releases_linux.json`):
  - Version: `3.50.0` (channel `stable`, released `2026-11-11`), bundled Dart SDK: `3.14.0` (matches `pubspec.yaml` `sdk: ^3.14.0` and CI default `'3.50.0'`).
  - Archive URL: `https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.50.0-stable.tar.xz`
  - (Latest stable on feed is `3.50.1`, also Dart `3.14.0`, but install **`3.50.0`** to match `.github/actions/setup-flutter/action.yml` exactly.)

### 1.4 Exact `widgetbook 3.25.0` APIs (Extracted from pub.dev `widgetbook-3.25.0.tar.gz`)

`widgetbook: ^3.25.0` resolves to **`widgetbook 3.25.0`** (requires `sdk: >=3.10.0 <4.0.0`, `flutter: >=3.44.0`; `4.0.0-beta.x` is excluded by `^3.25.0`).

#### Widgetbook App & Directories
- `Widgetbook.material({ super.key, this.initialRoute = '/', required this.directories, this.appBuilder = materialAppBuilder, this.addons, this.integrations, this.lightTheme, this.darkTheme, this.themeMode, this.home = const DefaultHomePage(), this.header, this.headerPadding, this.scrollBehavior, this.enableLeafComponents = true })`
- Nodes: `WidgetbookCategory(name:, children:)`, `WidgetbookFolder(name:, children:)`, `WidgetbookComponent(name:, useCases:)`, `WidgetbookUseCase(name:, builder: (context) => ...)`

#### Addons — Exact Signatures & Deprecations in `3.25.0`
| Addon | Status in `3.25.0` | Exact Constructor / Notes |
| --- | --- | --- |
| `MaterialThemeAddon` | **Active (use)** | `MaterialThemeAddon({ required List<WidgetbookTheme<ThemeData>> themes, WidgetbookTheme<ThemeData>? initialTheme })` with `WidgetbookTheme<ThemeData>(name: '...', data: ThemeData)` |
| `ViewportAddon` | **Active (use)** | `ViewportAddon(List<ViewportData> viewports)` — **positional** parameter! Always include `Viewports.none` first so default is unconstrained, e.g. `ViewportAddon([Viewports.none, IosViewports.iPhone13, IosViewports.iPad, AndroidViewports.samsungGalaxyS20, MacosViewports.desktop])` (or `Viewports.all`). Available sets: `Viewports.none`, `Viewports.all`, `IosViewports.{all,phones,tablets,iPhoneSE,iPhone12Mini,iPhone12,iPhone12ProMax,iPhone13Mini,iPhone13,iPhone13ProMax,iPadAir4,iPad,iPadPro11Inches,iPad12InchesGen2,iPad12InchesGen4}`, `AndroidViewports.{all,phones,tablets,samsungGalaxyA50,samsungGalaxyS20,samsungGalaxyNote20,samsungGalaxyNote20Ultra,onePlus8Pro,sonyXperia1II,smallTablet,mediumTablet,largeTablet}`, `MacosViewports.{all,desktop,macbookPro}`, `WindowsViewports.*`, `LinuxViewports.*`. |
| `DeviceFrameAddon` | **DEPRECATED** | `@Deprecated('The [DeviceFrameAddon] is deprecated and will be removed in a future version. Please use the [ViewportAddon] instead.')` — **DO NOT USE**. |
| `TextScaleAddon` | **Active (use with `min`/`max`)** | `TextScaleAddon({ this.initialScale, this.min = 0.5, this.max = 2.0, this.divisions = 6 })`. **`scales` parameter is `@Deprecated('Use TextScaleAddon.min and TextScaleAddon.max instead')`** — **DO NOT pass `scales:`**! |
| `AlignmentAddon` | **Active (use)** | `AlignmentAddon({ this.initialAlignment = Alignment.center })` — wraps use case in `Align`. |
| `InspectorAddon` | **Active (use)** | `InspectorAddon({ this.enabled = false })` — toggles `inspector` overlay. |
| `AccessibilityAddon` | **DEPRECATED** | `@Deprecated('Please use the accessibility_tools package directly with a BuilderAddon.')` — **DO NOT USE** (avoid adding extra deps unless needed; `SemanticsAddon` also exists in `lib/src/addons/semantics_addon/` if desired). |

#### Knobs (`context.knobs.*`) — Exact Signatures & Deprecations in `3.25.0`
- `context.knobs.string({ required String label, String? description, String initialValue = '', int? maxLines = 1 })` (and `stringOrNull(...)` with `bool defaultToNull = false`)
- `context.knobs.boolean({ required String label, String? description, bool initialValue = false })` (and `booleanOrNull(...)`)
- `context.knobs.object.dropdown<T>({ required String label, required List<T> options, T? initialOption, String? description, String Function(T)? labelBuilder })` (and `context.knobs.objectOrNull.dropdown<T>(...)`)
- `context.knobs.object.segmented<T>({ required String label, required List<T> options, T? initialOption, String? description, String Function(T)? labelBuilder })` (and `objectOrNull.segmented<T>(...)`)
- `context.knobs.double.slider({ required String label, String? description, double initialValue = 0, double min = 0, double max = 20, int? divisions, int? precision = 1 })` (and `.input(...)`, `doubleOrNull.slider(...)`)
- `context.knobs.int.slider({ required String label, String? description, int initialValue = 0, int min = 0, int max = 20, int? divisions })` (and `.input(...)`, `intOrNull.slider(...)`)
- `context.knobs.color({ required String label, Color initialValue = Colors.white, ColorSpace initialColorSpace = ColorSpace.hex, String? description })`
- `context.knobs.duration(...)`, `context.knobs.dateTime(...)`, `context.knobs.iterable.*`
- **DEPRECATED — DO NOT USE**: `context.knobs.list(...)` and `context.knobs.listOrNull(...)` (`@Deprecated('Use knobs.object.dropdown instead.')`).

### 1.5 Exact Flutter `3.50.0` Material 3 APIs & Deprecation Pitfalls (Verified Directly Against `flutter/flutter` Tag `3.50.0`)

1. **`package:flutter/material.dart` Library Deprecation (MAJOR Flutter 3.50.0 Change!)**:
   - In `packages/flutter/lib/material.dart` (lines 17–19 of tag `3.50.0`):
     ```dart
     @Deprecated(
       'Use package:material_ui/material_ui.dart instead. '
       'This feature was deprecated after v3.47.0-0.0.pre.',
     )
     library material;
     ```
   - Every `import 'package:flutter/material.dart';` triggers `deprecated_member_use` on Flutter 3.50.0.
   - **Why `libs/ui/fl-mat/analysis_options.yaml` line 5 has `deprecated_member_use: ignore`**: It suppresses this exact SDK-level warning so `fl-mat` (and `widgetbook` which also relies on `package:flutter/material.dart`) passes `flutter analyze` cleanly without changing `pubspec.yaml` to `material_ui`. **Do NOT remove `deprecated_member_use: ignore` from `analysis_options.yaml`**, while still strictly avoiding deprecated widget-level APIs below!
2. **`Radio` & `RadioGroup<T>`** (`src/widgets/radio_group.dart:57-77`, `src/material/radio.dart:96-110`):
   - `Radio.groupValue` and `Radio.onChanged` are `@Deprecated('Use a RadioGroup ancestor... deprecated after v3.32.0-0.0.pre.')`.
   - **Use**:
     ```dart
     RadioGroup<T>(
       groupValue: selectedValue,
       onChanged: (T? next) { ... },
       child: ..., // contains Radio<T>(value: opt.value, enabled: !isDisabled)
     )
     ```
   - Note: `RadioGroup.onChanged` is **required** (non-nullable `ValueChanged<T?>`). To disable the whole group or individual options, pass `enabled: false` on each `Radio<T>` (verified `this.enabled` param in `src/material/radio.dart:118`) and guard inside `onChanged` when disabled.
3. **`Switch`** (`src/material/switch.dart:110-172`):
   - `Switch.activeColor` is `@Deprecated('Use activeThumbColor instead. deprecated after v3.31.0-2.0.pre.')`.
   - **Use**: `activeThumbColor`, `activeTrackColor`, `thumbColor: WidgetStateProperty.resolveWith(...)`, `trackColor: WidgetStateProperty.resolveWith(...)`, and `thumbIcon: WidgetStateProperty.resolveWith<Icon?>((states) => states.contains(WidgetState.selected) ? const Icon(Icons.check) : const Icon(Icons.close))` (or `null` when `hideIcon: true`).
4. **`Color.withValues(alpha: ...)` & `WidgetStateProperty`**:
   - Never use `Color.withOpacity(...)` (deprecated in Flutter 3.27+); use `color.withValues(alpha: 0.12)`.
   - Never use `MaterialState` / `MaterialStateProperty` / `MaterialStatePropertyAll`; use `WidgetState` / `WidgetStateProperty` / `WidgetStatePropertyAll`.
5. **`Slider` & `RangeSlider`** (`src/material/slider.dart:193-195`, `src/material/range_slider.dart:170-172`, `src/material/slider_theme.dart:123-137`):
   - `year2023` parameter on `Slider` / `RangeSlider` is `@Deprecated` — do NOT pass `year2023:`.
   - `ShowValueIndicator.always` is `@Deprecated('Use ShowValueIndicator.onDrag.')` — use `ShowValueIndicator.onDrag` (for discrete/value-label display), `ShowValueIndicator.onlyForDiscrete`, or `ShowValueIndicator.never`.
   - For `showTickMarks`, configure `SliderThemeData(tickMarkShape: showTickMarks ? const RoundSliderTickMarkShape() : SliderTickMarkShape.noTickMark)` alongside `divisions`.
6. **`LinearProgressIndicator` & `CircularProgressIndicator`** (`src/material/progress_indicator.dart:431,880`):
   - `year2023` parameter is `@Deprecated` — do NOT pass `year2023:`.
   - Use `value: null` for `indeterminate`, `value: (v / 100).clamp(0.0, 1.0)` for `determinate` (remember `atomic-design-interfaces` passes `0..100` percentage in `ng-mat`—normalize cleanly if `value > 1` or standardize on `0..100` matching `ng-mat`, and document clearly in Dartdoc!). For `buffer` mode, layer a secondary `LinearProgressIndicator` or custom buffered track showing `bufferValue`.
7. **`Tooltip`** (`src/material/tooltip.dart:114-116`):
   - `Tooltip.height` is `@Deprecated('Use Tooltip.constraints instead. deprecated after v3.30.0-0.1.pre.')`.
   - Use `constraints:`, `waitDuration: Duration(milliseconds: showDelay)`, `showDuration: Duration(milliseconds: hideDelay)`, `preferBelow: position == ToolTipPosition.below`, `triggerMode: disabled ? TooltipTriggerMode.manual : null` (or return `child` unwrapped when `disabled || message.isEmpty`).
8. **`SegmentedButton<T>`** (`src/material/segmented_button.dart:134-149`):
   - Supports **`direction: vertical ? Axis.vertical : Axis.horizontal`** natively in Flutter 3.50!
   - **Critical constructor assertions**:
     - `assert(segments.length > 0)` → guard empty `options` before rendering `SegmentedButton`.
     - `assert(selected.length > 0 || emptySelectionAllowed)` → pass `emptySelectionAllowed: true` so unselected/empty initial state never crashes!
     - `assert(selected.length < 2 || multiSelectionEnabled)` → clamp single-select set to at most 1 element when `selectionMode == ButtonToggleSelectionMode.single`.
9. **`MenuAnchor` / `SubmenuButton` / `MenuItemButton`** (`src/material/menu_anchor.dart:247-259,934,1754`):
   - `MenuAnchor.anchorTapClosesMenu` is `@Deprecated('Use consumeOutsideTap instead.')` — do NOT pass `anchorTapClosesMenu`.
   - Supports nested submenus cleanly via recursive `SubmenuButton(menuChildren: [...])` and leaf `MenuItemButton(leadingIcon:, onPressed:, child:)`.
   - `MenuAnchor(builder: (context, controller, child) => MagicButton(..., onPressed: () => controller.isOpen ? controller.close() : controller.open()), menuChildren: [...])`.
10. **`Card`** (`src/material/card.dart:80,102,130`):
    - Has `Card(...)` (elevated/raised), `Card.filled(...)`, and `Card.outlined(...)` constructors with zero deprecations.
11. **`Badge`** (`src/material/badge.dart:45-58`):
    - `Badge(backgroundColor:, textColor:, smallSize:, largeSize:, alignment:, offset:, label:, isLabelVisible:, child:)` — clean M3 API, zero deprecations.
12. **`Chip` / `FilterChip` / `InputChip`** (`src/material/chip.dart`, `filter_chip.dart`, `input_chip.dart`):
    - Zero deprecations on standard M3 constructors (`Chip`, `FilterChip`, `InputChip`, `ActionChip`).
13. **`DropdownButtonFormField` / `InputDecoration`** (`src/material/dropdown.dart:1803`, `src/material/input_decorator.dart:2800`):
    - `DropdownButtonFormField.value` is `@Deprecated('Use initialValue instead.')`. (Even better: `MagicSelect` should use `MagicFormField` + `MenuAnchor` or modal sheet so it natively supports single + `multiple` selection, `optionGroups` headers, and `customTriggerSummary` in one cohesive widget.)
    - `InputDecoration.maintainHintHeight` is deprecated → use `maintainHintSize` if needed.

### 1.6 `ng-mat` 7-Palette Theme Parity & Dart Contract Mapping

From `libs/ui/ng-mat/src/theme/_palettes.scss` (lines 15–23), `_tokens.scss` (lines 7–85), and `.storybook/preview.ts` (lines 62–70):
- **7 Material 3 Palettes** to expose in `lib/src/theme/magic_theme.dart`:
  1. `azureBlue` (`'azure-blue'`, Light, primary: azure `#005CBB`, tertiary: blue) — **default**
  2. `lightTheme` (`'light-theme'`, Light, primary: violet `#6750A4`, tertiary: orange)
  3. `darkTheme` (`'dark-theme'`, Dark, primary: green `#2E7D32`, tertiary: orange)
  4. `roseRed` (`'rose-red'`, Light, primary: rose `#BA005C`, tertiary: red)
  5. `cyanOrange` (`'cyan-orange'`, Dark, primary: cyan `#006A6A`, tertiary: orange)
  6. `orangeRed` (`'orange-red'`, Light, primary: orange `#964900`, tertiary: red)
  7. `magentaViolet` (`'magenta-violet'`, Dark, primary: magenta `#A80088`, tertiary: violet)
- **Semantic Tokens (`MagicSemanticColors extends ThemeExtension<MagicSemanticColors>`)** matching `_tokens.scss`:
  - Light: `success: Color(0xFF1B6E3A)`, `onSuccess: Color(0xFFFFFFFF)`, `successContainer: Color(0xFFA0F5B4)`, `onSuccessContainer: Color(0xFF00210C)`, `warning: Color(0xFF8A5100)`, `onWarning: Color(0xFFFFFFFF)`, `warningContainer: Color(0xFFFFDCBD)`, `onWarningContainer: Color(0xFF2D1600)`
  - Dark: `success: Color(0xFF7FDC99)`, `onSuccess: Color(0xFF00391A)`, `successContainer: Color(0xFF00522A)`, `onSuccessContainer: Color(0xFFA0F5B4)`, `warning: Color(0xFFFFB870)`, `onWarning: Color(0xFF4A2800)`, `warningContainer: Color(0xFF693C00)`, `onWarningContainer: Color(0xFFFFDCBD)`
- **Size Metrics (`AtomicSize`)** matching `_tokens.scss`:
  - `xs`: height 28, font 12, icon 16, hPadding 12
  - `sm`: height 32, font 13, icon 18, hPadding 14
  - `md`: height 40, font 14, icon 18, hPadding 24
  - `lg`: height 48, font 16, icon 22, hPadding 28
  - `xl`: height 56, font 18, icon 24, hPadding 32
- **Shape Radii (`ButtonShape`)**: `square` (0), `rounded` (8), `pill` (999), `standard` (design-system default; avoid Dart keyword `default` as enum value!).
- **Dart Keyword Collisions from `atomic-design-interfaces`**:
  - `default` (in `ButtonKind` & `ButtonShape`) is a reserved Dart keyword → use `ButtonKind.standard` (or `ButtonKind.normal`) and `ButtonShape.standard` (or `ButtonShape.system`).
  - `required` (in `TextInputControlProps`, `CheckBoxAtomProps`, `RadioButtonAtomProps`, `SlideToggleAtomProps`, `ButtonToggleAtomProps`, `SelectMoleculeProps`) is a contextual Dart keyword → keep `requiredField` (consistent with existing `magic_text_input.dart:16`).
  - `switch` is not used, `class` is not used.

---

## 2. Logic Chain

1. **SDK Install Feasibility**: Observation 1.3 proves `storage.googleapis.com`, `pub.dev`, and `github.com` all return HTTP 200, `tar`/`xz`/`curl` are installed, and `/home/antigravity` has 18 GB free. Therefore, during execution of `ui/fl-mat-setup`, downloading and extracting `flutter_linux_3.50.0-stable.tar.xz` into `~/flutter` (~1.2 GB extracted) is completely feasible, allowing full local execution of `flutter analyze`, `flutter test --coverage`, and `flutter build web --release -t lib/widgetbook.dart` before pushing.
2. **Analyzer Zero-Warning Strategy**: Observation 1.5 shows Flutter `3.50.0` marks `library material` (`package:flutter/material.dart`) as `@Deprecated`. Because `fl-mat` and `widgetbook 3.25.0` both use `package:flutter/material.dart`, keeping `deprecated_member_use: ignore` in `libs/ui/fl-mat/analysis_options.yaml` (Observation 1.1) is mandatory unless migrating to `material_ui`. However, adhering strictly to all non-deprecated Flutter 3.50 widget APIs (`RadioGroup`, `Color.withValues`, `WidgetStateProperty`, `Switch.activeThumbColor`, `ShowValueIndicator.onDrag`, `Tooltip.constraints`, `SegmentedButton.direction`) and non-deprecated `widgetbook 3.25.0` APIs (`ViewportAddon`, `TextScaleAddon(min:, max:)`, `knobs.object.dropdown`) ensures future-proof, idiomatic Flutter 3.50 code with zero lints under `flutter_lints: ^6.0.0`.
3. **Widgetbook CI & Pages Compatibility**: Observation 1.2 shows `tools/ci/storybook-pages.mjs` discovers `fl-mat` by checking `libs/ui/fl-mat/pubspec.yaml`, `libs/ui/fl-mat/lib/widgetbook.dart`, and the `build-widgetbook` Nx target outputting to `libs/ui/fl-mat/build/web`. Keeping `lib/widgetbook.dart` as the entrypoint (importing modular files from `lib/widgetbook/atoms/*.dart` and `lib/widgetbook/molecules/*.dart`) preserves 100% compatibility with both `ci.yml` and `storybook-gh-pages.yml`.
4. **Atomic Separation**: Observation 1.1 confirms `MagicTextInput` currently bundles `label`/`helperText`/`errorText`/`variant` directly into `TextField`. Refactoring `MagicTextInput` into a bare control reading `MagicFormFieldScope.maybeOf(context)` and introducing `MagicFormField` + updating `MagicSearchBar` delivers exact `ng-mat` parity.

---

## 3. Caveats

- **Read-Only Survey**: Flutter `3.50.0` was NOT downloaded or executed during this survey (per read-only explorer constraint); all API signatures were verified directly from the upstream `widgetbook 3.25.0` tarball on `pub.dev` and the official `flutter/flutter` `3.50.0` GitHub tag.
- **`lcov` CLI Not Installed**: `flutter test --coverage` generates `libs/ui/fl-mat/coverage/lcov.info` natively without needing the `lcov` binary, but summarizing line coverage % locally requires a small Node/awk one-liner (provided in Section 5) instead of `lcov --summary`.
- **Material Icons in Widget Tests / Web**: Flutter Material `Icons.*` work natively in Flutter web and widget tests without external CDN links. Any `String` icon name resolver in `MagicIcon` (`lib/src/core/magic_icon.dart`) should map common Material icon strings (e.g., `'search'`, `'add'`, `'close'`, `'check'`, `'home'`, `'settings'`, `'favorite'`, `'delete'`, `'edit'`, `'share'`, `'star'`, `'info'`, `'warning'`, `'error'`, `'notifications'`, `'more_vert'`, `'arrow_forward'`, `'arrow_back'`, `'chevron_right'`, `'expand_more'`, `'menu'`, `'person'`, `'email'`, `'lock'`, `'visibility'`, `'visibility_off'`, `'send'`, `'download'`, `'upload'`, `'refresh'`, `'filter_list'`, `'sort'`, `'drag_indicator'`, `'shopping_cart'`, `'bookmark'`, `'calendar_today'`, `'schedule'`, `'location_on'`, `'phone'`, `'link'`, `'copy'`, `'folder'`, `'description'`, `'cloud'`, `'bolt'`, `'palette'`, `'dark_mode'`, `'light_mode'`, etc.) to `const IconData` constants so tree-shaking (`flutter build web --release`) succeeds cleanly (never construct dynamic `IconData(codePoint)` at runtime because `flutter build web --release` runs `--tree-shake-icons` and fails on non-constant `IconData`!).

---

## 4. Conclusion

The `fl-mat` track (`ui/fl-mat-setup` in worktree `/home/antigravity/sukrutsathaye/wt-fl-mat`) is ready for full local implementation and verification:

1. **Install Flutter `3.50.0` once into `~/flutter`** (shared across runs, outside git repos) and prepend `~/flutter/bin` to `PATH` when running `fl-mat` commands.
2. **Preserve `analysis_options.yaml` (`deprecated_member_use: ignore`)** due to Flutter 3.50's library-level deprecation of `package:flutter/material.dart`, and preserve `project.json` target names + `lib/widgetbook.dart` entrypoint for `storybook-pages.mjs` compatibility.
3. **Use ONLY non-deprecated Widgetbook `3.25.0` APIs**:
   - Addons: `MaterialThemeAddon` (all 7 `MagicTheme` palettes), `ViewportAddon([Viewports.none, ...])`, `TextScaleAddon(min: 0.75, max: 2.0, initialScale: 1.0)`, `AlignmentAddon()`, `InspectorAddon()`.
   - Knobs: `context.knobs.string`, `boolean`, `object.dropdown`, `object.segmented`, `double.slider`, `int.slider`, `color`.
   - Avoid: `DeviceFrameAddon`, `AccessibilityAddon`, `TextScaleAddon(scales:)`, `knobs.list`.
4. **Use ONLY non-deprecated Flutter `3.50.0` Material 3 APIs**:
   - `RadioGroup<T>` + `Radio<T>(value:, enabled:)` (never `Radio.groupValue`/`Radio.onChanged`).
   - `Switch` with `activeThumbColor`/`thumbColor`/`trackColor`/`thumbIcon` (`WidgetStateProperty`) — never `Switch.activeColor`.
   - `Color.withValues(alpha: ...)` — never `withOpacity`.
   - `WidgetState` / `WidgetStateProperty` — never `MaterialState*`.
   - `Slider` / `RangeSlider` with `ShowValueIndicator.onDrag` — never `year2023` or `ShowValueIndicator.always`.
   - `LinearProgressIndicator` / `CircularProgressIndicator` — never `year2023`.
   - `Tooltip` with `constraints:` — never `Tooltip.height`.
   - `SegmentedButton` with `direction:` + `emptySelectionAllowed: true` + non-empty `segments` guard.
   - `MenuAnchor` (`consumeOutsideTap`, never `anchorTapClosesMenu`) + `SubmenuButton` + `MenuItemButton`.
   - Constant `Icons.*` map in `MagicIcon` (never non-const `IconData(...)` to keep `--tree-shake-icons` happy during `flutter build web --release`).
5. **Follow Dart/Flutter lint & doc standards**: `flutter_lints: ^6.0.0` clean (`prefer_const_constructors_in_immutables`, `sort_child_properties_last`, `use_key_in_widget_constructors`, `use_full_hex_values_for_flutter_colors`, `sized_box_for_whitespace`), full `///` Dartdoc on all public APIs, and `>= 80%` line coverage verified from `coverage/lcov.info`.

---

## 5. Verification Method

### A. One-Time Flutter `3.50.0` Installation into `~/flutter` (During Execution)
```bash
mkdir -p ~/flutter
curl -fSL https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.50.0-stable.tar.xz \
  | tar -xJf - -C ~
export PATH="$HOME/flutter/bin:$PATH"
flutter --version   # Expect Flutter 3.50.0, Dart 3.14.0
flutter config --no-analytics --enable-web
```

### B. Dependency Resolution, Lint, Tests, Coverage (`>= 80%`), and Widgetbook Web Build
```bash
export PATH="$HOME/flutter/bin:$PATH"
# 1. Resolve packages in the fl-mat worktree
(cd /home/antigravity/sukrutsathaye/wt-fl-mat/libs/ui/fl-mat && flutter pub get)

# 2. Static analysis (must exit 0 with zero errors/warnings/infos)
pnpm exec nx run fl-mat:lint

# 3. Widget & unit tests with coverage
(cd /home/antigravity/sukrutsathaye/wt-fl-mat/libs/ui/fl-mat && flutter test --coverage)

# 4. Compute line coverage percentage from coverage/lcov.info (must be >= 80%)
node -e '
const fs = require("fs");
const lcov = fs.readFileSync("libs/ui/fl-mat/coverage/lcov.info", "utf8");
let lf = 0, lh = 0;
for (const line of lcov.split("\n")) {
  if (line.startsWith("LF:")) lf += Number(line.slice(3));
  if (line.startsWith("LH:")) lh += Number(line.slice(3));
}
const pct = lf ? ((lh / lf) * 100).toFixed(2) : "0.00";
console.log(`Line coverage: ${lh}/${lf} (${pct}%)`);
if (Number(pct) < 80) process.exit(1);
'

# 5. Production Widgetbook web build (also validates --tree-shake-icons!)
pnpm exec nx run fl-mat:build-widgetbook

# 6. Verify GitHub Pages showcase discovery
node tools/ci/storybook-pages.mjs discover
```

### C. Invalidation Conditions
- If `storage.googleapis.com` or `pub.dev` becomes unreachable later, fall back to static review + GitHub Actions CI (`ci.yml` runs `fl-mat:lint` and `fl-mat:test` automatically on PR #3).
- If `libs/ui/fl-mat/analysis_options.yaml` removes `deprecated_member_use: ignore` while still importing `package:flutter/material.dart`, `flutter analyze` will fail on Flutter `3.50.0`.
