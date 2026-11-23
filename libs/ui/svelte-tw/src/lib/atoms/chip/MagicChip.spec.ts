import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import type { ChipItem } from '@mono-magic/atomic-design-interfaces';
import MagicChip from './MagicChip.svelte';

describe('MagicChip', () => {
  it('renders single label chip and emits remove on close click', async () => {
    const onremove = vi.fn();
    render(MagicChip, {
      props: {
        id: 'single-chip',
        label: 'Svelte 5',
        color: 'success',
        removable: true,
        onremove,
      },
    });

    const root = screen.getByTestId('magic-chip');
    expect(root).toHaveAttribute('id', 'single-chip');
    expect(screen.getByText('Svelte 5')).toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('magic-chip-remove-0'));
    expect(onremove).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Svelte 5' }),
      0,
    );
  });

  it('supports single and multiple selection in selectable mode', async () => {
    const onselect = vi.fn();
    const chips: ChipItem[] = [
      { id: 'ts', label: 'TypeScript', selected: true },
      { id: 'sv', label: 'Svelte' },
      { id: 'tw', label: 'Tailwind', disabled: true },
    ];

    render(MagicChip, {
      props: {
        chips,
        variant: 'selectable',
        multiple: true,
        onselect,
      },
    });

    expect(screen.getByTestId('magic-chip-check-0')).toBeInTheDocument();

    await fireEvent.click(screen.getByTestId('magic-chip-item-1'));
    expect(onselect).toHaveBeenCalledTimes(1);
    expect(onselect.mock.calls[0][0].map((c: ChipItem) => c.label)).toEqual([
      'TypeScript',
      'Svelte',
    ]);

    // Disabled chip ignores clicks
    await fireEvent.click(screen.getByTestId('magic-chip-item-2'));
    expect(onselect).toHaveBeenCalledTimes(1);
  });

  it('supports single-select mode and inline editing on double-click', async () => {
    const onselect = vi.fn();
    const onedit = vi.fn();
    render(MagicChip, {
      props: {
        chips: [
          { id: 'a', label: 'Alpha', selected: true },
          { id: 'b', label: 'Beta' },
        ],
        selectable: true,
        multiple: false,
        editable: true,
        onselect,
        onedit,
      },
    });

    await fireEvent.click(screen.getByTestId('magic-chip-item-1'));
    expect(onselect.mock.calls[0][0].map((c: ChipItem) => c.label)).toEqual([
      'Beta',
    ]);

    await fireEvent.dblClick(screen.getByTestId('magic-chip-item-0'));
    const editInput = screen.getByTestId('magic-chip-edit-0');
    await fireEvent.input(editInput, { target: { value: 'Alpha Prime' } });
    await fireEvent.keyDown(editInput, { key: 'Enter' });
    expect(onedit).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Alpha Prime' }),
      0,
    );
  });

  it('supports input variant for adding chips via Enter or comma and draggable reorder', async () => {
    const onadd = vi.fn();
    const onreorder = vi.fn();
    render(MagicChip, {
      props: {
        chips: [
          { id: '1', label: 'One' },
          { id: '2', label: 'Two' },
        ],
        variant: 'input',
        inputPlaceholder: 'Add tag...',
        onadd,
      },
    });

    const input = screen.getByTestId('magic-chip-input');
    await fireEvent.input(input, { target: { value: 'Three' } });
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(onadd).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Three', removable: true }),
    );
    expect(screen.getByText('Three')).toBeInTheDocument();

    const { unmount } = render(MagicChip, {
      props: {
        testId: 'drag-chips',
        chips: [
          { id: 'x', label: 'First' },
          { id: 'y', label: 'Second' },
        ],
        variant: 'draggable',
        orientation: 'vertical',
        onreorder,
      },
    });

    await fireEvent.dragStart(screen.getByTestId('drag-chips-item-0'));
    await fireEvent.drop(screen.getByTestId('drag-chips-item-1'));
    expect(onreorder).toHaveBeenCalledTimes(1);
    expect(onreorder.mock.calls[0][0].map((c: ChipItem) => c.label)).toEqual([
      'Second',
      'First',
    ]);
    unmount();
  });
});
