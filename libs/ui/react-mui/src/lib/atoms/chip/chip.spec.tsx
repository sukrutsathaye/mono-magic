import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AtomicSize,
  ChipItem,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicChip } from './chip';

afterEach(cleanup);

describe('MagicChip (React MUI)', () => {
  it('renders single fallback chip when chips array is omitted in basic mode and forwards ref', () => {
    const rootRef = createRef<HTMLDivElement>();

    render(
      <MagicMuiThemeProvider>
        <MagicChip
          ref={rootRef}
          id="single-chip"
          testId="magic-chip-root"
          label="Fallback Chip"
        />
      </MagicMuiThemeProvider>,
    );

    const root = screen.getByTestId('magic-chip-root');
    expect(rootRef.current).toBe(root);
    expect(root.id).toBe('single-chip');
    expect(root.textContent).toContain('Fallback Chip');
  });

  it('supports basic variant with avatarSrc, leadingIcon, removable delete icon, and keyboard Delete', () => {
    const onRemoved = vi.fn();
    const onChipsChange = vi.fn();
    const items: ChipItem[] = [
      {
        id: 'c1',
        label: 'Avatar Chip',
        avatarSrc: 'https://example.com/a.png',
        avatarAlt: 'User Avatar',
      },
      {
        id: 'c2',
        label: 'Icon Chip',
        leadingIcon: 'star',
      },
      {
        id: 'c3',
        label: 'Locked Chip',
        disabled: true,
      },
    ];

    render(
      <MagicMuiThemeProvider>
        <MagicChip
          defaultChips={items}
          removable
          onRemoved={onRemoved}
          onChipsChange={onChipsChange}
        />
      </MagicMuiThemeProvider>,
    );

    expect(screen.getByAltText('User Avatar')).toBeTruthy();
    expect(screen.getByText('star')).toBeTruthy();

    // Remove first chip via keyboard Delete
    const firstChip = screen.getByTestId('magic-chip-item-0');
    fireEvent.keyDown(firstChip, { key: 'Delete' });
    expect(onRemoved).toHaveBeenCalledWith(items[0]);
    expect(onChipsChange).toHaveBeenCalledTimes(1);

    // Remove remaining active chip via delete icon click
    const nextFirstChip = screen.getByTestId('magic-chip-item-0');
    const deleteSvg = nextFirstChip.querySelector('.MuiChip-deleteIcon');
    expect(deleteSvg).toBeTruthy();
    if (deleteSvg) {
      fireEvent.click(deleteSvg);
    }
    expect(onRemoved).toHaveBeenCalledWith(items[1]);
  });

  it('supports selectable variant in both multiple and single-select modes and hideSelectionIndicator', () => {
    const onSelectionChange = vi.fn();
    const onChipsChange = vi.fn();
    const items: ChipItem[] = [
      { id: 'opt1', label: 'Option 1', selected: true },
      { id: 'opt2', label: 'Option 2', selected: false },
      { id: 'opt3', label: 'Non-selectable', selectable: false },
    ];

    const { rerender } = render(
      <MagicMuiThemeProvider>
        <MagicChip
          variant="selectable"
          multiple={true}
          defaultChips={items}
          onSelectionChange={onSelectionChange}
          onChipsChange={onChipsChange}
        />
      </MagicMuiThemeProvider>,
    );

    // Check icon is rendered for selected item
    expect(screen.getByTestId('chip-check-opt1')).toBeTruthy();

    // Click Option 2 -> both opt1 and opt2 selected
    fireEvent.click(screen.getByTestId('magic-chip-item-1'));
    expect(onSelectionChange).toHaveBeenCalledWith(['opt1', 'opt2']);

    // Clicking non-selectable item does nothing
    fireEvent.click(screen.getByTestId('magic-chip-item-2'));
    expect(onSelectionChange).toHaveBeenCalledTimes(1);

    // Rerender in single-select mode with hideSelectionIndicator
    rerender(
      <MagicMuiThemeProvider>
        <MagicChip
          variant="selectable"
          multiple={false}
          hideSelectionIndicator
          chips={items}
          onSelectionChange={onSelectionChange}
        />
      </MagicMuiThemeProvider>,
    );

    expect(screen.queryByTestId('chip-check-opt1')).toBeNull();
    fireEvent.click(screen.getByTestId('magic-chip-item-1'));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['opt2']);
  });

  it('supports input variant: add via Enter/comma, remove via Backspace, and edit via double-click (Enter, Escape, empty removal)', () => {
    const onAdded = vi.fn();
    const onEdited = vi.fn();
    const onRemoved = vi.fn();
    const items: ChipItem[] = [
      { id: 'tag1', label: 'Alpha' },
      { id: 'tag2', label: 'Beta' },
    ];

    render(
      <MagicMuiThemeProvider>
        <MagicChip
          variant="input"
          removable
          editable
          defaultChips={items}
          onAdded={onAdded}
          onEdited={onEdited}
          onRemoved={onRemoved}
        />
      </MagicMuiThemeProvider>,
    );

    const input = screen.getByTestId('magic-chip-input') as HTMLInputElement;

    // Add via Enter
    fireEvent.change(input, { target: { value: 'Gamma' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onAdded).toHaveBeenCalledWith('Gamma');
    expect(screen.getByText('Gamma')).toBeTruthy();

    // Add via trailing comma in change event
    fireEvent.change(input, { target: { value: 'Delta,' } });
    expect(onAdded).toHaveBeenCalledWith('Delta');

    // Empty Enter does nothing
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: ',' });
    expect(onAdded).toHaveBeenCalledTimes(2);

    // Backspace on empty input removes last chip ('Delta')
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(onRemoved).toHaveBeenCalledTimes(1);

    // Double-click first chip ('Alpha') to edit and press Escape to cancel
    fireEvent.doubleClick(screen.getByTestId('magic-chip-item-0'));
    const editInputCancel = screen.getByTestId(
      'chip-edit-input-0',
    ) as HTMLInputElement;
    fireEvent.change(editInputCancel, { target: { value: 'Cancelled' } });
    fireEvent.keyDown(editInputCancel, { key: 'Escape' });
    expect(onEdited).not.toHaveBeenCalled();

    // Double-click first chip ('Alpha') to edit and press Enter to commit
    fireEvent.doubleClick(screen.getByTestId('magic-chip-item-0'));
    const editInputCommit = screen.getByTestId(
      'chip-edit-input-0',
    ) as HTMLInputElement;
    fireEvent.change(editInputCommit, { target: { value: 'Alpha Edited' } });
    fireEvent.keyDown(editInputCommit, { key: 'Enter' });
    expect(onEdited).toHaveBeenCalledWith({
      id: 'tag1',
      label: 'Alpha Edited',
    });

    // Double-click second chip ('Beta'), clear text, and blur -> removes chip
    fireEvent.doubleClick(screen.getByTestId('magic-chip-item-1'));
    const editInputEmpty = screen.getByTestId(
      'chip-edit-input-1',
    ) as HTMLInputElement;
    fireEvent.change(editInputEmpty, { target: { value: '   ' } });
    fireEvent.blur(editInputEmpty);
    expect(onRemoved).toHaveBeenCalledTimes(2);
  });

  it('supports draggable variant: drag-and-drop and keyboard ArrowLeft/ArrowRight reordering', () => {
    const onChipsChange = vi.fn();
    const items: ChipItem[] = [
      { id: 'd1', label: 'First' },
      { id: 'd2', label: 'Second' },
      { id: 'd3', label: 'Third' },
    ];

    render(
      <MagicMuiThemeProvider>
        <MagicChip
          variant="draggable"
          orientation="vertical"
          defaultChips={items}
          onChipsChange={onChipsChange}
        />
      </MagicMuiThemeProvider>,
    );

    expect(screen.getByTestId('chip-drag-handle-d1')).toBeTruthy();

    // Drag index 0 and drop onto index 2
    const chip0 = screen.getByTestId('magic-chip-item-0');
    const chip2 = screen.getByTestId('magic-chip-item-2');
    const dataStore: Record<string, string> = {};
    const mockDataTransfer = {
      setData: (k: string, v: string) => {
        dataStore[k] = v;
      },
      getData: (k: string) => dataStore[k] ?? '',
    };

    fireEvent.dragStart(chip0, { dataTransfer: mockDataTransfer });
    fireEvent.dragOver(chip2);
    fireEvent.drop(chip2, { dataTransfer: mockDataTransfer });

    expect(onChipsChange).toHaveBeenCalledTimes(1);
    expect(
      (onChipsChange.mock.calls[0][0] as ChipItem[]).map((c) => c.id),
    ).toEqual(['d2', 'd3', 'd1']);

    // Keyboard ArrowRight on index 0 moves it to index 1
    const updatedChip0 = screen.getByTestId('magic-chip-item-0');
    fireEvent.keyDown(updatedChip0, { key: 'ArrowRight' });
    expect(
      (onChipsChange.mock.calls[1][0] as ChipItem[]).map((c) => c.id),
    ).toEqual(['d3', 'd2', 'd1']);

    // Keyboard ArrowLeft on index 1 moves it back to index 0
    const updatedChip1 = screen.getByTestId('magic-chip-item-1');
    fireEvent.keyDown(updatedChip1, { key: 'ArrowLeft' });
    expect(
      (onChipsChange.mock.calls[2][0] as ChipItem[]).map((c) => c.id),
    ).toEqual(['d2', 'd3', 'd1']);
  });

  it('supports all 5 AtomicSizes and all 7 ColorIntents', () => {
    const sizes: AtomicSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    const colors: ColorIntent[] = [
      'primary',
      'secondary',
      'tertiary',
      'success',
      'warning',
      'error',
      'neutral',
    ];

    render(
      <MagicMuiThemeProvider>
        {sizes.map((size) => (
          <MagicChip
            key={size}
            size={size}
            label={`size-${size}`}
            testId={`size-${size}`}
          />
        ))}
        {colors.map((color) => (
          <MagicChip
            key={color}
            color={color}
            sx={[{ m: 0.5 }]}
            defaultChips={[{ label: `color-${color}`, selected: true }]}
            testId={`color-${color}`}
          />
        ))}
      </MagicMuiThemeProvider>,
    );

    for (const size of sizes) {
      expect(screen.getByTestId(`size-${size}`)).toBeTruthy();
    }
    for (const color of colors) {
      expect(screen.getByTestId(`color-${color}`)).toBeTruthy();
    }
  });
});
