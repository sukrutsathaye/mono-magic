import type {
  FirebaseAuthClientLike,
  FirebaseRealtimeClientLike,
  FirebaseServicesLike,
  FirebaseStorageClientLike,
  FirebaseStorageMetadataLike,
  FirebaseUserLike,
  FirestoreClientLike,
  FirestoreCollectionRefLike,
  FirestoreDocRefLike,
  FirestoreDocSnapshotLike,
  FirestoreQueryLike,
  FirestoreQuerySnapshotLike,
  FirestoreWhereOp,
} from './firebase-types.js';

interface StoredFirebaseUser {
  readonly user: FirebaseUserLike;
  readonly password: string;
}

interface StoredFirebaseObject {
  readonly meta: FirebaseStorageMetadataLike;
  readonly bytes: Uint8Array;
}

function createFirestoreQuery<T = Record<string, unknown>>(
  store: Map<string, Record<string, unknown>>,
  predicates: ReadonlyArray<(row: Record<string, unknown>) => boolean> = [],
  sorters: ReadonlyArray<{ readonly field: string; readonly dir: 'asc' | 'desc' }> = [],
  offsetVal = 0,
  limitVal?: number,
): FirestoreQueryLike<T> {
  return {
    where(field: string, opStr: FirestoreWhereOp, value: unknown): FirestoreQueryLike<T> {
      const nextPred = (row: Record<string, unknown>): boolean => {
        const rv = row[field];
        switch (opStr) {
          case '==':
            return rv === value;
          case '!=':
            return rv !== value;
          case 'in':
            return Array.isArray(value) && value.includes(rv);
          case '>':
            return Number(rv) > Number(value);
          case '>=':
            return Number(rv) >= Number(value);
          case '<':
            return Number(rv) < Number(value);
          case '<=':
            return Number(rv) <= Number(value);
          case 'array-contains':
            return Array.isArray(rv) && rv.includes(value);
        }
      };
      return createFirestoreQuery(store, [...predicates, nextPred], sorters, offsetVal, limitVal);
    },
    orderBy(field: string, directionStr: 'asc' | 'desc' = 'asc'): FirestoreQueryLike<T> {
      return createFirestoreQuery(
        store,
        predicates,
        [...sorters, { field, dir: directionStr }],
        offsetVal,
        limitVal,
      );
    },
    offset(nextOffset: number): FirestoreQueryLike<T> {
      return createFirestoreQuery(store, predicates, sorters, nextOffset, limitVal);
    },
    limit(nextLimit: number): FirestoreQueryLike<T> {
      return createFirestoreQuery(store, predicates, sorters, offsetVal, nextLimit);
    },
    async get(): Promise<FirestoreQuerySnapshotLike<T>> {
      let rows = Array.from(store.entries())
        .filter(([, doc]) => predicates.every((p) => p(doc)))
        .map(([id, doc]) => ({ id, doc: { ...doc } }));

      for (const sorter of sorters) {
        rows.sort((a, b) => {
          const av = a.doc[sorter.field];
          const bv = b.doc[sorter.field];
          if (av === bv) return 0;
          const cmp = (av as string | number) > (bv as string | number) ? 1 : -1;
          return sorter.dir === 'asc' ? cmp : -cmp;
        });
      }

      if (offsetVal > 0) {
        rows = rows.slice(offsetVal);
      }
      if (limitVal !== undefined) {
        rows = rows.slice(0, limitVal);
      }

      const docs: ReadonlyArray<FirestoreDocSnapshotLike<T>> = rows.map(({ id, doc }) => ({
        id,
        exists: true,
        data: () => doc as unknown as T,
      }));
      return { docs, size: docs.length };
    },
  };
}

/**
 * Creates a deterministic in-memory {@link FirebaseServicesLike} emulator suite for contract
 * compliance and unit testing without external network calls.
 */
