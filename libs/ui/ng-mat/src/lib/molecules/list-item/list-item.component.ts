import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import {
  MatList,
  MatListItem,
  MatListItemAvatar,
  MatListItemIcon,
  MatListItemLine,
  MatListItemMeta,
  MatListItemTitle,
} from '@angular/material/list';
import type {
  AtomicSize,
  ColorIntent,
  ListItemAppearance,
  ListItemMoleculeProps,
} from '@mono-magic/atomic-design-interfaces';
import { MagicBadgeComponent } from '../../atoms/badge/badge.component';
import type { SignalProps } from '../../core/signal-props';
import { MagicAvatarComponent } from '../avatar/avatar.component';

export type { ListItemAppearance };

/**
 * A Material 3 list item row molecule composing `MatList` / `MatListItem`
 * (or interactive `<button mat-list-item>`), `MagicAvatarComponent`,
 * `MagicBadgeComponent`, and `MatIcon` / `MatDivider`.
 *
 * Supports optional overline text, primary headline, secondary supporting
 * line, leading icon or avatar, trailing text/badge/icon, `interactive` and
 * `selectable` toggle behaviors, `dense` padding, hairline `divider`, and
 * `standard` / `outlined` / `filled` appearances.
 *
 * @see https://material.angular.dev/components/list/overview
 */
@Component({
  selector: 'magic-list-item',
  imports: [
    MatList,
    MatListItem,
    MatListItemTitle,
    MatListItemLine,
    MatListItemIcon,
    MatListItemAvatar,
    MatListItemMeta,
    MatDivider,
    MatIcon,
    MagicAvatarComponent,
    MagicBadgeComponent,
  ],
  templateUrl: './list-item.component.html',
  styleUrl: './list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicListItemComponent
  implements SignalProps<ListItemMoleculeProps>
{
  /** Id applied to the inner list item surface (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the inner list item element. */
  readonly testId = input<string>();
  /** Accessible name applied to the list item (`aria-label`). */
  readonly ariaLabel = input<string>();
  /** Primary headline text displayed in the list item row. */
  readonly primaryText = input.required<string>();
  /** Optional supporting text displayed beneath `primaryText`. */
  readonly secondaryText = input<string>();
  /** Optional short overline label displayed above `primaryText`. */
  readonly overlineText = input<string>();
  /** Optional Material icon string name rendered in the leading slot. */
  readonly leadingIcon = input<string>();
  /** Optional initials or short text rendered inside a leading avatar. */
  readonly leadingAvatarText = input<string>();
  /** Optional image URL rendered inside a leading avatar. */
  readonly leadingAvatarSrc = input<string>();
  /** Optional Material icon string name rendered in the trailing slot. */
  readonly trailingIcon = input<string>();
  /** Optional metadata text rendered in the trailing slot. */
  readonly trailingText = input<string>();
  /** Optional badge content rendered in the trailing slot. */
  readonly trailingBadge = input<string | number>();
  /** Whether the list item responds to pointer/keyboard activation. */
  readonly interactive = input<boolean>(false);
  /** Whether the list item can be toggled into a selected state. */
  readonly selectable = input<boolean>(false);
  /** Whether the list item is currently selected. */
  readonly selected = input<boolean>(false);
  /** Whether the list item is disabled and non-interactive. */
  readonly disabled = input<boolean>(false);
  /** Whether a bottom hairline divider is rendered beneath the row. */
  readonly divider = input<boolean>(false);
  /** Whether compact vertical padding is applied to the row. */
  readonly dense = input<boolean>(false);
  /** Semantic accent color intent applied to selection and icon highlights. */
  readonly color = input<ColorIntent>('primary');
  /** Standardized component density/size preset (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');
  /** Material 3 surface appearance (`standard`, `outlined`, or `filled`). */
  readonly appearance = input<ListItemAppearance>('standard');

  /** Emits when an enabled interactive or selectable list item is activated. */
  readonly clicked = output<MouseEvent>();
  /** Emits the toggled selection boolean when a selectable item is activated. */
  readonly selectedChange = output<boolean>();

  protected readonly isActivatable = computed(
    () => this.interactive() || this.selectable(),
  );

  protected readonly hasLeadingAvatar = computed(() =>
    Boolean(this.leadingAvatarSrc() || this.leadingAvatarText()),
  );

  protected readonly hasTrailing = computed(
    () =>
      Boolean(this.trailingText()) ||
      this.trailingBadge() !== undefined ||
      Boolean(this.trailingIcon()),
  );

  protected readonly avatarSize = computed<AtomicSize>(() => {
    switch (this.size()) {
      case 'xs':
      case 'sm':
        return 'sm';
      case 'lg':
      case 'xl':
        return 'lg';
      default:
        return 'md';
    }
  });

  protected readonly hostClasses = computed(() =>
    [
      'magic-list-item',
      `magic-size-${this.size()}`,
      `magic-color-${this.color()}`,
      `magic-list-item--${this.appearance()}`,
      this.dense() ? 'magic-list-item--dense' : '',
      this.selected() ? 'magic-list-item--selected' : '',
      this.disabled() ? 'magic-list-item--disabled' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected onActivate(event: MouseEvent): void {
    if (this.disabled() || !this.isActivatable()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.clicked.emit(event);
    if (this.selectable()) {
      this.selectedChange.emit(!this.selected());
    }
  }
}
