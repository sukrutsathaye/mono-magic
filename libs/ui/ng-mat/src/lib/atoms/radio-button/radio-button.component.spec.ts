import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
  RadioOption,
} from '@mono-magic/atomic-design-interfaces';
import { MagicRadioButtonComponent } from './radio-button.component';

const OPTIONS: RadioOption[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma', disabled: true },
];

@Component({
  imports: [ReactiveFormsModule, MagicRadioButtonComponent],
  template: `<magic-radio-button [formControl]="control" [options]="options" />`,
})
class ReactiveHostComponent {
  readonly options = OPTIONS;
  readonly control = new FormControl<string | undefined>('a');
}

@Component({
  imports: [FormsModule, MagicRadioButtonComponent],
  template: `<magic-radio-button [(ngModel)]="selected" [options]="options" />`,
})
class NgModelHostComponent {
  readonly options = OPTIONS;
  selected = 'b';
}

@Component({
  imports: [FormField, MagicRadioButtonComponent],
  template: `<magic-radio-button [formField]="modelForm.choice" [options]="options" />`,
})
class SignalFormHostComponent {
  readonly options = OPTIONS;
  readonly data = signal({ choice: 'a' });
  readonly modelForm = form(this.data);
}

describe('MagicRadioButtonComponent', () => {
  let fixture: ComponentFixture<MagicRadioButtonComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const radios = (): HTMLInputElement[] =>
    Array.from(host().querySelectorAll('input[type="radio"]'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicRadioButtonComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicRadioButtonComponent<string>);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
  });

  it('renders all options and selects one on click', () => {
    const spy = vi.fn();
    fixture.componentInstance.changed.subscribe(spy);

    expect(radios()).toHaveLength(3);
    expect(radios()[2].disabled).toBe(true);

    radios()[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('b');
    expect(spy).toHaveBeenCalledWith('b');
  });

  it('supports vertical vs horizontal layout, labelPosition, required, disabled and attributes', () => {
    setInputs({
      id: 'rg-1',
      testId: 'rg',
      ariaLabel: 'Choose tier',
      name: 'tier',
      vertical: false,
      labelPosition: 'before',
      required: true,
      disableRipple: true,
    });

    const group = host().querySelector('mat-radio-group') as HTMLElement;
    expect(host().getAttribute('id')).toBeNull();
    expect(group.id).toBe('rg-1');
    expect(group.getAttribute('data-testid')).toBe('rg');
    expect(group.getAttribute('aria-label')).toBe('Choose tier');
    expect(group.classList).not.toContain('magic-radio-button__group--vertical');
    expect(host().querySelector('.mdc-form-field--align-end')).toBeTruthy();
    expect(radios()[0].name).toBe('tier');

    setInputs({ disabled: true });
    expect(radios().every((r) => r.disabled)).toBe(true);
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as AtomicSize[])(
    'applies magic-size-%s class',
    (size) => {
      setInputs({ size });
      expect(host().classList).toContain(`magic-size-${size}`);
    },
  );

  it.each([
    'primary',
    'secondary',
    'tertiary',
    'success',
    'warning',
    'error',
    'neutral',
  ] as ColorIntent[])('applies magic-color-%s class', (color) => {
    setInputs({ color });
    expect(host().classList).toContain(`magic-color-${color}`);
  });

  it('integrates with Reactive Forms, ngModel and Signal Forms', async () => {
    const rxFixture = TestBed.createComponent(ReactiveHostComponent);
    rxFixture.detectChanges();
    const rxRadios = Array.from(
      rxFixture.nativeElement.querySelectorAll('input[type="radio"]'),
    ) as HTMLInputElement[];
    expect(rxRadios[0].checked).toBe(true);
    rxRadios[1].click();
    expect(rxFixture.componentInstance.control.value).toBe('b');

    const ngFixture = TestBed.createComponent(NgModelHostComponent);
    ngFixture.detectChanges();
    await ngFixture.whenStable();
    ngFixture.detectChanges();
    const ngRadios = Array.from(
      ngFixture.nativeElement.querySelectorAll('input[type="radio"]'),
    ) as HTMLInputElement[];
    expect(ngRadios[1].checked).toBe(true);
    ngRadios[0].click();
    expect(ngFixture.componentInstance.selected).toBe('a');

    const sfFixture = TestBed.createComponent(SignalFormHostComponent);
    sfFixture.detectChanges();
    await sfFixture.whenStable();
    sfFixture.detectChanges();
    const sfRadios = Array.from(
      sfFixture.nativeElement.querySelectorAll('input[type="radio"]'),
    ) as HTMLInputElement[];
    expect(sfRadios[0].checked).toBe(true);
    sfRadios[1].click();
    expect(sfFixture.componentInstance.data().choice).toBe('b');
  });
});
