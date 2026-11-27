import type { Result } from '@mono-magic/utils-ts-core';
import type { DataAccessError } from '../common/query.interface.js';

/**
 * Envelope for messages published over a realtime channel.
 */
export interface RealtimeEnvelope<TPayload = unknown> {
  /** Channel or topic identifier. */
  readonly channel: string;
  /** Event name within the channel. */
  readonly event: string;
  /** Event payload. */
  readonly payload: TPayload;
  /** Publish timestamp in Unix epoch milliseconds. */
  readonly sentAtEpochMs: number;
  /** Optional sender identifier. */
  readonly senderId?: string;
}

/**
 * Presence state entry for a participant in a realtime channel.
 */
export interface PresenceState {
  /** Participant identifier. */
  readonly userId: string;
  /** Presence status string (e.g., `'online'`, `'away'`). */
  readonly status: string;
  /** Last heartbeat timestamp in Unix epoch milliseconds. */
  readonly updatedAtEpochMs: number;
  /** Optional arbitrary presence metadata. */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Contract for realtime pub/sub and presence providers.
 */
export interface IRealtimeProvider {
  /** Publishes an event payload to `channel`. */
  publish<TPayload>(
    channel: string,
    event: string,
    payload: TPayload,
  ): Promise<Result<void, DataAccessError>>;
  /** Subscribes to messages on `channel` and returns an unsubscribe handle. */
  subscribe<TPayload>(
    channel: string,
    listener: (message: RealtimeEnvelope<TPayload>) => void,
  ): Promise<Result<() => Promise<void>, DataAccessError>>;
  /** Lists active presence states on `channel`. */
  presence(channel: string): Promise<Result<ReadonlyArray<PresenceState>, DataAccessError>>;
}
