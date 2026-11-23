<script setup lang="ts">
import { computed } from 'vue';
import type {
  BadgeAtomProps,
  BadgePosition,
} from '@mono-magic/atomic-design-interfaces';
import {
  mapAtomicSizeToVuetify,
  mapColorIntentToVuetify,
  normalizeMdiIcon,
} from '../../theme';

export type MagicBadgeProps = BadgeAtomProps;

const props = withDefaults(defineProps<MagicBadgeProps>(), {
  content: undefined,
  color: 'primary',
  size: 'md',
  position: 'above after',
  overlap: true,
  hidden: false,
  disabled: false,
  description: undefined,
  label: undefined,
  icon: undefined,
  id: undefined,
  testId: undefined,
  ariaLabel: undefined,
});

const LOCATION_MAP: Readonly<Record<BadgePosition, 'top end' | 'top start' | 'bottom end' | 'bottom start' | 'top' | 'bottom' | 'start' | 'end'>> = {
  'above after': 'top end',
  'above before': 'top start',
  'below after': 'bottom end',
  'below before': 'bottom start',
  above: 'top',
  below: 'bottom',
  before: 'start',
  after: 'end',
};

const badgeLocation = computed(() => LOCATION_MAP[props.position]);
const badgeColor = computed(() => mapColorIntentToVuetify(props.color));
const iconSize = computed(() => mapAtomicSizeToVuetify(props.size));
const resolvedIcon = computed(() => normalizeMdiIcon(props.icon));
const isDot = computed(
  () => props.content === undefined || props.content === '',
);
const isVisible = computed(() => !props.hidden);
const accessibleLabel = computed(
  () => props.ariaLabel ?? props.description ?? props.label,
);
</script>

<template>
  <span
    :id="id"
    :data-testid="testId"
    :aria-label="accessibleLabel"
    :aria-disabled="disabled ? 'true' : undefined"
    class="magic-badge-wrapper d-inline-flex align-center"
    :class="{ 'opacity-50': disabled }"
  >
    <v-badge
      :model-value="isVisible"
      :content="content"
      :dot="isDot"
      :color="badgeColor"
      :location="badgeLocation"
      :floating="!overlap"
    >
      <slot>
        <v-icon v-if="resolvedIcon" :icon="resolvedIcon" :size="iconSize" />
        <span v-else-if="label" class="text-body-1">{{ label }}</span>
      </slot>
    </v-badge>
    <span v-if="description" class="d-sr-only">{{ description }}</span>
  </span>
</template>
