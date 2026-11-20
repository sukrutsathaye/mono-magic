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
  MatSlider,
  MatSliderRangeThumb,
  MatSliderThumb,
} from '@angular/material/slider';
import type {
  AtomicSize,
  ColorIntent,
  SliderAtomProps,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';
import {
  provideMagicValueAccessor,
  type MagicCvaTarget,
} from '../../forms/magic-cva';

const defaultDisplayWith = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${Math.round(value / 1_000_000_000)}B`;
  }
  if (value >= 1_000_000) {
    return `${Math.round(value / 1_000_000)}M`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }
  return `${value}`;
};

/**
 * Wraps Angular Material's `mat-slider` supporting both single-thumb and
 * range (`startValue` / `endValue`) modes, Signal Forms (`FormValueControl`),
 * and Reactive/Template Forms.
 *
 * @see https://material.angular.dev/components/slider/overview
 */
@Component({
  selector: 'magic-slider',
  imports: [MatSlider, MatSliderThumb, MatSliderRangeThumb],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideMagicValueAccessor(() => MagicSliderComponent)],
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicSliderComponent
  implements
    SignalProps<SliderAtomProps>,
    FormValueControl<number>,
    MagicCvaTarget<number>
{
  /** Id applied to the inner `mat-slider` (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the inner slider. */
  readonly testId = input<string>();
  /** Accessible name of the slider. */
  readonly ariaLabel = input<string>();
  /** Minimum slider value. */
  readonly min = input<number | undefined>(0);
  /** Maximum slider value. */
  readonly max = input<number | undefined>(100);
  /** Step increment between values. */
  readonly step = input(1);
  /** Current value in single-thumb mode. Two-way bindable and synced with forms. */
  readonly value = model(0);
  /** Enables two-thumb range selection. */
  readonly range = input(false);
  /** Start value when `range` is true. */
  readonly startValue = model(0);
  /** End value when `range` is true. */
  readonly endValue = model(100);
  /** Displays a numeric value indicator popup while dragging. */
  readonly discrete = input(false);
  /** Shows step tick marks along the track. */
  readonly showTickMarks = input(false);
  /** Disables the slider. */
  readonly disabled = input(false);
  /** Disables the ripple animation. */
  readonly disableRipple = input(false);
  /** Semantic color role. */
  readonly color = input<ColorIntent>('primary');
  /** Control size token (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');
  /** Formatter for the discrete thumb label. */
  readonly displayWith = input<(value: number) => string>(defaultDisplayWith);
  /** Signal Forms invalid state. */
  readonly invalid = input(false);
  /** Signal Forms touched state. */
  readonly touched = input(false);
  /** Signal Forms dirty state. */
  readonly dirty = input(false);

  /** Emits when the single value changes. */
  readonly changed = output<number>();
  /** Emits `[start, end]` when a range thumb changes. */
  readonly rangeChanged = output<readonly [number, number]>();
  /** Emits when focus leaves the slider. */
  readonly touch = output<void>();

  /** @internal */
  readonly formDisabled = signal(false);

  /** Effective disabled state combining `disabled` input and form disabled state. */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly resolvedDisplayWith = computed(
    () => this.displayWith() ?? defaultDisplayWith,
  );

  protected readonly hostClasses = computed(
    () => `magic-size-${this.size()} magic-color-${this.color()}`,
  );

  protected onSingleChange(next: number): void {
    this.value.set(next);
    this.changed.emit(next);
  }

  protected onStartChange(next: number): void {
    this.startValue.set(next);
    this.rangeChanged.emit([next, this.endValue()]);
  }

  protected onEndChange(next: number): void {
    this.endValue.set(next);
    this.rangeChanged.emit([this.startValue(), next]);
  }
}
