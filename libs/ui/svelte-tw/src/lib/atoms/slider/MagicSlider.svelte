<script lang="ts">
  import type {
    AtomicSize,
    ColorIntent,
    SliderAtomProps,
  } from '@mono-magic/atomic-design-interfaces';
  import { cn } from '../../theme';

  export interface MagicSliderProps extends SliderAtomProps {
    onchange?: (value: number) => void;
    onrangechange?: (range: { startValue: number; endValue: number }) => void;
  }

  let {
    id,
    testId = 'magic-slider',
    ariaLabel,
    disabled = false,
    min = 0,
    max = 100,
    step = 1,
    value = $bindable(50),
    range = false,
    startValue = $bindable(25),
    endValue = $bindable(75),
    discrete = false,
    showTickMarks = false,
    disableRipple = false,
    color = 'primary',
    size = 'md',
    displayWith,
    onchange,
    onrangechange,
  }: MagicSliderProps = $props();

  const TRACK_HEIGHT_CLASSES: Readonly<Record<AtomicSize, string>> = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5',
    xl: 'h-3',
  };

  const FILL_CLASSES: Readonly<Record<ColorIntent, string>> = {
    primary: 'bg-magic-primary',
    secondary: 'bg-magic-secondary',
    tertiary: 'bg-magic-tertiary',
    success: 'bg-magic-success',
    warning: 'bg-magic-warning',
    error: 'bg-magic-error',
    neutral: 'bg-magic-neutral',
  };

  const ACCENT_CLASSES: Readonly<Record<ColorIntent, string>> = {
    primary: 'accent-magic-primary',
    secondary: 'accent-magic-secondary',
    tertiary: 'accent-magic-tertiary',
    success: 'accent-magic-success',
    warning: 'accent-magic-warning',
    error: 'accent-magic-error',
    neutral: 'accent-magic-neutral',
  };

  function clamp(val: number): number {
    return Math.min(max, Math.max(min, val));
  }

  function formatDisplay(val: number): string {
    return displayWith ? displayWith(val) : String(val);
  }

  const span = $derived(Math.max(1, max - min));
  const clampedValue = $derived(clamp(value));
  const clampedStart = $derived(clamp(Math.min(startValue, endValue)));
  const clampedEnd = $derived(clamp(Math.max(startValue, endValue)));

  const fillLeftPercent = $derived(
    range ? ((clampedStart - min) / span) * 100 : 0,
  );
  const fillWidthPercent = $derived(
    range
      ? ((clampedEnd - clampedStart) / span) * 100
      : ((clampedValue - min) / span) * 100,
  );

  const tickPositions = $derived.by(() => {
    if (!showTickMarks || step <= 0) return [];
    const count = Math.floor((max - min) / step);
    const cappedCount = Math.min(count, 20);
    if (cappedCount <= 0) return [];
    return Array.from({ length: cappedCount + 1 }, (_, i) => (i / cappedCount) * 100);
  });

  function handleSingleInput(event: Event): void {
    if (disabled) return;
    const next = clamp(Number((event.currentTarget as HTMLInputElement).value));
    value = next;
    onchange?.(next);
  }

  function handleStartInput(event: Event): void {
    if (disabled) return;
    const raw = clamp(Number((event.currentTarget as HTMLInputElement).value));
    const nextStart = Math.min(raw, clampedEnd);
    startValue = nextStart;
    onrangechange?.({ startValue: nextStart, endValue: clampedEnd });
  }

  function handleEndInput(event: Event): void {
    if (disabled) return;
    const raw = clamp(Number((event.currentTarget as HTMLInputElement).value));
    const nextEnd = Math.max(raw, clampedStart);
    endValue = nextEnd;
    onrangechange?.({ startValue: clampedStart, endValue: nextEnd });
  }
</script>

<div
  {id}
  data-testid={testId}
  data-range={range ? 'true' : 'false'}
  data-discrete={discrete ? 'true' : 'false'}
  data-disable-ripple={disableRipple ? 'true' : undefined}
  class={cn('flex w-full flex-col gap-2', disabled && 'opacity-50')}
>
  {#if discrete}
    <div class="flex items-center justify-between text-xs font-semibold text-slate-700">
      {#if range}
        <span
          data-testid={`${testId}-start-badge`}
          class={cn('rounded px-1.5 py-0.5 text-white', FILL_CLASSES[color as ColorIntent])}
        >
          {formatDisplay(clampedStart)}
        </span>
        <span
          data-testid={`${testId}-end-badge`}
          class={cn('rounded px-1.5 py-0.5 text-white', FILL_CLASSES[color as ColorIntent])}
        >
          {formatDisplay(clampedEnd)}
        </span>
      {:else}
        <span
          data-testid={`${testId}-value-badge`}
          class={cn('rounded px-1.5 py-0.5 text-white', FILL_CLASSES[color as ColorIntent])}
        >
          {formatDisplay(clampedValue)}
        </span>
      {/if}
    </div>
  {/if}

  <div class="relative flex w-full items-center py-2">
    <div
      class={cn(
        'relative w-full rounded-full bg-slate-200',
        TRACK_HEIGHT_CLASSES[size as AtomicSize],
      )}
    >
      <div
        data-testid={`${testId}-fill`}
        class={cn(
          'absolute inset-y-0 rounded-full',
          FILL_CLASSES[color as ColorIntent],
        )}
        style:left={`${fillLeftPercent}%`}
        style:width={`${fillWidthPercent}%`}
      ></div>

      {#if showTickMarks}
        <div class="pointer-events-none absolute inset-0" data-testid={`${testId}-ticks`}>
          {#each tickPositions as pct, index (index)}
            <span
              class="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-500/60"
              style:left={`${pct}%`}
            ></span>
          {/each}
        </div>
      {/if}
    </div>

    {#if range}
      <input
        type="range"
        {min}
        {max}
        {step}
        {disabled}
        value={clampedStart}
        oninput={handleStartInput}
        aria-label={ariaLabel ? `${ariaLabel} start` : 'Range start'}
        data-testid={`${testId}-start-input`}
        class={cn(
          'absolute inset-0 h-full w-full cursor-pointer opacity-80',
          ACCENT_CLASSES[color as ColorIntent],
          disabled && 'cursor-not-allowed',
        )}
      />
      <input
        type="range"
        {min}
        {max}
        {step}
        {disabled}
        value={clampedEnd}
        oninput={handleEndInput}
        aria-label={ariaLabel ? `${ariaLabel} end` : 'Range end'}
        data-testid={`${testId}-end-input`}
        class={cn(
          'absolute inset-0 h-full w-full cursor-pointer opacity-80',
          ACCENT_CLASSES[color as ColorIntent],
          disabled && 'cursor-not-allowed',
        )}
      />
    {:else}
      <input
        type="range"
        {min}
        {max}
        {step}
        {disabled}
        value={clampedValue}
        oninput={handleSingleInput}
        aria-label={ariaLabel ?? 'Slider'}
        data-testid={`${testId}-input`}
        class={cn(
          'absolute inset-0 h-full w-full cursor-pointer opacity-90',
          ACCENT_CLASSES[color as ColorIntent],
          disabled && 'cursor-not-allowed',
        )}
      />
    {/if}
  </div>
</div>
