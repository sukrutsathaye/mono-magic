<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Tooltip } from 'bits-ui';
  import type {
    ToolTipAtomProps,
    ToolTipPosition,
  } from '@mono-magic/atomic-design-interfaces';
  import { cn } from '../../theme';

  export interface MagicToolTipProps extends ToolTipAtomProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: Snippet;
  }

  let {
    id,
    testId = 'magic-tool-tip',
    ariaLabel,
    disabled = false,
    message,
    label = 'Hover me',
    position = 'above',
    showDelay = 0,
    hideDelay = 0,
    touchGestures = 'auto',
    open = $bindable(false),
    onOpenChange,
    children,
  }: MagicToolTipProps = $props();

  const POSITION_TO_SIDE: Readonly<
    Record<ToolTipPosition, 'top' | 'bottom' | 'left' | 'right'>
  > = {
    above: 'top',
    below: 'bottom',
    left: 'left',
    right: 'right',
    before: 'left',
    after: 'right',
  };

  const side = $derived(POSITION_TO_SIDE[position as ToolTipPosition]);

  function handleOpenChange(next: boolean): void {
    if (disabled) {
      open = false;
      return;
    }
    open = next;
    onOpenChange?.(next);
  }
</script>

<span
  {id}
  data-testid={testId}
  data-position={position}
  data-touch-gestures={touchGestures}
  data-hide-delay={hideDelay}
  class="inline-flex items-center"
>
  <Tooltip.Provider delayDuration={showDelay} {disabled}>
    <Tooltip.Root
      open={disabled ? false : open}
      onOpenChange={handleOpenChange}
      delayDuration={showDelay}
      {disabled}
    >
      <Tooltip.Trigger
        aria-label={ariaLabel ?? label}
        data-testid={`${testId}-trigger`}
        class={cn(
          'inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magic-primary focus-visible:ring-offset-2',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        {#if children}
          {@render children()}
        {:else}
          {label}
        {/if}
      </Tooltip.Trigger>

      {#if !disabled}
        <Tooltip.Portal>
          <Tooltip.Content
            {side}
            sideOffset={6}
            role="tooltip"
            data-testid={`${testId}-content`}
            class="z-50 max-w-xs rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
          >
            {message}
          </Tooltip.Content>
        </Tooltip.Portal>
      {/if}
    </Tooltip.Root>
  </Tooltip.Provider>
</span>
