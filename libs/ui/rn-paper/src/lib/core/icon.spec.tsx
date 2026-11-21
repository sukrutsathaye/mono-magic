import { cleanup, render, screen } from '@testing-library/react';
import { Platform, View, Text } from 'react-native';
import { Icon as PaperIcon } from 'react-native-paper';
import { afterEach, describe, expect, it } from 'vitest';
import { MagicPaperProvider } from '../theme/paper-theme';
import { MagicIcon, renderPaperIcon } from './icon';

afterEach(cleanup);

describe('MagicIcon & renderPaperIcon', () => {
  it('renders a Material Icons ligature string with size, color, and decorative accessibility', () => {
    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicIcon icon="favorite" size={22} color="#ba005c" testID="mi-str" />
      </MagicPaperProvider>
    );

    const el = screen.getByTestId('mi-str');
    expect(el.textContent).toBe('favorite');
    expect(el.style.fontSize).toBe('22px');
    expect(el.style.lineHeight).toBe('22px');
    if (Platform.OS === 'web') {
      const styleEl = document.getElementById(
        'react-native-stylesheet'
      ) as HTMLStyleElement | null;
      const sheetCss = Array.from(styleEl?.sheet?.cssRules ?? [])
        .map((rule) => rule.cssText)
        .join('\n');
      const fontFamilyClass = Array.from(el.classList).find((cls) =>
        cls.startsWith('r-fontFamily-')
      );
      expect(fontFamilyClass).toBeTruthy();
      expect(sheetCss).toContain(`.${fontFamilyClass}`);
      expect(sheetCss).toContain('Material Icons');
    }
  });

  it('uses theme onSurface color by default and honors accessibilityLabel', () => {
    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicIcon
          icon="info"
          accessibilityLabel="More information"
          testID="mi-labeled"
        />
      </MagicPaperProvider>
    );

    const el = screen.getByTestId('mi-labeled');
    expect(el.getAttribute('aria-label')).toBe('More information');
    expect(el.style.fontSize).toBe('18px');
  });

  it('renders custom ReactNode icons directly without wrapping in Text', () => {
    render(
      <MagicPaperProvider>
        <MagicIcon
          icon={
            <View testID="custom-node-icon">
              <Text>SVG</Text>
            </View>
          }
        />
      </MagicPaperProvider>
    );

    const custom = screen.getByTestId('custom-node-icon');
    expect(custom.textContent).toBe('SVG');
  });

  it('returns null for empty/falsy icon values', () => {
    const { container } = render(
      <MagicPaperProvider>
        <MagicIcon icon="" />
        <MagicIcon icon={null} />
        <MagicIcon icon={false} />
      </MagicPaperProvider>
    );

    expect(container.textContent).toBe('');
  });

  it('converts string and ReactNode values via renderPaperIcon and returns undefined when empty', () => {
    expect(renderPaperIcon(undefined)).toBeUndefined();
    expect(renderPaperIcon('')).toBeUndefined();
    expect(renderPaperIcon(null)).toBeUndefined();
    expect(renderPaperIcon(false)).toBeUndefined();

    const stringSource = renderPaperIcon('search', 20);
    const nodeSource = renderPaperIcon(
      <View testID="paper-node-icon">
        <Text>Node</Text>
      </View>,
      24
    );

    render(
      <MagicPaperProvider>
        <PaperIcon source={stringSource} size={20} color="#005cbb" />
        <PaperIcon source={nodeSource} size={0} color="#005cbb" />
      </MagicPaperProvider>
    );

    expect(screen.getByText('search')).toBeTruthy();
    expect(screen.getByTestId('paper-node-icon').textContent).toBe('Node');
  });
});
