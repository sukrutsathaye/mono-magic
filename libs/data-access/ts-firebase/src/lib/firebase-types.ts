/**
 * Minimal Firebase Auth user shape.
 */
export interface FirebaseUserLike {
  readonly uid: string;
  readonly email?: string | null;
  readonly displayName?: string | null;
  readonly roles?: ReadonlyArray<string>;
  readonly customClaims?: Readonly<Record<string, unknown>>;
  getIdToken(forceRefresh?: boolean): Promise<string>;
  readonly refreshToken?: string;
}

/**
 * Minimal Firebase Auth user credential returned by sign-in/sign-up operations.
 */
export interface FirebaseUserCredentialLike {
  readonly user: FirebaseUserLike;
}

/**
 * Minimal Firebase Auth SDK client contract.
 */
export interface FirebaseAuthClientLike {
  readonly currentUser: FirebaseUserLike | null;
  signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<FirebaseUserCredentialLike>;
  createUserWithEmailAndPassword(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<FirebaseUserCredentialLike>;
  signInWithOAuthProvider(
    providerId: string,
    options?: Readonly<Record<string, unknown>>,
  ): Promise<FirebaseUserCredentialLike>;
  signOut(): Promise<void>;
  verifyIdToken(idToken: string): Promise<{
    readonly uid: string;
    readonly email?: string;
    readonly name?: string;
    readonly roles?: ReadonlyArray<string>;
    readonly [key: string]: unknown;
  }>;
  refreshIdToken?(refreshToken?: string): Promise<{
    readonly idToken: string;
    readonly refreshToken: string;
    readonly expiresInSeconds: number;
    readonly user: FirebaseUserLike;
  }>;
  onAuthStateChanged(callback: (user: FirebaseUserLike | null) => void): () => void;
}

/**
 * Minimal Firestore document snapshot shape.
 */
export interface FirestoreDocSnapshotLike<T = Record<string, unknown>> {
  readonly id: string;
  readonly exists: boolean;
  data(): T | undefined;
}

/**
 * Minimal Firestore query snapshot shape.
 */
export interface FirestoreQuerySnapshotLike<T = Record<string, unknown>> {
  readonly docs: ReadonlyArray<FirestoreDocSnapshotLike<T>>;
  readonly size: number;
}

/**
 * Minimal Firestore document reference contract.
 */
export interface FirestoreDocRefLike<T = Record<string, unknown>> {
  readonly id: string;
  get(): Promise<FirestoreDocSnapshotLike<T>>;
  set(data: T, options?: { readonly merge?: boolean }): Promise<void>;
  update(data: Partial<T>): Promise<void>;
  delete(): Promise<void>;
}

/**
 * Supported Firestore comparison operators.
 */
export type FirestoreWhereOp =
  | '=='
  | '!='
  | 'in'
  | '>'
  | '>='
  | '<'
  | '<='
  | 'array-contains';

/**
 * Minimal Firestore query builder contract.
 */
export interface FirestoreQueryLike<T = Record<string, unknown>> {
  where(field: string, opStr: FirestoreWhereOp, value: unknown): FirestoreQueryLike<T>;
  orderBy(field: string, directionStr?: 'asc' | 'desc'): FirestoreQueryLike<T>;
  limit(limit: number): FirestoreQueryLike<T>;
  offset(offset: number): FirestoreQueryLike<T>;
  get(): Promise<FirestoreQuerySnapshotLike<T>>;
}

/**
 * Minimal Firestore collection reference contract.
 */
export interface FirestoreCollectionRefLike<T = Record<string, unknown>>
  extends FirestoreQueryLike<T> {
  doc(id?: string): FirestoreDocRefLike<T>;
  add(data: Omit<T, 'id'>): Promise<FirestoreDocRefLike<T>>;
}

/**
 * Minimal Cloud Firestore client contract.
 */
export interface FirestoreClientLike {
  collection<T = Record<string, unknown>>(collectionPath: string): FirestoreCollectionRefLike<T>;
  runTransaction?<TResult>(
    updateFunction: (txClient: FirestoreClientLike) => Promise<TResult>,
  ): Promise<TResult>;
}

/**
 * Minimal Firebase Cloud Storage object metadata.
 */
export interface FirebaseStorageMetadataLike {
  readonly fullPath: string;
  readonly size: number;
  readonly contentType?: string;
  readonly md5Hash?: string;
  readonly updated: string;
  readonly customMetadata?: Readonly<Record<string, string>>;
}

/**
 * Minimal Firebase Cloud Storage client contract.
 */
export interface FirebaseStorageClientLike {
  uploadBytes(
    path: string,
    data: Uint8Array,
    metadata?: {
      readonly contentType?: string;
      readonly customMetadata?: Readonly<Record<string, string>>;
    },
  ): Promise<FirebaseStorageMetadataLike>;
  getBytes(path: string): Promise<Uint8Array>;
  getDownloadURL(
    path: string,
    options?: { readonly expiresInSeconds?: number; readonly action?: 'read' | 'write' },
  ): Promise<string>;
  deleteObject(path: string): Promise<void>;
  list(
    prefix?: string,
    options?: { readonly maxResults?: number; readonly pageToken?: string },
  ): Promise<{
    readonly items: ReadonlyArray<FirebaseStorageMetadataLike>;
    readonly nextPageToken?: string;
  }>;
}

/**
 * Minimal Firebase Realtime (`onSnapshot` / RTDB) client contract.
 */
export interface FirebaseRealtimeClientLike {
  publish<TPayload>(
    channel: string,
    event: string,
    payload: TPayload,
    senderId?: string,
  ): Promise<void>;
  onSnapshot<TPayload>(
    channel: string,
    callback: (envelope: {
      readonly channel: string;
      readonly event: string;
      readonly payload: TPayload;
      readonly sentAtEpochMs: number;
      readonly senderId?: string;
    }) => void,
  ): () => void;
  getPresence(channel: string): Promise<
    ReadonlyArray<{
      readonly userId: string;
      readonly status: string;
      readonly updatedAtEpochMs: number;
      readonly metadata?: Readonly<Record<string, unknown>>;
    }>
  >;
}

/**
 * Unified Firebase services bundle accepted by `@mono-magic/data-access-ts-firebase` providers.
 */
export interface FirebaseServicesLike {
  readonly auth: FirebaseAuthClientLike;
  readonly firestore: FirestoreClientLike;
  readonly storage: FirebaseStorageClientLike;
  readonly realtime: FirebaseRealtimeClientLike;
}
