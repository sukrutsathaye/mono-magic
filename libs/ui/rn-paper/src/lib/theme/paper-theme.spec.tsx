import { cleanup, render, screen } from '@testing-library/react';
import { Platform, Text } from 'react-native';
import { Icon as PaperIcon, PaperProvider } from 'react-native-paper';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ColorIntent } from '@mono-magic/atomic-design-interfaces';
import {
  createMagicPaperTheme,
  getMagicPaperSemanticColors,
  MAGIC_PAPER_PALETTE_OPTIONS,
  MAGIC_PAPER_SHAPE_RADIUS,
  MAGIC_PAPER_SIZE_METRICS,
  MAGIC_PAPER_THEMES,
  magicPaperTheme,
  MagicPaperProvider,
  resolveMagicPaperIntent,
  useMagicPaperColors,
  type MagicPaperPaletteName,
} from './paper-theme';

afterEach(cleanup);

function ThemeProbe({ intent = 'primary' }: { intent?: ColorIntent }) {
  const { theme, semantic, dark, resolveIntent } = useMagicPaperColors();
  const resolved = resolveIntent(intent);
  return (
    <>
      <Text testID="probe-primary">{theme.colors.primary}</Text>
      <Text testID="probe-surface">{theme.colors.surface}</Text>
      <Text testID="probe-dark">{String(dark)}</Text>
      <Text testID="probe-success">{semantic.success.main}</Text>
      <Text testID="probe-warning">{semantic.warning.main}</Text>
      <Text testID="probe-intent-main">{resolved.main}</Text>
      <Text testID="probe-intent-onMain">{resolved.onMain}</Text>
      <Text testID="probe-intent-container">{resolved.container}</Text>
      <Text testID="probe-intent-onContainer">{resolved.onContainer}</Text>
    </>
  );
}

