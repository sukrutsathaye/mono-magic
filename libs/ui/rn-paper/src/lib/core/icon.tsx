import type { ReactNode } from 'react';
import { Platform, StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { useTheme, type ButtonProps, type MD3Theme } from 'react-native-paper';

export type PaperIconSource = NonNullable<ButtonProps['icon']>;

export type MagicIconValue = string | ReactNode;

export interface MagicIconProps {
  icon: MagicIconValue;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<TextStyle>;
}

const styles = StyleSheet.create({
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

/**
 * Renders either a Material Icons ligature string (on web) / glyph text fallback (on native),
 * or passes a custom ReactNode directly without introducing invalid RN Text nesting.
 */
export function MagicIcon({
  icon,
  size = 18,
  color,
  accessibilityLabel,
  testID,
  style,
}: MagicIconProps) {
  const theme = useTheme<MD3Theme>();

  if (icon === null || icon === undefined || icon === false || icon === '') {
    return null;
  }

  if (typeof icon === 'string') {
    const resolvedColor = color ?? theme.colors.onSurface;
    const isDecorative = !accessibilityLabel;
    return (
      <Text
        testID={testID}
        accessible={!isDecorative}
        accessibilityLabel={accessibilityLabel}
        accessibilityElementsHidden={isDecorative}
        importantForAccessibility={
          isDecorative ? 'no-hide-descendants' : 'auto'
        }
        style={[
          styles.base,
          Platform.OS === 'web' ? styles.webMaterialIcons : undefined,
          {
            fontSize: size,
            lineHeight: size,
            color: resolvedColor,
          },
          style,
        ]}
      >
        {icon}
      </Text>
    );
  }

  return icon;
}

/**
 * Converts a `MagicIconValue` (string icon name or custom `ReactNode`) into a
 * React Native Paper `IconSource` render function.
 */
export function renderPaperIcon(
  icon: MagicIconValue | undefined,
  fallbackSize = 18
): PaperIconSource | undefined {
  if (icon === undefined || icon === null || icon === false || icon === '') {
    return undefined;
  }

  return ({ size, color }) => (
    <MagicIcon icon={icon} size={size || fallbackSize} color={color} />
  );
}
