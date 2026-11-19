import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { vi } from 'vitest';
import type {
  AtomicSize,
  TextInputType,
} from '@mono-magic/atomic-design-interfaces';
import { MagicFormFieldComponent } from '../../molecules/form-field/form-field.component';
import { MagicTextInputComponent } from './text-input.component';

@Component({
  imports: [ReactiveFormsModule, MagicTextInputComponent],
  template: `<magic-text-input [formControl]="control" testId="reactive-input" />`,
})
class ReactiveHostComponent {
  readonly control = new FormControl('hello', {
    nonNullable: true,
    validators: [Validators.required],
  });
}

@Component({
  imports: [FormsModule, MagicTextInputComponent],
  template: `<magic-text-input [(ngModel)]="value" testId="ngmodel-input" />`,
})
class NgModelHostComponent {
  value = 'initial';
}

@Component({
  imports: [FormField, MagicTextInputComponent],
  template: `<magic-text-input [formField]="modelForm.name" testId="sig-input" />`,
})
class SignalFormHostComponent {
  readonly data = signal({ name: 'Ada' });
  readonly modelForm = form(this.data, (path) => {
    required(path.name);
  });
}

@Component({
  imports: [MagicFormFieldComponent, MagicTextInputComponent],
  template: `
    <magic-form-field [label]="label()" [errorText]="errorText()">
      <magic-text-input [(value)]="value" testId="field-input" />
    </magic-form-field>
  `,
})
class FormFieldHostComponent {
  readonly label = signal('Username');
  readonly errorText = signal<string | undefined>(undefined);
  readonly value = signal('');
}

