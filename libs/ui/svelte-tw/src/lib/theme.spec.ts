import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import ThemePreview from './ThemePreview.svelte';
import { cn, getAtomicSizeClasses, getColorIntentClasses } from './theme';

describe('svelte-tw theme helpers', () => {
  it('returns Tailwind classes for every ColorIntent', () => {
    const intents: ColorIntent[] = [
      'primary',
      'secondary',
      'tertiary',
      'success',
      'warning',
      'error',
      'neutral',
    ];

    for (const intent of intents) {
      const classes = getColorIntentClasses(intent);
      expect(classes.solid).toContain(`bg-magic-${intent}`);
      expect(classes.soft).toContain(`bg-magic-${intent}-soft`);
      expect(classes.outline).toContain(`border-magic-${intent}`);
      expect(classes.text).toContain(`text-magic-${intent}`);
      expect(classes.ring).toContain(`ring-magic-${intent}`);
    }
    expect(getColorIntentClasses()).toEqual(getColorIntentClasses('primary'));
  });

  it('returns Tailwind classes for every AtomicSize', () => {
    const sizes: AtomicSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

    for (const size of sizes) {
      const classes = getAtomicSizeClasses(size);
      expect(classes.padding).toBeTruthy();
      expect(classes.text).toBeTruthy();
      expect(classes.height).toBeTruthy();
      expect(classes.icon).toBeTruthy();
    }
    expect(getAtomicSizeClasses()).toEqual(getAtomicSizeClasses('md'));
  });

  it('joins truthy class tokens with cn()', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('renders Svelte 5 ThemePreview component in jsdom', () => {
    render(ThemePreview);
    expect(screen.getByTestId('magic-theme-preview')).toBeInTheDocument();
    expect(screen.getByText('primary')).toBeInTheDocument();
    expect(screen.getByText('neutral')).toBeInTheDocument();
  });
});
