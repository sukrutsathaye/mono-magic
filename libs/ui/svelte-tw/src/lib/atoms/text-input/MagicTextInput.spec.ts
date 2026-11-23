import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import type {
  AtomicSize,
  TextInputVariant,
} from '@mono-magic/atomic-design-interfaces';
import MagicTextInput from './MagicTextInput.svelte';

describe('MagicTextInput', () => {
  it('renders label, helperText, placeholder, and fires oninput/onchange', async () => {
    const oninput = vi.fn();
    const onchange = vi.fn();
    render(MagicTextInput, {
      props: {
        id: 'email-input',
        label: 'Email address',
        placeholder: 'you@magic.dev',
        helperText: 'Work email',
        type: 'email',
        name: 'email',
        required: true,
        oninput,
        onchange,
      },
    });

    const input = screen.getByTestId('magic-text-input-input');
    expect(input).toHaveAttribute('id', 'email-input');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('required');
    expect(screen.getByTestId('magic-text-input-helper')).toHaveTextContent(
      'Work email',
    );

    await fireEvent.input(input, { target: { value: 'ada@magic.dev' } });
    expect(oninput).toHaveBeenCalledWith('ada@magic.dev');

    await fireEvent.change(input, { target: { value: 'ada@magic.dev' } });
    expect(onchange).toHaveBeenCalledWith('ada@magic.dev');
  });

  it('displays errorText with role=alert and aria-invalid', () => {
    render(MagicTextInput, {
      props: {
        label: 'Username',
        value: 'ab',
        errorText: 'Must be at least 3 characters',
        minLength: 3,
        maxLength: 20,
      },
    });

    const input = screen.getByTestId('magic-text-input-input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('magic-text-input-error')).toHaveAttribute(
      'role',
      'alert',
    );
    expect(screen.getByTestId('magic-text-input-error')).toHaveTextContent(
      'Must be at least 3 characters',
    );
  });

  it('supports variants, sizes, readOnly, and disabled states', () => {
    const variants: TextInputVariant[] = ['outlined', 'filled'];
    const sizes: AtomicSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

    for (const variant of variants) {
      const { unmount } = render(MagicTextInput, {
        props: { label: variant, variant, testId: `input-${variant}` },
      });
      expect(screen.getByTestId(`input-${variant}`)).toHaveAttribute(
        'data-variant',
        variant,
      );
      unmount();
    }

    for (const size of sizes) {
      const { unmount } = render(MagicTextInput, {
        props: { label: size, size, testId: `input-${size}` },
      });
      expect(screen.getByTestId(`input-${size}-input`)).toBeInTheDocument();
      unmount();
    }

    render(MagicTextInput, {
      props: {
        label: 'Locked',
        value: 'readonly',
        readOnly: true,
        disabled: true,
        testId: 'locked',
      },
    });
    const locked = screen.getByTestId('locked-input');
    expect(locked).toHaveAttribute('readonly');
    expect(locked).toBeDisabled();
  });
});
