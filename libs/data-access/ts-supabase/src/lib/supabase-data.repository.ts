import {
  BaseDataRepository,
  createDataAccessError,
  type DataAccessError,
  type PaginatedResult,
  type QuerySpec,
} from '@mono-magic/data-access-ts-interfaces';
import { err, ok, type Result } from '@mono-magic/utils-ts-core';
import { normalizeSupabaseError } from './supabase-error.js';
import { applyQuerySpecToPostgrest } from './supabase-query-mapper.js';
import type { SupabaseClientLike } from './supabase-types.js';

/**
 * Configuration options for {@link SupabaseDataRepository}.
 */
export interface SupabaseRepositoryOptions {
  /** Table name in Postgres / PostgREST. */
  readonly tableName: string;
  /** Primary key column name (defaults to `'id'`). */
  readonly idColumn?: string;
}

/**
 * Concrete {@link BaseDataRepository} implementation backed by Supabase PostgREST.
 */
export class SupabaseDataRepository<
  TEntity extends { readonly id: TId },
  TId = string,
> extends BaseDataRepository<TEntity, TId> {
  private readonly client: SupabaseClientLike;
  private readonly tableName: string;
  private readonly idColumn: string;

  /**
   * Creates a new {@link SupabaseDataRepository}.
   */
  public constructor(client: SupabaseClientLike, options: SupabaseRepositoryOptions | string) {
    super();
    this.client = client;
    if (typeof options === 'string') {
      this.tableName = options;
      this.idColumn = 'id';
    } else {
      this.tableName = options.tableName;
      this.idColumn = options.idColumn ?? 'id';
    }
  }

  /**
   * Finds a single entity by identifier, returning `null` when not found.
   */
  public async findById(id: TId): Promise<Result<TEntity | null, DataAccessError>> {
    try {
      const response = await this.client
        .from<TEntity>(this.tableName)
        .select('*')
        .eq(this.idColumn, id)
        .maybeSingle();

      if (response.error) {
        if (response.error.code === 'PGRST116') {
          return ok(null);
        }
        return err(normalizeSupabaseError(response.error, `Failed to find ${this.tableName} by id`));
      }
      return ok(response.data ?? null);
    } catch (cause) {
      return err(normalizeSupabaseError(cause, `Failed to find ${this.tableName} by id`));
    }
  }

  /**
   * Queries entities matching an optional {@link QuerySpec} via PostgREST filter/sort/range operators.
   */
  public async findMany(
    query?: QuerySpec<TEntity>,
  ): Promise<Result<PaginatedResult<TEntity>, DataAccessError>> {
    try {
      const baseBuilder = this.client
        .from<TEntity>(this.tableName)
        .select('*', { count: 'exact' });
      const mappedBuilder = applyQuerySpecToPostgrest(baseBuilder, query);
      const response = await mappedBuilder;

      if (response.error) {
        return err(normalizeSupabaseError(response.error, `Failed to query ${this.tableName}`));
      }

      const items = response.data ?? [];
      const total = response.count ?? items.length;
      const offset =
        query?.offset !== undefined
          ? query.offset
          : query?.cursor !== undefined
            ? Number.parseInt(query.cursor, 10) || 0
            : 0;
      const hasMore =
        query?.limit !== undefined
          ? offset + items.length < total
          : false;
      const nextCursor = hasMore ? String(offset + items.length) : undefined;

      return ok({
        items,
        total,
        nextCursor,
        hasMore,
      });
    } catch (cause) {
      return err(normalizeSupabaseError(cause, `Failed to query ${this.tableName}`));
    }
  }

  /**
   * Inserts a new entity row into the PostgREST table and returns the stored entity.
   */
  public async create(
    entity: Omit<TEntity, 'id'> & { readonly id?: TId },
  ): Promise<Result<TEntity, DataAccessError>> {
    try {
      const payload = entity as unknown as Readonly<Record<string, unknown>>;
      const response = await this.client
        .from<TEntity>(this.tableName)
        .insert(payload)
        .select('*')
        .single();

      if (response.error) {
        return err(normalizeSupabaseError(response.error, `Failed to create ${this.tableName}`));
      }
      if (!response.data) {
        return err(
          createDataAccessError('INTERNAL', `No data returned after inserting into ${this.tableName}`),
        );
      }
      return ok(response.data);
    } catch (cause) {
      return err(normalizeSupabaseError(cause, `Failed to create ${this.tableName}`));
    }
  }

  /**
   * Updates an existing entity row by identifier and returns the updated representation.
   */
  public async update(
    id: TId,
    patch: Partial<TEntity>,
  ): Promise<Result<TEntity, DataAccessError>> {
    try {
      const payload = patch as unknown as Readonly<Record<string, unknown>>;
      const response = await this.client
        .from<TEntity>(this.tableName)
        .update(payload)
        .eq(this.idColumn, id)
        .select('*')
        .single();

      if (response.error) {
        return err(normalizeSupabaseError(response.error, `Failed to update ${this.tableName}`));
      }
      if (!response.data) {
        return err(createDataAccessError('NOT_FOUND', `${this.tableName} record not found`));
      }
      return ok(response.data);
    } catch (cause) {
      return err(normalizeSupabaseError(cause, `Failed to update ${this.tableName}`));
    }
  }

  /**
   * Deletes an entity row by identifier.
   */
  public async delete(id: TId): Promise<Result<void, DataAccessError>> {
    try {
      const response = await this.client
        .from<TEntity>(this.tableName)
        .delete()
        .eq(this.idColumn, id);

      if (response.error) {
        return err(normalizeSupabaseError(response.error, `Failed to delete ${this.tableName}`));
      }
      return ok(undefined);
    } catch (cause) {
      return err(normalizeSupabaseError(cause, `Failed to delete ${this.tableName}`));
    }
  }
}
