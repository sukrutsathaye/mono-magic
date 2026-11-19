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
  MatButtonToggle,
  MatButtonToggleGroup,
  type MatButtonToggleAppearance,
  type MatButtonToggleChange,
} from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';
import type {
  AtomicSize,
  ButtonToggleAtomProps,
  ButtonToggleOption,
  ButtonToggleSelectionMode,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';
import {
  provideMagicValueAccessor,
  type MagicCvaTarget,
} from '../../forms/magic-cva';

export type { ButtonToggleOption };

/**
 * Wraps Angular Material's `mat-button-toggle-group` with Signal Forms
 * (`FormValueControl`), Reactive/Template Forms support, single and multiple
 * selection, vertical layout and optional icons.
 *
 * @see https://material.angular.dev/components/button-toggle/overview
 */
@Component({
  selector: 'magic-button-toggle',
  imports: [MatButtonToggleGroup, MatButtonToggle, MatIcon],
  templateUrl: './button-toggle.component.html',
  styleUrl: './button-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideMagicValueAccessor(() => MagicButtonToggleComponent)],
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicButtonToggleComponent<T = string>
  implements
    SignalProps<ButtonToggleAtomProps<T>>,
    FormValueControl<T | readonly T[] | undefined>,
    MagicCvaTarget<T | readonly T[] | undefined>
{
  /** Id applied to the inner toggle group (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the group. */
  readonly testId = input<string>();
  /** Accessible name for the toggle group. */
  readonly ariaLabel = input<string>();
  /** Toggle options to display. */
  readonly options = input<readonly ButtonToggleOption<T>[]>([]);
  /** Current selection (single value or array in `multiple` mode). */
  readonly value = model<T | readonly T[] | undefined>(undefined);
  /** Selection mode (`'single'` or `'multiple'`). */
  readonly selectionMode = input<ButtonToggleSelectionMode>('single');
  /** Stacks toggle buttons vertically. */
  readonly vertical = input(false);
  /** Material appearance (`'standard'` or `'legacy'`). */
  readonly appearance = input<MatButtonToggleAppearance>('standard');
  /** Hides the checkmark indicator on selected buttons. */
  readonly hideSelectionIndicator = input(false);
  /** Disables the toggle group. */
  readonly disabled = input(false);
  /** Keeps disabled toggles focusable. */
  readonly disabledInteractive = input(false);
  /** Semantic color role. */
  readonly color = input<ColorIntent>('primary');
  /** Control size token (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');
  /** Native form group `name`. */
  readonly name = input<string>('');
  /** Marks selection as required. */
  readonly required = input(false);
  /** Signal Forms invalid state. */
  readonly invalid = input(false);
  /** Signal Forms touched state. */
  readonly touched = input(false);
  /** Signal Forms dirty state. */
  readonly dirty = input(false);

  /** Emits the updated selection whenever a toggle changes. */
  readonly changed = output<T | readonly T[] | undefined>();
  /** Emits when focus leaves the toggle group. */
  readonly touch = output<void>();

  /** @internal */
  readonly formDisabled = signal(false);

  /** Effective disabled state combining `disabled` input and form disabled state. */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly isMultiple = computed(
    () => this.selectionMode() === 'multiple',
  );

  protected readonly hostClasses = computed(
    () => `magic-size-${this.size()} magic-color-${this.color()}`,
  );

  protected onGroupChange(event: MatButtonToggleChange): void {
    const next = event.value as T | readonly T[];
    this.value.set(next);
    this.changed.emit(next);
  }
}
