import {
  hasFacebookAuth,
  hasGitHubAuth,
  hasGoogleAuth,
  isSocialAuthProvider,
} from '@mono-magic/data-access-ts-interfaces';
import {
  expectOk,
  runAuthProviderContractTests,
  runDataRepositoryContractTests,
  runStorageProviderContractTests,
  type ContractTestEntity,
} from '@mono-magic/data-access-ts-interfaces/testing';
import { describe, expect, it } from 'vitest';
import {
  buildFirestoreQueryPlan,
  createInMemoryFirebaseServices,
  FirebaseAuthProvider,
  FirebaseFirestoreRepository,
  FirebaseRealtimeProvider,
  FirebaseStorageProvider,
  normalizeFirebaseError,
} from '../index.js';

describe('@mono-magic/data-access-ts-firebase', () => {
  runDataRepositoryContractTests(async () => {
    const services = createInMemoryFirebaseServices();
    return new FirebaseFirestoreRepository<ContractTestEntity, string>(
      services,
      'contract_entities',
    );
  });

  runAuthProviderContractTests(async () => {
    const services = createInMemoryFirebaseServices();
    return new FirebaseAuthProvider(services);
  });

  runStorageProviderContractTests(async () => {
    const services = createInMemoryFirebaseServices();
    return new FirebaseStorageProvider(services);
  });

  describe('normalizeFirebaseError', () => {
    it('maps Firebase Auth, Firestore, and Storage error codes and messages', () => {
      const authConflict = normalizeFirebaseError({
        code: 'auth/email-already-in-use',
        message: 'Email already in use',
        customData: { email: 'test@example.com' },
      });
      expect(authConflict.code).toBe('CONFLICT');
      expect(authConflict.details).toEqual({
        firebaseCode: 'auth/email-already-in-use',
        customData: { email: 'test@example.com' },
      });

      const fsNotFound = normalizeFirebaseError({
        code: 'firestore/not-found',
        message: 'Document missing',
      });
      expect(fsNotFound.code).toBe('NOT_FOUND');

      const stRateLimited = normalizeFirebaseError({
        code: 'storage/quota-exceeded',
        message: 'Quota exceeded',
      });
      expect(stRateLimited.code).toBe('RATE_LIMITED');
      expect(stRateLimited.retryable).toBe(true);

      // Message-based fallbacks
      expect(normalizeFirebaseError({ message: 'No document to update' }).code).toBe('NOT_FOUND');
      expect(normalizeFirebaseError({ message: 'Permission denied on resource' }).code).toBe(
        'FORBIDDEN',
      );
      expect(normalizeFirebaseError({ message: 'User is unauthenticated' }).code).toBe(
        'UNAUTHORIZED',
      );
      expect(normalizeFirebaseError({ message: 'Entity already exists' }).code).toBe('CONFLICT');
      expect(normalizeFirebaseError({ message: 'Too many requests' }).code).toBe('RATE_LIMITED');
      expect(normalizeFirebaseError({ message: 'Deadline exceeded' }).code).toBe('TIMEOUT');
      expect(normalizeFirebaseError({ message: 'Generic crash' }).code).toBe('INTERNAL');
      expect(normalizeFirebaseError('primitive string', 'Fallback error').code).toBe('INTERNAL');
    });
  });

  describe('QuerySpec -> Firestore query mapper & repository operations', () => {
    it('supports all filter operators, sorting, limit, offset, cursor, and duplicate detection', async () => {
      const services = createInMemoryFirebaseServices();
      const repo = new FirebaseFirestoreRepository<ContractTestEntity, string>(services, 'items');

      expectOk(await repo.create({ id: '1', name: 'Alpha', score: 10 }));
      expectOk(await repo.create({ id: '2', name: 'Beta', score: 20 }));
      expectOk(await repo.create({ id: '3', name: 'Alphabet', score: 30 }));
      expectOk(await repo.create({ id: '4', name: 'Gamma', score: 40 }));

      // Duplicate document ID
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
          limit: 5,
          offset: 0,
        }),
      );
      expect(filtered.items.map((i) => i.id)).toEqual(['3', '1']);

      // Pagination without contains filter
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

      const page2 = expectOk(
        await repo.findMany({
          sort: [{ field: 'score', direction: 'asc' }],
          limit: 2,
          cursor: page1.nextCursor,
        }),
      );
      expect(page2.items.map((i) => i.id)).toEqual(['3', '4']);

      // Update missing document
      const missingUpdate = await repo.update('missing-doc', { score: 99 });
      expect(missingUpdate.ok).toBe(false);
      if (!missingUpdate.ok) {
        expect(missingUpdate.error.code).toBe('NOT_FOUND');
      }

      // Plan check for single value 'in'
      const plan = buildFirestoreQueryPlan<ContractTestEntity>({
        filters: [{ field: 'id', operator: 'in', value: '1' }],
      });
      expect(plan.whereClauses[0]?.value).toEqual(['1']);
    });
  });

  describe('FirebaseAuthProvider edge cases', () => {
    it('supports OAuth sign-in and handles invalid credentials, duplicate emails, and empty tokens', async () => {
      const services = createInMemoryFirebaseServices();
      const auth = new FirebaseAuthProvider(services);

      const badLogin = await auth.signInWithEmail({
        email: 'missing@example.com',
        password: 'wrong',
      });
      expect(badLogin.ok).toBe(false);
      if (!badLogin.ok) {
        expect(badLogin.error.code).toBe('UNAUTHORIZED');
      }

      const emptyVerify = await auth.verifyToken('  ');
      expect(emptyVerify.ok).toBe(false);
      if (!emptyVerify.ok) {
        expect(emptyVerify.error.code).toBe('VALIDATION');
      }

      const invalidVerify = await auth.verifyToken('bad-token');
      expect(invalidVerify.ok).toBe(false);
      if (!invalidVerify.ok) {
        expect(invalidVerify.error.code).toBe('UNAUTHORIZED');
      }

      const oauthSession = expectOk(await auth.signInWithOAuth('google'));
      expect(oauthSession.user.email).toBe('google@example.com');

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
      if (!dupSignUp.ok) {
        expect(dupSignUp.error.code).toBe('CONFLICT');
      }
    });
  });

  describe('FirebaseStorageProvider edge cases', () => {
    it('validates expiresInSeconds and handles missing downloads and paginated list', async () => {
      const services = createInMemoryFirebaseServices();
      const storage = new FirebaseStorageProvider(services);

      const missing = await storage.download('non-existent.txt');
      expect(missing.ok).toBe(false);
      if (!missing.ok) {
        expect(missing.error.code).toBe('NOT_FOUND');
      }

      const badSign = await storage.getSignedUrl('a.txt', { expiresInSeconds: -5 });
      expect(badSign.ok).toBe(false);
      if (!badSign.ok) {
        expect(badSign.error.code).toBe('VALIDATION');
      }

      const payload = new TextEncoder().encode('data');
      expectOk(await storage.upload('dir/1.txt', payload));
      expectOk(await storage.upload('dir/2.txt', payload));

      const page1 = expectOk(await storage.list('dir/', { limit: 1 }));
      expect(page1.items.length).toBe(1);
      expect(page1.hasMore).toBe(true);
      expect(page1.nextCursor).toBe('1');
    });
  });

  describe('FirebaseRealtimeProvider', () => {
    it('publishes, subscribes via onSnapshot, unsubscribes, and reads presence', async () => {
      const services = createInMemoryFirebaseServices();
      const realtime = new FirebaseRealtimeProvider(services);
      const messages: Array<{ readonly event: string; readonly payload: { readonly count: number } }> = [];

      const unsubscribe = expectOk(
        await realtime.subscribe<{ readonly count: number }>('live-feed', (msg) => {
          messages.push({ event: msg.event, payload: msg.payload });
        }),
      );

      expectOk(await realtime.publish('live-feed', 'counter.tick', { count: 42 }));
      expect(messages).toEqual([{ event: 'counter.tick', payload: { count: 42 } }]);

      const presence = expectOk(await realtime.presence('live-feed'));
      expect(presence.length).toBe(1);
      expect(presence[0]?.userId).toBe('fb-user-1');

      await unsubscribe();
    });
  });

  describe('FirebaseAuthProvider social logins (Google & GitHub)', () => {
    it('supports Google and GitHub sign-in without implementing unused social providers', async () => {
      const auth = new FirebaseAuthProvider(createInMemoryFirebaseServices());

      expect(hasGoogleAuth(auth)).toBe(true);
      expect(hasGitHubAuth(auth)).toBe(true);
      expect(hasFacebookAuth(auth)).toBe(false);
      expect(isSocialAuthProvider(auth)).toBe(false);

      const googleSession = expectOk(
        await auth.signInWithGoogle({ redirectTo: 'https://app.mono-magic.local/auth/callback' }),
      );
      expect(googleSession.accessToken).toBeTruthy();

      const githubSession = expectOk(
        await auth.signInWithGitHub({ scopes: ['read:user', 'user:email'] }),
      );
      expect(githubSession.accessToken).toBeTruthy();
    });
  });
});
