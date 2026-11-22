/**
 * Callback signature for {@link TypedEventBus} listeners.
 */
export type EventListener<TPayload> = (payload: TPayload) => void;

/**
 * Lightweight, strongly-typed in-process publish/subscribe event bus.
 */
export class TypedEventBus<TEvents extends Record<string, unknown>> {
  private readonly listeners = new Map<keyof TEvents, Set<EventListener<never>>>();

  /**
   * Registers a listener for `event` and returns an unsubscribe function.
   */
  public on<K extends keyof TEvents>(event: K, listener: EventListener<TEvents[K]>): () => void {
    let bucket = this.listeners.get(event);
    if (!bucket) {
      bucket = new Set();
      this.listeners.set(event, bucket);
    }
    bucket.add(listener as EventListener<never>);
    return () => this.off(event, listener);
  }

  /**
   * Registers a one-time listener for `event` and returns an unsubscribe function.
   */
  public once<K extends keyof TEvents>(event: K, listener: EventListener<TEvents[K]>): () => void {
    const wrapper: EventListener<TEvents[K]> = (payload) => {
      this.off(event, wrapper);
      listener(payload);
    };
    return this.on(event, wrapper);
  }

  /**
   * Removes a previously registered listener for `event`.
   */
  public off<K extends keyof TEvents>(event: K, listener: EventListener<TEvents[K]>): void {
    const bucket = this.listeners.get(event);
    if (!bucket) {
      return;
    }
    bucket.delete(listener as EventListener<never>);
    if (bucket.size === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Emits `payload` synchronously to a snapshot of listeners registered for `event`.
   */
  public emit<K extends keyof TEvents>(event: K, payload: TEvents[K]): void {
    const bucket = this.listeners.get(event);
    if (!bucket) {
      return;
    }
    for (const listener of [...bucket]) {
      (listener as EventListener<TEvents[K]>)(payload);
    }
  }

  /**
   * Removes all listeners for `event`, or all events when omitted.
   */
  public clear<K extends keyof TEvents>(event?: K): void {
    if (event !== undefined) {
      this.listeners.delete(event);
      return;
    }
    this.listeners.clear();
  }
}
