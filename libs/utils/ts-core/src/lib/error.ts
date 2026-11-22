/**
 * Canonical error codes shared across TypeScript utilities and data-access contracts.
 */
export type ErrorCode =
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'UNAVAILABLE'
  | 'INTERNAL';

/**
 * Options for constructing an {@link AppError}.
 */
export interface AppErrorOptions {
  /** Machine-readable canonical error code. */
  readonly code: ErrorCode;
  /** Optional structured metadata associated with the error. */
  readonly details?: Readonly<Record<string, unknown>>;
  /** Optional underlying cause. */
  readonly cause?: unknown;
  /** Whether the failed operation is safe to retry. */
  readonly retryable?: boolean;
}

const DEFAULT_RETRYABLE_CODES: ReadonlySet<ErrorCode> = new Set([
  'RATE_LIMITED',
  'TIMEOUT',
  'UNAVAILABLE',
]);

/**
 * Base structured application error carrying a canonical {@link ErrorCode}.
 */
export class AppError extends Error {
  /** Machine-readable canonical error code. */
  public readonly code: ErrorCode;
  /** Optional structured metadata associated with the error. */
  public readonly details?: Readonly<Record<string, unknown>>;
  /** Whether the failed operation is safe to retry. */
  public readonly retryable: boolean;

  /**
   * Creates a new {@link AppError}.
   */
  public constructor(message: string, options: AppErrorOptions) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = new.target.name;
    this.code = options.code;
    this.details = options.details;
    this.retryable = options.retryable ?? DEFAULT_RETRYABLE_CODES.has(options.code);
  }
}

/**
 * Asserts that `condition` is truthy, throwing an {@link AppError} otherwise.
 */
export function invariant(
  condition: unknown,
  message: string,
  code: ErrorCode = 'VALIDATION',
): asserts condition {
  if (!condition) {
    throw new AppError(message, { code });
  }
}
