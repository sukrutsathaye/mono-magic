/**
 * Craft Yarn Council (CYC) standard yarn weight category (`0` Lace through `7` Jumbo).
 */
export type YarnWeightCategory = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Immutable inclusive numeric range.
 */
export interface NumericRange {
  /** Minimum value of the range. */
  readonly min: number;
  /** Maximum value of the range. */
  readonly max: number;
}

/**
 * Craft Yarn Council (CYC) reference specifications for a yarn weight category.
 */
export interface YarnWeightInfo {
  /** Standard CYC numeric category (`0`–`7`). */
  readonly category: YarnWeightCategory;
  /** Canonical CYC category name (e.g. `'Medium'`). */
  readonly name: string;
  /** Common regional or commercial aliases (e.g. `['Worsted', 'Afghan', 'Aran']`). */
  readonly aliases: readonly string[];
  /** Typical wraps per inch (WPI) range. */
  readonly wrapsPerInch: NumericRange;
  /** Standard knit gauge range in stitches per 10 cm (4 in). */
  readonly knitGaugePer10Cm: NumericRange;
  /** Standard crochet gauge range in single-crochet stitches per 10 cm (4 in). */
  readonly crochetGaugePer10Cm: NumericRange;
  /** Recommended knitting needle diameter range in millimeters. */
  readonly needleSizeMm: NumericRange;
  /** Recommended US knitting needle size range. */
  readonly needleSizeUs: string;
  /** Recommended crochet hook diameter range in millimeters. */
  readonly hookSizeMm: NumericRange;
  /** Recommended US crochet hook size range. */
  readonly hookSizeUs: string;
}

/**
 * Supported metric and imperial length units for crafting conversions.
 */
export type LengthUnit = 'mm' | 'cm' | 'm' | 'in' | 'ft' | 'yd';

/**
 * Computed finished fabric dimensions from stitch/row counts and gauge.
 */
export interface GaugeDimensions {
  /** Finished width in centimeters. */
  readonly widthCm: number;
  /** Finished height in centimeters. */
  readonly heightCm: number;
  /** Finished width in inches. */
  readonly widthInches: number;
  /** Finished height in inches. */
  readonly heightInches: number;
}

/**
 * Supported international clothing size systems.
 */
export type ClothingSizeSystem = 'US' | 'UK' | 'EU' | 'JP' | 'INTL';

/**
 * Supported clothing size chart categories.
 */
export type ClothingCategory = 'womens' | 'mens' | 'unisex';

/**
 * Accepted size input value (letter or numeric size).
 */
export type ClothingSizeValue = string | number;

const METERS_PER_YARD = 0.9144;
const CM_PER_INCH = 2.54;

const METERS_PER_UNIT: Readonly<Record<LengthUnit, number>> = Object.freeze({
  mm: 0.001,
  cm: 0.01,
  m: 1,
  in: 0.0254,
  ft: 0.3048,
  yd: METERS_PER_YARD,
});

