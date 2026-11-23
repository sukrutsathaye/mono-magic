import {
  BaseDataRepository,
  createDataAccessError,
  type DataAccessError,
  type IDataRepository,
  type PaginatedResult,
  type QuerySpec,
} from '@mono-magic/data-access-ts-interfaces';
import { err, ok, type Result } from '@mono-magic/utils-ts-core';
import { normalizeFirebaseError } from './firebase-error.js';
import { applyQueryPlanToFirestore, buildFirestoreQueryPlan } from './firebase-query-mapper.js';
import type { FirebaseServicesLike, FirestoreClientLike } from './firebase-types.js';

/**
 * Concrete {@link BaseDataRepository} implementation backed by Cloud Firestore.
 */
export class FirebaseFirestoreRepository<
  TEntity extends { readonly id: TId },
  TId extends string = string,
> extends BaseDataRepository<TEntity, TId> {
  private readonly firestore: FirestoreClientLike;
  private readonly collectionPath: string;

  /**
   * Creates a new {@link FirebaseFirestoreRepository} for `collectionPath`.
   */
  public constructor(
    client: FirebaseServicesLike | { readonly firestore: FirestoreClientLike },
    collectionPath: string,
  ) {
    super();
    this.firestore = client.firestore;
    this.collectionPath = collectionPath;
  }

  /**
   * Finds a single Firestore document by identifier, returning `null` if not found.
   */
  public async findById(id: TId): Promise<Result<TEntity | null, DataAccessError>> {
    try {
      const snap = await this.firestore
        .collection<TEntity>(this.collectionPath)
        .doc(id)
        .get();

      if (!snap.exists) {
        return ok(null);
      }
      const data = snap.data();
      return ok(data ? ({ ...data, id: snap.id as TId } as TEntity) : null);
    } catch (cause) {
      return err(normalizeFirebaseError(cause, `Failed to get document ${id} from ${this.collectionPath}`));
    }
  }

  /**
   * Queries documents in the Firestore collection matching an optional {@link QuerySpec}.
   */
  public async findMany(
    query?: QuerySpec<TEntity>,
  ): Promise<Result<PaginatedResult<TEntity>, DataAccessError>> {
    try {
      const plan = buildFirestoreQueryPlan(query);
      const collectionRef = this.firestore.collection<TEntity>(this.collectionPath);
      const mappedQuery = applyQueryPlanToFirestore(collectionRef, plan);
      const snapshot = await mappedQuery.get();

      let items = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return data ? ({ ...data, id: doc.id as TId } as TEntity) : undefined;
        })
        .filter((item): item is TEntity => item !== undefined);

      if (plan.clientContainsFilters.length > 0) {
        items = items.filter((item) =>
          plan.clientContainsFilters.every((filter) => {
            const rawVal = (item as Record<string, unknown>)[filter.field];
            if (Array.isArray(rawVal)) {
              return rawVal.includes(filter.value);
            }
            return String(rawVal ?? '')
              .toLowerCase()
              .includes(String(filter.value).toLowerCase());
          }),
        );
      }

      const totalMatched = items.length;
      const offset = plan.offset ?? 0;

      if (plan.clientContainsFilters.length > 0) {
        if (offset > 0 || plan.limit !== undefined) {
          const end = plan.limit !== undefined ? offset + plan.limit : undefined;
          items = items.slice(offset, end);
        }
      }

      const hasMore =
        plan.limit !== undefined && items.length >= plan.limit && offset + items.length <= totalMatched;
      const nextCursor = hasMore ? String(offset + items.length) : undefined;

      return ok({
        items,
        total: totalMatched,
        nextCursor,
        hasMore,
      });
    } catch (cause) {
      return err(normalizeFirebaseError(cause, `Failed to query collection ${this.collectionPath}`));
    }
  }

  /**
   * Creates a new document in the Firestore collection.
   */
  public async create(
    entity: Omit<TEntity, 'id'> & { readonly id?: TId },
  ): Promise<Result<TEntity, DataAccessError>> {
    try {
      const collectionRef = this.firestore.collection<TEntity>(this.collectionPath);
      const docRef = entity.id ? collectionRef.doc(entity.id) : collectionRef.doc();
      const existing = await docRef.get();
      if (existing.exists) {
        return err(
          createDataAccessError(
            'CONFLICT',
            `Document ${docRef.id} already exists in ${this.collectionPath}`,
          ),
        );
      }
      const stored = { ...entity, id: docRef.id as TId } as TEntity;
      await docRef.set(stored);
      return ok(stored);
    } catch (cause) {
      return err(normalizeFirebaseError(cause, `Failed to create document in ${this.collectionPath}`));
    }
  }

  /**
   * Updates an existing Firestore document by identifier and returns the merged entity.
   */
  public async update(
    id: TId,
    patch: Partial<TEntity>,
  ): Promise<Result<TEntity, DataAccessError>> {
    try {
      const docRef = this.firestore.collection<TEntity>(this.collectionPath).doc(id);
      await docRef.update(patch);
      const updatedSnap = await docRef.get();
      const data = updatedSnap.data();
      if (!updatedSnap.exists || !data) {
        return err(
          createDataAccessError('NOT_FOUND', `Document ${id} not found in ${this.collectionPath}`),
        );
      }
      return ok({ ...data, id: updatedSnap.id as TId } as TEntity);
    } catch (cause) {
      return err(normalizeFirebaseError(cause, `Failed to update document ${id} in ${this.collectionPath}`));
    }
  }

  /**
   * Deletes a Firestore document by identifier.
   */
  public async delete(id: TId): Promise<Result<void, DataAccessError>> {
    try {
      await this.firestore.collection<TEntity>(this.collectionPath).doc(id).delete();
      return ok(undefined);
    } catch (cause) {
      return err(normalizeFirebaseError(cause, `Failed to delete document ${id} in ${this.collectionPath}`));
    }
  }

  /**
   * Executes a unit of work inside a Firestore transaction when supported by the client.
   */
  public override async transaction<TResult>(
    work: (repo: IDataRepository<TEntity, TId>) => Promise<Result<TResult, DataAccessError>>,
  ): Promise<Result<TResult, DataAccessError>> {
    if (!this.firestore.runTransaction) {
      return super.transaction(work);
    }
    try {
      return await this.firestore.runTransaction(async (txClient) => {
        const txRepo = new FirebaseFirestoreRepository<TEntity, TId>(
          { firestore: txClient },
          this.collectionPath,
        );
        return work(txRepo);
      });
    } catch (cause) {
      return err(normalizeFirebaseError(cause, `Firestore transaction failed on ${this.collectionPath}`));
    }
  }
}
