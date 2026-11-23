import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatOption, MatSelect, type MatSelectChange } from '@angular/material/select';
import type {
  AtomicSize,
  ColorIntent,
  PaginationMoleculeProps,
  PaginationShape,
  PaginationVariant,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';

export type { PaginationShape, PaginationVariant };

/** Represents a single rendered token inside the pagination strip. */
export type PaginationToken =
  | { readonly kind: 'page'; readonly page: number }
  | { readonly kind: 'ellipsis'; readonly key: string };

function buildPageRange(start: number, end: number): number[] {
  const result: number[] = [];
  for (let p = start; p <= end; p += 1) {
    result.push(p);
  }
  return result;
}

/**
 * Computes the ordered page number and ellipsis tokens for a 1-indexed
 * pagination control, following Material / MUI boundary & sibling rules.
 */
export function computePaginationTokens(
  totalPages: number,
  currentPage: number,
  boundaryCount: number,
  siblingCount: number,
): readonly PaginationToken[] {
  if (totalPages <= 0) {
    return [];
  }

  const safeBoundary = Math.max(0, Math.floor(boundaryCount));
  const safeSibling = Math.max(0, Math.floor(siblingCount));

  const startPages = buildPageRange(1, Math.min(safeBoundary, totalPages));
  const endPages = buildPageRange(
    Math.max(totalPages - safeBoundary + 1, safeBoundary + 1),
    totalPages,
  );

  const siblingsStart = Math.max(
    Math.min(
      currentPage - safeSibling,
      totalPages - safeBoundary - safeSibling * 2 - 1,
    ),
    safeBoundary + 2,
  );

  const siblingsEnd = Math.min(
    Math.max(
      currentPage + safeSibling,
      safeBoundary + safeSibling * 2 + 2,
    ),
    endPages.length > 0 ? endPages[0] - 2 : totalPages - 1,
  );

  const tokens: PaginationToken[] = [];

  for (const p of startPages) {
    tokens.push({ kind: 'page', page: p });
  }

  if (siblingsStart > safeBoundary + 2) {
    tokens.push({ kind: 'ellipsis', key: 'start-ellipsis' });
  } else if (safeBoundary + 1 < totalPages - safeBoundary) {
    tokens.push({ kind: 'page', page: safeBoundary + 1 });
  }

  for (const p of buildPageRange(siblingsStart, siblingsEnd)) {
    tokens.push({ kind: 'page', page: p });
  }

  const endBoundaryStart =
    endPages.length > 0 ? endPages[0] : totalPages + 1;
  if (siblingsEnd < endBoundaryStart - 2) {
    tokens.push({ kind: 'ellipsis', key: 'end-ellipsis' });
  } else if (totalPages - safeBoundary > safeBoundary) {
    const bridge = totalPages - safeBoundary;
    if (!tokens.some((t) => t.kind === 'page' && t.page === bridge)) {
      tokens.push({ kind: 'page', page: bridge });
    }
  }

  for (const p of endPages) {
    if (!tokens.some((t) => t.kind === 'page' && t.page === p)) {
      tokens.push({ kind: 'page', page: p });
    }
  }

  return tokens;
}

/**
 * A Material 3 pagination molecule supporting 1-indexed page navigation,
 * controlled (`page`) and uncontrolled (`defaultPage`) state, `siblingCount` &
 * `boundaryCount` ellipsis collapsing, optional first/last jump buttons, an
 * optional `MatSelect` page-size selector (`showPageSizeSelector`), an optional
 * range summary (`showTotalCount`), and `text` / `outlined` / `filled` variants
 * with `rounded` / `circular` button shapes.
 *
 * @see https://material.angular.dev/components/paginator/overview
 */
@Component({
  selector: 'magic-pagination',
  imports: [MatIcon, MatSelect, MatOption],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicPaginationComponent
  implements SignalProps<PaginationMoleculeProps>
{
  /** Id applied to the inner `<nav>` container (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the inner `<nav>` container. */
  readonly testId = input<string>();
  /** Accessible name applied to the `<nav>` landmark (`aria-label`). */
  readonly ariaLabel = input<string>();
  /** Controlled 1-indexed current page number. */
  readonly page = input<number>();
  /** Initial 1-indexed page number for uncontrolled usage (defaults to `1`). */
  readonly defaultPage = input<number>(1);
  /** Total number of items across all pages. */
  readonly totalItems = input.required<number>();
  /** Number of items displayed per page (defaults to `10`). */
  readonly pageSize = input<number>(10);
  /** Available page-size choices when `showPageSizeSelector` is enabled. */
  readonly pageSizeOptions = input<readonly number[]>([10, 25, 50, 100]);
  /** Number of always-visible page buttons on either side of the active page. */
  readonly siblingCount = input<number>(1);
  /** Number of always-visible page buttons at the start and end of the range. */
  readonly boundaryCount = input<number>(1);
  /** Whether to render first-page and last-page jump controls. */
  readonly showFirstLast = input<boolean>(false);
  /** Whether to render a page-size selector control. */
  readonly showPageSizeSelector = input<boolean>(false);
  /** Whether to display a summary range/total count label (e.g. `1-10 of 95`). */
  readonly showTotalCount = input<boolean>(false);
  /** Visual button style (`text`, `outlined`, or `filled`). */
  readonly variant = input<PaginationVariant>('text');
  /** Button corner geometry (`rounded` or `circular`). */
  readonly shape = input<PaginationShape>('rounded');
  /** Semantic accent color intent for the active page indicator. */
  readonly color = input<ColorIntent>('primary');
  /** Standardized component density/size preset (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');
  /** Whether all pagination controls are disabled. */
  readonly disabled = input<boolean>(false);

  /** Emits the updated 1-indexed page number when navigation occurs. */
  readonly pageChange = output<number>();
  /** Emits the updated page size when the user selects a different page size. */
  readonly pageSizeChange = output<number>();

  private readonly uncontrolledPage = signal<number | undefined>(undefined);
  private readonly uncontrolledPageSize = signal<number | undefined>(undefined);

  /** Effective number of items per page. */
  readonly currentPageSize = computed(() => {
    const raw = this.uncontrolledPageSize() ?? this.pageSize();
    return Math.max(1, Math.floor(raw || 10));
  });

  /** Total number of pages computed from `totalItems` and `currentPageSize`. */
  readonly totalPages = computed(() => {
    const items = Math.max(0, this.totalItems());
    return Math.max(1, Math.ceil(items / this.currentPageSize()));
  });

  /** Effective 1-indexed current page clamped to `[1, totalPages]`. */
  readonly currentPage = computed(() => {
    const controlled = this.page();
    if (controlled !== undefined) {
      return this.clampPage(controlled, this.totalPages());
    }
    const local = this.uncontrolledPage();
    if (local !== undefined) {
      return this.clampPage(local, this.totalPages());
    }
    return this.clampPage(this.defaultPage(), this.totalPages());
  });

  protected readonly tokens = computed(() =>
    computePaginationTokens(
      this.totalPages(),
      this.currentPage(),
      this.boundaryCount(),
      this.siblingCount(),
    ),
  );

  protected readonly resolvedPageSizeOptions = computed(() => {
    const set = new Set<number>(this.pageSizeOptions());
    set.add(this.currentPageSize());
    return Array.from(set).sort((a, b) => a - b);
  });

  protected readonly totalSummary = computed(() => {
    const total = Math.max(0, this.totalItems());
    if (total === 0) {
      return '0 of 0';
    }
    const pageSize = this.currentPageSize();
    const start = (this.currentPage() - 1) * pageSize + 1;
    const end = Math.min(total, this.currentPage() * pageSize);
    return `${start}-${end} of ${total}`;
  });

  protected readonly canGoPrevious = computed(
    () => !this.disabled() && this.currentPage() > 1,
  );

  protected readonly canGoNext = computed(
    () => !this.disabled() && this.currentPage() < this.totalPages(),
  );

  protected readonly hostClasses = computed(() =>
    [
      'magic-pagination',
      `magic-size-${this.size()}`,
      `magic-color-${this.color()}`,
      `magic-pagination--${this.variant()}`,
      `magic-pagination--${this.shape()}`,
      this.disabled() ? 'magic-pagination--disabled' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected goToPage(targetPage: number): void {
    if (this.disabled()) {
      return;
    }
    const next = this.clampPage(targetPage, this.totalPages());
    const prev = this.currentPage();
    if (next === prev) {
      return;
    }
    if (this.page() === undefined) {
      this.uncontrolledPage.set(next);
    }
    this.pageChange.emit(next);
  }

  protected onPageSizeSelected(event: MatSelectChange<number>): void {
    if (this.disabled()) {
      return;
    }
    const nextSize = Math.max(1, Number(event.value));
    if (nextSize === this.currentPageSize()) {
      return;
    }
    const prevPage = this.currentPage();
    this.uncontrolledPageSize.set(nextSize);
    this.pageSizeChange.emit(nextSize);

    const newTotalPages = Math.max(
      1,
      Math.ceil(Math.max(0, this.totalItems()) / nextSize),
    );
    const clampedPage = this.clampPage(prevPage, newTotalPages);
    if (clampedPage !== prevPage) {
      if (this.page() === undefined) {
        this.uncontrolledPage.set(clampedPage);
      }
      this.pageChange.emit(clampedPage);
    }
  }

  private clampPage(page: number, maxPages: number): number {
    return Math.max(1, Math.min(Math.floor(page), maxPages));
  }
}