const YARN_WEIGHT_TABLE: Readonly<Record<YarnWeightCategory, YarnWeightInfo>> =
  Object.freeze({
    0: Object.freeze({
      category: 0,
      name: 'Lace',
      aliases: Object.freeze(['Thread', 'Cobweb', 'Light Fingering', '2-ply']),
      wrapsPerInch: Object.freeze({ min: 30, max: 40 }),
      knitGaugePer10Cm: Object.freeze({ min: 33, max: 40 }),
      crochetGaugePer10Cm: Object.freeze({ min: 32, max: 42 }),
      needleSizeMm: Object.freeze({ min: 1.5, max: 2.25 }),
      needleSizeUs: '000–1',
      hookSizeMm: Object.freeze({ min: 1.4, max: 2.25 }),
      hookSizeUs: 'Steel 6–8 / B-1',
    }),
    1: Object.freeze({
      category: 1,
      name: 'Super Fine',
      aliases: Object.freeze(['Sock', 'Fingering', 'Baby', '4-ply']),
      wrapsPerInch: Object.freeze({ min: 14, max: 30 }),
      knitGaugePer10Cm: Object.freeze({ min: 27, max: 32 }),
      crochetGaugePer10Cm: Object.freeze({ min: 21, max: 32 }),
      needleSizeMm: Object.freeze({ min: 2.25, max: 3.25 }),
      needleSizeUs: '1–3',
      hookSizeMm: Object.freeze({ min: 2.25, max: 3.5 }),
      hookSizeUs: 'B-1–E-4',
    }),
    2: Object.freeze({
      category: 2,
      name: 'Fine',
      aliases: Object.freeze(['Sport', '5-ply']),
      wrapsPerInch: Object.freeze({ min: 12, max: 18 }),
      knitGaugePer10Cm: Object.freeze({ min: 23, max: 26 }),
      crochetGaugePer10Cm: Object.freeze({ min: 16, max: 20 }),
      needleSizeMm: Object.freeze({ min: 3.25, max: 3.75 }),
      needleSizeUs: '3–5',
      hookSizeMm: Object.freeze({ min: 3.5, max: 4.5 }),
      hookSizeUs: 'E-4–7',
    }),
    3: Object.freeze({
      category: 3,
      name: 'Light',
      aliases: Object.freeze(['DK', 'Light Worsted', '8-ply']),
      wrapsPerInch: Object.freeze({ min: 11, max: 15 }),
      knitGaugePer10Cm: Object.freeze({ min: 21, max: 24 }),
      crochetGaugePer10Cm: Object.freeze({ min: 12, max: 17 }),
      needleSizeMm: Object.freeze({ min: 3.75, max: 4.5 }),
      needleSizeUs: '5–7',
      hookSizeMm: Object.freeze({ min: 4.5, max: 5.5 }),
      hookSizeUs: '7–I-9',
    }),
    4: Object.freeze({
      category: 4,
      name: 'Medium',
      aliases: Object.freeze(['Worsted', 'Afghan', 'Aran', '10-ply']),
      wrapsPerInch: Object.freeze({ min: 9, max: 12 }),
      knitGaugePer10Cm: Object.freeze({ min: 16, max: 20 }),
      crochetGaugePer10Cm: Object.freeze({ min: 11, max: 14 }),
      needleSizeMm: Object.freeze({ min: 4.5, max: 5.5 }),
      needleSizeUs: '7–9',
      hookSizeMm: Object.freeze({ min: 5.5, max: 6.5 }),
      hookSizeUs: 'I-9–K-10.5',
    }),
    5: Object.freeze({
      category: 5,
      name: 'Bulky',
      aliases: Object.freeze(['Chunky', 'Craft', 'Rug', '12-ply']),
      wrapsPerInch: Object.freeze({ min: 6, max: 9 }),
      knitGaugePer10Cm: Object.freeze({ min: 12, max: 15 }),
      crochetGaugePer10Cm: Object.freeze({ min: 8, max: 11 }),
      needleSizeMm: Object.freeze({ min: 5.5, max: 8 }),
      needleSizeUs: '9–11',
      hookSizeMm: Object.freeze({ min: 6.5, max: 9 }),
      hookSizeUs: 'K-10.5–M-13',
    }),
    6: Object.freeze({
      category: 6,
      name: 'Super Bulky',
      aliases: Object.freeze(['Super Chunky', 'Roving']),
      wrapsPerInch: Object.freeze({ min: 5, max: 6 }),
      knitGaugePer10Cm: Object.freeze({ min: 7, max: 11 }),
      crochetGaugePer10Cm: Object.freeze({ min: 7, max: 9 }),
      needleSizeMm: Object.freeze({ min: 8, max: 12.75 }),
      needleSizeUs: '11–17',
      hookSizeMm: Object.freeze({ min: 9, max: 15 }),
      hookSizeUs: 'M-13–Q',
    }),
    7: Object.freeze({
      category: 7,
      name: 'Jumbo',
      aliases: Object.freeze(['Mega Bulky', 'Giant']),
      wrapsPerInch: Object.freeze({ min: 1, max: 4 }),
      knitGaugePer10Cm: Object.freeze({ min: 1, max: 6 }),
      crochetGaugePer10Cm: Object.freeze({ min: 1, max: 6 }),
      needleSizeMm: Object.freeze({ min: 12.75, max: 25 }),
      needleSizeUs: '17+',
      hookSizeMm: Object.freeze({ min: 15, max: 25 }),
      hookSizeUs: 'Q+',
    }),
  });

