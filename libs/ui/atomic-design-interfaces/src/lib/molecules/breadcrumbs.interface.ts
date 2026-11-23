import type {
  AtomicSize,
  BaseMoleculeProps,
  ColorIntent,
} from '../common/atomic.interface.js';

/** Individual navigation crumb descriptor rendered inside `MagicBreadcrumbs`. */
export interface BreadcrumbItem {
  /** Unique identifier for the breadcrumb segment. */
  id: string;
  /** Visible text label for the breadcrumb segment. */
  label: string;
  /** Optional target URL when rendered as a navigational link. */
  href?: string;
  /** Optional Material icon string name displayed before `label`. */
  icon?: string;
  /** Whether this individual breadcrumb segment is disabled. */
  disabled?: boolean;
  /** Whether this segment represents the current active location (`aria-current="page"`). */
  current?: boolean;
}

/** Alias for {@link BreadcrumbItem} aligned with `MagicBreadcrumbs` component naming. */
export type MagicBreadcrumbItem = BreadcrumbItem;

/** Shared property contract for `MagicBreadcrumbs` across all UI libraries. */
export interface BreadcrumbsMoleculeProps extends BaseMoleculeProps {
  /** Ordered trail of navigation breadcrumb items from root to current location. */
  items: readonly BreadcrumbItem[];
  /** Separator string or icon token rendered between breadcrumb items (defaults to `'/'`). */
  separator?: string;
  /** Maximum number of visible breadcrumb items before collapsing middle items behind an ellipsis. */
  maxItems?: number;
  /** Number of leading items kept visible when the trail is collapsed. */
  itemsBeforeCollapse?: number;
  /** Number of trailing items kept visible when the trail is collapsed. */
  itemsAfterCollapse?: number;
  /** Semantic accent color intent for interactive breadcrumb links. */
  color?: ColorIntent;
  /** Standardized component density/size preset. */
  size?: AtomicSize;
  /** Whether all breadcrumb interactions are disabled. */
  disabled?: boolean;
}

/** Alias for {@link BreadcrumbsMoleculeProps} aligned with `MagicBreadcrumbs` component naming. */
export type MagicBreadcrumbsProps = BreadcrumbsMoleculeProps;
