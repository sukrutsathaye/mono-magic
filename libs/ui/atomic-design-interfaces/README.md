# `@mono-magic/atomic-design-interfaces` (`atomic-design-interfaces`)

Framework-agnostic TypeScript Atomic Design component contracts (`Atoms`, `Molecules`, `Organisms`, `Templates`) and shared semantic design tokens (`ColorIntent`, `AtomicSize`, `ButtonShape`, `FormFieldAppearance`) powering 1:1 prop and behavioral parity across `react-mui`, `ng-mat`, `rn-paper`, `fl-mat` (mirrored in Dart), `vue-vuetify`, and `svelte-tw`.

## Architectural Rules

- **Tags**: `scope:ui`, `type:interfaces`, `lang:ts`
- **Zero Framework Dependencies**: Pure TypeScript interfaces and type aliases with zero imports from React, Angular, Vue, Svelte, or vendor UI kits.
- **Bottom-Up Tier Hierarchy**:
  - `src/lib/tokens/` — Semantic design tokens (`ColorIntent`, `AtomicSize`, `BaseAtomProps`).
  - `src/lib/atoms/` — 11 foundational Atom contracts (`*AtomProps`).
  - `src/lib/molecules/` — 17 composite Molecule contracts (`*MoleculeProps`).
  - `src/lib/organisms/` & `src/lib/templates/` — Higher-order Organism and Page Template contracts.
  - `src/proto.ts` (`./proto`) — Re-exports generated TypeScript enums, tokens, and `PageGraphDocument` AST from workspace package `@mono-magic/proto-ui-contracts` ([`libs/ui/proto-ui-contracts`](../proto-ui-contracts/README.md)).

---

## Official Documentation & References

