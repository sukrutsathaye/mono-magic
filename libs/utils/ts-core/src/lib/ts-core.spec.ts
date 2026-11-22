import { describe, expect, it, vi } from 'vitest';
import {
  AppError,
  TypedEventBus,
  err,
  flatMapResult,
  invariant,
  isErr,
  isOk,
  mapResult,
  ok,
  retryWithBackoff,
  unwrapOr,
} from '../index.js';

describe('Result helpers', () => {
  it('constructs and narrows ok/err results', () => {
    const success = ok(42);
    const failure = err('boom');

    expect(isOk(success)).toBe(true);
    expect(isErr(success)).toBe(false);
    expect(isOk(failure)).toBe(false);
    expect(isErr(failure)).toBe(true);
    expect(unwrapOr(success, 0)).toBe(42);
    expect(unwrapOr(failure, 0)).toBe(0);
  });

  it('maps and flatMaps ok results while short-circuiting errors', () => {
    const mappedOk = mapResult(ok(2), (n) => n * 3);
    const mappedErr = mapResult(err<string, number>('bad'), (n) => n * 3);
    const chainedOk = flatMapResult(ok(2), (n) => ok(n + 1));
    const chainedErr = flatMapResult(err<string, number>('bad'), (n) => ok(n + 1));

    expect(mappedOk).toEqual({ ok: true, value: 6 });
    expect(mappedErr).toEqual({ ok: false, error: 'bad' });
    expect(chainedOk).toEqual({ ok: true, value: 3 });
    expect(chainedErr).toEqual({ ok: false, error: 'bad' });
  });
});

describe('AppError and invariant', () => {
  it('sets default retryable based on error code and preserves cause/details', () => {
    const cause = new Error('root');
    const unavailable = new AppError('down', {
      code: 'UNAVAILABLE',
      details: { host: 'db' },
      cause,
    });
    const validation = new AppError('bad input', { code: 'VALIDATION' });
    const forced = new AppError('forced', { code: 'VALIDATION', retryable: true });

    expect(unavailable.name).toBe('AppError');
    expect(unavailable.code).toBe('UNAVAILABLE');
    expect(unavailable.details).toEqual({ host: 'db' });
    expect(unavailable.cause).toBe(cause);
    expect(unavailable.retryable).toBe(true);
    expect(validation.retryable).toBe(false);
    expect(forced.retryable).toBe(true);
  });

  it('invariant passes on truthy and throws AppError on falsy', () => {
    expect(() => invariant(true, 'should pass')).not.toThrow();
    expect(() => invariant(false, 'missing id', 'NOT_FOUND')).toThrow(AppError);
    try {
      invariant(0, 'invalid count');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe('VALIDATION');
    }
  });
});

describe('retryWithBackoff', () => {
  it('retries retryable failures and resolves on success', async () => {
    let attempts = 0;
    const result = await retryWithBackoff(
      async () => {
        attempts += 1;
        if (attempts < 3) {
          throw new AppError('transient', { code: 'TIMEOUT' });
        }
        return 'ok';
      },
      { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 5, jitter: false },
    );

    expect(result).toBe('ok');
    expect(attempts).toBe(3);
  });

  it('does not retry non-retryable AppError and rethrows after maxAttempts', async () => {
    const nonRetryableFn = vi.fn(async () => {
      throw new AppError('invalid', { code: 'VALIDATION' });
    });

    await expect(
      retryWithBackoff(nonRetryableFn, { maxAttempts: 3, baseDelayMs: 1 }),
    ).rejects.toThrow('invalid');
    expect(nonRetryableFn).toHaveBeenCalledTimes(1);

    const genericFn = vi.fn(async () => {
      throw new Error('network');
    });
    await expect(
      retryWithBackoff(genericFn, { maxAttempts: 2, baseDelayMs: 0, jitter: true }),
    ).rejects.toThrow('network');
    expect(genericFn).toHaveBeenCalledTimes(2);
  });

  it('respects AbortSignal before and during backoff sleep', async () => {
    const preAborted = new AbortController();
    preAborted.abort('cancelled');

    await expect(
      retryWithBackoff(async () => 'never', { signal: preAborted.signal }),
    ).rejects.toMatchObject({ code: 'TIMEOUT', retryable: false });

    const controller = new AbortController();
    const fn = vi.fn(async () => {
      setTimeout(() => controller.abort('stop'), 5);
      throw new Error('fail');
    });

    await expect(
      retryWithBackoff(fn, {
        maxAttempts: 3,
        baseDelayMs: 200,
        maxDelayMs: 200,
        jitter: false,
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ code: 'TIMEOUT', retryable: false });
  });
});

describe('TypedEventBus', () => {
  it('delivers on/once events, unsubscribes, and clears listeners', () => {
    const bus = new TypedEventBus<{ ping: number; pong: string }>();
    const pings: number[] = [];
    const oncePings: number[] = [];

    const offPing = bus.on('ping', (n) => pings.push(n));
    bus.once('ping', (n) => oncePings.push(n));

    bus.emit('ping', 1);
    bus.emit('ping', 2);
    offPing();
    bus.emit('ping', 3);

    expect(pings).toEqual([1, 2]);
    expect(oncePings).toEqual([1]);

    // Emitting or removing unregistered events is a safe no-op
    bus.emit('pong', 'ignored');
    bus.off('pong', () => undefined);

    const pongs: string[] = [];
    bus.on('pong', (s) => pongs.push(s));
    bus.clear('pong');
    bus.emit('pong', 'after-clear');
    expect(pongs).toEqual([]);

    bus.on('ping', (n) => pings.push(n));
    bus.clear();
    bus.emit('ping', 4);
    expect(pings).toEqual([1, 2]);
  });
});
