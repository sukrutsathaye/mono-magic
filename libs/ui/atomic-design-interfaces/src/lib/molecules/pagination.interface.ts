import type {
  AtomicSize,
  BaseMoleculeProps,
  ColorIntent,
} from '../common/atomic.interface.js';

/** Visual button treatment for `MagicPagination` page items. */
export type PaginationVariant = 'text' | 'outlined' | 'filled';

/** Ordered list of supported pagination button variants. */
export const PAGINATION_VARIANTS: readonly PaginationVariant[] = [
  'text',
  'outlined',
  'filled',
] as const;

/** Corner geometry for `MagicPagination` page buttons. */
export type PaginationShape = 'rounded' | 'circular';

/** Ordered list of supported pagination button shapes. */
export const PAGINATION_SHAPES: readonly PaginationShape[] = [
  'rounded',
  'circular',
] as const;

/** Shared property contract for `MagicPagination` across all UI libraries. */
export interface PaginationMoleculeProps extends BaseMoleculeProps {
  /** Controlled 1-indexed current page number. */
  page?: number;
  /** Initial 1-indexed page number for uncontrolled usage (defaults to `1`). */
  defaultPage?: number;
  /** Total number of items across all pages. */
  totalItems: number;
  /** Number of items displayed per page (defaults to `10`). */
  pageSize?: number;
  /** Available page-size choices when `showPageSizeSelector` is enabled. */
  pageSizeOptions?: readonly number[];
  /** Number of always-visible page buttons on either side of the active page (defaults to `1`). */
  siblingCount?: number;
  /** Number of always-visible page buttons at the start and end of the range (defaults to `1`). */
  boundaryCount?: number;
  /** Whether to render first-page and last-page jump controls. */
  showFirstLast?: boolean;
  /** Whether to render a page-size selector control. */
  showPageSizeSelector?: boolean;
  /** Whether to display a summary range/total count label (e.g. `1-10 of 95`). */
  showTotalCount?: boolean;
  /** Visual button style (`text`, `outlined`, or `filled`). */
  variant?: PaginationVariant;
  /** Button corner geometry (`rounded` or `circular`). */
  shape?: PaginationShape;
  /** Semantic accent color intent for the active page indicator. */
  color?: ColorIntent;
  /** Standardized component density/size preset. */
  size?: AtomicSize;
  /** Whether all pagination controls are disabled. */
  disabled?: boolean;
}

/** Alias for {@link PaginationMoleculeProps} aligned with `MagicPagination` component naming. */
export type MagicPaginationProps = PaginationMoleculeProps;
