<script lang="ts">
  import MagicBadge from './MagicBadge.svelte';
  import MagicButton from '../button/MagicButton.svelte';

  let count = $state(3);
  let hidden = $state(false);
</script>

<div class="flex flex-col gap-6 p-4">
  <div class="flex flex-wrap items-center gap-6">
    <MagicBadge content="3" color="primary" icon="✉" label="Mail" />
    <MagicBadge content="7" color="secondary" icon="💬" label="Chat" />
    <MagicBadge content="2" color="tertiary" icon="★" label="Stars" />
    <MagicBadge content="OK" color="success" icon="✓" label="Checks" />
    <MagicBadge content="!" color="warning" icon="⚠" label="Alerts" />
    <MagicBadge content="99+" color="error" icon="🔔" label="Bell" />
    <MagicBadge content="0" color="neutral" icon="📥" label="Archive" />
  </div>

  <div class="flex flex-wrap items-center gap-6">
    <MagicBadge content={count} {hidden} color="error" description="Unread notifications">
      <MagicButton label="Inbox" variant="outlined" />
    </MagicBadge>
    <div class="flex items-center gap-2">
      <MagicButton label="+1 Notification" size="sm" onclick={() => (count += 1)} />
      <MagicButton label="Clear" size="sm" variant="tonal" onclick={() => (count = 0)} />
      <MagicButton
        label={hidden ? 'Show Badge' : 'Hide Badge'}
        size="sm"
        variant="outlined"
        onclick={() => (hidden = !hidden)}
      />
    </div>
    <span class="text-xs text-slate-600" data-testid="badge-demo-status">
      Count: {count} | Hidden: {hidden}
    </span>
  </div>
</div>
