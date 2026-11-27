import type { Result } from '@mono-magic/utils-ts-core';
import type { DataAccessError, PaginatedResult } from '../common/query.interface.js';

/**
 * Metadata describing a stored object.
 */
export interface StorageObjectMeta {
  /** Object path/key within the bucket or container. */
  readonly key: string;
  /** Size in bytes. */
  readonly sizeBytes: number;
  /** MIME content type. */
  readonly contentType: string;
  /** Optional entity tag / hash. */
  readonly etag?: string;
  /** Last modified timestamp in Unix epoch milliseconds. */
  readonly updatedAtEpochMs: number;
  /** Optional user-defined metadata key/value pairs. */
  readonly metadata?: Readonly<Record<string, string>>;
}

/**
 * Options for uploading an object via {@link IStorageProvider}.
 */
export interface UploadOptions {
  /** MIME content type of the payload. */
  readonly contentType?: string;
  /** Optional custom metadata key/value pairs. */
  readonly metadata?: Readonly<Record<string, string>>;
}

/**
 * Options for generating a signed URL.
 */
export interface SignedUrlOptions {
  /** Expiration duration in seconds. */
  readonly expiresInSeconds: number;
  /** Intended operation (`'read'` or `'write'`). */
  readonly action?: 'read' | 'write';
}

/**
 * Signed URL response returned by {@link IStorageProvider.getSignedUrl}.
 */
export interface SignedUrlResponse {
  /** Pre-signed URL string. */
  readonly url: string;
  /** Expiration timestamp in Unix epoch milliseconds. */
  readonly expiresAtEpochMs: number;
}

/**
 * Contract for object/blob storage providers.
 */
export interface IStorageProvider {
  /** Uploads binary data to `key` and returns its stored metadata. */
  upload(
    key: string,
    data: Uint8Array,
    options?: UploadOptions,
  ): Promise<Result<StorageObjectMeta, DataAccessError>>;
  /** Downloads the raw bytes for `key`. */
  download(key: string): Promise<Result<Uint8Array, DataAccessError>>;
  /** Generates a time-limited signed URL for `key`. */
  getSignedUrl(
    key: string,
    options: SignedUrlOptions,
  ): Promise<Result<SignedUrlResponse, DataAccessError>>;
  /** Deletes the object at `key`. */
  delete(key: string): Promise<Result<void, DataAccessError>>;
  /** Lists objects matching an optional prefix. */
  list(
    prefix?: string,
    options?: { readonly limit?: number; readonly cursor?: string },
  ): Promise<Result<PaginatedResult<StorageObjectMeta>, DataAccessError>>;
}
