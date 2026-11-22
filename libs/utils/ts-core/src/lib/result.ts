/**
 * Discriminated union representing either a successful value (`ok: true`)
 * or a typed failure (`ok: false`).
 */
export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/**
 * Constructs a successful {@link Result}.
 */
export function ok<T, E = never>(value: T): Result<T, E> {
  return { ok: true, value };
}

/**
 * Constructs a failed {@link Result}.
 */
export function err<E, T = never>(error: E): Result<T, E> {
  return { ok: false, error };
}

/**
 * Type guard checking whether a {@link Result} is a success.
 */
export function isOk<T, E>(result: Result<T, E>): result is { readonly ok: true; readonly value: T } {
  return result.ok;
}

/**
 * Type guard checking whether a {@link Result} is a failure.
 */
export function isErr<T, E>(result: Result<T, E>): result is { readonly ok: false; readonly error: E } {
  return !result.ok;
}

/**
 * Transforms the value of a successful {@link Result}, leaving failures untouched.
 */
export function mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}

/**
 * Chains a {@link Result}-returning function onto a successful {@link Result}.
 */
export function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>,
): Result<U, E> {
  return result.ok ? fn(result.value) : result;
}

/**
 * Extracts the value from a {@link Result}, returning `fallback` if it is a failure.
 */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback;
}
