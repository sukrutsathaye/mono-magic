import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  useTheme,
  type MD3Theme,
  type ProviderProps,
} from 'react-native-paper';
import type {
  AtomicSize,
  ButtonShape,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';

export type MagicPaperPaletteName =
  | 'azure-blue'
  | 'light-theme'
  | 'dark-theme'
  | 'rose-red'
  | 'cyan-orange'
  | 'orange-red'
  | 'magenta-violet';

export interface MagicPaperPaletteOption {
  value: MagicPaperPaletteName;
  title: string;
  right: string;
  dark: boolean;
}

export const MAGIC_PAPER_PALETTE_OPTIONS: readonly MagicPaperPaletteOption[] = [
  {
    value: 'azure-blue',
    title: 'Azure Blue (Light)',
    right: '💙',
    dark: false,
  },
  {
    value: 'light-theme',
    title: 'Violet / Orange (Light)',
    right: '☀️',
    dark: false,
  },
  {
    value: 'dark-theme',
    title: 'Green / Orange (Dark)',
    right: '🌙',
    dark: true,
  },
  {
    value: 'rose-red',
    title: 'Rose Red (Light)',
    right: '🌹',
    dark: false,
  },
  {
    value: 'cyan-orange',
    title: 'Cyan Orange (Dark)',
    right: '🟦',
    dark: true,
  },
  {
    value: 'orange-red',
    title: 'Orange Red (Light)',
    right: '🟧',
    dark: false,
  },
  {
    value: 'magenta-violet',
    title: 'Magenta Violet (Dark)',
    right: '💜',
    dark: true,
  },
] as const;

export interface MagicPaperIntentColors {
  main: string;
  onMain: string;
  container: string;
  onContainer: string;
}

export interface MagicPaperSemanticColors {
  success: MagicPaperIntentColors;
  warning: MagicPaperIntentColors;
}

export interface MagicPaperSizeMetrics {
  height: number;
  fontSize: number;
  iconSize: number;
  paddingHorizontal: number;
}

export const MAGIC_PAPER_SIZE_METRICS: Record<
  AtomicSize,
  MagicPaperSizeMetrics
> = {
  xs: { height: 28, fontSize: 12, iconSize: 16, paddingHorizontal: 12 },
  sm: { height: 32, fontSize: 13, iconSize: 18, paddingHorizontal: 14 },
  md: { height: 40, fontSize: 14, iconSize: 18, paddingHorizontal: 24 },
  lg: { height: 48, fontSize: 16, iconSize: 22, paddingHorizontal: 28 },
  xl: { height: 56, fontSize: 18, iconSize: 24, paddingHorizontal: 32 },
};

export const MAGIC_PAPER_SHAPE_RADIUS: Record<ButtonShape, number> = {
  default: 12,
  square: 0,
  rounded: 8,
  pill: 999,
};

const LIGHT_SEMANTIC_COLORS: MagicPaperSemanticColors = {
  success: {
    main: '#1b6e3a',
    onMain: '#ffffff',
    container: '#a0f5b4',
    onContainer: '#00210c',
  },
  warning: {
    main: '#8a5100',
    onMain: '#ffffff',
    container: '#ffdcbd',
    onContainer: '#2d1600',
  },
};

const DARK_SEMANTIC_COLORS: MagicPaperSemanticColors = {
  success: {
    main: '#7fdc99',
    onMain: '#00391a',
    container: '#00522a',
    onContainer: '#a0f5b4',
  },
  warning: {
    main: '#ffb870',
    onMain: '#4a2800',
    container: '#693c00',
    onContainer: '#ffdcbd',
  },
};

export function getMagicPaperSemanticColors(
  dark: boolean
): MagicPaperSemanticColors {
  return dark ? DARK_SEMANTIC_COLORS : LIGHT_SEMANTIC_COLORS;
}

interface PaletteSeed {
  dark: boolean;
  colors: Partial<MD3Theme['colors']>;
}

function buildTheme({ dark, colors }: PaletteSeed): MD3Theme {
  const base = dark ? MD3DarkTheme : MD3LightTheme;
  return {
    ...base,
    dark,
    roundness: 8,
    colors: {
      ...base.colors,
      ...colors,
      onBackground: colors.onSurface ?? base.colors.onBackground,
    },
  };
}

export const MAGIC_PAPER_THEMES: Record<MagicPaperPaletteName, MD3Theme> = {
  'azure-blue': buildTheme({
    dark: false,
    colors: {
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
      background: '#faf9fd',
      surfaceVariant: '#e3e2e6',
      onSurface: '#1a1b1f',
      onSurfaceVariant: '#44474e',
      outline: '#74777f',
      error: '#ba1a1a',
      onError: '#ffffff',
      errorContainer: '#ffdad6',
      onErrorContainer: '#410002',
    },
  }),
  'light-theme': buildTheme({
    dark: false,
    colors: {
      primary: '#7d00fa',
      onPrimary: '#ffffff',
      primaryContainer: '#ecdcff',
      onPrimaryContainer: '#280056',
      secondary: '#645b70',
      onSecondary: '#ffffff',
      secondaryContainer: '#eadef7',
      onSecondaryContainer: '#1f182a',
      tertiary: '#964900',
      onTertiary: '#ffffff',
      tertiaryContainer: '#ffdcc7',
      onTertiaryContainer: '#311300',
      surface: '#fef8fc',
      background: '#fef8fc',
      surfaceVariant: '#e6e1e6',
      onSurface: '#1d1b1e',
      onSurfaceVariant: '#4a454e',
      outline: '#7b757f',
      error: '#ba1a1a',
      onError: '#ffffff',
      errorContainer: '#ffdad6',
      onErrorContainer: '#410002',
    },
  }),
  'dark-theme': buildTheme({
    dark: true,
    colors: {
      primary: '#02e600',
      onPrimary: '#013a00',
      primaryContainer: '#015300',
      onPrimaryContainer: '#78ff6b',
      secondary: '#bbcbb2',
      onSecondary: '#273422',
      secondaryContainer: '#3c4b37',
      onSecondaryContainer: '#d7e8cd',
      tertiary: '#ffb787',
      onTertiary: '#502400',
      tertiaryContainer: '#723600',
      onTertiaryContainer: '#ffdcc7',
      surface: '#121410',
      background: '#121410',
      surfaceVariant: '#333531',
      onSurface: '#e2e3dc',
      onSurfaceVariant: '#c3c8bc',
      outline: '#8d9387',
      error: '#ffb4ab',
      onError: '#690005',
      errorContainer: '#93000a',
      onErrorContainer: '#ffdad6',
    },
  }),
  'rose-red': buildTheme({
    dark: false,
    colors: {
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
      background: '#fff8f8',
      surfaceVariant: '#ece0e1',
      onSurface: '#201a1b',
      onSurfaceVariant: '#514346',
      outline: '#847376',
      error: '#ba1a1a',
      onError: '#ffffff',
      errorContainer: '#ffdad6',
      onErrorContainer: '#410002',
    },
  }),
  'cyan-orange': buildTheme({
    dark: true,
    colors: {
      primary: '#00dddd',
      onPrimary: '#003737',
      primaryContainer: '#004f4f',
      onPrimaryContainer: '#6ff7f6',
      secondary: '#b0cccb',
      onSecondary: '#1b3534',
      secondaryContainer: '#324b4b',
      onSecondaryContainer: '#cce8e7',
      tertiary: '#ffb787',
      onTertiary: '#502400',
      tertiaryContainer: '#723600',
      onTertiaryContainer: '#ffdcc7',
      surface: '#101414',
      background: '#101414',
      surfaceVariant: '#313635',
      onSurface: '#e0e3e2',
      onSurfaceVariant: '#bec9c8',
      outline: '#889392',
      error: '#ffb4ab',
      onError: '#690005',
      errorContainer: '#93000a',
      onErrorContainer: '#ffdad6',
    },
  }),
  'orange-red': buildTheme({
    dark: false,
    colors: {
      primary: '#964900',
      onPrimary: '#ffffff',
      primaryContainer: '#ffdcc7',
      onPrimaryContainer: '#311300',
      secondary: '#755846',
      onSecondary: '#ffffff',
      secondaryContainer: '#ffdcc7',
      onSecondaryContainer: '#2b1609',
      tertiary: '#c00100',
      onTertiary: '#ffffff',
      tertiaryContainer: '#ffdad4',
      onTertiaryContainer: '#410000',
      surface: '#fff8f5',
      background: '#fff8f5',
      surfaceVariant: '#ece0da',
      onSurface: '#201a17',
      onSurfaceVariant: '#52443c',
      outline: '#84746a',
      error: '#ba1a1a',
      onError: '#ffffff',
      errorContainer: '#ffdad6',
      onErrorContainer: '#410002',
    },
  }),
  'magenta-violet': buildTheme({
    dark: true,
    colors: {
      primary: '#ffabf3',
      onPrimary: '#5b005b',
      primaryContainer: '#810081',
      onPrimaryContainer: '#ffd7f5',
      secondary: '#dabfd2',
      onSecondary: '#3d2b3a',
      secondaryContainer: '#554151',
      onSecondaryContainer: '#f7dbee',
      tertiary: '#d5baff',
      onTertiary: '#42008a',
      tertiaryContainer: '#5f00c0',
      onTertiaryContainer: '#ecdcff',
      surface: '#161215',
      background: '#161215',
      surfaceVariant: '#383337',
      onSurface: '#e9e0e4',
      onSurfaceVariant: '#d0c3cb',
      outline: '#9a8d95',
      error: '#ffb4ab',
      onError: '#690005',
      errorContainer: '#93000a',
      onErrorContainer: '#ffdad6',
    },
  }),
};

export function createMagicPaperTheme(
  palette: MagicPaperPaletteName = 'azure-blue'
): MD3Theme {
  return MAGIC_PAPER_THEMES[palette];
}

export const magicPaperTheme: MD3Theme = MAGIC_PAPER_THEMES['azure-blue'];

export const MagicPaperSemanticContext =
  createContext<MagicPaperSemanticColors | null>(null);

export function resolveMagicPaperIntent(
  intent: ColorIntent,
  theme: MD3Theme,
  semantic?: MagicPaperSemanticColors
): MagicPaperIntentColors {
  const resolvedSemantic = semantic ?? getMagicPaperSemanticColors(theme.dark);
  switch (intent) {
    case 'primary':
      return {
        main: theme.colors.primary,
        onMain: theme.colors.onPrimary,
        container: theme.colors.primaryContainer,
        onContainer: theme.colors.onPrimaryContainer,
      };
    case 'secondary':
      return {
        main: theme.colors.secondary,
        onMain: theme.colors.onSecondary,
        container: theme.colors.secondaryContainer,
        onContainer: theme.colors.onSecondaryContainer,
      };
    case 'tertiary':
      return {
        main: theme.colors.tertiary,
        onMain: theme.colors.onTertiary,
        container: theme.colors.tertiaryContainer,
        onContainer: theme.colors.onTertiaryContainer,
      };
    case 'success':
      return resolvedSemantic.success;
    case 'warning':
      return resolvedSemantic.warning;
    case 'error':
      return {
        main: theme.colors.error,
        onMain: theme.colors.onError,
        container: theme.colors.errorContainer,
        onContainer: theme.colors.onErrorContainer,
      };
    case 'neutral':
      return {
        main: theme.colors.onSurfaceVariant,
        onMain: theme.colors.surface,
        container: theme.colors.surfaceVariant,
        onContainer: theme.colors.onSurface,
      };
  }
}

export interface MagicPaperColorTokens {
  theme: MD3Theme;
  colors: MD3Theme['colors'];
  semantic: MagicPaperSemanticColors;
  dark: boolean;
  resolveIntent: (intent: ColorIntent) => MagicPaperIntentColors;
}

export function useMagicPaperColors(): MagicPaperColorTokens {
  const theme = useTheme<MD3Theme>();
  const contextSemantic = useContext(MagicPaperSemanticContext);
  const semantic = contextSemantic ?? getMagicPaperSemanticColors(theme.dark);

  return useMemo(
    () => ({
      theme,
      colors: theme.colors,
      semantic,
      dark: theme.dark,
      resolveIntent: (intent: ColorIntent) =>
        resolveMagicPaperIntent(intent, theme, semantic),
    }),
    [theme, semantic]
  );
}

const iconStyles = StyleSheet.create({
  base: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  webMaterialIcons: {
    fontFamily: '"Material Icons"',
    fontWeight: 'normal',
    fontStyle: 'normal',
  },
});

function createDefaultPaperSettings(
  fallbackColor: string
): NonNullable<ProviderProps['settings']> {
  return {
    icon: ({ name, color, size, testID }) => {
      const iconSize = size ?? 18;
      return (
        <Text
          testID={testID}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            iconStyles.base,
            Platform.OS === 'web' ? iconStyles.webMaterialIcons : undefined,
            {
              color: color ?? fallbackColor,
              fontSize: iconSize,
              lineHeight: iconSize,
            },
          ]}
        >
          {typeof name === 'string' ? name : '•'}
        </Text>
      );
    },
  };
}

export interface MagicPaperProviderProps {
  children: ReactNode;
  /** Named Material 3 palette. Ignored when `theme` is explicitly supplied. */
  palette?: MagicPaperPaletteName;
  /** Explicit Material 3 theme override. */
  theme?: MD3Theme;
  /** Optional React Native Paper provider settings override. */
  settings?: ProviderProps['settings'];
}

export function MagicPaperProvider({
  children,
  palette = 'azure-blue',
  theme,
  settings,
}: MagicPaperProviderProps) {
  const resolvedTheme = theme ?? createMagicPaperTheme(palette);
  const semanticColors = getMagicPaperSemanticColors(resolvedTheme.dark);
  const mergedSettings = useMemo(() => {
    const defaults = createDefaultPaperSettings(resolvedTheme.colors.onSurface);
    return settings ? { ...defaults, ...settings } : defaults;
  }, [resolvedTheme.colors.onSurface, settings]);

  return (
    <MagicPaperSemanticContext value={semanticColors}>
      <PaperProvider theme={resolvedTheme} settings={mergedSettings}>
        {children}
      </PaperProvider>
    </MagicPaperSemanticContext>
  );
}
