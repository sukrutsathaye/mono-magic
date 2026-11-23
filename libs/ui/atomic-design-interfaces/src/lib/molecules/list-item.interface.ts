import type {
  AtomicSize,
  BaseMoleculeProps,
  ColorIntent,
} from '../common/atomic.interface.js';

/** Visual surface treatment for `MagicListItem` rows. */
export type ListItemAppearance = 'standard' | 'outlined' | 'filled';

/** Ordered list of supported list item surface appearances. */
export const LIST_ITEM_APPEARANCES: readonly ListItemAppearance[] = [
  'standard',
  'outlined',
  'filled',
] as const;

/** Shared property contract for `MagicListItem` across all UI libraries. */
export interface ListItemMoleculeProps extends BaseMoleculeProps {
  /** Primary headline text displayed in the list item row. */
  primaryText: string;
  /** Optional supporting text displayed beneath `primaryText`. */
  secondaryText?: string;
  /** Optional short overline label displayed above `primaryText`. */
  overlineText?: string;
  /** Optional Material icon string name rendered in the leading slot. */
  leadingIcon?: string;
  /** Optional initials or short text rendered inside a leading avatar. */
  leadingAvatarText?: string;
  /** Optional image URL rendered inside a leading avatar. */
  leadingAvatarSrc?: string;
  /** Optional Material icon string name rendered in the trailing slot. */
  trailingIcon?: string;
  /** Optional metadata text rendered in the trailing slot. */
  trailingText?: string;
  /** Optional badge content rendered in the trailing slot. */
  trailingBadge?: string | number;
  /** Whether the list item responds to pointer/keyboard activation. */
  interactive?: boolean;
  /** Whether the list item can be toggled into a selected state. */
  selectable?: boolean;
  /** Whether the list item is currently selected. */
  selected?: boolean;
  /** Whether the list item is disabled and non-interactive. */
  disabled?: boolean;
  /** Whether a bottom hairline divider is rendered beneath the row. */
  divider?: boolean;
  /** Whether compact vertical padding is applied to the row. */
  dense?: boolean;
  /** Semantic accent color intent applied to selection and icon highlights. */
  color?: ColorIntent;
  /** Standardized component density/size preset. */
  size?: AtomicSize;
  /** Material 3 surface appearance (`standard`, `outlined`, or `filled`). */
  appearance?: ListItemAppearance;
}

/** Alias for {@link ListItemMoleculeProps} aligned with `MagicListItem` component naming. */
export type MagicListItemProps = ListItemMoleculeProps;
