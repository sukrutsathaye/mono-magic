import { AppError } from './error.js';

/**
 * Configuration options for {@link retryWithBackoff}.
 */
export interface RetryOptions {
  /** Maximum number of attempts including the initial call (default: `3`). */
  readonly maxAttempts?: number;
  /** Initial backoff delay in milliseconds before the second attempt (default: `100`). */
  readonly baseDelayMs?: number;
  /** Maximum backoff delay cap in milliseconds (default: `5000`). */
  readonly maxDelayMs?: number;
  /** Whether to apply full jitter to the computed exponential delay (default: `true`). */
  readonly jitter?: boolean;
  /** Optional {@link AbortSignal} to cancel pending retries. */
  readonly signal?: AbortSignal;
  /** Predicate deciding whether an error should trigger a retry. */
  readonly shouldRetry?: (error: unknown, attempt: number) => boolean;
}

function defaultShouldRetry(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.retryable;
  }
  return true;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    return Promise.reject(
      new AppError('Retry aborted', { code: 'TIMEOUT', cause: signal.reason, retryable: false }),
    );
  }
  if (ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      reject(
        new AppError('Retry aborted', { code: 'TIMEOUT', cause: signal?.reason, retryable: false }),
      );
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Executes `fn` with exponential backoff retries.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = Math.max(1, options.maxAttempts ?? 3);
  const baseDelayMs = Math.max(0, options.baseDelayMs ?? 100);
  const maxDelayMs = Math.max(baseDelayMs, options.maxDelayMs ?? 5000);
  const jitter = options.jitter ?? true;
  const shouldRetry = options.shouldRetry ?? defaultShouldRetry;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (options.signal?.aborted) {
      throw new AppError('Retry aborted', {
        code: 'TIMEOUT',
        cause: options.signal.reason,
        retryable: false,
      });
    }

    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts || !shouldRetry(error, attempt)) {
        throw error;
      }
      const exponential = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      const delayMs = jitter ? Math.floor(Math.random() * exponential) : exponential;
      await sleep(delayMs, options.signal);
    }
  }

  throw lastError;
}
