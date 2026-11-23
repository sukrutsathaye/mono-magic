import type { FilterSpec, QuerySpec } from '@mono-magic/data-access-ts-interfaces';
import type { FirestoreQueryLike, FirestoreWhereOp } from './firebase-types.js';

/**
 * Descriptor of how a {@link QuerySpec} maps to Firestore native query constraints
 * plus optional client-side substring filtering when `contains` is used on string fields.
 */
export interface FirestoreQueryPlan<T> {
  readonly whereClauses: ReadonlyArray<{
    readonly field: string;
    readonly op: FirestoreWhereOp;
    readonly value: unknown;
  }>;
  readonly clientContainsFilters: ReadonlyArray<FilterSpec<T>>;
  readonly orderByClauses: ReadonlyArray<{
    readonly field: string;
    readonly direction: 'asc' | 'desc';
  }>;
  readonly offset?: number;
  readonly limit?: number;
}

/**
 * Translates a vendor-agnostic {@link QuerySpec} into a {@link FirestoreQueryPlan}.
 */
export function buildFirestoreQueryPlan<T>(query?: QuerySpec<T>): FirestoreQueryPlan<T> {
  const whereClauses: Array<{
    readonly field: string;
    readonly op: FirestoreWhereOp;
    readonly value: unknown;
  }> = [];
  const clientContainsFilters: FilterSpec<T>[] = [];

  for (const filter of query?.filters ?? []) {
    switch (filter.operator) {
      case 'eq':
        whereClauses.push({ field: filter.field, op: '==', value: filter.value });
        break;
      case 'neq':
        whereClauses.push({ field: filter.field, op: '!=', value: filter.value });
        break;
      case 'in':
        whereClauses.push({
          field: filter.field,
          op: 'in',
          value: Array.isArray(filter.value) ? filter.value : [filter.value],
        });
        break;
      case 'gt':
        whereClauses.push({ field: filter.field, op: '>', value: filter.value });
        break;
      case 'gte':
        whereClauses.push({ field: filter.field, op: '>=', value: filter.value });
        break;
      case 'lt':
        whereClauses.push({ field: filter.field, op: '<', value: filter.value });
        break;
      case 'lte':
        whereClauses.push({ field: filter.field, op: '<=', value: filter.value });
        break;
      case 'contains':
        clientContainsFilters.push(filter);
        break;
    }
  }

  const orderByClauses = (query?.sort ?? []).map((s) => ({
    field: s.field,
    direction: s.direction,
  }));

  const offset =
    query?.offset !== undefined
      ? query.offset
      : query?.cursor !== undefined
        ? Number.parseInt(query.cursor, 10) || 0
        : undefined;

  return {
    whereClauses,
    clientContainsFilters,
    orderByClauses,
    offset,
    limit: query?.limit,
  };
}

/**
 * Applies a {@link FirestoreQueryPlan} onto a Firestore collection/query reference.
 */
export function applyQueryPlanToFirestore<T>(
  baseQuery: FirestoreQueryLike<T>,
  plan: FirestoreQueryPlan<T>,
): FirestoreQueryLike<T> {
  let current = baseQuery;

  for (const clause of plan.whereClauses) {
    current = current.where(clause.field, clause.op, clause.value);
  }

  for (const order of plan.orderByClauses) {
    current = current.orderBy(order.field, order.direction);
  }

  if (plan.clientContainsFilters.length === 0) {
    if (plan.offset !== undefined && plan.offset > 0) {
      current = current.offset(plan.offset);
    }
    if (plan.limit !== undefined) {
      current = current.limit(plan.limit);
    }
  }

  return current;
}
