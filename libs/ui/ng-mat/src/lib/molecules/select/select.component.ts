import {
  ChangeDetectionStrategy,
  Component,
  type DoCheck,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import type { ErrorStateMatcher } from '@angular/material/core';
import {
  MatOptgroup,
  MatOption,
  MatSelect,
  MatSelectTrigger,
  type MatSelectChange,
} from '@angular/material/select';
import type {
  AtomicSize,
  FormFieldAppearance,
  FormFieldFloatLabel,
  FormFieldSubscriptSizing,
  SelectMoleculeProps,
  SelectOption,
  SelectOptionGroup,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';
import {
  bindMagicValueAccessor,
  type MagicCvaTarget,
} from '../../forms/magic-cva';
import { MagicFormFieldComponent } from '../form-field/form-field.component';

export type { SelectOption, SelectOptionGroup };

/**
 * A dropdown select molecule composing `magic-form-field` and `mat-select`.
 *
 * Supports flat options, grouped options (`optionGroups`), multiple selection,
 * optional `"First (+N other/others)"` trigger summary, Signal Forms
 * (`FormValueControl`) and Reactive/Template-driven Forms (`NgControl` CVA bridge).
 *
 * @see https://material.angular.dev/components/select/overview
 */
@Component({
  selector: 'magic-select',
  imports: [
    MagicFormFieldComponent,
    MatSelect,
    MatSelectTrigger,
    MatOption,
    MatOptgroup,
  ],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicSelectComponent<T = string | number>
  implements
    SignalProps<SelectMoleculeProps<T>>,
    FormValueControl<T | readonly T[] | null>,
    MagicCvaTarget<T | readonly T[] | null>,
    DoCheck
{
  private readonly ngControl = inject(NgControl, {
    self: true,
    optional: true,
  });
  private readonly matSelect = viewChild(MatSelect);
  private readonly controlStateVersion = signal(0);
  private lastControlSnapshot = '';

  /** Id applied to the underlying `mat-select` (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the `mat-select` trigger (`-field` on wrapper). */
  readonly testId = input<string>();
  /** Accessible name for the `mat-select` combobox when `label` is omitted. */
  readonly ariaLabel = input<string>();
  /** Floating label shown by `magic-form-field`. */
  readonly label = input<string>();
  /** Helper text shown below the field. */
  readonly hint = input<string>();
  /** Error message shown below the field; forces error presentation. */
  readonly errorText = input<string>();
  /** Material field appearance (`'outlined'` or `'filled'`). */
  readonly appearance = input<FormFieldAppearance>('outlined');
  /** Size token (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');
  /** Floating label behaviour (`'auto'` or `'always'`). */
  readonly floatLabel = input<FormFieldFloatLabel>('auto');
  /** Subscript space reservation (`'fixed'` or `'dynamic'`). */
  readonly subscriptSizing = input<FormFieldSubscriptSizing>('fixed');
  /** Hides the required asterisk next to the label. */
  readonly hideRequiredMarker = input(false);
  /** Flat list of selectable options. */
  readonly options = input<readonly SelectOption<T>[]>([]);
  /** Grouped options rendered inside `<mat-optgroup>`. */
  readonly optionGroups = input<readonly SelectOptionGroup<T>[]>([]);
  /** Currently selected value (single item, array in `multiple` mode, or `null`). */
  readonly value = model<T | readonly T[] | null>(null);
  /** Placeholder shown when no option is selected. */
  readonly placeholder = input<string>();
  /** Enables selecting multiple options. */
  readonly multiple = input(false);
  /** Marks selection as required. */
  readonly required = input(false);
  /** Disables the select trigger and panel. */
  readonly disabled = input(false);
  /** Disables Material ink ripples on trigger and options. */
  readonly disableRipple = input(false);
  /** Formats multiple selection as `"First (+N other/others)"`. */
  readonly customTriggerSummary = input(false);
  /** Extra CSS class(es) forwarded to the overlay panel. */
  readonly panelClass = input<string>();
  /** Comparator used to match option values to the model value. */
  readonly compareWith = input<(o1: T, o2: T) => boolean>(
    (o1, o2) => o1 === o2,
  );
  /** Hides the checkmark indicator for single-selection options. */
  readonly hideSingleSelectionIndicator = input(false);
  /** Centers the active option over the select trigger. */
  readonly disableOptionCentering = input(false);
  /** Delay in ms before typeahead moves focus. */
  readonly typeaheadDebounceInterval = input<number>(200);
  /** Optional comparator sorting selected values in `multiple` mode. */
  readonly sortComparator = input<
    ((a: MatOption, b: MatOption, options: MatOption[]) => number) | undefined
  >(undefined);
  /** Width of the overlay panel (`'auto'` matches trigger, `null` fits content). */
  readonly panelWidth = input<string | number | null>('auto');
  /** Allows options whose value is `null` or `undefined` to remain selected. */
  readonly canSelectNullableOptions = input(false);
  /** Explicit `aria-labelledby` reference for the trigger. */
  readonly ariaLabelledby = input<string>();
  /** Tab index of the select trigger. */
  readonly tabIndex = input(0);
  /** Native form field name (`FormValueControl`). */
  readonly name = input<string>('');
  /** Signal Forms invalid state. */
  readonly invalid = input(false);
  /** Signal Forms touched state. */
  readonly touched = input(false);
  /** Signal Forms dirty state. */
  readonly dirty = input(false);

  /** Emits the updated value when the user selects or deselects options. */
  readonly changed = output<T | readonly T[] | null>();
  /** Emits when the dropdown panel opens (`true`) or closes (`false`). */
  readonly openedChanged = output<boolean>();
  /** Emits when focus leaves the closed select (`FormValueControl.touch`). */
  readonly touch = output<void>();

  /** @internal */
  readonly formDisabled = signal(false);

  /** Effective disabled state combining `disabled` input and form disabled state. */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  /** Effective error state across Signal Forms, Reactive/Template Forms, and `errorText`. */
  readonly isErrorState = computed(() => {
    this.controlStateVersion();
    const ctrl = this.ngControl;
    const reactiveInvalid = Boolean(
      ctrl?.invalid && (ctrl.touched || ctrl.dirty),
    );
    return this.invalid() || Boolean(this.errorText()) || reactiveInvalid;
  });

  protected readonly hostClasses = computed(() => `magic-size-${this.size()}`);

  protected readonly triggerSummary = computed(() => {
    const val = this.value();
    const compare = this.compareWith();
    const allOptions = [
      ...this.options(),
      ...this.optionGroups().flatMap((group) => group.options),
    ];
    const resolveLabel = (item: T): string =>
      allOptions.find((opt) => compare(opt.value, item))?.label ?? String(item);

    if (Array.isArray(val)) {
      if (val.length === 0) {
        return '';
      }
      const firstLabel = resolveLabel(val[0] as T);
      if (this.customTriggerSummary() && val.length > 1) {
        const extraCount = val.length - 1;
        const suffix = extraCount === 1 ? 'other' : 'others';
        return `${firstLabel} (+${extraCount} ${suffix})`;
      }
      return (val as readonly T[]).map(resolveLabel).join(', ');
    }

    if (val === null || val === undefined) {
      return (
        allOptions.find((opt) => compare(opt.value, val as T))?.label ?? ''
      );
    }
    return resolveLabel(val as T);
  });

  protected readonly errorStateMatcher: ErrorStateMatcher = {
    isErrorState: () => this.isErrorState(),
  };

  constructor() {
    bindMagicValueAccessor(this, this.ngControl);
    // Sync error state into the inner MatSelect because MatSelect.ngDoCheck
    // skips updateErrorState() when ngControl is attached to the outer wrapper.
    effect(() => {
      const select = this.matSelect();
      const err = this.isErrorState();
      if (select) {
        select.errorState = err;
      }
    });
  }

  ngDoCheck(): void {
    const ctrl = this.ngControl;
    if (!ctrl) {
      return;
    }
    const snapshot = `${Boolean(ctrl.invalid)}|${Boolean(ctrl.touched)}|${Boolean(ctrl.dirty)}`;
    if (snapshot !== this.lastControlSnapshot) {
      this.lastControlSnapshot = snapshot;
      this.controlStateVersion.update((v) => v + 1);
    }
  }

  /** Focuses the underlying `mat-select` trigger. */
  focus(options?: FocusOptions): void {
    this.matSelect()?.focus(options);
  }

  /** Resets the selected value to `[]` (multiple) or `null` (single). */
  reset(): void {
    this.value.set(this.multiple() ? [] : null);
  }

  protected onSelectionChange(event: MatSelectChange<unknown>): void {
    const next = event.value as T | readonly T[] | null;
    this.value.set(next);
    this.changed.emit(next);
  }

  protected onOpenedChange(opened: boolean): void {
    this.openedChanged.emit(opened);
    if (!opened) {
      this.touch.emit();
    }
  }

  protected onBlur(): void {
    if (!this.matSelect()?.panelOpen) {
      this.touch.emit();
    }
  }
}
