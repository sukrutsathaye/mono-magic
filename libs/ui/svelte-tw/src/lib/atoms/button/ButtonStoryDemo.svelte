<script lang="ts">
  import MagicButton from './MagicButton.svelte';

  let clicks = $state(0);
  let isLoading = $state(false);

  function triggerSave() {
    clicks += 1;
    isLoading = true;
    setTimeout(() => {
      isLoading = false;
    }, 450);
  }
</script>

<div class="flex flex-col gap-6 p-4">
  <div class="flex flex-wrap items-center gap-3">
    <MagicButton label="Filled" variant="filled" />
    <MagicButton label="Tonal" variant="tonal" />
    <MagicButton label="Outlined" variant="outlined" />
    <MagicButton label="Elevated" variant="elevated" />
    <MagicButton label="Text" variant="text" />
  </div>

  <div class="flex flex-wrap items-center gap-3">
    <MagicButton label="Primary" color="primary" />
    <MagicButton label="Secondary" color="secondary" />
    <MagicButton label="Tertiary" color="tertiary" />
    <MagicButton label="Success" color="success" />
    <MagicButton label="Warning" color="warning" />
    <MagicButton label="Error" color="error" />
    <MagicButton label="Neutral" color="neutral" />
  </div>

  <div class="flex flex-wrap items-center gap-3">
    <MagicButton label="XS" size="xs" />
    <MagicButton label="SM" size="sm" />
    <MagicButton label="MD" size="md" />
    <MagicButton label="LG" size="lg" />
    <MagicButton label="XL" size="xl" />
    <MagicButton label="Fav" kind="icon" leadingIcon="♥" color="error" variant="tonal" ariaLabel="Favorite" />
    <MagicButton label="Add" kind="fab" leadingIcon="+" color="primary" ariaLabel="Add" />
    <MagicButton label="Edit" kind="mini-fab" leadingIcon="✎" color="secondary" ariaLabel="Edit" />
    <MagicButton label="Compose" kind="extended-fab" leadingIcon="✎" color="tertiary" />
  </div>

  <div class="flex flex-wrap items-center gap-4">
    <MagicButton
      label="Save Draft"
      leadingIcon="💾"
      loading={isLoading}
      onclick={triggerSave}
    />
    <MagicButton
      label="Disabled Interactive"
      variant="outlined"
      disabled
      disabledInteractive
    />
    <span class="text-xs text-slate-600" data-testid="button-demo-status">
      Saves: {clicks} | Loading: {isLoading}
    </span>
  </div>
</div>
