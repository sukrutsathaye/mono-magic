<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type {
  ToolTipAtomProps,
  ToolTipPosition,
} from '@mono-magic/atomic-design-interfaces';

export interface MagicToolTipProps extends ToolTipAtomProps {
  /** Controlled open visibility state (`v-model`). */
  modelValue?: boolean;
}

const props = withDefaults(defineProps<MagicToolTipProps>(), {
  label: 'Hover me',
  position: 'above',
  showDelay: 0,
  hideDelay: 0,
  touchGestures: 'auto',
  disabled: false,
  modelValue: undefined,
  id: undefined,
  testId: undefined,
  ariaLabel: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [open: boolean];
  open: [];
  close: [];
}>();

const LOCATION_MAP: Readonly<
  Record<ToolTipPosition, 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end'>
> = {
  above: 'top',
  below: 'bottom',
  left: 'left',
  right: 'right',
  before: 'start',
  after: 'end',
};

const internalOpen = ref<boolean>(Boolean(props.modelValue));

watch(
  () => props.modelValue,
  (next) => {
    if (next !== undefined) {
      internalOpen.value = next;
    }
  },
);

const isSuppressed = computed(() => props.disabled || !props.message);

const isOpen = computed<boolean>({
  get() {
    if (isSuppressed.value) {
      return false;
    }
    return props.modelValue !== undefined ? props.modelValue : internalOpen.value;
  },
  set(next: boolean) {
    const resolved = isSuppressed.value ? false : next;
    const prev = isOpen.value;
    internalOpen.value = resolved;
    emit('update:modelValue', resolved);
    if (resolved && !prev) {
      emit('open');
    } else if (!resolved && prev) {
      emit('close');
    }
  },
});

const tooltipLocation = computed(() => LOCATION_MAP[props.position]);
const openOnClick = computed(() => props.touchGestures === 'on');
const openOnHover = computed(() => props.touchGestures !== 'off');
</script>

<template>
  <span
    :id="id"
    :data-testid="testId"
    :data-position="position"
    :data-touch-gestures="touchGestures"
    :data-disabled="disabled ? 'true' : undefined"
    class="d-inline-flex align-center"
  >
    <v-tooltip
      v-model="isOpen"
      :text="message"
      :location="tooltipLocation"
      :open-delay="showDelay"
      :close-delay="hideDelay"
      :disabled="isSuppressed"
      :open-on-hover="openOnHover"
      :open-on-click="openOnClick"
    >
      <template #activator="{ props: activatorProps }">
        <span
          v-bind="activatorProps"
          :data-testid="testId ? `${testId}-trigger` : undefined"
          class="d-inline-flex align-center"
        >
          <slot>
            <v-btn
              variant="outlined"
              :disabled="disabled"
              :aria-label="ariaLabel ?? label"
            >
              {{ label }}
            </v-btn>
          </slot>
        </span>
      </template>
    </v-tooltip>
  </span>
</template>
