<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type {
  ChipAtomProps,
  ChipItem,
} from '@mono-magic/atomic-design-interfaces';
import {
  mapAtomicSizeToVuetify,
  mapColorIntentToVuetify,
  normalizeMdiIcon,
} from '../../theme';

export type MagicChipProps = ChipAtomProps;

const props = withDefaults(defineProps<MagicChipProps>(), {
  chips: undefined,
  label: undefined,
  variant: 'basic',
  color: 'primary',
  size: 'md',
  removable: false,
  editable: false,
  selectable: false,
  multiple: false,
  hideSelectionIndicator: false,
  orientation: 'horizontal',
  disableRipple: false,
  inputPlaceholder: 'Add item...',
  disabled: false,
  id: undefined,
  testId: undefined,
  ariaLabel: undefined,
});

const emit = defineEmits<{
  select: [selectedLabels: string[]];
  remove: [chip: ChipItem, index: number];
  add: [label: string];
  edit: [chip: ChipItem, newLabel: string, index: number];
  reorder: [chips: ChipItem[]];
  click: [chip: ChipItem];
}>();

const internalChips = ref<ChipItem[]>(
  props.chips ? props.chips.map((c) => ({ ...c })) : [],
);

watch(
  () => props.chips,
  (next) => {
    internalChips.value = next ? next.map((c) => ({ ...c })) : [];
  },
  { deep: true },
);

const newChipInput = ref('');
const draggedIndex = ref<number | null>(null);

const isGroupMode = computed(() => props.chips !== undefined);
const isSelectable = computed(
  () => props.selectable || props.variant === 'selectable',
);
const isInputMode = computed(() => props.variant === 'input');
const isDraggable = computed(() => props.variant === 'draggable');

const selectedIndices = ref<number | number[] | undefined>(
  computeInitialSelection(internalChips.value),
);

function computeInitialSelection(items: readonly ChipItem[]): number | number[] | undefined {
  const indices = items
    .map((item, idx) => (item.selected ? idx : -1))
    .filter((idx) => idx >= 0);
  if (props.multiple) {
    return indices;
  }
  return indices[0];
}

watch(
  () => props.chips,
  (next) => {
    if (next) {
      selectedIndices.value = computeInitialSelection(next);
    }
  },
);

const vuetifyColor = computed(() => mapColorIntentToVuetify(props.color));
const vuetifySize = computed(() => mapAtomicSizeToVuetify(props.size));

function handleSelectionChange(next: number | number[] | undefined): void {
  selectedIndices.value = next;
  const indices = Array.isArray(next)
    ? next
    : next !== undefined
      ? [next]
      : [];
  const selectedLabels = indices
    .map((idx) => internalChips.value[idx]?.label)
    .filter((lbl): lbl is string => Boolean(lbl));
  emit('select', selectedLabels);
}

function handleRemove(chip: ChipItem, index: number): void {
  if (props.disabled || chip.disabled) {
    return;
  }
  internalChips.value = internalChips.value.filter((_, idx) => idx !== index);
  emit('remove', chip, index);
}

function handleAddChip(): void {
  const trimmed = newChipInput.value.trim();
  if (!trimmed || props.disabled) {
    return;
  }
  internalChips.value = [
    ...internalChips.value,
    { id: `chip-${Date.now()}`, label: trimmed, removable: true },
  ];
  emit('add', trimmed);
  newChipInput.value = '';
}

function handleDragStart(index: number): void {
  if (!isDraggable.value || props.disabled) {
    return;
  }
  draggedIndex.value = index;
}

function handleDrop(targetIndex: number): void {
  if (
    !isDraggable.value ||
    props.disabled ||
    draggedIndex.value === null ||
    draggedIndex.value === targetIndex
  ) {
    return;
  }
  const copy = [...internalChips.value];
  const [moved] = copy.splice(draggedIndex.value, 1);
  copy.splice(targetIndex, 0, moved);
  internalChips.value = copy;
  draggedIndex.value = null;
  emit('reorder', copy);
}
</script>

<template>
  <div
    v-if="isGroupMode"
    :id="id"
    :data-testid="testId"
    :aria-label="ariaLabel"
    class="magic-chip-container"
  >
    <v-chip-group
      v-if="isSelectable"
      :model-value="selectedIndices"
      :multiple="multiple"
      :filter="!hideSelectionIndicator"
      :column="orientation === 'vertical'"
      :disabled="disabled"
      :color="vuetifyColor"
      @update:model-value="handleSelectionChange"
    >
      <v-chip
        v-for="(chip, idx) in internalChips"
        :key="chip.id ?? `${chip.label}-${idx}`"
        :value="idx"
        :color="vuetifyColor"
        :size="vuetifySize"
        :closable="removable || chip.removable"
        :disabled="disabled || chip.disabled"
        :ripple="!disableRipple"
        :prepend-icon="normalizeMdiIcon(chip.leadingIcon)"
        @click="emit('click', chip)"
        @click:close="handleRemove(chip, idx)"
      >
        <template v-if="chip.avatarSrc" #prepend>
          <v-avatar start>
            <v-img :src="chip.avatarSrc" :alt="chip.avatarAlt ?? chip.label" />
          </v-avatar>
        </template>
        {{ chip.label }}
      </v-chip>
    </v-chip-group>

    <div
      v-else
      class="d-flex ga-2 flex-wrap align-center"
      :class="{ 'flex-column align-start': orientation === 'vertical' }"
    >
      <v-chip
        v-for="(chip, idx) in internalChips"
        :key="chip.id ?? `${chip.label}-${idx}`"
        :color="vuetifyColor"
        :size="vuetifySize"
        :closable="removable || chip.removable"
        :disabled="disabled || chip.disabled"
        :ripple="!disableRipple"
        :prepend-icon="normalizeMdiIcon(chip.leadingIcon)"
        :draggable="isDraggable && !disabled && !chip.disabled"
        @click="emit('click', chip)"
        @click:close="handleRemove(chip, idx)"
        @dragstart="handleDragStart(idx)"
        @dragover.prevent
        @drop="handleDrop(idx)"
      >
        <template v-if="chip.avatarSrc" #prepend>
          <v-avatar start>
            <v-img :src="chip.avatarSrc" :alt="chip.avatarAlt ?? chip.label" />
          </v-avatar>
        </template>
        {{ chip.label }}
      </v-chip>

      <input
        v-if="isInputMode"
        v-model="newChipInput"
        type="text"
        :placeholder="inputPlaceholder"
        :disabled="disabled"
        aria-label="Add chip"
        class="magic-chip-input text-body-2 pa-1"
        @keydown.enter.prevent="handleAddChip"
      />
    </div>
  </div>

  <v-chip
    v-else
    :id="id"
    :data-testid="testId"
    :aria-label="ariaLabel ?? label"
    :color="vuetifyColor"
    :size="vuetifySize"
    :closable="removable"
    :disabled="disabled"
    :ripple="!disableRipple"
    @click="label ? emit('click', { label }) : undefined"
    @click:close="label ? emit('remove', { label }, 0) : undefined"
  >
    <slot>{{ label }}</slot>
  </v-chip>
</template>

<style scoped>
.magic-chip-input {
  border: 1px solid rgba(0, 0, 0, 0.23);
  border-radius: 16px;
  min-width: 140px;
  outline: none;
}
</style>
