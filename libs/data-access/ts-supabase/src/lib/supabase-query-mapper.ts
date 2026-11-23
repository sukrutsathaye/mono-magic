import type { FilterSpec, QuerySpec, SortSpec } from '@mono-magic/data-access-ts-interfaces';
import type { SupabaseQueryBuilderLike } from './supabase-types.js';

/**
 * Descriptor of how a {@link QuerySpec} translates into PostgREST operations.
 */
export interface PostgrestQueryPlan<T> {
  readonly filters: ReadonlyArray<FilterSpec<T>>;
  readonly sort: ReadonlyArray<SortSpec<T>>;
  readonly range?: { readonly from: number; readonly to: number };
  readonly limit?: number;
}

/**
 * Builds a structured {@link PostgrestQueryPlan} from an optional {@link QuerySpec}.
 */
export function buildPostgrestQueryPlan<T>(query?: QuerySpec<T>): PostgrestQueryPlan<T> {
  const filters = query?.filters ?? [];
  const sort = query?.sort ?? [];

  const offset =
    query?.offset !== undefined
      ? query.offset
      : query?.cursor !== undefined
        ? Number.parseInt(query.cursor, 10) || 0
        : undefined;

  if (query?.limit !== undefined && offset !== undefined) {
    return {
      filters,
      sort,
      range: {
        from: offset,
        to: offset + Math.max(0, query.limit - 1),
      },
      limit: query.limit,
    };
  }

  if (offset !== undefined) {
    const defaultLimit = 50;
    return {
      filters,
      sort,
      range: {
        from: offset,
        to: offset + defaultLimit - 1,
      },
    };
  }

  return {
    filters,
    sort,
    limit: query?.limit,
  };
}

/**
 * Applies a single {@link FilterSpec} clause to a PostgREST query builder.
 */
export function applyPostgrestFilter<T, TRow>(
  builder: SupabaseQueryBuilderLike<TRow>,
  filter: FilterSpec<T>,
): SupabaseQueryBuilderLike<TRow> {
  const column = filter.field;
  switch (filter.operator) {
    case 'eq':
      return builder.eq(column, filter.value);
    case 'neq':
      return builder.neq(column, filter.value);
    case 'in':
      return builder.in(
        column,
        Array.isArray(filter.value) ? filter.value : [filter.value],
      );
    case 'gt':
      return builder.gt(column, filter.value);
    case 'gte':
      return builder.gte(column, filter.value);
    case 'lt':
      return builder.lt(column, filter.value);
    case 'lte':
      return builder.lte(column, filter.value);
    case 'contains':
      return builder.ilike(column, `%${String(filter.value)}%`);
  }
}

/**
 * Applies a vendor-agnostic {@link QuerySpec} onto a Supabase PostgREST query builder.
 */
export function applyQuerySpecToPostgrest<T, TRow>(
  builder: SupabaseQueryBuilderLike<TRow>,
  query?: QuerySpec<T>,
): SupabaseQueryBuilderLike<TRow> {
  const plan = buildPostgrestQueryPlan(query);
  let current = builder;

  for (const filter of plan.filters) {
    current = applyPostgrestFilter(current, filter);
  }

  for (const sort of plan.sort) {
    current = current.order(sort.field, { ascending: sort.direction === 'asc' });
  }

  if (plan.range !== undefined) {
    current = current.range(plan.range.from, plan.range.to);
  } else if (plan.limit !== undefined) {
    current = current.limit(plan.limit);
  }

  return current;
}
