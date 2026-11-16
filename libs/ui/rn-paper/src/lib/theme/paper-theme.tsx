import type { ReactNode } from 'react';
import { Text } from 'react-native';
import {
  MD3LightTheme,
  PaperProvider,
  type MD3Theme,
  type ProviderProps,
} from 'react-native-paper';

export const magicPaperTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 8,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976d2',
    secondary: '#9c27b0',
    tertiary: '#0288d1',
    error: '#d32f2f',
  },
};

const defaultSettings: ProviderProps['settings'] = {
  icon: ({ name, color, size }) => (
    <Text
      accessibilityElementsHidden
      style={{
        color: color ?? magicPaperTheme.colors.onSurface,
        fontSize: size ?? 18,
      }}
    >
      {typeof name === 'string' ? name : '•'}
    </Text>
  ),
};

export interface MagicPaperProviderProps {
  children: ReactNode;
  theme?: MD3Theme;
  settings?: ProviderProps['settings'];
}

export function MagicPaperProvider({
  children,
  theme = magicPaperTheme,
  settings = defaultSettings,
}: MagicPaperProviderProps) {
  return (
    <PaperProvider theme={theme} settings={settings}>
      {children}
    </PaperProvider>
  );
}
