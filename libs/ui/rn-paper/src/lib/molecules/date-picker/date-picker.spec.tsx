import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicDatePicker } from './date-picker';

afterEach(cleanup);

describe('MagicDatePicker', () => {
  it('supports single date typing, calendar popover selection, month nav, and clearing', () => {
    const ref = createRef<View>();
    const onChange = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicDatePicker
          ref={ref}
          id="birth-date"
          testId="dp-single"
          label="Start Date"
          hint="Select an ISO date"
          defaultValue="2026-03-10"
          minDate="2026-03-05"
          maxDate="2026-03-25"
          onChange={onChange}
          onOpenChange={onOpenChange}
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    const input = screen.getByTestId('dp-single-input') as HTMLInputElement;
    expect(input.value).toBe('2026-03-10');

    // Out-of-bounds typed date shows validation error
    fireEvent.change(input, { target: { value: '2026-03-01' } });
    expect(screen.getByText('Date is outside allowed range')).toBeTruthy();

    // Malformed date shows format error
    fireEvent.change(input, { target: { value: 'not-a-date' } });
    expect(screen.getByText('Use YYYY-MM-DD format')).toBeTruthy();

    // Open calendar popover and pick a valid day
    fireEvent.click(screen.getByTestId('dp-single-calendar-toggle'));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByTestId('dp-single-month-label').textContent).toBe(
      'March 2026'
    );

    fireEvent.click(screen.getByTestId('dp-single-day-2026-03-15'));
    expect(onChange).toHaveBeenCalledWith('2026-03-15');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(input.value).toBe('2026-03-15');

    // Clear value
    fireEvent.click(screen.getByTestId('dp-single-clear'));
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(input.value).toBe('');
  });

  it('supports range mode selection via calendar clicks and typed inputs', () => {
    const onRangeChange = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicDatePicker
          testId="dp-range"
          label="Booking Window"
          mode="range"
          appearance="filled"
          defaultRangeValue={{ start: '2026-04-02', end: '2026-04-06' }}
          onRangeChange={onRangeChange}
        />
      </MagicPaperProvider>
    );

    const startInput = screen.getByTestId(
      'dp-range-start-input'
    ) as HTMLInputElement;
    const endInput = screen.getByTestId(
      'dp-range-end-input'
    ) as HTMLInputElement;
    expect(startInput.value).toBe('2026-04-02');
    expect(endInput.value).toBe('2026-04-06');

    fireEvent.click(screen.getByTestId('dp-range-calendar-toggle'));
    fireEvent.click(screen.getByTestId('dp-range-day-2026-04-10'));
    expect(onRangeChange).toHaveBeenLastCalledWith({
      start: '2026-04-10',
      end: null,
    });

    fireEvent.click(screen.getByTestId('dp-range-day-2026-04-14'));
    expect(onRangeChange).toHaveBeenLastCalledWith({
      start: '2026-04-10',
      end: '2026-04-14',
    });
  });

  it('supports enableTime, month stepping, readOnly, disabled, and errorText', () => {
    const onChange = vi.fn();

    const { rerender } = render(
      <MagicPaperProvider palette="dark-theme">
        <MagicDatePicker
          testId="dp-time"
          label="Meeting"
          enableTime
          defaultValue="2026-05-12T09:30"
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    fireEvent.click(screen.getByTestId('dp-time-calendar-toggle'));
    fireEvent.click(screen.getByTestId('dp-time-next-month'));
    expect(screen.getByTestId('dp-time-month-label').textContent).toBe(
      'June 2026'
    );
    fireEvent.click(screen.getByTestId('dp-time-prev-month'));
    expect(screen.getByTestId('dp-time-month-label').textContent).toBe(
      'May 2026'
    );

    const timeInput = screen.getByTestId('dp-time-time-input');
    fireEvent.change(timeInput, { target: { value: '14:45' } });
    expect(onChange).toHaveBeenCalledWith('2026-05-12T14:45');

    rerender(
      <MagicPaperProvider palette="dark-theme">
        <MagicDatePicker
          testId="dp-time"
          label="Meeting"
          readOnly
          errorText="Date locked"
          value="2026-05-12"
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByText('Date locked')).toBeTruthy();
    expect(screen.queryByTestId('dp-time-clear')).toBeNull();

    rerender(
      <MagicPaperProvider palette="dark-theme">
        <MagicDatePicker
          testId="dp-time"
          label="Meeting"
          disabled
          value="2026-05-12"
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    fireEvent.click(screen.getByTestId('dp-time-calendar-toggle'));
    expect(screen.queryByTestId('dp-time-calendar')).toBeNull();
  });

  it('validates typed range inputs, clears range, handles reverse calendar picks, and wraps months', () => {
    const onRangeChange = vi.fn();
    const onChange = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicDatePicker
          testId="dp-edge"
          label="Window"
          mode="range"
          enableTime
          minDate="2026-01-05"
          maxDate="2026-01-25"
          defaultRangeValue={{ start: '2026-01-10T09:00', end: '2026-01-15T09:00' }}
          onRangeChange={onRangeChange}
        />
        <MagicDatePicker
          testId="dp-empty-clear"
          label="Single"
          defaultValue="2026-02-01"
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    const startInput = screen.getByTestId('dp-edge-start-input');
    const endInput = screen.getByTestId('dp-edge-end-input');

    // Invalid start format
    fireEvent.change(startInput, { target: { value: 'bad' } });
    expect(screen.getByText('Use YYYY-MM-DD format')).toBeTruthy();

    // Start out of bounds
    fireEvent.change(startInput, { target: { value: '2026-01-01' } });
    expect(screen.getByText('Start date is outside allowed range')).toBeTruthy();

    // Start after end
    fireEvent.change(startInput, { target: { value: '2026-01-20' } });
    expect(screen.getByText('Start date must be before end date')).toBeTruthy();

    // Valid start
    fireEvent.change(startInput, { target: { value: '2026-01-08' } });
    expect(onRangeChange).toHaveBeenLastCalledWith({
      start: '2026-01-08T09:00',
      end: '2026-01-15T09:00',
    });

    // Clear start via empty string
    fireEvent.change(startInput, { target: { value: '' } });
    expect(onRangeChange).toHaveBeenLastCalledWith({
      start: null,
      end: '2026-01-15T09:00',
    });

    // Invalid end format / out of bounds / before start
    fireEvent.change(startInput, { target: { value: '2026-01-12' } });
    fireEvent.change(endInput, { target: { value: 'bad' } });
    expect(screen.getByText('Use YYYY-MM-DD format')).toBeTruthy();
    fireEvent.change(endInput, { target: { value: '2026-01-30' } });
    expect(screen.getByText('End date is outside allowed range')).toBeTruthy();
    fireEvent.change(endInput, { target: { value: '2026-01-07' } });
    expect(
      screen.getByText('End date must be on or after start date')
    ).toBeTruthy();
    fireEvent.change(endInput, { target: { value: '2026-01-18' } });
    expect(onRangeChange).toHaveBeenLastCalledWith({
      start: '2026-01-12T09:00',
      end: '2026-01-18T09:00',
    });
    fireEvent.change(endInput, { target: { value: '' } });
    expect(onRangeChange).toHaveBeenLastCalledWith({
      start: '2026-01-12T09:00',
      end: null,
    });

    // Open calendar, pick earlier date than start to test swap, update time, then wrap month Dec <-> Jan
    fireEvent.click(screen.getByTestId('dp-edge-calendar-toggle'));
    fireEvent.click(screen.getByTestId('dp-edge-day-2026-01-06'));
    expect(onRangeChange).toHaveBeenLastCalledWith({
      start: '2026-01-06T09:00',
      end: '2026-01-12T09:00',
    });

    fireEvent.change(screen.getByTestId('dp-edge-time-input'), {
      target: { value: '16:15' },
    });
    expect(onRangeChange).toHaveBeenLastCalledWith({
      start: '2026-01-06T16:15',
      end: '2026-01-12T16:15',
    });

    // January -> prev wraps to December 2025, next wraps back to January 2026
    fireEvent.click(screen.getByTestId('dp-edge-prev-month'));
    expect(screen.getByTestId('dp-edge-month-label').textContent).toBe(
      'December 2025'
    );
    fireEvent.click(screen.getByTestId('dp-edge-next-month'));
    expect(screen.getByTestId('dp-edge-month-label').textContent).toBe(
      'January 2026'
    );

    // Clear entire range
    fireEvent.click(screen.getByTestId('dp-edge-clear'));
    expect(onRangeChange).toHaveBeenLastCalledWith({
      start: null,
      end: null,
    });

    // Clear single via empty string
    fireEvent.change(screen.getByTestId('dp-empty-clear-input'), {
      target: { value: '' },
    });
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});

