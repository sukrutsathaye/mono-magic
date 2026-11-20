import { OverlayContainer } from '@angular/cdk/overlay';
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
  SelectOption,
  SelectOptionGroup,
} from '@mono-magic/atomic-design-interfaces';
import { MagicSelectComponent } from './select.component';

const FRUIT_OPTIONS: readonly SelectOption<string>[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'durian', label: 'Durian', disabled: true },
];

const GROUPED_OPTIONS: readonly SelectOptionGroup<string>[] = [
  {
    label: 'Citrus',
    options: [
      { value: 'lemon', label: 'Lemon' },
      { value: 'orange', label: 'Orange' },
    ],
  },
  {
    label: 'Berries',
    disabled: true,
    options: [{ value: 'strawberry', label: 'Strawberry' }],
  },
];

@Component({
  imports: [ReactiveFormsModule, MagicSelectComponent],
  template: `
    <magic-select
      [formControl]="control"
      [options]="options"
      label="Favorite fruit"
      testId="reactive-select"
    />
  `,
})
class ReactiveHostComponent {
  readonly options = FRUIT_OPTIONS;
  readonly control = new FormControl<string | null>('banana', {
    validators: [Validators.required],
  });
}

@Component({
  imports: [FormsModule, MagicSelectComponent],
  template: `
    <magic-select
      [(ngModel)]="selected"
      [options]="options"
      label="Fruit"
      testId="ngmodel-select"
    />
  `,
})
class NgModelHostComponent {
  readonly options = FRUIT_OPTIONS;
  selected: string | null = 'apple';
}

@Component({
  imports: [FormField, MagicSelectComponent],
  template: `
    <magic-select
      [formField]="modelForm.fruit"
      [options]="options"
      label="Signal fruit"
      testId="signal-select"
    />
  `,
})
class SignalFormHostComponent {
  readonly options = FRUIT_OPTIONS;
  readonly data = signal<{ fruit: string | null }>({ fruit: 'cherry' });
  readonly modelForm = form(this.data, (path) => {
    required(path.fruit);
  });
}

@Component({
  imports: [MagicSelectComponent],
  template: `
    <magic-select
      [options]="options"
      [multiple]="true"
      [customTriggerSummary]="customSummary()"
      [(value)]="selected"
      testId="multi-select"
    />
  `,
})
class MultipleHostComponent {
  readonly options = FRUIT_OPTIONS;
  readonly customSummary = signal(true);
  readonly selected = signal<readonly string[]>(['apple', 'banana']);
}

