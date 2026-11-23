<script lang="ts">
  import type {
    AtomicSize,
    ChipAtomProps,
    ChipItem,
    ColorIntent,
  } from '@mono-magic/atomic-design-interfaces';
  import { cn, getColorIntentClasses } from '../../theme';

  export interface MagicChipProps extends ChipAtomProps {
    onremove?: (chip: ChipItem, index: number) => void;
    onadd?: (chip: ChipItem) => void;
    onselect?: (selected: readonly ChipItem[]) => void;
    onedit?: (chip: ChipItem, index: number) => void;
    onreorder?: (chips: readonly ChipItem[]) => void;
    onchange?: (chips: readonly ChipItem[]) => void;
  }

  let {
    id,
    testId = 'magic-chip',
    ariaLabel,
    disabled = false,
    chips,
    label,
    variant = 'basic',
    color = 'primary',
    size = 'md',
    removable = false,
    editable = false,
    selectable = false,
    multiple = false,
    hideSelectionIndicator = false,
    orientation = 'horizontal',
    disableRipple = false,
    inputPlaceholder = 'Add chip...',
    onremove,
    onadd,
    onselect,
    onedit,
    onreorder,
    onchange,
  }: MagicChipProps = $props();

  const CHIP_SIZE_CLASSES: Readonly<Record<AtomicSize, string>> = {
    xs: 'px-2 py-0.5 text-xs gap-1',
    sm: 'px-2.5 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-3.5 py-1.5 text-base gap-2',
    xl: 'px-4 py-2 text-lg gap-2',
  };

  let internalChips = $state<ChipItem[]>([]);
  let draftInput = $state('');
  let editingIndex = $state<number | null>(null);
  let editingValue = $state('');
  let draggedIndex = $state<number | null>(null);

  $effect(() => {
    if (chips) {
      internalChips = chips.map((c) => ({ ...c }));
    } else if (label !== undefined) {
      internalChips = [{ id: 'single', label }];
    } else {
      internalChips = [];
    }
  });

  const colorClasses = $derived(getColorIntentClasses(color as ColorIntent));
  const sizeClass = $derived(CHIP_SIZE_CLASSES[size as AtomicSize]);
  const isSelectableGroup = $derived(selectable || variant === 'selectable');
  const isInputGroup = $derived(variant === 'input');
  const isDraggableGroup = $derived(variant === 'draggable');

  function handleChipClick(index: number): void {
    const chip = internalChips[index];
    if (!chip || disabled || chip.disabled) return;
    if (!(chip.selectable ?? isSelectableGroup)) return;

    const updated = internalChips.map((item, idx) => {
      if (idx === index) {
        return { ...item, selected: !item.selected };
      }
      if (!multiple) {
        return { ...item, selected: false };
      }
      return item;
    });

    internalChips = updated;
    onselect?.(updated.filter((item) => item.selected));
    onchange?.(updated);
  }

  function handleRemove(event: MouseEvent, index: number): void {
    event.stopPropagation();
    const chip = internalChips[index];
    if (!chip || disabled || chip.disabled) return;

    const updated = internalChips.filter((_, idx) => idx !== index);
    internalChips = updated;
    onremove?.(chip, index);
    onchange?.(updated);
  }

  function startEdit(index: number): void {
    const chip = internalChips[index];
    if (!chip || disabled || chip.disabled) return;
    if (!(chip.editable ?? editable)) return;
    editingIndex = index;
    editingValue = chip.label;
  }

  function commitEdit(index: number): void {
    const trimmed = editingValue.trim();
    const current = internalChips[index];
    editingIndex = null;
    if (!current || !trimmed || trimmed === current.label) return;

    const updatedChip: ChipItem = { ...current, label: trimmed };
    const updated = internalChips.map((item, idx) =>
      idx === index ? updatedChip : item,
    );
    internalChips = updated;
    onedit?.(updatedChip, index);
    onchange?.(updated);
  }

  function handleInputKeydown(event: KeyboardEvent): void {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const trimmed = draftInput.trim().replace(/,$/, '').trim();
      if (!trimmed) return;
      const newChip: ChipItem = {
        id: `chip-${Date.now()}-${internalChips.length}`,
        label: trimmed,
        removable: true,
      };
      const updated = [...internalChips, newChip];
      internalChips = updated;
      draftInput = '';
      onadd?.(newChip);
      onchange?.(updated);
    }
  }

  function handleDragStart(index: number): void {
    if (!isDraggableGroup || disabled) return;
    draggedIndex = index;
  }

  function handleDrop(targetIndex: number): void {
    if (!isDraggableGroup || disabled || draggedIndex === null || draggedIndex === targetIndex) {
      draggedIndex = null;
      return;
    }
    const next = [...internalChips];
    const [moved] = next.splice(draggedIndex, 1);
    next.splice(targetIndex, 0, moved);
    internalChips = next;
    draggedIndex = null;
    onreorder?.(next);
    onchange?.(next);
  }
