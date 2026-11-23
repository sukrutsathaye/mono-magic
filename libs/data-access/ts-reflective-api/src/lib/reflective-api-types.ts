import type { RetryOptions } from '@mono-magic/utils-ts-core';

/**
 * Minimal HTTP response interface compatible with standard `fetch` `Response`.
 */
export interface ReflectiveHttpResponseLike {
  /** Whether the HTTP status code is in the 200-299 range. */
  readonly ok: boolean;
  /** Numeric HTTP status code. */
  readonly status: number;
  /** Optional HTTP status text. */
  readonly statusText?: string;
  /** Parses the response body as JSON. */
  json(): Promise<unknown>;
  /** Reads the response body as plain text. */
  text?(): Promise<string>;
}

/**
 * Request init options passed to {@link ReflectiveFetchFn}.
 */
export interface ReflectiveHttpRequestInit {
  /** HTTP method (`'GET'`, `'POST'`, `'PATCH'`, `'DELETE'`). */
  readonly method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  /** HTTP request headers. */
  readonly headers: Readonly<Record<string, string>>;
  /** Optional serialized JSON body. */
  readonly body?: string;
  /** Optional abort signal. */
  readonly signal?: AbortSignal;
}

/**
 * Injectable fetch transport signature used by {@link ReflectiveLearningApiClient}.
 */
export type ReflectiveFetchFn = (
  url: string,
  init: ReflectiveHttpRequestInit,
) => Promise<ReflectiveHttpResponseLike>;

/**
 * Message event payload delivered by an {@link EventSourceLike} instance.
 */
export interface SseMessageEventLike {
  /** Raw UTF-8 event data string (typically JSON-encoded). */
  readonly data: string;
}

/**
 * Minimal `EventSource`-compatible interface for Server-Sent Events (SSE) progress streaming.
 */
export interface EventSourceLike {
  /** Handler invoked when a message arrives on the SSE stream. */
  onmessage: ((event: SseMessageEventLike) => void) | null;
  /** Handler invoked when the SSE stream encounters an error. */
  onerror: ((error: unknown) => void) | null;
  /** Closes the SSE connection. */
  close(): void;
}

/**
 * Factory function creating an {@link EventSourceLike} connection for a target URL.
 */
export type EventSourceFactory = (
  url: string,
  headers?: Readonly<Record<string, string>>,
) => EventSourceLike;

/**
 * Configuration options for {@link ReflectiveLearningApiClient}.
 */
export interface ReflectiveApiClientConfig {
  /** Base URL of the Reflective Learning API service (e.g., `'http://localhost:8000'`). */
  readonly baseUrl: string;
  /** Optional API path prefix (defaults to `'/api/v1'`). */
  readonly apiPrefix?: string;
  /** Optional static or dynamic bearer token provider for authenticated requests. */
  readonly getAuthToken?: () => string | null | undefined | Promise<string | null | undefined>;
  /** Optional default headers included on every request. */
  readonly defaultHeaders?: Readonly<Record<string, string>>;
  /** Injectable HTTP fetch implementation (defaults to `globalThis.fetch`). */
  readonly fetchFn?: ReflectiveFetchFn;
  /** Injectable SSE `EventSource` factory for real-time ingestion progress streams. */
  readonly eventSourceFactory?: EventSourceFactory;
  /** Retry configuration passed to `retryWithBackoff` from `@mono-magic/utils-ts-core`. */
  readonly retryOptions?: RetryOptions;
}