describe('MagicTextInputComponent', () => {
  let fixture: ComponentFixture<MagicTextInputComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, val] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, val);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const input = (): HTMLInputElement =>
    host().querySelector('input') as HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicTextInputComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicTextInputComponent);
    fixture.detectChanges();
  });

  describe('defaults & atomic purity', () => {
    it('renders only a single native <input> with no mat-form-field wrapper', () => {
      expect(input()).toBeTruthy();
      expect(host().querySelector('mat-form-field')).toBeNull();
      expect(host().classList).toContain('magic-size-md');
    });

    it('removes duplicate id from host and applies attributes to inner <input>', () => {
      setInputs({
        id: 'email-input',
        testId: 'email',
        ariaLabel: 'Email address',
        name: 'email',
        autocomplete: 'email',
        placeholder: 'you@example.com',
        minLength: 3,
        maxLength: 50,
      });

      expect(host().getAttribute('id')).toBeNull();
      expect(input().id).toBe('email-input');
      expect(input().getAttribute('data-testid')).toBe('email');
      expect(input().getAttribute('aria-label')).toBe('Email address');
      expect(input().getAttribute('name')).toBe('email');
      expect(input().getAttribute('autocomplete')).toBe('email');
      expect(input().placeholder).toBe('you@example.com');
      expect(input().getAttribute('minlength')).toBe('3');
      expect(input().getAttribute('maxlength')).toBe('50');
    });
  });

  describe('types & sizes', () => {
    const types: TextInputType[] = [
      'text',
      'email',
      'password',
      'search',
      'tel',
      'url',
      'number',
    ];
    it.each(types)('sets type=%s', (type) => {
      setInputs({ type });
      expect(input().type).toBe(type);
    });

    const sizes: AtomicSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    it.each(sizes)('applies magic-size-%s host class', (size) => {
      setInputs({ size });
      expect(host().classList).toContain(`magic-size-${size}`);
    });
  });

  describe('states', () => {
    it('supports disabled, required, readOnly and invalid states', () => {
      setInputs({
        disabled: true,
        required: true,
        readOnly: true,
        invalid: true,
      });
      expect(input().disabled).toBe(true);
      expect(input().required).toBe(true);
      expect(input().readOnly).toBe(true);
      expect(input().getAttribute('aria-required')).toBe('true');
      expect(input().getAttribute('aria-invalid')).toBe('true');
    });

    it('updates value model and emits touch & submitted events', () => {
      const touchSpy = vi.fn();
      const submitSpy = vi.fn();
      fixture.componentInstance.touch.subscribe(touchSpy);
      fixture.componentInstance.submitted.subscribe(submitSpy);

      input().dispatchEvent(new Event('focus'));
      expect(fixture.componentInstance.focused()).toBe(true);

      input().value = 'Alice';
      input().dispatchEvent(new Event('input'));
      expect(fixture.componentInstance.value()).toBe('Alice');

      input().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(submitSpy).toHaveBeenCalledWith('Alice');

      input().dispatchEvent(new Event('blur'));
      expect(fixture.componentInstance.focused()).toBe(false);
      expect(touchSpy).toHaveBeenCalledTimes(1);
    });

    it('supports programmatic focus() and reset()', () => {
      const focusSpy = vi.spyOn(input(), 'focus');
      fixture.componentInstance.value.set('typed');
      fixture.componentInstance.focus();
      expect(focusSpy).toHaveBeenCalledTimes(1);

      fixture.componentInstance.reset();
      expect(fixture.componentInstance.value()).toBe('');
    });
  });

  describe('forms integration', () => {
    it('integrates with Reactive Forms (FormControl)', () => {
      const hostFixture = TestBed.createComponent(ReactiveHostComponent);
      hostFixture.detectChanges();

      const el = hostFixture.nativeElement.querySelector(
        '[data-testid="reactive-input"]',
      ) as HTMLInputElement;
      expect(el.value).toBe('hello');

      el.value = 'world';
      el.dispatchEvent(new Event('input'));
      expect(hostFixture.componentInstance.control.value).toBe('world');

      el.value = '';
      el.dispatchEvent(new Event('input'));
      el.dispatchEvent(new Event('blur'));
      hostFixture.detectChanges();
      expect(hostFixture.componentInstance.control.invalid).toBe(true);
      expect(el.getAttribute('aria-invalid')).toBe('true');

      hostFixture.componentInstance.control.disable();
      hostFixture.detectChanges();
      expect(el.disabled).toBe(true);
    });

    it('integrates with Template-driven Forms (ngModel)', async () => {
      const hostFixture = TestBed.createComponent(NgModelHostComponent);
      hostFixture.detectChanges();
      await hostFixture.whenStable();
      hostFixture.detectChanges();

      const el = hostFixture.nativeElement.querySelector(
        '[data-testid="ngmodel-input"]',
      ) as HTMLInputElement;
      expect(el.value).toBe('initial');

      el.value = 'edited';
      el.dispatchEvent(new Event('input'));
      expect(hostFixture.componentInstance.value).toBe('edited');
    });

    it('integrates with Angular Signal Forms ([formField])', async () => {
      const hostFixture = TestBed.createComponent(SignalFormHostComponent);
      hostFixture.detectChanges();
      await hostFixture.whenStable();
      hostFixture.detectChanges();

      const el = hostFixture.nativeElement.querySelector(
        '[data-testid="sig-input"]',
      ) as HTMLInputElement;
      expect(el.value).toBe('Ada');

      el.value = '';
      el.dispatchEvent(new Event('input'));
      el.dispatchEvent(new Event('blur'));
      hostFixture.detectChanges();

      expect(hostFixture.componentInstance.data().name).toBe('');
      expect(el.getAttribute('aria-invalid')).toBe('true');
      expect(el.required).toBe(true);
    });
  });

  describe('inside magic-form-field', () => {
    it('connects to MatFormFieldControl and reflects errorText', () => {
      const hostFixture = TestBed.createComponent(FormFieldHostComponent);
      hostFixture.detectChanges();

      const labelEl = hostFixture.nativeElement.querySelector('mat-label');
      expect(labelEl?.textContent?.trim()).toBe('Username');
      expect(hostFixture.nativeElement.querySelector('mat-error')).toBeNull();

      hostFixture.componentInstance.errorText.set('Required field');
      hostFixture.detectChanges();

      const errorEl = hostFixture.nativeElement.querySelector('mat-error');
      expect(errorEl?.textContent?.trim()).toBe('Required field');
    });
  });
});
