/**
 * Accepted date input representations for {@link formatDate}.
 */
export type DateInput = Date | number | string;

/**
 * Formatting options for {@link formatDuration}.
 */
export interface DurationFormatOptions {
  /**
   * Output style:
   * - `'compact'`: e.g. `'1h 23m 45s'`
   * - `'long'`: e.g. `'1 hour, 23 minutes, 45 seconds'`
   * Defaults to `'compact'`.
   */
  readonly style?: 'compact' | 'long';
  /** Whether to include the seconds component. Defaults to `true`. */
  readonly includeSeconds?: boolean;
}

/**
 * Formatting options for {@link formatCountdown}.
 */
export interface CountdownOptions {
  /** Whether to separate days from hours (`'2d 03:04:05'` vs `'51:04:05'`). Defaults to `true`. */
  readonly includeDays?: boolean;
}

/**
 * Immutable countdown breakdown returned by {@link formatCountdown}.
 */
export interface CountdownResult {
  /** Remaining milliseconds clamped to `>= 0`. */
  readonly totalMs: number;
  /** Remaining whole days (`0` when `includeDays` is `false` or expired). */
  readonly days: number;
  /** Remaining hours (`0`–`23` when `includeDays` is `true`, or total hours when `false`). */
  readonly hours: number;
  /** Remaining minutes (`0`–`59`). */
  readonly minutes: number;
  /** Remaining seconds (`0`–`59`). */
  readonly seconds: number;
  /** `true` when `targetEpochMs <= nowEpochMs`. */
  readonly isExpired: boolean;
  /** Zero-padded human-readable countdown string (e.g. `'1d 02:03:04'` or `'00:05:30'`). */
  readonly formatted: string;
}

const DEFAULT_LOCALE = 'en-US';
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const MS_PER_SECOND = 1000;

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function pluralizeUnit(value: number, singular: string, plural: string): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

function toValidDate(input: DateInput): Date {
  if (input instanceof Date) {
    const timestamp = input.getTime();
    if (!Number.isFinite(timestamp)) {
      throw new RangeError('Invalid Date instance provided');
    }
    return new Date(timestamp);
  }

  if (typeof input === 'number') {
    if (!Number.isFinite(input)) {
      throw new RangeError('Date timestamp must be a finite number');
    }
    const parsed = new Date(input);
    if (!Number.isFinite(parsed.getTime())) {
      throw new RangeError('Date timestamp is out of valid Date range');
    }
    return parsed;
  }

  if (typeof input === 'string') {
    if (input.trim().length === 0) {
      throw new RangeError('Date string must not be empty');
    }
    const parsed = new Date(input);
    if (!Number.isFinite(parsed.getTime())) {
      throw new RangeError(`Invalid date string: "${input}"`);
    }
    return parsed;
  }

  throw new TypeError('Date input must be a Date, finite timestamp, or date string');
}

/**
 * Formats a `Date`, epoch millisecond timestamp, or ISO/date string using `Intl.DateTimeFormat`.
 *
 * @param date - Date value to format.
 * @param locale - BCP 47 locale identifier. Defaults to `'en-US'`.
 * @param options - Optional `Intl.DateTimeFormatOptions`.
 * @returns Localized formatted date string.
 * @throws {RangeError} When `date` cannot be parsed into a valid `Date`.
 */
export function formatDate(
  date: DateInput,
  locale: string = DEFAULT_LOCALE,
  options?: Intl.DateTimeFormatOptions,
): string {
  const validDate = toValidDate(date);
  return new Intl.DateTimeFormat(locale, options).format(validDate);
}

/**
 * Formats a non-negative duration in seconds into a compact or long human-readable string.
 *
 * @param totalSeconds - Non-negative finite duration in seconds (fractional seconds are floored).
 * @param options - Optional formatting configuration (`style`, `includeSeconds`).
 * @returns Formatted duration string (e.g. `'1h 23m 45s'` or `'1 hour, 23 minutes, 45 seconds'`).
 * @throws {RangeError} When `totalSeconds` is negative or not finite.
 */
export function formatDuration(
  totalSeconds: number,
  options?: DurationFormatOptions,
): string {
  if (typeof totalSeconds !== 'number' || !Number.isFinite(totalSeconds)) {
    throw new RangeError('totalSeconds must be a finite number');
  }
  if (totalSeconds < 0) {
    throw new RangeError('totalSeconds must be greater than or equal to 0');
  }

  const style = options?.style ?? 'compact';
  const includeSeconds = options?.includeSeconds ?? true;

  const wholeSeconds = Math.floor(totalSeconds);
  const days = Math.floor(wholeSeconds / SECONDS_PER_DAY);
  const hours = Math.floor((wholeSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
  const minutes = Math.floor(
    (wholeSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE,
  );
  const seconds = wholeSeconds % SECONDS_PER_MINUTE;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(
      style === 'long' ? pluralizeUnit(days, 'day', 'days') : `${days}d`,
    );
  }
  if (hours > 0) {
    parts.push(
      style === 'long' ? pluralizeUnit(hours, 'hour', 'hours') : `${hours}h`,
    );
  }
  if (minutes > 0) {
    parts.push(
      style === 'long'
        ? pluralizeUnit(minutes, 'minute', 'minutes')
        : `${minutes}m`,
    );
  }
  if (includeSeconds && seconds > 0) {
    parts.push(
      style === 'long'
        ? pluralizeUnit(seconds, 'second', 'seconds')
        : `${seconds}s`,
    );
  }

  if (parts.length === 0) {
    if (includeSeconds) {
      return style === 'long' ? '0 seconds' : '0s';
    }
    return style === 'long' ? '0 minutes' : '0m';
  }

  return style === 'long' ? parts.join(', ') : parts.join(' ');
}

/**
 * Computes an immutable countdown breakdown from `nowEpochMs` to `targetEpochMs`.
 * Completely pure and deterministic when `nowEpochMs` is explicitly supplied.
 *
 * @param targetEpochMs - Target timestamp in epoch milliseconds.
 * @param nowEpochMs - Current reference timestamp in epoch milliseconds. Defaults to `Date.now()`.
 * @param options - Optional countdown formatting configuration (`includeDays`).
 * @returns Frozen {@link CountdownResult}.
 * @throws {RangeError} When `targetEpochMs` or `nowEpochMs` is not finite.
 */
export function formatCountdown(
  targetEpochMs: number,
  nowEpochMs: number = Date.now(),
  options?: CountdownOptions,
): CountdownResult {
  if (typeof targetEpochMs !== 'number' || !Number.isFinite(targetEpochMs)) {
    throw new RangeError('targetEpochMs must be a finite number');
  }
  if (typeof nowEpochMs !== 'number' || !Number.isFinite(nowEpochMs)) {
    throw new RangeError('nowEpochMs must be a finite number');
  }

  const includeDays = options?.includeDays ?? true;
  const diffMs = targetEpochMs - nowEpochMs;

  if (diffMs <= 0) {
    return Object.freeze({
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      formatted: '00:00:00',
    });
  }

  const totalSeconds = Math.floor(diffMs / MS_PER_SECOND);
  const days = includeDays ? Math.floor(totalSeconds / SECONDS_PER_DAY) : 0;
  const hours = includeDays
    ? Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR)
    : Math.floor(totalSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor(
    (totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE,
  );
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  const timePart = `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  const formatted = days > 0 ? `${days}d ${timePart}` : timePart;

  return Object.freeze({
    totalMs: diffMs,
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    formatted,
  });
}