export function createInMemoryFirebaseServices(): FirebaseServicesLike {
  let idCounter = 1;
  const usersByEmail = new Map<string, StoredFirebaseUser>();
  const tokensToUser = new Map<string, FirebaseUserLike>();
  let currentUser: FirebaseUserLike | null = null;
  const authListeners = new Set<(user: FirebaseUserLike | null) => void>();

  const collections = new Map<string, Map<string, Record<string, unknown>>>();
  const storageObjects = new Map<string, StoredFirebaseObject>();
  const realtimeSubscribers = new Map<
    string,
    Set<
      (envelope: {
        readonly channel: string;
        readonly event: string;
        readonly payload: unknown;
        readonly sentAtEpochMs: number;
        readonly senderId?: string;
      }) => void
    >
  >();

  const notifyAuth = (user: FirebaseUserLike | null): void => {
    for (const listener of authListeners) {
      listener(user);
    }
  };

  const makeFirebaseUser = (email: string, displayName?: string): FirebaseUserLike => {
    const uid = `fb-uid-${idCounter++}`;
    const user: FirebaseUserLike = {
      uid,
      email,
      displayName: displayName ?? null,
      roles: ['authenticated'],
      refreshToken: `fb-refresh-${uid}`,
      async getIdToken() {
        const token = `fb-id-token-${uid}-${idCounter++}`;
        tokensToUser.set(token, user);
        return token;
      },
    };
    return user;
  };

  const auth: FirebaseAuthClientLike = {
    get currentUser() {
      return currentUser;
    },
    async createUserWithEmailAndPassword(email, password, displayName) {
      if (usersByEmail.has(email)) {
        const err = new Error('The email address is already in use by another account.') as Error & {
          code: string;
        };
        err.code = 'auth/email-already-in-use';
        throw err;
      }
      const user = makeFirebaseUser(email, displayName);
      usersByEmail.set(email, { user, password });
      currentUser = user;
      notifyAuth(user);
      return { user };
    },
    async signInWithEmailAndPassword(email, password) {
      const record = usersByEmail.get(email);
      if (!record || record.password !== password) {
        const err = new Error('Invalid email or password') as Error & { code: string };
        err.code = 'auth/invalid-credential';
        throw err;
      }
      currentUser = record.user;
      notifyAuth(record.user);
      return { user: record.user };
    },
    async signInWithOAuthProvider(providerId) {
      const user = makeFirebaseUser(`${providerId}@example.com`, `${providerId} User`);
      currentUser = user;
      notifyAuth(user);
      return { user };
    },
    async signOut() {
      currentUser = null;
      notifyAuth(null);
    },
    async verifyIdToken(idToken) {
      const user = tokensToUser.get(idToken);
      if (!user) {
        const err = new Error('Invalid Firebase ID token') as Error & { code: string };
        err.code = 'auth/invalid-user-token';
        throw err;
      }
      return {
        uid: user.uid,
        email: user.email ?? undefined,
        name: user.displayName ?? undefined,
        roles: user.roles,
      };
    },
    async refreshIdToken() {
      if (!currentUser) {
        const err = new Error('No user signed in') as Error & { code: string };
        err.code = 'auth/user-token-expired';
        throw err;
      }
      const idToken = await currentUser.getIdToken(true);
      return {
        idToken,
        refreshToken: currentUser.refreshToken ?? `fb-refresh-${currentUser.uid}`,
        expiresInSeconds: 3600,
        user: currentUser,
      };
    },
    onAuthStateChanged(callback) {
      authListeners.add(callback);
      return () => {
        authListeners.delete(callback);
      };
    },
  };

  const firestore: FirestoreClientLike = {
    collection<T = Record<string, unknown>>(collectionPath: string): FirestoreCollectionRefLike<T> {
      let colStore = collections.get(collectionPath);
      if (!colStore) {
        colStore = new Map();
        collections.set(collectionPath, colStore);
      }
      const store = colStore;
      const baseQuery = createFirestoreQuery<T>(store);

      const makeDocRef = (docId?: string): FirestoreDocRefLike<T> => {
        const id = docId ?? `doc-${idCounter++}`;
        return {
          id,
          async get() {
            const raw = store.get(id);
            return {
              id,
              exists: raw !== undefined,
              data: () => (raw ? ({ ...raw } as unknown as T) : undefined),
            };
          },
          async set(data, options) {
            const existing = store.get(id);
            const next =
              options?.merge && existing
                ? { ...existing, ...(data as unknown as Record<string, unknown>), id }
                : { ...(data as unknown as Record<string, unknown>), id };
            store.set(id, next);
          },
          async update(patch) {
            const existing = store.get(id);
            if (!existing) {
              const err = new Error(`No document to update: ${collectionPath}/${id}`) as Error & {
                code: string;
              };
              err.code = 'firestore/not-found';
              throw err;
            }
            store.set(id, { ...existing, ...(patch as unknown as Record<string, unknown>), id });
          },
          async delete() {
            store.delete(id);
          },
        };
      };

      return {
        ...baseQuery,
        doc(id?: string) {
          return makeDocRef(id);
        },
        async add(data) {
          const ref = makeDocRef();
          await ref.set(data as unknown as T);
          return ref;
        },
      };
    },
    async runTransaction<TResult>(
      updateFunction: (txClient: FirestoreClientLike) => Promise<TResult>,
    ): Promise<TResult> {
      return updateFunction(firestore);
    },
  };

  const storage: FirebaseStorageClientLike = {
    async uploadBytes(path, data, metadata) {
      const meta: FirebaseStorageMetadataLike = {
        fullPath: path,
        size: data.byteLength,
        contentType: metadata?.contentType ?? 'application/octet-stream',
        md5Hash: `md5-${path}-${data.byteLength}`,
        updated: new Date().toISOString(),
        customMetadata: metadata?.customMetadata,
      };
      storageObjects.set(path, { meta, bytes: new Uint8Array(data) });
      return meta;
    },
    async getBytes(path) {
      const obj = storageObjects.get(path);
      if (!obj) {
        const err = new Error(`Object ${path} does not exist`) as Error & { code: string };
        err.code = 'storage/object-not-found';
        throw err;
      }
      return obj.bytes;
    },
    async getDownloadURL(path, options) {
      const action = options?.action ?? 'read';
      const exp = options?.expiresInSeconds ?? 3600;
      return `http://localhost:9199/v0/b/demo-mono-magic.appspot.com/o/${encodeURIComponent(path)}?alt=media&action=${action}&exp=${exp}&key=${path}`;
    },
    async deleteObject(path) {
      storageObjects.delete(path);
    },
    async list(prefix, options) {
      const all = Array.from(storageObjects.values())
        .filter((o) => !prefix || o.meta.fullPath.startsWith(prefix))
        .map((o) => o.meta);
      const offset = options?.pageToken ? Number.parseInt(options.pageToken, 10) || 0 : 0;
      const limit = options?.maxResults ?? 100;
      const slice = all.slice(offset, offset + limit);
      const nextPageToken =
        offset + slice.length < all.length ? String(offset + slice.length) : undefined;
      return {
        items: slice,
        nextPageToken,
      };
    },
  };

  const realtime: FirebaseRealtimeClientLike = {
    async publish(channel, event, payload, senderId) {
      const subs = realtimeSubscribers.get(channel);
      if (subs) {
        for (const cb of subs) {
          cb({
            channel,
            event,
            payload,
            sentAtEpochMs: Date.now(),
            senderId,
          });
        }
      }
    },
    onSnapshot<TPayload>(
      channel: string,
      callback: (envelope: {
        readonly channel: string;
        readonly event: string;
        readonly payload: TPayload;
        readonly sentAtEpochMs: number;
        readonly senderId?: string;
      }) => void,
    ) {
      let subs = realtimeSubscribers.get(channel);
      if (!subs) {
        subs = new Set();
        realtimeSubscribers.set(channel, subs);
      }
      const wrapped = callback as (envelope: {
        readonly channel: string;
        readonly event: string;
        readonly payload: unknown;
        readonly sentAtEpochMs: number;
        readonly senderId?: string;
      }) => void;
      subs.add(wrapped);
      return () => {
        subs?.delete(wrapped);
      };
    },
    async getPresence() {
      return [
        {
          userId: 'fb-user-1',
          status: 'online',
          updatedAtEpochMs: Date.now(),
          metadata: { client: 'firebase-rtdb' },
        },
      ];
    },
  };

  return {
    auth,
    firestore,
    storage,
    realtime,
  };
}
