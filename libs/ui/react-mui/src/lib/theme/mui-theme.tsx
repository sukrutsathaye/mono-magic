import type { ReactNode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import {
  createTheme,
  ThemeProvider,
  type PaletteColor,
  type PaletteColorOptions,
  type Theme,
} from '@mui/material/styles';
import type {
  AtomicSize,
  ButtonShape,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';

/**
 * Custom Material 3 surface and tonal container tokens attached to `theme.palette.magic`.
 */
export interface MagicPaletteTokens {
  /** Per-intent container fill color (M3 tonal container). */
  container: Record<ColorIntent, string>;
  /** Per-intent foreground color rendered on top of the tonal container. */
  onContainer: Record<ColorIntent, string>;
  /** Highest emphasis surface container background. */
  surfaceContainerHighest: string;
  /** Muted foreground / icon color on surfaces. */
  onSurfaceVariant: string;
  /** Standard M3 border / divider outline color. */
  outline: string;
  /** Default M3 surface background color. */
  surface: string;
  /** Default foreground color rendered on surfaces. */
  onSurface: string;
}

declare module '@mui/material/styles' {
  interface Palette {
    tertiary: PaletteColor;
    neutral: PaletteColor;
    magic: MagicPaletteTokens;
  }

  interface PaletteOptions {
    tertiary?: PaletteColorOptions;
    neutral?: PaletteColorOptions;
    magic?: MagicPaletteTokens;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

declare module '@mui/material/Fab' {
  interface FabPropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

declare module '@mui/material/Badge' {
  interface BadgePropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

declare module '@mui/material/Checkbox' {
  interface CheckboxPropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

declare module '@mui/material/Radio' {
  interface RadioPropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

declare module '@mui/material/Switch' {
  interface SwitchPropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

declare module '@mui/material/Slider' {
  interface SliderPropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

declare module '@mui/material/LinearProgress' {
  interface LinearProgressPropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

declare module '@mui/material/CircularProgress' {
  interface CircularProgressPropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

declare module '@mui/material/ToggleButton' {
  interface ToggleButtonPropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

declare module '@mui/material/ToggleButtonGroup' {
  interface ToggleButtonGroupPropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

declare module '@mui/material/FormControl' {
  interface FormControlPropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

declare module '@mui/material/InputBase' {
  interface InputBasePropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

declare module '@mui/material/FormLabel' {
  interface FormLabelPropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

declare module '@mui/material/Icon' {
  interface IconPropsColorOverrides {
    tertiary: true;
    neutral: true;
  }
}

/**
 * Supported Material 3 palette identifiers matching `ng-mat` Storybook palettes.
 */
export type MagicPaletteName =
  | 'azure-blue'
  | 'light-theme'
  | 'dark-theme'
  | 'rose-red'
  | 'cyan-orange'
  | 'orange-red'
  | 'magenta-violet';

export interface MagicPaletteDefinition {
  id: MagicPaletteName;
  displayName: string;
  mode: 'light' | 'dark';
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  surface: string;
  surfaceContainerHighest: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
}

/**
 * Exact 7 Material 3 palette definitions shared across `@mono-magic` UI libraries.
 */
export const MAGIC_PALETTE_DEFINITIONS: Record<
  MagicPaletteName,
  MagicPaletteDefinition
> = {
  'azure-blue': {
    id: 'azure-blue',
    displayName: 'Azure Blue (Light)',
    mode: 'light',
    primary: '#005cbb',
    onPrimary: '#ffffff',
    primaryContainer: '#d7e3ff',
    onPrimaryContainer: '#001b3f',
    secondary: '#565e71',
    onSecondary: '#ffffff',
    secondaryContainer: '#dae2f9',
    onSecondaryContainer: '#131c2b',
    tertiary: '#343dff',
    onTertiary: '#ffffff',
    tertiaryContainer: '#e0e0ff',
    onTertiaryContainer: '#00006e',
    surface: '#faf9fd',
    surfaceContainerHighest: '#e3e2e6',
    onSurface: '#1a1b1f',
    onSurfaceVariant: '#44474e',
    outline: '#74777f',
  },
  'light-theme': {
    id: 'light-theme',
    displayName: 'Violet / Orange (Light)',
    mode: 'light',
    primary: '#7d00fa',
    onPrimary: '#ffffff',
    primaryContainer: '#ecdcff',
    onPrimaryContainer: '#270057',
    secondary: '#645b70',
    onSecondary: '#ffffff',
    secondaryContainer: '#eadef7',
    onSecondaryContainer: '#1f182a',
    tertiary: '#964900',
    onTertiary: '#ffffff',
    tertiaryContainer: '#ffdcc7',
    onTertiaryContainer: '#311300',
    surface: '#fef8fc',
    surfaceContainerHighest: '#e6e1e6',
    onSurface: '#1d1b1e',
    onSurfaceVariant: '#4a454e',
    outline: '#7b757f',
  },
  'dark-theme': {
    id: 'dark-theme',
    displayName: 'Green / Orange (Dark)',
    mode: 'dark',
    primary: '#02e600',
    onPrimary: '#013a00',
    primaryContainer: '#015300',
    onPrimaryContainer: '#78ff6c',
    secondary: '#bbcbb2',
    onSecondary: '#263422',
    secondaryContainer: '#3c4b37',
    onSecondaryContainer: '#d7e8cd',
    tertiary: '#ffb787',
    onTertiary: '#502400',
    tertiaryContainer: '#723600',
    onTertiaryContainer: '#ffdcc7',
    surface: '#121410',
    surfaceContainerHighest: '#333531',
    onSurface: '#e2e3dc',
    onSurfaceVariant: '#c3c8bc',
    outline: '#8d9387',
  },
  'rose-red': {
    id: 'rose-red',
    displayName: 'Rose Red (Light)',
    mode: 'light',
    primary: '#ba005c',
    onPrimary: '#ffffff',
    primaryContainer: '#ffd9e1',
    onPrimaryContainer: '#3f001b',
    secondary: '#74565d',
    onSecondary: '#ffffff',
    secondaryContainer: '#ffd9e1',
    onSecondaryContainer: '#2b151b',
    tertiary: '#c00100',
    onTertiary: '#ffffff',
    tertiaryContainer: '#ffdad4',
    onTertiaryContainer: '#410000',
    surface: '#fff8f8',
    surfaceContainerHighest: '#ece0e1',
    onSurface: '#201a1b',
    onSurfaceVariant: '#524346',
    outline: '#847376',
  },
  'cyan-orange': {
    id: 'cyan-orange',
    displayName: 'Cyan Orange (Dark)',
    mode: 'dark',
    primary: '#00dddd',
    onPrimary: '#003737',
    primaryContainer: '#004f4f',
    onPrimaryContainer: '#4ffbfb',
    secondary: '#b0cccb',
    onSecondary: '#1b3534',
    secondaryContainer: '#324b4b',
    onSecondaryContainer: '#cce8e7',
    tertiary: '#ffb787',
    onTertiary: '#502400',
    tertiaryContainer: '#723600',
    onTertiaryContainer: '#ffdcc7',
    surface: '#101414',
    surfaceContainerHighest: '#313635',
    onSurface: '#e0e3e2',
    onSurfaceVariant: '#bec9c8',
    outline: '#889392',
  },
  'orange-red': {
    id: 'orange-red',
    displayName: 'Orange Red (Light)',
    mode: 'light',
    primary: '#964900',
    onPrimary: '#ffffff',
    primaryContainer: '#ffdcc7',
    onPrimaryContainer: '#311300',
    secondary: '#755846',
    onSecondary: '#ffffff',
    secondaryContainer: '#ffdcc7',
    onSecondaryContainer: '#2b1709',
    tertiary: '#c00100',
    onTertiary: '#ffffff',
    tertiaryContainer: '#ffdad4',
    onTertiaryContainer: '#410000',
    surface: '#fff8f5',
    surfaceContainerHighest: '#ece0da',
    onSurface: '#201a17',
    onSurfaceVariant: '#52443c',
    outline: '#84746a',
  },
  'magenta-violet': {
    id: 'magenta-violet',
    displayName: 'Magenta Violet (Dark)',
    mode: 'dark',
    primary: '#ffabf3',
    onPrimary: '#5b005b',
    primaryContainer: '#810081',
    onPrimaryContainer: '#ffd7f5',
    secondary: '#dabfd2',
    onSecondary: '#3d2b3a',
    secondaryContainer: '#554151',
    onSecondaryContainer: '#f7daee',
    tertiary: '#d5baff',
    onTertiary: '#410089',
    tertiaryContainer: '#5f00c0',
    onTertiaryContainer: '#ecdcff',
    surface: '#161215',
    surfaceContainerHighest: '#383337',
    onSurface: '#e9e0e4',
    onSurfaceVariant: '#d0c3cc',
    outline: '#9a8d95',
  },
};

const SEMANTIC_TOKENS = {
  light: {
    error: {
      main: '#ba1a1a',
      contrastText: '#ffffff',
      container: '#ffdad6',
      onContainer: '#410002',
    },
    success: {
      main: '#1b6e3a',
      contrastText: '#ffffff',
      container: '#a0f5b4',
      onContainer: '#00210c',
    },
    warning: {
      main: '#8a5100',
      contrastText: '#ffffff',
      container: '#ffdcbd',
      onContainer: '#2d1600',
    },
  },
  dark: {
    error: {
      main: '#ffb4ab',
      contrastText: '#690005',
      container: '#93000a',
      onContainer: '#ffdad6',
    },
    success: {
      main: '#7fdc99',
      contrastText: '#00391a',
      container: '#00522a',
      onContainer: '#a0f5b4',
    },
    warning: {
      main: '#ffb870',
      contrastText: '#4a2800',
      container: '#693c00',
      onContainer: '#ffdcbd',
    },
  },
} as const;

export interface MagicSizeMetric {
  /** Component control height in px. */
  height: number;
  /** Label / body font size in px. */
  fontSize: number;
  /** Icon glyph size in px. */
  iconSize: number;
  /** Horizontal inner padding in px. */
  horizontalPadding: number;
}

/**
 * Shared atomic size scale metrics in pixels matching the cross-platform design contract.
 */
export const MAGIC_SIZE_METRICS: Record<AtomicSize, MagicSizeMetric> = {
  xs: { height: 28, fontSize: 12, iconSize: 16, horizontalPadding: 12 },
  sm: { height: 32, fontSize: 13, iconSize: 18, horizontalPadding: 14 },
  md: { height: 40, fontSize: 14, iconSize: 18, horizontalPadding: 24 },
  lg: { height: 48, fontSize: 16, iconSize: 22, horizontalPadding: 28 },
  xl: { height: 56, fontSize: 18, iconSize: 24, horizontalPadding: 32 },
};

/**
 * Shared corner radius mapping for `ButtonShape` tokens (`default` preserves M3 default).
 */
export const MAGIC_SHAPE_RADIUS: Record<ButtonShape, number | undefined> = {
  default: undefined,
  square: 0,
  rounded: 8,
  pill: 999,
};

/**
 * Creates a Material 3 configured MUI theme for one of the 7 Magic palettes.
 */
export function createMagicMuiTheme(
  palette: MagicPaletteName = 'azure-blue',
): Theme {
  const def = MAGIC_PALETTE_DEFINITIONS[palette];
  const semantic = SEMANTIC_TOKENS[def.mode];

  return createTheme({
    palette: {
      mode: def.mode,
      primary: {
        main: def.primary,
        contrastText: def.onPrimary,
      },
      secondary: {
        main: def.secondary,
        contrastText: def.onSecondary,
      },
      tertiary: {
        main: def.tertiary,
        contrastText: def.onTertiary,
      },
      error: {
        main: semantic.error.main,
        contrastText: semantic.error.contrastText,
      },
      success: {
        main: semantic.success.main,
        contrastText: semantic.success.contrastText,
      },
      warning: {
        main: semantic.warning.main,
        contrastText: semantic.warning.contrastText,
      },
      neutral: {
        main: def.onSurfaceVariant,
        contrastText: def.surface,
      },
      background: {
        default: def.surface,
        paper: def.surface,
      },
      text: {
        primary: def.onSurface,
        secondary: def.onSurfaceVariant,
      },
      divider: def.outline,
      magic: {
        container: {
          primary: def.primaryContainer,
          secondary: def.secondaryContainer,
          tertiary: def.tertiaryContainer,
          error: semantic.error.container,
          success: semantic.success.container,
          warning: semantic.warning.container,
          neutral: def.surfaceContainerHighest,
        },
        onContainer: {
          primary: def.onPrimaryContainer,
          secondary: def.onSecondaryContainer,
          tertiary: def.onTertiaryContainer,
          error: semantic.error.onContainer,
          success: semantic.success.onContainer,
          warning: semantic.warning.onContainer,
          neutral: def.onSurface,
        },
        surfaceContainerHighest: def.surfaceContainerHighest,
        onSurfaceVariant: def.onSurfaceVariant,
        outline: def.outline,
        surface: def.surface,
        onSurface: def.onSurface,
      },
    },
    typography: {
      fontFamily: 'Roboto, "Open Sans", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 9999,
            fontWeight: 600,
          },
        },
      },
    },
  });
}

/**
 * Prebuilt MUI theme instances for all 7 Material 3 palettes.
 */
export const MAGIC_MUI_THEMES: Record<MagicPaletteName, Theme> = {
  'azure-blue': createMagicMuiTheme('azure-blue'),
  'light-theme': createMagicMuiTheme('light-theme'),
  'dark-theme': createMagicMuiTheme('dark-theme'),
  'rose-red': createMagicMuiTheme('rose-red'),
  'cyan-orange': createMagicMuiTheme('cyan-orange'),
  'orange-red': createMagicMuiTheme('orange-red'),
  'magenta-violet': createMagicMuiTheme('magenta-violet'),
};

/**
 * Default Material 3 theme (`azure-blue`), preserved for backwards compatibility.
 */
export const magicMuiTheme: Theme = MAGIC_MUI_THEMES['azure-blue'];

export interface MagicResolvedIntentColors {
  main: string;
  contrastText: string;
  container: string;
  onContainer: string;
}

/**
 * Resolves the active Material 3 `main`, `contrastText`, `container`, and `onContainer`
 * tokens for a given `ColorIntent`, with safe fallback if used inside a plain MUI theme.
 */
export function resolveMagicIntentColors(
  theme: Theme,
  color: ColorIntent = 'primary',
): MagicResolvedIntentColors {
  const paletteEntry = theme.palette[color] ?? theme.palette.primary;
  const fallbackTheme =
    theme.palette.mode === 'dark'
      ? MAGIC_MUI_THEMES['dark-theme']
      : MAGIC_MUI_THEMES['azure-blue'];
  const magic = theme.palette.magic ?? fallbackTheme.palette.magic;

  return {
    main: paletteEntry.main,
    contrastText: paletteEntry.contrastText,
    container: magic.container[color],
    onContainer: magic.onContainer[color],
  };
}

export interface MagicMuiThemeProviderProps {
  /** Named Material 3 palette to apply when `theme` is not explicitly provided. */
  palette?: MagicPaletteName;
  /** Optional custom MUI `Theme` override. Takes precedence over `palette`. */
  theme?: Theme;
  /** Whether to render MUI's `<CssBaseline />`. Defaults to `true`. */
  withCssBaseline?: boolean;
  /** Subtree rendered within the MUI theme provider. */
  children: ReactNode;
}

/**
 * Provides a Material 3 Magic MUI theme (7 built-in palettes or a custom `Theme`).
 */
export function MagicMuiThemeProvider({
  palette = 'azure-blue',
  theme,
  withCssBaseline = true,
  children,
}: MagicMuiThemeProviderProps) {
  const resolvedTheme = theme ?? MAGIC_MUI_THEMES[palette];

  return (
    <ThemeProvider theme={resolvedTheme}>
      {withCssBaseline ? <CssBaseline /> : null}
      {children}
    </ThemeProvider>
  );
}
