import { Component, model, output, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { vi } from 'vitest';
import {
  MagicValueAccessor,
  bindMagicValueAccessor,
  provideMagicValueAccessor,
  type MagicCvaTarget,
} from './magic-cva';

@Component({
  selector: 'magic-cva-value-host',
  template: '',
  providers: [provideMagicValueAccessor(() => CvaValueHostComponent)],
})
class CvaValueHostComponent implements MagicCvaTarget<string> {
  readonly value = model('');
  readonly touch = output<void>();
  readonly formDisabled = signal(false);
}

@Component({
  selector: 'magic-cva-checkbox-host',
  template: '',
  providers: [provideMagicValueAccessor(() => CvaCheckboxHostComponent)],
})
class CvaCheckboxHostComponent implements MagicCvaTarget<boolean> {
  readonly checked = model(false);
  readonly touch = output<void>();
  readonly formDisabled = signal(false);
}

@Component({
  selector: 'magic-cva-empty-host',
  template: '',
})
class CvaEmptyHostComponent implements MagicCvaTarget<string> {
  readonly touch = output<void>();
  readonly formDisabled = signal(false);
}

@Component({
  imports: [ReactiveFormsModule, CvaValueHostComponent, CvaCheckboxHostComponent],
  template: `
    <magic-cva-value-host [formControl]="textControl" />
    <magic-cva-checkbox-host [formControl]="checkControl" />
  `,
})
class FormsHostComponent {
  readonly textControl = new FormControl('initial', { nonNullable: true });
  readonly checkControl = new FormControl(true, { nonNullable: true });
}

describe('MagicValueAccessor', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsHostComponent, CvaEmptyHostComponent],
    }).compileComponents();
  });

  it('syncs a FormControl with a value model()', () => {
    const fixture = TestBed.createComponent(FormsHostComponent);
    fixture.detectChanges();

    const valueHost = fixture.debugElement.children[0]
      .componentInstance as CvaValueHostComponent;
    expect(valueHost.value()).toBe('initial');

    valueHost.value.set('updated');
    expect(fixture.componentInstance.textControl.value).toBe('updated');

    fixture.componentInstance.textControl.setValue('from-form');
    expect(valueHost.value()).toBe('from-form');
  });

  it('syncs a FormControl with a checked model()', () => {
    const fixture = TestBed.createComponent(FormsHostComponent);
    fixture.detectChanges();

    const checkHost = fixture.debugElement.children[1]
      .componentInstance as CvaCheckboxHostComponent;
    expect(checkHost.checked()).toBe(true);

    checkHost.checked.set(false);
    expect(fixture.componentInstance.checkControl.value).toBe(false);
  });

  it('propagates touched and disabled states through the form control', () => {
    const fixture = TestBed.createComponent(FormsHostComponent);
    fixture.detectChanges();

    const valueHost = fixture.debugElement.children[0]
      .componentInstance as CvaValueHostComponent;

    expect(fixture.componentInstance.textControl.touched).toBe(false);
    valueHost.touch.emit();
    expect(fixture.componentInstance.textControl.touched).toBe(true);

    fixture.componentInstance.textControl.disable();
    expect(valueHost.formDisabled()).toBe(true);

    fixture.componentInstance.textControl.enable();
    expect(valueHost.formDisabled()).toBe(false);
  });

  it('does not echo writeValue back through onChange', () => {
    const fixture = TestBed.createComponent(CvaValueHostComponent);
    const accessor = new MagicValueAccessor(fixture.componentInstance);
    const onChange = vi.fn();
    accessor.registerOnChange(onChange);

    accessor.writeValue('external');
    expect(fixture.componentInstance.value()).toBe('external');
    expect(onChange).not.toHaveBeenCalled();

    fixture.componentInstance.value.set('user');
    expect(onChange).toHaveBeenCalledWith('user');
  });

  it('throws if neither value nor checked model() is exposed', () => {
    const fixture = TestBed.createComponent(CvaEmptyHostComponent);
    expect(() => new MagicValueAccessor(fixture.componentInstance)).toThrow(
      /must expose either a `value` or a `checked` model\(\)/,
    );
  });

  it('binds directly onto an NgControl when provided or returns null when absent', () => {
    const fixture = TestBed.createComponent(CvaValueHostComponent);
    expect(bindMagicValueAccessor(fixture.componentInstance, null)).toBeNull();

    const fakeNgControl = { valueAccessor: null } as unknown as NgControl;
    const accessor = bindMagicValueAccessor(
      fixture.componentInstance,
      fakeNgControl,
    );
    expect(accessor).toBeInstanceOf(MagicValueAccessor);
    expect(fakeNgControl.valueAccessor).toBe(accessor);
  });
});
