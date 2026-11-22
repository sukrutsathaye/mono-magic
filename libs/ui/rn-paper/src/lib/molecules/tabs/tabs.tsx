import {
  useCallback,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {
  AtomicSize,
  TabItem,
  TabsMoleculeProps,
} from '@mono-magic/atomic-design-interfaces';
import { MagicBadge } from '../../atoms/badge/badge';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import { useMagicPaperColors } from '../../theme/paper-theme';

export type {
  TabItem,
  TabsMoleculeProps,
  TabsOrientation,
  TabsVariant,
} from '@mono-magic/atomic-design-interfaces';

/** Props for the React Native Paper `MagicTabs` molecule. */
export interface MagicTabsProps extends TabsMoleculeProps {
  /** Fired whenever the active tab changes. */
  onTabChange?: (tabId: string, item: TabItem) => void;
  /** Optional custom renderer for the active tab panel content. */
  renderPanel?: (item: TabItem) => ReactNode;
  /** Optional fallback children rendered inside the active panel when `item.content` and `renderPanel` are omitted. */
  children?: ReactNode;
  /** Style override applied to the outer tabs container. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the outer tabs container `View`. */
  ref?: Ref<View>;
}

interface TabsSizeTokens {
  minHeight: number;
  fontSize: number;
  iconSize: number;
  paddingHorizontal: number;
  paddingVertical: number;
}

const TABS_SIZE_TOKENS: Record<AtomicSize, TabsSizeTokens> = {
  xs: {
    minHeight: 36,
    fontSize: 12,
    iconSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sm: {
    minHeight: 40,
    fontSize: 13,
    iconSize: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  md: {
    minHeight: 48,
    fontSize: 14,
    iconSize: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  lg: {
    minHeight: 54,
    fontSize: 15,
    iconSize: 22,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  xl: {
    minHeight: 60,
    fontSize: 16,
    iconSize: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
};

const styles = StyleSheet.create({
  rootHorizontal: {
    width: '100%',
  },
  rootVertical: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  tabListHorizontal: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
  },
  tabListHorizontalWrap: {
    flexWrap: 'wrap',
  },
  tabListVertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
    borderRightWidth: 1,
    minWidth: 160,
  },
  scrollContainer: {
    flexGrow: 0,
  },
  tabItemBase: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemHorizontalFill: {
    flex: 1,
  },
  tabItemVertical: {
    alignItems: 'flex-start',
  },
  tabInnerPrimary: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabInnerSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tabLabel: {
    fontWeight: '600',
  },
  indicatorHorizontal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  indicatorVertical: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    right: 0,
    width: 3,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
  panelContainer: {
    flex: 1,
    padding: 16,
  },
  panelHidden: {
    display: 'none',
  },
  panelText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

function resolveInitialTabId(
  items: readonly TabItem[],
  defaultActiveTabId?: string
): string {
  if (defaultActiveTabId) {
    return defaultActiveTabId;
  }
  const firstEnabled = items.find((item) => !item.disabled);
  return firstEnabled?.id ?? items[0]?.id ?? '';
}

/**
 * Material 3 navigation tabs molecule supporting horizontal/vertical orientation,
 * `primary` (stacked icon + label) and `secondary` (inline icon + label) variants,
 * optional scrolling, lazy panel mounting, `MagicBadge` counters, and keyboard
 * arrow/Home/End navigation on web.
 */
export function MagicTabs({
  id,
  testId,
  ariaLabel,
  items,
  activeTabId: controlledActiveTabId,
  defaultActiveTabId,
  orientation = 'horizontal',
  variant = 'primary',
  scrollable = false,
  lazy = false,
  color = 'primary',
  size = 'md',
  onTabChange,
  renderPanel,
  children,
  style,
  ref,
}: MagicTabsProps) {
  const { colors, resolveIntent } = useMagicPaperColors();
  const intent = resolveIntent(color);
  const tokens = TABS_SIZE_TOKENS[size];
  const generatedId = useId();
  const baseId = id ?? generatedId;

  const fallbackInitialId = resolveInitialTabId(items, defaultActiveTabId);
  const [selectedTabId, setSelectedTabId] = useControllableState<string>({
    value: controlledActiveTabId,
    defaultValue: fallbackInitialId,
  });

  const activeTabId =
    items.some((item) => item.id === selectedTabId) && selectedTabId
      ? selectedTabId
      : fallbackInitialId;

  const [mountedTabIds, setMountedTabIds] = useState<ReadonlySet<string>>(
    () => (activeTabId ? new Set([activeTabId]) : new Set())
  );

  const tabButtonRefs = useRef<Record<string, View | null>>({});

  const selectTab = useCallback(
    (item: TabItem) => {
      if (item.disabled) {
        return;
      }
      setSelectedTabId(item.id);
      setMountedTabIds((prev) => {
        if (prev.has(item.id)) {
          return prev;
        }
        const next = new Set(prev);
        next.add(item.id);
        return next;
      });
      onTabChange?.(item.id, item);
    },
    [onTabChange, setSelectedTabId]
  );

  const handleTabKeyDown = useCallback(
    (index: number, event: KeyboardEvent<View>) => {
      const enabledIndices = items
        .map((item, i) => (item.disabled ? -1 : i))
        .filter((i) => i !== -1);
      if (enabledIndices.length === 0) {
        return;
      }

      const prevKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
      const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';

      let targetIndex: number | undefined;

      if (event.key === nextKey) {
        const currentPos = enabledIndices.indexOf(index);
        targetIndex =
          enabledIndices[(currentPos + 1) % enabledIndices.length];
      } else if (event.key === prevKey) {
        const currentPos = enabledIndices.indexOf(index);
        targetIndex =
          enabledIndices[
            (currentPos - 1 + enabledIndices.length) % enabledIndices.length
          ];
      } else if (event.key === 'Home') {
        targetIndex = enabledIndices[0];
      } else if (event.key === 'End') {
        targetIndex = enabledIndices[enabledIndices.length - 1];
      }

      if (targetIndex === undefined) {
        return;
      }

      event.preventDefault();
      const targetItem = items[targetIndex];
      if (!targetItem) {
        return;
      }
      selectTab(targetItem);
      const node = tabButtonRefs.current[targetItem.id] as unknown as {
        focus?: () => void;
      } | null;
      node?.focus?.();
    },
    [items, orientation, selectTab]
  );

  const isHorizontal = orientation === 'horizontal';
  const dividerColor = colors.outlineVariant ?? colors.outline;

  const webTabListAriaProps =
    Platform.OS === 'web'
      ? ({
          role: 'tablist',
          'aria-orientation': orientation,
          'aria-label': ariaLabel,
        } as Record<string, unknown>)
      : {};

  const tabStrip = (
    <View
      testID={testId ? `${testId}-tablist` : undefined}
      accessibilityRole="tablist"
      accessibilityLabel={ariaLabel}
      style={[
        isHorizontal
          ? [
              styles.tabListHorizontal,
              !scrollable ? styles.tabListHorizontalWrap : undefined,
              { borderBottomColor: dividerColor },
            ]
          : [styles.tabListVertical, { borderRightColor: dividerColor }],
      ]}
      {...webTabListAriaProps}
    >
      {items.map((item, index) => {
        const isActive = item.id === activeTabId;
        const isDisabled = Boolean(item.disabled);
        const tabDomId = `${baseId}-tab-${item.id}`;
        const panelDomId = `${baseId}-panel-${item.id}`;

        const textColor = isDisabled
          ? colors.onSurfaceDisabled
          : isActive
            ? intent.main
            : colors.onSurfaceVariant;

        const webTabAriaProps =
          Platform.OS === 'web'
            ? ({
                role: 'tab',
                'aria-selected': isActive,
                'aria-disabled': isDisabled || undefined,
                'aria-controls': panelDomId,
                onKeyDown: (event: KeyboardEvent<View>) =>
                  handleTabKeyDown(index, event),
              } as Record<string, unknown>)
            : {};

        const labelNode = (
          <Text
            numberOfLines={1}
            style={[
              styles.tabLabel,
              { color: textColor, fontSize: tokens.fontSize },
            ]}
          >
            {item.label}
          </Text>
        );

        const iconNode = item.icon ? (
          <MagicIcon icon={item.icon} size={tokens.iconSize} color={textColor} />
        ) : null;

        const hasBadge =
          item.badgeContent !== undefined && item.badgeContent !== '';

        return (
          <Pressable
            key={item.id}
            ref={(node) => {
              tabButtonRefs.current[item.id] = node;
            }}
            nativeID={tabDomId}
            testID={testId ? `${testId}-tab-${item.id}` : undefined}
            disabled={isDisabled}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive, disabled: isDisabled }}
            onPress={() => selectTab(item)}
            style={({ pressed }) => [
              styles.tabItemBase,
              isHorizontal && !scrollable ? styles.tabItemHorizontalFill : undefined,
              !isHorizontal ? styles.tabItemVertical : undefined,
              {
                minHeight: tokens.minHeight,
                paddingHorizontal: tokens.paddingHorizontal,
                paddingVertical: tokens.paddingVertical,
                backgroundColor:
                  pressed && !isDisabled ? colors.surfaceVariant : 'transparent',
              },
            ]}
            {...webTabAriaProps}
          >
            <View
              style={
                variant === 'primary' && isHorizontal
                  ? styles.tabInnerPrimary
                  : styles.tabInnerSecondary
              }
            >
              {iconNode}
              {hasBadge ? (
                <MagicBadge
                  testId={testId ? `${testId}-badge-${item.id}` : undefined}
                  content={item.badgeContent}
                  color={color}
                  size="xs"
                  overlap={false}
                  position="after"
                >
                  {labelNode}
                </MagicBadge>
              ) : (
                labelNode
              )}
            </View>

            {isActive ? (
              <View
                testID={testId ? `${testId}-indicator-${item.id}` : undefined}
                style={[
                  isHorizontal
                    ? styles.indicatorHorizontal
                    : styles.indicatorVertical,
                  { backgroundColor: intent.main },
                ]}
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View
      ref={ref}
      nativeID={id}
      testID={testId}
      style={[
        isHorizontal ? styles.rootHorizontal : styles.rootVertical,
        style,
      ]}
    >
      {scrollable && isHorizontal ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollContainer}
        >
          {tabStrip}
        </ScrollView>
      ) : (
        tabStrip
      )}

      <View style={styles.panelContainer}>
        {items.map((item) => {
          const isActive = item.id === activeTabId;
          const isMounted = !lazy || isActive || mountedTabIds.has(item.id);
          if (!isMounted) {
            return null;
          }

          const tabDomId = `${baseId}-tab-${item.id}`;
          const panelDomId = `${baseId}-panel-${item.id}`;
          const webPanelAriaProps =
            Platform.OS === 'web'
              ? ({
                  role: 'tabpanel',
                  'aria-labelledby': tabDomId,
                  hidden: !isActive,
                } as Record<string, unknown>)
              : {};

          return (
            <View
              key={item.id}
              nativeID={panelDomId}
              testID={testId ? `${testId}-panel-${item.id}` : undefined}
              style={!isActive ? styles.panelHidden : undefined}
              {...webPanelAriaProps}
            >
              {renderPanel ? (
                renderPanel(item)
              ) : item.content !== undefined ? (
                <Text style={[styles.panelText, { color: colors.onSurface }]}>
                  {item.content}
                </Text>
              ) : isActive ? (
                children
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
