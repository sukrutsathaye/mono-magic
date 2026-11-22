import { useEffect, useState, type ReactNode, type Ref } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {
  AtomicSize,
  AvatarGroupMoleculeProps,
  AvatarGroupSpacing,
  AvatarMoleculeProps,
  AvatarShape,
  AvatarStatus,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon, type MagicIconValue } from '../../core/icon';
import { useMagicPaperColors } from '../../theme/paper-theme';

export type {
  AvatarGroupItem,
  AvatarGroupMoleculeProps,
  AvatarGroupSpacing,
  AvatarMoleculeProps,
  AvatarShape,
  AvatarStatus,
} from '@mono-magic/atomic-design-interfaces';

/** Props for the React Native Paper `MagicAvatar` molecule. */
export interface MagicAvatarProps extends Omit<AvatarMoleculeProps, 'icon'> {
  /** Optional Material icon string name or custom `ReactNode` fallback when no image or initials exist. */
  icon?: MagicIconValue;
  /** Optional custom content overriding image/initials/icon rendering. */
  children?: ReactNode;
  /** Style override applied to the outer avatar wrapper. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the outer avatar wrapper `View`. */
  ref?: Ref<View>;
}

/** Props for the React Native Paper `MagicAvatarGroup` molecule. */
export interface MagicAvatarGroupProps extends AvatarGroupMoleculeProps {
  /** Style override applied to the outer avatar group container. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the outer avatar group container `View`. */
  ref?: Ref<View>;
}

interface AvatarSizeSpec {
  dimension: number;
  fontSize: number;
  iconSize: number;
  statusSize: number;
}

const AVATAR_SIZE_MAP: Record<AtomicSize, AvatarSizeSpec> = {
  xs: { dimension: 24, fontSize: 10, iconSize: 14, statusSize: 8 },
  sm: { dimension: 32, fontSize: 12, iconSize: 18, statusSize: 10 },
  md: { dimension: 40, fontSize: 14, iconSize: 22, statusSize: 12 },
  lg: { dimension: 48, fontSize: 16, iconSize: 26, statusSize: 14 },
  xl: { dimension: 64, fontSize: 22, iconSize: 32, statusSize: 16 },
};

const GROUP_OVERLAP_RATIO: Record<AvatarGroupSpacing, number> = {
  tight: 0.35,
  normal: 0.2,
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  circleBox: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initialsText: {
    fontWeight: '600',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  statusDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    borderWidth: 2,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  groupItemRing: {
    borderWidth: 2,
  },
});

function resolveBorderRadius(shape: AvatarShape, dimension: number): number {
  switch (shape) {
    case 'square':
      return 0;
    case 'rounded':
      return Math.max(6, Math.round(dimension * 0.22));
    case 'circle':
    default:
      return dimension / 2;
  }
}

