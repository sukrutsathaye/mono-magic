/**
 * Live integration tests against the local Supabase Docker stack.
 *
 * Start the local Supabase stack first:
 *   pnpm nx emulator-up data-access-ts-supabase
 *
 * Run this suite:
 *   pnpm nx test-integration data-access-ts-supabase
 *
 * Inspect the written Auth users, Postgres rows (`public.contract_entities`),
 * and Storage objects in Supabase Studio at http://localhost:54323.
 */
import { describe, expect, it } from 'vitest';

const IS_INTEGRATION = process.env['SUPABASE_INTEGRATION'] === 'true';

const SUPABASE_URL = process.env['SUPABASE_URL'] ?? 'http://127.0.0.1:54321';
const ANON_KEY =
  process.env['SUPABASE_ANON_KEY'] ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const SERVICE_ROLE_KEY =
  process.env['SUPABASE_SERVICE_ROLE_KEY'] ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const RUN_ID = Date.now().toString(36);

interface GoTrueAuthResponse {
  access_token?: string;
  user?: {
    id: string;
    email: string;
  };
}

interface ContractEntityRow {
  id: string;
  name: string;
  score: number;
}

describe.runIf(IS_INTEGRATION)('Supabase Local Docker Stack (live integration)', () => {
  it('signs up and signs in a user via GoTrue Auth', async () => {
    const email = `integration-${RUN_ID}@mono-magic.local`;
    const password = 'Password123!';

    const signUpRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({ email, password }),
    });
    expect(signUpRes.ok).toBe(true);
    const created = (await signUpRes.json()) as GoTrueAuthResponse;
    expect(created.user?.email).toBe(email);

    const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({ email, password }),
    });
    expect(signInRes.ok).toBe(true);
    const session = (await signInRes.json()) as GoTrueAuthResponse;
    expect(session.access_token).toBeTruthy();
    expect(session.user?.id).toBe(created.user?.id);
  });

  it('inserts, reads, and updates a row in Postgres via PostgREST', async () => {
    const rowId = `entity-${RUN_ID}`;
    const headers = {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      Prefer: 'return=representation',
    };

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/contract_entities`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: rowId,
        name: `Supabase Entity ${RUN_ID}`,
        score: 42,
      }),
    });
    expect(insertRes.ok).toBe(true);
    const inserted = (await insertRes.json()) as ContractEntityRow[];
    expect(inserted[0]?.id).toBe(rowId);
    expect(inserted[0]?.score).toBe(42);

    const patchRes = await fetch(
      `${SUPABASE_URL}/rest/v1/contract_entities?id=eq.${encodeURIComponent(rowId)}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ score: 99 }),
      }
    );
    expect(patchRes.ok).toBe(true);
    const updated = (await patchRes.json()) as ContractEntityRow[];
    expect(updated[0]?.score).toBe(99);

    const selectRes = await fetch(
      `${SUPABASE_URL}/rest/v1/contract_entities?id=eq.${encodeURIComponent(rowId)}`,
      { headers }
    );
    expect(selectRes.ok).toBe(true);
    const rows = (await selectRes.json()) as ContractEntityRow[];
    expect(rows).toHaveLength(1);
    expect(rows[0]?.name).toBe(`Supabase Entity ${RUN_ID}`);
    expect(rows[0]?.score).toBe(99);
  });

  it('creates a bucket, uploads, and downloads an object via Storage API', async () => {
    const bucketId = 'integration-artifacts';
    const objectPath = `hello-${RUN_ID}.txt`;
    const content = `Hello from Supabase integration run ${RUN_ID}`;
    const authHeaders = {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    };

    // Ensure bucket exists (409/400 duplicate is fine across repeated runs)
    await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: bucketId, name: bucketId, public: false }),
    });

    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${bucketId}/${objectPath}`,
      {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'text/plain',
          'x-upsert': 'true',
        },
        body: content,
      }
    );
    expect(uploadRes.ok).toBe(true);

    const downloadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${bucketId}/${objectPath}`,
      { headers: authHeaders }
    );
    expect(downloadRes.ok).toBe(true);
    expect(await downloadRes.text()).toBe(content);
  });
});
