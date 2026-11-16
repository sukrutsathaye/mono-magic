import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  MatFormFieldAppearance,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type {
  AtomicSize,
  TextInputAtomProps,
  TextInputVariant,
} from '@mono-magic/atomic-design-interfaces';

@Component({
  selector: 'mm-text-input',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field [appearance]="matAppearance" class="mm-text-input-field">
      <mat-label>{{ label }}</mat-label>
      <input
        matInput
        [id]="id || ''"
        [attr.data-testid]="testId || null"
        [attr.aria-label]="ariaLabel ?? label"
        [value]="value ?? ''"
        [placeholder]="placeholder ?? ''"
        [disabled]="disabled"
        [required]="required"
        [readonly]="readOnly"
        (input)="onInput($event)"
        (keyup.enter)="submitted.emit()"
      />
      @if (errorText) {
        <mat-error>{{ errorText }}</mat-error>
      } @else if (helperText) {
        <mat-hint>{{ helperText }}</mat-hint>
      }
    </mat-form-field>
  `,
  styles: [
    `
      .mm-text-input-field {
        width: 100%;
      }
    `,
  ],
})
export class MagicTextInputComponent implements TextInputAtomProps {
  @Input() id?: string;
  @Input() testId?: string;
  @Input() ariaLabel?: string;
  @Input() label = '';
  @Input() value?: string;
  @Input() placeholder?: string;
  @Input() helperText?: string;
  @Input() errorText?: string;
  @Input() variant: TextInputVariant = 'outlined';
  @Input() size: AtomicSize = 'md';
  @Input() disabled = false;
  @Input() required = false;
  @Input() readOnly = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output() submitted = new EventEmitter<void>();

  get matAppearance(): MatFormFieldAppearance {
    return this.variant === 'filled' ? 'fill' : 'outline';
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.valueChange.emit(target?.value ?? '');
  }
}
