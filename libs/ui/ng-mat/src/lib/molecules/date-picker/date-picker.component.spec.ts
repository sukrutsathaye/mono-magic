import { OverlayContainer } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
  DateRangeValue,
} from '@mono-magic/atomic-design-interfaces';
import { MagicDatePickerComponent } from './date-picker.component';

describe('MagicDatePickerComponent', () => {
  let fixture: ComponentFixture<MagicDatePickerComponent>;
  let overlayContainer: OverlayContainer;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const field = (): HTMLElement =>
    host().querySelector('mat-form-field') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicDatePickerComponent],
    }).compileComponents();
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture = TestBed.createComponent(MagicDatePickerComponent);
    setInputs({ label: 'Event date', testId: 'dp' });
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  describe('single mode, time, ISO parsing & appearance', () => {
    it('forwards id/testId cleanly and renders label, hint, and errorText', () => {
      setInputs({
        id: 'event-dp',
        hint: 'Choose a date',
        defaultValue: '2026-06-15',
      });

      expect(host().getAttribute('id')).toBeNull();
      expect(field().getAttribute('id')).toBe('event-dp');
      expect(field().getAttribute('data-testid')).toBe('dp');
      expect(host().textContent).toContain('Event date');
      expect(host().textContent).toContain('Choose a date');
      expect(fixture.componentInstance.currentValue()).toBe('2026-06-15');

      setInputs({ errorText: 'Date is out of range', hint: undefined });
      expect(host().textContent).toContain('Date is out of range');
      const input = host().querySelector(
        '[data-testid="dp-input"]',
      ) as HTMLInputElement;
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    it('handles invalid calendar dates and non-ISO date strings gracefully', () => {
      setInputs({ defaultValue: '2026-02-31' });
      const input = host().querySelector(
        '[data-testid="dp-input"]',
      ) as HTMLInputElement;
      expect(input.value).toBe('');

      setInputs({ value: 'invalid-date-string' });
      expect(input.value).toBe('');

      setInputs({ value: 'June 15, 2026' });
      expect(input.value).toContain('2026');

      setInputs({ value: '2026-06-15T10:15', enableTime: true });
      const timeInput = host().querySelector(
        '[data-testid="dp-time"]',
      ) as HTMLInputElement;
      expect(timeInput.value).toBe('10:15');
    });

    it.each(['outlined', 'filled'] as const)(
      'supports appearance=%s',
      (appearance) => {
        setInputs({ appearance });
        expect(field().classList).toContain(
          appearance === 'outlined'
            ? 'mat-form-field-appearance-outline'
            : 'mat-form-field-appearance-fill',
        );
      },
    );

    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as AtomicSize[])(
      'applies magic-size-%s class',
      (size) => {
        setInputs({ size });
        expect(host().classList).toContain(`magic-size-${size}`);
      },
    );

    it.each(['primary', 'secondary', 'tertiary'] as ColorIntent[])(
      'applies magic-color-%s class',
      (color) => {
        setInputs({ color });
        expect(host().classList).toContain(`magic-color-${color}`);
      },
    );

    it('updates single value via calendar selection, time input, and clear button', async () => {
      const valueSpy = vi.fn();
      fixture.componentInstance.valueChange.subscribe(valueSpy);

      setInputs({
        defaultValue: '2026-06-15T14:30',
        enableTime: true,
        clearable: true,
        minDate: '2026-06-01',
        maxDate: '2026-06-30',
      });

      const timeInput = host().querySelector(
        '[data-testid="dp-time"]',
      ) as HTMLInputElement;
      expect(timeInput.value).toBe('14:30');
      timeInput.value = '16:45';
      timeInput.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(fixture.componentInstance.currentValue()).toBe('2026-06-15T16:45');
      expect(valueSpy).toHaveBeenCalledWith('2026-06-15T16:45');

      const toggleBtn = host().querySelector(
        'mat-datepicker-toggle button',
      ) as HTMLButtonElement;
      toggleBtn.click();
      fixture.detectChanges();
      await fixture.whenStable();

      const day20 = Array.from(
        overlayContainer
          .getContainerElement()
          .querySelectorAll('.mat-calendar-body-cell'),
      ).find((cell) => cell.textContent?.trim() === '20') as HTMLElement;
      expect(day20).toBeTruthy();
      day20.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance.currentValue()).toBe('2026-06-20T16:45');
      expect(valueSpy).toHaveBeenCalledWith('2026-06-20T16:45');

      const clearBtn = host().querySelector(
        '[data-testid="dp-clear"]',
      ) as HTMLButtonElement;
      clearBtn.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.currentValue()).toBeNull();
      expect(valueSpy).toHaveBeenLastCalledWith(null);

      // Updating time when no date is selected yet stores local time without emitting
      valueSpy.mockClear();
      timeInput.value = '';
      timeInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(valueSpy).not.toHaveBeenCalled();
    });
  });

  describe('range mode, controlled state, readOnly & disabled', () => {
    it('supports range mode selection and clearing', async () => {
      const rangeSpy = vi.fn();
      fixture.componentInstance.rangeValueChange.subscribe(rangeSpy);

      setInputs({
        mode: 'range',
        defaultRangeValue: { start: '2026-06-05', end: '2026-06-10' },
        clearable: true,
      });

      expect(host().classList).toContain('magic-date-picker--range');
      expect(fixture.componentInstance.currentRangeValue()).toEqual({
        start: '2026-06-05',
        end: '2026-06-10',
      });

      const toggleBtn = host().querySelector(
        'mat-datepicker-toggle button',
      ) as HTMLButtonElement;
      toggleBtn.click();
      fixture.detectChanges();
      await fixture.whenStable();

      const cells = Array.from(
        overlayContainer
          .getContainerElement()
          .querySelectorAll('.mat-calendar-body-cell'),
      );
      const day12 = cells.find(
        (cell) => cell.textContent?.trim() === '12',
      ) as HTMLElement;
      const day18 = cells.find(
        (cell) => cell.textContent?.trim() === '18',
      ) as HTMLElement;
      day12.click();
      fixture.detectChanges();
      day18.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.componentInstance.currentRangeValue()).toEqual({
        start: '2026-06-12',
        end: '2026-06-18',
      });
      expect(rangeSpy).toHaveBeenLastCalledWith({
        start: '2026-06-12',
        end: '2026-06-18',
      });

      const clearBtn = host().querySelector(
        '[data-testid="dp-clear"]',
      ) as HTMLButtonElement;
      clearBtn.click();
      fixture.detectChanges();
      expect(rangeSpy).toHaveBeenLastCalledWith(null);
      expect(fixture.componentInstance.currentRangeValue()).toEqual({
        start: null,
        end: null,
      });
    });

    it('honors controlled value/rangeValue, readOnly, and disabled states', () => {
      const valueSpy = vi.fn();
      const rangeSpy = vi.fn();
      fixture.componentInstance.valueChange.subscribe(valueSpy);
      fixture.componentInstance.rangeValueChange.subscribe(rangeSpy);

      const range: DateRangeValue = { start: '2026-07-01', end: '2026-07-07' };
      setInputs({ value: '2026-07-01', readOnly: true, enableTime: true });
      expect(host().querySelector('[data-testid="dp-clear"]')).toBeNull();
      const input = host().querySelector(
        '[data-testid="dp-input"]',
      ) as HTMLInputElement;
      expect(input.readOnly).toBe(true);

      fixture.componentInstance.clearValue();
      expect(valueSpy).not.toHaveBeenCalled();

      // Clear when controlled (non-readonly)
      setInputs({ readOnly: false });
      const clearBtn = host().querySelector(
        '[data-testid="dp-clear"]',
      ) as HTMLButtonElement;
      clearBtn.click();
      expect(valueSpy).toHaveBeenCalledWith(null);
      expect(fixture.componentInstance.currentValue()).toBe('2026-07-01');

      setInputs({ disabled: true, readOnly: false });
      expect(host().classList).toContain('magic-date-picker--disabled');
      expect(input.disabled).toBe(true);

      setInputs({ mode: 'range', rangeValue: range, disabled: false });
      expect(fixture.componentInstance.currentRangeValue()).toEqual(range);
      const rangeClearBtn = host().querySelector(
        '[data-testid="dp-clear"]',
      ) as HTMLButtonElement;
      rangeClearBtn.click();
      expect(rangeSpy).toHaveBeenCalledWith(null);
      expect(fixture.componentInstance.currentRangeValue()).toEqual(range);
    });
  });
});
