import {
  useCallback,
  useEffect,
  useId,
  useState,
  type ReactNode,
  type Ref,
} from 'react';
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
  ButtonVariant,
  MenuCloseReason,
  MenuItem,
  MenuMoleculeProps,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButton } from '../../atoms/button/button';
import { MagicIcon } from '../../core/icon';
import {
  MAGIC_PAPER_SIZE_METRICS,
  useMagicPaperColors,
} from '../../theme/paper-theme';

export type {
  MenuCloseReason,
  MenuItem,
  MenuMoleculeProps,
  MenuPositionX,
  MenuPositionY,
  MenuTriggerType,
} from '@mono-magic/atomic-design-interfaces';

export interface MagicMenuProps extends MenuMoleculeProps {
  /** Visual variant applied when `triggerType === 'button'`. Defaults to `'tonal'`. */
  triggerVariant?: ButtonVariant;
  /** Controlled open state. When omitted, `MagicMenu` manages open state internally. */
  open?: boolean;
  /** Initial open state in uncontrolled mode. */
  defaultOpen?: boolean;
  /** Custom trigger element rendered instead of the default `MagicButton`. */
  triggerSlot?: ReactNode;
  /** Emitted when a leaf `MenuItem` is activated. */
  onItemSelect?: (item: MenuItem) => void;
  /** Emitted when the root menu panel opens. */
  onMenuOpen?: () => void;
  /** Emitted when the menu panel closes with the close reason (`'click' | 'keydown' | 'tab'`). */
  onMenuClose?: (reason: MenuCloseReason) => void;
  /** Style override applied to the outer menu wrapper. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the outer menu wrapper `View`. */
  ref?: Ref<View>;
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    alignSelf: 'flex-start',
    zIndex: 50,
  },
  backdrop: {
    ...Platform.select({
      web: {
        position: 'fixed' as unknown as 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      default: {
        position: 'absolute',
        top: -1000,
        right: -1000,
        bottom: -1000,
        left: -1000,
      },
    }),
    backgroundColor: 'transparent',
    zIndex: 90,
  },
  panel: {
    position: 'absolute',
    minWidth: 200,
    maxWidth: 300,
    paddingVertical: 6,
    zIndex: 100,
    ...Platform.select({
      web: {
        boxShadow:
          '0 4px 12px 2px rgba(0, 0, 0, 0.16), 0 2px 4px 0 rgba(0, 0, 0, 0.22)',
      },
      default: {
        elevation: 4,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 6,
      },
    }),
  },
  backItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  backText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  itemLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  itemLabel: {
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
  },
});

interface SubmenuDrillLevel {
  parentLabel: string;
  items: readonly MenuItem[];
}

/**
 * Material 3 dropdown action menu molecule composing `MagicButton` as trigger
 * and an accessible M3 surface (`role="menu"`) supporting positioning
 * (`xPosition`, `yPosition`, `overlapTrigger`), backdrop click-away, keyboard
 * dismissal (`Escape`, `Tab`), and recursive submenu navigation.
 */
