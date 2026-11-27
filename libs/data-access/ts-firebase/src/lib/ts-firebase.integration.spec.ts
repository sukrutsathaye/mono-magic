/**
 * Live integration tests against the local Firebase Emulator Suite Docker stack.
 *
 * Start the emulators first:
 *   pnpm nx emulator-up data-access-ts-firebase
 *
 * Run this suite:
 *   pnpm nx test-integration data-access-ts-firebase
 *
 * Inspect the written Auth users, Firestore documents, RTDB nodes, and Storage
 * objects in the Emulator Suite UI at http://localhost:4000.
 */
import { describe, expect, it } from 'vitest';

const IS_INTEGRATION = process.env['FIREBASE_INTEGRATION'] === 'true';

const PROJECT_ID = process.env['FIREBASE_PROJECT'] ?? 'demo-mono-magic';
const AUTH_HOST = process.env['FIREBASE_AUTH_EMULATOR_HOST'] ?? '127.0.0.1:9099';
const FIRESTORE_HOST = process.env['FIRESTORE_EMULATOR_HOST'] ?? '127.0.0.1:8080';
const RTDB_HOST = process.env['FIREBASE_DATABASE_EMULATOR_HOST'] ?? '127.0.0.1:9000';
const STORAGE_HOST = process.env['FIREBASE_STORAGE_EMULATOR_HOST'] ?? '127.0.0.1:9199';

const RUN_ID = Date.now().toString(36);

interface FirebaseAuthResponse {
  localId: string;
  email: string;
  idToken: string;
}

interface FirestoreDocumentResponse {
  name: string;
  fields: {
    name?: { stringValue: string };
    score?: { integerValue: string };
    source?: { stringValue: string };
  };
}

describe.runIf(IS_INTEGRATION)('Firebase Local Emulator Suite (live integration)', () => {
  it('signs up and signs in a user in the Auth Emulator', async () => {
    const email = `integration-${RUN_ID}@mono-magic.local`;
    const password = 'Password123!';

    const signUpRes = await fetch(
      `http://${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    expect(signUpRes.ok).toBe(true);
    const created = (await signUpRes.json()) as FirebaseAuthResponse;
    expect(created.localId).toBeTruthy();
    expect(created.email).toBe(email);

    const signInRes = await fetch(
      `http://${AUTH_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-api-key`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    expect(signInRes.ok).toBe(true);
    const signedIn = (await signInRes.json()) as FirebaseAuthResponse;
    expect(signedIn.localId).toBe(created.localId);
    expect(signedIn.idToken).toBeTruthy();
  });
});
