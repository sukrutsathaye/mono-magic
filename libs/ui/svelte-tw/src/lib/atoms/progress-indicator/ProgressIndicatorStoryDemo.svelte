<script lang="ts">
  import MagicButton from '../button/MagicButton.svelte';
  import MagicProgressIndicator from './MagicProgressIndicator.svelte';

  let progress = $state(35);

  function step(delta: number) {
    progress = Math.max(0, Math.min(100, progress + delta));
  }
</script>

<div class="flex max-w-md flex-col gap-5 p-4">
  <div class="flex flex-col gap-1">
    <span class="text-xs text-slate-600">Determinate ({progress}%)</span>
    <MagicProgressIndicator type="bar" mode="determinate" value={progress} color="primary" size="lg" />
  </div>

  <div class="flex flex-col gap-1">
    <span class="text-xs text-slate-600">Buffer (45% / 75%)</span>
    <MagicProgressIndicator type="bar" mode="buffer" value={45} bufferValue={75} color="secondary" />
  </div>

  <div class="flex flex-col gap-1">
    <span class="text-xs text-slate-600">Indeterminate</span>
    <MagicProgressIndicator type="bar" mode="indeterminate" color="tertiary" />
  </div>

  <div class="flex items-center gap-4">
    <MagicProgressIndicator type="spinner" mode="determinate" value={progress} color="success" diameter={48} />
    <MagicProgressIndicator type="spinner" mode="indeterminate" color="warning" size="sm" />
    <div class="flex items-center gap-2">
      <MagicButton label="-15%" size="sm" variant="outlined" onclick={() => step(-15)} />
      <MagicButton label="+15%" size="sm" onclick={() => step(15)} />
      <MagicButton label="Reset" size="sm" variant="tonal" onclick={() => (progress = 0)} />
    </div>
  </div>
  <span class="text-xs text-slate-600" data-testid="progress-demo-status">
    Progress: {progress}%
  </span>
</div>
