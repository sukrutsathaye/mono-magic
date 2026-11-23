<script lang="ts">
  import { Progress } from 'bits-ui';
  import type {
    AtomicSize,
    ColorIntent,
    ProgressIndicatorAtomProps,
  } from '@mono-magic/atomic-design-interfaces';
  import { cn } from '../../theme';

  export type MagicProgressIndicatorProps = ProgressIndicatorAtomProps;

  let {
    id,
    testId = 'magic-progress-indicator',
    ariaLabel,
    disabled = false,
    type = 'bar',
    mode = 'determinate',
    value = 0,
    bufferValue = 0,
    diameter,
    strokeWidth,
    color = 'primary',
    size = 'md',
  }: MagicProgressIndicatorProps = $props();

  const BAR_HEIGHT_CLASSES: Readonly<Record<AtomicSize, string>> = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  const SPINNER_DIAMETER: Readonly<Record<AtomicSize, number>> = {
    xs: 20,
    sm: 28,
    md: 40,
    lg: 52,
    xl: 64,
  };

  const BAR_FILL_CLASSES: Readonly<Record<ColorIntent, string>> = {
    primary: 'bg-magic-primary',
    secondary: 'bg-magic-secondary',
    tertiary: 'bg-magic-tertiary',
    success: 'bg-magic-success',
    warning: 'bg-magic-warning',
    error: 'bg-magic-error',
    neutral: 'bg-magic-neutral',
  };

  const BAR_TRACK_CLASSES: Readonly<Record<ColorIntent, string>> = {
    primary: 'bg-magic-primary-soft',
    secondary: 'bg-magic-secondary-soft',
    tertiary: 'bg-magic-tertiary-soft',
    success: 'bg-magic-success-soft',
    warning: 'bg-magic-warning-soft',
    error: 'bg-magic-error-soft',
    neutral: 'bg-magic-neutral-soft',
  };

  const SPINNER_STROKE_CLASSES: Readonly<Record<ColorIntent, string>> = {
    primary: 'stroke-magic-primary',
    secondary: 'stroke-magic-secondary',
    tertiary: 'stroke-magic-tertiary',
    success: 'stroke-magic-success',
    warning: 'stroke-magic-warning',
    error: 'stroke-magic-error',
    neutral: 'stroke-magic-neutral',
  };

  const clampedValue = $derived(Math.min(100, Math.max(0, value)));
  const clampedBuffer = $derived(Math.min(100, Math.max(clampedValue, bufferValue)));
  const isIndeterminate = $derived(mode === 'indeterminate' || mode === 'query');

  const resolvedDiameter = $derived(diameter ?? SPINNER_DIAMETER[size as AtomicSize]);
  const resolvedStroke = $derived(
    strokeWidth ?? Math.max(2, Math.round(resolvedDiameter / 10)),
  );
  const radius = $derived(Math.max(1, (resolvedDiameter - resolvedStroke) / 2));
  const circumference = $derived(2 * Math.PI * radius);
  const strokeDashoffset = $derived(
    isIndeterminate
      ? circumference * 0.7
      : circumference * (1 - clampedValue / 100),
  );
</script>

{#if type === 'spinner'}
  <div
    {id}
    role="progressbar"
    aria-label={ariaLabel ?? 'Progress spinner'}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={isIndeterminate ? undefined : clampedValue}
    data-testid={testId}
    data-type="spinner"
    data-mode={mode}
    class={cn(
      'inline-flex items-center justify-center',
      disabled && 'opacity-50',
    )}
    style:width={`${resolvedDiameter}px`}
    style:height={`${resolvedDiameter}px`}
  >
    <svg
      width={resolvedDiameter}
      height={resolvedDiameter}
      viewBox={`0 0 ${resolvedDiameter} ${resolvedDiameter}`}
      class={cn(isIndeterminate && 'animate-spin')}
    >
      <circle
        cx={resolvedDiameter / 2}
        cy={resolvedDiameter / 2}
        r={radius}
        fill="none"
        stroke-width={resolvedStroke}
        class="stroke-slate-200"
      />
      <circle
        cx={resolvedDiameter / 2}
        cy={resolvedDiameter / 2}
        r={radius}
        fill="none"
        stroke-width={resolvedStroke}
        stroke-linecap="round"
        stroke-dasharray={circumference}
        stroke-dashoffset={strokeDashoffset}
        transform={`rotate(-90 ${resolvedDiameter / 2} ${resolvedDiameter / 2})`}
        class={cn(
          'transition-all duration-200',
          SPINNER_STROKE_CLASSES[color as ColorIntent],
        )}
      />
    </svg>
  </div>
{:else}
  <Progress.Root
    id={id}
    value={isIndeterminate ? null : clampedValue}
    min={0}
    max={100}
    aria-label={ariaLabel ?? 'Progress bar'}
    data-testid={testId}
    data-type="bar"
    data-mode={mode}
    class={cn(
      'relative w-full overflow-hidden rounded-full',
      BAR_HEIGHT_CLASSES[size as AtomicSize],
      BAR_TRACK_CLASSES[color as ColorIntent],
      disabled && 'opacity-50',
    )}
  >
    {#if mode === 'buffer'}
      <div
        data-testid={`${testId}-buffer`}
        class="absolute inset-y-0 left-0 rounded-full bg-slate-300/80 transition-all duration-200"
        style:width={`${clampedBuffer}%`}
      ></div>
    {/if}

    <div
      data-testid={`${testId}-fill`}
      class={cn(
        'h-full rounded-full transition-all duration-200',
        BAR_FILL_CLASSES[color as ColorIntent],
        isIndeterminate && 'w-2/5 animate-pulse',
      )}
      style:width={isIndeterminate ? undefined : `${clampedValue}%`}
    ></div>
  </Progress.Root>
{/if}
