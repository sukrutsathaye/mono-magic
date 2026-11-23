import {
  expectOk,
  runAuthProviderContractTests,
  runDataRepositoryContractTests,
  runStorageProviderContractTests,
  type ContractTestEntity,
} from '@mono-magic/data-access-ts-interfaces/testing';
import { describe, expect, it } from 'vitest';
import {
  applyQuerySpecToPostgrest,
  buildPostgrestQueryPlan,
  createInMemorySupabaseClient,
  normalizeSupabaseError,
  SupabaseAuthProvider,
  SupabaseDataRepository,
  SupabaseRealtimeProvider,
  SupabaseStorageProvider,
  type SupabaseClientLike,
} from '../index.js';

describe('@mono-magic/data-access-ts-supabase', () => {
  runDataRepositoryContractTests(async () => {
    const client = createInMemorySupabaseClient();
    return new SupabaseDataRepository<ContractTestEntity, string>(client, 'contract_entities');
  });

  runAuthProviderContractTests(async () => {
    const client = createInMemorySupabaseClient();
    return new SupabaseAuthProvider(client);
  });

  runStorageProviderContractTests(async () => {
    const client = createInMemorySupabaseClient();
    return new SupabaseStorageProvider(client, 'contracts-bucket');
  });

  describe('normalizeSupabaseError', () => {
    it('maps known PostgREST, Postgres, GoTrue, and HTTP status error codes', () => {
      const notFound = normalizeSupabaseError({
        code: 'PGRST116',
        message: 'Row not found',
        status: 406,
        details: '0 rows',
        hint: 'Check id',
      });
      expect(notFound.code).toBe('NOT_FOUND');
      expect(notFound.retryable).toBe(false);
      expect(notFound.details).toEqual({
        supabaseCode: 'PGRST116',
        httpStatus: 406,
        details: '0 rows',
        hint: 'Check id',
      });

      const conflict = normalizeSupabaseError({ code: '23505', message: 'Duplicate key' });
      expect(conflict.code).toBe('CONFLICT');

      const rateLimited = normalizeSupabaseError({ status: 429, message: 'Too many requests' });
      expect(rateLimited.code).toBe('RATE_LIMITED');
      expect(rateLimited.retryable).toBe(true);

      const unauthorizedMsg = normalizeSupabaseError({ message: 'Invalid login credentials' });
      expect(unauthorizedMsg.code).toBe('UNAUTHORIZED');

      const forbiddenMsg = normalizeSupabaseError({ message: 'Permission denied for table' });
      expect(forbiddenMsg.code).toBe('FORBIDDEN');

      const conflictMsg = normalizeSupabaseError({ message: 'Record already exists' });
      expect(conflictMsg.code).toBe('CONFLICT');

      const timeoutMsg = normalizeSupabaseError({ message: 'Query timed out' });
      expect(timeoutMsg.code).toBe('TIMEOUT');
      expect(timeoutMsg.retryable).toBe(true);

      const notFoundMsg = normalizeSupabaseError({ message: 'Item not found' });
      expect(notFoundMsg.code).toBe('NOT_FOUND');

      const rateLimitMsg = normalizeSupabaseError({ message: 'Exceeded rate limit' });
      expect(rateLimitMsg.code).toBe('RATE_LIMITED');

      const stdErr = normalizeSupabaseError(new Error('Unexpected crash'));
      expect(stdErr.code).toBe('INTERNAL');
      expect(stdErr.message).toBe('Unexpected crash');

      const emptyStdErr = normalizeSupabaseError(new Error(''), 'Default msg');
      expect(emptyStdErr.message).toBe('Default msg');

      const primitiveErr = normalizeSupabaseError('raw string error', 'Fallback failure');
      expect(primitiveErr.code).toBe('INTERNAL');
      expect(primitiveErr.message).toBe('Fallback failure');
    });
  });

  describe('QuerySpec -> PostgREST query mapper & repository filtering', () => {
    it('supports all filter operators, sorting, limit, offset, and cursor pagination', async () => {
      const client = createInMemorySupabaseClient();
      const repo = new SupabaseDataRepository<ContractTestEntity, string>(client, {
        tableName: 'items',
        idColumn: 'id',
      });

      expectOk(await repo.create({ id: '1', name: 'Alpha', score: 10 }));
      expectOk(await repo.create({ id: '2', name: 'Beta', score: 20 }));
      expectOk(await repo.create({ id: '3', name: 'Alphabet', score: 30 }));
      expectOk(await repo.create({ id: '4', name: 'Gamma', score: 40 }));

      // Duplicate key error
      const dupRes = await repo.create({ id: '1', name: 'Dup', score: 0 });
      expect(dupRes.ok).toBe(false);
      if (!dupRes.ok) {
        expect(dupRes.error.code).toBe('CONFLICT');
      }

      // Filter operators: neq, in, gt, gte, lt, lte, contains
      const filtered = expectOk(
        await repo.findMany({
          filters: [
            { field: 'name', operator: 'neq', value: 'Gamma' },
            { field: 'name', operator: 'contains', value: 'alph' },
            { field: 'id', operator: 'in', value: ['1', '3'] },
            { field: 'score', operator: 'gt', value: 5 },
            { field: 'score', operator: 'gte', value: 10 },
            { field: 'score', operator: 'lt', value: 35 },
            { field: 'score', operator: 'lte', value: 30 },
          ],
          sort: [{ field: 'score', direction: 'desc' }],
        }),
      );
      expect(filtered.items.map((i) => i.id)).toEqual(['3', '1']);

      // Pagination with limit & offset
      const page1 = expectOk(
        await repo.findMany({
          sort: [{ field: 'score', direction: 'asc' }],
          limit: 2,
          offset: 0,
        }),
      );
      expect(page1.items.map((i) => i.id)).toEqual(['1', '2']);
      expect(page1.hasMore).toBe(true);
      expect(page1.nextCursor).toBe('2');

      // Pagination with cursor
      const page2 = expectOk(
        await repo.findMany({
          sort: [{ field: 'score', direction: 'asc' }],
          limit: 2,
          cursor: page1.nextCursor,
        }),
      );
      expect(page2.items.map((i) => i.id)).toEqual(['3', '4']);
      expect(page2.hasMore).toBe(false);

      // Update non-existent entity
      const missingUpdate = await repo.update('non-existent', { score: 99 });
      expect(missingUpdate.ok).toBe(false);
      if (!missingUpdate.ok) {
        expect(missingUpdate.error.code).toBe('NOT_FOUND');
      }

      // Plan with offset only
      const offsetOnlyPlan = buildPostgrestQueryPlan<ContractTestEntity>({ offset: 5 });
      expect(offsetOnlyPlan.range).toEqual({ from: 5, to: 54 });

      // Apply query spec directly
      const builder = applyQuerySpecToPostgrest(client.from('items'), {
        filters: [{ field: 'id', operator: 'in', value: '1' }],
        limit: 1,
      });
      const rawRes = await builder;
      expect(rawRes.data?.length).toBe(1);
    });

    it('handles repository error branches and PGRST116 in findById', async () => {
      const base = createInMemorySupabaseClient();
      let mode: 'pgrst116' | 'error' | 'null-data' | 'throw' = 'pgrst116';

      const faultyClient: SupabaseClientLike = {
        ...base,
        from<TRow = Record<string, unknown>>(): import('../index.js').SupabaseQueryBuilderLike<TRow> {
          if (mode === 'throw') {
            throw new Error('DB connection dropped');
          }
          const errObj =
            mode === 'pgrst116'
              ? { code: 'PGRST116', message: 'No rows' }
              : mode === 'error'
                ? { code: '42501', message: 'Forbidden table' }
                : null;
          const builder = {
            select: () => builder,
            insert: () => builder,
            update: () => builder,
            delete: () => builder,
            eq: () => builder,
            neq: () => builder,
            in: () => builder,
            gt: () => builder,
            gte: () => builder,
            lt: () => builder,
            lte: () => builder,
            ilike: () => builder,
            order: () => builder,
            range: () => builder,
            limit: () => builder,
            single: () => Promise.resolve({ data: null, error: errObj }),
            maybeSingle: () => Promise.resolve({ data: null, error: errObj }),
            then: (onfulfilled?: ((v: unknown) => unknown) | null) =>
              Promise.resolve({ data: null, error: errObj }).then(onfulfilled ?? undefined),
          };
          return builder as unknown as import('../index.js').SupabaseQueryBuilderLike<TRow>;
        },
      };

      const repo = new SupabaseDataRepository<ContractTestEntity, string>(faultyClient, {
        tableName: 'faulty',
      });

      // PGRST116 in findById returns ok(null)
      expect(expectOk(await repo.findById('1'))).toBeNull();

      mode = 'error';
      expect((await repo.findById('1')).ok).toBe(false);
      expect((await repo.findMany()).ok).toBe(false);
      expect((await repo.create({ name: 'X', score: 1 })).ok).toBe(false);
      expect((await repo.update('1', { score: 2 })).ok).toBe(false);
      expect((await repo.delete('1')).ok).toBe(false);

      mode = 'null-data';
      expect((await repo.create({ name: 'X', score: 1 })).ok).toBe(false);
      expect((await repo.update('1', { score: 2 })).ok).toBe(false);

      mode = 'throw';
      expect((await repo.findById('1')).ok).toBe(false);
      expect((await repo.findMany()).ok).toBe(false);
      expect((await repo.create({ name: 'X', score: 1 })).ok).toBe(false);
      expect((await repo.update('1', { score: 2 })).ok).toBe(false);
      expect((await repo.delete('1')).ok).toBe(false);
    });
  });

  describe('SupabaseAuthProvider edge cases', () => {
    it('supports OAuth sign-in and handles invalid credentials, missing sessions, and exceptions', async () => {
      const client = createInMemorySupabaseClient();
      const auth = new SupabaseAuthProvider(client);

      const badLogin = await auth.signInWithEmail({
        email: 'missing@example.com',
        password: 'wrong',
      });
      expect(badLogin.ok).toBe(false);

      const emptyVerify = await auth.verifyToken('   ');
      expect(emptyVerify.ok).toBe(false);

      const badVerify = await auth.verifyToken('invalid-jwt');
      expect(badVerify.ok).toBe(false);

      // Refresh when logged out
      const badRefresh = await auth.refreshToken();
      expect(badRefresh.ok).toBe(false);

      const oauthSession = expectOk(await auth.signInWithOAuth('github'));
      expect(oauthSession.user.email).toBe('github@example.com');

      // Duplicate sign-up
      expectOk(
        await auth.signUpWithEmail({
          email: 'dup@example.com',
          password: 'Password123!',
        }),
      );
      const dupSignUp = await auth.signUpWithEmail({
        email: 'dup@example.com',
        password: 'Password123!',
      });
      expect(dupSignUp.ok).toBe(false);

      // Faulty auth client returning null sessions or errors
      const nullSessionAuth = new SupabaseAuthProvider({
        auth: {
          ...client.auth,
          signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
          signUp: async () => ({ data: { user: null, session: null }, error: null }),
          signInWithOAuth: async () => ({ data: { provider: 'google', url: 'http://x' }, error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
          refreshSession: async () => ({ data: { user: null, session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          signOut: async () => ({ error: { message: 'Sign out failed', status: 500 } }),
        },
      });

      expect((await nullSessionAuth.signInWithEmail({ email: 'a@b.c', password: '1' })).ok).toBe(
        false,
      );
      expect((await nullSessionAuth.signUpWithEmail({ email: 'a@b.c', password: '1' })).ok).toBe(
        false,
      );
      expect((await nullSessionAuth.signInWithOAuth('google')).ok).toBe(false);
      expect((await nullSessionAuth.refreshToken('tok')).ok).toBe(false);
      expect((await nullSessionAuth.verifyToken('tok')).ok).toBe(false);
      expect((await nullSessionAuth.signOut()).ok).toBe(false);
    });
  });

  describe('SupabaseStorageProvider edge cases', () => {
    it('supports write signed URLs, Blob download, and error branches', async () => {
      const client = createInMemorySupabaseClient();
      const storage = new SupabaseStorageProvider(client);

      const missingDownload = await storage.download('missing.bin');
      expect(missingDownload.ok).toBe(false);

      const invalidSign = await storage.getSignedUrl('file.txt', { expiresInSeconds: 0 });
      expect(invalidSign.ok).toBe(false);

      const writeUrl = expectOk(
        await storage.getSignedUrl('upload/file.txt', {
          expiresInSeconds: 120,
          action: 'write',
        }),
      );
      expect(writeUrl.url).toContain('upload/file.txt');

      // Faulty storage bucket for Blob download & error branches
      const blobClient: SupabaseClientLike = {
        ...client,
        storage: {
          from: () => ({
            upload: async () => ({ data: null, error: { message: 'Upload error', status: 500 } }),
            download: async (path) =>
              path === 'blob'
                ? { data: new Blob(['blob-data']), error: null }
                : { data: null, error: null },
            createSignedUrl: async () => ({ data: null, error: null }),
            createSignedUploadUrl: async () => ({ data: null, error: null }),
            remove: async () => ({ data: null, error: { message: 'Remove failed' } }),
            list: async () => ({ data: null, error: { message: 'List failed' } }),
          }),
        },
      };
      const faultyStorage = new SupabaseStorageProvider(blobClient, 'faulty');
      expect((await faultyStorage.upload('a', new Uint8Array([1]))).ok).toBe(false);
      const blobBytes = expectOk(await faultyStorage.download('blob'));
      expect(new TextDecoder().decode(blobBytes)).toBe('blob-data');
      expect((await faultyStorage.download('null-data')).ok).toBe(false);
      expect((await faultyStorage.getSignedUrl('a', { expiresInSeconds: 10 })).ok).toBe(false);
      expect(
        (await faultyStorage.getSignedUrl('a', { expiresInSeconds: 10, action: 'write' })).ok,
      ).toBe(false);
      expect((await faultyStorage.delete('a')).ok).toBe(false);
      expect((await faultyStorage.list()).ok).toBe(false);
    });
  });

  describe('SupabaseRealtimeProvider', () => {
    it('publishes, subscribes, unsubscribes, queries presence, and handles timeout/error statuses', async () => {
      const client = createInMemorySupabaseClient();
      const realtime = new SupabaseRealtimeProvider(client);
      const received: Array<{ readonly event: string; readonly payload: { readonly text: string } }> = [];

      const unsubscribe = expectOk(
        await realtime.subscribe<{ readonly text: string }>('room-1', (envelope) => {
          received.push({ event: envelope.event, payload: envelope.payload });
        }),
      );

      expectOk(await realtime.publish('room-1', 'chat.message', { text: 'Hello Supabase' }));
      expect(received).toEqual([{ event: 'chat.message', payload: { text: 'Hello Supabase' } }]);

      const presence = expectOk(await realtime.presence('room-1'));
      expect(presence.length).toBeGreaterThanOrEqual(1);
      expect(presence[0]?.status).toBe('online');

      await unsubscribe();

      // Test timeout and error statuses from channel.send
      let sendStatus: 'timed out' | 'error' = 'timed out';
      const statusClient: SupabaseClientLike = {
        ...client,
        removeChannel: undefined,
        channel: () => ({
          on() {
            return this;
          },
          subscribe() {
            return this;
          },
          async send() {
            return sendStatus;
          },
          presenceState() {
            return {};
          },
          async unsubscribe() {
            return 'ok';
          },
        }),
      };

      const statusRealtime = new SupabaseRealtimeProvider(statusClient);
      const timeoutRes = await statusRealtime.publish('ch-1', 'ev', {});
      expect(timeoutRes.ok).toBe(false);
      if (!timeoutRes.ok) {
        expect(timeoutRes.error.code).toBe('TIMEOUT');
      }

      sendStatus = 'error';
      const errRes = await statusRealtime.publish('ch-2', 'ev', {});
      expect(errRes.ok).toBe(false);
      if (!errRes.ok) {
        expect(errRes.error.code).toBe('UNAVAILABLE');
      }

      const unsub2 = expectOk(await statusRealtime.subscribe('ch-3', () => undefined));
      await unsub2();
    });
  });
});
