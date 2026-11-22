# Milestone M4 Scope & Exclusive File Ownership Matrix

## Stage 1 — Focused Exploration (`explorer_m4`)
- Read-only inspection of Wave 1 molecules (`card`, `menu`, `select`) across `react-mui`, `ng-mat`, `rn-paper`, `fl-mat`, plus `atomic-design-interfaces` Wave 2 contracts and `fl-mat/lib/src/interfaces/atomic_interfaces.dart` & `magic_icon.dart` & `widgetbook_test.dart`.

## Stage 2 — 4 Parallel Library Workers (Strictly Disjoint Ownership)
1. **`worker_m4_react`**
   - Owns ONLY: `libs/ui/react-mui/src/lib/molecules/**`, `libs/ui/react-mui/__vis__/**`
   - Forbidden: `libs/ui/react-mui/src/lib/theme/mui-theme.tsx`, `libs/ui/atomic-design-interfaces/**`, other UI libs.
2. **`worker_m4_angular`**
   - Owns ONLY: `libs/ui/ng-mat/src/lib/molecules/**`
   - Note: Defer `test-storybook -- -u` to Stage 3 so Chromium runs are serialized.
3. **`worker_m4_rn`**
   - Owns ONLY: `libs/ui/rn-paper/src/lib/molecules/**`
   - Note: Defer `test-storybook -- -u` to Stage 3 so Chromium runs are serialized.
4. **`worker_m4_flutter`**
   - Owns ONLY: `libs/ui/fl-mat/lib/src/molecules/**`, `libs/ui/fl-mat/lib/fl_mat.dart`, `libs/ui/fl-mat/lib/widgetbook/**`, `libs/ui/fl-mat/lib/widgetbook.dart`, `libs/ui/fl-mat/test/**`
   - Forbidden: `libs/ui/fl-mat/lib/src/interfaces/atomic_interfaces.dart`, other UI libs.

## Stage 3 — Serialized Visual Baselines & Storybook Builds (`worker_m4_vis`)
- Runs sequentially after Stage 2 Workers finish:
  - `pnpm nx test-storybook react-mui -- -u`
  - `pnpm nx test-storybook ng-mat -- -u`
  - `pnpm nx test-storybook rn-paper -- -u`
  - `pnpm nx run-many -t test-storybook -p react-mui,ng-mat,rn-paper`
  - `pnpm nx run-many -t build-storybook -p react-mui,ng-mat,rn-paper`
- May fix story rendering/snapshot issues in `libs/ui/{react-mui,ng-mat,rn-paper}/src/lib/molecules/**/*.stories.*` or `__vis__/**` if needed.

## Stage 4 — Verification Wave
- `reviewer_m4_1` (full-suite `lint`, `typecheck`, `test -- --coverage`, `test-storybook`, `build-storybook`, `build-widgetbook`)
- `reviewer_m4_2` (target-scoped code/parity/accessibility/coverage inspection)
- `challenger_m4_1` (TS/web interactive, keyboard, ARIA, edge cases + V8 JSON coverage verification >=80%)
- `challenger_m4_2` (`fl-mat` Dart widget behavior, Widgetbook, coverage + cross-library 1:1 prop parity)
- `auditor_m4` (Forensic Integrity Audit — NON-SKIPPABLE)
