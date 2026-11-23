<script lang="ts">
  import MagicRadioButton from './MagicRadioButton.svelte';

  let plan = $state('pro');
  let theme = $state('system');
</script>

<div class="flex flex-col gap-6 p-4">
  <div class="flex flex-col gap-2">
    <MagicRadioButton
      bind:value={plan}
      testId="plan-radio"
      name="billing-plan"
      color="primary"
      options={[
        { value: 'free', label: 'Free — $0/mo' },
        { value: 'pro', label: 'Pro — $19/mo' },
        { value: 'team', label: 'Team — $49/mo' },
        { value: 'legacy', label: 'Legacy (Unavailable)', disabled: true },
      ]}
    />
    <span class="text-xs text-slate-600" data-testid="radio-plan-status">
      Selected plan: {plan}
    </span>
  </div>

  <div class="flex flex-col gap-2">
    <MagicRadioButton
      bind:value={theme}
      vertical={false}
      labelPosition="before"
      color="secondary"
      options={[
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'system', label: 'System' },
      ]}
    />
    <span class="text-xs text-slate-600">Theme: {theme}</span>
  </div>
</div>
