/**
 * Minimal `@supabase/supabase-js`-compatible user shape.
 */
export interface SupabaseUserLike {
  readonly id: string;
  readonly email?: string;
  readonly role?: string;
  readonly user_metadata?: Readonly<Record<string, unknown>>;
  readonly app_metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Minimal `@supabase/supabase-js`-compatible session shape.
 */
export interface SupabaseSessionLike {
  readonly access_token: string;
  readonly refresh_token?: string;
  readonly expires_at?: number;
  readonly expires_in?: number;
  readonly user: SupabaseUserLike;
}

/**
 * Minimal `@supabase/supabase-js`-compatible error shape.
 */
export interface SupabaseErrorLike {
  readonly message: string;
  readonly code?: string;
  readonly status?: number;
  readonly details?: string;
  readonly hint?: string;
}

/**
 * Auth response envelope returned by `@supabase/supabase-js` auth calls.
 */
export interface SupabaseAuthResponse {
  readonly data: {
    readonly user: SupabaseUserLike | null;
    readonly session: SupabaseSessionLike | null;
  };
  readonly error: SupabaseErrorLike | null;
}

/**
 * Minimal `@supabase/supabase-js`-compatible `auth` client contract.
 */
export interface SupabaseAuthClientLike {
  signInWithPassword(credentials: {
    readonly email: string;
    readonly password: string;
  }): Promise<SupabaseAuthResponse>;
  signUp(credentials: {
    readonly email: string;
    readonly password: string;
    readonly options?: { readonly data?: Readonly<Record<string, unknown>> };
  }): Promise<SupabaseAuthResponse>;
  signInWithOAuth(credentials: {
    readonly provider: string;
    readonly options?: Readonly<Record<string, unknown>>;
  }): Promise<{
    readonly data: {
      readonly provider?: string;
      readonly url?: string;
      readonly session?: SupabaseSessionLike | null;
    };
    readonly error: SupabaseErrorLike | null;
  }>;
  signOut(): Promise<{ readonly error: SupabaseErrorLike | null }>;
  getSession(): Promise<{
    readonly data: { readonly session: SupabaseSessionLike | null };
    readonly error: SupabaseErrorLike | null;
  }>;
  refreshSession(currentSession?: {
    readonly refresh_token: string;
  }): Promise<SupabaseAuthResponse>;
  getUser(jwt?: string): Promise<{
    readonly data: { readonly user: SupabaseUserLike | null };
    readonly error: SupabaseErrorLike | null;
  }>;
  onAuthStateChange(
    callback: (event: string, session: SupabaseSessionLike | null) => void,
  ): {
    readonly data: {
      readonly subscription: {
        unsubscribe(): void;
      };
    };
  };
}

/**
 * PostgREST response envelope returned when awaiting a filter builder.
 */
export interface SupabasePostgrestResponse<T> {
  readonly data: T | null;
  readonly error: SupabaseErrorLike | null;
  readonly count?: number | null;
  readonly status?: number;
}

/**
 * Minimal `@supabase/supabase-js` PostgREST filter/query builder contract.
 */
export interface SupabaseQueryBuilderLike<TRow = Record<string, unknown>>
  extends PromiseLike<SupabasePostgrestResponse<ReadonlyArray<TRow>>> {
  select(
    columns?: string,
    options?: { readonly count?: 'exact' | 'planned' | 'estimated' },
  ): SupabaseQueryBuilderLike<TRow>;
  insert(
    values: Readonly<Record<string, unknown>> | ReadonlyArray<Readonly<Record<string, unknown>>>,
  ): SupabaseQueryBuilderLike<TRow>;
  update(values: Readonly<Record<string, unknown>>): SupabaseQueryBuilderLike<TRow>;
  delete(): SupabaseQueryBuilderLike<TRow>;
  eq(column: string, value: unknown): SupabaseQueryBuilderLike<TRow>;
  neq(column: string, value: unknown): SupabaseQueryBuilderLike<TRow>;
  in(column: string, values: ReadonlyArray<unknown>): SupabaseQueryBuilderLike<TRow>;
  gt(column: string, value: unknown): SupabaseQueryBuilderLike<TRow>;
  gte(column: string, value: unknown): SupabaseQueryBuilderLike<TRow>;
  lt(column: string, value: unknown): SupabaseQueryBuilderLike<TRow>;
  lte(column: string, value: unknown): SupabaseQueryBuilderLike<TRow>;
  ilike(column: string, pattern: string): SupabaseQueryBuilderLike<TRow>;
  order(
    column: string,
    options?: { readonly ascending?: boolean },
  ): SupabaseQueryBuilderLike<TRow>;
  range(from: number, to: number): SupabaseQueryBuilderLike<TRow>;
  limit(count: number): SupabaseQueryBuilderLike<TRow>;
  single(): PromiseLike<SupabasePostgrestResponse<TRow>>;
  maybeSingle(): PromiseLike<SupabasePostgrestResponse<TRow>>;
}

/**
 * Storage object metadata item returned by `@supabase/supabase-js` bucket `.list()`.
 */
export interface SupabaseStorageFileObject {
  readonly name: string;
  readonly id?: string;
  readonly updated_at?: string;
  readonly created_at?: string;
  readonly metadata?: {
    readonly size?: number;
    readonly mimetype?: string;
    readonly eTag?: string;
    readonly customMetadata?: Readonly<Record<string, string>>;
  };
}

/**
 * Minimal `@supabase/supabase-js` storage bucket client contract.
 */
export interface SupabaseStorageBucketLike {
  upload(
    path: string,
    fileBody: Uint8Array,
    fileOptions?: {
      readonly contentType?: string;
      readonly upsert?: boolean;
      readonly metadata?: Readonly<Record<string, string>>;
    },
  ): Promise<{
    readonly data: { readonly path: string; readonly id?: string } | null;
    readonly error: SupabaseErrorLike | null;
  }>;
  download(path: string): Promise<{
    readonly data: Blob | Uint8Array | null;
    readonly error: SupabaseErrorLike | null;
  }>;
  createSignedUrl(
    path: string,
    expiresIn: number,
  ): Promise<{
    readonly data: { readonly signedUrl: string } | null;
    readonly error: SupabaseErrorLike | null;
  }>;
  createSignedUploadUrl?(path: string): Promise<{
    readonly data: { readonly signedUrl: string; readonly token?: string } | null;
    readonly error: SupabaseErrorLike | null;
  }>;
  remove(paths: ReadonlyArray<string>): Promise<{
    readonly data: ReadonlyArray<{ readonly name: string }> | null;
    readonly error: SupabaseErrorLike | null;
  }>;
  list(
    path?: string,
    options?: {
      readonly limit?: number;
      readonly offset?: number;
    },
  ): Promise<{
    readonly data: ReadonlyArray<SupabaseStorageFileObject> | null;
    readonly error: SupabaseErrorLike | null;
  }>;
}

/**
 * Minimal `@supabase/supabase-js` realtime channel contract.
 */
export interface SupabaseRealtimeChannelLike {
  on(
    type: 'broadcast',
    filter: { readonly event: string },
    callback: (payload: {
      readonly event: string;
      readonly payload: unknown;
      readonly sentAtEpochMs?: number;
      readonly senderId?: string;
    }) => void,
  ): SupabaseRealtimeChannelLike;
  subscribe(
    callback?: (status: 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED') => void,
  ): SupabaseRealtimeChannelLike;
  send(args: {
    readonly type: 'broadcast';
    readonly event: string;
    readonly payload: unknown;
  }): Promise<'ok' | 'timed out' | 'error'>;
  presenceState<T = Record<string, unknown>>(): Readonly<Record<string, ReadonlyArray<T>>>;
  track?(payload: Readonly<Record<string, unknown>>): Promise<'ok' | 'timed out' | 'error'>;
  unsubscribe(): Promise<'ok' | 'timed out' | 'error'>;
}

/**
 * Root `@supabase/supabase-js`-compatible client interface.
 */
export interface SupabaseClientLike {
  readonly auth: SupabaseAuthClientLike;
  from<TRow = Record<string, unknown>>(table: string): SupabaseQueryBuilderLike<TRow>;
  readonly storage: {
    from(bucketId: string): SupabaseStorageBucketLike;
  };
  channel(name: string): SupabaseRealtimeChannelLike;
  removeChannel?(channel: SupabaseRealtimeChannelLike): Promise<'ok' | 'timed out' | 'error'>;
}
