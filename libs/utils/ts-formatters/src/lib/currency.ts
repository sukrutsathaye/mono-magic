/**
 * Rounding strategy for monetary calculations.
 * - `'half-up'`: Rounds midpoint values (`.5`) away from zero.
 * - `'half-even'`: Banker's rounding; rounds midpoint values (`.5`) to the nearest even digit.
 */
export type RoundingMode = 'half-up' | 'half-even';

/**
 * Options for {@link calculateTax}.
 */
export interface TaxCalculationOptions {
  /** Whether the input amount already includes tax. Defaults to `false`. */
  readonly inclusive?: boolean;
  /** Number of fractional decimal digits to round outputs to (`0`–`10`). Defaults to `2`. */
  readonly decimals?: number;
  /** Deterministic rounding strategy. Defaults to `'half-up'`. */
  readonly roundingMode?: RoundingMode;
}

/**
 * Immutable tax calculation result.
 */
export interface TaxBreakdown {
  /** Pre-tax amount rounded to the requested decimal precision. */
  readonly subtotal: number;
  /** Computed tax amount rounded to the requested decimal precision. */
  readonly taxAmount: number;
  /** Final tax-inclusive total (`subtotal + taxAmount`). */
  readonly total: number;
  /** Applied tax rate expressed as a decimal fraction (e.g. `0.0825` for `8.25%`). */
  readonly taxRate: number;
  /** Whether the original input amount was tax-inclusive. */
  readonly inclusive: boolean;
}

const ISO_CURRENCY_PATTERN = /^[A-Za-z]{3}$/;
const MIN_DECIMALS = 0;
const MAX_DECIMALS = 10;
const DEFAULT_LOCALE = 'en-US';
const DEFAULT_DECIMALS = 2;

