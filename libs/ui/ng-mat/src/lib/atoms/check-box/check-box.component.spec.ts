import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { vi } from 'vitest';
import type {
  AtomicSize,
  CheckBoxTask,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicCheckBoxComponent } from './check-box.component';

@Component({
  imports: [MagicCheckBoxComponent],
  template: `
    <magic-check-box [(checked)]="checked">
      <span>Projected Label</span>
    </magic-check-box>
  `,
})
class ProjectionHostComponent {
  readonly checked = signal(false);
}

@Component({
  imports: [ReactiveFormsModule, MagicCheckBoxComponent],
  template: `<magic-check-box [formControl]="control" label="Agree" testId="rx-cb" />`,
})
class ReactiveHostComponent {
  readonly control = new FormControl(false, { nonNullable: true });
}

@Component({
  imports: [FormsModule, MagicCheckBoxComponent],
  template: `<magic-check-box [(ngModel)]="agree" label="Agree" testId="ng-cb" />`,
})
class NgModelHostComponent {
  agree = true;
}

@Component({
  imports: [FormField, MagicCheckBoxComponent],
  template: `<magic-check-box [formField]="modelForm.agree" label="Agree" testId="sf-cb" />`,
})
class SignalFormHostComponent {
  readonly data = signal({ agree: true });
  readonly modelForm = form(this.data);
}

describe('MagicCheckBoxComponent', () => {
  let fixture: ComponentFixture<MagicCheckBoxComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const input = (): HTMLInputElement =>
    host().querySelector('input[type="checkbox"]') as HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicCheckBoxComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicCheckBoxComponent);
    fixture.componentRef.setInput('label', 'Accept terms');
    fixture.detectChanges();
  });

  it('renders label fallback and toggles checked model on click', () => {
    const spy = vi.fn();
    fixture.componentInstance.changed.subscribe(spy);
    expect(host().textContent).toContain('Accept terms');
    expect(input().checked).toBe(false);

    input().click();
    fixture.detectChanges();
    expect(fixture.componentInstance.checked()).toBe(true);
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('supports indeterminate state and clears it on user change', () => {
    setInputs({ indeterminate: true });
    expect(input().indeterminate).toBe(true);

    input().click();
    fixture.detectChanges();
    expect(fixture.componentInstance.indeterminate()).toBe(false);
    expect(fixture.componentInstance.checked()).toBe(true);
  });

  it('supports disabled, disabledInteractive, required, labelPosition, disableRipple, name and checkboxValue', () => {
    setInputs({
      id: 'terms-cb',
      testId: 'terms',
      name: 'terms',
      checkboxValue: 'yes',
      required: true,
      labelPosition: 'before',
      disableRipple: true,
    });

    expect(host().getAttribute('id')).toBeNull();
    expect(host().querySelector('mat-checkbox')?.id).toBe('terms-cb');
    expect(
      host().querySelector('mat-checkbox')?.getAttribute('data-testid'),
    ).toBe('terms');
    expect(input().name).toBe('terms');
    expect(input().value).toBe('yes');
    expect(input().required).toBe(true);
    expect(
      host().querySelector('.mdc-form-field--align-end'),
    ).toBeTruthy();

    setInputs({ disabled: true });
    expect(input().disabled).toBe(true);

    setInputs({ disabledInteractive: true });
    expect(input().getAttribute('aria-disabled')).toBe('true');
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
    expect(pFixture.nativeElement.textContent).toContain('Projected Label');
  });

  it('updates nested tasks immutably without mutating original references', () => {
    const initialTasks: CheckBoxTask[] = [
      {
        id: 'p1',
        name: 'Parent',
        checked: false,
        subtasks: [
          { id: 's1', name: 'Sub 1', checked: false },
          { id: 's2', name: 'Sub 2', checked: true },
        ],
      },
    ];
    const emittedSpy = vi.fn();
    fixture.componentInstance.tasksChanged.subscribe(emittedSpy);
    setInputs({ tasks: initialTasks });

    expect(fixture.componentInstance.isPartiallyComplete(0)).toBe(true);
    const checkboxes = host().querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(3);

    // Toggle subtask 0 -> true, so both subtasks are true -> parent becomes checked
    (checkboxes[1] as HTMLInputElement).click();
    fixture.detectChanges();

    expect(initialTasks[0].checked).toBe(false);
    expect(initialTasks[0].subtasks?.[0].checked).toBe(false);
    expect(fixture.componentInstance.tasks()[0].checked).toBe(true);
    expect(fixture.componentInstance.isPartiallyComplete(0)).toBe(false);
    expect(emittedSpy).toHaveBeenCalledTimes(1);

    // Toggle parent -> false, so all subtasks become false
    (host().querySelectorAll('input[type="checkbox"]')[0] as HTMLInputElement).click();
    fixture.detectChanges();
    expect(
      fixture.componentInstance.tasks()[0].subtasks?.every((s) => !s.checked),
    ).toBe(true);
  });

  it('integrates with Reactive Forms, ngModel and Signal Forms', async () => {
    const rxFixture = TestBed.createComponent(ReactiveHostComponent);
    rxFixture.detectChanges();
    const rxInput = rxFixture.nativeElement.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    rxInput.click();
    expect(rxFixture.componentInstance.control.value).toBe(true);
    rxFixture.componentInstance.control.disable();
    rxFixture.detectChanges();
    expect(rxInput.disabled).toBe(true);

    const ngFixture = TestBed.createComponent(NgModelHostComponent);
    ngFixture.detectChanges();
    await ngFixture.whenStable();
    ngFixture.detectChanges();
    const ngInput = ngFixture.nativeElement.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(ngInput.checked).toBe(true);
    ngInput.click();
    expect(ngFixture.componentInstance.agree).toBe(false);

    const sfFixture = TestBed.createComponent(SignalFormHostComponent);
    sfFixture.detectChanges();
    await sfFixture.whenStable();
    sfFixture.detectChanges();
    const sfInput = sfFixture.nativeElement.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(sfInput.checked).toBe(true);
    sfInput.click();
    expect(sfFixture.componentInstance.data().agree).toBe(false);
  });
});
