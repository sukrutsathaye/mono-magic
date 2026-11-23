import { createDataAccessError, type DataAccessError } from '@mono-magic/data-access-ts-interfaces';
import type { ErrorCode } from '@mono-magic/utils-ts-core';

const FIREBASE_CODE_MAP: Readonly<Record<string, ErrorCode>> = {
  'auth/invalid-email': 'VALIDATION',
  'auth/weak-password': 'VALIDATION',
  'auth/missing-password': 'VALIDATION',
  'auth/user-not-found': 'UNAUTHORIZED',
  'auth/wrong-password': 'UNAUTHORIZED',
  'auth/invalid-credential': 'UNAUTHORIZED',
  'auth/invalid-user-token': 'UNAUTHORIZED',
  'auth/user-token-expired': 'UNAUTHORIZED',
  'auth/user-disabled': 'FORBIDDEN',
  'auth/operation-not-allowed': 'FORBIDDEN',
  'auth/email-already-in-use': 'CONFLICT',
  'auth/account-exists-with-different-credential': 'CONFLICT',
  'auth/too-many-requests': 'RATE_LIMITED',
  'auth/network-request-failed': 'UNAVAILABLE',
  'firestore/not-found': 'NOT_FOUND',
  'not-found': 'NOT_FOUND',
  'firestore/already-exists': 'CONFLICT',
  'already-exists': 'CONFLICT',
  'firestore/permission-denied': 'FORBIDDEN',
  'permission-denied': 'FORBIDDEN',
  'firestore/unauthenticated': 'UNAUTHORIZED',
  unauthenticated: 'UNAUTHORIZED',
  'firestore/resource-exhausted': 'RATE_LIMITED',
  'resource-exhausted': 'RATE_LIMITED',
  'firestore/deadline-exceeded': 'TIMEOUT',
  'deadline-exceeded': 'TIMEOUT',
  'firestore/unavailable': 'UNAVAILABLE',
  unavailable: 'UNAVAILABLE',
  'firestore/invalid-argument': 'VALIDATION',
  'invalid-argument': 'VALIDATION',
  'storage/object-not-found': 'NOT_FOUND',
  'storage/bucket-not-found': 'NOT_FOUND',
  'storage/unauthenticated': 'UNAUTHORIZED',
  'storage/unauthorized': 'FORBIDDEN',
  'storage/quota-exceeded': 'RATE_LIMITED',
  'storage/retry-limit-exceeded': 'TIMEOUT',
  'storage/canceled': 'UNAVAILABLE',
};

interface FirebaseErrorLike {
  readonly code?: string;
  readonly message: string;
  readonly customData?: Readonly<Record<string, unknown>>;
}

function isFirebaseErrorLike(error: unknown): error is FirebaseErrorLike {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { readonly message: unknown }).message === 'string'
  );
}

/**
 * Normalizes any Firebase SDK error (Auth, Firestore, Storage, RTDB) or thrown exception
 * into a canonical {@link DataAccessError}.
 */
export function normalizeFirebaseError(
  error: unknown,
  fallbackMessage = 'Firebase operation failed',
): DataAccessError {
  if (isFirebaseErrorLike(error)) {
    const rawCode = error.code;
    let mappedCode: ErrorCode | undefined = rawCode ? FIREBASE_CODE_MAP[rawCode] : undefined;

    if (!mappedCode) {
      const lower = error.message.toLowerCase();
      if (lower.includes('not found') || lower.includes('no document to update')) {
        mappedCode = 'NOT_FOUND';
      } else if (lower.includes('permission denied') || lower.includes('unauthorized')) {
        mappedCode = 'FORBIDDEN';
      } else if (lower.includes('unauthenticated') || lower.includes('invalid credential')) {
        mappedCode = 'UNAUTHORIZED';
      } else if (lower.includes('already exists') || lower.includes('already in use')) {
        mappedCode = 'CONFLICT';
      } else if (lower.includes('quota') || lower.includes('too many requests')) {
        mappedCode = 'RATE_LIMITED';
      } else if (lower.includes('deadline') || lower.includes('timed out')) {
        mappedCode = 'TIMEOUT';
      } else {
        mappedCode = 'INTERNAL';
      }
    }

    const details: Record<string, unknown> = {};
    if (rawCode !== undefined) {
      details['firebaseCode'] = rawCode;
    }
    if (error.customData !== undefined) {
      details['customData'] = error.customData;
    }

    return createDataAccessError(mappedCode, error.message || fallbackMessage, {
      details: Object.keys(details).length > 0 ? details : undefined,
      cause: error,
    });
  }

  return createDataAccessError('INTERNAL', fallbackMessage, {
    cause: error,
  });
}
