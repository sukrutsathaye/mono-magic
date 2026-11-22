import type { Result } from '@mono-magic/utils-ts-core';
import type { DataAccessError, PaginatedResult, QuerySpec } from '../common/query.interface.js';

/**
 * Generic CRUD and query repository contract for domain entities.
 */
export interface IDataRepository<TEntity, TId = string> {
  /** Finds a single entity by its identifier, or `null` if not found. */
  findById(id: TId): Promise<Result<TEntity | null, DataAccessError>>;
  /** Queries entities matching the optional {@link QuerySpec}. */
  findMany(query?: QuerySpec<TEntity>): Promise<Result<PaginatedResult<TEntity>, DataAccessError>>;
  /** Persists a new entity and returns the stored representation. */
  create(entity: Omit<TEntity, 'id'> & { readonly id?: TId }): Promise<Result<TEntity, DataAccessError>>;
  /** Updates an existing entity by identifier with partial fields. */
  update(id: TId, patch: Partial<TEntity>): Promise<Result<TEntity, DataAccessError>>;
  /** Deletes an entity by identifier. */
  delete(id: TId): Promise<Result<void, DataAccessError>>;
  /** Executes a unit of work atomically when supported by the provider. */
  transaction<TResult>(
    work: (repo: IDataRepository<TEntity, TId>) => Promise<Result<TResult, DataAccessError>>,
  ): Promise<Result<TResult, DataAccessError>>;
}

/**
 * Abstract base class for {@link IDataRepository} implementations.
 */
export abstract class BaseDataRepository<TEntity, TId = string>
  implements IDataRepository<TEntity, TId>
{
  public abstract findById(id: TId): Promise<Result<TEntity | null, DataAccessError>>;
  public abstract findMany(
    query?: QuerySpec<TEntity>,
  ): Promise<Result<PaginatedResult<TEntity>, DataAccessError>>;
  public abstract create(
    entity: Omit<TEntity, 'id'> & { readonly id?: TId },
  ): Promise<Result<TEntity, DataAccessError>>;
  public abstract update(
    id: TId,
    patch: Partial<TEntity>,
  ): Promise<Result<TEntity, DataAccessError>>;
  public abstract delete(id: TId): Promise<Result<void, DataAccessError>>;

  /**
   * Default transaction fallback executing `work` against `this`.
   * Providers with native transaction support should override this method.
   */
  public async transaction<TResult>(
    work: (repo: IDataRepository<TEntity, TId>) => Promise<Result<TResult, DataAccessError>>,
  ): Promise<Result<TResult, DataAccessError>> {
    return work(this);
  }
}
