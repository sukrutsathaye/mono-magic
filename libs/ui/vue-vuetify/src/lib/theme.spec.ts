import { describe, expect, it } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import {
  MAGIC_VUETIFY_THEME_COLORS,
  mapAtomicSizeToDensity,
  mapAtomicSizeToVuetify,
  mapColorIntentToVuetify,
} from './theme';
import { createMagicVuetify } from './vuetify';

describe('vue-vuetify theme helpers', () => {
  it('maps every AtomicSize to a Vuetify size token', () => {
    const expected: Record<AtomicSize, string> = {
      xs: 'x-small',
      sm: 'small',
      md: 'default',
      lg: 'large',
      xl: 'x-large',
    };

    (Object.keys(expected) as AtomicSize[]).forEach((size) => {
      expect(mapAtomicSizeToVuetify(size)).toBe(expected[size]);
    });
    expect(mapAtomicSizeToVuetify()).toBe('default');
  });

  it('maps every AtomicSize to a Vuetify density token', () => {
    expect(mapAtomicSizeToDensity('xs')).toBe('compact');
    expect(mapAtomicSizeToDensity('sm')).toBe('compact');
    expect(mapAtomicSizeToDensity('md')).toBe('comfortable');
    expect(mapAtomicSizeToDensity('lg')).toBe('default');
    expect(mapAtomicSizeToDensity('xl')).toBe('default');
    expect(mapAtomicSizeToDensity()).toBe('comfortable');
  });

  it('maps every ColorIntent to a registered Vuetify theme color', () => {
    const intents: ColorIntent[] = [
      'primary',
      'secondary',
      'tertiary',
      'success',
      'warning',
      'error',
      'neutral',
    ];

    for (const intent of intents) {
      const token = mapColorIntentToVuetify(intent);
      expect(token).toBe(intent);
      expect(MAGIC_VUETIFY_THEME_COLORS.light[intent]).toBeTruthy();
      expect(MAGIC_VUETIFY_THEME_COLORS.dark[intent]).toBeTruthy();
    }
    expect(mapColorIntentToVuetify()).toBe('primary');
  });

  it('creates a configured Vuetify 3 plugin instance with magic themes', () => {
    const vuetify = createMagicVuetify();
    expect(vuetify).toBeDefined();
    expect(typeof vuetify.install).toBe('function');
  });
});
