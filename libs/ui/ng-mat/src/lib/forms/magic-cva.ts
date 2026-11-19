import {
  inject,
  type ModelSignal,
  type OutputRef,
  type Provider,
  type Type,
  type WritableSignal,
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  type ControlValueAccessor,
  type NgControl,
} from '@angular/forms';

/**
 * What a form-control atom must expose to be bridged to Reactive / template
 * driven forms. It deliberately mirrors the Signal Forms control contracts
 * (`FormValueControl` / `FormCheckboxControl`): a `value` or `checked`
 * `model()` plus a `touch` output. That means one component works with
 * `[formField]`, `formControlName`, `formControl` and `[(ngModel)]`.
 */
export interface MagicCvaTarget<T> {
  /** `FormValueControl` style model. Provide this OR `checked`. */
  readonly value?: ModelSignal<T>;
  /** `FormCheckboxControl` style model. Provide this OR `value`. */
  readonly checked?: ModelSignal<boolean>;
  /** Emit when the control loses focus. */
  readonly touch: OutputRef<void>;
  /** Written by `setDisabledState`; combine with your `disabled` input. */
  readonly formDisabled: WritableSignal<boolean>;
}

/**
 * Single, shared `ControlValueAccessor` implementation for every Magic form
 * atom. The atom itself stays free of `writeValue` / `registerOnChange`
 * boilerplate.
 */
export class MagicValueAccessor<T> implements ControlValueAccessor {
  private onChange: (value: T) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private writing = false;

  constructor(private readonly host: MagicCvaTarget<T>) {
    this.model.subscribe((next) => {
      if (!this.writing) {
        this.onChange(next as T);
      }
    });
    host.touch.subscribe(() => this.onTouched());
  }

  private get model(): ModelSignal<T> {
    const model = (this.host.value ?? this.host.checked) as
      | ModelSignal<T>
      | undefined;
    if (!model) {
      throw new Error(
        'MagicCvaTarget must expose either a `value` or a `checked` model().',
      );
    }
    return model;
  }

  writeValue(value: T | null): void {
    this.writing = true;
    try {
      this.model.set(value as T);
    } finally {
      this.writing = false;
    }
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.host.formDisabled.set(isDisabled);
  }
}

/**
 * Registers the shared accessor on a component:
 *
 * ```ts
 * @Component({ providers: [provideMagicValueAccessor(() => MagicFooComponent)] })
 * ```
 */
export function provideMagicValueAccessor<T>(
  host: () => Type<MagicCvaTarget<T>>,
): Provider {
  return {
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useFactory: () => new MagicValueAccessor<T>(inject(host())),
  };
}

/**
 * Attaches the shared accessor directly onto an injected `NgControl`. Use this
 * for `MatFormFieldControl` components that inject `NgControl` themselves, to
 * avoid circular DI on `NG_VALUE_ACCESSOR`.
 */
export function bindMagicValueAccessor<T>(
  host: MagicCvaTarget<T>,
  ngControl: NgControl | null,
): MagicValueAccessor<T> | null {
  if (!ngControl) {
    return null;
  }
  const accessor = new MagicValueAccessor<T>(host);
  ngControl.valueAccessor = accessor;
  return accessor;
}
