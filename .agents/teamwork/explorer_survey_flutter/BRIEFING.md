# BRIEFING — 2026-11-21T01:26:00Z

## Mission
Survey `libs/ui/fl-mat/`, CI workflows for Flutter/Widgetbook, VM SDK availability, and exact Widgetbook v3 + Flutter 3.50 Material 3 APIs & deprecation pitfalls.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: /home/antigravity/sukrutsathaye/mono-magic
- State folder: /home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/explorer_survey_flutter
- Original parent: ebfed8123aa4623566770de48e20c027
- Milestone: Survey Explorer 3 (fl-mat & Flutter/Widgetbook Environment)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify source files
- Write reports only to `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/explorer_survey_flutter`
- Read ORIGINAL_REQUEST.md and implementation_plan.md in full before investigating
- Send concise completion message to parent (`ebfed8123aa4623566770de48e20c027`) after writing `handoff.md`

## Current Parent
- Conversation ID: ebfed8123aa4623566770de48e20c027
- Updated: 2026-11-21T01:22:32Z

## Investigation State
- **Explored paths**:
  - `libs/ui/fl-mat/` (all config, `lib/`, `test/`, `web/`, `.gitignore`)
  - `.github/actions/setup-flutter/action.yml`, `.github/workflows/ci.yml`, `.github/workflows/storybook-gh-pages.yml`, `tools/ci/storybook-pages.mjs`
  - `libs/ui/atomic-design-interfaces/src/` (all 16 component TS interfaces)
  - `libs/ui/ng-mat/src/theme/{_palettes.scss,_tokens.scss}` & `.storybook/preview.ts`
  - Upstream `widgetbook 3.25.0` & `flutter_lints 6.0.0` archives from pub.dev
  - Upstream `flutter/flutter` tag `3.50.0` Material widget source files
- **Key findings**:
  - Local Flutter/Dart not installed, but `storage.googleapis.com`, `github.com`, `pub.dev` return HTTP 200, `tar`/`xz`/`unzip`/`curl`/`git` installed, 18G free in `~`. Flutter `3.50.0` (`flutter_linux_3.50.0-stable.tar.xz`, Dart `3.14.0`) can be installed in `~/flutter`.
  - CRITICAL Flutter 3.50 finding: `package:flutter/material.dart` is `@Deprecated` in Flutter 3.50.0 (pointing to `package:material_ui`). That is why `libs/ui/fl-mat/analysis_options.yaml` has `deprecated_member_use: ignore` — MUST KEEP IT unless migrating to `material_ui`, while still writing non-deprecated widget APIs (`RadioGroup`, `Color.withValues`, `WidgetStateProperty`, `Switch.activeThumbColor`, `ShowValueIndicator.onDrag`, `Tooltip.constraints`, `SegmentedButton.direction`, etc.).
  - Widgetbook `^3.25.0` resolves to `3.25.0`: `DeviceFrameAddon` & `AccessibilityAddon` & `TextScaleAddon(scales:)` & `knobs.list` are ALL deprecated. Use `ViewportAddon`, `TextScaleAddon(min:, max:, initialScale:)`, `MaterialThemeAddon`, `AlignmentAddon`, `InspectorAddon`, and `context.knobs.{string,boolean,object.dropdown,object.segmented,double.slider,int.slider}`.
- **Unexplored areas**: None within survey scope.

## Key Decisions Made
- Completed read-only investigation with primary-source verification directly against `widgetbook 3.25.0` tarball and `flutter/flutter` `3.50.0` tag.
- Producing final `handoff.md` and notifying parent.

## Artifact Index
- `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/explorer_survey_flutter/DISPATCH.md` — Logged dispatch
- `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/explorer_survey_flutter/BRIEFING.md` — Working memory
- `/home/antigravity/sukrutsathaye/mono-magic/.agents/teamwork/explorer_survey_flutter/handoff.md` — Final survey report
