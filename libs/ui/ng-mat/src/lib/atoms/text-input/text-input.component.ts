import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  type DoCheck,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import type { FormValueControl } from '@angular/forms/signals';
import { MatFormFieldControl } from '@angular/material/form-field';
import type {
  AtomicSize,
  TextInputControlProps,
  TextInputType,
} from '@mono-magic/atomic-design-interfaces';
import { Subject } from 'rxjs';
import type { SignalProps } from '../../core/signal-props';
import {
  bindMagicValueAccessor,
  type MagicCvaTarget,
} from '../../forms/magic-cva';

let nextUniqueId = 0;

/**
 * Bridge exposing `MagicTextInputComponent` as a `MatFormFieldControl` so
 * `<magic-form-field>` can project it cleanly without conflicting with
 * `SignalProps` input types on the component itself.
 */
class MagicTextInputFormFieldControl implements MatFormFieldControl<string> {
  readonly controlType = 'magic-text-input';
  readonly autofilled = false;
  readonly stateChanges;
  readonly focused;
  readonly empty;
  readonly shouldLabelFloat;
  readonly required;
  readonly disabled;
  readonly errorState;

  constructor(private readonly host: MagicTextInputComponent) {
    this.stateChanges = host.stateChanges;
    this.focused = host.focused;
    this.empty = host.isEmpty;
    this.shouldLabelFloat = computed(
      () => host.focused() || !host.isEmpty(),
    );
    this.required = host.required;
    this.disabled = host.isDisabled;
    this.errorState = host.isErrorState;
  }

  get id(): string {
    return this.host.inputId();
  }

  get ngControl(): NgControl | null {
    return this.host.ngControl;
  }

  get placeholder(): string {
    return this.host.placeholder();
  }

  get value(): string {
    return this.host.value();
  }

  set value(val: string) {
    this.host.value.set(val ?? '');
  }

  setForcedError(hasError: boolean): void {
    this.host.forcedError.set(hasError);
  }

  setDescribedByIds(ids: string[]): void {
    this.host.describedByIds.set(ids.join(' '));
  }

  onContainerClick(event: MouseEvent): void {
    if ((event.target as HTMLElement | null)?.tagName !== 'INPUT') {
      this.host.focus();
    }
  }
}

/**
 * A bare, single-element text input atom.
 *
 * Renders only a native `<input>` inside the host so it adheres strictly to
 * atomic design. Wrap it in `<magic-form-field>` whenever a floating label,
 * hint, error message or prefix/suffix icon is needed.
 *
 * Supports Signal Forms (`FormValueControl`), Reactive Forms (`formControl` /
 * `formControlName`), Template-driven Forms (`[(ngModel)]`) and direct
 * `[(value)]` binding.
 *
 * @see https://material.angular.dev/components/input/overview
 * @see https://angular.dev/guide/forms/signals/custom-controls
 */
@Component({
  selector: 'magic-text-input',
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: MatFormFieldControl,
      useFactory: () =>
        new MagicTextInputFormFieldControl(inject(MagicTextInputComponent)),
    },
  ],
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicTextInputComponent
  implements
    SignalProps<TextInputControlProps>,
    FormValueControl<string>,
    MagicCvaTarget<string>,
    DoCheck
{
  private readonly fallbackId = `magic-text-input-${nextUniqueId++}`;
  private readonly nativeInput =
    viewChild<ElementRef<HTMLInputElement>>('nativeInput');
  private readonly controlStateVersion = signal(0);
  private lastControlSnapshot = '';

  readonly ngControl = inject(NgControl, { optional: true, self: true });

  /** Native `id` placed on the inner `<input>` (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the inner `<input>`. */
  readonly testId = input<string>();
  /** Accessible name when no `<magic-form-field>` label is present. */
  readonly ariaLabel = input<string>();
  /** Native input `type`. */
  readonly type = input<TextInputType>('text');
  /** Native `name`. */
  readonly name = input<string>('');
  /** Current text value. Two-way bindable and synced with Angular Forms. */
  readonly value = model<string>('');
  /** Placeholder text. */
  readonly placeholder = input<string>('');
  /** Control size token (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');
  /** Disables the input. */
  readonly disabled = input(false);
  /** Marks the input as required. */
  readonly required = input(false);
  /** Makes the input read-only. */
  readonly readOnly = input(false);
  /** Native `autocomplete` attribute. */
  readonly autocomplete = input<string>();
  /** Minimum character length. */
  readonly minLength = input<number>();
  /** Maximum character length. */
  readonly maxLength = input<number>();
  /** Signal Forms invalid state. */
  readonly invalid = input(false);
  /** Signal Forms touched state. */
  readonly touched = input(false);
  /** Signal Forms dirty state. */
  readonly dirty = input(false);

  /** Emits when focus leaves the input (`FormValueControl.touch`). */
  readonly touch = output<void>();
  /** Emits the current value when the user presses Enter. */
  readonly submitted = output<string>();

  /** @internal */
  readonly formDisabled = signal(false);
  /** @internal */
  readonly focused = signal(false);
  /** @internal */
  readonly describedByIds = signal('');
  /** @internal */
  readonly forcedError = signal(false);
  /** @internal */
  readonly stateChanges = new Subject<void>();
  private readonly destroyRef = inject(DestroyRef);

  /** Resolved DOM id for `<mat-form-field>` label `for` binding. */
  readonly inputId = computed(() => this.id() || this.fallbackId);
  /** Effective disabled state combining the `disabled` input and form state. */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  /** True when the input contains no text. */
  readonly isEmpty = computed(() => (this.value() ?? '').length === 0);
  /** Effective error state across Signal Forms, Reactive/Template Forms, and `magic-form-field`. */
  readonly isErrorState = computed(() => {
    this.controlStateVersion();
    const ctrl = this.ngControl;
    const reactiveInvalid = Boolean(
      ctrl?.invalid && (ctrl.touched || ctrl.dirty),
    );
    return this.invalid() || this.forcedError() || reactiveInvalid;
  });

  protected readonly hostClasses = computed(() => `magic-size-${this.size()}`);

  constructor() {
    bindMagicValueAccessor(this, this.ngControl);
    effect(() => {
      this.focused();
      this.value();
      this.required();
      this.isDisabled();
      this.isErrorState();
      this.placeholder();
      this.stateChanges.next();
    });
    this.destroyRef.onDestroy(() => this.stateChanges.complete());
  }

  ngDoCheck(): void {
    const ctrl = this.ngControl;
    if (!ctrl) {
      return;
    }
    const snapshot = `${Boolean(ctrl.invalid)}|${Boolean(ctrl.touched)}|${Boolean(ctrl.dirty)}`;
    if (snapshot !== this.lastControlSnapshot) {
      this.lastControlSnapshot = snapshot;
      this.controlStateVersion.update((v) => v + 1);
    }
  }

  /** Focuses the underlying `<input>` element. */
  focus(options?: FocusOptions): void {
    this.nativeInput()?.nativeElement.focus(options);
  }

  /** Resets the text value to an empty string. */
  reset(): void {
    this.value.set('');
  }

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
  }

  protected onFocus(): void {
    this.focused.set(true);
  }

  protected onBlur(): void {
    this.focused.set(false);
    this.touch.emit();
  }

  protected onEnter(): void {
    this.submitted.emit(this.value() ?? '');
  }
}
