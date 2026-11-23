import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicDatePicker } from './date-picker';

afterEach(cleanup);

describe('MagicDatePicker (React MUI)', () => {
  it('renders single date picker, clamps min/max bounds, clears value, and forwards ref', () => {
    const pickerRef = createRef<HTMLDivElement>();
    const onChange = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicDatePicker
          ref={pickerRef}
          id="due-date"
          testId="due-date"
          label="Due Date"
          hint="Select target release date"
          minDate="2026-01-01"
          maxDate="2026-12-31"
          defaultValue="2026-06-15"
          clearable
          required
          onChange={onChange}
        />
      </MagicMuiThemeProvider>,
    );

    expect(pickerRef.current).toBeInstanceOf(HTMLDivElement);
    const input = screen.getByTestId('due-date-input') as HTMLInputElement;
    expect(input.value).toBe('2026-06-15');
    expect(input.min).toBe('2026-01-01');
    expect(input.max).toBe('2026-12-31');

    fireEvent.change(input, { target: { value: '2025-11-01' } });
    expect(onChange).toHaveBeenCalledWith('2026-01-01');

    fireEvent.change(input, { target: { value: '2027-02-01' } });
    expect(onChange).toHaveBeenCalledWith('2026-12-31');

    fireEvent.click(screen.getByTestId('due-date-clear'));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('supports range mode with start/end synchronization, validation, and clearing', () => {
    const onRangeChange = vi.fn();
    const { rerender } = render(
      <MagicMuiThemeProvider>
        <MagicDatePicker
          testId="sprint-range"
          mode="range"
          label="Sprint Window"
          defaultRangeValue={{ start: '2026-05-01', end: '2026-05-14' }}
          minDate="2026-05-01"
          maxDate="2026-06-30"
          onRangeChange={onRangeChange}
        />
      </MagicMuiThemeProvider>,
    );

    const startInput = screen.getByTestId('sprint-range-start') as HTMLInputElement;
    const endInput = screen.getByTestId('sprint-range-end') as HTMLInputElement;
    expect(startInput.value).toBe('2026-05-01');
    expect(endInput.value).toBe('2026-05-14');

    fireEvent.change(startInput, { target: { value: '2026-05-20' } });
    expect(onRangeChange).toHaveBeenCalledWith({
      start: '2026-05-20',
      end: '2026-05-20',
    });

    fireEvent.change(endInput, { target: { value: '2026-05-10' } });
    expect(onRangeChange).toHaveBeenCalledWith({
      start: '2026-05-10',
      end: '2026-05-10',
    });

    fireEvent.click(screen.getByTestId('sprint-range-clear'));
    expect(onRangeChange).toHaveBeenLastCalledWith({ start: null, end: null });

    rerender(
      <MagicMuiThemeProvider>
        <MagicDatePicker
          testId="sprint-range"
          mode="range"
          rangeValue={{ start: '2026-05-20', end: '2026-05-10' }}
        />
      </MagicMuiThemeProvider>,
    );
    expect(screen.getByRole('alert').textContent).toBe(
      'Start date must be on or before end date.',
    );
  });

  it('supports enableTime, readOnly, disabled, filled appearance, errorText, and sizes', () => {
    const onChange = vi.fn();
    render(
      <MagicMuiThemeProvider>
        <MagicDatePicker
          testId="dt-picker"
          label="Deploy Timestamp"
          appearance="filled"
          enableTime
          readOnly
          value="2026-08-10T14:30"
          minDate="2026-08-01"
          maxDate="2026-08-31T23:59"
          errorText="Window locked"
          size="sm"
          onChange={onChange}
          sx={[{ maxWidth: 360 }]}
        />
        <MagicDatePicker
          testId="disabled-picker"
          disabled
          format="YYYY-MM-DD"
          subscriptSizing="dynamic"
          size="xl"
        />
      </MagicMuiThemeProvider>,
    );

    const dtInput = screen.getByTestId('dt-picker-input') as HTMLInputElement;
    expect(dtInput.type).toBe('datetime-local');
    expect(dtInput.readOnly).toBe(true);
    expect(screen.getByRole('alert').textContent).toBe('Window locked');
    fireEvent.change(dtInput, { target: { value: '2026-08-12T09:00' } });
    expect(onChange).not.toHaveBeenCalled();

    expect(screen.getByText('Format: YYYY-MM-DD')).toBeTruthy();
    expect(
      (screen.getByTestId('disabled-picker-input') as HTMLInputElement).disabled,
    ).toBe(true);
  });
});
