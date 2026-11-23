<script setup lang="ts">
import { computed } from 'vue';
import type {
  AtomicSize,
  ProgressIndicatorAtomProps,
} from '@mono-magic/atomic-design-interfaces';
import { mapColorIntentToVuetify } from '../../theme';

export type MagicProgressIndicatorProps = ProgressIndicatorAtomProps;

const props = withDefaults(defineProps<MagicProgressIndicatorProps>(), {
  type: 'bar',
  mode: 'determinate',
  value: 0,
  bufferValue: 100,
  diameter: undefined,
  strokeWidth: undefined,
  color: 'primary',
  size: 'md',
  disabled: false,
  id: undefined,
  testId: undefined,
  ariaLabel: undefined,
});

const BAR_HEIGHT_MAP: Readonly<Record<AtomicSize, number>> = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
};

const SPINNER_SIZE_MAP: Readonly<Record<AtomicSize, number>> = {
  xs: 20,
  sm: 28,
  md: 40,
  lg: 56,
  xl: 72,
};

function clampPercent(val: number): number {
  return Math.max(0, Math.min(100, val));
}

const clampedValue = computed(() => clampPercent(props.value));
const clampedBuffer = computed(() => clampPercent(props.bufferValue));
const isIndeterminate = computed(
  () => props.mode === 'indeterminate' || props.mode === 'query',
);
const vuetifyColor = computed(() => mapColorIntentToVuetify(props.color));
const barHeight = computed(
  () => props.strokeWidth ?? BAR_HEIGHT_MAP[props.size],
);
const spinnerDiameter = computed(
  () => props.diameter ?? SPINNER_SIZE_MAP[props.size],
);
const spinnerWidth = computed(() => props.strokeWidth ?? 4);
const accessibleLabel = computed(() => props.ariaLabel ?? 'Progress indicator');
</script>

<template>
  <v-progress-circular
    v-if="type === 'spinner'"
    :id="id"
    :data-testid="testId"
    role="progressbar"
    :aria-label="accessibleLabel"
    :aria-valuenow="isIndeterminate ? undefined : clampedValue"
    aria-valuemin="0"
    aria-valuemax="100"
    :model-value="clampedValue"
    :indeterminate="isIndeterminate"
    :color="vuetifyColor"
    :size="spinnerDiameter"
    :width="spinnerWidth"
    :class="{ 'opacity-50': disabled }"
  />

  <v-progress-linear
    v-else
    :id="id"
    :data-testid="testId"
    role="progressbar"
    :aria-label="accessibleLabel"
    :aria-valuenow="isIndeterminate ? undefined : clampedValue"
    aria-valuemin="0"
    aria-valuemax="100"
    :model-value="clampedValue"
    :buffer-value="mode === 'buffer' ? clampedBuffer : undefined"
    :indeterminate="isIndeterminate"
    :reverse="mode === 'query'"
    :stream="mode === 'buffer'"
    :color="vuetifyColor"
    :height="barHeight"
    rounded
    :class="{ 'opacity-50': disabled }"
  />
</template>
