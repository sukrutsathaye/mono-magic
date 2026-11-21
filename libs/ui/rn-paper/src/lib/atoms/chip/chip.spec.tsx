import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AtomicSize,
  ChipItem,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicChip } from './chip';

afterEach(cleanup);

describe('MagicChip', () => {
  it('renders single fallback basic chip when chips prop is omitted or empty, and supports projected children', () => {
    const { rerender } = render(
      <MagicPaperProvider>
        <MagicChip id="basic-single" testId="single-chip" label="Fallback Tag" />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('single-chip-chip-0').textContent).toContain(
      'Fallback Tag'
    );

    rerender(
      <MagicPaperProvider>
        <MagicChip testId="single-chip" label="Ignored">
          Projected Chip Text
        </MagicChip>
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('single-chip-chip-0').textContent).toContain(
      'Projected Chip Text'
    );
  });

  it('renders chip list with avatarSrc, leadingIcon, and removable delete button + keyboard Backspace/Delete', () => {
    const onRemoved = vi.fn();
    const onChipsChange = vi.fn();

    const initialChips: ChipItem[] = [
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
      <MagicPaperProvider>
        <MagicChip
          testId="basic-list"
          removable
          chips={initialChips}
          onRemoved={onRemoved}
          onChipsChange={onChipsChange}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('basic-list-chip-0-avatar')).toBeTruthy();
    expect(
      screen.getByTestId('basic-list-chip-1-leading-icon').textContent
    ).toBe('star');

    // Click remove button on first chip
    fireEvent.click(screen.getByTestId('basic-list-chip-0-remove'));
    expect(onRemoved).toHaveBeenCalledWith(initialChips[0]);
    expect(onChipsChange).toHaveBeenCalledTimes(1);

    // Keyboard Delete on second chip
    fireEvent.keyDown(screen.getByTestId('basic-list-chip-1'), {
      key: 'Backspace',
    });
    expect(onRemoved).toHaveBeenCalledWith(initialChips[1]);
  });

  it('supports selectable variant in both multiple and single-select modes and hideSelectionIndicator', () => {
    const onSelectionChange = vi.fn();
    const onChipsChange = vi.fn();

    const initialChips: ChipItem[] = [
      { id: 'opt1', label: 'Option 1', selected: true },
      { id: 'opt2', label: 'Option 2', selected: false },
      { label: 'NoId Option', selected: false },
    ];

    const { rerender } = render(
      <MagicPaperProvider>
        <MagicChip
          testId="sel-multi"
          variant="selectable"
          multiple
          chips={initialChips}
          onSelectionChange={onSelectionChange}
          onChipsChange={onChipsChange}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('sel-multi-chip-0-check-icon')).toBeTruthy();

    // Select Option 2 in multiple mode
    fireEvent.click(screen.getByTestId('sel-multi-chip-1'));
    expect(onSelectionChange).toHaveBeenCalledWith(['opt1', 'opt2']);

    // Rerender in single-select mode with hideSelectionIndicator
    rerender(
      <MagicPaperProvider>
        <MagicChip
          testId="sel-single"
          variant="selectable"
          multiple={false}
          hideSelectionIndicator
          chips={initialChips}
          onSelectionChange={onSelectionChange}
        />
      </MagicPaperProvider>
    );

    expect(
      screen.queryByTestId('sel-single-chip-0-check-icon')
    ).toBeNull();

    // Clicking Option 3 (no id -> uses label) deselects Option 1
    fireEvent.click(screen.getByTestId('sel-single-chip-2'));
    expect(onSelectionChange).toHaveBeenLastCalledWith(['NoId Option']);
  });

  it('supports input variant: adding chips via Enter/comma/submit, editing chips inline, canceling edit, and empty-edit removal', () => {
    const onAdded = vi.fn();
    const onEdited = vi.fn();
    const onRemoved = vi.fn();
    const onChipsChange = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicChip
          testId="input-chips"
          variant="input"
          editable
          removable
          chips={[
            { id: 'e1', label: 'Editable One' },
            { id: 'e2', label: 'Editable Two' },
          ]}
          onAdded={onAdded}
          onEdited={onEdited}
          onRemoved={onRemoved}
          onChipsChange={onChipsChange}
        />
      </MagicPaperProvider>
    );

    const input = screen.getByTestId('input-chips-input');

    // Add via trailing comma in onChangeText
    fireEvent.change(input, { target: { value: 'Alpha,' } });
    expect(onAdded).toHaveBeenCalledWith('Alpha');

    // Add via Enter keyPress
    fireEvent.change(input, { target: { value: 'Beta' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent(
      input,
      new CustomEvent('keyPress', {
        bubbles: true,
        detail: { key: 'Enter' },
      })
    );
    // Also trigger submitEditing
    fireEvent.submit(input);

    // Ignore whitespace-only submission
    fireEvent.change(input, { target: { value: '   ,' } });

    // Start editing chip 0 via edit button, then commit with Enter keyDown
    fireEvent.click(screen.getByTestId('input-chips-chip-0-edit'));
    const editInput = screen.getByTestId('input-chips-chip-0-edit-input');
    fireEvent.change(editInput, { target: { value: 'Updated One' } });
    fireEvent.keyDown(editInput, { key: 'Enter' });

    expect(onEdited).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Updated One' })
    );

    // Start editing chip 0 by clicking chip body, then cancel with Escape keyDown
    fireEvent.click(screen.getByTestId('input-chips-chip-0'));
    const editInputCancel = screen.getByTestId('input-chips-chip-0-edit-input');
    fireEvent.change(editInputCancel, { target: { value: 'Discarded' } });
    fireEvent.keyDown(editInputCancel, { key: 'Escape' });
    expect(screen.queryByTestId('input-chips-chip-0-edit-input')).toBeNull();

    // Start editing chip 1 via Enter keyDown on chip and clear value -> blur removes chip
    const chip1 = screen.getByTestId('input-chips-chip-1');
    fireEvent.keyDown(chip1, { key: 'Enter' });
    const editInput1 = screen.getByTestId('input-chips-chip-1-edit-input');
    fireEvent.change(editInput1, { target: { value: '' } });
    fireEvent.blur(editInput1);
    // Empty edit removes chip
    expect(onRemoved).toHaveBeenCalled();
  });

  it('supports draggable variant reordering via move buttons and ArrowLeft/ArrowRight keys', () => {
    const onChipsChange = vi.fn();
    const initial: ChipItem[] = [
      { id: 'd1', label: 'First' },
      { id: 'd2', label: 'Second' },
      { id: 'd3', label: 'Third' },
    ];

    render(
      <MagicPaperProvider>
        <MagicChip
          testId="drag-chips"
          variant="draggable"
           orientation="vertical"
          disableRipple
          chips={initial}
          onChipsChange={onChipsChange}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('drag-chips-chip-0-drag-icon')).toBeTruthy();

    // Move 'First' later using button
    fireEvent.click(screen.getByTestId('drag-chips-chip-0-move-next'));
    expect(onChipsChange).toHaveBeenCalledTimes(1);
    expect(
      (onChipsChange.mock.calls[0][0] as ChipItem[]).map((c) => c.id)
    ).toEqual(['d2', 'd1', 'd3']);

    // Move index 1 ('First') earlier using ArrowLeft keyDown
    fireEvent.keyDown(screen.getByTestId('drag-chips-chip-1'), {
      key: 'ArrowLeft',
    });
    expect(onChipsChange).toHaveBeenCalledTimes(2);

    // Move index 0 later using ArrowRight keyDown
    fireEvent.keyDown(screen.getByTestId('drag-chips-chip-0'), {
      key: 'ArrowRight',
    });
    expect(onChipsChange).toHaveBeenCalledTimes(3);

    // Move index 1 earlier using move-prev button
    fireEvent.click(screen.getByTestId('drag-chips-chip-1-move-prev'));
    expect(onChipsChange).toHaveBeenCalledTimes(4);
  });

  it('renders all 5 sizes, all 7 color intents, and respects disabled state', () => {
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
    const onSelectionChange = vi.fn();

    render(
      <MagicPaperProvider>
        {sizes.map((size) => (
          <MagicChip
            key={size}
            size={size}
            label={`Size-${size}`}
            testId={`chip-size-${size}`}
          />
        ))}
        {colors.map((color) => (
          <MagicChip
            key={color}
            color={color}
            variant="selectable"
            chips={[{ id: color, label: color, selected: true }]}
            testId={`chip-color-${color}`}
          />
        ))}
        <MagicChip
          testId="chip-disabled"
          variant="selectable"
          disabled
          chips={[{ id: 'x', label: 'Disabled' }]}
          onSelectionChange={onSelectionChange}
        />
      </MagicPaperProvider>
    );

    for (const size of sizes) {
      expect(screen.getByTestId(`chip-size-${size}`)).toBeTruthy();
    }
    for (const color of colors) {
      expect(screen.getByTestId(`chip-color-${color}`)).toBeTruthy();
    }

    fireEvent.click(screen.getByTestId('chip-disabled-chip-0'));
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
