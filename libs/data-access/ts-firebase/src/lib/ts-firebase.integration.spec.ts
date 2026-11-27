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

  it('creates, reads, and updates a document in the Firestore Emulator', async () => {
    const docId = `entity-${RUN_ID}`;
    const docUrl = `http://${FIRESTORE_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents/contract_entities/${docId}`;

    const createRes = await fetch(docUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer owner',
      },
      body: JSON.stringify({
        fields: {
          name: { stringValue: `Firebase Entity ${RUN_ID}` },
          score: { integerValue: '42' },
          source: { stringValue: 'ts-firebase-integration' },
        },
      }),
    });
    expect(createRes.ok).toBe(true);

    const readRes = await fetch(docUrl, {
      headers: { Authorization: 'Bearer owner' },
    });
    expect(readRes.ok).toBe(true);
    const doc = (await readRes.json()) as FirestoreDocumentResponse;
    expect(doc.fields.name?.stringValue).toBe(`Firebase Entity ${RUN_ID}`);
    expect(doc.fields.score?.integerValue).toBe('42');

    const updateRes = await fetch(`${docUrl}?updateMask.fieldPaths=score`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer owner',
      },
      body: JSON.stringify({
        fields: {
          score: { integerValue: '99' },
        },
      }),
    });
    expect(updateRes.ok).toBe(true);
    const updated = (await updateRes.json()) as FirestoreDocumentResponse;
    expect(updated.fields.score?.integerValue).toBe('99');
  });
});
