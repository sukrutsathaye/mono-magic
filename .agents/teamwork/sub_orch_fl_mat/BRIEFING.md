# Briefing — Milestone M3 (`libs/ui/fl-mat` -> `ui/fl-mat-setup` -> PR #3)

## Authoritative References
- **Original Request**: `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/ORIGINAL_REQUEST.md`
- **Implementation Plan**: `/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/b39c754e-2c2f-442d-b476-7fed0f448c4f/implementation_plan.md`
- **Project Contracts**: `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/PROJECT.md`
- **Baseline Survey**: `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/explorer_survey_baseline/handoff.md`
- **Flutter 3.50 & Widgetbook 3.25 Survey**: `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/explorer_survey_flutter/handoff.md`

## Isolated Environment
- **Worktree**: `/home/antigravity/sukrutsathaye/wt-fl-mat`
- **Branch**: `ui/fl-mat-setup` (branched off `main`)
- **Flutter SDK**: `3.50.0` (Dart `3.14.0`) installed into `~/flutter`
- **Strict File Scope**: `libs/ui/fl-mat/**` ONLY. Never modify root files or `atomic-design-interfaces`. Never commit `coverage/`, `build/`, `pubspec.lock`, or `.agents/`.

## Non-Negotiable Technical Guardrails
1. Keep `analysis_options.yaml` (`deprecated_member_use: ignore`) and `project.json` targets (`lint`, `test`, `widgetbook`, `build-widgetbook`) + `lib/widgetbook.dart` entrypoint intact.
2. Strictly avoid deprecated Flutter 3.50 widget APIs:
   - `RadioGroup<T>` + `Radio<T>(value:, enabled:)` (no `Radio.groupValue` / `Radio.onChanged`)
   - `Switch` with `activeThumbColor`/`thumbColor`/`trackColor`/`thumbIcon` (no `Switch.activeColor`)
   - `Color.withValues(alpha: ...)` (no `withOpacity`)
   - `WidgetState` / `WidgetStateProperty` (no `MaterialState*`)
   - `Slider`/`RangeSlider` with `ShowValueIndicator.onDrag` (no `year2023`, no `ShowValueIndicator.always`)
   - `LinearProgressIndicator`/`CircularProgressIndicator` (no `year2023`)
   - `Tooltip` with `constraints:` (no `Tooltip.height`)
   - `SegmentedButton<T>` with `direction:`, `emptySelectionAllowed: true`, non-empty guard
   - `MenuAnchor` (`consumeOutsideTap`, no `anchorTapClosesMenu`) + `SubmenuButton` + `MenuItemButton`
   - Const `Icons.*` map ONLY in `MagicIcon` (never non-const `IconData(...)` to keep `--tree-shake-icons` passing!)
   - Dart keyword avoidance: `ButtonKind.standard`, `ButtonShape.standard`, `requiredField`
3. Strictly avoid deprecated Widgetbook 3.25 APIs:
   - Use `MaterialThemeAddon` (7 palettes), `ViewportAddon([Viewports.none, ...])`, `TextScaleAddon(min: 0.75, max: 2.0, initialScale: 1.0)`, `AlignmentAddon()`, `InspectorAddon()`
   - Use `context.knobs.{string,boolean,object.dropdown,object.segmented,double.slider,int.slider,color}`
   - Never use `DeviceFrameAddon`, `AccessibilityAddon`, `TextScaleAddon(scales:)`, `knobs.list`
4. Full `///` Dartdoc on all public APIs, `>= 80%` line coverage in `coverage/lcov.info`, zero analyzer issues, passing `build-widgetbook`, clean atomic Conventional Commits (`BREAKING CHANGE:` footer on `MagicTextInput` refactor).
