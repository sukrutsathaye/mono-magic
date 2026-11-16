import { Component, EventEmitter, Input, Output } from '@angular/core';
import type {
  AtomicSize,
  ButtonVariant,
  ColorIntent,
  SearchBarMoleculeProps,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButtonComponent } from '../../atoms/button/button.component';
import { MagicTextInputComponent } from '../../atoms/text-input/text-input.component';

@Component({
  selector: 'mm-search-bar',
  standalone: true,
  imports: [MagicTextInputComponent, MagicButtonComponent],
  template: `
    <form
      [id]="id || null"
      [attr.data-testid]="testId || null"
      [attr.aria-label]="ariaLabel ?? label"
      class="mm-search-bar"
      (submit)="onSubmit($event)"
    >
      <div class="mm-search-bar__input">
        <mm-text-input
          [label]="label"
          [value]="currentQuery"
          [placeholder]="placeholder"
          [size]="size"
          [disabled]="disabled"
          [testId]="testId ? testId + '-input' : undefined"
          (valueChange)="onQueryUpdate($event)"
        />
      </div>
      <mm-button
        type="submit"
        [label]="submitLabel"
        [variant]="buttonVariant"
        [color]="buttonColor"
        [size]="size"
        [disabled]="disabled"
        [loading]="loading"
        [testId]="testId ? testId + '-submit' : undefined"
      />
    </form>
  `,
  styles: [
    `
      .mm-search-bar {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .mm-search-bar__input {
        flex: 1;
      }
    `,
  ],
})
export class MagicSearchBarComponent implements SearchBarMoleculeProps {
  @Input() id?: string;
  @Input() testId?: string;
  @Input() ariaLabel?: string;
  @Input() query?: string;
  @Input() placeholder = 'Search...';
  @Input() label = 'Search';
  @Input() submitLabel = 'Search';
  @Input() buttonVariant: ButtonVariant = 'filled';
  @Input() buttonColor: ColorIntent = 'primary';
  @Input() size: AtomicSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;

  @Output() queryChange = new EventEmitter<string>();
  @Output() searched = new EventEmitter<string>();

  private internalQuery = '';

  get currentQuery(): string {
    return this.query ?? this.internalQuery;
  }

  onQueryUpdate(next: string): void {
    if (this.query === undefined) {
      this.internalQuery = next;
    }
    this.queryChange.emit(next);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.disabled && !this.loading) {
      this.searched.emit(this.currentQuery);
    }
  }
}
