import type {
  SupabaseAuthClientLike,
  SupabaseClientLike,
  SupabasePostgrestResponse,
  SupabaseQueryBuilderLike,
  SupabaseRealtimeChannelLike,
  SupabaseSessionLike,
  SupabaseStorageBucketLike,
  SupabaseStorageFileObject,
  SupabaseUserLike,
} from './supabase-types.js';

interface StoredUser {
  readonly user: SupabaseUserLike;
  readonly password: string;
}

interface StoredFile {
  readonly key: string;
  readonly data: Uint8Array;
  readonly contentType: string;
  readonly updatedAt: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

class InMemoryPostgrestQueryBuilder<TRow = Record<string, unknown>>
  implements SupabaseQueryBuilderLike<TRow>
{
  private readonly tableStore: Map<string, Record<string, unknown>>;
  private mode: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private pendingInsert: ReadonlyArray<Record<string, unknown>> = [];
  private pendingPatch: Record<string, unknown> = {};
  private readonly predicates: Array<(row: Record<string, unknown>) => boolean> = [];
  private readonly sorters: Array<{ readonly col: string; readonly asc: boolean }> = [];
  private rangeBounds?: { readonly from: number; readonly to: number };
  private limitCount?: number;
  private nextIdCounter: () => number;

  public constructor(
    tableStore: Map<string, Record<string, unknown>>,
    nextIdCounter: () => number,
  ) {
    this.tableStore = tableStore;
    this.nextIdCounter = nextIdCounter;
  }

  public select(): SupabaseQueryBuilderLike<TRow> {
    if (this.mode === 'select') {
      this.mode = 'select';
    }
    return this;
  }

  public insert(
    values: Readonly<Record<string, unknown>> | ReadonlyArray<Readonly<Record<string, unknown>>>,
  ): SupabaseQueryBuilderLike<TRow> {
    this.mode = 'insert';
    this.pendingInsert = Array.isArray(values)
      ? values.map((v) => ({ ...v }))
      : [{ ...(values as Readonly<Record<string, unknown>>) }];
    return this;
  }

  public update(values: Readonly<Record<string, unknown>>): SupabaseQueryBuilderLike<TRow> {
    this.mode = 'update';
    this.pendingPatch = { ...values };
    return this;
  }

  public delete(): SupabaseQueryBuilderLike<TRow> {
    this.mode = 'delete';
    return this;
  }

  public eq(column: string, value: unknown): SupabaseQueryBuilderLike<TRow> {
    this.predicates.push((row) => row[column] === value);
    return this;
  }

  public neq(column: string, value: unknown): SupabaseQueryBuilderLike<TRow> {
    this.predicates.push((row) => row[column] !== value);
    return this;
  }

  public in(column: string, values: ReadonlyArray<unknown>): SupabaseQueryBuilderLike<TRow> {
    this.predicates.push((row) => values.includes(row[column]));
    return this;
  }

  public gt(column: string, value: unknown): SupabaseQueryBuilderLike<TRow> {
    this.predicates.push((row) => Number(row[column]) > Number(value));
    return this;
  }

  public gte(column: string, value: unknown): SupabaseQueryBuilderLike<TRow> {
    this.predicates.push((row) => Number(row[column]) >= Number(value));
    return this;
  }

  public lt(column: string, value: unknown): SupabaseQueryBuilderLike<TRow> {
    this.predicates.push((row) => Number(row[column]) < Number(value));
    return this;
  }

  public lte(column: string, value: unknown): SupabaseQueryBuilderLike<TRow> {
    this.predicates.push((row) => Number(row[column]) <= Number(value));
    return this;
  }

  public ilike(column: string, pattern: string): SupabaseQueryBuilderLike<TRow> {
    const clean = pattern.replace(/^%|%$/g, '').toLowerCase();
    this.predicates.push((row) => String(row[column] ?? '').toLowerCase().includes(clean));
    return this;
  }

  public order(
    column: string,
    options?: { readonly ascending?: boolean },
  ): SupabaseQueryBuilderLike<TRow> {
    this.sorters.push({ col: column, asc: options?.ascending ?? true });
    return this;
  }

  public range(from: number, to: number): SupabaseQueryBuilderLike<TRow> {
    this.rangeBounds = { from, to };
    return this;
  }

  public limit(count: number): SupabaseQueryBuilderLike<TRow> {
    this.limitCount = count;
    return this;
  }

  private execute(): SupabasePostgrestResponse<ReadonlyArray<TRow>> {
    if (this.mode === 'insert') {
      const inserted: TRow[] = [];
      for (const item of this.pendingInsert) {
        const id =
          typeof item['id'] === 'string' && item['id'].length > 0
            ? item['id']
            : `supa-${this.nextIdCounter()}`;
        if (this.tableStore.has(id)) {
          return {
            data: null,
            error: {
              code: '23505',
              message: `duplicate key value violates unique constraint (${id})`,
              status: 409,
            },
          };
        }
        const stored = { ...item, id };
        this.tableStore.set(id, stored);
        inserted.push(stored as unknown as TRow);
      }
      return { data: inserted, error: null, count: inserted.length, status: 201 };
    }

    const matchingEntries = Array.from(this.tableStore.entries()).filter(([, row]) =>
      this.predicates.every((pred) => pred(row)),
    );

    if (this.mode === 'update') {
      const updated: TRow[] = [];
      for (const [key, row] of matchingEntries) {
        const merged = { ...row, ...this.pendingPatch };
        this.tableStore.set(key, merged);
        updated.push(merged as unknown as TRow);
      }
      return { data: updated, error: null, count: updated.length, status: 200 };
    }

    if (this.mode === 'delete') {
      const deleted: TRow[] = [];
      for (const [key, row] of matchingEntries) {
        this.tableStore.delete(key);
        deleted.push(row as unknown as TRow);
      }
      return { data: deleted, error: null, count: deleted.length, status: 200 };
    }

    let rows = matchingEntries.map(([, row]) => ({ ...row }));
    const totalCount = rows.length;

    for (const sorter of this.sorters) {
      rows.sort((a, b) => {
        const av = a[sorter.col];
        const bv = b[sorter.col];
        if (av === bv) return 0;
        const cmp = (av as string | number) > (bv as string | number) ? 1 : -1;
        return sorter.asc ? cmp : -cmp;
      });
    }

    if (this.rangeBounds) {
      rows = rows.slice(this.rangeBounds.from, this.rangeBounds.to + 1);
    } else if (this.limitCount !== undefined) {
      rows = rows.slice(0, this.limitCount);
    }

    return {
      data: rows as unknown as ReadonlyArray<TRow>,
      error: null,
      count: totalCount,
      status: 200,
    };
  }

  public then<TResult1 = SupabasePostgrestResponse<ReadonlyArray<TRow>>, TResult2 = never>(
    onfulfilled?:
      | ((value: SupabasePostgrestResponse<ReadonlyArray<TRow>>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }

  public single(): PromiseLike<SupabasePostgrestResponse<TRow>> {
    const res = this.execute();
    if (res.error) {
      return Promise.resolve({ data: null, error: res.error, status: res.status });
    }
    const items = res.data ?? [];
    if (items.length === 0) {
      return Promise.resolve({
        data: null,
        error: {
          code: 'PGRST116',
          message: 'JSON object requested, multiple (or no) rows returned',
          status: 406,
        },
        status: 406,
      });
    }
    return Promise.resolve({ data: items[0], error: null, status: res.status });
  }

  public maybeSingle(): PromiseLike<SupabasePostgrestResponse<TRow>> {
    const res = this.execute();
    if (res.error) {
      return Promise.resolve({ data: null, error: res.error, status: res.status });
    }
    const items = res.data ?? [];
    return Promise.resolve({
      data: items.length > 0 ? items[0] : null,
      error: null,
      status: res.status,
    });
  }
}

/**
 * Creates a deterministic in-memory {@link SupabaseClientLike} emulator for contract compliance
 * and unit testing without external network calls.
 */
export function createInMemorySupabaseClient(): SupabaseClientLike {
  let idCounter = 1;
  const usersByEmail = new Map<string, StoredUser>();
  const tokensToUser = new Map<string, SupabaseUserLike>();
  let currentSession: SupabaseSessionLike | null = null;
  const authListeners = new Set<(event: string, session: SupabaseSessionLike | null) => void>();

  const tables = new Map<string, Map<string, Record<string, unknown>>>();
  const buckets = new Map<string, Map<string, StoredFile>>();
  const channelListeners = new Map<
    string,
    Set<
      (payload: {
        readonly event: string;
        readonly payload: unknown;
        readonly sentAtEpochMs?: number;
        readonly senderId?: string;
      }) => void
    >
  >();
  const channelPresence = new Map<string, Record<string, ReadonlyArray<Record<string, unknown>>>>();

  const notifyAuth = (event: string, session: SupabaseSessionLike | null): void => {
    for (const listener of authListeners) {
      listener(event, session);
    }
  };

  const makeSession = (user: SupabaseUserLike): SupabaseSessionLike => {
    const accessToken = `supa-jwt-${user.id}-${idCounter++}`;
    const refreshToken = `supa-refresh-${user.id}-${idCounter++}`;
    tokensToUser.set(accessToken, user);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user,
    };
  };

  const auth: SupabaseAuthClientLike = {
    async signUp({ email, password, options }) {
      if (usersByEmail.has(email)) {
        return {
          data: { user: null, session: null },
          error: { code: 'user_already_exists', message: 'User already registered', status: 422 },
        };
      }
      const user: SupabaseUserLike = {
        id: `user-${idCounter++}`,
        email,
        role: 'authenticated',
        user_metadata: options?.data ?? {},
        app_metadata: { provider: 'email', roles: ['authenticated'] },
      };
      usersByEmail.set(email, { user, password });
      currentSession = makeSession(user);
      notifyAuth('SIGNED_IN', currentSession);
      return { data: { user, session: currentSession }, error: null };
    },

    async signInWithPassword({ email, password }) {
      const record = usersByEmail.get(email);
      if (!record || record.password !== password) {
        return {
          data: { user: null, session: null },
          error: {
            code: 'invalid_credentials',
            message: 'Invalid login credentials',
            status: 400,
          },
        };
      }
      currentSession = makeSession(record.user);
      notifyAuth('SIGNED_IN', currentSession);
      return { data: { user: record.user, session: currentSession }, error: null };
    },

    async signInWithOAuth({ provider }) {
      const user: SupabaseUserLike = {
        id: `oauth-${provider}-${idCounter++}`,
        email: `${provider}@example.com`,
        role: 'authenticated',
        user_metadata: { display_name: `${provider} User` },
        app_metadata: { provider, roles: ['authenticated'] },
      };
      currentSession = makeSession(user);
      notifyAuth('SIGNED_IN', currentSession);
      return {
        data: { provider, url: `http://localhost:54321/auth/v1/authorize?provider=${provider}`, session: currentSession },
        error: null,
      };
    },

    async signOut() {
      currentSession = null;
      notifyAuth('SIGNED_OUT', null);
      return { error: null };
    },

    async getSession() {
      return { data: { session: currentSession }, error: null };
    },

    async refreshSession() {
      if (!currentSession) {
        return {
          data: { user: null, session: null },
          error: { code: 'invalid_credentials', message: 'No session to refresh', status: 401 },
        };
      }
      currentSession = makeSession(currentSession.user);
      notifyAuth('TOKEN_REFRESHED', currentSession);
      return { data: { user: currentSession.user, session: currentSession }, error: null };
    },

    async getUser(jwt) {
      const token = jwt ?? currentSession?.access_token;
      const user = token ? tokensToUser.get(token) : undefined;
      if (!user) {
        return {
          data: { user: null },
          error: { code: 'invalid_credentials', message: 'Invalid JWT', status: 401 },
        };
      }
      return { data: { user }, error: null };
    },

    onAuthStateChange(callback) {
      authListeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe() {
              authListeners.delete(callback);
            },
          },
        },
      };
    },
  };

  return {
    auth,
    from<TRow = Record<string, unknown>>(table: string): SupabaseQueryBuilderLike<TRow> {
      let store = tables.get(table);
      if (!store) {
        store = new Map();
        tables.set(table, store);
      }
      return new InMemoryPostgrestQueryBuilder<TRow>(store, () => idCounter++);
    },
    storage: {
      from(bucketId: string): SupabaseStorageBucketLike {
        let bucket = buckets.get(bucketId);
        if (!bucket) {
          bucket = new Map();
          buckets.set(bucketId, bucket);
        }
        return {
          async upload(path, fileBody, fileOptions) {
            bucket.set(path, {
              key: path,
              data: new Uint8Array(fileBody),
              contentType: fileOptions?.contentType ?? 'application/octet-stream',
              updatedAt: new Date().toISOString(),
              metadata: fileOptions?.metadata,
            });
            return { data: { path, id: `obj-${idCounter++}` }, error: null };
          },
          async download(path) {
            const item = bucket.get(path);
            if (!item) {
              return {
                data: null,
                error: { code: 'NoSuchKey', message: `Object ${path} not found`, status: 404 },
              };
            }
            return { data: item.data, error: null };
          },
          async createSignedUrl(path, expiresIn) {
            return {
              data: {
                signedUrl: `http://localhost:54321/storage/v1/object/sign/${bucketId}/${path}?exp=${expiresIn}`,
              },
              error: null,
            };
          },
          async createSignedUploadUrl(path) {
            return {
              data: {
                signedUrl: `http://localhost:54321/storage/v1/object/upload/sign/${bucketId}/${path}`,
                token: 'upload-token',
              },
              error: null,
            };
          },
          async remove(paths) {
            const removed = paths.map((p) => {
              bucket.delete(p);
              return { name: p };
            });
            return { data: removed, error: null };
          },
          async list(prefix, options) {
            const cleanPrefix = prefix ? `${prefix.replace(/\/$/, '')}/` : '';
            const allFiles: SupabaseStorageFileObject[] = [];
            for (const [key, file] of bucket.entries()) {
              if (!cleanPrefix || key.startsWith(cleanPrefix)) {
                const relativeName = cleanPrefix ? key.slice(cleanPrefix.length) : key;
                allFiles.push({
                  name: relativeName,
                  id: `id-${key}`,
                  updated_at: file.updatedAt,
                  metadata: {
                    size: file.data.byteLength,
                    mimetype: file.contentType,
                    customMetadata: file.metadata,
                  },
                });
              }
            }
            const offset = options?.offset ?? 0;
            const limit = options?.limit ?? 100;
            return { data: allFiles.slice(offset, offset + limit), error: null };
          },
        };
      },
    },
    channel(name: string): SupabaseRealtimeChannelLike {
      let subs = channelListeners.get(name);
      if (!subs) {
        subs = new Set();
        channelListeners.set(name, subs);
      }
      if (!channelPresence.has(name)) {
        channelPresence.set(name, {
          'user-1': [{ userId: 'user-1', status: 'online', updatedAtEpochMs: Date.now() }],
        });
      }
      let localCallback:
        | ((payload: {
            readonly event: string;
            readonly payload: unknown;
            readonly sentAtEpochMs?: number;
            readonly senderId?: string;
          }) => void)
        | undefined;

      const ch: SupabaseRealtimeChannelLike = {
        on(_type, _filter, callback) {
          localCallback = callback;
          subs.add(callback);
          return ch;
        },
        subscribe(callback) {
          callback?.('SUBSCRIBED');
          return ch;
        },
        async send(args) {
          for (const cb of subs) {
            cb({
              event: args.event,
              payload: args.payload,
              sentAtEpochMs: Date.now(),
            });
          }
          return 'ok';
        },
        presenceState<T = Record<string, unknown>>() {
          return (channelPresence.get(name) ?? {}) as Readonly<Record<string, ReadonlyArray<T>>>;
        },
        async unsubscribe() {
          if (localCallback) {
            subs.delete(localCallback);
          }
          return 'ok';
        },
      };
      return ch;
    },
    async removeChannel(channel) {
      return channel.unsubscribe();
    },
  };
}
