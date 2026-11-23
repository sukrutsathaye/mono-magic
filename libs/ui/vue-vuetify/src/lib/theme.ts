import type {
  AtomicSize,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';

/**
 * Material 3 semantic palette tokens aligned with `@mono-magic/react-mui`.
 */
export const MAGIC_VUETIFY_THEME_COLORS = {
  light: {
    primary: '#1976d2',
    secondary: '#26a69a',
    tertiary: '#7e57c2',
    success: '#2e7d32',
    warning: '#ed6c02',
    error: '#d32f2f',
    neutral: '#616161',
    background: '#faf9fd',
    surface: '#ffffff',
  },
  dark: {
    primary: '#90caf9',
    secondary: '#80cbc4',
    tertiary: '#b39ddb',
    success: '#66bb6a',
    warning: '#ffa726',
    error: '#ef5350',
    neutral: '#9e9e9e',
    background: '#141218',
    surface: '#1d1b20',
  },
} as const;

const VUETIFY_SIZE_MAP: Readonly<Record<AtomicSize, string>> = {
  xs: 'x-small',
  sm: 'small',
  md: 'default',
  lg: 'large',
  xl: 'x-large',
};

const VUETIFY_DENSITY_MAP: Readonly<
  Record<AtomicSize, 'compact' | 'comfortable' | 'default'>
> = {
  xs: 'compact',
  sm: 'compact',
  md: 'comfortable',
  lg: 'default',
  xl: 'default',
};

const VUETIFY_COLOR_MAP: Readonly<Record<ColorIntent, string>> = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'tertiary',
  success: 'success',
  warning: 'warning',
  error: 'error',
  neutral: 'neutral',
};

/**
 * Maps an `AtomicSize` contract value to a Vuetify 3 component `size` token.
 */
export function mapAtomicSizeToVuetify(size: AtomicSize = 'md'): string {
  return VUETIFY_SIZE_MAP[size];
}

/**
 * Maps an `AtomicSize` contract value to a Vuetify 3 `density` token.
 */
export function mapAtomicSizeToDensity(
  size: AtomicSize = 'md',
): 'compact' | 'comfortable' | 'default' {
  return VUETIFY_DENSITY_MAP[size];
}

/**
 * Maps a `ColorIntent` contract value to a Vuetify 3 theme color token.
 */
export function mapColorIntentToVuetify(
  color: ColorIntent = 'primary',
): string {
  return VUETIFY_COLOR_MAP[color];
}

/**
 * Normalizes an icon name to Vuetify's MDI prefix format (`mdi-*`) unless it
 * already carries an MDI prefix or Vuetify alias prefix (`$`).
 */
export function normalizeMdiIcon(icon?: string): string | undefined {
  if (!icon) {
    return undefined;
  }
  const trimmed = icon.trim();
  if (!trimmed) {
    return undefined;
  }
  if (trimmed.startsWith('mdi-') || trimmed.startsWith('$')) {
    return trimmed;
  }
  return `mdi-${trimmed}`;
}

