import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import MagicButtonToggle from './MagicButtonToggle.svelte';

const ALIGN_OPTIONS = [
  { value: 'left', label: 'Left', icon: '⬅' },
  { value: 'center', label: 'Center', icon: '⬌' },
  { value: 'right', label: 'Right', disabled: true },
];

describe('MagicButtonToggle', () => {
  it('supports single selection mode and emits onchange', async () => {
    const onchange = vi.fn();
    render(MagicButtonToggle, {
      props: {
        id: 'align-toggle',
        options: ALIGN_OPTIONS,
        value: 'left',
        name: 'alignment',
        ariaLabel: 'Text alignment',
        onchange,
      },
    });

    expect(screen.getByTestId('magic-button-toggle')).toHaveAttribute(
      'id',
      'align-toggle',
    );
    expect(screen.getByTestId('magic-button-toggle-check-left')).toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('magic-button-toggle-item-center'));
    expect(onchange).toHaveBeenCalledWith('center');
    expect(
      screen.getByTestId('magic-button-toggle-check-center'),
    ).toBeInTheDocument();
  });

  it('prevents deselecting the active item when required=true in single mode', async () => {
    const onchange = vi.fn();
    render(MagicButtonToggle, {
      props: {
        options: ALIGN_OPTIONS,
        value: 'left',
        required: true,
        onchange,
      },
    });

    await fireEvent.click(screen.getByTestId('magic-button-toggle-item-left'));
    expect(onchange).not.toHaveBeenCalled();
  });

  it('supports multiple selection mode, vertical layout, legacy appearance, and hideSelectionIndicator', async () => {
    const onchange = vi.fn();
    render(MagicButtonToggle, {
      props: {
        options: [
          { value: 'bold', label: 'Bold' },
          { value: 'italic', label: 'Italic' },
          { value: 'underline', label: 'Underline' },
        ],
        value: ['bold'],
        selectionMode: 'multiple',
        vertical: true,
        appearance: 'legacy',
        hideSelectionIndicator: true,
        color: 'secondary',
        size: 'sm',
        name: 'formatting',
        onchange,
      },
    });

    const root = screen.getByTestId('magic-button-toggle');
    expect(root).toHaveAttribute('data-selection-mode', 'multiple');
    expect(root).toHaveAttribute('data-orientation', 'vertical');
    expect(root).toHaveAttribute('data-appearance', 'legacy');
    expect(
      screen.queryByTestId('magic-button-toggle-check-bold'),
    ).not.toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('magic-button-toggle-item-italic'));
    expect(onchange).toHaveBeenCalledWith(['bold', 'italic']);
  });

  it('respects disabled and disabledInteractive states', async () => {
    const onchange = vi.fn();
    render(MagicButtonToggle, {
      props: {
        options: ALIGN_OPTIONS,
        value: 'left',
        disabled: true,
        disabledInteractive: true,
        onchange,
      },
    });

    await fireEvent.click(screen.getByTestId('magic-button-toggle-item-center'));
    expect(onchange).not.toHaveBeenCalled();
  });
});
