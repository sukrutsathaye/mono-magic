import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';
import {
  MatSlideToggle,
  type MatSlideToggleChange,
} from '@angular/material/slide-toggle';
import type {
  AtomicSize,
  ColorIntent,
  SlideToggleAtomProps,
  SlideToggleLabelPosition,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';
import {
  provideMagicValueAccessor,
  type MagicCvaTarget,
} from '../../forms/magic-cva';

/**
 * Wraps Angular Material's `mat-slide-toggle` with Signal Forms
 * (`FormCheckboxControl`), Reactive/Template Forms support, and `<ng-content>`
 * projection with `label` fallback.
 *
 * @see https://material.angular.dev/components/slide-toggle/overview
 */
@Component({
  selector: 'magic-slide-toggle',
  imports: [MatSlideToggle],
  templateUrl: './slide-toggle.component.html',
  styleUrl: './slide-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideMagicValueAccessor(() => MagicSlideToggleComponent)],
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicSlideToggleComponent
  implements
    SignalProps<SlideToggleAtomProps>,
    FormCheckboxControl,
    MagicCvaTarget<boolean>
{
  /** Id applied to the inner toggle (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the toggle. */
  readonly testId = input<string>();
  /** Accessible name; falls back to `label`. */
  readonly ariaLabel = input<string>();
  /** Label fallback when no content is projected. */
  readonly label = input<string>();
  /** Checked state. Two-way bindable and synced with forms. */
  readonly checked = model(false);
  /** Disables the toggle. */
  readonly disabled = input(false);
  /** Marks the toggle as required. */
  readonly required = input(false);
  /** Hides the checkmark/close icon inside the thumb. */
  readonly hideIcon = input(false);
  /** Places the label `'before'` or `'after'` the switch. */
  readonly labelPosition = input<SlideToggleLabelPosition>('after');
  /** Disables the ripple animation. */
  readonly disableRipple = input(false);
  /** Keeps the toggle focusable while disabled. */
  readonly disabledInteractive = input(false);
  /** Semantic color role. */
  readonly color = input<ColorIntent>('primary');
  /** Control size token (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');
  /** Native `name` attribute. */
  readonly name = input<string>('');
  /** Signal Forms invalid state. */
  readonly invalid = input(false);
  /** Signal Forms touched state. */
  readonly touched = input(false);
  /** Signal Forms dirty state. */
  readonly dirty = input(false);

  /** Emits when the toggle state changes. */
  readonly changed = output<boolean>();
  /** Emits when focus leaves the toggle. */
  readonly touch = output<void>();

  /** @internal */
  readonly formDisabled = signal(false);

  /** Effective disabled state combining `disabled` input and form disabled state. */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly hostClasses = computed(
    () => `magic-size-${this.size()} magic-color-${this.color()}`,
  );

  protected onToggleChange(event: MatSlideToggleChange): void {
    this.checked.set(event.checked);
    this.changed.emit(event.checked);
  }
}
