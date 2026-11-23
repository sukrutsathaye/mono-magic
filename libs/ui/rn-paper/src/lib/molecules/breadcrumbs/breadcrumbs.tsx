import { useCallback, useId, useMemo, useState, type ReactNode, type Ref } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {
  AtomicSize,
  BreadcrumbItem,
  BreadcrumbsMoleculeProps,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { useMagicPaperColors } from '../../theme/paper-theme';

export type {
  BreadcrumbItem,
  BreadcrumbsMoleculeProps,
  MagicBreadcrumbItem,
  MagicBreadcrumbsProps as BreadcrumbsBaseProps,
} from '@mono-magic/atomic-design-interfaces';

/** Props for the React Native Paper `MagicBreadcrumbs` molecule. */
export interface MagicBreadcrumbsProps extends BreadcrumbsMoleculeProps {
  /** Fired when a non-disabled, non-current breadcrumb item is pressed. */
  onItemPress?: (item: BreadcrumbItem, index: number) => void;
  /** Ergonomic web alias fired alongside `onItemPress`. */
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  /** Optional custom separator element overriding `separator`. */
  separatorSlot?: ReactNode;
  /** Style override applied to the outer breadcrumb navigation container. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the outer container `View`. */
  ref?: Ref<View>;
}

interface BreadcrumbsSizeTokens {
  fontSize: number;
  iconSize: number;
  gap: number;
  itemPaddingHorizontal: number;
  itemPaddingVertical: number;
}

const BREADCRUMBS_SIZE_TOKENS: Record<AtomicSize, BreadcrumbsSizeTokens> = {
  xs: {
    fontSize: 11,
    iconSize: 14,
    gap: 4,
    itemPaddingHorizontal: 4,
    itemPaddingVertical: 2,
  },
  sm: {
    fontSize: 12,
    iconSize: 15,
    gap: 6,
    itemPaddingHorizontal: 5,
    itemPaddingVertical: 3,
  },
  md: {
    fontSize: 13,
    iconSize: 17,
    gap: 6,
    itemPaddingHorizontal: 6,
    itemPaddingVertical: 4,
  },
  lg: {
    fontSize: 15,
    iconSize: 19,
    gap: 8,
    itemPaddingHorizontal: 8,
    itemPaddingVertical: 5,
  },
  xl: {
    fontSize: 16,
    iconSize: 21,
    gap: 10,
    itemPaddingHorizontal: 10,
    itemPaddingVertical: 6,
  },
};

const ICON_SEPARATOR_TOKENS = new Set([
  'chevron_right',
  'arrow_forward_ios',
  'navigate_next',
  'arrow_right',
]);

const styles = StyleSheet.create({
  nav: {
    width: '100%',
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  crumbGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 6,
  },
  crumbText: {
    lineHeight: 18,
  },
  separator: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
});

interface IndexedBreadcrumb {
  item: BreadcrumbItem;
  originalIndex: number;
}

/**
 * Material 3 breadcrumbs navigation molecule for `@mono-magic/rn-paper`.
 *
 * Supports icon-prefixed crumbs, current location styling (`aria-current="page"`),
 * custom string/icon/ReactNode separators, interactive `maxItems` collapsing
 * with expandable ellipsis button, and disabled items.
 */
export function MagicBreadcrumbs({
  id,
  testId,
  ariaLabel,
  items,
  separator = '/',
  maxItems,
  itemsBeforeCollapse = 1,
  itemsAfterCollapse = 1,
  color = 'primary',
  size = 'md',
  disabled = false,
  onItemPress,
  onItemClick,
  separatorSlot,
  style,
  ref,
}: MagicBreadcrumbsProps) {
  const { colors, resolveIntent } = useMagicPaperColors();
  const intent = resolveIntent(color);
  const tokens = BREADCRUMBS_SIZE_TOKENS[size];
  const generatedId = useId();
  const baseId = id ?? generatedId;

  const [expanded, setExpanded] = useState(false);

  const canCollapse = Boolean(
    maxItems !== undefined &&
      maxItems > 0 &&
      items.length > maxItems &&
      itemsBeforeCollapse + itemsAfterCollapse < items.length
  );
  const isCollapsed = canCollapse && !expanded;

  const visibleSegments = useMemo<
    readonly (IndexedBreadcrumb | { type: 'ellipsis' })[]
  >(() => {
    if (!isCollapsed) {
      return items.map((item, originalIndex) => ({ item, originalIndex }));
    }
    const safeBefore = Math.max(1, itemsBeforeCollapse);
    const safeAfter = Math.max(1, itemsAfterCollapse);
    const head = items
      .slice(0, safeBefore)
      .map((item, idx) => ({ item, originalIndex: idx }));
    const tailStart = Math.max(safeBefore, items.length - safeAfter);
    const tail = items
      .slice(tailStart)
      .map((item, idx) => ({ item, originalIndex: tailStart + idx }));
    return [...head, { type: 'ellipsis' as const }, ...tail];
  }, [isCollapsed, items, itemsAfterCollapse, itemsBeforeCollapse]);

  const handlePressItem = useCallback(
    (item: BreadcrumbItem, index: number, isCurrent: boolean) => {
      if (disabled || item.disabled || isCurrent) {
        return;
      }
      onItemPress?.(item, index);
      onItemClick?.(item, index);
    },
    [disabled, onItemClick, onItemPress]
  );

  const renderSeparator = (key: string) => {
    if (separatorSlot !== undefined) {
      return (
        <View key={key} style={styles.separator} accessibilityElementsHidden>
          {separatorSlot}
        </View>
      );
    }

    const sepColor = disabled ? colors.onSurfaceDisabled : colors.onSurfaceVariant;
    if (ICON_SEPARATOR_TOKENS.has(separator)) {
      return (
        <View key={key} style={styles.separator}>
          <MagicIcon icon={separator} size={tokens.iconSize} color={sepColor} />
        </View>
      );
    }

    return (
      <View key={key} style={styles.separator}>
        <Text
          style={{
            color: sepColor,
            fontSize: tokens.fontSize,
          }}
        >
          {separator}
        </Text>
      </View>
    );
  };

  const webNavProps =
    Platform.OS === 'web'
      ? ({ role: 'navigation' } as Record<string, unknown>)
      : {};

  return (
    <View
      ref={ref}
      nativeID={baseId}
      testID={testId}
      accessibilityLabel={ariaLabel ?? 'Breadcrumb'}
      style={[styles.nav, style]}
      {...webNavProps}
    >
      <View style={[styles.list, { gap: tokens.gap }]}>
        {visibleSegments.map((segment, segIdx) => {
          const isFirst = segIdx === 0;

          if ('type' in segment) {
            return (
              <View key="ellipsis-segment" style={[styles.crumbGroup, { gap: tokens.gap }]}>
                {!isFirst ? renderSeparator(`sep-ellipsis-${segIdx}`) : null}
                <Pressable
                  testID={testId ? `${testId}-expand` : undefined}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel="Show collapsed breadcrumbs"
                  accessibilityState={{ disabled }}
                  onPress={() => setExpanded(true)}
                  style={({ pressed }) => [
                    styles.crumbItem,
                    {
                      paddingHorizontal: tokens.itemPaddingHorizontal,
                      paddingVertical: tokens.itemPaddingVertical,
                      backgroundColor:
                        pressed && !disabled
                          ? colors.surfaceVariant
                          : colors.surfaceVariant,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.crumbText,
                      {
                        color: disabled
                          ? colors.onSurfaceDisabled
                          : intent.main,
                        fontSize: tokens.fontSize,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    …
                  </Text>
                </Pressable>
              </View>
            );
          }

          const { item, originalIndex } = segment;
          const isLastItem = originalIndex === items.length - 1;
          const isCurrent = Boolean(item.current ?? isLastItem);
          const isItemDisabled = Boolean(disabled || item.disabled);
          const isInteractive = !isCurrent && !isItemDisabled;

          const textColor = isItemDisabled
            ? colors.onSurfaceDisabled
            : isCurrent
              ? colors.onSurface
              : intent.main;

          const webAriaCurrent =
            Platform.OS === 'web' && isCurrent
              ? ({ 'aria-current': 'page' } as Record<string, unknown>)
              : {};

          const inner = (
            <>
              {item.icon ? (
                <MagicIcon
                  icon={item.icon}
                  size={tokens.iconSize}
                  color={textColor}
                />
              ) : null}
              <Text
                style={[
                  styles.crumbText,
                  {
                    color: textColor,
                    fontSize: tokens.fontSize,
                    fontWeight: isCurrent ? '600' : '500',
                  },
                ]}
              >
                {item.label}
              </Text>
            </>
          );

          return (
            <View
              key={item.id}
              style={[styles.crumbGroup, { gap: tokens.gap }]}
            >
              {!isFirst ? renderSeparator(`sep-${item.id}`) : null}

              {isInteractive ? (
                <Pressable
                  testID={testId ? `${testId}-item-${item.id}` : undefined}
                  accessibilityRole="link"
                  accessibilityLabel={item.label}
                  onPress={() =>
                    handlePressItem(item, originalIndex, isCurrent)
                  }
                  style={({ pressed }) => [
                    styles.crumbItem,
                    {
                      paddingHorizontal: tokens.itemPaddingHorizontal,
                      paddingVertical: tokens.itemPaddingVertical,
                      backgroundColor: pressed
                        ? colors.surfaceVariant
                        : 'transparent',
                    },
                  ]}
                >
                  {inner}
                </Pressable>
              ) : (
                <View
                  testID={testId ? `${testId}-item-${item.id}` : undefined}
                  accessibilityLabel={item.label}
                  accessibilityState={{ disabled: isItemDisabled }}
                  style={[
                    styles.crumbItem,
                    {
                      paddingHorizontal: tokens.itemPaddingHorizontal,
                      paddingVertical: tokens.itemPaddingVertical,
                    },
                  ]}
                  {...webAriaCurrent}
                >
                  {inner}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
