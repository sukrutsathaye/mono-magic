import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { vi } from 'vitest';
import type {
  AtomicSize,
  ButtonToggleOption,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButtonToggleComponent } from './button-toggle.component';

const OPTIONS: ButtonToggleOption[] = [
  { value: 'bold', label: 'Bold', icon: 'format_bold' },
  { value: 'italic', label: 'Italic', icon: 'format_italic' },
  { value: 'underline', label: 'Underline', disabled: true },
];

@Component({
  imports: [MagicButtonToggleComponent],
  template: `
    <magic-button-toggle
      selectionMode="multiple"
      [options]="options"
      [(value)]="val"
    />
  `,
})
class MultipleHostComponent {
  readonly options = OPTIONS;
  readonly val = signal<readonly string[]>(['bold']);
}

@Component({
  imports: [ReactiveFormsModule, MagicButtonToggleComponent],
  template: `<magic-button-toggle [formControl]="control" [options]="options" />`,
})
class ReactiveHostComponent {
  readonly options = OPTIONS;
  readonly control = new FormControl<string | undefined>('bold');
}

@Component({
  imports: [FormsModule, MagicButtonToggleComponent],
  template: `<magic-button-toggle [(ngModel)]="val" [options]="options" />`,
})
class NgModelHostComponent {
  readonly options = OPTIONS;
  val = 'italic';
}

@Component({
  imports: [FormField, MagicButtonToggleComponent],
  template: `<magic-button-toggle [formField]="modelForm.align" [options]="options" />`,
})
class SignalFormHostComponent {
  readonly options = OPTIONS;
  readonly data = signal({ align: 'bold' });
  readonly modelForm = form(this.data);
}

describe('MagicButtonToggleComponent', () => {
  let fixture: ComponentFixture<MagicButtonToggleComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const buttons = (): HTMLButtonElement[] =>
    Array.from(host().querySelectorAll('mat-button-toggle button'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicButtonToggleComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicButtonToggleComponent<string>);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
  });

  it('renders options with icons and updates single selection on click', () => {
    const spy = vi.fn();
    fixture.componentInstance.changed.subscribe(spy);

    expect(buttons()).toHaveLength(3);
    expect(host().querySelectorAll('mat-icon').length).toBe(2);
    expect(buttons()[2].disabled).toBe(true);

    buttons()[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('italic');
    expect(spy).toHaveBeenCalledWith('italic');
  });

  it('supports multiple selection mode', () => {
    const mFixture = TestBed.createComponent(MultipleHostComponent);
    mFixture.detectChanges();
    const mBtns = Array.from(
      mFixture.nativeElement.querySelectorAll('mat-button-toggle button'),
    ) as HTMLButtonElement[];
    expect(mBtns[0].getAttribute('aria-pressed')).toBe('true');

    mBtns[1].click();
    mFixture.detectChanges();
    expect(mFixture.componentInstance.val()).toEqual(['bold', 'italic']);
  });

  it('supports vertical, hideSelectionIndicator, disabled, disabledInteractive and attributes', () => {
    setInputs({
      id: 'fmt-toggle',
      testId: 'fmt',
      ariaLabel: 'Text formatting',
      vertical: true,
      hideSelectionIndicator: true,
      appearance: 'legacy',
      disabled: true,
    });

    const group = host().querySelector('mat-button-toggle-group') as HTMLElement;
    expect(host().getAttribute('id')).toBeNull();
    expect(group.id).toBe('fmt-toggle');
    expect(group.getAttribute('data-testid')).toBe('fmt');
    expect(group.getAttribute('aria-label')).toBe('Text formatting');
    expect(group.className).toContain('mat-button-toggle-vertical');
    expect(buttons().every((b) => b.disabled)).toBe(true);
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
    const rxBtns = Array.from(
      rxFixture.nativeElement.querySelectorAll('mat-button-toggle button'),
    ) as HTMLButtonElement[];
    expect(rxBtns[0].getAttribute('aria-checked')).toBe('true');
    rxBtns[1].click();
    expect(rxFixture.componentInstance.control.value).toBe('italic');

    const ngFixture = TestBed.createComponent(NgModelHostComponent);
    ngFixture.detectChanges();
    await ngFixture.whenStable();
    ngFixture.detectChanges();
    const ngBtns = Array.from(
      ngFixture.nativeElement.querySelectorAll('mat-button-toggle button'),
    ) as HTMLButtonElement[];
    expect(ngBtns[1].getAttribute('aria-checked')).toBe('true');

    const sfFixture = TestBed.createComponent(SignalFormHostComponent);
    sfFixture.detectChanges();
    await sfFixture.whenStable();
    sfFixture.detectChanges();
    const sfBtns = Array.from(
      sfFixture.nativeElement.querySelectorAll('mat-button-toggle button'),
    ) as HTMLButtonElement[];
    sfBtns[1].click();
    expect(sfFixture.componentInstance.data().align).toBe('italic');
  });
});
