import { type ReactNode, type Ref } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Badge as PaperBadge } from 'react-native-paper';
import type {
  AtomicSize,
  BadgeAtomProps,
  BadgePosition,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon, type MagicIconValue } from '../../core/icon';
import {
  resolveMagicPaperIntent,
  useMagicPaperColors,
} from '../../theme/paper-theme';

export interface MagicBadgeProps
  extends Omit<BadgeAtomProps, 'icon'> {
  /** Fallback Material icon or custom node rendered when `children` is omitted. */
  icon?: MagicIconValue;
  /** Anchor content wrapped by the badge. */
  children?: ReactNode;
  /** Optional style override applied to the outer wrapper. */
  style?: StyleProp<ViewStyle>;
  /** Optional style override applied to the badge pill. */
  badgeStyle?: StyleProp<TextStyle>;
  /** React 19 ref forwarded to the outer badge container. */
  ref?: Ref<View>;
}

interface BadgeSizeSpec {
  diameter: number;
  dotDiameter: number;
  fontSize: number;
  iconSize: number;
}

const BADGE_SIZE_MAP: Record<AtomicSize, BadgeSizeSpec> = {
  xs: { diameter: 16, dotDiameter: 8, fontSize: 9, iconSize: 16 },
  sm: { diameter: 18, dotDiameter: 9, fontSize: 10, iconSize: 20 },
  md: { diameter: 20, dotDiameter: 10, fontSize: 11, iconSize: 24 },
  lg: { diameter: 24, dotDiameter: 12, fontSize: 12, iconSize: 28 },
  xl: { diameter: 28, dotDiameter: 14, fontSize: 14, iconSize: 32 },
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  anchor: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBase: {
    position: 'absolute',
    zIndex: 1,
    fontWeight: '600',
  },
  dotBadge: {
    position: 'absolute',
    zIndex: 1,
  },
  nonOverlapContainer: {
    gap: 6,
  },
  fallbackLabel: {
    fontWeight: '500',
  },
});

function computePositionStyle(
  position: BadgePosition,
  badgeDiameter: number,
  overlap: boolean
): ViewStyle {
  const offset = overlap ? -Math.round(badgeDiameter * 0.4) : -(badgeDiameter + 4);
  const parts = position.split(' ');
  const hasAbove = parts.includes('above');
  const hasBelow = parts.includes('below');
  const hasBefore = parts.includes('before');
  const hasAfter = parts.includes('after');

  const style: ViewStyle = {};

  if (hasBelow) {
    style.bottom = offset;
  } else if (hasAbove || (!hasBefore && !hasAfter)) {
    style.top = offset;
  } else {
    // Purely 'before' or 'after' — center vertically
    style.top = '50%';
    style.marginTop = -Math.round(badgeDiameter / 2);
  }

  if (hasBefore) {
    style.left = offset;
  } else if (hasAfter) {
    style.right = offset;
  } else {
    // Purely 'above' or 'below' — center horizontally
    style.left = '50%';
    style.marginLeft = -Math.round(badgeDiameter / 2);
  }

  return style;
}

/**
 * Material 3 badge atom wrapping React Native Paper's `Badge` around an anchor
 * child (or `icon` / `label` fallback) with semantic colors, sizes, and
 * 8-way anchor positioning.
 */
export function MagicBadge({
  id,
  testId,
  ariaLabel,
  content,
  color = 'primary',
  size = 'md',
  position = 'above after',
  overlap = true,
  hidden = false,
  description,
  label = 'Notifications',
  icon,
  disabled = false,
  children,
  style,
  badgeStyle,
  ref,
}: MagicBadgeProps) {
  const { theme, colors, semantic } = useMagicPaperColors();
  const intent = resolveMagicPaperIntent(color, theme, semantic);
  const spec = BADGE_SIZE_MAP[size];

  const hasContent =
    content !== undefined && content !== null && String(content) !== '';
  const isDot = content === undefined || content === null || content === '';
  const badgeDiameter = isDot ? spec.dotDiameter : spec.diameter;

  const isBadgeVisible = !hidden && (hasContent || content === undefined);

  const badgeBg = disabled ? colors.surfaceDisabled : intent.main;
  const badgeFg = disabled ? colors.onSurfaceDisabled : intent.onMain;
  const anchorColor = disabled ? colors.onSurfaceDisabled : colors.onSurface;

  const resolvedAriaLabel = ariaLabel ?? description;
  const badgePositionStyle = overlap
    ? computePositionStyle(position, badgeDiameter, true)
    : undefined;

  const anchorContent =
    children !== undefined ? (
      children
    ) : icon ? (
      <MagicIcon
        icon={icon}
        size={spec.iconSize}
        color={anchorColor}
      />
    ) : (
      <Text
        style={[
          styles.fallbackLabel,
          { fontSize: spec.fontSize + 3, color: anchorColor },
        ]}
      >
        {label}
      </Text>
    );

  const badgeElement = !hidden ? (
    isDot ? (
      <View
        testID={testId ? `${testId}-badge` : undefined}
        accessibilityLabel={description}
        style={[
          overlap ? styles.dotBadge : undefined,
          badgePositionStyle,
          {
            width: badgeDiameter,
            height: badgeDiameter,
            borderRadius: badgeDiameter / 2,
            backgroundColor: badgeBg,
          },
          badgeStyle as StyleProp<ViewStyle>,
        ]}
      />
    ) : (
      <PaperBadge
        visible={isBadgeVisible}
        size={spec.diameter}
        testID={testId ? `${testId}-badge` : undefined}
        accessibilityLabel={description}
        style={[
          overlap ? styles.badgeBase : undefined,
          badgePositionStyle,
          {
            backgroundColor: badgeBg,
            color: badgeFg,
            fontSize: spec.fontSize,
            lineHeight: spec.diameter,
            paddingHorizontal: String(content).length > 1 ? 5 : 3,
          },
          badgeStyle,
        ]}
      >
        {content}
      </PaperBadge>
    )
  ) : null;

  const placeBadgeFirst =
    !overlap &&
    (position.includes('before') || position === 'above');

  return (
    <View
      ref={ref}
      nativeID={id}
      testID={testId}
      accessibilityLabel={resolvedAriaLabel}
      style={[
        styles.wrapper,
        !overlap ? styles.nonOverlapContainer : undefined,
        !overlap && (position === 'above' || position === 'below')
          ? { flexDirection: 'column' }
          : undefined,
        style,
      ]}
    >
      {placeBadgeFirst ? badgeElement : null}
      <View style={styles.anchor}>{anchorContent}</View>
      {!placeBadgeFirst ? badgeElement : null}
    </View>
  );
}
