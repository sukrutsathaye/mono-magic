import type {
  AtomicSize,
  BaseMoleculeProps,
  ColorIntent,
} from '../common/atomic.interface.js';

/** Presence indicator status for `MagicAvatar`. */
export type AvatarStatus = 'online' | 'busy' | 'offline';

/** Ordered list of supported avatar presence status values. */
export const AVATAR_STATUSES: readonly AvatarStatus[] = [
  'online',
  'busy',
  'offline',
] as const;

/** Geometric container shape for `MagicAvatar`. */
export type AvatarShape = 'circle' | 'rounded' | 'square';

/** Ordered list of supported avatar container shapes. */
export const AVATAR_SHAPES: readonly AvatarShape[] = [
  'circle',
  'rounded',
  'square',
] as const;

/** Overlap spacing density for `MagicAvatarGroup`. */
export type AvatarGroupSpacing = 'tight' | 'normal';

/** Ordered list of supported avatar group overlap spacing presets. */
export const AVATAR_GROUP_SPACINGS: readonly AvatarGroupSpacing[] = [
  'tight',
  'normal',
] as const;

/** Shared property contract for `MagicAvatar` across all UI libraries. */
export interface AvatarMoleculeProps extends BaseMoleculeProps {
  /** Optional image URL rendered inside the avatar. */
  src?: string;
  /** Accessible alternative text for the avatar image. */
  alt?: string;
  /** Display name used to derive fallback initials and accessible labels. */
  name?: string;
  /** Explicit fallback initials overriding derived `name` initials. */
  initials?: string;
  /** Optional Material icon string name used as fallback when no image or initials exist. */
  icon?: string;
  /** Standardized component size preset. */
  size?: AtomicSize;
  /** Semantic color intent applied to the fallback container and foreground. */
  color?: ColorIntent;
  /** Container corner geometry (`circle`, `rounded`, or `square`). */
  shape?: AvatarShape;
  /** Optional presence status badge rendered at the avatar corner. */
  status?: AvatarStatus;
  /** Accessible label describing the presence `status`. */
  statusLabel?: string;
}

/** Item descriptor rendered within a `MagicAvatarGroup` stack. */
export interface AvatarGroupItem extends Omit<AvatarMoleculeProps, 'size'> {
  /** Optional unique identifier for the avatar group entry. */
  id?: string;
}

/** Shared property contract for `MagicAvatarGroup` across all UI libraries. */
export interface AvatarGroupMoleculeProps extends BaseMoleculeProps {
  /** Ordered list of avatar descriptors displayed in the stack. */
  items: readonly AvatarGroupItem[];
  /** Maximum number of avatars rendered before collapsing extras into a `+N` overflow badge. */
  max?: number;
  /** Standardized size preset applied uniformly across all avatars in the group. */
  size?: AtomicSize;
  /** Overlap density between adjacent avatars (`tight` or `normal`). */
  spacing?: AvatarGroupSpacing;
}

/** Alias for {@link AvatarMoleculeProps} aligned with `MagicAvatar` component naming. */
export type MagicAvatarProps = AvatarMoleculeProps;

/** Alias for {@link AvatarGroupMoleculeProps} aligned with `MagicAvatarGroup` component naming. */
export type MagicAvatarGroupProps = AvatarGroupMoleculeProps;
