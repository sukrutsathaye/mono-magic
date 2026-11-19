import {
  ChangeDetectionStrategy,
  Component,
  input,
  viewChild,
} from '@angular/core';
import {
  MatTooltip,
  type TooltipPosition,
  type TooltipTouchGestures,
} from '@angular/material/tooltip';
import type {
  ToolTipAtomProps,
  ToolTipPosition,
  ToolTipTouchGestures,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';

/**
 * Wraps Angular Material's `matTooltip` directive as an atomic container
 * around projected trigger content (`<magic-tool-tip message="..."><magic-button ... /></magic-tool-tip>`)
 * with `label` text fallback and programmatic `show()` / `hide()` / `toggle()`.
 *
 * @see https://material.angular.dev/components/tooltip/overview
 */
@Component({
  selector: 'magic-tool-tip',
  imports: [MatTooltip],
  templateUrl: './tool-tip.component.html',
  styleUrl: './tool-tip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
  },
})
export class MagicToolTipComponent implements SignalProps<ToolTipAtomProps> {
  private readonly tooltip = viewChild.required(MatTooltip);

  /** Id applied to the inner trigger wrapper (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the trigger wrapper. */
  readonly testId = input<string>();
  /** Accessible label on the trigger wrapper. */
  readonly ariaLabel = input<string>();
  /** Tooltip message text. */
  readonly message = input<string>('');
  /** Fallback trigger text when no content is projected. */
  readonly label = input<string>('');
  /** Placement relative to the trigger element. */
  readonly position = input<ToolTipPosition & TooltipPosition>('below');
  /** Delay in ms before showing the tooltip. */
  readonly showDelay = input<number>(0);
  /** Delay in ms before hiding the tooltip. */
  readonly hideDelay = input<number>(0);
  /** Disables the tooltip popup. */
  readonly disabled = input(false);
  /** Touch gesture handling mode. */
  readonly touchGestures = input<ToolTipTouchGestures & TooltipTouchGestures>(
    'auto',
  );

  /** Programmatically opens the tooltip. */
  show(delay?: number): void {
    this.tooltip().show(delay);
  }

  /** Programmatically hides the tooltip. */
  hide(delay?: number): void {
    this.tooltip().hide(delay);
  }

  /** Programmatically toggles tooltip visibility. */
  toggle(): void {
    this.tooltip().toggle();
  }
}
