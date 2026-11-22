import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import type {
  AlertMoleculeProps,
  AlertSeverity,
  AlertVariant,
  AtomicSize,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButtonComponent } from '../../atoms/button/button.component';
import type { SignalProps } from '../../core/signal-props';

export type { AlertSeverity, AlertVariant };

const DEFAULT_ICON_BY_SEVERITY: Record<AlertSeverity, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
};

const COLOR_CLASS_BY_SEVERITY: Record<AlertSeverity, string> = {
  info: 'magic-color-primary',
  success: 'magic-color-success',
  warning: 'magic-color-warning',
  error: 'magic-color-error',
};

/**
 * A Material 3 status banner molecule displaying semantic feedback (`info`,
 * `success`, `warning`, `error`) across `standard`, `filled`, and `outlined`
 * variants, with optional title, custom icon, action button, and dismiss button.
 *
 * @see https://m3.material.io/styles/color/roles
 */
@Component({
  selector: 'magic-alert',
  imports: [MatIcon, MagicButtonComponent],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicAlertComponent implements SignalProps<AlertMoleculeProps> {
  /** Id applied to the inner alert surface (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the inner alert surface. */
  readonly testId = input<string>();
  /** Accessible name applied to the alert region (`aria-label`). */
  readonly ariaLabel = input<string>();
  /** Semantic severity controlling icon and color intent (`info`, `success`, `warning`, `error`). */
  readonly severity = input<AlertSeverity>('info');
  /** Visual emphasis style (`standard`, `filled`, or `outlined`). */
  readonly variant = input<AlertVariant>('standard');
  /** Optional bold heading rendered above `message`. */
  readonly title = input<string>();
  /** Primary alert body message. */
  readonly message = input.required<string>();
  /** Optional Material icon string overriding the default severity icon. */
  readonly icon = input<string>();
  /** Suppresses rendering the leading severity icon when `true`. */
  readonly hideIcon = input<boolean>(false);
  /** Renders a dismiss icon button in the trailing slot when `true`. */
  readonly dismissible = input<boolean>(false);
  /** Optional label for an inline action button. */
  readonly actionLabel = input<string>();
  /** Standardized density/size token (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');

  /** Emits when the user clicks the dismiss button. */
  readonly dismissed = output<void>();
  /** Emits when the user clicks the inline action button. */
  readonly actionClicked = output<void>();

  protected readonly resolvedIcon = computed(
    () => this.icon() || DEFAULT_ICON_BY_SEVERITY[this.severity()],
  );

  protected readonly hostClasses = computed(() =>
    [
      'magic-alert',
      `magic-size-${this.size()}`,
      COLOR_CLASS_BY_SEVERITY[this.severity()],
      `magic-alert--${this.severity()}`,
      `magic-alert--${this.variant()}`,
    ].join(' '),
  );
}
