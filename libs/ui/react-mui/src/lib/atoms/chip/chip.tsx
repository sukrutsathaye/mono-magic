import {
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import MuiChip from '@mui/material/Chip';
import InputBase from '@mui/material/InputBase';
import { alpha, useTheme, type SxProps, type Theme } from '@mui/material/styles';
import type {
  AtomicSize,
  ChipAtomProps,
  ChipItem,
  ChipOrientation,
  ChipVariant,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import {
  MAGIC_SIZE_METRICS,
  resolveMagicIntentColors,
} from '../../theme/mui-theme';

export type { ChipItem, ChipOrientation, ChipVariant };

/**
 * Props for {@link MagicChip}, extending {@link ChipAtomProps} with React 19 / MUI v9
 * ergonomics (`defaultChips`, `children`, `onChipsChange`, `onRemoved`,
 * `onSelectionChange`, `onAdded`, `onEdited`, `sx`, `className`, and direct `ref` prop).
 */
export interface MagicChipProps extends ChipAtomProps {
  /** Initial chips array when used in uncontrolled mode. */
  defaultChips?: readonly ChipItem[];
  /** Custom fallback React content rendered when `chips` is empty in `'basic'` mode. */
  children?: ReactNode;
  /** Called with the immutably updated `ChipItem[]` whenever chips are added, removed, edited, selected, or reordered. */
  onChipsChange?: (chips: ChipItem[]) => void;
  /** Called with the removed `ChipItem` when a chip is deleted. */
  onRemoved?: (chip: ChipItem) => void;
  /** Called with the array of selected chip IDs (or labels when `id` is omitted) when selection changes. */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Called with the trimmed label string when a new chip is added in `'input'` mode. */
  onAdded?: (label: string) => void;
  /** Called with the updated `ChipItem` when an existing chip is edited in `'input'` mode. */
  onEdited?: (chip: ChipItem) => void;
  /** Optional MUI `sx` overrides. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name. */
  className?: string;
  /** React 19 ref forwarded to the root chip container (`<div>`). */
  ref?: Ref<HTMLDivElement>;
}

const MUI_CHIP_SIZE_MAP: Record<AtomicSize, 'small' | 'medium'> = {
  xs: 'small',
  sm: 'small',
  md: 'medium',
  lg: 'medium',
  xl: 'medium',
};

function resolveChipId(chip: ChipItem): string {
  return chip.id ?? chip.label;
}

/**
 * Material 3 chip atom unifying static/removable chip lists (`basic`),
 * filter/choice chip listboxes (`selectable`), interactive token input grids (`input`),
 * and reorderable drag-and-drop chip sets (`draggable`).
 *
 * Supports all 4 `ChipVariant`s, all 5 `AtomicSize`s (`xs`..`xl`), all 7 `ColorIntent`s,
 * horizontal and vertical orientations, avatars (`avatarSrc`), leading icons (`leadingIcon`),
 * inline double-click editing (`editable`), and keyboard reordering.
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
  sx,
  className,
  ref,
}: MagicChipProps) {
  const theme = useTheme();
  const metrics = MAGIC_SIZE_METRICS[size];
  const intent = resolveMagicIntentColors(theme, color);
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];

  const [currentChips, setCurrentChips] = useControllableState<ChipItem[]>({
    value: chips ? [...chips] : undefined,
    defaultValue: defaultChips ? [...defaultChips] : [],
    onChange: onChipsChange,
  });

  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const isSelectableMode = variant === 'selectable' || selectable;

  const handleRemoveChip = (index: number) => {
    const target = currentChips[index];
    if (!target || disabled || target.disabled) {
      return;
    }
    const next = currentChips.filter((_, idx) => idx !== index);
    setCurrentChips(next);
    onRemoved?.(target);
  };

  const handleToggleSelect = (index: number) => {
    const target = currentChips[index];
    if (!target || disabled || target.disabled) {
      return;
    }
    const canSelectItem =
      target.selectable ?? (variant === 'selectable' ? true : selectable);
    if (!canSelectItem) {
      return;
    }

    const nextSelected = !target.selected;
    const nextChips = currentChips.map((item, idx) => {
      if (idx === index) {
        return { ...item, selected: nextSelected };
      }
      if (!multiple && nextSelected) {
        return { ...item, selected: false };
      }
      return item;
    });

    setCurrentChips(nextChips);
    const selectedIds = nextChips
      .filter((item) => Boolean(item.selected))
      .map(resolveChipId);
    onSelectionChange?.(selectedIds);
  };

  const commitAddChip = (rawValue: string) => {
    const trimmed = rawValue.replace(/,+$/g, '').trim();
    if (!trimmed || disabled) {
      setInputValue('');
      return;
    }
    const newChip: ChipItem = {
      id: `chip-${currentChips.length + 1}-${trimmed.toLowerCase().replace(/\s+/g, '-')}`,
      label: trimmed,
    };
    const next = [...currentChips, newChip];
    setCurrentChips(next);
    onAdded?.(trimmed);
    setInputValue('');
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commitAddChip(inputValue);
    } else if (
      (event.key === 'Backspace' || event.key === 'Delete') &&
      inputValue === '' &&
      currentChips.length > 0
    ) {
      const lastIndex = currentChips.length - 1;
      const lastChip = currentChips[lastIndex];
      if (lastChip && (lastChip.removable ?? removable) && !lastChip.disabled) {
        handleRemoveChip(lastIndex);
      }
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    if (val.endsWith(',')) {
      commitAddChip(val);
    } else {
      setInputValue(val);
    }
  };

  const startEditingChip = (index: number) => {
    const target = currentChips[index];
    if (!target || disabled || target.disabled) {
      return;
    }
    const isItemEditable = target.editable ?? editable;
    if (!isItemEditable) {
      return;
    }
    setEditingIndex(index);
    setEditingValue(target.label);
  };

  const commitEditChip = (index: number) => {
    const target = currentChips[index];
    if (!target) {
      setEditingIndex(null);
      return;
    }
    const trimmed = editingValue.trim();
    if (!trimmed) {
      setEditingIndex(null);
      handleRemoveChip(index);
      return;
    }
    const updatedItem: ChipItem = { ...target, label: trimmed };
    const next = currentChips.map((chip, idx) =>
      idx === index ? updatedItem : chip,
    );
    setEditingIndex(null);
    setCurrentChips(next);
    onEdited?.(updatedItem);
  };

  const reorderChips = (fromIndex: number, toIndex: number) => {
    if (
      disabled ||
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= currentChips.length ||
      toIndex >= currentChips.length
    ) {
      return;
    }
    const next = [...currentChips];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setCurrentChips(next);
  };

  const handleDragStart = (
    event: DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    if (disabled || currentChips[index]?.disabled) {
      event.preventDefault();
      return;
    }
    setDraggedIndex(index);
    event.dataTransfer?.setData('text/plain', String(index));
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
    targetIndex: number,
  ) => {
    event.preventDefault();
    const rawFrom = event.dataTransfer?.getData('text/plain');
    const fromIndex =
      draggedIndex !== null
        ? draggedIndex
        : rawFrom !== undefined && rawFrom !== ''
          ? Number(rawFrom)
          : -1;
    setDraggedIndex(null);
    if (fromIndex >= 0 && !Number.isNaN(fromIndex)) {
      reorderChips(fromIndex, targetIndex);
    }
  };

  const handleChipKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    index: number,
  ) => {
    const target = currentChips[index];
    if (!target || disabled || target.disabled) {
      return;
    }
    if (
      (event.key === 'Backspace' || event.key === 'Delete') &&
      (target.removable ?? removable)
    ) {
      event.preventDefault();
      handleRemoveChip(index);
      return;
    }
    if (variant === 'draggable') {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        reorderChips(index, index - 1);
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        reorderChips(index, index + 1);
      }
    }
  };

  const buildChipSx = (isSelected: boolean) => ({
    height: metrics.height,
    fontSize: metrics.fontSize,
    borderRadius: '8px',
    fontWeight: 500,
    backgroundColor: isSelected ? intent.container : 'transparent',
    color: isSelected ? intent.onContainer : theme.palette.text.primary,
    border: `1px solid ${
      isSelected ? intent.main : theme.palette.divider
    }`,
    '&:hover': {
      backgroundColor: isSelected
        ? alpha(intent.container, 0.85)
        : alpha(intent.main, 0.08),
    },
    '& .MuiChip-deleteIcon': {
      color: isSelected ? intent.onContainer : theme.palette.text.secondary,
      fontSize: metrics.iconSize,
      '&:hover': {
        color: intent.main,
      },
    },
  });

  const renderChipLeading = (chip: ChipItem, isSelected: boolean) => {
    const showCheck =
      isSelectableMode && isSelected && !hideSelectionIndicator;

    if (showCheck) {
      return {
        avatar: undefined,
        icon: (
          <MagicIcon
            icon="check"
            size={size}
            testId={`chip-check-${resolveChipId(chip)}`}
          />
        ),
      };
    }

    if (chip.avatarSrc) {
      return {
        avatar: (
          <Avatar
            src={chip.avatarSrc}
            alt={chip.avatarAlt ?? chip.label}
            sx={{ width: metrics.iconSize + 4, height: metrics.iconSize + 4 }}
          />
        ),
        icon: undefined,
      };
    }

    if (chip.leadingIcon) {
      return {
        avatar: undefined,
        icon: <MagicIcon icon={chip.leadingIcon} size={size} />,
      };
    }

    if (variant === 'draggable') {
      return {
        avatar: undefined,
        icon: (
          <MagicIcon
            icon="drag_indicator"
            size={size}
            testId={`chip-drag-handle-${resolveChipId(chip)}`}
          />
        ),
      };
    }

    return { avatar: undefined, icon: undefined };
  };

  const containerRole =
    variant === 'selectable'
      ? 'listbox'
      : variant === 'input'
        ? 'grid'
        : 'group';

  return (
    <Box
      ref={ref}
      id={id}
      data-testid={testId}
      role={containerRole}
      aria-label={ariaLabel ?? label}
      aria-orientation={orientation}
      className={className}
      sx={[
        {
          display: 'flex',
          flexDirection: orientation === 'vertical' ? 'column' : 'row',
          flexWrap: orientation === 'horizontal' ? 'wrap' : 'nowrap',
          alignItems: orientation === 'vertical' ? 'flex-start' : 'center',
          gap: 1,
        },
        ...extraSx,
      ]}
    >
      {currentChips.length === 0 && variant === 'basic' ? (
        <MuiChip
          size={MUI_CHIP_SIZE_MAP[size]}
          color={color as ColorIntent}
          variant="outlined"
          disabled={disabled}
          clickable={false}
          label={children ?? label}
          sx={buildChipSx(false)}
        />
      ) : (
        currentChips.map((chip, index) => {
          const itemDisabled = disabled || Boolean(chip.disabled);
          const itemRemovable = chip.removable ?? removable;
          const itemSelected = Boolean(chip.selected);
          const { avatar, icon } = renderChipLeading(chip, itemSelected);

          if (variant === 'input' && editingIndex === index) {
            return (
              <InputBase
                key={`edit-${resolveChipId(chip)}-${index}`}
                autoFocus
                value={editingValue}
                size="small"
                inputProps={{
                  'aria-label': `Edit ${chip.label}`,
                  'data-testid': `chip-edit-input-${index}`,
                }}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitEditChip(index);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setEditingIndex(null);
                  }
                }}
                onBlur={() => commitEditChip(index)}
                sx={{
                  height: metrics.height,
                  fontSize: metrics.fontSize,
                  px: 1.5,
                  border: `1px solid ${intent.main}`,
                  borderRadius: '8px',
                }}
              />
            );
          }

          const isChipClickable = isSelectableMode || variant === 'draggable';

          return (
            <MuiChip
              key={`${resolveChipId(chip)}-${index}`}
              data-testid={`magic-chip-item-${index}`}
              role={variant === 'selectable' ? 'option' : undefined}
              aria-selected={
                variant === 'selectable' ? itemSelected : undefined
              }
              size={MUI_CHIP_SIZE_MAP[size]}
              color={color as ColorIntent}
              variant={itemSelected ? 'filled' : 'outlined'}
              disabled={itemDisabled}
              {...(isChipClickable ? { disableRipple } : {})}
              clickable={isChipClickable}
              draggable={variant === 'draggable' && !itemDisabled}
              avatar={avatar}
              icon={icon}
              label={chip.label}
              onClick={
                isSelectableMode ? () => handleToggleSelect(index) : undefined
              }
              onDoubleClick={
                variant === 'input' || editable || chip.editable
                  ? () => startEditingChip(index)
                  : undefined
              }
              onDelete={
                itemRemovable ? () => handleRemoveChip(index) : undefined
              }
              onKeyDown={(e) => handleChipKeyDown(e, index)}
              onDragStart={
                variant === 'draggable'
                  ? (e) => handleDragStart(e, index)
                  : undefined
              }
              onDragOver={variant === 'draggable' ? handleDragOver : undefined}
              onDrop={
                variant === 'draggable'
                  ? (e) => handleDrop(e, index)
                  : undefined
              }
              sx={buildChipSx(itemSelected)}
            />
          );
        })
      )}

      {variant === 'input' ? (
        <InputBase
          value={inputValue}
          placeholder={inputPlaceholder}
          disabled={disabled}
          inputProps={{
            'aria-label': inputPlaceholder,
            'data-testid': 'magic-chip-input',
          }}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          sx={{
            height: metrics.height,
            fontSize: metrics.fontSize,
            px: 1.5,
            minWidth: 120,
            border: `1px dashed ${theme.palette.divider}`,
            borderRadius: '8px',
          }}
        />
      ) : null}
    </Box>
  );
}
