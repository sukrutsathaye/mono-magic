import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import MagicSlideToggle from './MagicSlideToggle.svelte';

describe('MagicSlideToggle', () => {
  it('toggles checked state and emits onchange', async () => {
    const onchange = vi.fn();
    render(MagicSlideToggle, {
      props: {
        id: 'autosave-switch',
        label: 'Auto-save',
        checked: false,
        required: true,
        name: 'autosave',
        onchange,
      },
    });

    const control = screen.getByTestId('magic-slide-toggle-control');
    expect(control).toHaveAttribute('id', 'autosave-switch');
    expect(screen.getByTestId('magic-slide-toggle-icon')).toHaveTextContent('×');

    await fireEvent.click(control);
    expect(onchange).toHaveBeenCalledWith(true);
    expect(screen.getByTestId('magic-slide-toggle-icon')).toHaveTextContent('✓');
  });

  it('supports hideIcon, labelPosition="before", colors, and sizes', () => {
    render(MagicSlideToggle, {
      props: {
        label: 'Compact Mode',
        checked: true,
        hideIcon: true,
        labelPosition: 'before',
        color: 'tertiary',
        size: 'lg',
        disableRipple: true,
      },
    });

    const root = screen.getByTestId('magic-slide-toggle');
    expect(root).toHaveAttribute('data-label-position', 'before');
    expect(root).toHaveAttribute('data-disable-ripple', 'true');
    expect(
      screen.queryByTestId('magic-slide-toggle-icon'),
    ).not.toBeInTheDocument();
  });

  it('blocks toggle when disabled or disabledInteractive', async () => {
    const onchange = vi.fn();
    render(MagicSlideToggle, {
      props: {
        label: 'Locked',
        checked: true,
        disabled: true,
        disabledInteractive: true,
        onchange,
      },
    });

    await fireEvent.click(screen.getByTestId('magic-slide-toggle-control'));
    expect(onchange).not.toHaveBeenCalled();
  });
});
