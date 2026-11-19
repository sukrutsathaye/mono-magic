# @mono-magic/ng-mat

Angular Material (`22.2.x`) design-system component library adhering to **Atomic Design**, **contract-first interfaces** from `@mono-magic/atomic-design-interfaces`, **Angular 22 signal APIs** (`input()`, `model()`, `output()`, `computed()`), **Material 3 (MD3) SCSS theming**, and dual forms integration (**Signal Forms** + **Reactive / Template-driven Forms**).

## Conventions

- **Selector prefix**: `magic-*` (`Magic*Component`), enforced by ESLint and `project.json`.
- **Standalone & separate files**: every component is standalone (`ChangeDetectionStrategy.OnPush`) with separate `.component.ts`, `.component.html`, `.component.scss`, `.component.spec.ts`, and `.component.stories.ts`.
- **Contract-first typing**: every component implements `SignalProps<*AtomProps>` or `SignalProps<*MoleculeProps>` from `@mono-magic/atomic-design-interfaces`, keeping public interfaces framework-agnostic.
- **No demo data in component classes**: showcase fixtures live strictly in `.stories.ts` and `.spec.ts`.
- **Atomic purity**: `magic-text-input` renders only a native `<input>`, while `magic-form-field` is the sole component rendering `mat-form-field`.

## Component Inventory

### Implemented Atoms (11)

| Selector | Class | Forms Contract |
| --- | --- | --- |
| `magic-badge` | `MagicBadgeComponent` | — |
| `magic-button` | `MagicButtonComponent` | — |
| `magic-button-toggle` | `MagicButtonToggleComponent` | `FormValueControl` + CVA |
| `magic-check-box` | `MagicCheckBoxComponent` | `FormCheckboxControl` + CVA |
| `magic-chip` | `MagicChipComponent` | — |
| `magic-progress-indicator` | `MagicProgressIndicatorComponent` | — |
| `magic-radio-button` | `MagicRadioButtonComponent` | `FormValueControl` + CVA |
| `magic-slide-toggle` | `MagicSlideToggleComponent` | `FormCheckboxControl` + CVA |
| `magic-slider` | `MagicSliderComponent` | `FormValueControl` + CVA |
| `magic-text-input` | `MagicTextInputComponent` | `FormValueControl` + CVA + `MatFormFieldControl` |
| `magic-tool-tip` | `MagicToolTipComponent` | — |

### Implemented Molecules (5)

| Selector | Class | Composes |
| --- | --- | --- |
| `magic-card` | `MagicCardComponent` | `mat-card`, `magic-button`, `magic-chip` |
| `magic-form-field` | `MagicFormFieldComponent` | `mat-form-field`, projected `[magicPrefix]` / `[magicSuffix]` |
| `magic-menu` | `MagicMenuComponent` | `mat-menu`, `magic-button`, recursive `magic-menu-submenu` |
| `magic-search-bar` | `MagicSearchBarComponent` | `magic-form-field`, `magic-text-input`, `magic-button` |
| `magic-select` | `MagicSelectComponent` | `magic-form-field`, `mat-select` (`FormValueControl` + CVA) |

### Roadmap (Future Batches)

- **Molecules**: `magic-date-picker`, `magic-time-picker`, `magic-list`, `magic-snack-bar`
- **Organisms**: `magic-table`, `magic-tabs`, `magic-stepper`, `magic-tree`, `magic-tool-bar`, `magic-dialog`, `magic-bottom-sheet`

## Material 3 Theming

Include the shipped theme entry point in your global stylesheet:

```scss
@use '@mono-magic/ng-mat/theme' as magic;
```

Or import `@mono-magic/ng-mat/theme/styles.css`. Available palette classes: `light-theme`, `dark-theme`, `rose-red`, `cyan-orange`, `orange-red`, `azure-blue`, and `magenta-violet`, paired with utility classes for size (`magic-size-{xs..xl}`), semantic color intent (`magic-color-{primary,secondary,tertiary,success,warning,error,neutral}`), and shape (`magic-shape-{square,rounded,pill}`).

## Forms Integration

Every form control in `ng-mat` bridges both Angular Signal Forms (`[formField]` via `FormValueControl<T>` / `FormCheckboxControl`) and Reactive / Template-driven Forms (`formControl`, `formControlName`, `[(ngModel)]` via `MagicValueAccessor` in `src/lib/forms/magic-cva.ts`).

## Development Commands

```bash
pnpm nx lint ng-mat
pnpm nx test ng-mat
pnpm nx build ng-mat
pnpm nx storybook ng-mat
pnpm nx build-storybook ng-mat --configuration=ci
```

## Checklist for Adding New Components

1. Define `*AtomProps` / `*MoleculeProps` in `@mono-magic/atomic-design-interfaces` without Material types.
2. Scaffold standalone component with separate `.component.{ts,html,scss,spec.ts,stories.ts}` using `magic-` prefix and `ChangeDetectionStrategy.OnPush`.
3. Use `input()`, `model()`, `output()`, `computed()` (`SignalProps<...>`), removing duplicate `id` from `:host` (`'[attr.id]': 'null'`).
4. Add unit tests covering every variant, size, state, form binding, and projection slot, plus Storybook stories with `play` tests and TSDoc comments for Compodoc Autodocs.
5. Re-export from the tier barrel (`atoms/index.ts`, `molecules/index.ts`, etc.).