describe('MagicSelectComponent', () => {
  let fixture: ComponentFixture<MagicSelectComponent<string>>;
  let overlayContainer: OverlayContainer;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const flushMicrotasks = async (target: ComponentFixture<unknown>) => {
    await target.whenStable();
    target.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const trigger = (root: HTMLElement = host()): HTMLElement =>
    root.querySelector('mat-select') as HTMLElement;
  const formField = (root: HTMLElement = host()): HTMLElement =>
    root.querySelector('magic-form-field') as HTMLElement;
  const overlayOptions = (): HTMLElement[] =>
    Array.from(
      overlayContainer.getContainerElement().querySelectorAll('mat-option'),
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicSelectComponent],
    }).compileComponents();
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture = TestBed.createComponent(MagicSelectComponent<string>);
    setInputs({ options: FRUIT_OPTIONS, label: 'Fruit' });
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  describe('rendering & accessibility', () => {
    it('composes magic-form-field and mat-select with clean host id', () => {
      setInputs({
        id: 'fruit-id',
        testId: 'fruit',
        ariaLabel: 'Choose a fruit',
        placeholder: 'Pick one',
        hint: 'Seasonal selection',
      });

      expect(formField()).toBeTruthy();
      expect(host().getAttribute('id')).toBeNull();
      expect(trigger().id).toBe('fruit-id');
      expect(trigger().getAttribute('data-testid')).toBe('fruit');
      expect(trigger().getAttribute('aria-label')).toBe('Choose a fruit');
      expect(host().textContent).toContain('Fruit');
      expect(host().textContent).toContain('Seasonal selection');
    });

    it.each(['outlined', 'filled'] as const)(
      'supports appearance=%s',
      (appearance) => {
        setInputs({ appearance });
        const matField = host().querySelector('mat-form-field') as HTMLElement;
        expect(matField.classList).toContain(
          appearance === 'outlined'
            ? 'mat-form-field-appearance-outline'
            : 'mat-form-field-appearance-fill',
        );
      },
    );

    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as AtomicSize[])(
      'applies magic-size-%s to host and form field',
      (size) => {
        setInputs({ size });
        expect(host().classList).toContain(`magic-size-${size}`);
        expect(formField().classList).toContain(`magic-size-${size}`);
      },
    );
  });

  describe('options, optionGroups & selection', () => {
    it('opens panel, selects an option, and emits value, changed, openedChanged & touch', async () => {
      const valueSpy = vi.fn();
      const changedSpy = vi.fn();
      const openedSpy = vi.fn();
      const touchSpy = vi.fn();

      fixture.componentInstance.value.subscribe(valueSpy);
      fixture.componentInstance.changed.subscribe(changedSpy);
      fixture.componentInstance.openedChanged.subscribe(openedSpy);
      fixture.componentInstance.touch.subscribe(touchSpy);

      trigger().click();
      await flushMicrotasks(fixture);

      expect(openedSpy).toHaveBeenCalledWith(true);
      const opts = overlayOptions();
      expect(opts).toHaveLength(4);
      expect(opts[3].getAttribute('aria-disabled')).toBe('true');

      opts[1].click();
      await flushMicrotasks(fixture);

      expect(fixture.componentInstance.value()).toBe('banana');
      expect(valueSpy).toHaveBeenCalledWith('banana');
      expect(changedSpy).toHaveBeenCalledWith('banana');
      expect(openedSpy).toHaveBeenCalledWith(false);
      expect(touchSpy).toHaveBeenCalledTimes(1);
    });

    it('renders grouped options via mat-optgroup including group disabled state', () => {
      setInputs({ options: [], optionGroups: GROUPED_OPTIONS });

      trigger().click();
      fixture.detectChanges();

      const groups = overlayContainer
        .getContainerElement()
        .querySelectorAll('mat-optgroup');
      expect(groups).toHaveLength(2);
      expect(groups[0].textContent).toContain('Citrus');
      expect(groups[1].getAttribute('aria-disabled')).toBe('true');
      expect(overlayOptions()).toHaveLength(3);
    });

    it('formats multiple selection customTriggerSummary cleanly for singular and plural extras', async () => {
      const multiFixture = TestBed.createComponent(MultipleHostComponent);
      multiFixture.detectChanges();
      await flushMicrotasks(multiFixture);

      expect(trigger(multiFixture.nativeElement).textContent).toContain(
        'Apple (+1 other)',
      );

      multiFixture.componentInstance.selected.set([
        'apple',
        'banana',
        'cherry',
      ]);
      multiFixture.detectChanges();
      await flushMicrotasks(multiFixture);

      expect(trigger(multiFixture.nativeElement).textContent).toContain(
        'Apple (+2 others)',
      );

      multiFixture.componentInstance.customSummary.set(false);
      multiFixture.detectChanges();
      await flushMicrotasks(multiFixture);
      expect(trigger(multiFixture.nativeElement).textContent).toContain(
        'Apple, Banana, Cherry',
      );
    });
  });

  describe('states & imperative methods', () => {
    it('supports disabled, required and error states', () => {
      setInputs({
        disabled: true,
        required: true,
        invalid: true,
        errorText: 'Selection is required',
      });

      expect(trigger().getAttribute('aria-disabled')).toBe('true');
      expect(trigger().getAttribute('aria-required')).toBe('true');
      expect(trigger().getAttribute('aria-invalid')).toBe('true');
      expect(host().textContent).toContain('Selection is required');
    });

    it('emits touch on blur when closed and supports focus() / reset()', () => {
      const touchSpy = vi.fn();
      fixture.componentInstance.touch.subscribe(touchSpy);

      setInputs({ value: 'apple' });
      const focusSpy = vi.spyOn(trigger(), 'focus');
      fixture.componentInstance.focus();
      expect(focusSpy).toHaveBeenCalledTimes(1);

      trigger().dispatchEvent(new FocusEvent('blur'));
      fixture.detectChanges();
      expect(touchSpy).toHaveBeenCalledTimes(1);

      fixture.componentInstance.reset();
      fixture.detectChanges();
      expect(fixture.componentInstance.value()).toBeNull();
    });
  });

  describe('forms integration', () => {
    it('integrates with Reactive Forms (FormControl)', async () => {
      const hostFixture = TestBed.createComponent(ReactiveHostComponent);
      hostFixture.detectChanges();
      await flushMicrotasks(hostFixture);

      const sel = trigger(hostFixture.nativeElement);
      expect(sel.textContent).toContain('Banana');

      sel.click();
      await flushMicrotasks(hostFixture);
      overlayOptions()[0].click();
      await flushMicrotasks(hostFixture);
      expect(hostFixture.componentInstance.control.value).toBe('apple');

      hostFixture.componentInstance.control.disable();
      hostFixture.detectChanges();
      expect(sel.getAttribute('aria-disabled')).toBe('true');
    });

    it('integrates with Template-driven Forms ([(ngModel)])', async () => {
      const hostFixture = TestBed.createComponent(NgModelHostComponent);
      hostFixture.detectChanges();
      await flushMicrotasks(hostFixture);

      const sel = trigger(hostFixture.nativeElement);
      expect(sel.textContent).toContain('Apple');

      sel.click();
      await flushMicrotasks(hostFixture);
      overlayOptions()[2].click();
      await flushMicrotasks(hostFixture);
      expect(hostFixture.componentInstance.selected).toBe('cherry');
    });

    it('integrates with Signal Forms ([formField])', async () => {
      const hostFixture = TestBed.createComponent(SignalFormHostComponent);
      hostFixture.detectChanges();
      await flushMicrotasks(hostFixture);

      const sel = trigger(hostFixture.nativeElement);
      expect(sel.textContent).toContain('Cherry');

      sel.click();
      await flushMicrotasks(hostFixture);
      overlayOptions()[0].click();
      await flushMicrotasks(hostFixture);
      expect(hostFixture.componentInstance.data().fruit).toBe('apple');

      hostFixture.componentInstance.data.set({ fruit: null });
      hostFixture.detectChanges();
      expect(sel.getAttribute('aria-invalid')).toBe('true');
    });
  });
});
