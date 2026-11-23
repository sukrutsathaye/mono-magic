<script lang="ts">
  import type { CheckBoxTask } from '@mono-magic/atomic-design-interfaces';
  import MagicCheckBox from './MagicCheckBox.svelte';

  let agreed = $state(false);
  let tasks = $state<readonly CheckBoxTask[]>([
    { id: 'tokens', name: 'Design tokens synced', checked: true },
    {
      id: 'qa',
      name: 'Verification Gates',
      checked: false,
      subtasks: [
        { id: 'unit', name: 'Unit tests >= 80%', checked: true },
        { id: 'visual', name: 'Storybook visual snapshots', checked: false },
      ],
    },
    { id: 'docs', name: 'README updated', checked: false },
  ]);
</script>

<div class="flex flex-col gap-6 p-4">
  <div class="flex flex-col gap-2">
    <MagicCheckBox
      bind:checked={agreed}
      testId="terms-cb"
      label="Accept release checklist terms"
      required
      color="primary"
    />
    <MagicCheckBox label="Indeterminate sample" indeterminate color="secondary" />
    <MagicCheckBox label="Label before" checked labelPosition="before" color="success" />
    <MagicCheckBox label="Disabled" checked disabled />
    <span class="text-xs text-slate-600" data-testid="checkbox-terms-status">
      Agreed: {agreed}
    </span>
  </div>

  <div class="flex flex-col gap-2">
    <MagicCheckBox
      label="Release Readiness"
      testId="tree-cb"
      {tasks}
      color="primary"
      ontaskschange={(next) => (tasks = next)}
    />
    <pre class="rounded bg-slate-100 p-2 text-xs text-slate-700" data-testid="checkbox-tree-json">{JSON.stringify(tasks, null, 2)}</pre>
  </div>
</div>
