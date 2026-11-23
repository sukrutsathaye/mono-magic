import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import type {
  AtomicSize,
  ColorIntent,
  RatingMoleculeProps,
  RatingPrecision,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';

export type { RatingPrecision };

/**
 * A Material 3 star/icon rating molecule supporting full (`1`) and half (`0.5`)
 * precision increments, keyboard navigation (`ArrowLeft`/`ArrowRight`/`ArrowUp`/
 * `ArrowDown`/`Home`/`End`), pointer hover preview, controlled (`value`) and
 * uncontrolled (`defaultValue`) state, `readOnly` / `disabled` modes, custom
 * `max` count, custom `icon` / `emptyIcon` glyphs, numeric value display, and
 * review count summary.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/slider/
 */
@Component({
  selector: 'magic-rating',
  imports: [MatIcon],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicRatingComponent implements SignalProps<RatingMoleculeProps> {
  /** Id applied to the inner rating group container (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the inner rating container (`-star-<n>`, `-value`, `-count` on parts). */
  readonly testId = input<string>();
  /** Accessible name applied to the rating control (`aria-label`). */
  readonly ariaLabel = input<string>();
  /** Controlled numeric rating value (between `0` and `max`). */
  readonly value = input<number>();
  /** Initial uncontrolled numeric rating value (defaults to `0`). */
  readonly defaultValue = input<number>(0);
  /** Maximum number of rating icons displayed (defaults to `5`). */
  readonly max = input<number>(5);
  /** Rating increment precision (`0.5` or `1`, defaults to `1`). */
  readonly precision = input<RatingPrecision>(1);
  /** Whether the rating is display-only and ignores user input. */
  readonly readOnly = input<boolean>(false);
  /** Whether the rating control is disabled. */
  readonly disabled = input<boolean>(false);
  /** Whether to render the numeric rating value beside the icons. */
  readonly showValue = input<boolean>(false);
  /** Optional total review count displayed beside the rating (e.g. `(128)`). */
  readonly reviewCount = input<number>();
  /** Optional Material icon string name for filled rating units (defaults to `'star'`). */
  readonly icon = input<string>('star');
  /** Optional Material icon string name for unfilled rating units (defaults to `'star_border'`). */
  readonly emptyIcon = input<string>('star_border');
  /** Semantic accent color intent for filled rating icons. */
  readonly color = input<ColorIntent>('warning');
  /** Standardized component density/size preset (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');
  /** Optional visible or accessible label describing what is being rated. */
  readonly label = input<string>();

  /** Emits the updated numeric rating value when the user selects a rating. */
  readonly valueChange = output<number>();

  private readonly uncontrolledValue = signal<number | undefined>(undefined);
  protected readonly hoverValue = signal<number | null>(null);

  protected readonly resolvedMax = computed(() =>
    Math.max(1, Math.floor(this.max() || 5)),
  );

  /** Effective numeric rating value clamped to `[0, max]`. */
  readonly currentValue = computed(() => {
    const controlled = this.value();
    const raw =
      controlled !== undefined
        ? controlled
        : (this.uncontrolledValue() ?? this.defaultValue());
    return this.clampAndSnap(raw);
  });

  protected readonly displayValue = computed(() => {
    const hovered = this.hoverValue();
    return hovered !== null ? hovered : this.currentValue();
  });

  protected readonly formattedValue = computed(() => {
    const val = this.currentValue();
    return this.precision() === 0.5 ? val.toFixed(1) : String(val);
  });

  protected readonly stars = computed(() =>
    Array.from({ length: this.resolvedMax() }, (_, idx) => idx + 1),
  );

  protected readonly isInteractive = computed(
    () => !this.readOnly() && !this.disabled(),
  );

  protected readonly hostClasses = computed(() =>
    [
      'magic-rating',
      `magic-size-${this.size()}`,
      `magic-color-${this.color()}`,
      this.readOnly() ? 'magic-rating--readonly' : '',
      this.disabled() ? 'magic-rating--disabled' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected iconForStar(starIndex: number): string {
    const val = this.displayValue();
    if (val >= starIndex) {
      return this.icon();
    }
    if (this.precision() === 0.5 && val >= starIndex - 0.5) {
      return 'star_half';
    }
    return this.emptyIcon();
  }

  protected isStarFilled(starIndex: number): boolean {
    const val = this.displayValue();
    return val >= starIndex || (this.precision() === 0.5 && val >= starIndex - 0.5);
  }

  protected onStarPointerMove(event: MouseEvent, starIndex: number): void {
    if (!this.isInteractive()) {
      return;
    }
    this.hoverValue.set(this.resolvePointerRating(event, starIndex));
  }

  protected onMouseLeave(): void {
    this.hoverValue.set(null);
  }

  protected onStarClick(event: MouseEvent, starIndex: number): void {
    if (!this.isInteractive()) {
      return;
    }
    const next = this.resolvePointerRating(event, starIndex);
    this.commitValue(next);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.isInteractive()) {
      return;
    }
    const step = this.precision();
    const current = this.currentValue();
    const max = this.resolvedMax();
    let next: number | undefined;

    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      next = Math.min(max, current + step);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      next = Math.max(0, current - step);
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = max;
    } else {
      return;
    }

    event.preventDefault();
    this.commitValue(next);
  }

  private resolvePointerRating(event: MouseEvent, starIndex: number): number {
    if (this.precision() !== 0.5) {
      return starIndex;
    }
    const target = event.currentTarget as HTMLElement | null;
    if (!target) {
      return starIndex;
    }
    const rect = target.getBoundingClientRect();
    if (rect.width > 0 && event.clientX - rect.left < rect.width / 2) {
      return starIndex - 0.5;
    }
    return starIndex;
  }

  private commitValue(raw: number): void {
    const next = this.clampAndSnap(raw);
    const prev = this.currentValue();
    if (this.value() === undefined) {
      this.uncontrolledValue.set(next);
    }
    if (next !== prev) {
      this.valueChange.emit(next);
    }
  }

  private clampAndSnap(raw: number): number {
    const max = this.resolvedMax();
    const clamped = Math.max(0, Math.min(Number(raw) || 0, max));
    const step = this.precision();
    return Math.round(clamped / step) * step;
  }
}
