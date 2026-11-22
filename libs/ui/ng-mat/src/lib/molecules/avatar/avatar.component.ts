import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import type {
  AtomicSize,
  AvatarGroupItem,
  AvatarGroupMoleculeProps,
  AvatarGroupSpacing,
  AvatarMoleculeProps,
  AvatarShape,
  AvatarStatus,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';

export type { AvatarGroupItem, AvatarGroupSpacing, AvatarShape, AvatarStatus };

function deriveInitials(name?: string): string {
  if (!name) {
    return '';
  }
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

/**
 * A Material 3 identity avatar molecule supporting image URLs with graceful
 * `(error)` fallback to explicit `initials` or derived `name` initials, and
 * finally a Material icon (`icon` or `'person'`), across `xs`..`xl` sizes,
 * `circle`/`rounded`/`square` shapes, semantic `color` intents, and corner
 * presence `status` indicators (`online`, `busy`, `offline`).
 */
@Component({
  selector: 'magic-avatar',
  imports: [MatIcon],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicAvatarComponent implements SignalProps<AvatarMoleculeProps> {
  /** Id applied to the inner avatar container (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the inner avatar container. */
  readonly testId = input<string>();
  /** Accessible name applied to the avatar (`aria-label`). */
  readonly ariaLabel = input<string>();
  /** Optional image URL rendered inside the avatar. */
  readonly src = input<string>();
  /** Accessible alternative text for the avatar image. */
  readonly alt = input<string>();
  /** Display name used to derive fallback initials and accessible label. */
  readonly name = input<string>();
  /** Explicit fallback initials overriding derived `name` initials. */
  readonly initials = input<string>();
  /** Optional Material icon string used when no image or initials exist. */
  readonly icon = input<string>();
  /** Standardized component size token (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');
  /** Semantic color intent applied to the fallback container and foreground. */
  readonly color = input<ColorIntent>('primary');
  /** Container corner geometry (`circle`, `rounded`, or `square`). */
  readonly shape = input<AvatarShape>('circle');
  /** Optional corner presence status indicator (`online`, `busy`, `offline`). */
  readonly status = input<AvatarStatus>();
  /** Accessible label describing the presence `status`. */
  readonly statusLabel = input<string>();

  protected readonly imageFailed = signal(false);

  protected readonly showImage = computed(
    () => Boolean(this.src()) && !this.imageFailed(),
  );

  protected readonly resolvedInitials = computed(() => {
    const explicit = this.initials()?.trim();
    if (explicit) {
      return explicit.slice(0, 3).toUpperCase();
    }
    return deriveInitials(this.name());
  });

  protected readonly resolvedIcon = computed(() => this.icon() || 'person');

  protected readonly resolvedAlt = computed(
    () => this.alt() || this.name() || this.ariaLabel() || 'Avatar',
  );

  protected readonly resolvedAriaLabel = computed(
    () => this.ariaLabel() || this.alt() || this.name() || null,
  );

  protected readonly resolvedStatusLabel = computed(
    () => this.statusLabel() || this.status() || '',
  );

  protected readonly hostClasses = computed(() =>
    [
      'magic-avatar',
      `magic-size-${this.size()}`,
      `magic-color-${this.color()}`,
      `magic-avatar--${this.size()}`,
      `magic-avatar--${this.shape()}`,
    ].join(' '),
  );

  constructor() {
    effect(() => {
      this.src();
      this.imageFailed.set(false);
    });
  }

  protected onImageError(): void {
    this.imageFailed.set(true);
  }
}

/**
 * Displays an overlapping stack of `MagicAvatarComponent` items with a
 * configurable `max` limit that collapses overflow entries into a `+N` badge.
 */
@Component({
  selector: 'magic-avatar-group',
  imports: [MagicAvatarComponent],
  templateUrl: './avatar-group.component.html',
  styleUrl: './avatar-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicAvatarGroupComponent
  implements SignalProps<AvatarGroupMoleculeProps>
{
  /** Id applied to the inner group container (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the inner group container (`-overflow` on `+N` chip). */
  readonly testId = input<string>();
  /** Accessible name applied to the avatar group (`aria-label`). */
  readonly ariaLabel = input<string>();
  /** Ordered list of avatar descriptors displayed in the stack. */
  readonly items = input.required<readonly AvatarGroupItem[]>();
  /** Maximum number of avatars rendered before collapsing extras into `+N`. */
  readonly max = input<number>();
  /** Standardized size token applied uniformly across all avatars in the group. */
  readonly size = input<AtomicSize>('md');
  /** Overlap spacing density between adjacent avatars (`tight` or `normal`). */
  readonly spacing = input<AvatarGroupSpacing>('normal');

  protected readonly visibleItems = computed(() => {
    const all = this.items();
    const limit = this.max();
    if (limit !== undefined && limit >= 0 && all.length > limit) {
      return all.slice(0, limit);
    }
    return all;
  });

  protected readonly overflowCount = computed(() => {
    const all = this.items();
    const limit = this.max();
    if (limit !== undefined && limit >= 0 && all.length > limit) {
      return all.length - limit;
    }
    return 0;
  });

  protected readonly hostClasses = computed(() =>
    [
      'magic-avatar-group',
      `magic-size-${this.size()}`,
      `magic-avatar-group--${this.size()}`,
      `magic-avatar-group--${this.spacing()}`,
    ].join(' '),
  );
}
