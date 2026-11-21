import { useCallback, useState, type ReactNode } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme, type MD3Theme } from 'react-native-paper';
import type {
  AtomicSize,
  ChipAtomProps,
  ChipItem,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import {
  resolveMagicPaperIntent,
  useMagicPaperColors,
} from '../../theme/paper-theme';

export type { ChipItem };

export interface MagicChipProps extends ChipAtomProps {
  /** Initial chip items when rendered in uncontrolled mode. */
  defaultChips?: readonly ChipItem[];
  /** Emits the updated immutable chip list on add, remove, edit, selection, or reorder. */
  onChipsChange?: (chips: ChipItem[]) => void;
  /** Emits the removed chip item when deleted. */
  onRemoved?: (chip: ChipItem) => void;
  /** Emits the list of currently selected chip IDs (or labels when `id` is omitted) in selectable mode. */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Emits the trimmed label of a newly added chip in `input` mode. */
  onAdded?: (label: string) => void;
  /** Emits the updated chip item after inline editing commits in `input` mode. */
  onEdited?: (chip: ChipItem) => void;
  /** Optional projected content for single-chip fallback in `basic` mode. */
  children?: ReactNode;
  /** Optional style override applied to the root chip container. */
  style?: StyleProp<ViewStyle>;
}

interface ChipSizeMetrics {
  height: number;
  fontSize: number;
  iconSize: number;
  avatarSize: number;
  paddingHorizontal: number;
  gap: number;
}

const CHIP_SIZE_METRICS: Record<AtomicSize, ChipSizeMetrics> = {
  xs: {
    height: 24,
    fontSize: 11,
    iconSize: 14,
    avatarSize: 18,
    paddingHorizontal: 8,
    gap: 4,
  },
  sm: {
    height: 28,
    fontSize: 12,
    iconSize: 15,
    avatarSize: 20,
    paddingHorizontal: 10,
    gap: 6,
  },
  md: {
    height: 32,
    fontSize: 14,
    iconSize: 18,
    avatarSize: 24,
    paddingHorizontal: 12,
    gap: 8,
  },
  lg: {
    height: 38,
    fontSize: 15,
    iconSize: 20,
    avatarSize: 28,
    paddingHorizontal: 14,
    gap: 8,
  },
  xl: {
    height: 44,
    fontSize: 16,
    iconSize: 22,
    avatarSize: 32,
    paddingHorizontal: 16,
    gap: 10,
  },
};

const styles = StyleSheet.create({
  container: {
    flexWrap: 'wrap',
    gap: 8,
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vertical: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  chipSurface: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  avatar: {
    borderRadius: 999,
  },
  label: {
    includeFontPadding: false,
    fontWeight: '500',
  },
  iconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  inputField: {
    minWidth: 120,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  inlineEditInput: {
    minWidth: 64,
    paddingVertical: 0,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
});

function getChipIdentifier(chip: ChipItem): string {
  return chip.id ?? chip.label;
}

/**
 * Material 3 Chip atom for React Native Paper supporting all 4 interaction variants:
 * - `'basic'`: static/removable chip set (or single chip fallback from `label` / `children`)
 * - `'selectable'`: single or multi-select filter chips with optional selection check indicator
 * - `'input'`: chip grid with new-chip `TextInput` (`Enter` or `,`), inline chip editing, and removal
 * - `'draggable'`: reorderable chip list with drag indicator, move-left/right buttons, and keyboard `ArrowLeft`/`ArrowRight` support
 */
export function MagicChip({
  id,
  testId,
  ariaLabel,
  chips,
  defaultChips,
  label = 'Chip',
  variant = 'basic',
  color = 'primary',
  size = 'md',
  removable = false,
  editable = false,
  selectable = false,
  multiple = true,
  hideSelectionIndicator = false,
  orientation = 'horizontal',
  disableRipple = false,
  disabled = false,
  inputPlaceholder = 'Add item...',
  onChipsChange,
  onRemoved,
  onSelectionChange,
  onAdded,
  onEdited,
  children,
  style,
}: MagicChipProps) {
  const theme = useTheme<MD3Theme>();
  const { semantic } = useMagicPaperColors();
  const intent = resolveMagicPaperIntent(color, theme, semantic);
  const metrics = CHIP_SIZE_METRICS[size];

  const [chipList, setChipList] = useControllableState<readonly ChipItem[]>({
    value: chips,
    defaultValue: defaultChips ? [...defaultChips] : [],
    onChange: (next) => onChipsChange?.([...next]),
  });

  const [newChipText, setNewChipText] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleRemoveChip = useCallback(
    (index: number) => {
      const target = chipList[index];
      if (disabled || !target || target.disabled) {
        return;
      }
      const next = chipList.filter((_, idx) => idx !== index);
      setChipList(next);
      onRemoved?.(target);
    },
    [chipList, disabled, onRemoved, setChipList]
  );

  const handleToggleSelect = useCallback(
    (index: number) => {
      const target = chipList[index];
      const isItemSelectable =
        target?.selectable ?? (variant === 'selectable' ? true : selectable);
      if (disabled || !target || target.disabled || !isItemSelectable) {
        return;
      }

      const nextSelected = !target.selected;
      const next = chipList.map((item, idx) => {
        if (idx === index) {
          return { ...item, selected: nextSelected };
        }
        if (!multiple && nextSelected) {
          return { ...item, selected: false };
        }
        return item;
      });

      setChipList(next);
      const selectedIds = next
        .filter((item) => Boolean(item.selected))
        .map(getChipIdentifier);
      onSelectionChange?.(selectedIds);
    },
    [chipList, disabled, multiple, onSelectionChange, selectable, setChipList, variant]
  );

  const commitAddChip = useCallback(
    (rawText: string) => {
      if (disabled) {
        return;
      }
      const cleaned = rawText.replace(/,/g, '').trim();
      setNewChipText('');
      if (!cleaned) {
        return;
      }
      const created: ChipItem = {
        id: `chip-${Date.now()}-${chipList.length}`,
        label: cleaned,
      };
      setChipList([...chipList, created]);
      onAdded?.(cleaned);
    },
    [chipList, disabled, onAdded, setChipList]
  );

  const startEditingChip = useCallback(
    (index: number) => {
      const target = chipList[index];
      const canEdit = target?.editable ?? editable;
      if (disabled || !target || target.disabled || !canEdit) {
        return;
      }
      setEditingIndex(index);
      setEditingText(target.label);
    },
    [chipList, disabled, editable]
  );

  const commitEditChip = useCallback(
    (index: number) => {
      const target = chipList[index];
      setEditingIndex(null);
      if (!target) {
        return;
      }
      const trimmed = editingText.trim();
      if (!trimmed) {
        handleRemoveChip(index);
        return;
      }
      const updatedItem: ChipItem = { ...target, label: trimmed };
      setChipList(
        chipList.map((item, idx) => (idx === index ? updatedItem : item))
      );
      onEdited?.(updatedItem);
    },
    [chipList, editingText, handleRemoveChip, onEdited, setChipList]
  );

  const cancelEditChip = useCallback(() => {
    setEditingIndex(null);
    setEditingText('');
  }, []);

  const handleMoveChip = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (
        disabled ||
        toIndex < 0 ||
        toIndex >= chipList.length ||
        fromIndex === toIndex ||
        chipList[fromIndex]?.disabled
      ) {
        return;
      }
      const next = [...chipList];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      setChipList(next);
    },
    [chipList, disabled, setChipList]
  );

  const renderSingleChip = (
    chip: ChipItem,
    index: number,
    isFallbackSingle = false
  ) => {
    const itemDisabled = Boolean(disabled || chip.disabled);
    const isSelected = Boolean(chip.selected);
    const isRemovable = Boolean(!isFallbackSingle && (chip.removable ?? removable));
    const isEditable = Boolean(
      variant === 'input' && (chip.editable ?? editable)
    );
    const isSelectableVariant =
      variant === 'selectable' || Boolean(chip.selectable ?? selectable);
    const isDraggableVariant = variant === 'draggable';
    const isEditingThis = editingIndex === index;

    const backgroundColor = itemDisabled
      ? theme.colors.surfaceDisabled
      : isSelected
        ? intent.container
        : theme.colors.surface;

    const borderColor = itemDisabled
      ? theme.colors.surfaceDisabled
      : isSelected
        ? intent.main
        : theme.colors.outline;

    const textColor = itemDisabled
      ? theme.colors.onSurfaceDisabled
      : isSelected
        ? intent.onContainer
        : theme.colors.onSurface;

    const chipTestId = testId ? `${testId}-chip-${index}` : undefined;

    const handleChipKeyDown = (event: {
      key?: string;
      nativeEvent?: { key?: string };
      preventDefault?: () => void;
    }) => {
      if (itemDisabled) {
        return;
      }
      const key = event.key ?? event.nativeEvent?.key;
      if (isDraggableVariant) {
        if (key === 'ArrowLeft' || key === 'ArrowUp') {
          event.preventDefault?.();
          handleMoveChip(index, index - 1);
        } else if (key === 'ArrowRight' || key === 'ArrowDown') {
          event.preventDefault?.();
          handleMoveChip(index, index + 1);
        }
      } else if ((key === 'Backspace' || key === 'Delete') && isRemovable) {
        event.preventDefault?.();
        handleRemoveChip(index);
      } else if (key === 'Enter' && isEditable && !isEditingThis) {
        event.preventDefault?.();
        startEditingChip(index);
      }
    };

    const webChipProps = {
      onKeyDown: handleChipKeyDown,
      tabIndex: itemDisabled ? -1 : 0,
      'aria-disabled': itemDisabled ? true : undefined,
      'aria-selected': isSelectableVariant ? isSelected : undefined,
    } as Record<string, unknown>;

    return (
      <Pressable
        key={chip.id ?? `${chip.label}-${index}`}
        testID={chipTestId}
        accessible
        accessibilityRole={isSelectableVariant ? 'button' : 'text'}
        accessibilityLabel={chip.label}
        accessibilityState={{
          disabled: itemDisabled,
          selected: isSelectableVariant ? isSelected : undefined,
        }}
        disabled={itemDisabled}
        android_ripple={
          disableRipple || itemDisabled
            ? undefined
            : { color: intent.container, borderless: false }
        }
        onPress={
          isSelectableVariant
            ? () => handleToggleSelect(index)
            : isEditable && !isEditingThis
              ? () => startEditingChip(index)
              : undefined
        }
        style={[
          styles.chipSurface,
          {
            minHeight: metrics.height,
            paddingHorizontal: metrics.paddingHorizontal,
            gap: metrics.gap,
            backgroundColor,
            borderColor,
          },
        ]}
        {...webChipProps}
      >
        {isDraggableVariant ? (
          <MagicIcon
            icon="drag_indicator"
            size={metrics.iconSize}
            color={textColor}
            testID={chipTestId ? `${chipTestId}-drag-icon` : undefined}
          />
        ) : null}

        {isSelectableVariant && isSelected && !hideSelectionIndicator ? (
          <MagicIcon
            icon="check"
            size={metrics.iconSize}
            color={textColor}
            testID={chipTestId ? `${chipTestId}-check-icon` : undefined}
          />
        ) : null}

        {chip.avatarSrc ? (
          <Image
            testID={chipTestId ? `${chipTestId}-avatar` : undefined}
            source={{ uri: chip.avatarSrc }}
            accessibilityLabel={chip.avatarAlt || chip.label}
            style={[
              styles.avatar,
              {
                width: metrics.avatarSize,
                height: metrics.avatarSize,
              },
            ]}
          />
        ) : chip.leadingIcon ? (
          <MagicIcon
            icon={chip.leadingIcon}
            size={metrics.iconSize}
            color={textColor}
            testID={chipTestId ? `${chipTestId}-leading-icon` : undefined}
          />
        ) : null}

        {isEditingThis ? (
          <TextInput
            testID={chipTestId ? `${chipTestId}-edit-input` : undefined}
            accessibilityLabel={`Edit ${chip.label}`}
            value={editingText}
            onChangeText={setEditingText}
            onSubmitEditing={() => commitEditChip(index)}
            onBlur={() => commitEditChip(index)}
            onKeyPress={(e) => {
              const key = e.nativeEvent?.key;
              if (key === 'Enter') {
                commitEditChip(index);
              } else if (key === 'Escape') {
                cancelEditChip();
              }
            }}
            style={[
              styles.inlineEditInput,
              {
                fontSize: metrics.fontSize,
                color: textColor,
                borderColor: intent.main,
              },
            ]}
          />
        ) : (
          <Text
            style={[
              styles.label,
              {
                fontSize: metrics.fontSize,
                color: textColor,
              },
            ]}
          >
            {isFallbackSingle && children !== undefined ? children : chip.label}
          </Text>
        )}

        {isEditable && !isEditingThis ? (
          <Pressable
            testID={chipTestId ? `${chipTestId}-edit` : undefined}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${chip.label}`}
            disabled={itemDisabled}
            onPress={() => startEditingChip(index)}
            style={styles.iconBtn}
          >
            <MagicIcon icon="edit" size={metrics.iconSize - 2} color={textColor} />
          </Pressable>
        ) : null}

        {isDraggableVariant ? (
          <View style={styles.horizontal}>
            <Pressable
              testID={chipTestId ? `${chipTestId}-move-prev` : undefined}
              accessibilityRole="button"
              accessibilityLabel={`Move ${chip.label} earlier`}
              disabled={itemDisabled || index === 0}
              onPress={() => handleMoveChip(index, index - 1)}
              style={styles.iconBtn}
            >
              <MagicIcon
                icon="chevron_left"
                size={metrics.iconSize}
                color={
                  itemDisabled || index === 0
                    ? theme.colors.onSurfaceDisabled
                    : textColor
                }
              />
            </Pressable>
            <Pressable
              testID={chipTestId ? `${chipTestId}-move-next` : undefined}
              accessibilityRole="button"
              accessibilityLabel={`Move ${chip.label} later`}
              disabled={itemDisabled || index === chipList.length - 1}
              onPress={() => handleMoveChip(index, index + 1)}
              style={styles.iconBtn}
            >
              <MagicIcon
                icon="chevron_right"
                size={metrics.iconSize}
                color={
                  itemDisabled || index === chipList.length - 1
                    ? theme.colors.onSurfaceDisabled
                    : textColor
                }
              />
            </Pressable>
          </View>
        ) : null}

        {isRemovable ? (
          <Pressable
            testID={chipTestId ? `${chipTestId}-remove` : undefined}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${chip.label}`}
            disabled={itemDisabled}
            onPress={() => handleRemoveChip(index)}
            style={styles.iconBtn}
          >
            <MagicIcon icon="cancel" size={metrics.iconSize} color={textColor} />
          </Pressable>
        ) : null}
      </Pressable>
    );
  };

  const hasChips = chipList.length > 0;

  return (
    <View
      nativeID={id}
      testID={testId}
      accessibilityLabel={ariaLabel || label}
      style={[
        styles.container,
        orientation === 'vertical' ? styles.vertical : styles.horizontal,
        style,
      ]}
    >
      {hasChips
        ? chipList.map((chip, idx) => renderSingleChip(chip, idx, false))
        : variant === 'basic'
          ? renderSingleChip({ label }, 0, true)
          : null}

      {variant === 'input' ? (
        <TextInput
          testID={testId ? `${testId}-input` : undefined}
          accessibilityLabel={inputPlaceholder}
          placeholder={inputPlaceholder}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          editable={!disabled}
          value={newChipText}
          onChangeText={(text) => {
            if (text.endsWith(',')) {
              commitAddChip(text);
            } else {
              setNewChipText(text);
            }
          }}
          onSubmitEditing={(e) =>
            commitAddChip(e.nativeEvent?.text ?? newChipText)
          }
          onKeyPress={(e) => {
            const key = e.nativeEvent?.key;
            if (key === 'Enter' || key === ',') {
              commitAddChip(newChipText);
            }
          }}
          style={[
            styles.inputField,
            {
              height: metrics.height,
              fontSize: metrics.fontSize,
              color: disabled
                ? theme.colors.onSurfaceDisabled
                : theme.colors.onSurface,
              borderColor: disabled
                ? theme.colors.surfaceDisabled
                : theme.colors.outline,
              backgroundColor: theme.colors.surface,
            },
          ]}
        />
      ) : null}
    </View>
  );
}