function deriveInitials(
  initials: string | undefined,
  name: string | undefined
): string | undefined {
  const explicit = initials?.trim();
  if (explicit) {
    return explicit.slice(0, 2).toUpperCase();
  }
  const trimmedName = name?.trim();
  if (!trimmedName) {
    return undefined;
  }
  const parts = trimmedName.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

function resolveStatusColor(
  status: AvatarStatus,
  resolveIntent: ReturnType<typeof useMagicPaperColors>['resolveIntent']
): string {
  switch (status) {
    case 'online':
      return resolveIntent('success').main;
    case 'busy':
      return resolveIntent('error').main;
    case 'offline':
    default:
      return resolveIntent('neutral').main;
  }
}

/**
 * Material 3 avatar molecule rendering a user image with automatic `onError`
 * fallback to explicit/derived initials or a `MagicIcon` (`person` default),
 * supporting 5 sizes, 7 color intents, 3 shapes, and an optional presence status dot.
 */
export function MagicAvatar({
  id,
  testId,
  ariaLabel,
  src,
  alt,
  name,
  initials,
  icon,
  size = 'md',
  color = 'primary',
  shape = 'circle',
  status,
  statusLabel,
  children,
  style,
  ref,
}: MagicAvatarProps) {
  const { colors, resolveIntent } = useMagicPaperColors();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const spec = AVATAR_SIZE_MAP[size];
  const borderRadius = resolveBorderRadius(shape, spec.dimension);
  const intent = resolveIntent(color);
  const resolvedInitials = deriveInitials(initials, name);
  const showImage = Boolean(src) && !imageFailed && children === undefined;
  const resolvedAlt = alt ?? name ?? ariaLabel ?? 'Avatar';
  const resolvedAriaLabel =
    ariaLabel ??
    (status && (name || alt)
      ? `${name ?? alt} (${statusLabel ?? status})`
      : (name ?? alt));

  const webRoleProps =
    Platform.OS === 'web'
      ? ({
          role: 'img',
        } as Record<string, unknown>)
      : {};

  return (
    <View
      ref={ref}
      nativeID={id}
      testID={testId}
      accessibilityRole="image"
      accessibilityLabel={resolvedAriaLabel}
      style={[styles.wrapper, style]}
      {...webRoleProps}
    >
      <View
        testID={testId ? `${testId}-surface` : undefined}
        style={[
          styles.circleBox,
          {
            width: spec.dimension,
            height: spec.dimension,
            borderRadius,
            backgroundColor: showImage ? colors.surfaceVariant : intent.container,
          },
        ]}
      >
        {children !== undefined ? (
          children
        ) : showImage && src ? (
          <Image
            testID={testId ? `${testId}-image` : undefined}
            source={{ uri: src }}
            accessibilityLabel={resolvedAlt}
            alt={resolvedAlt}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
            style={[styles.image, { borderRadius }]}
          />
        ) : resolvedInitials ? (
          <Text
            testID={testId ? `${testId}-initials` : undefined}
            style={[
              styles.initialsText,
              {
                color: intent.onContainer,
                fontSize: spec.fontSize,
              },
            ]}
          >
            {resolvedInitials}
          </Text>
        ) : (
          <MagicIcon
            testID={testId ? `${testId}-icon` : undefined}
            icon={icon ?? 'person'}
            size={spec.iconSize}
            color={intent.onContainer}
          />
        )}
      </View>

      {status ? (
        <View
          testID={testId ? `${testId}-status` : undefined}
          accessibilityLabel={statusLabel ?? status}
          style={[
            styles.statusDot,
            {
              width: spec.statusSize,
              height: spec.statusSize,
              borderRadius: spec.statusSize / 2,
              backgroundColor: resolveStatusColor(status, resolveIntent),
              borderColor: colors.surface,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

/**
 * Material 3 stacked avatar group molecule displaying overlapping `MagicAvatar`
 * entries up to `max` items and an optional `+N` overflow avatar badge.
 */
export function MagicAvatarGroup({
  id,
  testId,
  ariaLabel,
  items,
  max,
  size = 'md',
  spacing = 'normal',
  style,
  ref,
}: MagicAvatarGroupProps) {
  const { colors } = useMagicPaperColors();
  const spec = AVATAR_SIZE_MAP[size];
  const overlapOffset = -Math.round(
    spec.dimension * GROUP_OVERLAP_RATIO[spacing]
  );

  const hasMaxLimit = max !== undefined && max >= 0 && items.length > max;
  const visibleItems = hasMaxLimit ? items.slice(0, max) : items;
  const overflowCount = hasMaxLimit ? items.length - max : 0;

  return (
    <View
      ref={ref}
      nativeID={id}
      testID={testId}
      accessibilityLabel={ariaLabel ?? `${items.length} avatars`}
      style={[styles.groupRow, style]}
    >
      {visibleItems.map((item, index) => {
        const itemKey = item.id ?? item.name ?? `avatar-${index}`;
        const borderRadius = resolveBorderRadius(
          item.shape ?? 'circle',
          spec.dimension
        );
        return (
          <View
            key={itemKey}
            style={[
              styles.groupItemRing,
              {
                borderColor: colors.surface,
                borderRadius: borderRadius + 2,
                marginLeft: index === 0 ? 0 : overlapOffset,
                zIndex: visibleItems.length - index + 1,
              },
            ]}
          >
            <MagicAvatar
              {...item}
              testId={
                item.testId ??
                (testId ? `${testId}-item-${item.id ?? index}` : undefined)
              }
              size={size}
            />
          </View>
        );
      })}

      {overflowCount > 0 ? (
        <View
          style={[
            styles.groupItemRing,
            {
              borderColor: colors.surface,
              borderRadius: spec.dimension / 2 + 2,
              marginLeft: visibleItems.length === 0 ? 0 : overlapOffset,
              zIndex: 0,
            },
          ]}
        >
          <MagicAvatar
            testId={testId ? `${testId}-overflow` : undefined}
            initials={`+${overflowCount}`}
            ariaLabel={`${overflowCount} more`}
            color="neutral"
            size={size}
          />
        </View>
      ) : null}
    </View>
  );
}
