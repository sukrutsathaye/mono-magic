import {
  BaseRealtimeProvider,
  createDataAccessError,
  type DataAccessError,
  type PresenceState,
  type RealtimeEnvelope,
} from '@mono-magic/data-access-ts-interfaces';
import { err, ok, type Result } from '@mono-magic/utils-ts-core';
import { normalizeSupabaseError } from './supabase-error.js';
import type { SupabaseClientLike, SupabaseRealtimeChannelLike } from './supabase-types.js';

/**
 * Concrete {@link BaseRealtimeProvider} implementation backed by Supabase Realtime channels.
 */
export class SupabaseRealtimeProvider extends BaseRealtimeProvider {
  private readonly client: SupabaseClientLike;
  private readonly activeChannels = new Map<string, SupabaseRealtimeChannelLike>();

  /**
   * Creates a new {@link SupabaseRealtimeProvider}.
   */
  public constructor(client: SupabaseClientLike) {
    super();
    this.client = client;
  }

  private getOrCreateChannel(name: string): SupabaseRealtimeChannelLike {
    const existing = this.activeChannels.get(name);
    if (existing) {
      return existing;
    }
    const created = this.client.channel(name);
    this.activeChannels.set(name, created);
    return created;
  }

  /**
   * Publishes a broadcast event payload to `channel`.
   */
  public async publish<TPayload>(
    channel: string,
    event: string,
    payload: TPayload,
  ): Promise<Result<void, DataAccessError>> {
    try {
      const realtimeChannel = this.getOrCreateChannel(channel);
      const status = await realtimeChannel.send({
        type: 'broadcast',
        event,
        payload,
      });
      if (status === 'timed out') {
        return err(createDataAccessError('TIMEOUT', `Realtime publish to ${channel} timed out`));
      }
      if (status === 'error') {
        return err(createDataAccessError('UNAVAILABLE', `Realtime publish to ${channel} failed`));
      }
      return ok(undefined);
    } catch (cause) {
      return err(normalizeSupabaseError(cause, `Failed to publish to ${channel}`));
    }
  }

  /**
   * Subscribes to broadcast messages on `channel` and returns an async unsubscribe function.
   */
  public async subscribe<TPayload>(
    channel: string,
    listener: (message: RealtimeEnvelope<TPayload>) => void,
  ): Promise<Result<() => Promise<void>, DataAccessError>> {
    try {
      const realtimeChannel = this.client.channel(channel);
      this.activeChannels.set(channel, realtimeChannel);

      realtimeChannel
        .on('broadcast', { event: '*' }, (raw) => {
          listener({
            channel,
            event: raw.event,
            payload: raw.payload as TPayload,
            sentAtEpochMs: raw.sentAtEpochMs ?? Date.now(),
            senderId: raw.senderId,
          });
        })
        .subscribe();

      return ok(async () => {
        this.activeChannels.delete(channel);
        if (this.client.removeChannel) {
          await this.client.removeChannel(realtimeChannel);
        } else {
          await realtimeChannel.unsubscribe();
        }
      });
    } catch (cause) {
      return err(normalizeSupabaseError(cause, `Failed to subscribe to ${channel}`));
    }
  }

  /**
   * Reads active presence states on `channel`.
   */
  public async presence(
    channel: string,
  ): Promise<Result<ReadonlyArray<PresenceState>, DataAccessError>> {
    try {
      const realtimeChannel = this.getOrCreateChannel(channel);
      const stateMap = realtimeChannel.presenceState<Record<string, unknown>>();
      const states: PresenceState[] = [];

      for (const [key, entries] of Object.entries(stateMap)) {
        for (const entry of entries) {
          const userId = typeof entry['userId'] === 'string' ? entry['userId'] : key;
          const status = typeof entry['status'] === 'string' ? entry['status'] : 'online';
          const updatedAtEpochMs =
            typeof entry['updatedAtEpochMs'] === 'number' ? entry['updatedAtEpochMs'] : Date.now();
          const metadata =
            typeof entry['metadata'] === 'object' && entry['metadata'] !== null
              ? (entry['metadata'] as Readonly<Record<string, unknown>>)
              : undefined;

          states.push({
            userId,
            status,
            updatedAtEpochMs,
            metadata,
          });
        }
      }

      return ok(states);
    } catch (cause) {
      return err(normalizeSupabaseError(cause, `Failed to get presence for ${channel}`));
    }
  }
}
