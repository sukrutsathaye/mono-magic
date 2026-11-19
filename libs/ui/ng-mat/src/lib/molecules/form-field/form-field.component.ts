import {
  type AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  Directive,
  computed,
  contentChild,
  contentChildren,
  effect,
  input,
  viewChild,
} from '@angular/core';
import {
  MatError,
  MatFormField,
  MatFormFieldControl,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix,
  type MatFormFieldAppearance,
} from '@angular/material/form-field';
import type {
  AtomicSize,
  FormFieldAppearance,
  FormFieldFloatLabel,
  FormFieldMoleculeProps,
  FormFieldSubscriptSizing,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';

interface ForcedErrorControl {
  setForcedError?(hasError: boolean): void;
}

/** Projects prefix content (icon or text) into `magic-form-field`. */
@Directive({
  selector: '[magicPrefix]',
})
export class MagicPrefixDirective {}

/** Projects suffix content (icon or text) into `magic-form-field`. */
@Directive({
  selector: '[magicSuffix]',
})
export class MagicSuffixDirective {}

/**
 * The only component in the library that renders `mat-form-field`.
 *
 * It wraps any control atom (`magic-text-input`, `magic-select`, ...) and adds
 * the floating label, hint, error message and `[magicPrefix]` / `[magicSuffix]`
 * slots.
 *
 * ```html
 * <magic-form-field label="Email" hint="We never share it">
 *   <magic-text-input type="email" />
 * </magic-form-field>
 * ```
 *
 * @see https://material.angular.dev/components/form-field/overview
 */
@Component({
  selector: 'magic-form-field',
  imports: [MatFormField, MatLabel, MatHint, MatError, MatPrefix, MatSuffix],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicFormFieldComponent
  implements SignalProps<FormFieldMoleculeProps>, AfterContentInit
{
  /** Id of the field wrapper (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the field. */
  readonly testId = input<string>();
  /** Accessible name; usually unnecessary when `label` is set. */
  readonly ariaLabel = input<string>();
  /** Floating label text. */
  readonly label = input<string>();
  /** Helper text shown under the control. */
  readonly hint = input<string>();
  /** Error message shown under the control; puts the projected control in an error state. */
  readonly errorText = input<string>();
  /** Material field appearance (`outlined` or `filled`). */
  readonly appearance = input<FormFieldAppearance>('outlined');
  /** Field size token (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');
  /** Floating label behaviour (`auto` or `always`). */
  readonly floatLabel = input<FormFieldFloatLabel>('auto');
  /** Whether subscript error/hint space is reserved (`fixed` or `dynamic`). */
  readonly subscriptSizing = input<FormFieldSubscriptSizing>('fixed');
  /** Hides the required asterisk next to the label. */
  readonly hideRequiredMarker = input(false);

  private readonly control = contentChild(MatFormFieldControl);
  private readonly prefixChildren = contentChildren(MagicPrefixDirective, {
    descendants: true,
  });
  private readonly suffixChildren = contentChildren(MagicSuffixDirective, {
    descendants: true,
  });
  private readonly matFormField = viewChild.required(MatFormField);

  protected readonly hasPrefix = computed(
    () => this.prefixChildren().length > 0,
  );
  protected readonly hasSuffix = computed(
    () => this.suffixChildren().length > 0,
  );

  protected readonly matAppearance = computed<MatFormFieldAppearance>(() =>
    this.appearance() === 'filled' ? 'fill' : 'outline',
  );

  protected readonly hostClasses = computed(() => `magic-size-${this.size()}`);

  constructor() {
    effect(() => {
      const control = this.control() as
        | (MatFormFieldControl<unknown> & ForcedErrorControl)
        | undefined;
      if (control) {
        this.matFormField()._control = control;
        control.setForcedError?.(Boolean(this.errorText()));
      }
    });
  }

  ngAfterContentInit(): void {
    // `mat-form-field` cannot see a control projected through <ng-content>,
    // so hand it over explicitly before MatFormField's own ngAfterContentInit runs.
    const control = this.control() as
      | (MatFormFieldControl<unknown> & ForcedErrorControl)
      | undefined;
    if (control) {
      this.matFormField()._control = control;
      control.setForcedError?.(Boolean(this.errorText()));
    }
  }
}
