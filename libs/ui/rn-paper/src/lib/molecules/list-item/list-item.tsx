import { useCallback, useId, type ReactNode, type Ref } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Badge as PaperBadge, Divider as PaperDivider } from 'react-native-paper';
import type {
  AtomicSize,
  ListItemMoleculeProps,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import { useMagicPaperColors } from '../../theme/paper-theme';
import { MagicAvatar } from '../avatar/avatar';

export type {
  ListItemAppearance,
  ListItemMoleculeProps,
  MagicListItemProps as ListItemBaseProps,
} from '@mono-magic/atomic-design-interfaces';

/** Props for the React Native Paper `MagicListItem` molecule. */
export interface MagicListItemProps extends ListItemMoleculeProps {
  /** Initial selected state used in uncontrolled mode (`selected` is omitted). */
  defaultSelected?: boolean;
  /** Fired when the list item is pressed (when `interactive` or `selectable` is true and not `disabled`). */
  onPress?: () => void;
  /** Ergonomic web alias fired alongside `onPress`. */
  onClick?: () => void;
  /** Fired when `selectable` is true and the selected state toggles. */
  onSelectedChange?: (selected: boolean) => void;
  /** Optional custom leading slot overriding `leadingAvatarSrc`/`leadingAvatarText`/`leadingIcon`. */
  leadingSlot?: ReactNode;
  /** Optional custom trailing slot overriding `trailingBadge`/`trailingText`/`trailingIcon`. */
  trailingSlot?: ReactNode;
  /** Style override applied to the outer list item container. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the outer container `View`. */
  ref?: Ref<View>;
}

interface ListItemSizeTokens {
  minHeight: number;
  minHeightDense: number;
  paddingVertical: number;
  paddingVerticalDense: number;
  paddingHorizontal: number;
  gap: number;
  primaryFontSize: number;
  secondaryFontSize: number;
  overlineFontSize: number;
  iconSize: number;
  avatarSize: AtomicSize;
}

const LIST_ITEM_SIZE_TOKENS: Record<AtomicSize, ListItemSizeTokens> = {
  xs: {
    minHeight: 40,
    minHeightDense: 34,
    paddingVertical: 6,
    paddingVerticalDense: 4,
    paddingHorizontal: 10,
    gap: 10,
    primaryFontSize: 13,
    secondaryFontSize: 11,
    overlineFontSize: 10,
    iconSize: 18,
    avatarSize: 'xs',
  },
  sm: {
    minHeight: 46,
    minHeightDense: 38,
    paddingVertical: 8,
    paddingVerticalDense: 5,
    paddingHorizontal: 12,
    gap: 12,
    primaryFontSize: 14,
    secondaryFontSize: 12,
    overlineFontSize: 10,
    iconSize: 20,
    avatarSize: 'sm',
  },
  md: {
    minHeight: 56,
    minHeightDense: 44,
    paddingVertical: 10,
    paddingVerticalDense: 6,
    paddingHorizontal: 16,
    gap: 14,
    primaryFontSize: 15,
    secondaryFontSize: 13,
    overlineFontSize: 11,
    iconSize: 22,
    avatarSize: 'md',
  },
  lg: {
    minHeight: 64,
    minHeightDense: 52,
    paddingVertical: 12,
    paddingVerticalDense: 8,
    paddingHorizontal: 18,
    gap: 16,
    primaryFontSize: 16,
    secondaryFontSize: 14,
    overlineFontSize: 12,
    iconSize: 24,
    avatarSize: 'lg',
  },
  xl: {
    minHeight: 72,
    minHeightDense: 58,
    paddingVertical: 14,
    paddingVerticalDense: 10,
    paddingHorizontal: 20,
    gap: 18,
    primaryFontSize: 18,
    secondaryFontSize: 15,
    overlineFontSize: 12,
    iconSize: 26,
    avatarSize: 'lg',
  },
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    overflow: 'hidden',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leading: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  overline: {
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  primary: {
    fontWeight: '500',
    lineHeight: 20,
  },
  secondary: {
    lineHeight: 18,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 8,
  },
  trailingText: {
    fontWeight: '500',
  },
});

/**
 * Material 3 list item molecule for `@mono-magic/rn-paper`.
 *
 * Supports leading icons/avatars, overline + primary + secondary text hierarchy,
 * trailing metadata/badges/icons, `'standard' | 'outlined' | 'filled'` appearances,
 * dense layout, bottom dividers, and interactive/selectable states.
 */
export function MagicListItem({
  id,
  testId,
  ariaLabel,
  primaryText,
  secondaryText,
  overlineText,
  leadingIcon,
  leadingAvatarText,
  leadingAvatarSrc,
  trailingIcon,
  trailingText,
  trailingBadge,
  interactive = false,
  selectable = false,
  selected: controlledSelected,
  defaultSelected = false,
  disabled = false,
  divider = false,
  dense = false,
  color = 'primary',
  size = 'md',
  appearance = 'standard',
  onPress,
  onClick,
  onSelectedChange,
  leadingSlot,
  trailingSlot,
  style,
  ref,
}: MagicListItemProps) {
  const { theme, colors, resolveIntent } = useMagicPaperColors();
  const intent = resolveIntent(color);
  const tokens = LIST_ITEM_SIZE_TOKENS[size];
  const generatedId = useId();
  const baseId = id ?? generatedId;

  const [isSelected, setIsSelected] = useControllableState<boolean>({
    value: controlledSelected,
    defaultValue: defaultSelected,
    onChange: onSelectedChange,
  });

  const isClickable = Boolean((interactive || selectable) && !disabled);

  const handleActivate = useCallback(() => {
    if (disabled) {
      return;
    }
    if (selectable) {
      setIsSelected(!isSelected);
    }
    if (interactive || selectable) {
      onPress?.();
      onClick?.();
    }
  }, [disabled, interactive, isSelected, onClick, onPress, selectable, setIsSelected]);

  const backgroundColor = disabled
    ? appearance === 'filled'
      ? colors.surfaceDisabled
      : 'transparent'
    : isSelected
      ? intent.container
      : appearance === 'filled'
        ? colors.surfaceVariant
        : appearance === 'outlined'
          ? colors.surface
          : 'transparent';

  const borderColor = disabled
    ? colors.surfaceDisabled
    : isSelected
      ? intent.main
      : (colors.outlineVariant ?? colors.outline);

  const primaryColor = disabled
    ? colors.onSurfaceDisabled
    : isSelected
      ? intent.onContainer
      : colors.onSurface;

  const secondaryColor = disabled
    ? colors.onSurfaceDisabled
    : isSelected
      ? intent.onContainer
      : colors.onSurfaceVariant;

  const iconColor = disabled
    ? colors.onSurfaceDisabled
    : isSelected
      ? intent.main
      : colors.onSurfaceVariant;

  const hasLeading = Boolean(
    leadingSlot !== undefined ||
      leadingAvatarSrc ||
      leadingAvatarText ||
      leadingIcon
  );
  const hasBadge =
    trailingBadge !== undefined &&
    trailingBadge !== null &&
    String(trailingBadge) !== '';
  const hasTrailing = Boolean(
    trailingSlot !== undefined || hasBadge || trailingText || trailingIcon
  );

  const computedAriaLabel =
    ariaLabel ??
    [overlineText, primaryText, secondaryText, trailingText]
      .filter(Boolean)
      .join(', ');

  const rowStyle = {
    minHeight: dense ? tokens.minHeightDense : tokens.minHeight,
    paddingVertical: dense ? tokens.paddingVerticalDense : tokens.paddingVertical,
    paddingHorizontal: tokens.paddingHorizontal,
    gap: tokens.gap,
  };

  const rowContent = (
    <>
      {hasLeading ? (
        <View
          testID={testId ? `${testId}-leading` : undefined}
          style={styles.leading}
        >
          {leadingSlot !== undefined ? (
            leadingSlot
          ) : leadingAvatarSrc || leadingAvatarText ? (
            <MagicAvatar
              testId={testId ? `${testId}-avatar` : undefined}
              src={leadingAvatarSrc}
              initials={leadingAvatarText}
              size={tokens.avatarSize}
              color={color}
            />
          ) : leadingIcon ? (
            <MagicIcon
              testID={testId ? `${testId}-leading-icon` : undefined}
              icon={leadingIcon}
              size={tokens.iconSize}
              color={iconColor}
            />
          ) : null}
        </View>
      ) : null}

      <View style={styles.content}>
        {overlineText ? (
          <Text
            testID={testId ? `${testId}-overline` : undefined}
            numberOfLines={1}
            style={[
              styles.overline,
              {
                color: secondaryColor,
                fontSize: tokens.overlineFontSize,
              },
            ]}
          >
            {overlineText}
          </Text>
        ) : null}

        <Text
          testID={testId ? `${testId}-primary` : undefined}
          style={[
            styles.primary,
            {
              color: primaryColor,
              fontSize: tokens.primaryFontSize,
              fontWeight: isSelected ? '600' : '500',
            },
          ]}
        >
          {primaryText}
        </Text>

        {secondaryText ? (
          <Text
            testID={testId ? `${testId}-secondary` : undefined}
            style={[
              styles.secondary,
              {
                color: secondaryColor,
                fontSize: tokens.secondaryFontSize,
              },
            ]}
          >
            {secondaryText}
          </Text>
        ) : null}
      </View>

      {hasTrailing ? (
        <View
          testID={testId ? `${testId}-trailing` : undefined}
          style={styles.trailing}
        >
          {trailingSlot !== undefined ? (
            trailingSlot
          ) : (
            <>
              {trailingText ? (
                <Text
                  testID={testId ? `${testId}-trailing-text` : undefined}
                  style={[
                    styles.trailingText,
                    {
                      color: secondaryColor,
                      fontSize: tokens.secondaryFontSize,
                    },
                  ]}
                >
                  {trailingText}
                </Text>
              ) : null}

              {hasBadge ? (
                <PaperBadge
                  testID={testId ? `${testId}-badge` : undefined}
                  size={20}
                  style={{
                    backgroundColor: disabled
                      ? colors.surfaceDisabled
                      : intent.main,
                    color: disabled ? colors.onSurfaceDisabled : intent.onMain,
                  }}
                >
                  {trailingBadge}
                </PaperBadge>
              ) : null}

              {trailingIcon ? (
                <MagicIcon
                  testID={testId ? `${testId}-trailing-icon` : undefined}
                  icon={trailingIcon}
                  size={tokens.iconSize}
                  color={iconColor}
                />
              ) : null}
            </>
          )}
        </View>
      ) : null}
    </>
  );

  const webPressableProps =
    Platform.OS === 'web' && (interactive || selectable)
      ? ({
          'aria-selected': selectable ? isSelected : undefined,
          'aria-disabled': disabled ? true : undefined,
        } as Record<string, unknown>)
      : {};

  return (
    <View
      ref={ref}
      nativeID={id ?? baseId}
      testID={testId}
      style={[
        styles.wrapper,
        {
          borderRadius: appearance === 'standard' ? 0 : theme.roundness,
          borderWidth: appearance === 'outlined' ? 1 : 0,
          borderColor: appearance === 'outlined' ? borderColor : 'transparent',
          backgroundColor,
        },
        style,
      ]}
    >
      {interactive || selectable ? (
        <Pressable
          testID={testId ? `${testId}-row` : undefined}
          disabled={!isClickable}
          accessibilityRole="button"
          accessibilityLabel={computedAriaLabel}
          accessibilityState={{
            disabled,
            selected: selectable ? isSelected : undefined,
          }}
          onPress={handleActivate}
          style={({ pressed }) => [
            styles.row,
            rowStyle,
            pressed && isClickable
              ? { backgroundColor: colors.surfaceVariant }
              : undefined,
          ]}
          {...webPressableProps}
        >
          {rowContent}
        </Pressable>
      ) : (
        <View
          testID={testId ? `${testId}-row` : undefined}
          accessibilityLabel={computedAriaLabel}
          accessibilityState={{ disabled }}
          style={[styles.row, rowStyle]}
        >
          {rowContent}
        </View>
      )}

      {divider ? (
        <PaperDivider
          testID={testId ? `${testId}-divider` : undefined}
          style={{ backgroundColor: colors.outlineVariant ?? colors.outline }}
        />
      ) : null}
    </View>
  );
}
