import { createVuetify, type VuetifyOptions } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { MAGIC_VUETIFY_THEME_COLORS } from './theme';

/**
 * Creates a configured Vuetify 3 instance with mono-magic Material 3 theme colors
 * covering all `ColorIntent` tokens (`primary`, `secondary`, `tertiary`, `success`,
 * `warning`, `error`, `neutral`).
 */
export function createMagicVuetify(overrides: VuetifyOptions = {}) {
  return createVuetify({
    components,
    directives,
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
    theme: {
      defaultTheme: 'magicLight',
      themes: {
        magicLight: {
          dark: false,
          colors: {
            ...MAGIC_VUETIFY_THEME_COLORS.light,
          },
        },
        magicDark: {
          dark: true,
          colors: {
            ...MAGIC_VUETIFY_THEME_COLORS.dark,
          },
        },
      },
    },
    ...overrides,
  });
}