function assertFiniteNumber(value: number, name: string): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number`);
  }
}

function assertValidDecimals(decimals: number): void {
  if (
    typeof decimals !== 'number' ||
    !Number.isInteger(decimals) ||
    decimals < MIN_DECIMALS ||
    decimals > MAX_DECIMALS
  ) {
    throw new RangeError(
      `decimals must be an integer between ${MIN_DECIMALS} and ${MAX_DECIMALS}`,
    );
  }
}

/**
 * Shifts the decimal point of a finite number without binary floating-point multiplication drift.
 */
function shiftDecimal(value: number, exponentDelta: number): number {
  if (value === 0) {
    return 0;
  }
  const [mantissa, rawExponent] = value.toExponential(14).split('e');
  const nextExponent = Number(rawExponent) + exponentDelta;
  return Number(`${mantissa}e${nextExponent}`);
}

/**
 * Rounds a finite numeric value to the requested decimal places using deterministic
 * decimal shifting to avoid IEEE-754 floating-point drift (e.g. `1.005 -> 1.01`).
 *
 * @param value - Finite numeric value to round.
 * @param decimals - Number of decimal places (`0`–`10`). Defaults to `2`.
 * @param roundingMode - Rounding strategy (`'half-up'` or `'half-even'`). Defaults to `'half-up'`.
 * @returns Rounded number with `-0` normalized to `0`.
 * @throws {RangeError} When `value` is not finite or `decimals` is out of range.
 */
export function roundCurrency(
  value: number,
  decimals: number = DEFAULT_DECIMALS,
  roundingMode: RoundingMode = 'half-up',
): number {
  assertFiniteNumber(value, 'value');
  assertValidDecimals(decimals);

  if (value === 0) {
    return 0;
  }

  const scaled = shiftDecimal(value, decimals);
  const absScaled = Math.abs(scaled);
  const truncatedAbs = Math.trunc(absScaled);
  const fractional = Number((absScaled - truncatedAbs).toPrecision(12));

  let roundedAbs: number;
  if (roundingMode === 'half-even') {
    if (fractional > 0.5) {
      roundedAbs = truncatedAbs + 1;
    } else if (fractional < 0.5) {
      roundedAbs = truncatedAbs;
    } else {
      roundedAbs = truncatedAbs % 2 === 0 ? truncatedAbs : truncatedAbs + 1;
    }
  } else {
    roundedAbs = fractional >= 0.5 ? truncatedAbs + 1 : truncatedAbs;
  }

  const signedInt = scaled < 0 ? -roundedAbs : roundedAbs;
  const result = shiftDecimal(signedInt, -decimals);
  return result === 0 ? 0 : result;
}

/**
 * Formats a finite numeric amount as a localized currency string via `Intl.NumberFormat`.
 *
 * @param amount - Monetary amount to format (must be finite).
 * @param currency - 3-letter ISO 4217 currency code (e.g. `'USD'`, `'EUR'`, `'JPY'`).
 * @param locale - BCP 47 locale identifier. Defaults to `'en-US'`.
 * @param options - Additional `Intl.NumberFormatOptions` merged with currency formatting.
 * @returns Localized currency string.
 * @throws {RangeError} When `amount` is not finite or `currency` is not a valid 3-letter code.
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string = DEFAULT_LOCALE,
  options?: Intl.NumberFormatOptions,
): string {
  assertFiniteNumber(amount, 'amount');

  const normalizedCurrency = currency.trim().toUpperCase();
  if (!ISO_CURRENCY_PATTERN.test(normalizedCurrency)) {
    throw new RangeError(
      `currency must be a 3-letter ISO 4217 code, received "${currency}"`,
    );
  }

  const normalizedAmount = amount === 0 ? 0 : amount;
  return new Intl.NumberFormat(locale, {
    ...options,
    style: 'currency',
    currency: normalizedCurrency,
  }).format(normalizedAmount);
}

/**
 * Calculates a deterministic, immutable tax breakdown for either tax-exclusive
 * or tax-inclusive amounts while avoiding IEEE-754 floating-point drift.
 *
 * @param subtotal - Non-negative base amount (or tax-inclusive total when `options.inclusive` is `true`).
 * @param taxRate - Non-negative decimal tax rate (e.g. `0.1` for `10%`, `0.0825` for `8.25%`).
 * @param options - Optional calculation settings (`inclusive`, `decimals`, `roundingMode`).
 * @returns Frozen {@link TaxBreakdown} object where `subtotal + taxAmount === total`.
 * @throws {RangeError} When `subtotal` or `taxRate` is negative/non-finite, or `decimals` is invalid.
 */
export function calculateTax(
  subtotal: number,
  taxRate: number,
  options?: TaxCalculationOptions,
): TaxBreakdown {
  assertFiniteNumber(subtotal, 'subtotal');
  assertFiniteNumber(taxRate, 'taxRate');

  if (subtotal < 0) {
    throw new RangeError('subtotal must be greater than or equal to 0');
  }
  if (taxRate < 0) {
    throw new RangeError('taxRate must be greater than or equal to 0');
  }

  const inclusive = options?.inclusive ?? false;
  const decimals = options?.decimals ?? DEFAULT_DECIMALS;
  const roundingMode = options?.roundingMode ?? 'half-up';
  assertValidDecimals(decimals);

  if (inclusive) {
    const total = roundCurrency(subtotal, decimals, roundingMode);
    const netSubtotal = roundCurrency(
      total / (1 + taxRate),
      decimals,
      roundingMode,
    );
    const taxAmount = roundCurrency(
      total - netSubtotal,
      decimals,
      roundingMode,
    );

    return Object.freeze({
      subtotal: netSubtotal,
      taxAmount,
      total,
      taxRate,
      inclusive: true,
    });
  }

  const roundedSubtotal = roundCurrency(subtotal, decimals, roundingMode);
  const taxAmount = roundCurrency(
    roundedSubtotal * taxRate,
    decimals,
    roundingMode,
  );
  const total = roundCurrency(
    roundedSubtotal + taxAmount,
    decimals,
    roundingMode,
  );

  return Object.freeze({
    subtotal: roundedSubtotal,
    taxAmount,
    total,
    taxRate,
    inclusive: false,
  });
}
