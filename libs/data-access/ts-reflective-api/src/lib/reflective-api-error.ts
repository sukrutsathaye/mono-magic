import {
  createDataAccessError,
  type DataAccessError,
} from '@mono-magic/data-access-ts-interfaces';
import { AppError, type ErrorCode } from '@mono-magic/utils-ts-core';

/**
 * Maps an HTTP status code to a canonical {@link ErrorCode}.
 */
export function mapHttpStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
    case 422:
      return 'VALIDATION';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 408:
    case 504:
      return 'TIMEOUT';
    case 409:
      return 'CONFLICT';
    case 429:
      return 'RATE_LIMITED';
    case 502:
    case 503:
      return 'UNAVAILABLE';
    default:
      return status >= 500 ? 'UNAVAILABLE' : 'INTERNAL';
  }
}

/**
 * Checks whether an unknown value is already a {@link DataAccessError}.
 */
export function isDataAccessError(value: unknown): value is DataAccessError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['code'] === 'string' &&
    typeof candidate['message'] === 'string' &&
    typeof candidate['retryable'] === 'boolean'
  );
}

/**
 * Extracts a human-readable error message from a parsed JSON response payload.
 */
export function extractErrorMessageFromBody(
  body: unknown,
  fallbackMessage: string,
): { readonly message: string; readonly details?: Readonly<Record<string, unknown>> } {
  if (typeof body === 'object' && body !== null) {
    const record = body as Record<string, unknown>;
    if (typeof record['message'] === 'string' && record['message'].trim().length > 0) {
      return { message: record['message'], details: record };
    }
    if (typeof record['detail'] === 'string' && record['detail'].trim().length > 0) {
      return { message: record['detail'], details: record };
    }
    if (typeof record['error'] === 'string' && record['error'].trim().length > 0) {
      return { message: record['error'], details: record };
    }
    return { message: fallbackMessage, details: record };
  }
  if (typeof body === 'string' && body.trim().length > 0) {
    return { message: body.trim() };
  }
  return { message: fallbackMessage };
}

/**
 * Normalizes any thrown HTTP, network, or runtime failure into a canonical {@link DataAccessError}.
 */
export function normalizeReflectiveApiError(
  error: unknown,
  fallbackMessage = 'Reflective Learning API request failed',
): DataAccessError {
  if (isDataAccessError(error)) {
    return error;
  }

  if (error instanceof AppError) {
    return createDataAccessError(error.code, error.message, {
      details: error.details,
      retryable: error.retryable,
      cause: error.cause ?? error,
    });
  }

  if (error instanceof Error) {
    const isAbortOrTimeout =
      error.name === 'AbortError' ||
      error.name === 'TimeoutError' ||
      /timeout|aborted/i.test(error.message);
    if (isAbortOrTimeout) {
      return createDataAccessError('TIMEOUT', error.message || fallbackMessage, {
        retryable: true,
        cause: error,
      });
    }
    return createDataAccessError('UNAVAILABLE', error.message || fallbackMessage, {
      retryable: true,
      cause: error,
    });
  }

  return createDataAccessError('INTERNAL', fallbackMessage, {
    retryable: false,
    cause: error,
  });
}
