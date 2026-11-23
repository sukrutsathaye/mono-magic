import type {
  AtomicSize,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';

export interface ColorIntentClasses {
  readonly solid: string;
  readonly soft: string;
  readonly outline: string;
  readonly text: string;
  readonly ring: string;
}

export const COLOR_INTENT_CLASSES: Readonly<
  Record<ColorIntent, ColorIntentClasses>
> = {
  primary: {
    solid: 'bg-magic-primary text-white hover:bg-magic-primary-hover',
    soft: 'bg-magic-primary-soft text-magic-primary',
    outline: 'border border-magic-primary text-magic-primary hover:bg-magic-primary-soft',
    text: 'text-magic-primary hover:bg-magic-primary-soft',
    ring: 'focus-visible:ring-magic-primary',
  },
  secondary: {
    solid: 'bg-magic-secondary text-white hover:bg-magic-secondary-hover',
    soft: 'bg-magic-secondary-soft text-magic-secondary',
    outline: 'border border-magic-secondary text-magic-secondary hover:bg-magic-secondary-soft',
    text: 'text-magic-secondary hover:bg-magic-secondary-soft',
    ring: 'focus-visible:ring-magic-secondary',
  },
  tertiary: {
    solid: 'bg-magic-tertiary text-white hover:bg-magic-tertiary-hover',
    soft: 'bg-magic-tertiary-soft text-magic-tertiary',
    outline: 'border border-magic-tertiary text-magic-tertiary hover:bg-magic-tertiary-soft',
    text: 'text-magic-tertiary hover:bg-magic-tertiary-soft',
    ring: 'focus-visible:ring-magic-tertiary',
  },
  success: {
    solid: 'bg-magic-success text-white hover:bg-magic-success-hover',
    soft: 'bg-magic-success-soft text-magic-success',
    outline: 'border border-magic-success text-magic-success hover:bg-magic-success-soft',
    text: 'text-magic-success hover:bg-magic-success-soft',
    ring: 'focus-visible:ring-magic-success',
  },
  warning: {
    solid: 'bg-magic-warning text-white hover:bg-magic-warning-hover',
    soft: 'bg-magic-warning-soft text-magic-warning',
    outline: 'border border-magic-warning text-magic-warning hover:bg-magic-warning-soft',
    text: 'text-magic-warning hover:bg-magic-warning-soft',
    ring: 'focus-visible:ring-magic-warning',
  },
  error: {
    solid: 'bg-magic-error text-white hover:bg-magic-error-hover',
    soft: 'bg-magic-error-soft text-magic-error',
    outline: 'border border-magic-error text-magic-error hover:bg-magic-error-soft',
    text: 'text-magic-error hover:bg-magic-error-soft',
    ring: 'focus-visible:ring-magic-error',
  },
  neutral: {
    solid: 'bg-magic-neutral text-white hover:bg-magic-neutral-hover',
    soft: 'bg-magic-neutral-soft text-magic-neutral',
    outline: 'border border-magic-neutral text-magic-neutral hover:bg-magic-neutral-soft',
    text: 'text-magic-neutral hover:bg-magic-neutral-soft',
    ring: 'focus-visible:ring-magic-neutral',
  },
};

export interface AtomicSizeClasses {
  readonly padding: string;
  readonly text: string;
  readonly height: string;
  readonly icon: string;
}

export const ATOMIC_SIZE_CLASSES: Readonly<
  Record<AtomicSize, AtomicSizeClasses>
> = {
  xs: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    height: 'h-6',
    icon: 'w-3.5 h-3.5',
  },
  sm: {
    padding: 'px-2.5 py-1',
    text: 'text-sm',
    height: 'h-8',
    icon: 'w-4 h-4',
  },
  md: {
    padding: 'px-4 py-2',
    text: 'text-sm',
    height: 'h-10',
    icon: 'w-5 h-5',
  },
  lg: {
    padding: 'px-5 py-2.5',
    text: 'text-base',
    height: 'h-11',
    icon: 'w-5 h-5',
  },
  xl: {
    padding: 'px-6 py-3',
    text: 'text-lg',
    height: 'h-12',
    icon: 'w-6 h-6',
  },
};

/**
 * Returns Tailwind CSS classes for a `ColorIntent`.
 */
export function getColorIntentClasses(
  color: ColorIntent = 'primary',
): ColorIntentClasses {
  return COLOR_INTENT_CLASSES[color];
}

/**
 * Returns Tailwind CSS sizing classes for an `AtomicSize`.
 */
export function getAtomicSizeClasses(
  size: AtomicSize = 'md',
): AtomicSizeClasses {
  return ATOMIC_SIZE_CLASSES[size];
}

/**
 * Joins truthy class name tokens into a single space-delimited class string.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
