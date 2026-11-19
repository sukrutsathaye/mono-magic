import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import {
  MatBadge,
  type MatBadgePosition,
  type MatBadgeSize,
} from '@angular/material/badge';
import { MatIcon } from '@angular/material/icon';
import type {
  AtomicSize,
  BadgeAtomProps,
  BadgePosition,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';

/**
 * Wraps Angular Material's `matBadge` directive as an atomic wrapper around
 * projected content (`<magic-badge [content]="3"><magic-button ... /></magic-badge>`)
 * with `icon` and `label` fallbacks.
 *
 * @see https://material.angular.dev/components/badge/overview
 */
@Component({
  selector: 'magic-badge',
  imports: [MatBadge, MatIcon],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicBadgeComponent implements SignalProps<BadgeAtomProps> {
  /** Id applied to the inner badge anchor (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the inner badge anchor. */
  readonly testId = input<string>();
  /** Accessible name on the anchor element. */
  readonly ariaLabel = input<string>();
  /** Text or number displayed inside the badge. */
  readonly content = input<string | number | undefined>(undefined);
  /** Semantic color role (`primary`..`neutral`). */
  readonly color = input<ColorIntent>('primary');
  /** Badge size token (`xs`/`sm` -> small, `md` -> medium, `lg`/`xl` -> large). */
  readonly size = input<AtomicSize>('md');
  /** Badge placement relative to the host element. */
  readonly position = input<BadgePosition & MatBadgePosition>('above after');
  /** Whether the badge overlaps its anchor. */
  readonly overlap = input(true);
  /** Hides the badge visually while keeping the anchor rendered. */
  readonly hidden = input(false);
  /** Disables the badge styling. */
  readonly disabled = input(false);
  /** Screen-reader description for the badge (`matBadgeDescription`). */
  readonly description = input<string>();
  /** Fallback text rendered when no content is projected and `icon` is unset. */
  readonly label = input<string>('');
  /** Fallback Material icon rendered when no content is projected. */
  readonly icon = input<string>();

  protected readonly matBadgeSize = computed<MatBadgeSize>(() => {
    switch (this.size()) {
      case 'xs':
      case 'sm':
        return 'small';
      case 'lg':
      case 'xl':
        return 'large';
      default:
        return 'medium';
    }
  });

  protected readonly hostClasses = computed(
    () => `magic-size-${this.size()} magic-color-${this.color()}`,
  );
}
