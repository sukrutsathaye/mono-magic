import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import {
  MatButton,
  MatFabButton,
  MatIconButton,
  MatMiniFabButton,
} from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import type {
  AtomicSize,
  ButtonAtomProps,
  ButtonKind,
  ButtonShape,
  ButtonType,
  ButtonVariant,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';

/**
 * Internal directive that applies the attributes, state and click handling
 * shared by every Material button flavour rendered by `magic-button`
 * (`matButton`, `matIconButton`, `matFab`, `matMiniFab`). It keeps the
 * template free of copy-pasted attribute lists. Declared in this file because
 * it and the component reference each other.
 */
@Directive({
  selector: 'button[magicButtonBinding]',
  host: {
    '[attr.id]': 'host.id() || null',
    '[attr.data-testid]': 'host.testId() || null',
    '[attr.aria-label]': 'host.resolvedAriaLabel()',
    '[attr.aria-busy]': 'host.loading() || null',
    '[attr.type]': 'host.type()',
    '(click)': 'host.handleClick($event)',
  },
})
export class MagicButtonBindingDirective {
  protected readonly host = inject(MagicButtonComponent);
}

/**
 * Wraps Angular Material's button family behind one design-system API.
 *
 * Content is projected: `<magic-button>Save</magic-button>`. The `label`
 * input is a fallback so `<magic-button label="Save" />` also works.
 *
 * - `kind` switches between a regular, icon, FAB, mini FAB or extended FAB button.
 * - `variant` maps to Material's `matButton` appearance.
 * - `color`, `size` and `shape` are applied through theme tokens, not inline styles.
 */
@Component({
  selector: 'magic-button',
  imports: [
    NgTemplateOutlet,
    MatButton,
    MatIconButton,
    MatFabButton,
    MatMiniFabButton,
    MatIcon,
    MatProgressSpinner,
    MagicButtonBindingDirective,
  ],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicButtonComponent implements SignalProps<ButtonAtomProps> {
  /** Id applied to the inner `<button>` (the host id is removed). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the inner `<button>`. */
  readonly testId = input<string>();
  /** Accessible name. Falls back to `label`, then the icon name for icon-only buttons. */
  readonly ariaLabel = input<string>();
  /** Text fallback used when no content is projected. */
  readonly label = input<string>('');
  /** Visual emphasis; maps to Material's `matButton` appearance. */
  readonly variant = input<ButtonVariant>('filled');
  /** Structural kind of button. */
  readonly kind = input<ButtonKind>('default');
  /** Corner shape. `default` keeps the theme shape. */
  readonly shape = input<ButtonShape>('default');
  /** Semantic color role. */
  readonly color = input<ColorIntent>('primary');
  /** Control size, from `xs` to `xl`. */
  readonly size = input<AtomicSize>('md');
  /** Disables the button. */
  readonly disabled = input(false);
  /** Keeps the button focusable and announced while disabled. */
  readonly disabledInteractive = input(false);
  /** Turns off the ripple effect. */
  readonly disableRipple = input(false);
  /** Shows a progress spinner and blocks clicks. */
  readonly loading = input(false);
  /** Text shown while `loading` is true. */
  readonly loadingLabel = input<string>();
  /** Stretches the button to the full width of its container. */
  readonly fullWidth = input(false);
  /** Icon (ligature name) shown before the label, or the glyph of an icon button. */
  readonly leadingIcon = input<string>();
  /** Icon (ligature name) shown after the label. */
  readonly trailingIcon = input<string>();
  /** Native button type. */
  readonly type = input<ButtonType>('button');

  /** Emits when the button is activated and not disabled or loading. */
  readonly clicked = output<MouseEvent>();

  protected readonly isIconOnly = computed(() =>
    ['icon', 'fab', 'mini-fab'].includes(this.kind()),
  );

  /** True when the button cannot be activated. */
  readonly isDisabled = computed(() => this.disabled() || this.loading());

  protected readonly spinnerDiameter = computed(() =>
    this.kind() === 'fab' ? 24 : 18,
  );

  readonly resolvedAriaLabel = computed(
    () =>
      this.ariaLabel() ||
      this.label() ||
      (this.isIconOnly() ? this.leadingIcon() : undefined) ||
      null,
  );

  protected readonly hostClasses = computed(() =>
    [
      `magic-size-${this.size()}`,
      `magic-color-${this.color()}`,
      this.shape() !== 'default' ? `magic-shape-${this.shape()}` : '',
      this.fullWidth() ? 'magic-button--full-width' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  /** @internal Called by the binding directive on native click. */
  handleClick(event: MouseEvent): void {
    if (this.isDisabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.clicked.emit(event);
  }
}
