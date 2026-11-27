import type { Result } from '@mono-magic/utils-ts-core';
import type { DataAccessError, PaginatedResult } from '../common/query.interface.js';
import type {
  IStorageProvider,
  SignedUrlOptions,
  SignedUrlResponse,
  StorageObjectMeta,
  UploadOptions,
} from './storage.interface.js';

/**
 * Abstract base class for {@link IStorageProvider} implementations.
 */
export abstract class BaseStorageProvider implements IStorageProvider {
  public abstract upload(
    key: string,
    data: Uint8Array,
    options?: UploadOptions,
  ): Promise<Result<StorageObjectMeta, DataAccessError>>;
  public abstract download(key: string): Promise<Result<Uint8Array, DataAccessError>>;
  public abstract getSignedUrl(
    key: string,
    options: SignedUrlOptions,
  ): Promise<Result<SignedUrlResponse, DataAccessError>>;
  public abstract delete(key: string): Promise<Result<void, DataAccessError>>;
  public abstract list(
    prefix?: string,
    options?: { readonly limit?: number; readonly cursor?: string },
  ): Promise<Result<PaginatedResult<StorageObjectMeta>, DataAccessError>>;
}
