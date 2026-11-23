import { describe, expect, it } from 'vitest';
import {
  formatCountdown,
  formatDate,
  formatDuration,
} from './datetime.js';

describe('datetime utilities', () => {
  describe('formatDate', () => {
    it('formats Date instances, epoch timestamps, and ISO strings', () => {
      const iso = '2026-01-15T12:30:00.000Z';
      const date = new Date(iso);
      const opts: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      };

      expect(formatDate(date, 'en-US', opts)).toBe('Jan 15, 2026');
      expect(formatDate(date.getTime(), 'en-US', opts)).toBe('Jan 15, 2026');
      expect(formatDate(iso, 'en-US', opts)).toBe('Jan 15, 2026');
      expect(formatDate(iso, 'en-GB', opts)).toBe('15 Jan 2026');
    });

    it('does not mutate the input Date instance', () => {
      const original = new Date('2026-06-01T00:00:00.000Z');
      const timestampBefore = original.getTime();
      formatDate(original, 'en-US', { timeZone: 'UTC' });
      expect(original.getTime()).toBe(timestampBefore);
    });

    it('throws on invalid dates, timestamps, strings, or unsupported types', () => {
      expect(() => formatDate(new Date('not-a-date'))).toThrow(RangeError);
      expect(() => formatDate(Number.NaN)).toThrow(RangeError);
      expect(() => formatDate(Number.POSITIVE_INFINITY)).toThrow(RangeError);
      expect(() => formatDate(1e20)).toThrow(RangeError);
      expect(() => formatDate('')).toThrow(RangeError);
      expect(() => formatDate('   ')).toThrow(RangeError);
      expect(() => formatDate('invalid-date-string')).toThrow(RangeError);
      expect(() => formatDate(null as unknown as Date)).toThrow(TypeError);
    });
  });

  describe('formatDuration', () => {
    it('formats durations in compact style', () => {
      expect(formatDuration(0)).toBe('0s');
      expect(formatDuration(45)).toBe('45s');
      expect(formatDuration(5025)).toBe('1h 23m 45s');
      expect(formatDuration(90061)).toBe('1d 1h 1m 1s');
      expect(formatDuration(3600)).toBe('1h');
      expect(formatDuration(59.9)).toBe('59s');
    });

    it('formats durations in long style with proper singular/plural forms', () => {
      expect(formatDuration(0, { style: 'long' })).toBe('0 seconds');
      expect(formatDuration(1, { style: 'long' })).toBe('1 second');
      expect(formatDuration(5025, { style: 'long' })).toBe(
        '1 hour, 23 minutes, 45 seconds',
      );
      expect(formatDuration(172800 + 7200 + 60 + 2, { style: 'long' })).toBe(
        '2 days, 2 hours, 1 minute, 2 seconds',
      );
      expect(formatDuration(86400, { style: 'long' })).toBe('1 day');
    });

    it('respects includeSeconds: false', () => {
      expect(formatDuration(5025, { includeSeconds: false })).toBe('1h 23m');
      expect(
        formatDuration(5025, { style: 'long', includeSeconds: false }),
      ).toBe('1 hour, 23 minutes');
      expect(formatDuration(30, { includeSeconds: false })).toBe('0m');
      expect(
        formatDuration(30, { style: 'long', includeSeconds: false }),
      ).toBe('0 minutes');
    });

    it('throws RangeError for negative or non-finite seconds', () => {
      expect(() => formatDuration(-1)).toThrow(RangeError);
      expect(() => formatDuration(Number.NaN)).toThrow(RangeError);
      expect(() => formatDuration(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    });
  });

  describe('formatCountdown', () => {
    it('returns an immutable breakdown with days when includeDays is true', () => {
      const now = 1_700_000_000_000;
      const target = now + (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000 + 250;
      const result = formatCountdown(target, now);

      expect(result).toEqual({
        totalMs: target - now,
        days: 2,
        hours: 3,
        minutes: 4,
        seconds: 5,
        isExpired: false,
        formatted: '2d 03:04:05',
      });
      expect(Object.isFrozen(result)).toBe(true);
    });

    it('omits days prefix when less than 24 hours remain', () => {
      const now = 1_700_000_000_000;
      const target = now + (5 * 3600 + 9 * 60 + 8) * 1000;
      const result = formatCountdown(target, now);

      expect(result).toEqual({
        totalMs: target - now,
        days: 0,
        hours: 5,
        minutes: 9,
        seconds: 8,
        isExpired: false,
        formatted: '05:09:08',
      });
    });

    it('folds days into hours when includeDays is false', () => {
      const now = 1_700_000_000_000;
      const target = now + (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000;
      const result = formatCountdown(target, now, { includeDays: false });

      expect(result).toEqual({
        totalMs: target - now,
        days: 0,
        hours: 51,
        minutes: 4,
        seconds: 5,
        isExpired: false,
        formatted: '51:04:05',
      });
    });

    it('handles expired and exact-match timestamps cleanly', () => {
      const now = 1_700_000_000_000;
      const exact = formatCountdown(now, now);
      const past = formatCountdown(now - 5000, now);

      const expected = {
        totalMs: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        formatted: '00:00:00',
      };
      expect(exact).toEqual(expected);
      expect(past).toEqual(expected);
      expect(Object.isFrozen(past)).toBe(true);
    });

    it('defaults nowEpochMs to Date.now() when omitted', () => {
      const future = Date.now() + 60_000;
      const result = formatCountdown(future);
      expect(result.isExpired).toBe(false);
      expect(result.totalMs).toBeGreaterThan(0);
    });

    it('throws RangeError for non-finite timestamps', () => {
      expect(() => formatCountdown(Number.NaN, 0)).toThrow(RangeError);
      expect(() => formatCountdown(1000, Number.POSITIVE_INFINITY)).toThrow(
        RangeError,
      );
    });
  });
});