export function MagicMenu({
  id,
  testId,
  ariaLabel,
  items,
  triggerLabel = 'Menu',
  triggerIcon = 'more_vert',
  triggerType = 'button',
  triggerVariant = 'tonal',
  xPosition = 'after',
  yPosition = 'below',
  overlapTrigger = false,
  hasBackdrop = true,
  disabled = false,
  size = 'md',
  color = 'primary',
  open: controlledOpen,
  defaultOpen = false,
  triggerSlot,
  onItemSelect,
  onMenuOpen,
  onMenuClose,
  style,
  ref,
}: MagicMenuProps) {
  const { theme, colors } = useMagicPaperColors();
  const metrics = MAGIC_PAPER_SIZE_METRICS[size];
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const menuPanelId = `${baseId}-panel`;

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const [drillStack, setDrillStack] = useState<readonly SubmenuDrillLevel[]>(
    []
  );

  const setOpenState = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      if (!nextOpen) {
        setDrillStack([]);
      }
    },
    [isControlled]
  );

  const handleOpen = useCallback(() => {
    if (disabled) {
      return;
    }
    setDrillStack([]);
    setOpenState(true);
    onMenuOpen?.();
  }, [disabled, onMenuOpen, setOpenState]);

  const handleClose = useCallback(
    (reason: MenuCloseReason) => {
      setOpenState(false);
      onMenuClose?.(reason);
    },
    [onMenuClose, setOpenState]
  );

  const handleTriggerPress = useCallback(() => {
    if (disabled) {
      return;
    }
    if (isOpen) {
      handleClose('click');
    } else {
      handleOpen();
    }
  }, [disabled, handleClose, handleOpen, isOpen]);

  useEffect(() => {
    if (!isOpen || Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose('keydown');
      } else if (event.key === 'Tab') {
        handleClose('tab');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose, isOpen]);

  const handleItemPress = useCallback(
    (item: MenuItem) => {
      if (item.disabled) {
        return;
      }
      if (item.children && item.children.length > 0) {
        setDrillStack((prev) => [
          ...prev,
          { parentLabel: item.label, items: item.children ?? [] },
        ]);
        return;
      }
      onItemSelect?.(item);
      handleClose('click');
    },
    [handleClose, onItemSelect]
  );

  const handleDrillBack = useCallback(() => {
    setDrillStack((prev) => prev.slice(0, -1));
  }, []);

  const currentLevel =
    drillStack.length > 0 ? drillStack[drillStack.length - 1] : null;
  const activeItems = currentLevel ? currentLevel.items : items;

  const horizontalPositionStyle: ViewStyle =
    xPosition === 'before' ? { right: 0 } : { left: 0 };

  const verticalOffset = overlapTrigger ? 0 : metrics.height + 4;
  const verticalPositionStyle: ViewStyle =
    yPosition === 'above'
      ? { bottom: verticalOffset }
      : { top: verticalOffset };

  const webTriggerAriaProps =
    Platform.OS === 'web'
      ? ({
          'aria-haspopup': 'menu',
          'aria-expanded': isOpen,
          'aria-controls': isOpen ? menuPanelId : undefined,
        } as Record<string, unknown>)
      : {};

  return (
    <View
      ref={ref}
      nativeID={id}
      testID={testId}
      style={[styles.root, style]}
    >
      <View
        testID={testId ? `${testId}-trigger-wrapper` : undefined}
        {...webTriggerAriaProps}
      >
        {triggerSlot ? (
          <Pressable
            testID={testId ? `${testId}-trigger` : undefined}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={ariaLabel ?? triggerLabel}
            accessibilityState={{ disabled, expanded: isOpen }}
            onPress={handleTriggerPress}
          >
            {triggerSlot}
          </Pressable>
        ) : triggerType === 'icon' ? (
          <MagicButton
            testId={testId ? `${testId}-trigger` : undefined}
            kind="icon"
            variant="text"
            color={color}
            size={size}
            disabled={disabled}
            leadingIcon={triggerIcon || 'more_vert'}
            ariaLabel={ariaLabel ?? triggerLabel}
            onPress={handleTriggerPress}
          />
        ) : (
          <MagicButton
            testId={testId ? `${testId}-trigger` : undefined}
            kind="default"
            variant={triggerVariant}
            color={color}
            size={size}
            disabled={disabled}
            label={triggerLabel}
            leadingIcon={
              triggerIcon && triggerIcon !== 'more_vert'
                ? triggerIcon
                : undefined
            }
            trailingIcon={isOpen ? 'expand_less' : 'expand_more'}
            ariaLabel={ariaLabel ?? triggerLabel}
            onPress={handleTriggerPress}
          />
        )}
      </View>

      {isOpen ? (
        <>
          {hasBackdrop ? (
            <Pressable
              testID={testId ? `${testId}-backdrop` : 'magic-menu-backdrop'}
              accessibilityLabel="Close menu"
              onPress={() => handleClose('click')}
              style={styles.backdrop}
            />
          ) : null}

          <View
            nativeID={menuPanelId}
            testID={testId ? `${testId}-panel` : 'magic-menu-panel'}
            accessibilityRole="menu"
            accessibilityLabel={ariaLabel ?? triggerLabel}
            style={[
              styles.panel,
              {
                borderRadius: theme.roundness,
                backgroundColor: colors.elevation.level2,
                borderWidth: 1,
                borderColor: colors.outlineVariant ?? colors.outline,
              },
              horizontalPositionStyle,
              verticalPositionStyle,
            ]}
          >
            {currentLevel ? (
              <Pressable
                testID={testId ? `${testId}-back` : 'magic-menu-back'}
                accessibilityRole="menuitem"
                accessibilityLabel={`Back from ${currentLevel.parentLabel}`}
                onPress={handleDrillBack}
                style={[
                  styles.backItem,
                  { borderBottomColor: colors.outlineVariant ?? colors.outline },
                ]}
              >
                <MagicIcon
                  icon="arrow_back"
                  size={18}
                  color={colors.primary}
                />
                <Text style={[styles.backText, { color: colors.primary }]}>
                  {currentLevel.parentLabel}
                </Text>
              </Pressable>
            ) : null}

            {activeItems.map((item, index) => {
              const itemKey = item.id ?? `${item.label}-${index}`;
              const isItemDisabled = Boolean(item.disabled);
              const hasSubmenu = Boolean(
                item.children && item.children.length > 0
              );
              const itemTextColor = isItemDisabled
                ? colors.onSurfaceDisabled
                : colors.onSurface;
              const itemIconColor = isItemDisabled
                ? colors.onSurfaceDisabled
                : colors.onSurfaceVariant;
              const webMenuItemRole =
                Platform.OS === 'web'
                  ? ({
                      role: item.role ?? 'menuitem',
                      'aria-disabled': isItemDisabled ? true : undefined,
                      'aria-haspopup': hasSubmenu ? 'menu' : undefined,
                    } as Record<string, unknown>)
                  : {};

              return (
                <Pressable
                  key={itemKey}
                  testID={
                    testId
                      ? `${testId}-item-${item.id ?? index}`
                      : `magic-menu-item-${item.id ?? index}`
                  }
                  disabled={isItemDisabled}
                  accessibilityRole="menuitem"
                  accessibilityLabel={item.label}
                  accessibilityState={{ disabled: isItemDisabled }}
                  onPress={() => handleItemPress(item)}
                  style={({ pressed }) => [
                    styles.menuItem,
                    {
                      backgroundColor:
                        pressed && !item.disableRipple && !isItemDisabled
                          ? colors.surfaceVariant
                          : 'transparent',
                    },
                  ]}
                  {...webMenuItemRole}
                >
                  <View style={styles.itemLeading}>
                    {item.icon ? (
                      <MagicIcon
                        icon={item.icon}
                        size={18}
                        color={itemIconColor}
                      />
                    ) : null}
                    <Text
                      numberOfLines={1}
                      style={[styles.itemLabel, { color: itemTextColor }]}
                    >
                      {item.label}
                    </Text>
                  </View>

                  {hasSubmenu ? (
                    <MagicIcon
                      icon="chevron_right"
                      size={18}
                      color={itemIconColor}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  );
}
