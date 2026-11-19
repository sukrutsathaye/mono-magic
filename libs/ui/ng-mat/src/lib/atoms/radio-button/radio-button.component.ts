import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import type { FormValueControl } from '@angular/forms/signals';
import {
  MatRadioButton,
  MatRadioGroup,
  type MatRadioChange,
} from '@angular/material/radio';
import type {
  AtomicSize,
  ColorIntent,
  RadioButtonAtomProps,
  RadioLabelPosition,
  RadioOption,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';
import {
  provideMagicValueAccessor,
  type MagicCvaTarget,
} from '../../forms/magic-cva';

export type { RadioOption };

/**
 * Wraps Angular Material's `mat-radio-group` and `mat-radio-button` with
 * Signal Forms (`FormValueControl`) and Reactive/Template Forms support.
 *
 * @see https://material.angular.dev/components/radio/overview
 */
@Component({
  selector: 'magic-radio-button',
  imports: [MatRadioGroup, MatRadioButton],
  templateUrl: './radio-button.component.html',
  styleUrl: './radio-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideMagicValueAccessor(() => MagicRadioButtonComponent)],
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicRadioButtonComponent<T = string>
  implements
    SignalProps<RadioButtonAtomProps<T>>,
    FormValueControl<T | undefined>,
    MagicCvaTarget<T | undefined>
{
  /** Id applied to the inner `mat-radio-group` (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the inner group. */
  readonly testId = input<string>();
  /** Accessible name of the radio group. */
  readonly ariaLabel = input<string>();
  /** Radio options rendered inside the group. */
  readonly options = input<readonly RadioOption<T>[]>([]);
  /** Currently selected value. Two-way bindable and synced with forms. */
  readonly value = model<T | undefined>(undefined);
  /** Native form `name` shared by all radios in the group. */
  readonly name = input<string>('');
  /** Label placement relative to each radio circle. */
  readonly labelPosition = input<RadioLabelPosition>('after');
  /** Disables the entire radio group. */
  readonly disabled = input(false);
  /** Marks selection as required. */
  readonly required = input(false);
  /** Keeps disabled radios focusable. */
  readonly disabledInteractive = input(false);
  /** Disables the ripple animation. */
  readonly disableRipple = input(false);
  /** Stacks radio buttons vertically instead of horizontally. */
  readonly vertical = input(true);
  /** Semantic color role. */
  readonly color = input<ColorIntent>('primary');
  /** Control size token (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');
  /** Signal Forms invalid state. */
  readonly invalid = input(false);
  /** Signal Forms touched state. */
  readonly touched = input(false);
  /** Signal Forms dirty state. */
  readonly dirty = input(false);

  /** Emits the newly selected option value. */
  readonly changed = output<T | undefined>();
  /** Emits when focus leaves the radio group. */
  readonly touch = output<void>();

  /** @internal */
  readonly formDisabled = signal(false);

  /** Effective disabled state combining `disabled` input and form disabled state. */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly hostClasses = computed(
    () => `magic-size-${this.size()} magic-color-${this.color()}`,
  );

  protected onSelectionChange(event: MatRadioChange): void {
    const next = event.value as T;
    this.value.set(next);
    this.changed.emit(next);
  }
}
