<script lang="ts">
  import type { ColorIntent } from '@mono-magic/atomic-design-interfaces';
  import { cn, getColorIntentClasses } from './theme';

  interface Props {
    intents?: readonly ColorIntent[];
  }

  const DEFAULT_INTENTS: readonly ColorIntent[] = [
    'primary',
    'secondary',
    'tertiary',
    'success',
    'warning',
    'error',
    'neutral',
  ];

  let { intents = DEFAULT_INTENTS }: Props = $props();
</script>

<div class="flex flex-wrap gap-3 p-4" data-testid="magic-theme-preview">
  {#each intents as intent (intent)}
    <span
      class={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
        getColorIntentClasses(intent).solid,
      )}
    >
      {intent}
    </span>
  {/each}
</div>
