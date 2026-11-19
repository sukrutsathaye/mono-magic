import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';
import type {
  AtomicSize,
  FormFieldAppearance,
  FormFieldFloatLabel,
  FormFieldSubscriptSizing,
} from '@mono-magic/atomic-design-interfaces';
import { MagicTextInputComponent } from '../../atoms/text-input/text-input.component';
import {
  MagicFormFieldComponent,
  MagicPrefixDirective,
  MagicSuffixDirective,
} from './form-field.component';

@Component({
  imports: [
    MagicFormFieldComponent,
    MagicPrefixDirective,
    MagicSuffixDirective,
    MagicTextInputComponent,
    MatIcon,
  ],
  template: `
    <magic-form-field label="With Slots">
      <mat-icon magicPrefix>mail</mat-icon>
      <magic-text-input placeholder="you@domain.com" />
      <mat-icon magicSuffix>check_circle</mat-icon>
    </magic-form-field>
  `,
})
class FormFieldSlotsHostComponent {}

@Component({
  imports: [MagicFormFieldComponent, MagicTextInputComponent],
  template: `
    <magic-form-field
      [id]="id()"
      [testId]="testId()"
      [ariaLabel]="ariaLabel()"
      [label]="label()"
      [hint]="hint()"
      [errorText]="errorText()"
      [appearance]="appearance()"
      [size]="size()"
      [floatLabel]="floatLabel()"
      [subscriptSizing]="subscriptSizing()"
      [hideRequiredMarker]="hideRequiredMarker()"
    >
      <magic-text-input [required]="required()" placeholder="you@domain.com" />
    </magic-form-field>
  `,
})
class FormFieldHostComponent {
  readonly id = signal<string | undefined>(undefined);
  readonly testId = signal<string | undefined>('email-field');
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly label = signal<string | undefined>('Email');
  readonly hint = signal<string | undefined>('Enter a valid email');
  readonly errorText = signal<string | undefined>(undefined);
  readonly appearance = signal<FormFieldAppearance>('outlined');
  readonly size = signal<AtomicSize>('md');
  readonly floatLabel = signal<FormFieldFloatLabel>('auto');
  readonly subscriptSizing = signal<FormFieldSubscriptSizing>('fixed');
  readonly hideRequiredMarker = signal(false);
  readonly required = signal(false);
}

describe('MagicFormFieldComponent', () => {
  let fixture: ComponentFixture<FormFieldHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldHostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(FormFieldHostComponent);
    fixture.detectChanges();
  });

  const host = (): HTMLElement =>
    fixture.nativeElement.querySelector('magic-form-field');
  const matField = (): HTMLElement =>
    host().querySelector('mat-form-field') as HTMLElement;

  it('renders a mat-form-field with label, hint and projected control', () => {
    expect(matField()).toBeTruthy();
    expect(matField().getAttribute('data-testid')).toBe('email-field');
    expect(host().querySelector('mat-label')?.textContent?.trim()).toBe('Email');
    expect(host().querySelector('mat-hint')?.textContent?.trim()).toBe(
      'Enter a valid email',
    );
    expect(host().querySelector('magic-text-input input')).toBeTruthy();
  });

  it('switches between outlined and filled appearances', () => {
    expect(matField().className).toContain('mat-form-field-appearance-outline');

    fixture.componentInstance.appearance.set('filled');
    fixture.detectChanges();
    expect(matField().className).toContain('mat-form-field-appearance-fill');
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as AtomicSize[])(
    'applies magic-size-%s class',
    (size) => {
      fixture.componentInstance.size.set(size);
      fixture.detectChanges();
      expect(host().classList).toContain(`magic-size-${size}`);
    },
  );

  it('displays errorText when set and clears it back to hint when unset', () => {
    fixture.componentInstance.errorText.set('Email is invalid');
    fixture.detectChanges();
    expect(host().querySelector('mat-error')?.textContent?.trim()).toBe(
      'Email is invalid',
    );

    fixture.componentInstance.errorText.set(undefined);
    fixture.detectChanges();
    expect(host().querySelector('mat-error')).toBeNull();
    expect(host().querySelector('mat-hint')?.textContent?.trim()).toBe(
      'Enter a valid email',
    );
  });

  it('projects [magicPrefix] and [magicSuffix] slots into mat-form-field', () => {
    const slotsFixture = TestBed.createComponent(FormFieldSlotsHostComponent);
    slotsFixture.detectChanges();
    const slotsHost = slotsFixture.nativeElement as HTMLElement;

    expect(
      slotsHost.querySelector('.mat-mdc-form-field-icon-prefix mat-icon')
        ?.textContent,
    ).toContain('mail');
    expect(
      slotsHost.querySelector('.mat-mdc-form-field-icon-suffix mat-icon')
        ?.textContent,
    ).toContain('check_circle');
  });

  it('respects floatLabel, subscriptSizing, hideRequiredMarker and host id forwarding', () => {
    fixture.componentInstance.id.set('field-1');
    fixture.componentInstance.floatLabel.set('always');
    fixture.componentInstance.subscriptSizing.set('dynamic');
    fixture.componentInstance.required.set(true);
    fixture.componentInstance.hideRequiredMarker.set(true);
    fixture.detectChanges();

    expect(host().getAttribute('id')).toBeNull();
    expect(matField().id).toBe('field-1');
    expect(matField().className).toContain('mat-mdc-form-field-label-always-float');
    expect(
      host().querySelector('.mat-mdc-form-field-subscript-dynamic-size'),
    ).toBeTruthy();
    expect(host().querySelector('.mat-mdc-form-field-required-marker')).toBeNull();
  });
});
