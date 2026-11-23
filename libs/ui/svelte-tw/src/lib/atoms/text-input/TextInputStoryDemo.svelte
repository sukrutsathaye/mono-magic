<script lang="ts">
  import MagicTextInput from './MagicTextInput.svelte';

  let email = $state('');
  let password = $state('');
  let projectCode = $state('ab');

  const emailError = $derived(
    email && !email.includes('@') ? 'Enter a valid email containing @' : undefined,
  );
  const codeError = $derived(
    projectCode.length < 3 ? 'Must be between 3 and 12 characters' : undefined,
  );
</script>

<div class="flex max-w-md flex-col gap-4 p-4">
  <MagicTextInput
    bind:value={email}
    testId="demo-email"
    label="Work Email"
    type="email"
    required
    placeholder="ada@mono-magic.dev"
    helperText="Use your team email address"
    errorText={emailError}
  />

  <MagicTextInput
    bind:value={password}
    testId="demo-password"
    label="Password"
    type="password"
    variant="filled"
    required
    placeholder="Minimum 6 characters"
  />

  <MagicTextInput
    bind:value={projectCode}
    testId="demo-code"
    label="Project Code"
    required
    minLength={3}
    maxLength={12}
    errorText={codeError}
  />

  <MagicTextInput
    label="Read-only Token"
    value="magic_live_98a7bc"
    readOnly
  />

  <MagicTextInput
    label="Disabled Field"
    value="Locked value"
    disabled
  />

  <span class="text-xs text-slate-600" data-testid="input-demo-status">
    Email: {email || '(empty)'} | Code: {projectCode}
  </span>
</div>
