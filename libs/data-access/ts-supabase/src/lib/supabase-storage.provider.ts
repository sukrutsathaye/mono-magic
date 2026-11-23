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
import { normalizeSupabaseError } from './supabase-error.js';
import type { SupabaseClientLike, SupabaseStorageBucketLike } from './supabase-types.js';

/**
 * Concrete {@link BaseStorageProvider} implementation backed by Supabase Storage.
 */
export class SupabaseStorageProvider extends BaseStorageProvider {
  private readonly bucket: SupabaseStorageBucketLike;

  /**
   * Creates a new {@link SupabaseStorageProvider} bound to `bucketId`.
   */
  public constructor(client: SupabaseClientLike, bucketId = 'default') {
    super();
    this.bucket = client.storage.from(bucketId);
  }

  /**
   * Uploads binary data to `key` and returns its {@link StorageObjectMeta}.
   */
  public async upload(
    key: string,
    data: Uint8Array,
    options?: UploadOptions,
  ): Promise<Result<StorageObjectMeta, DataAccessError>> {
    try {
      const response = await this.bucket.upload(key, data, {
        contentType: options?.contentType ?? 'application/octet-stream',
        upsert: true,
        metadata: options?.metadata,
      });

      if (response.error) {
        return err(normalizeSupabaseError(response.error, `Failed to upload ${key}`));
      }

      return ok({
        key: response.data?.path ?? key,
        sizeBytes: data.byteLength,
        contentType: options?.contentType ?? 'application/octet-stream',
        etag: response.data?.id,
        updatedAtEpochMs: Date.now(),
        metadata: options?.metadata,
      });
    } catch (cause) {
      return err(normalizeSupabaseError(cause, `Failed to upload ${key}`));
    }
  }

  /**
   * Downloads raw bytes for `key` from Supabase Storage.
   */
  public async download(key: string): Promise<Result<Uint8Array, DataAccessError>> {
    try {
      const response = await this.bucket.download(key);
      if (response.error) {
        return err(normalizeSupabaseError(response.error, `Failed to download ${key}`));
      }
      if (!response.data) {
        return err(createDataAccessError('NOT_FOUND', `Storage object ${key} not found`));
      }
      if (response.data instanceof Uint8Array) {
        return ok(response.data);
      }
      const arrayBuffer = await response.data.arrayBuffer();
      return ok(new Uint8Array(arrayBuffer));
    } catch (cause) {
      return err(normalizeSupabaseError(cause, `Failed to download ${key}`));
    }
  }

  /**
   * Generates a time-limited signed URL for reading or writing `key`.
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
      if (options.action === 'write' && this.bucket.createSignedUploadUrl) {
        const uploadRes = await this.bucket.createSignedUploadUrl(key);
        if (uploadRes.error) {
          return err(normalizeSupabaseError(uploadRes.error, `Failed to sign upload URL for ${key}`));
        }
        if (!uploadRes.data?.signedUrl) {
          return err(createDataAccessError('INTERNAL', `Missing signed upload URL for ${key}`));
        }
        return ok({
          url: uploadRes.data.signedUrl,
          expiresAtEpochMs: Date.now() + options.expiresInSeconds * 1000,
        });
      }

      const response = await this.bucket.createSignedUrl(key, options.expiresInSeconds);
      if (response.error) {
        return err(normalizeSupabaseError(response.error, `Failed to sign URL for ${key}`));
      }
      if (!response.data?.signedUrl) {
        return err(createDataAccessError('INTERNAL', `Missing signed URL for ${key}`));
      }
      return ok({
        url: response.data.signedUrl,
        expiresAtEpochMs: Date.now() + options.expiresInSeconds * 1000,
      });
    } catch (cause) {
      return err(normalizeSupabaseError(cause, `Failed to sign URL for ${key}`));
    }
  }

  /**
   * Deletes the storage object at `key`.
   */
  public async delete(key: string): Promise<Result<void, DataAccessError>> {
    try {
      const response = await this.bucket.remove([key]);
      if (response.error) {
        return err(normalizeSupabaseError(response.error, `Failed to delete ${key}`));
      }
      return ok(undefined);
    } catch (cause) {
      return err(normalizeSupabaseError(cause, `Failed to delete ${key}`));
    }
  }

  /**
   * Lists objects in the bucket matching an optional prefix.
   */
  public async list(
    prefix?: string,
    options?: { readonly limit?: number; readonly cursor?: string },
  ): Promise<Result<PaginatedResult<StorageObjectMeta>, DataAccessError>> {
    try {
      const cleanPrefix = prefix ? prefix.replace(/\/$/, '') : undefined;
      const offset = options?.cursor ? Number.parseInt(options.cursor, 10) || 0 : 0;
      const limit = options?.limit ?? 100;

      const response = await this.bucket.list(cleanPrefix, {
        limit,
        offset,
      });

      if (response.error) {
        return err(normalizeSupabaseError(response.error, 'Failed to list storage objects'));
      }

      const files = response.data ?? [];
      const items: ReadonlyArray<StorageObjectMeta> = files.map((file) => {
        const key =
          cleanPrefix && !file.name.startsWith(`${cleanPrefix}/`)
            ? `${cleanPrefix}/${file.name}`
            : file.name;
        return {
          key,
          sizeBytes: file.metadata?.size ?? 0,
          contentType: file.metadata?.mimetype ?? 'application/octet-stream',
          etag: file.metadata?.eTag ?? file.id,
          updatedAtEpochMs: file.updated_at ? Date.parse(file.updated_at) : Date.now(),
          metadata: file.metadata?.customMetadata,
        };
      });

      const hasMore = options?.limit !== undefined && items.length >= options.limit;
      return ok({
        items,
        total: items.length,
        hasMore,
        nextCursor: hasMore ? String(offset + items.length) : undefined,
      });
    } catch (cause) {
      return err(normalizeSupabaseError(cause, 'Failed to list storage objects'));
    }
  }
}
