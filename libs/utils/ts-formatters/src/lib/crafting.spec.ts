import { describe, expect, it } from 'vitest';
import {
  calculateGaugeDimensions,
  convertClothingSize,
  convertLength,
  convertYarnWeight,
  getYarnWeightInfo,
  metersToYards,
  stitchesPerCmToInch,
  stitchesPerInchToCm,
  yardsToMeters,
  type ClothingCategory,
  type ClothingSizeSystem,
  type LengthUnit,
  type YarnWeightCategory,
} from './crafting.js';

describe('crafting utilities', () => {
  describe('yarn weight categories', () => {
    it('returns complete CYC info for categories 0 through 7', () => {
      const categories: YarnWeightCategory[] = [0, 1, 2, 3, 4, 5, 6, 7];
      const expectedNames = [
        'Lace',
        'Super Fine',
        'Fine',
        'Light',
        'Medium',
        'Bulky',
        'Super Bulky',
        'Jumbo',
      ];

      categories.forEach((category, idx) => {
        const info = getYarnWeightInfo(category);
        expect(info.category).toBe(category);
        expect(info.name).toBe(expectedNames[idx]);
        expect(info.wrapsPerInch.min).toBeLessThanOrEqual(
          info.wrapsPerInch.max,
        );
        expect(info.needleSizeMm.min).toBeLessThanOrEqual(
          info.needleSizeMm.max,
        );
        expect(info.hookSizeMm.min).toBeLessThanOrEqual(info.hookSizeMm.max);
        expect(Object.isFrozen(info)).toBe(true);
      });
    });

    it('converts numeric categories, string digits, names, and aliases', () => {
      expect(convertYarnWeight(4).name).toBe('Medium');
      expect(convertYarnWeight('4').name).toBe('Medium');
      expect(convertYarnWeight('  worsted  ').category).toBe(4);
      expect(convertYarnWeight('DK').category).toBe(3);
      expect(convertYarnWeight('Fingering').category).toBe(1);
      expect(convertYarnWeight('Super Bulky').category).toBe(6);
      expect(convertYarnWeight('Jumbo').category).toBe(7);
    });

    it('throws RangeError for invalid yarn weight inputs', () => {
      expect(() =>
        getYarnWeightInfo(8 as unknown as YarnWeightCategory),
      ).toThrow(RangeError);
      expect(() =>
        getYarnWeightInfo(-1 as unknown as YarnWeightCategory),
      ).toThrow(RangeError);
      expect(() =>
        getYarnWeightInfo(1.5 as unknown as YarnWeightCategory),
      ).toThrow(RangeError);
      expect(() => convertYarnWeight('')).toThrow(RangeError);
      expect(() => convertYarnWeight('   ')).toThrow(RangeError);
      expect(() => convertYarnWeight('UnknownWeight')).toThrow(RangeError);
    });
  });

  describe('length conversions', () => {
    it('converts meters and yards accurately', () => {
      expect(yardsToMeters(1)).toBeCloseTo(0.9144, 10);
      expect(metersToYards(0.9144)).toBeCloseTo(1, 10);
      expect(metersToYards(91.44)).toBeCloseTo(100, 10);
      expect(Object.is(metersToYards(-0), 0)).toBe(true);
      expect(Object.is(yardsToMeters(-0), 0)).toBe(true);
    });

    it('converts between mm, cm, m, in, ft, and yd', () => {
      expect(convertLength(1000, 'mm', 'm')).toBeCloseTo(1, 10);
      expect(convertLength(2.54, 'cm', 'in')).toBeCloseTo(1, 10);
      expect(convertLength(12, 'in', 'ft')).toBeCloseTo(1, 10);
      expect(convertLength(3, 'ft', 'yd')).toBeCloseTo(1, 10);
      expect(convertLength(1, 'yd', 'mm')).toBeCloseTo(914.4, 10);
      expect(convertLength(42, 'cm', 'cm')).toBe(42);
      expect(Object.is(convertLength(-0, 'cm', 'cm'), 0)).toBe(true);
      expect(Object.is(convertLength(-0, 'cm', 'in'), 0)).toBe(true);
    });

    it('throws RangeError on non-finite values or unsupported units', () => {
      expect(() => metersToYards(Number.NaN)).toThrow(RangeError);
      expect(() => yardsToMeters(Number.POSITIVE_INFINITY)).toThrow(RangeError);
      expect(() => convertLength(Number.NaN, 'm', 'yd')).toThrow(RangeError);
      expect(() =>
        convertLength(10, 'km' as unknown as LengthUnit, 'm'),
      ).toThrow(RangeError);
      expect(() =>
        convertLength(10, 'm', 'mi' as unknown as LengthUnit),
      ).toThrow(RangeError);
    });
  });

  describe('gauge conversions', () => {
    it('converts stitches per inch and stitches per cm', () => {
      expect(stitchesPerInchToCm(5.08)).toBeCloseTo(2, 10);
      expect(stitchesPerCmToInch(2)).toBeCloseTo(5.08, 10);
      expect(Object.is(stitchesPerInchToCm(0), 0)).toBe(true);
      expect(Object.is(stitchesPerCmToInch(0), 0)).toBe(true);
    });

    it('calculates finished fabric dimensions from stitch and row gauge', () => {
      const dims = calculateGaugeDimensions(100, 140, 20, 28);
      expect(dims.widthCm).toBeCloseTo(50, 10);
      expect(dims.heightCm).toBeCloseTo(50, 10);
      expect(dims.widthInches).toBeCloseTo(50 / 2.54, 10);
      expect(dims.heightInches).toBeCloseTo(50 / 2.54, 10);
      expect(Object.isFrozen(dims)).toBe(true);

      const zeroDims = calculateGaugeDimensions(0, 0, 20, 28);
      expect(zeroDims).toEqual({
        widthCm: 0,
        heightCm: 0,
        widthInches: 0,
        heightInches: 0,
      });
    });

    it('throws RangeError for invalid gauge inputs', () => {
      expect(() => stitchesPerInchToCm(-1)).toThrow(RangeError);
      expect(() => stitchesPerCmToInch(Number.NaN)).toThrow(RangeError);
      expect(() => calculateGaugeDimensions(-1, 10, 20, 28)).toThrow(
        RangeError,
      );
      expect(() => calculateGaugeDimensions(10, -1, 20, 28)).toThrow(
        RangeError,
      );
      expect(() => calculateGaugeDimensions(10, 10, 0, 28)).toThrow(RangeError);
      expect(() => calculateGaugeDimensions(10, 10, 20, -5)).toThrow(
        RangeError,
      );
    });
  });

  describe('international clothing size conversions', () => {
    it('converts womens numeric and INTL sizes across US, UK, EU, JP, and INTL', () => {
      expect(convertClothingSize(8, 'US', 'UK')).toBe('12');
      expect(convertClothingSize('8', 'US', 'EU')).toBe('40');
      expect(convertClothingSize(8, 'US', 'JP')).toBe('11');
      expect(convertClothingSize(8, 'US', 'INTL')).toBe('M');
      expect(convertClothingSize('xs', 'INTL', 'US', 'womens')).toBe('2');
      expect(convertClothingSize('XXL', 'INTL', 'EU', 'womens')).toBe('50');
    });

    it('converts mens and unisex sizes', () => {
      expect(convertClothingSize(40, 'US', 'EU', 'mens')).toBe('50');
      expect(convertClothingSize('L', 'INTL', 'UK', 'mens')).toBe('42');
      expect(convertClothingSize('XL', 'INTL', 'JP', 'unisex')).toBe('LL');
      expect(convertClothingSize('3L', 'JP', 'INTL', 'unisex')).toBe('XXL');
    });

    it('throws RangeError for unsupported systems, categories, or unknown sizes', () => {
      expect(() =>
        convertClothingSize(
          'M',
          'AU' as unknown as ClothingSizeSystem,
          'US',
        ),
      ).toThrow(RangeError);
      expect(() =>
        convertClothingSize(
          'M',
          'INTL',
          'AU' as unknown as ClothingSizeSystem,
        ),
      ).toThrow(RangeError);
      expect(() =>
        convertClothingSize(
          'M',
          'INTL',
          'US',
          'kids' as unknown as ClothingCategory,
        ),
      ).toThrow(RangeError);
      expect(() => convertClothingSize('', 'INTL', 'US')).toThrow(RangeError);
      expect(() => convertClothingSize(Number.NaN, 'US', 'UK')).toThrow(
        RangeError,
      );
      expect(() => convertClothingSize('999', 'US', 'UK')).toThrow(RangeError);
    });
  });
});
