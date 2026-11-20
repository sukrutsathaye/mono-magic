import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicSlideToggleComponent } from './slide-toggle.component';

@Component({
  imports: [MagicSlideToggleComponent],
  template: `<magic-slide-toggle>Projected Toggle</magic-slide-toggle>`,
})
class ProjectionHostComponent {}

@Component({
  imports: [ReactiveFormsModule, MagicSlideToggleComponent],
  template: `<magic-slide-toggle [formControl]="control" label="Dark mode" />`,
})
class ReactiveHostComponent {
  readonly control = new FormControl(true, { nonNullable: true });
}

@Component({
  imports: [FormsModule, MagicSlideToggleComponent],
  template: `<magic-slide-toggle [(ngModel)]="enabled" label="Alerts" />`,
})
class NgModelHostComponent {
  enabled = false;
}

@Component({
  imports: [FormField, MagicSlideToggleComponent],
  template: `<magic-slide-toggle [formField]="modelForm.enabled" label="Sync" />`,
})
class SignalFormHostComponent {
  readonly data = signal({ enabled: true });
  readonly modelForm = form(this.data);
}

describe('MagicSlideToggleComponent', () => {
  let fixture: ComponentFixture<MagicSlideToggleComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const button = (): HTMLButtonElement =>
    host().querySelector('button[role="switch"]') as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicSlideToggleComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicSlideToggleComponent);
    fixture.componentRef.setInput('label', 'Notifications');
    fixture.detectChanges();
  });

  it('renders label fallback and toggles checked state on click', () => {
    const spy = vi.fn();
    fixture.componentInstance.changed.subscribe(spy);
    expect(host().textContent).toContain('Notifications');
    expect(button().getAttribute('aria-checked')).toBe('false');

    button().click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(true);
    expect(button().getAttribute('aria-checked')).toBe('true');
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('supports hideIcon, labelPosition, required, disabled, disabledInteractive and attributes', () => {
    setInputs({
      id: 'st-1',
      testId: 'st',
      name: 'notify',
      hideIcon: true,
      labelPosition: 'before',
      required: true,
      disableRipple: true,
    });

    expect(host().getAttribute('id')).toBeNull();
    expect(host().querySelector('mat-slide-toggle')?.id).toBe('st-1');
    expect(
      host().querySelector('mat-slide-toggle')?.getAttribute('data-testid'),
    ).toBe('st');
    expect(host().querySelector('.mdc-form-field--align-end')).toBeTruthy();
    expect(host().querySelector('.mdc-switch__icons')).toBeNull();
    expect(button().getAttribute('aria-required')).toBe('true');

    setInputs({ disabled: true });
    expect(button().disabled).toBe(true);

    setInputs({ disabledInteractive: true });
    expect(button().getAttribute('aria-disabled')).toBe('true');
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

  it('prefers projected content over label fallback', () => {
    const pFixture = TestBed.createComponent(ProjectionHostComponent);
    pFixture.detectChanges();
    expect(pFixture.nativeElement.textContent).toContain('Projected Toggle');
  });

  it('integrates with Reactive Forms, ngModel and Signal Forms', async () => {
    const rxFixture = TestBed.createComponent(ReactiveHostComponent);
    rxFixture.detectChanges();
    const rxBtn = rxFixture.nativeElement.querySelector(
      'button[role="switch"]',
    ) as HTMLButtonElement;
    expect(rxBtn.getAttribute('aria-checked')).toBe('true');
    rxBtn.click();
    expect(rxFixture.componentInstance.control.value).toBe(false);

    const ngFixture = TestBed.createComponent(NgModelHostComponent);
    ngFixture.detectChanges();
    await ngFixture.whenStable();
    ngFixture.detectChanges();
    const ngBtn = ngFixture.nativeElement.querySelector(
      'button[role="switch"]',
    ) as HTMLButtonElement;
    ngBtn.click();
    expect(ngFixture.componentInstance.enabled).toBe(true);

    const sfFixture = TestBed.createComponent(SignalFormHostComponent);
    sfFixture.detectChanges();
    await sfFixture.whenStable();
    sfFixture.detectChanges();
    const sfBtn = sfFixture.nativeElement.querySelector(
      'button[role="switch"]',
    ) as HTMLButtonElement;
    expect(sfBtn.getAttribute('aria-checked')).toBe('true');
    sfBtn.click();
    expect(sfFixture.componentInstance.data().enabled).toBe(false);
  });
});
