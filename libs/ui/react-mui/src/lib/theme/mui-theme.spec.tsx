import { cleanup, render, screen } from '@testing-library/react';
import { createTheme, useTheme } from '@mui/material/styles';
import type { ColorIntent } from '@mono-magic/atomic-design-interfaces';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createMagicMuiTheme,
  MAGIC_MUI_THEMES,
  MAGIC_PALETTE_DEFINITIONS,
  MAGIC_SHAPE_RADIUS,
  MAGIC_SIZE_METRICS,
  magicMuiTheme,
  MagicMuiThemeProvider,
  resolveMagicIntentColors,
  type MagicPaletteName,
} from './mui-theme';

afterEach(cleanup);

function ThemeInspector() {
  const theme = useTheme();
  return (
    <div
      data-testid="theme-inspector"
      data-mode={theme.palette.mode}
      data-primary={theme.palette.primary.main}
      data-tertiary={theme.palette.tertiary?.main}
      data-neutral={theme.palette.neutral?.main}
      data-surface={theme.palette.background.default}
      data-font={theme.typography.fontFamily}
    />
  );
}

describe('Material 3 Theme System (react-mui)', () => {
  const allPalettes: MagicPaletteName[] = [
    'azure-blue',
    'light-theme',
    'dark-theme',
    'rose-red',
    'cyan-orange',
    'orange-red',
    'magenta-violet',
  ];

  it('defines all 7 Material 3 palettes with exact tokens and light/dark modes', () => {
    expect(Object.keys(MAGIC_PALETTE_DEFINITIONS)).toHaveLength(7);
    expect(Object.keys(MAGIC_MUI_THEMES)).toHaveLength(7);

    for (const name of allPalettes) {
      const def = MAGIC_PALETTE_DEFINITIONS[name];
      const theme = MAGIC_MUI_THEMES[name];

      expect(theme.palette.mode).toBe(def.mode);
      expect(theme.palette.primary.main).toBe(def.primary);
      expect(theme.palette.secondary.main).toBe(def.secondary);
      expect(theme.palette.tertiary.main).toBe(def.tertiary);
      expect(theme.palette.neutral.main).toBe(def.onSurfaceVariant);
      expect(theme.palette.neutral.contrastText).toBe(def.surface);
      expect(theme.palette.background.default).toBe(def.surface);
      expect(theme.palette.text.primary).toBe(def.onSurface);
      expect(theme.palette.text.secondary).toBe(def.onSurfaceVariant);
      expect(theme.palette.divider).toBe(def.outline);
      expect(theme.palette.magic.surfaceContainerHighest).toBe(
        def.surfaceContainerHighest,
      );
      expect(theme.palette.magic.onSurfaceVariant).toBe(def.onSurfaceVariant);
      expect(theme.palette.magic.outline).toBe(def.outline);
      expect(theme.palette.magic.container.primary).toBe(def.primaryContainer);
      expect(theme.palette.magic.container.secondary).toBe(
        def.secondaryContainer,
      );
      expect(theme.palette.magic.container.tertiary).toBe(
        def.tertiaryContainer,
      );
      expect(theme.palette.magic.container.neutral).toBe(
        def.surfaceContainerHighest,
      );
      expect(theme.palette.magic.onContainer.neutral).toBe(def.onSurface);
      expect(theme.typography.fontFamily).toBe(
        'Roboto, "Open Sans", sans-serif',
      );
    }

    expect(magicMuiTheme).toBe(MAGIC_MUI_THEMES['azure-blue']);
  });

  it('applies exact light and dark semantic tokens for error, success, warning, and neutral', () => {
    const lightTheme = createMagicMuiTheme('azure-blue');
    expect(resolveMagicIntentColors(lightTheme, 'error')).toEqual({
      main: '#ba1a1a',
      contrastText: '#ffffff',
      container: '#ffdad6',
      onContainer: '#410002',
    });
    expect(resolveMagicIntentColors(lightTheme, 'success')).toEqual({
      main: '#1b6e3a',
      contrastText: '#ffffff',
      container: '#a0f5b4',
      onContainer: '#00210c',
    });
    expect(resolveMagicIntentColors(lightTheme, 'warning')).toEqual({
      main: '#8a5100',
      contrastText: '#ffffff',
      container: '#ffdcbd',
      onContainer: '#2d1600',
    });
    expect(resolveMagicIntentColors(lightTheme, 'neutral')).toEqual({
      main: '#44474e',
      contrastText: '#faf9fd',
      container: '#e3e2e6',
      onContainer: '#1a1b1f',
    });

    const darkTheme = createMagicMuiTheme('dark-theme');
    expect(resolveMagicIntentColors(darkTheme, 'error')).toEqual({
      main: '#ffb4ab',
      contrastText: '#690005',
      container: '#93000a',
      onContainer: '#ffdad6',
    });
    expect(resolveMagicIntentColors(darkTheme, 'success')).toEqual({
      main: '#7fdc99',
      contrastText: '#00391a',
      container: '#00522a',
      onContainer: '#a0f5b4',
    });
    expect(resolveMagicIntentColors(darkTheme, 'warning')).toEqual({
      main: '#ffb870',
      contrastText: '#4a2800',
      container: '#693c00',
      onContainer: '#ffdcbd',
    });

    // Default intent resolves to primary
    expect(resolveMagicIntentColors(darkTheme)).toEqual({
      main: '#02e600',
      contrastText: '#013a00',
      container: '#015300',
      onContainer: '#78ff6c',
    });
  });

  it('falls back safely in resolveMagicIntentColors for plain MUI themes without magic tokens', () => {
    const plainLight = createTheme({ palette: { mode: 'light' } });
    const plainDark = createTheme({ palette: { mode: 'dark' } });
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
      const lightColors = resolveMagicIntentColors(plainLight, intent);
      const darkColors = resolveMagicIntentColors(plainDark, intent);
      expect(lightColors.main).toBeTruthy();
      expect(lightColors.container).toBeTruthy();
      expect(darkColors.main).toBeTruthy();
      expect(darkColors.container).toBeTruthy();
    }
  });

  it('exposes exact size metrics and shape radii', () => {
    expect(MAGIC_SIZE_METRICS).toEqual({
      xs: { height: 28, fontSize: 12, iconSize: 16, horizontalPadding: 12 },
      sm: { height: 32, fontSize: 13, iconSize: 18, horizontalPadding: 14 },
      md: { height: 40, fontSize: 14, iconSize: 18, horizontalPadding: 24 },
      lg: { height: 48, fontSize: 16, iconSize: 22, horizontalPadding: 28 },
      xl: { height: 56, fontSize: 18, iconSize: 24, horizontalPadding: 32 },
    });

    expect(MAGIC_SHAPE_RADIUS).toEqual({
      default: undefined,
      square: 0,
      rounded: 8,
      pill: 999,
    });
  });

  it('renders MagicMuiThemeProvider with default azure-blue, named palettes, custom theme, and optional CssBaseline', () => {
    const { rerender } = render(
      <MagicMuiThemeProvider>
        <ThemeInspector />
      </MagicMuiThemeProvider>,
    );

    const inspector = screen.getByTestId('theme-inspector');
    expect(inspector.getAttribute('data-mode')).toBe('light');
    expect(inspector.getAttribute('data-primary')).toBe('#005cbb');
    expect(inspector.getAttribute('data-tertiary')).toBe('#343dff');

    rerender(
      <MagicMuiThemeProvider palette="magenta-violet" withCssBaseline={false}>
        <ThemeInspector />
      </MagicMuiThemeProvider>,
    );
    expect(inspector.getAttribute('data-mode')).toBe('dark');
    expect(inspector.getAttribute('data-primary')).toBe('#ffabf3');
    expect(inspector.getAttribute('data-surface')).toBe('#161215');

    const customTheme = createMagicMuiTheme('rose-red');
    rerender(
      <MagicMuiThemeProvider palette="cyan-orange" theme={customTheme}>
        <ThemeInspector />
      </MagicMuiThemeProvider>,
    );
    expect(inspector.getAttribute('data-mode')).toBe('light');
    expect(inspector.getAttribute('data-primary')).toBe('#ba005c');
  });
});
