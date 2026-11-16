import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import type {
  AtomicSize,
  ButtonAtomProps,
  ButtonVariant,
  ColorIntent,
} from '@mono-magic/interfaces';

@Component({
  selector: 'mm-button',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <button
      [id]="id || null"
      [attr.data-testid]="testId || null"
      [attr.aria-label]="ariaLabel ?? label"
      [attr.type]="type"
      [matButton]="variant"
      [disabled]="disabled || loading"
      [showProgress]="loading"
      [class]="hostClasses"
      (click)="handleClick()"
    >
      {{ loading ? loadingLabel || label : label }}
    </button>
  `,
  styles: [
    `
      .mm-btn--full-width {
        width: 100%;
      }
      .mm-btn--xs,
      .mm-btn--sm {
        font-size: 0.8125rem;
      }
      .mm-btn--lg,
      .mm-btn--xl {
        font-size: 1rem;
        padding-inline: 1.5rem;
      }
    `,
  ],
})
export class MagicButtonComponent implements ButtonAtomProps {
  @Input() id?: string;
  @Input() testId?: string;
  @Input() ariaLabel?: string;
  @Input() label = 'Button';
  @Input() variant: ButtonVariant = 'filled';
  @Input() color: ColorIntent = 'primary';
  @Input() size: AtomicSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() loadingLabel?: string;
  @Input() fullWidth = false;
  @Input() leadingIcon?: string;
  @Input() trailingIcon?: string;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output() clicked = new EventEmitter<void>();

  get hostClasses(): string {
    return [
      `mm-btn--${this.size}`,
      `mm-btn--${this.color}`,
      this.fullWidth ? 'mm-btn--full-width' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  handleClick(): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }
}
