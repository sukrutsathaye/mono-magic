import { describe, expect, it } from 'vitest';
import {
  calculateTax,
  formatCurrency,
  roundCurrency,
} from './currency.js';

describe('currency utilities', () => {
  describe('roundCurrency', () => {
    it('rounds IEEE-754 tricky midpoint values deterministically with half-up', () => {
      expect(roundCurrency(1.005, 2, 'half-up')).toBe(1.01);
      expect(roundCurrency(35.855, 2, 'half-up')).toBe(35.86);
      expect(roundCurrency(2.675, 2, 'half-up')).toBe(2.68);
      expect(roundCurrency(-1.005, 2, 'half-up')).toBe(-1.01);
      expect(roundCurrency(1.004, 2, 'half-up')).toBe(1);
    });

    it('supports banker rounding (half-even)', () => {
      expect(roundCurrency(2.5, 0, 'half-even')).toBe(2);
      expect(roundCurrency(3.5, 0, 'half-even')).toBe(4);
      expect(roundCurrency(1.005, 2, 'half-even')).toBe(1);
      expect(roundCurrency(1.015, 2, 'half-even')).toBe(1.02);
      expect(roundCurrency(1.016, 2, 'half-even')).toBe(1.02);
      expect(roundCurrency(1.014, 2, 'half-even')).toBe(1.01);
      expect(roundCurrency(-2.5, 0, 'half-even')).toBe(-2);
      expect(roundCurrency(-3.5, 0, 'half-even')).toBe(-4);
    });

    it('normalizes zero and negative zero to 0', () => {
      expect(Object.is(roundCurrency(0), 0)).toBe(true);
      expect(Object.is(roundCurrency(-0), 0)).toBe(true);
      expect(Object.is(roundCurrency(-0.001, 2), 0)).toBe(true);
    });

    it('throws RangeError on non-finite values or invalid decimals', () => {
      expect(() => roundCurrency(Number.NaN)).toThrow(RangeError);
      expect(() => roundCurrency(Number.POSITIVE_INFINITY)).toThrow(RangeError);
      expect(() => roundCurrency(10, -1)).toThrow(RangeError);
      expect(() => roundCurrency(10, 11)).toThrow(RangeError);
      expect(() => roundCurrency(10, 1.5)).toThrow(RangeError);
    });
  });

  describe('formatCurrency', () => {
    it('formats amounts across currencies and locales', () => {
      expect(formatCurrency(1234.5, 'USD', 'en-US')).toBe('$1,234.50');
      expect(formatCurrency(1234.5, 'usd', 'en-US')).toBe('$1,234.50');
      expect(formatCurrency(1500, 'JPY', 'ja-JP')).toMatch(/1,500/);
      expect(formatCurrency(99.99, 'EUR', 'de-DE')).toMatch(/99,99/);
      expect(formatCurrency(-42.5, 'USD', 'en-US')).toBe('-$42.50');
      expect(formatCurrency(-0, 'USD', 'en-US')).toBe('$0.00');
    });

    it('merges custom Intl.NumberFormatOptions while enforcing currency style', () => {
      const formatted = formatCurrency(1234.5, 'USD', 'en-US', {
        currencyDisplay: 'code',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      expect(formatted).toContain('USD');
      expect(formatted).toContain('1,235');
    });

    it('throws RangeError for non-finite amounts or invalid currency codes', () => {
      expect(() => formatCurrency(Number.NaN, 'USD')).toThrow(RangeError);
      expect(() => formatCurrency(Number.NEGATIVE_INFINITY, 'USD')).toThrow(
        RangeError,
      );
      expect(() => formatCurrency(10, '')).toThrow(RangeError);
      expect(() => formatCurrency(10, 'US')).toThrow(RangeError);
      expect(() => formatCurrency(10, 'US1')).toThrow(RangeError);
      expect(() => formatCurrency(10, 'USDD')).toThrow(RangeError);
    });
  });

  describe('calculateTax', () => {
    it('calculates tax-exclusive breakdown accurately and returns a frozen object', () => {
      const result = calculateTax(100, 0.0825);
      expect(result).toEqual({
        subtotal: 100,
        taxAmount: 8.25,
        total: 108.25,
        taxRate: 0.0825,
        inclusive: false,
      });
      expect(Object.isFrozen(result)).toBe(true);
    });

    it('avoids floating-point drift on fractional prices', () => {
      const result = calculateTax(19.99, 0.075);
      expect(result.subtotal).toBe(19.99);
      expect(result.taxAmount).toBe(1.5);
      expect(result.total).toBe(21.49);

      const zeroTax = calculateTax(0, 0.2);
      expect(zeroTax).toEqual({
        subtotal: 0,
        taxAmount: 0,
        total: 0,
        taxRate: 0.2,
        inclusive: false,
      });
    });

    it('calculates tax-inclusive breakdown with subtotal + taxAmount === total', () => {
      const exact = calculateTax(110, 0.1, { inclusive: true });
      expect(exact).toEqual({
        subtotal: 100,
        taxAmount: 10,
        total: 110,
        taxRate: 0.1,
        inclusive: true,
      });
      expect(Object.isFrozen(exact)).toBe(true);

      const repeating = calculateTax(100, 0.2, { inclusive: true });
      expect(repeating.subtotal).toBe(83.33);
      expect(repeating.taxAmount).toBe(16.67);
      expect(repeating.total).toBe(100);
    });

    it('supports custom decimals and banker rounding', () => {
      const jpy = calculateTax(1000, 0.1, { decimals: 0 });
      expect(jpy).toEqual({
        subtotal: 1000,
        taxAmount: 100,
        total: 1100,
        taxRate: 0.1,
        inclusive: false,
      });

      const banker = calculateTax(10, 0.0005, {
        decimals: 2,
        roundingMode: 'half-even',
      });
      expect(banker.taxAmount).toBe(0);
    });

    it('throws RangeError for negative or non-finite inputs', () => {
      expect(() => calculateTax(-1, 0.1)).toThrow(RangeError);
      expect(() => calculateTax(100, -0.05)).toThrow(RangeError);
      expect(() => calculateTax(Number.NaN, 0.1)).toThrow(RangeError);
      expect(() => calculateTax(100, Number.POSITIVE_INFINITY)).toThrow(
        RangeError,
      );
      expect(() => calculateTax(100, 0.1, { decimals: -1 })).toThrow(
        RangeError,
      );
    });
  });
});
