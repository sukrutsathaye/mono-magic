<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ButtonToggleAtomProps } from '@mono-magic/atomic-design-interfaces';
import {
  mapAtomicSizeToDensity,
  mapAtomicSizeToVuetify,
  mapColorIntentToVuetify,
  normalizeMdiIcon,
} from '../../theme';

export interface MagicButtonToggleProps extends ButtonToggleAtomProps<string> {
  /** Vue v-model binding alias for `value`. */
  modelValue?: string | readonly string[];
}

const props = withDefaults(defineProps<MagicButtonToggleProps>(), {
  value: undefined,
  modelValue: undefined,
  selectionMode: 'single',
  vertical: false,
  appearance: 'standard',
  hideSelectionIndicator: false,
  disabled: false,
  disabledInteractive: false,
  size: 'md',
  color: 'primary',
  name: undefined,
  required: false,
  id: undefined,
  testId: undefined,
  ariaLabel: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | string[] | undefined];
  change: [value: string | string[] | undefined];
}>();

function normalizeSelection(
  raw: string | readonly string[] | undefined,
): string | string[] | undefined {
  if (props.selectionMode === 'multiple') {
    if (Array.isArray(raw)) {
      return [...raw];
    }
    return raw !== undefined ? [String(raw)] : [];
  }
  if (Array.isArray(raw)) {
    return raw[0];
  }
  return raw as string | undefined;
}

const internalValue = ref<string | string[] | undefined>(
  normalizeSelection(props.modelValue ?? props.value),
);

watch(
  () => props.modelValue ?? props.value,
  (next) => {
    if (next !== undefined) {
      internalValue.value = normalizeSelection(next);
    }
  },
);

const isControlled = computed(
  () => props.modelValue !== undefined || props.value !== undefined,
);

const currentSelection = computed<string | string[] | undefined>({
  get() {
    return isControlled.value
      ? normalizeSelection(props.modelValue ?? props.value)
      : internalValue.value;
  },
  set(next) {
    if (props.disabled) {
      return;
    }
    const normalized = normalizeSelection(next);
    internalValue.value = normalized;
    emit('update:modelValue', normalized);
    emit('change', normalized);
  },
});

const vuetifyColor = computed(() => mapColorIntentToVuetify(props.color));
const vuetifyDensity = computed(() => mapAtomicSizeToDensity(props.size));
const vuetifySize = computed(() => mapAtomicSizeToVuetify(props.size));
const vuetifyVariant = computed(() =>
  props.appearance === 'legacy' ? 'elevated' : 'outlined',
);
const nativeDisabled = computed(
  () => props.disabled && !props.disabledInteractive,
);

function isOptionSelected(optionValue: string): boolean {
  const sel = currentSelection.value;
  if (Array.isArray(sel)) {
    return sel.includes(optionValue);
  }
  return sel === optionValue;
}
</script>

<template>
  <v-btn-toggle
    :id="id"
    v-model="currentSelection"
    :data-testid="testId"
    :aria-label="ariaLabel ?? name"
    :aria-disabled="disabled && disabledInteractive ? 'true' : undefined"
    :multiple="selectionMode === 'multiple'"
    :mandatory="required"
    :disabled="nativeDisabled"
    :color="vuetifyColor"
    :density="vuetifyDensity"
    :variant="vuetifyVariant"
    divided
    :class="[
      {
        'flex-column h-auto': vertical,
        'opacity-60': disabled && disabledInteractive,
      },
    ]"
  >
    <v-btn
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :size="vuetifySize"
      :disabled="nativeDisabled || option.disabled"
      :aria-label="option.ariaLabel ?? option.label"
      :prepend-icon="
        !hideSelectionIndicator && isOptionSelected(option.value)
          ? 'mdi-check'
          : normalizeMdiIcon(option.icon)
      "
    >
      {{ option.label }}
    </v-btn>
  </v-btn-toggle>
</template>
