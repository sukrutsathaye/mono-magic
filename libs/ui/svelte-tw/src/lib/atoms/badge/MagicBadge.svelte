<script lang="ts">
  import type { Snippet } from 'svelte';
  import type {
    AtomicSize,
    BadgeAtomProps,
    BadgePosition,
    ColorIntent,
  } from '@mono-magic/atomic-design-interfaces';
  import { cn, getColorIntentClasses } from '../../theme';

  export interface MagicBadgeProps extends BadgeAtomProps {
    children?: Snippet;
  }

  let {
    id,
    testId = 'magic-badge',
    ariaLabel,
    disabled = false,
    content,
    color = 'primary',
    size = 'md',
    position = 'above after',
    overlap = true,
    hidden = false,
    description,
    label,
    icon,
    children,
  }: MagicBadgeProps = $props();

  const BADGE_SIZE_CLASSES: Readonly<Record<AtomicSize, string>> = {
    xs: 'min-w-4 h-4 px-1 text-[10px]',
    sm: 'min-w-5 h-5 px-1.5 text-xs',
    md: 'min-w-6 h-6 px-1.5 text-xs',
    lg: 'min-w-7 h-7 px-2 text-sm',
    xl: 'min-w-8 h-8 px-2.5 text-sm',
  };

  const BADGE_POSITION_CLASSES: Readonly<Record<BadgePosition, string>> = {
    'above after': '-top-2 -right-2',
    'above before': '-top-2 -left-2',
    'below after': '-bottom-2 -right-2',
    'below before': '-bottom-2 -left-2',
    above: '-top-2 left-1/2 -translate-x-1/2',
    below: '-bottom-2 left-1/2 -translate-x-1/2',
    before: 'top-1/2 -left-2 -translate-y-1/2',
    after: 'top-1/2 -right-2 -translate-y-1/2',
  };

  const NON_OVERLAP_POSITION_CLASSES: Readonly<Record<BadgePosition, string>> = {
    'above after': '-top-3 -right-3',
    'above before': '-top-3 -left-3',
    'below after': '-bottom-3 -right-3',
    'below before': '-bottom-3 -left-3',
    above: '-top-3 left-1/2 -translate-x-1/2',
    below: '-bottom-3 left-1/2 -translate-x-1/2',
    before: 'top-1/2 -left-3 -translate-y-1/2',
    after: 'top-1/2 -right-3 -translate-y-1/2',
  };

  const colorClasses = $derived(getColorIntentClasses(color as ColorIntent));
  const sizeClass = $derived(BADGE_SIZE_CLASSES[size as AtomicSize]);
  const positionClass = $derived(
    overlap
      ? BADGE_POSITION_CLASSES[position as BadgePosition]
      : NON_OVERLAP_POSITION_CLASSES[position as BadgePosition],
  );
  const badgeText = $derived(
    content !== undefined && content !== null ? String(content) : '',
  );
  const isDot = $derived(badgeText.length === 0);
  const effectiveAriaLabel = $derived(
    ariaLabel ?? description ?? (badgeText ? `Badge ${badgeText}` : 'Badge'),
  );
</script>

<span
  {id}
  data-testid={testId}
  data-disabled={disabled ? 'true' : undefined}
  data-position={position}
  data-overlap={overlap ? 'true' : 'false'}
  class={cn(
    'relative inline-flex items-center justify-center align-middle',
    disabled && 'opacity-50 pointer-events-none',
  )}
>
  {#if children}
    {@render children()}
  {:else if icon || label}
    <span class="inline-flex items-center gap-1.5 rounded-md bg-magic-neutral-soft px-3 py-1.5 text-sm font-medium text-slate-800">
      {#if icon}
        <span aria-hidden="true" data-testid={`${testId}-icon`}>{icon}</span>
      {/if}
      {#if label}
        <span>{label}</span>
      {/if}
    </span>
  {/if}

  {#if !hidden}
    <span
      role="status"
      aria-label={effectiveAriaLabel}
      aria-description={description}
      data-testid={`${testId}-indicator`}
      class={cn(
        'inline-flex items-center justify-center rounded-full font-semibold leading-none shadow-sm transition-transform',
        colorClasses.solid,
        children || icon || label ? cn('absolute', positionClass) : '',
        isDot ? 'h-2.5 w-2.5 min-w-0 p-0' : sizeClass,
      )}
    >
      {#if !isDot}
        {badgeText}
      {/if}
    </span>
  {/if}
</span>
