import { A11yModule, CdkTrapFocus } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  DOCUMENT,
  TemplateRef,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import {
  MatDialog,
  MatDialogActions,
  MatDialogContent,
  type MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import type {
  DialogActionItem,
  DialogMoleculeProps,
  DialogSize,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButtonComponent } from '../../atoms/button/button.component';
import type { SignalProps } from '../../core/signal-props';

export type { DialogActionItem, DialogSize };

/** Projects custom header content into `<magic-dialog>`. */
@Directive({
  selector: '[magicDialogHeader]',
})
export class MagicDialogHeaderDirective {}

/** Projects custom action buttons into `<magic-dialog>`'s footer actions container. */
@Directive({
  selector: '[magicDialogActions]',
})
export class MagicDialogActionsDirective {}

const DIALOG_WIDTH_BY_SIZE: Record<DialogSize, string> = {
  sm: '360px',
  md: '520px',
  lg: '760px',
  fullscreen: '100vw',
};

/**
 * A Material 3 modal dialog molecule backed by `MatDialog` and a projected
 * `TemplateRef`, supporting `open` state synchronization, responsive size
 * presets (`sm`, `md`, `lg`, `fullscreen`), backdrop/Escape dismissal policies,
 * action buttons via `magic-button`, and `[magicDialogHeader]` / `[magicDialogActions]`
 * content projection slots.
 *
 * @see https://material.angular.dev/components/dialog/overview
 */
@Component({
  selector: 'magic-dialog',
  imports: [
    A11yModule,
    CdkTrapFocus,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MagicButtonComponent,
  ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicDialogComponent implements SignalProps<DialogMoleculeProps> {
  private readonly matDialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  /** Id applied to the inner dialog surface (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the dialog surface (`-close` on header close button). */
  readonly testId = input<string>();
  /** Accessible name applied to the dialog panel (`aria-label`). */
  readonly ariaLabel = input<string>();
  /** Controls whether the modal dialog overlay is open. */
  readonly open = input<boolean>(false);
  /** Primary heading displayed in the dialog header. */
  readonly title = input<string>();
  /** Secondary subtitle displayed beneath `title`. */
  readonly subtitle = input<string>();
  /** Body paragraph rendered when no custom projected content is needed. */
  readonly content = input<string>();
  /** Responsive dialog container size preset (`sm`, `md`, `lg`, `fullscreen`). */
  readonly size = input<DialogSize>('md');
  /** Whether the dialog can be dismissed by user interaction. */
  readonly dismissible = input<boolean>(true);
  /** Whether clicking the backdrop closes a dismissible dialog. */
  readonly closeOnBackdropClick = input<boolean>(true);
  /** Whether pressing Escape closes a dismissible dialog. */
  readonly closeOnEscape = input<boolean>(true);
  /** Whether to render a close icon button in the dialog header. */
  readonly showCloseButton = input<boolean>(true);
  /** Whether long body content scrolls independently inside the dialog. */
  readonly scrollable = input<boolean>(false);
  /** Action buttons rendered in the dialog footer. */
  readonly actions = input<readonly DialogActionItem[]>([]);
  /** Horizontal alignment of the footer action buttons (`'start'` or `'end'`). */
  readonly alignActions = input<'start' | 'end'>('end');

  /** Emits when the dialog is dismissed or closed. */
  readonly closed = output<void>();
  /** Emits the clicked `DialogActionItem` when an enabled footer action button is activated. */
  readonly actionClicked = output<DialogActionItem>();

  private readonly dialogTemplate = viewChild<TemplateRef<unknown>>('dialogTemplate');
  private readonly projectedHeaders = contentChildren(MagicDialogHeaderDirective, {
    descendants: true,
  });
  private readonly projectedActions = contentChildren(MagicDialogActionsDirective, {
    descendants: true,
  });

  private dialogRef: MatDialogRef<unknown> | null = null;
  private isClosingProgrammatically = false;
  private isDestroyed = false;

  protected readonly hasCustomHeader = computed(
    () => this.projectedHeaders().length > 0,
  );
  protected readonly hasCustomActions = computed(
    () => this.projectedActions().length > 0,
  );
  protected readonly showHeader = computed(
    () =>
      this.hasCustomHeader() ||
      Boolean(this.title() || this.subtitle()) ||
      (this.dismissible() && this.showCloseButton()),
  );
  protected readonly showFooter = computed(
    () => this.hasCustomActions() || this.actions().length > 0,
  );
  protected readonly hostClasses = computed(
    () => `magic-dialog magic-dialog--${this.size()}`,
  );

  constructor() {
    effect(() => {
      const shouldOpen = this.open();
      const template = this.dialogTemplate();
      if (!template) {
        return;
      }
      if (shouldOpen) {
        this.openOrUpdateDialog(template);
      } else {
        this.closeDialogSilently();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.isDestroyed = true;
      this.closeDialogSilently();
    });
  }

  /** Programmatically requests closing the dialog and emits `closed`. */
  requestClose(): void {
    if (!this.dismissible()) {
      return;
    }
    this.closeActiveDialog(true);
  }

  protected onActionClick(action: DialogActionItem): void {
    if (!action.disabled) {
      this.actionClicked.emit(action);
    }
  }

  private openOrUpdateDialog(template: TemplateRef<unknown>): void {
    const size = this.size();
    const isFullscreen = size === 'fullscreen';
    const width = DIALOG_WIDTH_BY_SIZE[size];
    const panelClasses = [
      'magic-dialog-panel',
      `magic-dialog-panel--${size}`,
    ];

    if (this.dialogRef) {
      this.dialogRef.disableClose = true;
      this.dialogRef.updateSize(width, isFullscreen ? '100vh' : undefined);
      return;
    }

    const ref = this.matDialog.open(template, {
      id: this.id() || undefined,
      ariaLabel: this.ariaLabel() || this.title() || 'Dialog',
      panelClass: panelClasses,
      hasBackdrop: true,
      disableClose: true,
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      enterAnimationDuration: 0,
      exitAnimationDuration: 0,
      width,
      maxWidth: isFullscreen ? '100vw' : 'calc(100vw - 32px)',
      height: isFullscreen ? '100vh' : undefined,
      maxHeight: isFullscreen ? '100vh' : 'calc(100vh - 32px)',
    });

    this.dialogRef = ref;

    const backdropSub = ref.backdropClick().subscribe(() => {
      if (this.dismissible() && this.closeOnBackdropClick()) {
        this.closeActiveDialog(true);
      }
    });

    const keydownSub = ref.keydownEvents().subscribe((event) => {
      if (
        event.key === 'Escape' &&
        this.dismissible() &&
        this.closeOnEscape()
      ) {
        event.preventDefault();
        this.closeActiveDialog(true);
      }
    });

    const afterClosedSub = ref.afterClosed().subscribe(() => {
      backdropSub.unsubscribe();
      keydownSub.unsubscribe();
      afterClosedSub.unsubscribe();
      const wasProgrammatic = this.isClosingProgrammatically;
      this.isClosingProgrammatically = false;
      if (this.dialogRef === ref) {
        this.dialogRef = null;
      }
      if (!wasProgrammatic && !this.isDestroyed) {
        this.closed.emit();
      }
    });
  }

  private closeDialogSilently(): void {
    if (this.dialogRef) {
      this.isClosingProgrammatically = true;
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  private closeActiveDialog(emitClosed: boolean): void {
    const ref = this.dialogRef;
    if (!ref) {
      if (emitClosed && !this.isDestroyed) {
        this.closed.emit();
      }
      return;
    }
    this.isClosingProgrammatically = !emitClosed;
    ref.close();
    if (this.dialogRef === ref) {
      this.dialogRef = null;
    }
    if (this.document.activeElement instanceof HTMLElement) {
      // MatDialog restores focus automatically when restoreFocus is true.
      void 0;
    }
  }
}
