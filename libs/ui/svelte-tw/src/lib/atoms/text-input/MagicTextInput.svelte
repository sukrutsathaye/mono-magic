<script lang="ts">
  import type {
    AtomicSize,
    TextInputAtomProps,
    TextInputType,
  } from '@mono-magic/atomic-design-interfaces';
  import { cn, getAtomicSizeClasses } from '../../theme';

  export interface MagicTextInputProps extends TextInputAtomProps {
    type?: TextInputType;
    name?: string;
    autocomplete?: string;
    minLength?: number;
    maxLength?: number;
    oninput?: (value: string) => void;
    onchange?: (value: string) => void;
  }

  let {
    id,
    testId = 'magic-text-input',
    ariaLabel,
    disabled = false,
    label,
    value = $bindable(''),
    placeholder,
    helperText,
    errorText,
    variant = 'outlined',
    size = 'md',
    required = false,
    readOnly = false,
    type = 'text',
    name,
    autocomplete,
    minLength,
    maxLength,
    oninput,
    onchange,
  }: MagicTextInputProps = $props();

  const sizeClasses = $derived(getAtomicSizeClasses(size as AtomicSize));
  const inputId = $derived(id ?? `${testId}-input`);
  const descriptionId = $derived(`${inputId}-description`);
  const hasError = $derived(Boolean(errorText && errorText.length > 0));
  const hasDescription = $derived(hasError || Boolean(helperText));

  function handleInput(event: Event): void {
    const next = (event.currentTarget as HTMLInputElement).value;
    value = next;
    oninput?.(next);
  }

  function handleChange(event: Event): void {
    const next = (event.currentTarget as HTMLInputElement).value;
    value = next;
    onchange?.(next);
  }
</script>

<div
  data-testid={testId}
  data-variant={variant}
  data-invalid={hasError ? 'true' : undefined}
  class={cn('flex w-full flex-col gap-1', disabled && 'opacity-60')}
>
  <label
    for={inputId}
    class="text-sm font-medium text-slate-700"
  >
    {label}{#if required}<span class="ml-0.5 text-magic-error" aria-hidden="true">*</span>{/if}
  </label>

  <input
    id={inputId}
    {type}
    {name}
    {value}
    {placeholder}
    {disabled}
    {required}
    readonly={readOnly}
    autocomplete={autocomplete as AutoFill | undefined}
    minlength={minLength}
    maxlength={maxLength}
    aria-label={ariaLabel ?? label}
    aria-invalid={hasError ? 'true' : undefined}
    aria-describedby={hasDescription ? descriptionId : undefined}
    data-testid={`${testId}-input`}
    oninput={handleInput}
    onchange={handleChange}
    class={cn(
      'w-full text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2',
      sizeClasses.padding,
      sizeClasses.text,
      sizeClasses.height,
      variant === 'filled'
        ? 'rounded-t-md border-b-2 bg-slate-100 hover:bg-slate-200/70'
        : 'rounded-md border bg-white',
      hasError
        ? 'border-magic-error focus:border-magic-error focus:ring-magic-error/30'
        : 'border-slate-300 focus:border-magic-primary focus:ring-magic-primary/30',
      disabled && 'cursor-not-allowed bg-slate-100',
      readOnly && 'bg-slate-50',
    )}
  />

  {#if hasError}
    <p
      id={descriptionId}
      role="alert"
      data-testid={`${testId}-error`}
      class="text-xs font-medium text-magic-error"
    >
      {errorText}
    </p>
  {:else if helperText}
    <p
      id={descriptionId}
      data-testid={`${testId}-helper`}
      class="text-xs text-slate-500"
    >
      {helperText}
    </p>
  {/if}
</div>
