import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import type {
  AtomicSize,
  ButtonKind,
  ButtonShape,
  ButtonVariant,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import MagicButton from './MagicButton.svelte';

describe('MagicButton', () => {
  it('renders label, icons, and fires onclick handler', async () => {
    const onclick = vi.fn();
    render(MagicButton, {
      props: {
        id: 'save-btn',
        label: 'Save Changes',
        leadingIcon: '💾',
        trailingIcon: '→',
        onclick,
      },
    });

    const btn = screen.getByTestId('magic-button');
    expect(btn).toHaveAttribute('id', 'save-btn');
    expect(btn).toHaveTextContent('Save Changes');
    expect(screen.getByTestId('magic-button-leading-icon')).toHaveTextContent('💾');
    expect(screen.getByTestId('magic-button-trailing-icon')).toHaveTextContent('→');

    await fireEvent.click(btn);
    expect(onclick).toHaveBeenCalledTimes(1);
  });

  it('blocks clicks when disabled, disabledInteractive, or loading', async () => {
    const onclick = vi.fn();
    const { rerender } = render(MagicButton, {
      props: { label: 'Submit', disabled: true, onclick },
    });

    const btn = screen.getByTestId('magic-button');
    expect(btn).toBeDisabled();
    await fireEvent.click(btn);
    expect(onclick).not.toHaveBeenCalled();

    rerender({
      label: 'Submit',
      disabled: true,
      disabledInteractive: true,
      onclick,
    });
    expect(btn).not.toBeDisabled();
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    await fireEvent.click(btn);
    expect(onclick).not.toHaveBeenCalled();

    rerender({
      label: 'Saving',
      loading: true,
      disabled: false,
      disabledInteractive: false,
      onclick,
    });
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByTestId('magic-button-spinner')).toBeInTheDocument();
  });

  it('supports all variants, colors, sizes, kinds, shapes, fullWidth, and disableRipple', () => {
    const variants: ButtonVariant[] = [
      'filled',
      'tonal',
      'outlined',
      'elevated',
      'text',
    ];
    const colors: ColorIntent[] = [
      'primary',
      'secondary',
      'tertiary',
      'success',
      'warning',
      'error',
      'neutral',
    ];
    const kinds: ButtonKind[] = [
      'default',
      'icon',
      'fab',
      'mini-fab',
      'extended-fab',
    ];
    const shapes: ButtonShape[] = ['default', 'square', 'rounded', 'pill'];
    const sizes: AtomicSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

    for (const variant of variants) {
      const { unmount } = render(MagicButton, {
        props: { label: variant, variant, testId: `btn-${variant}` },
      });
      expect(screen.getByTestId(`btn-${variant}`)).toHaveAttribute(
        'data-variant',
        variant,
      );
      unmount();
    }

    for (const color of colors) {
      const { unmount } = render(MagicButton, {
        props: { label: color, color, testId: `btn-${color}` },
      });
      expect(screen.getByTestId(`btn-${color}`)).toHaveClass(
        `bg-magic-${color}`,
      );
      unmount();
    }

    for (const kind of kinds) {
      const { unmount } = render(MagicButton, {
        props: {
          label: '+',
          kind,
          ariaLabel: `Action ${kind}`,
          testId: `btn-${kind}`,
        },
      });
      const el = screen.getByTestId(`btn-${kind}`);
      expect(el).toHaveAttribute('data-kind', kind);
      expect(el).toHaveAttribute('aria-label', `Action ${kind}`);
      unmount();
    }

    for (const shape of shapes) {
      const { unmount } = render(MagicButton, {
        props: {
          label: shape,
          shape,
          fullWidth: true,
          disableRipple: true,
          testId: `btn-${shape}`,
        },
      });
      const el = screen.getByTestId(`btn-${shape}`);
      expect(el).toHaveAttribute('data-shape', shape);
      expect(el).toHaveClass('w-full');
      expect(el).toHaveAttribute('data-disable-ripple', 'true');
      unmount();
    }

    for (const size of sizes) {
      const { unmount } = render(MagicButton, {
        props: { label: size, size, testId: `btn-${size}` },
      });
      expect(screen.getByTestId(`btn-${size}`)).toBeInTheDocument();
      unmount();
    }
  });
});
