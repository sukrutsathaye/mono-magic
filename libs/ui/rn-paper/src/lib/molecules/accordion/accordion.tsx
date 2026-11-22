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
import type {
  AccordionItem,
  AccordionMoleculeProps,
  AtomicSize,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import { useMagicPaperColors } from '../../theme/paper-theme';

export type {
  AccordionAppearance,
  AccordionItem,
  AccordionMoleculeProps,
} from '@mono-magic/atomic-design-interfaces';

/** Props for the React Native Paper `MagicAccordion` molecule. */
export interface MagicAccordionProps extends AccordionMoleculeProps {
  /** Fired whenever the list of expanded panel identifiers changes. */
  onExpandedChange?: (expandedIds: readonly string[]) => void;
  /** Fired when an individual panel header is toggled. */
  onItemToggle?: (item: AccordionItem, expanded: boolean) => void;
  /** Optional custom renderer for an expanded item's body content. */
  renderContent?: (item: AccordionItem) => ReactNode;
  /** Style override applied to the outer accordion group container. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the outer accordion group container `View`. */
  ref?: Ref<View>;
}

interface AccordionSizeTokens {
  paddingVertical: number;
  paddingHorizontal: number;
  titleFontSize: number;
  summaryFontSize: number;
  contentFontSize: number;
  iconSize: number;
}

const ACCORDION_SIZE_TOKENS: Record<AtomicSize, AccordionSizeTokens> = {
  xs: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    titleFontSize: 13,
    summaryFontSize: 12,
    contentFontSize: 12,
    iconSize: 18,
  },
  sm: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    titleFontSize: 14,
    summaryFontSize: 13,
    contentFontSize: 13,
    iconSize: 20,
  },
  md: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    titleFontSize: 15,
    summaryFontSize: 13,
    contentFontSize: 14,
    iconSize: 22,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    titleFontSize: 16,
    summaryFontSize: 14,
    contentFontSize: 15,
    iconSize: 24,
  },
  xl: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    titleFontSize: 18,
    summaryFontSize: 15,
    contentFontSize: 16,
    iconSize: 26,
  },
};

const styles = StyleSheet.create({
  group: {
    width: '100%',
    gap: 8,
  },
  panel: {
    width: '100%',
    overflow: 'hidden',
  },
  raisedShadow: {
    ...Platform.select({
      web: {
        boxShadow:
          '0 2px 6px 1px rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
      },
      default: {
        elevation: 2,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 3,
      },
    }),
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  headerTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontWeight: '600',
    lineHeight: 20,
  },
  summary: {
    lineHeight: 18,
  },
  body: {
    borderTopWidth: 1,
  },
  contentText: {
    lineHeight: 20,
  },
});

function resolveDefaultExpandedIds(
  items: readonly AccordionItem[],
  defaultExpandedIds: readonly string[] | undefined,
  multiple: boolean
): readonly string[] {
  if (defaultExpandedIds !== undefined) {
    return multiple ? defaultExpandedIds : defaultExpandedIds.slice(0, 1);
  }
  const initialFromItems = items
    .filter((item) => item.expanded && !item.disabled)
    .map((item) => item.id);
  return multiple ? initialFromItems : initialFromItems.slice(0, 1);
}

/**
 * Material 3 collapsible accordion molecule supporting single-item and
 * multi-item expansion via `useControllableState`, `'outlined'` and `'raised'`
 * surfaces, optional leading `MagicIcon` and header summary, and disabled panels.
 */
