import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import {
  MatProgressSpinner,
  type ProgressSpinnerMode,
} from '@angular/material/progress-spinner';
import type {
  AtomicSize,
  ColorIntent,
  ProgressIndicatorAtomProps,
  ProgressIndicatorMode,
  ProgressIndicatorType,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';

const SIZE_DIAMETERS: Record<AtomicSize, number> = {
  xs: 20,
  sm: 28,
  md: 40,
  lg: 56,
  xl: 72,
};

const SIZE_STROKES: Record<AtomicSize, number> = {
  xs: 2,
  sm: 3,
  md: 4,
  lg: 5,
  xl: 6,
};

/**
 * Wraps Angular Material's `mat-progress-bar` and `mat-progress-spinner` behind
 * one signal-driven atomic API. Preserves exact numeric `0` values.
 *
 * @see https://material.angular.dev/components/progress-bar/overview
 * @see https://material.angular.dev/components/progress-spinner/overview
 */
@Component({
  selector: 'magic-progress-indicator',
  imports: [MatProgressBar, MatProgressSpinner],
  templateUrl: './progress-indicator.component.html',
  styleUrl: './progress-indicator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicProgressIndicatorComponent
  implements SignalProps<ProgressIndicatorAtomProps>
{
  /** Id applied to the inner bar or spinner (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid`. */
  readonly testId = input<string>();
  /** Accessible name for assistive tech. */
  readonly ariaLabel = input<string>();
  /** Visual type (`'bar'` or `'spinner'`). */
  readonly type = input<ProgressIndicatorType>('bar');
  /** Animation/progress mode (`'determinate'`, `'indeterminate'`, `'buffer'`, `'query'`). */
  readonly mode = input<ProgressIndicatorMode>('indeterminate');
  /** Progress percentage (`0`..`100`). */
  readonly value = input<number>(0);
  /** Buffer percentage (`0`..`100`) when `type='bar'` and `mode='buffer'`. */
  readonly bufferValue = input<number>(0);
  /** Explicit spinner diameter in pixels (defaults from `size` when unset). */
  readonly diameter = input<number | undefined>(undefined);
  /** Explicit spinner stroke width in pixels (defaults from `size` when unset). */
  readonly strokeWidth = input<number | undefined>(undefined);
  /** Disables the indicator (part of `BaseAtomProps`). */
  readonly disabled = input(false);
  /** Semantic color role. */
  readonly color = input<ColorIntent>('primary');
  /** Size token (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');

  protected readonly spinnerMode = computed<ProgressSpinnerMode>(() =>
    this.mode() === 'determinate' ? 'determinate' : 'indeterminate',
  );

  protected readonly resolvedDiameter = computed(
    () => this.diameter() ?? SIZE_DIAMETERS[this.size()],
  );

  protected readonly resolvedStrokeWidth = computed(
    () => this.strokeWidth() ?? SIZE_STROKES[this.size()],
  );

  protected readonly hostClasses = computed(() =>
    [
      `magic-size-${this.size()}`,
      `magic-color-${this.color()}`,
      this.type() === 'spinner' ? 'magic-progress-indicator--spinner' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );
}
