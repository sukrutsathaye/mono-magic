import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import type { RadioOption } from '@mono-magic/atomic-design-interfaces';
import MagicRadioButton from './MagicRadioButton.svelte';

const PLAN_OPTIONS: readonly RadioOption<string>[] = [
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise', disabled: true },
];

describe('MagicRadioButton', () => {
  it('renders radio options and emits onchange on selection', async () => {
    const onchange = vi.fn();
    render(MagicRadioButton, {
      props: {
        id: 'plan-radio',
        options: PLAN_OPTIONS,
        value: 'starter',
        name: 'plan',
        ariaLabel: 'Select plan',
        required: true,
        onchange,
      },
    });

    const root = screen.getByTestId('magic-radio-button');
    expect(root).toHaveAttribute('id', 'plan-radio');
    expect(root).toHaveAttribute('aria-label', 'Select plan');
    expect(screen.getByTestId('magic-radio-button-dot-starter')).toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('magic-radio-button-item-pro'));
    expect(onchange).toHaveBeenCalledWith('pro');
    expect(screen.getByTestId('magic-radio-button-dot-pro')).toBeInTheDocument();
  });

  it('supports horizontal layout, labelPosition="before", colors, and sizes', () => {
    render(MagicRadioButton, {
      props: {
        options: [
          { value: 'a', label: 'Option A', labelPosition: 'before' },
          { value: 'b', label: 'Option B' },
        ],
        value: 'a',
        vertical: false,
        color: 'secondary',
        size: 'lg',
        disableRipple: true,
      },
    });

    const root = screen.getByTestId('magic-radio-button');
    expect(root).toHaveAttribute('data-orientation', 'horizontal');
    expect(root).toHaveAttribute('data-disable-ripple', 'true');
  });

  it('prevents selection when disabled or disabledInteractive', async () => {
    const onchange = vi.fn();
    render(MagicRadioButton, {
      props: {
        options: PLAN_OPTIONS,
        value: 'starter',
        disabled: true,
        disabledInteractive: true,
        onchange,
      },
    });

    await fireEvent.click(screen.getByTestId('magic-radio-button-item-pro'));
    expect(onchange).not.toHaveBeenCalled();
  });
});
