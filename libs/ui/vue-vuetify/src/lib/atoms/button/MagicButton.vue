<script setup lang="ts">
import { computed } from 'vue';
import type {
  ButtonAtomProps,
  ButtonShape,
  ButtonType,
  ButtonVariant,
} from '@mono-magic/atomic-design-interfaces';
import {
  mapAtomicSizeToVuetify,
  mapColorIntentToVuetify,
  normalizeMdiIcon,
} from '../../theme';

export interface MagicButtonProps extends ButtonAtomProps {
  /** Native button type attribute. Defaults to `button`. */
  type?: ButtonType;
}

const props = withDefaults(defineProps<MagicButtonProps>(), {
  variant: 'filled',
  color: 'primary',
  size: 'md',
  loading: false,
  fullWidth: false,
  leadingIcon: undefined,
  trailingIcon: undefined,
  kind: 'default',
  shape: 'default',
  disabled: false,
  disabledInteractive: false,
  disableRipple: false,
  type: 'button',
  id: undefined,
  testId: undefined,
  ariaLabel: undefined,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const VARIANT_MAP: Readonly<
  Record<ButtonVariant, 'flat' | 'tonal' | 'outlined' | 'elevated' | 'text'>
> = {
  filled: 'flat',
  tonal: 'tonal',
  outlined: 'outlined',
  elevated: 'elevated',
  text: 'text',
};

const SHAPE_MAP: Readonly<Record<ButtonShape, string | undefined>> = {
  default: undefined,
  square: '0',
  rounded: 'lg',
  pill: 'pill',
};

const vuetifyVariant = computed(() => VARIANT_MAP[props.variant]);
const vuetifyColor = computed(() => mapColorIntentToVuetify(props.color));
const isIconOnly = computed(
  () =>
    props.kind === 'icon' || props.kind === 'fab' || props.kind === 'mini-fab',
);
const isFab = computed(
  () =>
    props.kind === 'fab' ||
    props.kind === 'mini-fab' ||
    props.kind === 'extended-fab',
);

const vuetifySize = computed(() => {
  if (props.kind === 'mini-fab') {
    return 'small';
  }
  if (props.kind === 'fab' && props.size === 'md') {
    return 'large';
  }
  return mapAtomicSizeToVuetify(props.size);
});

const vuetifyRounded = computed(() => {
  if (props.shape !== 'default') {
    return SHAPE_MAP[props.shape];
  }
  if (props.kind === 'extended-fab') {
    return 'pill';
  }
  return undefined;
});

const prependIcon = computed(() =>
  isIconOnly.value ? undefined : normalizeMdiIcon(props.leadingIcon),
);
const appendIcon = computed(() =>
  isIconOnly.value ? undefined : normalizeMdiIcon(props.trailingIcon),
);
const soloIcon = computed(() =>
  normalizeMdiIcon(props.leadingIcon ?? props.trailingIcon ?? 'plus'),
);

const nativeDisabled = computed(
  () => props.disabled && !props.disabledInteractive,
);
const ariaDisabled = computed(() =>
  props.disabled && props.disabledInteractive ? 'true' : undefined,
);
const accessibleLabel = computed(() =>
  props.ariaLabel ?? (isIconOnly.value ? props.label : undefined),
);

function handleClick(event: MouseEvent): void {
  if (props.disabled || props.loading) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  emit('click', event);
}
</script>

<template>
  <v-btn
    :id="id"
    :data-testid="testId"
    :type="type"
    :variant="vuetifyVariant"
    :color="vuetifyColor"
    :size="vuetifySize"
    :rounded="vuetifyRounded"
    :icon="isIconOnly"
    :elevation="isFab ? 4 : undefined"
    :loading="loading"
    :block="fullWidth"
    :disabled="nativeDisabled"
    :aria-disabled="ariaDisabled"
    :aria-label="accessibleLabel"
    :ripple="!disableRipple"
    :prepend-icon="prependIcon"
    :append-icon="appendIcon"
    :class="{ 'opacity-60': disabled && disabledInteractive }"
    @click="handleClick"
  >
    <v-icon v-if="isIconOnly" :icon="soloIcon" />
    <slot v-else>{{ label }}</slot>
  </v-btn>
</template>
