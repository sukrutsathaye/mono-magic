import { createDataAccessError, type DataAccessError } from '@mono-magic/data-access-ts-interfaces';
import type { ErrorCode } from '@mono-magic/utils-ts-core';
import type { SupabaseErrorLike } from './supabase-types.js';

const CODE_TO_ERROR_CODE: Readonly<Record<string, ErrorCode>> = {
  PGRST116: 'NOT_FOUND',
  '23505': 'CONFLICT',
  '23503': 'VALIDATION',
  '23502': 'VALIDATION',
  '22P02': 'VALIDATION',
  '42501': 'FORBIDDEN',
  '57014': 'TIMEOUT',
  invalid_credentials: 'UNAUTHORIZED',
  user_already_exists: 'CONFLICT',
  over_request_rate_limit: 'RATE_LIMITED',
  not_found: 'NOT_FOUND',
  NoSuchKey: 'NOT_FOUND',
  Duplicate: 'CONFLICT',
};

const STATUS_TO_ERROR_CODE: Readonly<Record<number, ErrorCode>> = {
  400: 'VALIDATION',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  408: 'TIMEOUT',
  409: 'CONFLICT',
  422: 'VALIDATION',
  429: 'RATE_LIMITED',
  502: 'UNAVAILABLE',
  503: 'UNAVAILABLE',
  504: 'TIMEOUT',
};

function isSupabaseErrorLike(error: unknown): error is SupabaseErrorLike {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { readonly message: unknown }).message === 'string'
  );
}

/**
 * Normalizes any Supabase SDK error (PostgREST, GoTrue, Storage, Realtime) or thrown exception
 * into a canonical {@link DataAccessError}.
 */
export function normalizeSupabaseError(
  error: unknown,
  fallbackMessage = 'Supabase operation failed',
): DataAccessError {
  if (isSupabaseErrorLike(error)) {
    const rawCode = error.code;
    const status = error.status;

    let mappedCode: ErrorCode | undefined = rawCode ? CODE_TO_ERROR_CODE[rawCode] : undefined;
    if (!mappedCode && status !== undefined) {
      mappedCode = STATUS_TO_ERROR_CODE[status];
    }
    if (!mappedCode) {
      const lowerMsg = error.message.toLowerCase();
      if (lowerMsg.includes('not found')) {
        mappedCode = 'NOT_FOUND';
      } else if (lowerMsg.includes('unauthorized') || lowerMsg.includes('invalid login')) {
        mappedCode = 'UNAUTHORIZED';
      } else if (lowerMsg.includes('forbidden') || lowerMsg.includes('permission denied')) {
        mappedCode = 'FORBIDDEN';
      } else if (lowerMsg.includes('duplicate') || lowerMsg.includes('already exists')) {
        mappedCode = 'CONFLICT';
      } else if (lowerMsg.includes('rate limit')) {
        mappedCode = 'RATE_LIMITED';
      } else if (lowerMsg.includes('timeout') || lowerMsg.includes('timed out')) {
        mappedCode = 'TIMEOUT';
      } else {
        mappedCode = 'INTERNAL';
      }
    }

    const details: Record<string, unknown> = {};
    if (rawCode !== undefined) {
      details['supabaseCode'] = rawCode;
    }
    if (status !== undefined) {
      details['httpStatus'] = status;
    }
    if (error.details !== undefined) {
      details['details'] = error.details;
    }
    if (error.hint !== undefined) {
      details['hint'] = error.hint;
    }

    return createDataAccessError(mappedCode, error.message || fallbackMessage, {
      details: Object.keys(details).length > 0 ? details : undefined,
      cause: error,
    });
  }

  if (error instanceof Error) {
    return createDataAccessError('INTERNAL', error.message || fallbackMessage, {
      cause: error,
    });
  }

  return createDataAccessError('INTERNAL', fallbackMessage, {
    cause: error,
  });
}