export function MagicAccordion({
  id,
  testId,
  ariaLabel,
  items,
  multiple = false,
  expandedIds: controlledExpandedIds,
  defaultExpandedIds,
  appearance = 'outlined',
  size = 'md',
  onExpandedChange,
  onItemToggle,
  renderContent,
  style,
  ref,
}: MagicAccordionProps) {
  const { theme, colors } = useMagicPaperColors();
  const tokens = ACCORDION_SIZE_TOKENS[size];
  const generatedId = useId();
  const baseId = id ?? generatedId;

  const [expandedIds, setExpandedIds] = useControllableState<readonly string[]>({
    value: controlledExpandedIds,
    defaultValue: resolveDefaultExpandedIds(
      items,
      defaultExpandedIds,
      multiple
    ),
    onChange: onExpandedChange,
  });

  const handleToggleItem = useCallback(
    (item: AccordionItem) => {
      if (item.disabled) {
        return;
      }

      const isCurrentlyExpanded = expandedIds.includes(item.id);
      const nextExpanded = !isCurrentlyExpanded;

      const nextIds = nextExpanded
        ? multiple
          ? [...expandedIds, item.id]
          : [item.id]
        : expandedIds.filter((existingId) => existingId !== item.id);

      setExpandedIds(nextIds);
      onItemToggle?.(item, nextExpanded);
    },
    [expandedIds, multiple, onItemToggle, setExpandedIds]
  );

  const isOutlined = appearance === 'outlined';
  const dividerColor = colors.outlineVariant ?? colors.outline;

  return (
    <View
      ref={ref}
      nativeID={id}
      testID={testId}
      accessibilityLabel={ariaLabel}
      style={[styles.group, style]}
    >
      {items.map((item) => {
        const isExpanded = expandedIds.includes(item.id);
        const isDisabled = Boolean(item.disabled);
        const headerId = `${baseId}-header-${item.id}`;
        const contentId = `${baseId}-panel-${item.id}`;

        const titleColor = isDisabled
          ? colors.onSurfaceDisabled
          : colors.onSurface;
        const secondaryColor = isDisabled
          ? colors.onSurfaceDisabled
          : colors.onSurfaceVariant;

        const webHeaderAriaProps =
          Platform.OS === 'web'
            ? ({
                'aria-expanded': isExpanded,
                'aria-controls': contentId,
              } as Record<string, unknown>)
            : {};

        const webRegionAriaProps =
          Platform.OS === 'web'
            ? ({
                role: 'region',
                'aria-labelledby': headerId,
              } as Record<string, unknown>)
            : {};

        return (
          <View
            key={item.id}
            testID={testId ? `${testId}-item-${item.id}` : undefined}
            style={[
              styles.panel,
              {
                borderRadius: theme.roundness,
                backgroundColor: isOutlined
                  ? colors.surface
                  : colors.elevation.level1,
                borderWidth: isOutlined ? 1 : 0,
                borderColor: isOutlined ? dividerColor : 'transparent',
              },
              !isOutlined ? styles.raisedShadow : undefined,
            ]}
          >
            <Pressable
              nativeID={headerId}
              testID={testId ? `${testId}-header-${item.id}` : undefined}
              disabled={isDisabled}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              accessibilityState={{
                expanded: isExpanded,
                disabled: isDisabled,
              }}
              onPress={() => handleToggleItem(item)}
              style={({ pressed }) => [
                styles.headerButton,
                {
                  paddingVertical: tokens.paddingVertical,
                  paddingHorizontal: tokens.paddingHorizontal,
                  backgroundColor:
                    pressed && !isDisabled ? colors.surfaceVariant : 'transparent',
                },
              ]}
              {...webHeaderAriaProps}
            >
              <View style={styles.headerLeading}>
                {item.icon ? (
                  <MagicIcon
                    icon={item.icon}
                    size={tokens.iconSize}
                    color={secondaryColor}
                  />
                ) : null}
                <View style={styles.headerTextBlock}>
                  <Text
                    style={[
                      styles.title,
                      { color: titleColor, fontSize: tokens.titleFontSize },
                    ]}
                  >
                    {item.title}
                  </Text>
                  {item.summary ? (
                    <Text
                      style={[
                        styles.summary,
                        {
                          color: secondaryColor,
                          fontSize: tokens.summaryFontSize,
                        },
                      ]}
                    >
                      {item.summary}
                    </Text>
                  ) : null}
                </View>
              </View>

              <MagicIcon
                testID={testId ? `${testId}-chevron-${item.id}` : undefined}
                icon={isExpanded ? 'expand_less' : 'expand_more'}
                size={tokens.iconSize}
                color={secondaryColor}
              />
            </Pressable>

            {isExpanded ? (
              <View
                nativeID={contentId}
                testID={testId ? `${testId}-panel-${item.id}` : undefined}
                style={[
                  styles.body,
                  {
                    borderTopColor: dividerColor,
                    paddingVertical: tokens.paddingVertical,
                    paddingHorizontal: tokens.paddingHorizontal,
                  },
                ]}
                {...webRegionAriaProps}
              >
                {renderContent ? (
                  renderContent(item)
                ) : item.content ? (
                  <Text
                    style={[
                      styles.contentText,
                      {
                        color: colors.onSurfaceVariant,
                        fontSize: tokens.contentFontSize,
                      },
                    ]}
                  >
                    {item.content}
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
