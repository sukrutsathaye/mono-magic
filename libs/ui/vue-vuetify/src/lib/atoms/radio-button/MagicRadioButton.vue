<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { RadioButtonAtomProps } from '@mono-magic/atomic-design-interfaces';
import {
  mapAtomicSizeToDensity,
  mapColorIntentToVuetify,
} from '../../theme';

export interface MagicRadioButtonProps extends RadioButtonAtomProps<string> {
  /** Vue v-model binding alias for `value`. */
  modelValue?: string;
}

const props = withDefaults(defineProps<MagicRadioButtonProps>(), {
  value: undefined,
  modelValue: undefined,
  name: undefined,
  labelPosition: 'after',
  required: false,
  disabled: false,
  disabledInteractive: false,
  disableRipple: false,
  vertical: true,
  color: 'primary',
  size: 'md',
  id: undefined,
  testId: undefined,
  ariaLabel: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string];
}>();

const internalValue = ref<string | undefined>(props.modelValue ?? props.value);

watch(
  () => props.modelValue ?? props.value,
  (next) => {
    if (next !== undefined) {
      internalValue.value = next;
    }
  },
);

const isControlled = computed(
  () => props.modelValue !== undefined || props.value !== undefined,
);

const currentValue = computed<string | undefined>({
  get() {
    return isControlled.value
      ? (props.modelValue ?? props.value)
      : internalValue.value;
  },
  set(next) {
    if (props.disabled || next === undefined) {
      return;
    }
    internalValue.value = next;
    emit('update:modelValue', next);
    emit('change', next);
  },
});

const vuetifyColor = computed(() => mapColorIntentToVuetify(props.color));
const vuetifyDensity = computed(() => mapAtomicSizeToDensity(props.size));
const nativeDisabled = computed(
  () => props.disabled && !props.disabledInteractive,
);
const ariaDisabled = computed(() =>
  props.disabled && props.disabledInteractive ? 'true' : undefined,
);
</script>

<template>
  <v-radio-group
    :id="id"
    v-model="currentValue"
    :data-testid="testId"
    :aria-label="ariaLabel ?? name"
    :aria-disabled="ariaDisabled"
    :name="name"
    :inline="!vertical"
    :color="vuetifyColor"
    :density="vuetifyDensity"
    :disabled="nativeDisabled"
    hide-details
    :class="{ 'opacity-60': disabled && disabledInteractive }"
  >
    <v-radio
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
      :disabled="nativeDisabled || Boolean(option.disabled)"
      :ripple="!disableRipple"
      :color="vuetifyColor"
      :class="{
        'magic-radio--label-before':
          (option.labelPosition ?? labelPosition) === 'before',
      }"
    />
  </v-radio-group>
</template>

<style scoped>
.magic-radio--label-before :deep(.v-selection-control__wrapper) {
  order: 2;
}
</style>
