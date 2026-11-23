import type {
  AtomicSize,
  BaseMoleculeProps,
  ColorIntent,
} from '../common/atomic.interface.js';

/** Step increment precision supported by `MagicRating` (`0.5` for half-stars, `1` for whole stars). */
export type RatingPrecision = 0.5 | 1;

/** Ordered list of supported rating step precisions. */
export const RATING_PRECISIONS: readonly RatingPrecision[] = [0.5, 1] as const;

/** Shared property contract for `MagicRating` across all UI libraries. */
export interface RatingMoleculeProps extends BaseMoleculeProps {
  /** Controlled numeric rating value (between `0` and `max`). */
  value?: number;
  /** Initial uncontrolled numeric rating value. */
  defaultValue?: number;
  /** Maximum number of rating icons displayed (defaults to `5`). */
  max?: number;
  /** Rating increment precision (`0.5` or `1`, defaults to `1`). */
  precision?: RatingPrecision;
  /** Whether the rating is display-only and ignores user input. */
  readOnly?: boolean;
  /** Whether the rating control is disabled. */
  disabled?: boolean;
  /** Whether to render the numeric rating value beside the icons. */
  showValue?: boolean;
  /** Optional total review count displayed beside the rating (e.g. `(128)`). */
  reviewCount?: number;
  /** Optional Material icon string name for filled rating units (defaults to `'star'`). */
  icon?: string;
  /** Optional Material icon string name for unfilled rating units (defaults to `'star_border'`). */
  emptyIcon?: string;
  /** Semantic accent color intent for filled rating icons. */
  color?: ColorIntent;
  /** Standardized component density/size preset. */
  size?: AtomicSize;
  /** Optional visible or accessible label describing what is being rated. */
  label?: string;
}

/** Alias for {@link RatingMoleculeProps} aligned with `MagicRating` component naming. */
export type MagicRatingProps = RatingMoleculeProps;
