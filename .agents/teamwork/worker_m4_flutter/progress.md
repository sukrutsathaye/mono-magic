# Worker M4 Flutter Progress (`libs/ui/fl-mat`)

## Status: In Progress

### Checklist
- [x] Read mandatory references (`ORIGINAL_REQUEST.md`, M2/M4 handoffs, engineering standards, `atomic_interfaces.dart`, existing molecules, Widgetbook, and tests)
- [ ] Verify baseline `flutter test`
- [ ] Implement Wave 2 Molecules:
  - [ ] `lib/src/molecules/dialog/magic_dialog.dart` (`MagicDialog` + `showMagicDialog`)
  - [ ] `lib/src/molecules/alert/magic_alert.dart` (`MagicAlert`)
  - [ ] `lib/src/molecules/toast/magic_toast.dart` (`MagicToast` + `showMagicToast`)
  - [ ] `lib/src/molecules/tabs/magic_tabs.dart` (`MagicTabs`)
  - [ ] `lib/src/molecules/accordion/magic_accordion.dart` (`MagicAccordion`)
  - [ ] `lib/src/molecules/avatar/magic_avatar.dart` (`MagicAvatar` + `MagicAvatarGroup`)
- [ ] Update `lib/fl_mat.dart` exports
- [ ] Create Widgetbook use-cases (`lib/widgetbook/molecules/{dialog,alert,toast,tabs,accordion,avatar}_use_cases.dart`) and register in `lib/widgetbook.dart`
- [ ] Write widget tests (`test/molecules/magic_{dialog,alert,toast,tabs,accordion,avatar}_test.dart`) and update `test/widgetbook_test.dart`
- [ ] Run `lint`, `test`, `build-widgetbook` via Nx and `flutter test --coverage`
- [ ] Finalize `progress.md` and `handoff.md`