</script>

<div
  {id}
  role={isSelectableGroup ? 'listbox' : 'list'}
  aria-label={ariaLabel ?? 'Chips'}
  aria-multiselectable={isSelectableGroup && multiple ? 'true' : undefined}
  data-testid={testId}
  data-variant={variant}
  data-orientation={orientation}
  data-disable-ripple={disableRipple ? 'true' : undefined}
  class={cn(
    'flex flex-wrap gap-2',
    orientation === 'vertical' ? 'flex-col items-start' : 'flex-row items-center',
    disabled && 'opacity-50 pointer-events-none',
  )}
>
  {#each internalChips as chip, index (chip.id ?? `${chip.label}-${index}`)}
    {@const chipDisabled = Boolean(disabled || chip.disabled)}
    {@const chipRemovable = Boolean(chip.removable ?? (removable || isInputGroup))}
    {@const chipSelectable = Boolean(chip.selectable ?? isSelectableGroup)}
    {@const chipEditable = Boolean(chip.editable ?? editable)}
    <div
      role={chipSelectable ? 'option' : 'listitem'}
      aria-selected={chipSelectable ? Boolean(chip.selected) : undefined}
      aria-disabled={chipDisabled ? 'true' : undefined}
      tabindex={chipDisabled ? -1 : 0}
      draggable={isDraggableGroup && !chipDisabled}
      data-testid={`${testId}-item-${index}`}
      onclick={() => handleChipClick(index)}
      ondblclick={() => startEdit(index)}
      onkeydown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          if (chipSelectable) {
            event.preventDefault();
            handleChipClick(index);
          } else if (chipEditable) {
            event.preventDefault();
            startEdit(index);
          }
        }
      }}
      ondragstart={() => handleDragStart(index)}
      ondragover={(event) => {
        if (isDraggableGroup) event.preventDefault();
      }}
      ondrop={() => handleDrop(index)}
      class={cn(
        'inline-flex items-center rounded-full font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        sizeClass,
        colorClasses.ring,
        chip.selected ? colorClasses.solid : colorClasses.soft,
        chipSelectable && !chipDisabled && 'cursor-pointer',
        isDraggableGroup && !chipDisabled && 'cursor-grab active:cursor-grabbing',
        chipDisabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {#if chip.avatarSrc}
        <img
          src={chip.avatarSrc}
          alt={chip.avatarAlt ?? chip.label}
          class="h-5 w-5 rounded-full object-cover"
        />
      {:else if chip.selected && !hideSelectionIndicator}
        <span aria-hidden="true" data-testid={`${testId}-check-${index}`}>✓</span>
      {:else if chip.leadingIcon}
        <span aria-hidden="true">{chip.leadingIcon}</span>
      {/if}

      {#if editingIndex === index}
        <input
          type="text"
          bind:value={editingValue}
          aria-label={`Edit ${chip.label}`}
          data-testid={`${testId}-edit-${index}`}
          onblur={() => commitEdit(index)}
          onkeydown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commitEdit(index);
            } else if (event.key === 'Escape') {
              editingIndex = null;
            }
          }}
          class="w-24 rounded bg-white px-1 text-slate-900 outline-none"
        />
      {:else}
        <span>{chip.label}</span>
      {/if}

      {#if chipRemovable && !chipDisabled}
        <button
          type="button"
          aria-label={`Remove ${chip.label}`}
          data-testid={`${testId}-remove-${index}`}
          onclick={(event) => handleRemove(event, index)}
          class="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current"
        >
          ×
        </button>
      {/if}
    </div>
  {/each}

  {#if isInputGroup}
    <input
      type="text"
      bind:value={draftInput}
      placeholder={inputPlaceholder}
      {disabled}
      aria-label={inputPlaceholder}
      data-testid={`${testId}-input`}
      onkeydown={handleInputKeydown}
      class="min-w-32 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:border-magic-primary focus:outline-none focus:ring-2 focus:ring-magic-primary/30"
    />
  {/if}
</div>
