<script lang="ts">
  import MagicSlideToggle from './MagicSlideToggle.svelte';

  let emailAlerts = $state(true);
  let pushAlerts = $state(false);
  let compactMode = $state(false);
</script>

<div class="flex max-w-xs flex-col gap-3 p-4">
  <MagicSlideToggle
    bind:checked={emailAlerts}
    testId="email-switch"
    label="Email notifications"
    color="primary"
  />
  <MagicSlideToggle
    bind:checked={pushAlerts}
    testId="push-switch"
    label="Push notifications"
    color="secondary"
  />
  <MagicSlideToggle
    bind:checked={compactMode}
    testId="compact-switch"
    label="Compact density"
    color="tertiary"
    hideIcon
    labelPosition="before"
  />
  <MagicSlideToggle label="Locked setting" checked disabled />
  <span class="pt-1 text-xs text-slate-600" data-testid="switch-demo-status">
    Email: {emailAlerts ? 'ON' : 'OFF'} | Push: {pushAlerts ? 'ON' : 'OFF'} | Compact: {compactMode ? 'ON' : 'OFF'}
  </span>
</div>
