<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type {
  AtomicSize,
  SliderAtomProps,
} from '@mono-magic/atomic-design-interfaces';
import { mapColorIntentToVuetify } from '../../theme';

export interface MagicSliderProps extends SliderAtomProps {
  /** Vue v-model binding alias for `value` (or `[startValue, endValue]` in range mode). */
  modelValue?: number | readonly [number, number];
}

const props = withDefaults(defineProps<MagicSliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  value: undefined,
  modelValue: undefined,
  range: false,
  startValue: undefined,
  endValue: undefined,
  discrete: false,
  showTickMarks: false,
  disableRipple: false,
  disabled: false,
  color: 'primary',
  size: 'md',
  displayWith: undefined,
  id: undefined,
  testId: undefined,
  ariaLabel: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: number | [number, number]];
  change: [value: number | [number, number]];
}>();

const TRACK_SIZE_MAP: Readonly<Record<AtomicSize, number>> = {
  xs: 2,
  sm: 3,
  md: 4,
  lg: 6,
  xl: 8,
};

const THUMB_SIZE_MAP: Readonly<Record<AtomicSize, number>> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
};

function initialSingleValue(): number {
  if (typeof props.modelValue === 'number') {
    return props.modelValue;
  }
  return props.value ?? props.min;
}

function initialRangeValue(): [number, number] {
  if (Array.isArray(props.modelValue) && props.modelValue.length === 2) {
    return [props.modelValue[0], props.modelValue[1]];
  }
  return [props.startValue ?? props.min, props.endValue ?? props.max];
}

const internalSingle = ref<number>(initialSingleValue());
const internalRange = ref<[number, number]>(initialRangeValue());

watch(
  () => [props.modelValue, props.value, props.startValue, props.endValue],
  () => {
    if (props.range) {
      if (
        Array.isArray(props.modelValue) ||
        props.startValue !== undefined ||
        props.endValue !== undefined
      ) {
        internalRange.value = initialRangeValue();
      }
    } else if (
      typeof props.modelValue === 'number' ||
      props.value !== undefined
    ) {
      internalSingle.value = initialSingleValue();
    }
  },
);

const singleModel = computed<number>({
  get() {
    if (typeof props.modelValue === 'number') {
      return props.modelValue;
    }
    if (props.value !== undefined) {
      return props.value;
    }
    return internalSingle.value;
  },
  set(next) {
    if (props.disabled) {
      return;
    }
    internalSingle.value = next;
    emit('update:modelValue', next);
    emit('change', next);
  },
});

const rangeModel = computed<[number, number]>({
  get(): [number, number] {
    if (Array.isArray(props.modelValue) && props.modelValue.length === 2) {
      return [props.modelValue[0], props.modelValue[1]];
    }
    if (props.startValue !== undefined || props.endValue !== undefined) {
      return [
        props.startValue ?? internalRange.value[0],
        props.endValue ?? internalRange.value[1],
      ];
    }
    return internalRange.value;
  },
  set(next: [number, number]) {
    if (props.disabled) {
      return;
    }
    const pair: [number, number] = [next[0], next[1]];
    internalRange.value = pair;
    emit('update:modelValue', pair);
    emit('change', pair);
  },
});

const vuetifyColor = computed(() => mapColorIntentToVuetify(props.color));
const trackSize = computed(() => TRACK_SIZE_MAP[props.size]);
const thumbSize = computed(() => THUMB_SIZE_MAP[props.size]);

function formatThumb(val: number): string {
  return props.displayWith ? props.displayWith(val) : String(val);
}
</script>

<template>
  <v-range-slider
    v-if="range"
    :id="id"
    v-model="rangeModel"
    :data-testid="testId"
    :aria-label="ariaLabel ?? 'Range slider'"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :color="vuetifyColor"
    :track-size="trackSize"
    :thumb-size="thumbSize"
    :thumb-label="discrete ? 'always' : false"
    :show-ticks="showTickMarks ? 'always' : false"
    :ripple="!disableRipple"
    hide-details
  >
    <template #thumb-label="{ modelValue: thumbVal }">
      {{ formatThumb(Number(thumbVal)) }}
    </template>
  </v-range-slider>

  <v-slider
    v-else
    :id="id"
    v-model="singleModel"
    :data-testid="testId"
    :aria-label="ariaLabel ?? 'Slider'"
    :min="min"
    :max="max"
    :step="step"
    :disabled="disabled"
    :color="vuetifyColor"
    :track-size="trackSize"
    :thumb-size="thumbSize"
    :thumb-label="discrete ? 'always' : false"
    :show-ticks="showTickMarks ? 'always' : false"
    :ripple="!disableRipple"
    hide-details
  >
    <template #thumb-label="{ modelValue: thumbVal }">
      {{ formatThumb(Number(thumbVal)) }}
    </template>
  </v-slider>
</template>
