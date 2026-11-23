<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Button as BitsButton } from 'bits-ui';
  import type {
    AtomicSize,
    ButtonAtomProps,
    ButtonKind,
    ButtonShape,
    ButtonType,
    ButtonVariant,
    ColorIntent,
  } from '@mono-magic/atomic-design-interfaces';
  import {
    cn,
    getAtomicSizeClasses,
    getColorIntentClasses,
  } from '../../theme';

  export interface MagicButtonProps extends ButtonAtomProps {
    type?: ButtonType;
    onclick?: (event: MouseEvent) => void;
    children?: Snippet;
  }

  let {
    id,
    testId = 'magic-button',
    ariaLabel,
    disabled = false,
    label,
    variant = 'filled',
    color = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leadingIcon,
    trailingIcon,
    kind = 'default',
    shape = 'default',
    disabledInteractive = false,
    disableRipple = false,
    type = 'button',
    onclick,
    children,
  }: MagicButtonProps = $props();

  const SHAPE_CLASSES: Readonly<Record<ButtonShape, string>> = {
    default: 'rounded-lg',
    square: 'rounded-none',
    rounded: 'rounded-xl',
    pill: 'rounded-full',
  };

  const ICON_ONLY_SIZE: Readonly<Record<AtomicSize, string>> = {
    xs: 'h-7 w-7 p-1',
    sm: 'h-8 w-8 p-1.5',
    md: 'h-10 w-10 p-2',
    lg: 'h-11 w-11 p-2.5',
    xl: 'h-12 w-12 p-3',
  };

  const colorClasses = $derived(getColorIntentClasses(color as ColorIntent));
  const sizeClasses = $derived(getAtomicSizeClasses(size as AtomicSize));
  const isBlocked = $derived(disabled || loading);
  const isNativeDisabled = $derived(isBlocked && !disabledInteractive);
  const isIconOnly = $derived(
    kind === 'icon' || kind === 'fab' || kind === 'mini-fab',
  );

  const variantClasses = $derived.by(() => {
    const v = variant as ButtonVariant;
    if (v === 'tonal') return colorClasses.soft;
    if (v === 'outlined') return colorClasses.outline;
    if (v === 'elevated') return cn(colorClasses.solid, 'shadow-md hover:shadow-lg');
    if (v === 'text') return colorClasses.text;
    return colorClasses.solid;
  });

  const kindClasses = $derived.by(() => {
    const k = kind as ButtonKind;
    if (k === 'fab') return 'h-14 w-14 rounded-2xl shadow-lg p-0';
    if (k === 'mini-fab') return 'h-10 w-10 rounded-xl shadow-md p-0';
    if (k === 'extended-fab') return cn(sizeClasses.padding, sizeClasses.height, 'rounded-2xl shadow-lg');
    if (k === 'icon') return cn(ICON_ONLY_SIZE[size as AtomicSize], SHAPE_CLASSES[shape as ButtonShape]);
    return cn(sizeClasses.padding, sizeClasses.height, SHAPE_CLASSES[shape as ButtonShape]);
  });

  function handleClick(event: MouseEvent): void {
    if (isBlocked) {
      event.preventDefault();
      return;
    }
    onclick?.(event);
  }
</script>

<BitsButton.Root
  {id}
  {type}
  disabled={isNativeDisabled}
  aria-disabled={isBlocked ? 'true' : undefined}
  aria-busy={loading ? 'true' : undefined}
  aria-label={ariaLabel ?? (isIconOnly ? label : undefined)}
  data-testid={testId}
  data-variant={variant}
  data-kind={kind}
  data-shape={shape}
  data-disable-ripple={disableRipple ? 'true' : undefined}
  onclick={handleClick}
  class={cn(
    'inline-flex items-center justify-center gap-2 font-medium transition-all select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    colorClasses.ring,
    sizeClasses.text,
    variantClasses,
    kindClasses,
    fullWidth && 'w-full',
    isBlocked && 'opacity-50 cursor-not-allowed',
    !disableRipple && !isBlocked && 'active:scale-[0.98]',
  )}
>
  {#if loading}
    <span
      aria-hidden="true"
      data-testid={`${testId}-spinner`}
      class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    ></span>
  {:else if leadingIcon}
    <span aria-hidden="true" data-testid={`${testId}-leading-icon`}>{leadingIcon}</span>
  {/if}

  {#if !isIconOnly}
    {#if children}
      {@render children()}
    {:else}
      <span>{label}</span>
    {/if}
  {:else if !leadingIcon && !loading}
    <span aria-hidden="true">{label}</span>
  {/if}

  {#if trailingIcon && !loading && !isIconOnly}
    <span aria-hidden="true" data-testid={`${testId}-trailing-icon`}>{trailingIcon}</span>
  {/if}
</BitsButton.Root>
