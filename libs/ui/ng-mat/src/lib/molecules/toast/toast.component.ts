import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import type {
  AlertSeverity,
  ToastMoleculeProps,
  ToastPosition,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButtonComponent } from '../../atoms/button/button.component';
import type { SignalProps } from '../../core/signal-props';

export type { ToastPosition };

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
 * A Material 3 transient notification toast molecule supporting controlled
 * `open` visibility, semantic severity styling, configurable auto-dismiss
 * `duration` (`0` or `null` disables auto-hide), six viewport anchor
 * positions, action button, dismiss control, and ARIA live-region semantics
 * (`role="alert"` for `error`/`warning`, `role="status"` for `info`/`success`).
 *
 * @see https://m3.material.io/components/snackbar/overview
 */
@Component({
  selector: 'magic-toast',
  imports: [MatIcon, MagicButtonComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicToastComponent implements SignalProps<ToastMoleculeProps> {
  private readonly destroyRef = inject(DestroyRef);

  /** Id applied to the inner toast surface (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the inner toast surface. */
  readonly testId = input<string>();
  /** Accessible name applied to the live region (`aria-label`). */
  readonly ariaLabel = input<string>();
  /** Controls whether the toast notification is visible. */
  readonly open = input<boolean>(false);
  /** Semantic severity level (`info`, `success`, `warning`, `error`). */
  readonly severity = input<AlertSeverity>('info');
  /** Optional bold heading rendered above `message`. */
  readonly title = input<string>();
  /** Primary notification message text. */
  readonly message = input.required<string>();
  /** Auto-dismiss timeout in ms; `0` or `null` keeps the toast open until dismissed. */
  readonly duration = input<number | null>(4000);
  /** Viewport anchor position (`top-left` .. `bottom-right`). */
  readonly position = input<ToastPosition>('bottom-right');
  /** Whether a manual close icon button is rendered. */
  readonly dismissible = input<boolean>(true);
  /** Optional label for an inline action button (e.g. `Undo`). */
  readonly actionLabel = input<string>();

  /** Emits when the toast auto-dismisses or the user clicks close. */
  readonly dismissed = output<void>();
  /** Emits when the user activates the inline action button. */
  readonly actionClicked = output<void>();

  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly resolvedIcon = computed(
    () => DEFAULT_ICON_BY_SEVERITY[this.severity()],
  );
  protected readonly liveRole = computed<'alert' | 'status'>(() =>
    this.severity() === 'error' || this.severity() === 'warning'
      ? 'alert'
      : 'status',
  );
  protected readonly ariaLive = computed<'assertive' | 'polite'>(() =>
    this.liveRole() === 'alert' ? 'assertive' : 'polite',
  );
  protected readonly hostClasses = computed(() =>
    [
      'magic-toast',
      COLOR_CLASS_BY_SEVERITY[this.severity()],
      `magic-toast--${this.position()}`,
      `magic-toast--${this.severity()}`,
    ].join(' '),
  );

  constructor() {
    effect(() => {
      this.clearTimer();
      const isOpen = this.open();
      const timeoutMs = this.duration();
      if (isOpen && timeoutMs !== null && timeoutMs > 0) {
        this.dismissTimer = setTimeout(() => {
          this.dismissTimer = null;
          this.dismissed.emit();
        }, timeoutMs);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.clearTimer();
    });
  }

  protected onDismiss(): void {
    this.clearTimer();
    this.dismissed.emit();
  }

  private clearTimer(): void {
    if (this.dismissTimer !== null) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
  }
}
