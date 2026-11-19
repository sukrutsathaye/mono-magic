import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import type {
  AtomicSize,
  ButtonVariant,
  ColorIntent,
  SearchBarMoleculeProps,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButtonComponent } from '../../atoms/button/button.component';
import { MagicTextInputComponent } from '../../atoms/text-input/text-input.component';
import type { SignalProps } from '../../core/signal-props';
import { MagicFormFieldComponent } from '../form-field/form-field.component';

/**
 * A search form composed from `magic-form-field`, `magic-text-input` and
 * `magic-button`. Submitting (Enter or the button) emits `searched`.
 */
@Component({
  selector: 'magic-search-bar',
  imports: [MagicFormFieldComponent, MagicTextInputComponent, MagicButtonComponent],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.id]': 'null' },
})
export class MagicSearchBarComponent
  implements SignalProps<SearchBarMoleculeProps>
{
  /** Id of the underlying `<form>` (the host id is removed). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the form (`-input` / `-submit` on children). */
  readonly testId = input<string>();
  /** Accessible name of the search landmark. Falls back to `label`. */
  readonly ariaLabel = input<string>();
  /** Current query. Two-way bindable. */
  readonly query = model<string>('');
  /** Input placeholder. */
  readonly placeholder = input('Search...');
  /** Floating label of the field. */
  readonly label = input('Search');
  /** Text of the submit button. */
  readonly submitLabel = input('Search');
  /** Visual emphasis of the submit button. */
  readonly buttonVariant = input<ButtonVariant>('filled');
  /** Color role of the submit button. */
  readonly buttonColor = input<ColorIntent>('primary');
  /** Size applied to the field and button. */
  readonly size = input<AtomicSize>('md');
  /** Disables the input and the button. */
  readonly disabled = input(false);
  /** Shows the button's loading state and blocks submission. */
  readonly loading = input(false);

  /** Emits the current query on submit. */
  readonly searched = output<string>();

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.disabled() && !this.loading()) {
      this.searched.emit(this.query());
    }
  }
}