describe('paper-theme (Material 3 palettes & semantic tokens)', () => {
  const expectedPalettes: Array<{
    name: MagicPaperPaletteName;
    dark: boolean;
    primary: string;
    surface: string;
    error: string;
  }> = [
    {
      name: 'azure-blue',
      dark: false,
      primary: '#005cbb',
      surface: '#faf9fd',
      error: '#ba1a1a',
    },
    {
      name: 'light-theme',
      dark: false,
      primary: '#7d00fa',
      surface: '#fef8fc',
      error: '#ba1a1a',
    },
    {
      name: 'dark-theme',
      dark: true,
      primary: '#02e600',
      surface: '#121410',
      error: '#ffb4ab',
    },
    {
      name: 'rose-red',
      dark: false,
      primary: '#ba005c',
      surface: '#fff8f8',
      error: '#ba1a1a',
    },
    {
      name: 'cyan-orange',
      dark: true,
      primary: '#00dddd',
      surface: '#101414',
      error: '#ffb4ab',
    },
    {
      name: 'orange-red',
      dark: false,
      primary: '#964900',
      surface: '#fff8f5',
      error: '#ba1a1a',
    },
    {
      name: 'magenta-violet',
      dark: true,
      primary: '#ffabf3',
      surface: '#161215',
      error: '#ffb4ab',
    },
  ];

  it.each(expectedPalettes)(
    'defines exact MD3 tokens for $name palette',
    ({ name, dark, primary, surface, error }) => {
      const theme = createMagicPaperTheme(name);
      expect(theme).toBe(MAGIC_PAPER_THEMES[name]);
      expect(theme.dark).toBe(dark);
      expect(theme.colors.primary).toBe(primary);
      expect(theme.colors.surface).toBe(surface);
      expect(theme.colors.background).toBe(surface);
      expect(theme.colors.error).toBe(error);
      expect(theme.colors.onBackground).toBe(theme.colors.onSurface);
    }
  );

  it('defaults createMagicPaperTheme and magicPaperTheme to azure-blue', () => {
    expect(createMagicPaperTheme()).toBe(MAGIC_PAPER_THEMES['azure-blue']);
    expect(magicPaperTheme).toBe(MAGIC_PAPER_THEMES['azure-blue']);
    expect(MAGIC_PAPER_PALETTE_OPTIONS).toHaveLength(7);
  });

  it('exposes exact size metrics and shape radii', () => {
    expect(MAGIC_PAPER_SIZE_METRICS).toEqual({
      xs: { height: 28, fontSize: 12, iconSize: 16, paddingHorizontal: 12 },
      sm: { height: 32, fontSize: 13, iconSize: 18, paddingHorizontal: 14 },
      md: { height: 40, fontSize: 14, iconSize: 18, paddingHorizontal: 24 },
      lg: { height: 48, fontSize: 16, iconSize: 22, paddingHorizontal: 28 },
      xl: { height: 56, fontSize: 18, iconSize: 24, paddingHorizontal: 32 },
    });
    expect(MAGIC_PAPER_SHAPE_RADIUS).toEqual({
      default: 12,
      square: 0,
      rounded: 8,
      pill: 999,
    });
  });

  it('resolves all 7 ColorIntent tokens for light and dark themes', () => {
    const lightTheme = createMagicPaperTheme('azure-blue');
    const darkTheme = createMagicPaperTheme('dark-theme');

    expect(resolveMagicPaperIntent('primary', lightTheme)).toEqual({
      main: '#005cbb',
      onMain: '#ffffff',
      container: '#d7e3ff',
      onContainer: '#001b3f',
    });
    expect(resolveMagicPaperIntent('secondary', lightTheme)).toEqual({
      main: '#565e71',
      onMain: '#ffffff',
      container: '#dae2f9',
      onContainer: '#131c2b',
    });
    expect(resolveMagicPaperIntent('tertiary', lightTheme)).toEqual({
      main: '#343dff',
      onMain: '#ffffff',
      container: '#e0e0ff',
      onContainer: '#00006e',
    });
    expect(resolveMagicPaperIntent('error', lightTheme)).toEqual({
      main: '#ba1a1a',
      onMain: '#ffffff',
      container: '#ffdad6',
      onContainer: '#410002',
    });
    expect(resolveMagicPaperIntent('success', lightTheme)).toEqual({
      main: '#1b6e3a',
      onMain: '#ffffff',
      container: '#a0f5b4',
      onContainer: '#00210c',
    });
    expect(resolveMagicPaperIntent('warning', lightTheme)).toEqual({
      main: '#8a5100',
      onMain: '#ffffff',
      container: '#ffdcbd',
      onContainer: '#2d1600',
    });
    expect(resolveMagicPaperIntent('neutral', lightTheme)).toEqual({
      main: lightTheme.colors.onSurfaceVariant,
      onMain: lightTheme.colors.surface,
      container: lightTheme.colors.surfaceVariant,
      onContainer: lightTheme.colors.onSurface,
    });

    expect(resolveMagicPaperIntent('success', darkTheme)).toEqual({
      main: '#7fdc99',
      onMain: '#00391a',
      container: '#00522a',
      onContainer: '#a0f5b4',
    });
    expect(resolveMagicPaperIntent('warning', darkTheme)).toEqual({
      main: '#ffb870',
      onMain: '#4a2800',
      container: '#693c00',
      onContainer: '#ffdcbd',
    });
    expect(getMagicPaperSemanticColors(false).success.main).toBe('#1b6e3a');
    expect(getMagicPaperSemanticColors(true).warning.main).toBe('#ffb870');
  });

  it('provides palette theme and semantic colors via MagicPaperProvider', () => {
    render(
      <MagicPaperProvider palette="cyan-orange">
        <ThemeProbe intent="success" />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('probe-primary').textContent).toBe('#00dddd');
    expect(screen.getByTestId('probe-surface').textContent).toBe('#101414');
    expect(screen.getByTestId('probe-dark').textContent).toBe('true');
    expect(screen.getByTestId('probe-success').textContent).toBe('#7fdc99');
    expect(screen.getByTestId('probe-warning').textContent).toBe('#ffb870');
    expect(screen.getByTestId('probe-intent-main').textContent).toBe('#7fdc99');
    expect(screen.getByTestId('probe-intent-onMain').textContent).toBe(
      '#00391a'
    );
  });

  it('respects explicit theme override over palette prop', () => {
    const customTheme = createMagicPaperTheme('rose-red');
    render(
      <MagicPaperProvider palette="dark-theme" theme={customTheme}>
        <ThemeProbe intent="warning" />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('probe-primary').textContent).toBe('#ba005c');
    expect(screen.getByTestId('probe-dark').textContent).toBe('false');
    expect(screen.getByTestId('probe-intent-main').textContent).toBe('#8a5100');
  });

  it('falls back cleanly when useMagicPaperColors runs under bare PaperProvider', () => {
    render(
      <PaperProvider theme={createMagicPaperTheme('magenta-violet')}>
        <ThemeProbe intent="success" />
      </PaperProvider>
    );

    expect(screen.getByTestId('probe-dark').textContent).toBe('true');
    expect(screen.getByTestId('probe-intent-main').textContent).toBe('#7fdc99');
  });

  it('renders Material Icons ligatures via default PaperProvider settings and allows custom settings', () => {
    const { rerender } = render(
      <MagicPaperProvider palette="azure-blue">
        <PaperIcon source="search" size={20} testID="paper-default-icon" />
      </MagicPaperProvider>
    );

    const icon = screen.getByTestId('paper-default-icon');
    expect(icon.textContent).toBe('search');
    expect(icon.style.fontSize).toBe('20px');
    expect(icon.style.lineHeight).toBe('20px');
    if (Platform.OS === 'web') {
      const styleEl = document.getElementById(
        'react-native-stylesheet'
      ) as HTMLStyleElement | null;
      const sheetCss = Array.from(styleEl?.sheet?.cssRules ?? [])
        .map((rule) => rule.cssText)
        .join('\n');
      const fontFamilyClass = Array.from(icon.classList).find((cls) =>
        cls.startsWith('r-fontFamily-')
      );
      expect(fontFamilyClass).toBeTruthy();
      expect(sheetCss).toContain(`.${fontFamilyClass}`);
      expect(sheetCss).toContain('Material Icons');
    }

    const customIcon = vi.fn(({ name }: { name: string }) => (
      <Text testID="custom-settings-icon">{`custom:${name}`}</Text>
    ));

    rerender(
      <MagicPaperProvider settings={{ icon: customIcon }}>
        <PaperIcon source="home" size={24} />
      </MagicPaperProvider>
    );

    expect(customIcon).toHaveBeenCalled();
    expect(screen.getByTestId('custom-settings-icon').textContent).toBe(
      'custom:home'
    );
  });
});
