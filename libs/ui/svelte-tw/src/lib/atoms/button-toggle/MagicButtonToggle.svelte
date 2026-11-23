<script lang="ts">
  import { ToggleGroup } from 'bits-ui';
  import type {
    AtomicSize,
    ButtonToggleAtomProps,
    ButtonToggleOption,
    ColorIntent,
  } from '@mono-magic/atomic-design-interfaces';
  import {
    cn,
    getAtomicSizeClasses,
    getColorIntentClasses,
  } from '../../theme';

  export interface MagicButtonToggleProps extends ButtonToggleAtomProps<string> {
    onchange?: (value: string | readonly string[] | undefined) => void;
  }

  let {
    id,
    testId = 'magic-button-toggle',
    ariaLabel,
    disabled = false,
    options = [],
    value = $bindable<string | readonly string[] | undefined>(undefined),
    selectionMode = 'single',
    vertical = false,
    appearance = 'standard',
    hideSelectionIndicator = false,
    disabledInteractive = false,
    size = 'md',
    color = 'primary',
    name,
    required = false,
    onchange,
  }: MagicButtonToggleProps = $props();

  const colorClasses = $derived(getColorIntentClasses(color as ColorIntent));
  const sizeClasses = $derived(getAtomicSizeClasses(size as AtomicSize));

  const singleValue = $derived(
    typeof value === 'string' ? value : '',
  );

  const multipleValue = $derived(
    Array.isArray(value) ? [...value] : typeof value === 'string' && value ? [value] : [],
  );

  function isSelected(optionValue: string): boolean {
    if (selectionMode === 'multiple') {
      return multipleValue.includes(optionValue);
    }
    return singleValue === optionValue;
  }

  function handleSingleChange(next: string): void {
    if (disabled && disabledInteractive) return;
    if (required && !next) return;
    const resolved = next || undefined;
    value = resolved;
    onchange?.(resolved);
  }

  function handleMultipleChange(next: string[]): void {
    if (disabled && disabledInteractive) return;
    if (required && next.length === 0) return;
    value = next;
    onchange?.(next);
  }

  const groupClass = $derived(
    cn(
      'inline-flex overflow-hidden border border-slate-300 bg-white',
      appearance === 'legacy' ? 'rounded-none' : 'rounded-lg',
      vertical ? 'flex-col divide-y divide-slate-300' : 'flex-row divide-x divide-slate-300',
      disabled && 'opacity-50',
    ),
  );
</script>

{#snippet renderItems(items: readonly ButtonToggleOption<string>[])}
  {#each items as option (option.value)}
    {@const selected = isSelected(option.value)}
    {@const itemDisabled = Boolean(disabled || option.disabled)}
    <ToggleGroup.Item
      value={option.value}
      disabled={itemDisabled && !disabledInteractive}
      aria-disabled={itemDisabled ? 'true' : undefined}
      aria-label={option.ariaLabel ?? option.label}
      data-testid={`${testId}-item-${option.value}`}
      class={cn(
        'inline-flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
        colorClasses.ring,
        sizeClasses.padding,
        sizeClasses.text,
        sizeClasses.height,
        selected ? colorClasses.soft : 'text-slate-700 hover:bg-slate-100',
        itemDisabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      {#if selected && !hideSelectionIndicator}
        <span aria-hidden="true" data-testid={`${testId}-check-${option.value}`}>✓</span>
      {/if}
      {#if option.icon}
        <span aria-hidden="true">{option.icon}</span>
      {/if}
      <span>{option.label}</span>
    </ToggleGroup.Item>
  {/each}
{/snippet}

<div
  {id}
  data-testid={testId}
  data-appearance={appearance}
  data-selection-mode={selectionMode}
  data-orientation={vertical ? 'vertical' : 'horizontal'}
  class="inline-flex flex-col"
>
  {#if name}
    <input
      type="hidden"
      {name}
      value={selectionMode === 'multiple' ? multipleValue.join(',') : singleValue}
      {required}
    />
  {/if}

  {#if selectionMode === 'multiple'}
    <ToggleGroup.Root
      type="multiple"
      value={multipleValue}
      onValueChange={handleMultipleChange}
      disabled={disabled && !disabledInteractive}
      orientation={vertical ? 'vertical' : 'horizontal'}
      aria-label={ariaLabel ?? 'Toggle group'}
      class={groupClass}
    >
      {@render renderItems(options)}
    </ToggleGroup.Root>
  {:else}
    <ToggleGroup.Root
      type="single"
      value={singleValue}
      onValueChange={handleSingleChange}
      disabled={disabled && !disabledInteractive}
      orientation={vertical ? 'vertical' : 'horizontal'}
      aria-label={ariaLabel ?? 'Toggle group'}
      class={groupClass}
    >
      {@render renderItems(options)}
    </ToggleGroup.Root>
  {/if}
</div>
