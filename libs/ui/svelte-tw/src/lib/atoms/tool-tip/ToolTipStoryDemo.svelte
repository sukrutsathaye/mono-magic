<script lang="ts">
  import type { ToolTipPosition } from '@mono-magic/atomic-design-interfaces';
  import MagicButton from '../button/MagicButton.svelte';
  import MagicToolTip from './MagicToolTip.svelte';

  let open = $state(false);
  let position = $state<ToolTipPosition>('above');
  const positions: readonly ToolTipPosition[] = [
    'above',
    'below',
    'left',
    'right',
    'before',
    'after',
  ];
</script>

<div class="flex flex-col items-start gap-6 p-8">
  <div class="flex flex-wrap items-center gap-2">
    <MagicButton
      label={open ? 'Hide Tooltip' : 'Show Tooltip'}
      size="sm"
      onclick={() => (open = !open)}
    />
    {#each positions as pos (pos)}
      <MagicButton
        label={pos}
        size="sm"
        variant={position === pos ? 'filled' : 'outlined'}
        onclick={() => (position = pos)}
      />
    {/each}
  </div>

  <div class="flex flex-wrap items-center gap-6 py-4">
    <MagicToolTip
      bind:open
      {position}
      testId="controlled-tip"
      message={`Controlled tooltip (${position})`}
      label="Target Trigger"
    />
    <MagicToolTip
      position="below"
      showDelay={300}
      message="Delayed 300ms"
      label="Delayed Hover"
    />
    <MagicToolTip
      disabled
      message="Never visible"
      label="Disabled Tooltip"
    />
  </div>

  <span class="text-xs text-slate-600" data-testid="tooltip-demo-status">
    Open: {open} | Position: {position}
  </span>
</div>
