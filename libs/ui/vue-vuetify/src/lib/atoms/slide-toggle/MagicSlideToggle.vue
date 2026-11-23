<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { SlideToggleAtomProps } from '@mono-magic/atomic-design-interfaces';
import {
  mapAtomicSizeToDensity,
  mapColorIntentToVuetify,
} from '../../theme';

export interface MagicSlideToggleProps extends SlideToggleAtomProps {
  /** Vue v-model binding alias for `checked`. */
  modelValue?: boolean;
}

const props = withDefaults(defineProps<MagicSlideToggleProps>(), {
  label: undefined,
  checked: undefined,
  modelValue: undefined,
  required: false,
  hideIcon: false,
  labelPosition: 'after',
  disableRipple: false,
  disabled: false,
  disabledInteractive: false,
  color: 'primary',
  size: 'md',
  name: undefined,
  id: undefined,
  testId: undefined,
  ariaLabel: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [checked: boolean];
  change: [checked: boolean];
}>();

const internalChecked = ref<boolean>(
  Boolean(props.modelValue ?? props.checked ?? false),
);

watch(
  () => props.modelValue ?? props.checked,
  (next) => {
    if (next !== undefined) {
      internalChecked.value = next;
    }
  },
);

const isControlled = computed(
  () => props.modelValue !== undefined || props.checked !== undefined,
);

const isChecked = computed<boolean>({
  get() {
    return isControlled.value
      ? Boolean(props.modelValue ?? props.checked)
      : internalChecked.value;
  },
  set(next) {
    if (props.disabled) {
      return;
    }
    internalChecked.value = next;
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
  <v-switch
    :id="id"
    v-model="isChecked"
    :data-testid="testId"
    :label="label"
    :name="name"
    :required="required"
    :color="vuetifyColor"
    :density="vuetifyDensity"
    :disabled="nativeDisabled"
    :aria-disabled="ariaDisabled"
    :aria-label="ariaLabel ?? label"
    :ripple="!disableRipple"
    :true-icon="hideIcon ? undefined : 'mdi-check'"
    :false-icon="hideIcon ? undefined : 'mdi-close'"
    inset
    hide-details
    :class="{
      'magic-switch--label-before': labelPosition === 'before',
      'opacity-60': disabled && disabledInteractive,
    }"
  />
</template>

<style scoped>
.magic-switch--label-before :deep(.v-selection-control) {
  flex-direction: row-reverse;
  justify-content: flex-end;
}
</style>
