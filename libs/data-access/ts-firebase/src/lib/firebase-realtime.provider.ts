import {
  BaseRealtimeProvider,
  type DataAccessError,
  type PresenceState,
  type RealtimeEnvelope,
} from '@mono-magic/data-access-ts-interfaces';
import { err, ok, type Result } from '@mono-magic/utils-ts-core';
import { normalizeFirebaseError } from './firebase-error.js';
import type { FirebaseRealtimeClientLike, FirebaseServicesLike } from './firebase-types.js';

/**
 * Concrete {@link BaseRealtimeProvider} implementation backed by Firebase `onSnapshot` / RTDB streams.
 */
export class FirebaseRealtimeProvider extends BaseRealtimeProvider {
  private readonly realtime: FirebaseRealtimeClientLike;

  /**
   * Creates a new {@link FirebaseRealtimeProvider}.
   */
  public constructor(
    client: FirebaseServicesLike | { readonly realtime: FirebaseRealtimeClientLike },
  ) {
    super();
    this.realtime = client.realtime;
  }

  /**
   * Publishes an event payload to `channel`.
   */
  public async publish<TPayload>(
    channel: string,
    event: string,
    payload: TPayload,
  ): Promise<Result<void, DataAccessError>> {
    try {
      await this.realtime.publish(channel, event, payload);
      return ok(undefined);
    } catch (cause) {
      return err(normalizeFirebaseError(cause, `Failed to publish event ${event} to ${channel}`));
    }
  }

  /**
   * Subscribes to realtime snapshot updates on `channel` and returns an async unsubscribe handle.
   */
  public async subscribe<TPayload>(
    channel: string,
    listener: (message: RealtimeEnvelope<TPayload>) => void,
  ): Promise<Result<() => Promise<void>, DataAccessError>> {
    try {
      const unsubscribe = this.realtime.onSnapshot<TPayload>(channel, (envelope) => {
        listener(envelope);
      });
      return ok(async () => {
        unsubscribe();
      });
    } catch (cause) {
      return err(normalizeFirebaseError(cause, `Failed to subscribe to ${channel}`));
    }
  }

  /**
   * Lists active participant presence states on `channel`.
   */
  public async presence(
    channel: string,
  ): Promise<Result<ReadonlyArray<PresenceState>, DataAccessError>> {
    try {
      const states = await this.realtime.getPresence(channel);
      return ok(states);
    } catch (cause) {
      return err(normalizeFirebaseError(cause, `Failed to read presence for ${channel}`));
    }
  }
}
