import type { Result } from '@mono-magic/utils-ts-core';
import type { DataAccessError } from '../common/query.interface.js';
import type { IRealtimeProvider, PresenceState, RealtimeEnvelope } from './realtime.interface.js';

/**
 * Abstract base class for {@link IRealtimeProvider} implementations.
 */
export abstract class BaseRealtimeProvider implements IRealtimeProvider {
  public abstract publish<TPayload>(
    channel: string,
    event: string,
    payload: TPayload,
  ): Promise<Result<void, DataAccessError>>;
  public abstract subscribe<TPayload>(
    channel: string,
    listener: (message: RealtimeEnvelope<TPayload>) => void,
  ): Promise<Result<() => Promise<void>, DataAccessError>>;
  public abstract presence(
    channel: string,
  ): Promise<Result<ReadonlyArray<PresenceState>, DataAccessError>>;
}
