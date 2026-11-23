<script lang="ts">
  import { RadioGroup } from 'bits-ui';
  import type {
    AtomicSize,
    ColorIntent,
    RadioButtonAtomProps,
  } from '@mono-magic/atomic-design-interfaces';
  import { cn, getColorIntentClasses } from '../../theme';

  export interface MagicRadioButtonProps extends RadioButtonAtomProps<string> {
    onchange?: (value: string) => void;
  }

  let {
    id,
    testId = 'magic-radio-button',
    ariaLabel,
    disabled = false,
    options = [],
    value = $bindable(''),
    name,
    labelPosition = 'after',
    required = false,
    disabledInteractive = false,
    disableRipple = false,
    vertical = true,
    color = 'primary',
    size = 'md',
    onchange,
  }: MagicRadioButtonProps = $props();

  const OUTER_SIZE_CLASSES: Readonly<Record<AtomicSize, string>> = {
    xs: 'h-3.5 w-3.5',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7',
  };

  const DOT_SIZE_CLASSES: Readonly<Record<AtomicSize, string>> = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-3.5 w-3.5',
  };

  const LABEL_SIZE_CLASSES: Readonly<Record<AtomicSize, string>> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const BORDER_ACTIVE_CLASSES: Readonly<Record<ColorIntent, string>> = {
    primary: 'border-magic-primary',
    secondary: 'border-magic-secondary',
    tertiary: 'border-magic-tertiary',
    success: 'border-magic-success',
    warning: 'border-magic-warning',
    error: 'border-magic-error',
    neutral: 'border-magic-neutral',
  };

  const DOT_FILL_CLASSES: Readonly<Record<ColorIntent, string>> = {
    primary: 'bg-magic-primary',
    secondary: 'bg-magic-secondary',
    tertiary: 'bg-magic-tertiary',
    success: 'bg-magic-success',
    warning: 'bg-magic-warning',
    error: 'bg-magic-error',
    neutral: 'bg-magic-neutral',
  };

  const colorClasses = $derived(getColorIntentClasses(color as ColorIntent));
  const outerSizeClass = $derived(OUTER_SIZE_CLASSES[size as AtomicSize]);
  const dotSizeClass = $derived(DOT_SIZE_CLASSES[size as AtomicSize]);
  const labelSizeClass = $derived(LABEL_SIZE_CLASSES[size as AtomicSize]);

  function handleValueChange(next: string): void {
    if (disabled && disabledInteractive) return;
    value = next;
    onchange?.(next);
  }
</script>

<RadioGroup.Root
  {id}
  {value}
  onValueChange={handleValueChange}
  {name}
  {required}
  disabled={disabled && !disabledInteractive}
  readonly={disabled && disabledInteractive}
  orientation={vertical ? 'vertical' : 'horizontal'}
  aria-label={ariaLabel ?? 'Radio group'}
  data-testid={testId}
  data-orientation={vertical ? 'vertical' : 'horizontal'}
  data-disable-ripple={disableRipple ? 'true' : undefined}
  class={cn(
    'flex gap-3',
    vertical ? 'flex-col' : 'flex-row flex-wrap items-center',
    disabled && 'opacity-50',
  )}
>
  {#each options as option (option.value)}
    {@const itemDisabled = Boolean(disabled || option.disabled)}
    {@const pos = option.labelPosition ?? labelPosition}
    <label
      class={cn(
        'inline-flex items-center gap-2 select-none',
        pos === 'before' && 'flex-row-reverse justify-end',
        itemDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <RadioGroup.Item
        value={option.value}
        disabled={itemDisabled && !disabledInteractive}
        aria-label={option.label}
        data-testid={`${testId}-item-${option.value}`}
        class={cn(
          'inline-flex items-center justify-center rounded-full border-2 bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          outerSizeClass,
          colorClasses.ring,
          value === option.value
            ? BORDER_ACTIVE_CLASSES[color as ColorIntent]
            : 'border-slate-400',
        )}
      >
        {#snippet children({ checked })}
          {#if checked}
            <span
              aria-hidden="true"
              data-testid={`${testId}-dot-${option.value}`}
              class={cn(
                'rounded-full',
                dotSizeClass,
                DOT_FILL_CLASSES[color as ColorIntent],
              )}
            ></span>
          {/if}
        {/snippet}
      </RadioGroup.Item>
      <span class={cn('font-medium text-slate-800', labelSizeClass)}>
        {option.label}{#if option.required || required}<span class="ml-0.5 text-magic-error" aria-hidden="true">*</span>{/if}
      </span>
    </label>
  {/each}
</RadioGroup.Root>
