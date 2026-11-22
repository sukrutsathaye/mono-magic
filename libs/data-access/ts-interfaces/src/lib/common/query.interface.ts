import type { ErrorCode } from '@mono-magic/utils-ts-core';

/**
 * Canonical error object returned across all data-access provider boundaries.
 */
export interface DataAccessError {
  /** Machine-readable error code. */
  readonly code: ErrorCode;
  /** Human-readable description of the failure. */
  readonly message: string;
  /** Optional structured metadata associated with the failure. */
  readonly details?: Readonly<Record<string, unknown>>;
  /** Whether the operation is safe to retry. */
  readonly retryable: boolean;
  /** Optional underlying error cause. */
  readonly cause?: unknown;
}

const RETRYABLE_CODES: ReadonlySet<ErrorCode> = new Set([
  'RATE_LIMITED',
  'TIMEOUT',
  'UNAVAILABLE',
]);

/**
 * Creates a {@link DataAccessError} with sensible `retryable` defaults.
 */
export function createDataAccessError(
  code: ErrorCode,
  message: string,
  options?: {
    readonly details?: Readonly<Record<string, unknown>>;
    readonly retryable?: boolean;
    readonly cause?: unknown;
  },
): DataAccessError {
  return {
    code,
    message,
    details: options?.details,
    retryable: options?.retryable ?? RETRYABLE_CODES.has(code),
    cause: options?.cause,
  };
}

/**
 * Supported filter comparison operators in {@link FilterSpec}.
 */
export type FilterOperator = 'eq' | 'neq' | 'in' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains';

/**
 * Predicate clause applied to a single entity field.
 */
export interface FilterSpec<T> {
  /** Target field name on `T`. */
  readonly field: keyof T & string;
  /** Comparison operator. */
  readonly operator: FilterOperator;
  /** Value or array of values to compare against. */
  readonly value: unknown;
}

/**
 * Sort ordering direction.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Field-level sort specification.
 */
export interface SortSpec<T> {
  /** Target field name on `T`. */
  readonly field: keyof T & string;
  /** Sort direction. */
  readonly direction: SortDirection;
}

/**
 * Vendor-agnostic query specification for filtering, sorting, and pagination.
 */
export interface QuerySpec<T> {
  /** Filter clauses combined with logical AND. */
  readonly filters?: ReadonlyArray<FilterSpec<T>>;
  /** Ordered sort clauses. */
  readonly sort?: ReadonlyArray<SortSpec<T>>;
  /** Maximum number of items to return. */
  readonly limit?: number;
  /** Offset-based pagination start index. */
  readonly offset?: number;
  /** Opaque cursor for cursor-based pagination. */
  readonly cursor?: string;
}

/**
 * Paginated list response returned by repository and storage list operations.
 */
export interface PaginatedResult<T> {
  /** Page items. */
  readonly items: ReadonlyArray<T>;
  /** Total matching item count when known by the backend. */
  readonly total?: number;
  /** Opaque cursor for fetching the next page. */
  readonly nextCursor?: string;
  /** Whether additional items exist beyond this page. */
  readonly hasMore: boolean;
}
