import {
  BaseStorageProvider,
  createDataAccessError,
  type DataAccessError,
  type PaginatedResult,
  type SignedUrlOptions,
  type SignedUrlResponse,
  type StorageObjectMeta,
  type UploadOptions,
} from '@mono-magic/data-access-ts-interfaces';
import { err, ok, type Result } from '@mono-magic/utils-ts-core';
import { normalizeFirebaseError } from './firebase-error.js';
import type {
  FirebaseServicesLike,
  FirebaseStorageClientLike,
  FirebaseStorageMetadataLike,
} from './firebase-types.js';

function mapFirebaseStorageMeta(meta: FirebaseStorageMetadataLike): StorageObjectMeta {
  return {
    key: meta.fullPath,
    sizeBytes: meta.size,
    contentType: meta.contentType ?? 'application/octet-stream',
    etag: meta.md5Hash,
    updatedAtEpochMs: Date.parse(meta.updated) || Date.now(),
    metadata: meta.customMetadata,
  };
}

/**
 * Concrete {@link BaseStorageProvider} implementation backed by Firebase Cloud Storage.
 */
export class FirebaseStorageProvider extends BaseStorageProvider {
  private readonly storage: FirebaseStorageClientLike;

  /**
   * Creates a new {@link FirebaseStorageProvider}.
   */
  public constructor(client: FirebaseServicesLike | { readonly storage: FirebaseStorageClientLike }) {
    super();
    this.storage = client.storage;
  }

  /**
   * Uploads binary data to `key` in Firebase Cloud Storage and returns its metadata.
   */
  public async upload(
    key: string,
    data: Uint8Array,
    options?: UploadOptions,
  ): Promise<Result<StorageObjectMeta, DataAccessError>> {
    try {
      const meta = await this.storage.uploadBytes(key, data, {
        contentType: options?.contentType ?? 'application/octet-stream',
        customMetadata: options?.metadata,
      });
      return ok(mapFirebaseStorageMeta(meta));
    } catch (cause) {
      return err(normalizeFirebaseError(cause, `Failed to upload ${key} to Firebase Storage`));
    }
  }

  /**
   * Downloads raw bytes for `key` from Firebase Cloud Storage.
   */
  public async download(key: string): Promise<Result<Uint8Array, DataAccessError>> {
    try {
      const bytes = await this.storage.getBytes(key);
      return ok(bytes);
    } catch (cause) {
      return err(normalizeFirebaseError(cause, `Failed to download ${key} from Firebase Storage`));
    }
  }

  /**
   * Generates a time-limited download/upload URL for `key`.
   */
  public async getSignedUrl(
    key: string,
    options: SignedUrlOptions,
  ): Promise<Result<SignedUrlResponse, DataAccessError>> {
    if (options.expiresInSeconds <= 0) {
      return err(
        createDataAccessError('VALIDATION', 'expiresInSeconds must be greater than zero'),
      );
    }
    try {
      const url = await this.storage.getDownloadURL(key, {
        expiresInSeconds: options.expiresInSeconds,
        action: options.action ?? 'read',
      });
      return ok({
        url,
        expiresAtEpochMs: Date.now() + options.expiresInSeconds * 1000,
      });
    } catch (cause) {
      return err(normalizeFirebaseError(cause, `Failed to get signed URL for ${key}`));
    }
  }

  /**
   * Deletes the object at `key` from Firebase Cloud Storage.
   */
  public async delete(key: string): Promise<Result<void, DataAccessError>> {
    try {
      await this.storage.deleteObject(key);
      return ok(undefined);
    } catch (cause) {
      return err(normalizeFirebaseError(cause, `Failed to delete ${key} from Firebase Storage`));
    }
  }

  /**
   * Lists objects in Firebase Cloud Storage matching an optional prefix.
   */
  public async list(
    prefix?: string,
    options?: { readonly limit?: number; readonly cursor?: string },
  ): Promise<Result<PaginatedResult<StorageObjectMeta>, DataAccessError>> {
    try {
      const res = await this.storage.list(prefix, {
        maxResults: options?.limit,
        pageToken: options?.cursor,
      });
      const items = res.items.map(mapFirebaseStorageMeta);
      return ok({
        items,
        total: items.length,
        nextCursor: res.nextPageToken,
        hasMore: Boolean(res.nextPageToken),
      });
    } catch (cause) {
      return err(normalizeFirebaseError(cause, 'Failed to list Firebase Storage objects'));
    }
  }
}
