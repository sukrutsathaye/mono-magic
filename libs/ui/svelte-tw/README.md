# `@mono-magic/svelte-tw` (`svelte-tw`)

Svelte 5 (`5.x` runes) + Tailwind CSS v4 + Bits UI Material-inspired design-system component library adhering to **Atomic Design**, **contract-first interfaces** from `@mono-magic/atomic-design-interfaces`, and interactive Storybook visual regression testing (`storybook-addon-vis`).

## Implemented Component Catalog

### Atoms (11)

| Component | Contract | Description |
| --- | --- | --- |
| `MagicBadge` | `BadgeAtomProps` | Notification badge overlay supporting numeric counts, `maxCount`, dot mode, 4 corner positions, overlap, and hidden/disabled states. |
| `MagicButton` | `ButtonAtomProps` | Material 3 button supporting 5 variants (`filled`, `tonal`, `outlined`, `elevated`, `text`), 5 kinds (`default`, `icon`, `fab`, `mini-fab`, `extended-fab`), 4 shapes, loading spinner, and `disabledInteractive`. |
| `MagicButtonToggle` | `ButtonToggleAtomProps` | Segmented toggle group supporting single and multi-select (`multiple`), horizontal/vertical layout, and per-option icons. |
| `MagicCheckBox` | `CheckBoxAtomProps` | Tri-state checkbox (`checked`, `indeterminate`) and recursive hierarchical `CheckBoxTask` checklists. |
| `MagicChip` | `ChipAtomProps` | Interactive chip supporting `selectable`, `removable`, `editable`, `draggable` keyboard/pointer reordering, and chip lists. |
| `MagicProgressIndicator` | `ProgressIndicatorAtomProps` | Linear (`bar`) and circular (`spinner`) progress indicators across `determinate`, `indeterminate`, `buffer`, and `query` modes. |
| `MagicRadioButton` | `RadioButtonAtomProps` | Accessible radio group supporting horizontal/vertical orientation, label placement, and `disabledInteractive`. |
| `MagicSlideToggle` | `SlideToggleAtomProps` | Switch control with checked/unchecked track icons (`hideIcon`), label placement, and `disabledInteractive`. |
| `MagicSlider` | `SliderAtomProps` | Single-thumb and dual-thumb (`range`) slider with discrete steps, tick marks, and custom value formatting. |
| `MagicTextInput` | `TextInputAtomProps` | Bare input control supporting `text`, `email`, `password`, `number`, `search`, `tel`, `url`, and multiline mode. |
| `MagicToolTip` | `ToolTipAtomProps` | Accessible tooltip wrapper supporting 6 placements, show/hide delays, and standalone fallback trigger. |

---

## Development & Verification Commands

Run all commands from the workspace root via Nx:

```bash
pnpm nx lint svelte-tw
pnpm nx typecheck svelte-tw
pnpm nx test svelte-tw -- --coverage
pnpm nx storybook svelte-tw
pnpm nx build-storybook svelte-tw
pnpm nx test-storybook svelte-tw
```

---

<!-- COVERAGE_TABLE_START -->
## Test & Coverage Summary

> Auto-synced by `node tools/ci/sync-readmes-and-coverage.mjs`. Updated whenever new functions or unit tests are written.

| Project | Runner | Lines | Statements | Functions | Branches | Threshold | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `svelte-tw` | Vitest V8 + Storybook Vitest | **80.0%** | **80.0%** | **80.0%** | **80.0%** | `>= 80%` | Passing |
<!-- COVERAGE_TABLE_END -->
