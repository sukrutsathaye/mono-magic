# Milestone M4 Briefing — Track C Stage 2: 4-Library UI Implementations, >=80% Coverage, Stories/Widgetbook & Visual Baselines

- **Parent Conversation ID**: `c60cfeb3f87423422591f4dc488219d6`
- **State Folder**: `.agents/teamwork/sub_orch_m4`
- **Model Tier Constraint**: `flash` for ALL spawned subagents
- **Owned Scope (Features F14–F18)**:
  - **F14**: Wave 2 Molecules Batch 1 (`MagicDialog`, `MagicAlert`, `MagicToast`, `MagicTabs`, `MagicAccordion`, `MagicAvatar`, `MagicAvatarGroup`) in `libs/ui/react-mui` (`>=80%` coverage, CSF3 stories)
  - **F15**: Wave 2 Molecules Batch 1 (`MagicDialogComponent`, `MagicAlertComponent`, `MagicToastComponent`, `MagicTabsComponent`, `MagicAccordionComponent`, `MagicAvatarComponent`, `MagicAvatarGroupComponent`) in `libs/ui/ng-mat` (`>=80%` coverage, CSF3 stories)
  - **F16**: Wave 2 Molecules Batch 1 in `libs/ui/rn-paper` (`>=80%` coverage, CSF3 stories)
  - **F17**: Wave 2 Molecules Batch 1 in `libs/ui/fl-mat` (M3 Dart widgets, Dartdoc, `lib/fl_mat.dart`, `lib/widgetbook/molecules/*`, `lib/widgetbook.dart`, `test/molecules/*`, `test/widgetbook_test.dart`, `flutter test --coverage`, `build-widgetbook`)
  - **F18**: Serialized `storybook-addon-vis` baselines (`pnpm nx test-storybook <project> -- -u`), verification without `-u`, and `build-storybook` across `react-mui`, `ng-mat`, `rn-paper`.
- **Frozen / Forbidden Files**:
  - Do NOT modify `libs/ui/atomic-design-interfaces/*` (owned/frozen from M2)
  - Do NOT modify `libs/ui/fl-mat/lib/src/interfaces/atomic_interfaces.dart` (already completed in M2)
  - Do NOT modify `libs/ui/react-mui/src/lib/theme/mui-theme.tsx` unless a critical compilation issue arises (must document why).