type ClothingSizeRow = Readonly<Record<ClothingSizeSystem, string>>;

const CLOTHING_SIZE_CHARTS: Readonly<
  Record<ClothingCategory, readonly ClothingSizeRow[]>
> = Object.freeze({
  womens: Object.freeze([
    Object.freeze({ INTL: 'XS', US: '2', UK: '6', EU: '34', JP: '5' }),
    Object.freeze({ INTL: 'S', US: '4', UK: '8', EU: '36', JP: '7' }),
    Object.freeze({ INTL: 'S', US: '6', UK: '10', EU: '38', JP: '9' }),
    Object.freeze({ INTL: 'M', US: '8', UK: '12', EU: '40', JP: '11' }),
    Object.freeze({ INTL: 'M', US: '10', UK: '14', EU: '42', JP: '13' }),
    Object.freeze({ INTL: 'L', US: '12', UK: '16', EU: '44', JP: '15' }),
    Object.freeze({ INTL: 'L', US: '14', UK: '18', EU: '46', JP: '17' }),
    Object.freeze({ INTL: 'XL', US: '16', UK: '20', EU: '48', JP: '19' }),
    Object.freeze({ INTL: 'XXL', US: '18', UK: '22', EU: '50', JP: '21' }),
    Object.freeze({ INTL: 'XXL', US: '20', UK: '24', EU: '52', JP: '23' }),
  ]),
  mens: Object.freeze([
    Object.freeze({ INTL: 'XS', US: '34', UK: '34', EU: '44', JP: '34' }),
    Object.freeze({ INTL: 'S', US: '36', UK: '36', EU: '46', JP: '36' }),
    Object.freeze({ INTL: 'M', US: '38', UK: '38', EU: '48', JP: '38' }),
    Object.freeze({ INTL: 'M', US: '40', UK: '40', EU: '50', JP: '40' }),
    Object.freeze({ INTL: 'L', US: '42', UK: '42', EU: '52', JP: '42' }),
    Object.freeze({ INTL: 'XL', US: '44', UK: '44', EU: '54', JP: '44' }),
    Object.freeze({ INTL: 'XXL', US: '46', UK: '46', EU: '56', JP: '46' }),
  ]),
  unisex: Object.freeze([
    Object.freeze({ INTL: 'XS', US: '32', UK: '32', EU: '42', JP: 'SS' }),
    Object.freeze({ INTL: 'S', US: '36', UK: '36', EU: '46', JP: 'S' }),
    Object.freeze({ INTL: 'M', US: '40', UK: '40', EU: '50', JP: 'M' }),
    Object.freeze({ INTL: 'L', US: '44', UK: '44', EU: '54', JP: 'L' }),
    Object.freeze({ INTL: 'XL', US: '48', UK: '48', EU: '58', JP: 'LL' }),
    Object.freeze({ INTL: 'XXL', US: '52', UK: '52', EU: '62', JP: '3L' }),
  ]),
});

const VALID_SYSTEMS: ReadonlySet<string> = new Set<ClothingSizeSystem>([
  'US',
  'UK',
  'EU',
  'JP',
  'INTL',
]);

