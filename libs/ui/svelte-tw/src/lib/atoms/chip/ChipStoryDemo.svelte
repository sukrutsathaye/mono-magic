<script lang="ts">
  import type { ChipItem } from '@mono-magic/atomic-design-interfaces';
  import MagicChip from './MagicChip.svelte';

  let selectedLabels = $state<string[]>(['Svelte 5']);
  let tags = $state<ChipItem[]>([
    { id: '1', label: 'Atomic Design', removable: true, editable: true },
    { id: '2', label: 'Tailwind v4', removable: true, editable: true },
  ]);
  let reordered = $state<ChipItem[]>([
    { id: 'a', label: 'Atoms' },
    { id: 'b', label: 'Molecules' },
    { id: 'c', label: 'Organisms' },
  ]);
</script>

<div class="flex flex-col gap-6 p-4">
  <div class="flex flex-col gap-2">
    <MagicChip
      testId="filter-chips"
      variant="selectable"
      multiple
      color="primary"
      chips={[
        { id: 'sv', label: 'Svelte 5', selected: true },
        { id: 'ts', label: 'TypeScript' },
        { id: 'bits', label: 'Bits UI' },
        { id: 'vitest', label: 'Vitest' },
      ]}
      onselect={(sel) => (selectedLabels = sel.map((c) => c.label))}
    />
    <span class="text-xs text-slate-600" data-testid="chip-select-status">
      Selected: {selectedLabels.join(', ') || 'none'}
    </span>
  </div>

  <div class="flex flex-col gap-2">
    <MagicChip
      testId="input-chips"
      variant="input"
      color="secondary"
      editable
      inputPlaceholder="Type tag & press Enter..."
      chips={tags}
      onchange={(next) => (tags = [...next])}
    />
    <span class="text-xs text-slate-600" data-testid="chip-input-status">
      Tags ({tags.length}): {tags.map((t) => t.label).join(', ')}
    </span>
  </div>

  <div class="flex flex-col gap-2">
    <MagicChip
      testId="drag-chips"
      variant="draggable"
      color="tertiary"
      chips={reordered}
      onreorder={(next) => (reordered = [...next])}
    />
    <span class="text-xs text-slate-600">
      Order: {reordered.map((c) => c.label).join(' → ')}
    </span>
  </div>
</div>