| Topic / Standard | Reference | Why It Is Used Here |
| :--- | :--- | :--- |
| **Atomic Design** | [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/) | Defines the strict bottom-up `Atoms → Molecules → Organisms → Templates` contract hierarchy. |
| **WCAG 2.1 AA** | [W3C WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/) | Mandates contrast, keyboard navigation, and accessible naming semantics across all component contracts. |
| **WAI-ARIA APG** | [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) | Reference keyboard & role patterns for Dialog, Tabs, Accordion, Menu, Select, Slider, and Breadcrumbs. |
| **Material Design 3** | [Material Design 3 Spec](https://m3.material.io/) | Shared visual intent & surface hierarchy (`filled`, `tonal`, `outlined`, `elevated`, `text`). |
| **UI Proto Contracts** | [`proto-ui-contracts`](../proto-ui-contracts/README.md) | Language-agnostic `.proto` source for shared UI enums, design tokens, and XYFlow `PageGraph` AST. |

---

## Contract Catalog

### Atoms (11)

| Contract Interface | Module | Description |
| --- | --- | --- |
| `BadgeAtomProps` | `atoms/badge.interface.ts` | Notification badge overlay (`content`, `dot`, `maxCount`, `position`, `overlap`, `hidden`, `disabled`). |
| `ButtonAtomProps` | `atoms/button.interface.ts` | Action button (`variant`: `filled`/`tonal`/`outlined`/`elevated`/`text`, `kind`: `standard`/`icon`/`fab`/`mini-fab`/`extended-fab`, `shape`, `loading`, `disabledInteractive`). |
| `ButtonToggleAtomProps` | `atoms/button-toggle.interface.ts` | Segmented toggle group supporting single (`value`) and multi-selection (`values` / `multiple`), horizontal/vertical layout, and `standard`/`legacy` appearance. |
| `CheckBoxAtomProps` | `atoms/check-box.interface.ts` | Tri-state checkbox (`checked`, `indeterminate`) and recursive hierarchical `CheckBoxTask` trees. |
| `ChipAtomProps` | `atoms/chip.interface.ts` | Interactive chip (`basic`, `selectable`, `removable`, `editable`, `draggable`) and chip lists (`items`). |
| `ProgressIndicatorAtomProps` | `atoms/progress-indicator.interface.ts` | Linear (`bar`) and circular (`spinner`) progress indicators (`determinate`, `indeterminate`, `buffer`, `query`). |
| `RadioButtonAtomProps` | `atoms/radio-button.interface.ts` | Radio group (`options`, `value`, `orientation`, `labelPosition`, `disabledInteractive`). |
| `SlideToggleAtomProps` | `atoms/slide-toggle.interface.ts` | Switch control (`checked`, `hideIcon`, `labelPosition`, `disabledInteractive`). |
| `SliderAtomProps` | `atoms/slider.interface.ts` | Single-thumb (`value`) and dual-thumb (`range`, `rangeStart`, `rangeEnd`) slider with `step`, `discrete`, `showTickMarks`, and `displayWith`. |
| `TextInputAtomProps` | `atoms/text-input.interface.ts` | Bare text input control (`type`, `value`, `placeholder`, `readOnly`, `maxLength`, `multiline`) binding automatically to `FormFieldMoleculeProps`. |
| `ToolTipAtomProps` | `atoms/tool-tip.interface.ts` | Accessible tooltip wrapper (`message`, `position`, `showDelay`, `hideDelay`, `touchGestures`, `disabled`). |

### Molecules (17)

| Contract Interface | Module | Description |
| --- | --- | --- |
| `AccordionMoleculeProps` | `molecules/accordion.interface.ts` | Expandable disclosure panels (`items`, `multiple`, `expandedIds`, `variant`: `outlined`/`filled`/`flush`, `togglePosition`). |
| `AlertMoleculeProps` | `molecules/alert.interface.ts` | Inline contextual status banner (`severity`/`color`, `variant`: `tonal`/`filled`/`outlined`, `title`, `description`, `dismissible`, `actions`). |
| `AvatarMoleculeProps` | `molecules/avatar.interface.ts` | User/entity representation (`src`, `alt`, `initials`, `icon`, `shape`: `circle`/`rounded`/`square`, `status`, `group`). |
| `BreadcrumbsMoleculeProps` | `molecules/breadcrumbs.interface.ts` | Hierarchical navigation trail (`items`, `separator`, `maxItems`, `itemsBeforeCollapse`, `itemsAfterCollapse`). |
| `CardMoleculeProps` | `molecules/card.interface.ts` | Content surface composing `MagicButton` actions and `MagicChip` tags (`appearance`: `outlined`/`raised`, `variant`, `imageSize`). |
| `DatePickerMoleculeProps` | `molecules/date-picker.interface.ts` | Single-date (`value`) and date-range (`mode: 'range'`, `rangeValue`) calendar picker with `minDate`, `maxDate`, `presets`, and `MagicFormField` integration. |
| `DialogMoleculeProps` | `molecules/dialog.interface.ts` | Accessible modal dialog (`open`, `title`, `subtitle`, `content`, `size`: `sm`/`md`/`lg`/`fullscreen`, `dismissible`, `scrollable`, `actions`). |
| `FormFieldMoleculeProps` | `molecules/form-field.interface.ts` | Form control container (`appearance`: `outlined`/`filled`, `floatLabel`, `hint`, `errorText`/`errorMessage`, `prefix`, `suffix`, `subscriptSizing`). |
| `ListItemMoleculeProps` | `molecules/list-item.interface.ts` | Structured row item (`title`, `subtitle`, `overline`, `leadingAvatar`/`leadingIcon`, `trailingBadge`/`trailingMeta`, `selectable`, `selected`, `divider`). |
| `MenuMoleculeProps` | `molecules/menu.interface.ts` | Action dropdown menu with `MagicButton` trigger and recursive nested submenus (`items`, `triggerType`, `xPosition`, `yPosition`). |
| `PaginationMoleculeProps` | `molecules/pagination.interface.ts` | Page navigation bar (`page`, `totalPages`, `totalItems`, `pageSize`, `pageSizeOptions`, `siblingCount`, `showFirstLast`, `variant`). |
| `RatingMoleculeProps` | `molecules/rating.interface.ts` | Interactive star/icon rating control (`value`, `max`, `precision`: `1`/`0.5`, `readOnly`, `allowClear`, `showValueLabel`, `labels`). |
| `SearchBarMoleculeProps` | `molecules/search-bar.interface.ts` | Semantic `role="search"` landmark composing `MagicFormField`, `MagicTextInput`, and `MagicButton` (`value`, `loading`, `onSearch`, `onClear`). |
| `SelectMoleculeProps` | `molecules/select.interface.ts` | Single and multi-select dropdown (`options`, `optionGroups`, `multiple`, `customTriggerSummary`) composing `MagicFormField`. |
| `StepperMoleculeProps` | `molecules/stepper.interface.ts` | Multi-step workflow wizard (`steps`, `activeStep`, `orientation`: `horizontal`/`vertical`, `linear`, `showControls`). |
| `TabsMoleculeProps` | `molecules/tabs.interface.ts` | Tabbed navigation & panel switcher (`tabs`, `activeTabId`, `variant`: `primary`/`secondary`/`pills`, `scrollable`, `closable`). |
| `ToastMoleculeProps` | `molecules/toast.interface.ts` | Transient snackbar notification (`open`, `message`, `title`, `severity`, `position`, `autoHideDuration`, `actionLabel`, `showProgress`). |

---

## Nx Targets

```bash
pnpm nx lint atomic-design-interfaces
pnpm nx typecheck atomic-design-interfaces
pnpm nx test atomic-design-interfaces -- --coverage
```

---

<!-- COVERAGE_TABLE_START -->
## Test & Coverage Summary

> Auto-synced by `node tools/ci/sync-readmes-and-coverage.mjs`. Updated whenever new functions or unit tests are written.

| Project | Runner | Lines | Statements | Functions | Branches | Threshold | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `atomic-design-interfaces` | Vitest V8 (`@vitest/coverage-v8`) | **100.0%** | **100.0%** | **100.0%** | **100.0%** | `>= 80%` | Passing |
<!-- COVERAGE_TABLE_END -->
