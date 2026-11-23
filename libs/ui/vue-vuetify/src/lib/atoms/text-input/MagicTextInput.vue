<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type {
  AtomicSize,
  TextInputAtomProps,
  TextInputType,
  TextInputVariant,
} from '@mono-magic/atomic-design-interfaces';
import { mapAtomicSizeToDensity } from '../../theme';

export interface MagicTextInputProps extends TextInputAtomProps {
  /** Vue v-model binding alias for `value`. */
  modelValue?: string;
  /** Native HTML input type. Defaults to `'text'`. */
  type?: TextInputType;
  /** Native form field name attribute. */
  name?: string;
  /** HTML autocomplete attribute. */
  autocomplete?: string;
  /** Minimum character length validation constraint. */
  minLength?: number;
  /** Maximum character length validation constraint. */
  maxLength?: number;
  /** Marks the control as invalid even without `errorText`. */
  invalid?: boolean;
  /** Clearable icon toggle on input. */
  clearable?: boolean;
  /** Optional leading MDI icon name. */
  prependInnerIcon?: string;
  /** Optional trailing MDI icon name. */
  appendInnerIcon?: string;
}

const props = withDefaults(defineProps<MagicTextInputProps>(), {
  value: undefined,
  modelValue: undefined,
  placeholder: undefined,
  helperText: undefined,
  errorText: undefined,
  variant: 'outlined',
  size: 'md',
  required: false,
  readOnly: false,
  disabled: false,
  type: 'text',
  name: undefined,
  autocomplete: undefined,
  minLength: undefined,
  maxLength: undefined,
  invalid: false,
  clearable: false,
  prependInnerIcon: undefined,
  appendInnerIcon: undefined,
  id: undefined,
  testId: undefined,
  ariaLabel: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  input: [value: string];
  change: [value: string];
  submit: [value: string];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  clear: [];
}>();

const VARIANT_MAP: Readonly<Record<TextInputVariant, 'outlined' | 'filled'>> = {
  outlined: 'outlined',
  filled: 'filled',
};

const SIZE_CLASS_MAP: Readonly<Record<AtomicSize, string>> = {
  xs: 'magic-text-input--xs',
  sm: 'magic-text-input--sm',
  md: 'magic-text-input--md',
  lg: 'magic-text-input--lg',
  xl: 'magic-text-input--xl',
};

const internalValue = ref<string>(props.modelValue ?? props.value ?? '');

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

const currentValue = computed<string>({
  get() {
    return isControlled.value
      ? (props.modelValue ?? props.value ?? '')
      : internalValue.value;
  },
  set(next: string) {
    if (props.disabled || props.readOnly) {
      return;
    }
    internalValue.value = next;
    emit('update:modelValue', next);
    emit('input', next);
    emit('change', next);
  },
});

const vuetifyVariant = computed(() => VARIANT_MAP[props.variant]);
const vuetifyDensity = computed(() => mapAtomicSizeToDensity(props.size));
const sizeClass = computed(() => SIZE_CLASS_MAP[props.size]);
const hasError = computed(
  () => props.invalid || Boolean(props.errorText && props.errorText.length > 0),
);
const errorMessages = computed(() =>
  props.errorText && props.errorText.length > 0 ? [props.errorText] : [],
);

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !props.disabled) {
    emit('submit', currentValue.value);
  }
}

function handleClear(): void {
  if (props.disabled || props.readOnly) {
    return;
  }
  internalValue.value = '';
  emit('update:modelValue', '');
  emit('input', '');
  emit('change', '');
  emit('clear');
}
</script>

<template>
  <v-text-field
    :id="id"
    v-model="currentValue"
    :data-testid="testId"
    :data-size="size"
    :data-variant="variant"
    :label="required ? `${label} *` : label"
    :placeholder="placeholder"
    :hint="helperText"
    :persistent-hint="Boolean(helperText) && !hasError"
    :error="hasError"
    :error-messages="errorMessages"
    :variant="vuetifyVariant"
    :density="vuetifyDensity"
    :type="type"
    :name="name"
    :required="required"
    :readonly="readOnly"
    :disabled="disabled"
    :autocomplete="autocomplete"
    :minlength="minLength"
    :maxlength="maxLength"
    :counter="maxLength"
    :clearable="clearable && !disabled && !readOnly"
    :prepend-inner-icon="prependInnerIcon"
    :append-inner-icon="appendInnerIcon"
    :aria-label="ariaLabel ?? label"
    :aria-invalid="hasError ? 'true' : undefined"
    :class="sizeClass"
    hide-details="auto"
    @keydown="handleKeydown"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
    @click:clear="handleClear"
  />
</template>