function assertFinite(value: number, name: string): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number`);
  }
}

function assertNonNegativeFinite(value: number, name: string): void {
  assertFinite(value, name);
  if (value < 0) {
    throw new RangeError(`${name} must be greater than or equal to 0`);
  }
}

function assertPositiveFinite(value: number, name: string): void {
  assertFinite(value, name);
  if (value <= 0) {
    throw new RangeError(`${name} must be greater than 0`);
  }
}

function isYarnWeightCategory(value: number): value is YarnWeightCategory {
  return Number.isInteger(value) && value >= 0 && value <= 7;
}

/**
 * Returns the immutable Craft Yarn Council (CYC) specification for a numeric yarn weight category (`0`–`7`).
 *
 * @param category - CYC yarn weight category (`0` Lace through `7` Jumbo).
 * @returns Immutable {@link YarnWeightInfo} specification.
 * @throws {RangeError} When `category` is not an integer between `0` and `7`.
 */
export function getYarnWeightInfo(
  category: YarnWeightCategory,
): YarnWeightInfo {
  if (!isYarnWeightCategory(category)) {
    throw new RangeError(
      `category must be an integer between 0 and 7, received ${String(category)}`,
    );
  }
  return YARN_WEIGHT_TABLE[category];
}

/**
 * Resolves a numeric CYC yarn weight category (`0`–`7`), canonical name, or regional alias
 * (e.g. `'Worsted'`, `'DK'`, `'Fingering'`, `'4'`) into its full {@link YarnWeightInfo} specification.
 *
 * @param category - Numeric CYC category (`0`–`7`) or case-insensitive yarn weight name/alias.
 * @returns Immutable {@link YarnWeightInfo} specification.
 * @throws {RangeError} When `category` does not match any standard CYC yarn weight.
 */
export function convertYarnWeight(
  category: YarnWeightCategory | string,
): YarnWeightInfo {
  if (typeof category === 'number') {
    return getYarnWeightInfo(category);
  }

  const normalized = category.trim().toLowerCase();
  if (normalized.length === 0) {
    throw new RangeError('Yarn weight category must not be empty');
  }

  if (/^[0-7]$/.test(normalized)) {
    return getYarnWeightInfo(Number(normalized) as YarnWeightCategory);
  }

  const allEntries = Object.values(YARN_WEIGHT_TABLE);
  for (const entry of allEntries) {
    if (
      entry.name.toLowerCase() === normalized ||
      entry.aliases.some((alias) => alias.toLowerCase() === normalized)
    ) {
      return entry;
    }
  }

  throw new RangeError(`Unknown yarn weight category: "${category}"`);
}

/**
 * Converts a length in meters to international yards (`1 yd = 0.9144 m`).
 *
 * @param meters - Finite length in meters.
 * @returns Equivalent length in yards.
 * @throws {RangeError} When `meters` is not finite.
 */
export function metersToYards(meters: number): number {
  assertFinite(meters, 'meters');
  const yards = meters / METERS_PER_YARD;
  return yards === 0 ? 0 : yards;
}

/**
 * Converts a length in international yards to meters (`1 yd = 0.9144 m`).
 *
 * @param yards - Finite length in yards.
 * @returns Equivalent length in meters.
 * @throws {RangeError} When `yards` is not finite.
 */
export function yardsToMeters(yards: number): number {
  assertFinite(yards, 'yards');
  const meters = yards * METERS_PER_YARD;
  return meters === 0 ? 0 : meters;
}

/**
 * Converts a length value between metric and imperial crafting units (`mm`, `cm`, `m`, `in`, `ft`, `yd`).
 *
 * @param value - Finite numeric length value.
 * @param fromUnit - Source {@link LengthUnit}.
 * @param toUnit - Target {@link LengthUnit}.
 * @returns Converted numeric length value.
 * @throws {RangeError} When `value` is not finite or either unit is unsupported.
 */
export function convertLength(
  value: number,
  fromUnit: LengthUnit,
  toUnit: LengthUnit,
): number {
  assertFinite(value, 'value');

  if (!(fromUnit in METERS_PER_UNIT)) {
    throw new RangeError(`Unsupported source length unit: "${String(fromUnit)}"`);
  }
  if (!(toUnit in METERS_PER_UNIT)) {
    throw new RangeError(`Unsupported target length unit: "${String(toUnit)}"`);
  }

  if (fromUnit === toUnit) {
    return value === 0 ? 0 : value;
  }

  const inMeters = value * METERS_PER_UNIT[fromUnit];
  const converted = inMeters / METERS_PER_UNIT[toUnit];
  return converted === 0 ? 0 : converted;
}

/**
 * Converts stitch or row gauge from stitches per inch to stitches per centimeter.
 *
 * @param spi - Non-negative stitches per inch.
 * @returns Stitches per centimeter.
 * @throws {RangeError} When `spi` is negative or not finite.
 */
export function stitchesPerInchToCm(spi: number): number {
  assertNonNegativeFinite(spi, 'spi');
  const spc = spi / CM_PER_INCH;
  return spc === 0 ? 0 : spc;
}

/**
 * Converts stitch or row gauge from stitches per centimeter to stitches per inch.
 *
 * @param spc - Non-negative stitches per centimeter.
 * @returns Stitches per inch.
 * @throws {RangeError} When `spc` is negative or not finite.
 */
export function stitchesPerCmToInch(spc: number): number {
  assertNonNegativeFinite(spc, 'spc');
  const spi = spc * CM_PER_INCH;
  return spi === 0 ? 0 : spi;
}

/**
 * Computes finished knitted or crocheted fabric dimensions in centimeters and inches
 * from stitch/row counts and a standard 10 cm × 10 cm swatch gauge.
 *
 * @param stitches - Total stitch count (non-negative finite number).
 * @param rows - Total row count (non-negative finite number).
 * @param gaugeStitchesPer10Cm - Swatch stitch gauge per 10 cm (positive finite number).
 * @param gaugeRowsPer10Cm - Swatch row gauge per 10 cm (positive finite number).
 * @returns Frozen {@link GaugeDimensions} object.
 * @throws {RangeError} When counts are negative/non-finite or gauge values are non-positive/non-finite.
 */
export function calculateGaugeDimensions(
  stitches: number,
  rows: number,
  gaugeStitchesPer10Cm: number,
  gaugeRowsPer10Cm: number,
): GaugeDimensions {
  assertNonNegativeFinite(stitches, 'stitches');
  assertNonNegativeFinite(rows, 'rows');
  assertPositiveFinite(gaugeStitchesPer10Cm, 'gaugeStitchesPer10Cm');
  assertPositiveFinite(gaugeRowsPer10Cm, 'gaugeRowsPer10Cm');

  const widthCm = (stitches / gaugeStitchesPer10Cm) * 10;
  const heightCm = (rows / gaugeRowsPer10Cm) * 10;
  const widthInches = widthCm / CM_PER_INCH;
  const heightInches = heightCm / CM_PER_INCH;

  return Object.freeze({
    widthCm: widthCm === 0 ? 0 : widthCm,
    heightCm: heightCm === 0 ? 0 : heightCm,
    widthInches: widthInches === 0 ? 0 : widthInches,
    heightInches: heightInches === 0 ? 0 : heightInches,
  });
}

/**
 * Converts an apparel size between international sizing systems (`US`, `UK`, `EU`, `JP`, `INTL`).
 *
 * @param size - Source size label or numeric value (e.g. `'M'`, `8`, `'40'`).
 * @param fromSystem - Source {@link ClothingSizeSystem}.
 * @param toSystem - Target {@link ClothingSizeSystem}.
 * @param category - Apparel category chart (`'womens'`, `'mens'`, or `'unisex'`). Defaults to `'womens'`.
 * @returns Converted size label in `toSystem`.
 * @throws {RangeError} When any system, category, or size is invalid or not found in the chart.
 */
export function convertClothingSize(
  size: ClothingSizeValue,
  fromSystem: ClothingSizeSystem,
  toSystem: ClothingSizeSystem,
  category: ClothingCategory = 'womens',
): string {
  if (!VALID_SYSTEMS.has(fromSystem)) {
    throw new RangeError(`Unsupported source size system: "${String(fromSystem)}"`);
  }
  if (!VALID_SYSTEMS.has(toSystem)) {
    throw new RangeError(`Unsupported target size system: "${String(toSystem)}"`);
  }
  if (!(category in CLOTHING_SIZE_CHARTS)) {
    throw new RangeError(`Unsupported clothing category: "${String(category)}"`);
  }

  const normalizedSize =
    typeof size === 'number'
      ? Number.isFinite(size)
        ? String(size)
        : ''
      : size.trim().toUpperCase();

  if (normalizedSize.length === 0) {
    throw new RangeError('Clothing size must be a non-empty string or finite number');
  }

  const chart = CLOTHING_SIZE_CHARTS[category];
  const match = chart.find((row) => row[fromSystem] === normalizedSize);

  if (!match) {
    throw new RangeError(
      `Size "${String(size)}" is not a valid ${fromSystem} size in the "${category}" chart`,
    );
  }

  return match[toSystem];
}
