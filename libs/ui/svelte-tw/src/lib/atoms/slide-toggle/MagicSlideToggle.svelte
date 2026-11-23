<script lang="ts">
  import { Switch } from 'bits-ui';
  import type {
    AtomicSize,
    ColorIntent,
    SlideToggleAtomProps,
  } from '@mono-magic/atomic-design-interfaces';
  import { cn, getColorIntentClasses } from '../../theme';

  export interface MagicSlideToggleProps extends SlideToggleAtomProps {
    onchange?: (checked: boolean) => void;
  }

  let {
    id,
    testId = 'magic-slide-toggle',
    ariaLabel,
    disabled = false,
    label = '',
    checked = $bindable(false),
    required = false,
    hideIcon = false,
    labelPosition = 'after',
    disableRipple = false,
    disabledInteractive = false,
    color = 'primary',
    size = 'md',
    name,
    onchange,
  }: MagicSlideToggleProps = $props();

  const TRACK_SIZE_CLASSES: Readonly<Record<AtomicSize, string>> = {
    xs: 'h-4 w-7',
    sm: 'h-5 w-9',
    md: 'h-6 w-11',
    lg: 'h-7 w-13',
    xl: 'h-8 w-15',
  };

  const THUMB_SIZE_CLASSES: Readonly<Record<AtomicSize, string>> = {
    xs: 'h-3 w-3 text-[8px]',
    sm: 'h-4 w-4 text-[9px]',
    md: 'h-5 w-5 text-[10px]',
    lg: 'h-6 w-6 text-xs',
    xl: 'h-7 w-7 text-xs',
  };

  const THUMB_TRANSLATE_CLASSES: Readonly<Record<AtomicSize, string>> = {
    xs: 'translate-x-3',
    sm: 'translate-x-4',
    md: 'translate-x-5',
    lg: 'translate-x-6',
    xl: 'translate-x-7',
  };

  const LABEL_SIZE_CLASSES: Readonly<Record<AtomicSize, string>> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const ACTIVE_TRACK_CLASSES: Readonly<Record<ColorIntent, string>> = {
    primary: 'bg-magic-primary',
    secondary: 'bg-magic-secondary',
    tertiary: 'bg-magic-tertiary',
    success: 'bg-magic-success',
    warning: 'bg-magic-warning',
    error: 'bg-magic-error',
    neutral: 'bg-magic-neutral',
  };

  const colorClasses = $derived(getColorIntentClasses(color as ColorIntent));
  const trackSizeClass = $derived(TRACK_SIZE_CLASSES[size as AtomicSize]);
  const thumbSizeClass = $derived(THUMB_SIZE_CLASSES[size as AtomicSize]);
  const thumbTranslateClass = $derived(THUMB_TRANSLATE_CLASSES[size as AtomicSize]);
  const labelSizeClass = $derived(LABEL_SIZE_CLASSES[size as AtomicSize]);

  function handleCheckedChange(next: boolean): void {
    if (disabled && disabledInteractive) return;
    checked = next;
    onchange?.(next);
  }
</script>

<label
  data-testid={testId}
  data-label-position={labelPosition}
  data-disable-ripple={disableRipple ? 'true' : undefined}
  class={cn(
    'inline-flex items-center gap-2.5 select-none',
    labelPosition === 'before' && 'flex-row-reverse justify-end',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
  )}
>
  <Switch.Root
    {id}
    {checked}
    onCheckedChange={handleCheckedChange}
    disabled={disabled && !disabledInteractive}
    aria-disabled={disabled ? 'true' : undefined}
    {required}
    {name}
    aria-label={ariaLabel ?? (label || 'Toggle switch')}
    data-testid={`${testId}-control`}
    class={cn(
      'relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      trackSizeClass,
      colorClasses.ring,
      checked ? ACTIVE_TRACK_CLASSES[color as ColorIntent] : 'bg-slate-300',
    )}
  >
    <Switch.Thumb
      class={cn(
        'pointer-events-none inline-flex items-center justify-center rounded-full bg-white font-bold shadow-sm transition-transform',
        thumbSizeClass,
        checked ? cn(thumbTranslateClass, 'text-slate-800') : 'translate-x-0 text-slate-400',
      )}
    >
      {#if !hideIcon}
        <span aria-hidden="true" data-testid={`${testId}-icon`}>
          {checked ? '✓' : '×'}
        </span>
      {/if}
    </Switch.Thumb>
  </Switch.Root>

  {#if label}
    <span class={cn('font-medium text-slate-800', labelSizeClass)}>
      {label}{#if required}<span class="ml-0.5 text-magic-error" aria-hidden="true">*</span>{/if}
    </span>
  {/if}
</label>
