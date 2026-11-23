<script lang="ts">
  import MagicButtonToggle from './MagicButtonToggle.svelte';

  let align = $state<string | readonly string[] | undefined>('left');
  let formats = $state<string | readonly string[] | undefined>(['bold']);
  let view = $state<string | readonly string[] | undefined>('grid');
</script>

<div class="flex flex-col gap-6 p-4">
  <div class="flex flex-col gap-2 items-start">
    <MagicButtonToggle
      bind:value={align}
      testId="align-toggle"
      options={[
        { value: 'left', label: 'Left', icon: '⬅' },
        { value: 'center', label: 'Center', icon: '⬌' },
        { value: 'right', label: 'Right', icon: '➡' },
      ]}
      color="primary"
    />
    <span class="text-xs text-slate-600" data-testid="toggle-align-status">
      Alignment: {align ?? 'none'}
    </span>
  </div>

  <div class="flex flex-col gap-2 items-start">
    <MagicButtonToggle
      bind:value={formats}
      testId="format-toggle"
      selectionMode="multiple"
      options={[
        { value: 'bold', label: 'Bold', icon: 'B' },
        { value: 'italic', label: 'Italic', icon: 'I' },
        { value: 'underline', label: 'Underline', icon: 'U' },
      ]}
      color="secondary"
    />
    <span class="text-xs text-slate-600" data-testid="toggle-format-status">
      Formats: {Array.isArray(formats) ? formats.join(', ') || 'none' : formats}
    </span>
  </div>

  <div class="flex flex-col gap-2 items-start">
    <MagicButtonToggle
      bind:value={view}
      vertical
      appearance="legacy"
      required
      color="tertiary"
      options={[
        { value: 'list', label: 'List View' },
        { value: 'grid', label: 'Grid View' },
        { value: 'board', label: 'Board View' },
      ]}
    />
    <span class="text-xs text-slate-600">View (required): {view}</span>
  </div>
</div>
