import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import type {
  DialogActionItem,
  DialogSize,
} from '@mono-magic/atomic-design-interfaces';
import {
  MagicDialogActionsDirective,
  MagicDialogComponent,
  MagicDialogHeaderDirective,
} from './dialog.component';

const SAMPLE_ACTIONS: readonly DialogActionItem[] = [
  { id: 'cancel', label: 'Cancel', variant: 'text', color: 'neutral' },
  {
    id: 'confirm',
    label: 'Confirm',
    variant: 'filled',
    color: 'primary',
    icon: 'check',
  },
  { id: 'locked', label: 'Locked', disabled: true },
];

@Component({
  imports: [
    MagicDialogComponent,
    MagicDialogHeaderDirective,
    MagicDialogActionsDirective,
  ],
  template: `
    <magic-dialog
      [open]="open()"
      [testId]="'projected-dialog'"
      [showCloseButton]="false"
    >
      <div magicDialogHeader class="custom-dialog-header">Custom Slot Header</div>
      <p class="custom-dialog-body">Projected body paragraph</p>
      <div magicDialogActions class="custom-dialog-actions">
        <button type="button" class="custom-action-btn">Done</button>
      </div>
    </magic-dialog>
  `,
})
class ProjectedDialogHostComponent {
  readonly open = signal(true);
}

describe('MagicDialogComponent', () => {
  let fixture: ComponentFixture<MagicDialogComponent>;
  let overlayContainer: OverlayContainer;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const overlayEl = (): HTMLElement => overlayContainer.getContainerElement();
  const dialogSurface = (): HTMLElement | null =>
    overlayEl().querySelector('.magic-dialog__surface');
  const backdrop = (): HTMLElement | null =>
    overlayEl().querySelector('.cdk-overlay-backdrop');
  const flushDialog = async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicDialogComponent],
    }).compileComponents();
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture = TestBed.createComponent(MagicDialogComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    overlayContainer.ngOnDestroy();
  });

  describe('opening, closing, attributes & sizes', () => {
    it('stays closed when open=false and opens overlay dialog when open=true', async () => {
      expect(dialogSurface()).toBeNull();
      expect(fixture.nativeElement.getAttribute('id')).toBeNull();

      setInputs({
        open: true,
        id: 'confirm-dialog',
        testId: 'confirm',
        ariaLabel: 'Confirm delete',
        title: 'Delete item?',
        subtitle: 'This action cannot be undone.',
        content: 'All attached drafts will be permanently removed.',
        scrollable: true,
      });

      const surface = dialogSurface();
      expect(surface).toBeTruthy();
      expect(fixture.nativeElement.getAttribute('id')).toBeNull();
      expect(surface?.getAttribute('id')).toBe('confirm-dialog');
      expect(surface?.getAttribute('data-testid')).toBe('confirm');
      expect(surface?.getAttribute('aria-label')).toBe('Confirm delete');
      expect(surface?.classList).toContain('magic-dialog__surface--scrollable');
      expect(surface?.textContent).toContain('Delete item?');
      expect(surface?.textContent).toContain('This action cannot be undone.');
      expect(surface?.textContent).toContain(
        'All attached drafts will be permanently removed.',
      );

      setInputs({ open: false });
      await flushDialog();
      expect(dialogSurface()).toBeNull();
    });

    it.each(['sm', 'md', 'lg', 'fullscreen'] as DialogSize[])(
      'applies size=%s panel class and dimensions',
      (size) => {
        setInputs({ open: true, size, title: `Dialog ${size}` });
        const pane = overlayEl().querySelector(`.magic-dialog-panel--${size}`);
        expect(pane).toBeTruthy();

        if (size === 'fullscreen') {
          expect(dialogSurface()?.classList).toContain(
            'magic-dialog__surface--fullscreen',
          );
        } else {
          expect(dialogSurface()?.classList).not.toContain(
            'magic-dialog__surface--fullscreen',
          );
        }
      },
    );

    it('updates dialog size cleanly when size changes while open and toggles back from fullscreen', () => {
      setInputs({ open: true, size: 'sm', title: 'Resizable' });
      expect(dialogSurface()).toBeTruthy();

      setInputs({ size: 'fullscreen' });
      expect(dialogSurface()?.classList).toContain(
        'magic-dialog__surface--fullscreen',
      );

      setInputs({ size: 'lg' });
      expect(dialogSurface()?.classList).not.toContain(
        'magic-dialog__surface--fullscreen',
      );
    });

    it('renders without header when title, subtitle, and close button are omitted', () => {
      setInputs({
        open: true,
        showCloseButton: false,
        content: 'Headerless dialog body.',
      });

      expect(overlayEl().querySelector('.magic-dialog__header')).toBeNull();
      expect(dialogSurface()?.textContent).toContain('Headerless dialog body.');
    });

    it('emits closed on requestClose when already closed and ignores non-Escape keys', () => {
      const closedSpy = vi.fn();
      fixture.componentInstance.closed.subscribe(closedSpy);

      fixture.componentInstance.requestClose();
      expect(closedSpy).toHaveBeenCalledTimes(1);

      setInputs({ open: true, title: 'Key test' });
      const pane = overlayEl().querySelector('.cdk-overlay-pane') as HTMLElement;
      pane.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      fixture.detectChanges();
      expect(closedSpy).toHaveBeenCalledTimes(1);
      expect(dialogSurface()).toBeTruthy();
    });
  });

  describe('dismissal policies, actions & events', () => {
    it('emits closed on header close button click, backdrop click, and Escape when dismissible', async () => {
      const closedSpy = vi.fn();
      fixture.componentInstance.closed.subscribe(closedSpy);

      setInputs({
        open: true,
        testId: 'dismiss-dlg',
        title: 'Closable',
      });

      const closeBtn = overlayEl().querySelector(
        '[data-testid="dismiss-dlg-close"]',
      ) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await flushDialog();
      expect(closedSpy).toHaveBeenCalledTimes(1);

      setInputs({ open: false });
      await flushDialog();
      setInputs({ open: true });
      backdrop()?.click();
      await flushDialog();
      expect(closedSpy).toHaveBeenCalledTimes(2);

      setInputs({ open: false });
      await flushDialog();
      setInputs({ open: true });
      const pane = overlayEl().querySelector('.cdk-overlay-pane') as HTMLElement;
      pane.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      await flushDialog();
      expect(closedSpy).toHaveBeenCalledTimes(3);
    });

    it('respects dismissible=false, closeOnBackdropClick=false, and closeOnEscape=false', () => {
      const closedSpy = vi.fn();
      fixture.componentInstance.closed.subscribe(closedSpy);

      setInputs({
        open: true,
        testId: 'locked-dlg',
        title: 'Required',
        dismissible: false,
      });

      expect(
        overlayEl().querySelector('[data-testid="locked-dlg-close"]'),
      ).toBeNull();

      backdrop()?.click();
      fixture.detectChanges();
      const pane = overlayEl().querySelector('.cdk-overlay-pane') as HTMLElement;
      pane.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      fixture.componentInstance.requestClose();
      fixture.detectChanges();
      expect(closedSpy).not.toHaveBeenCalled();
      expect(dialogSurface()).toBeTruthy();

      setInputs({
        dismissible: true,
        closeOnBackdropClick: false,
        closeOnEscape: false,
      });
      backdrop()?.click();
      pane.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      fixture.detectChanges();
      expect(closedSpy).not.toHaveBeenCalled();
      expect(dialogSurface()).toBeTruthy();
    });

    it('renders footer actions, aligns actions, and emits actionClicked for enabled actions only', () => {
      const actionSpy = vi.fn();
      fixture.componentInstance.actionClicked.subscribe(actionSpy);

      setInputs({
        open: true,
        testId: 'action-dlg',
        title: 'Actions',
        actions: SAMPLE_ACTIONS,
        alignActions: 'start',
      });

      const actionsWrap = overlayEl().querySelector(
        '.magic-dialog__actions',
      ) as HTMLElement;
      expect(actionsWrap).toBeTruthy();
      expect(actionsWrap.classList).toContain('mat-mdc-dialog-actions-align-start');

      const confirmBtn = overlayEl().querySelector(
        '[data-testid="action-dlg-action-confirm"]',
      ) as HTMLButtonElement;
      const lockedBtn = overlayEl().querySelector(
        '[data-testid="action-dlg-action-locked"]',
      ) as HTMLButtonElement;

      expect(lockedBtn.disabled).toBe(true);
      confirmBtn.click();
      lockedBtn.click();
      expect(actionSpy).toHaveBeenCalledTimes(1);
      expect(actionSpy).toHaveBeenCalledWith(SAMPLE_ACTIONS[1]);
    });
  });

  describe('content projection slots & cleanup', () => {
    it('projects [magicDialogHeader], default body, and [magicDialogActions]', async () => {
      const hostFixture = TestBed.createComponent(ProjectedDialogHostComponent);
      hostFixture.detectChanges();

      expect(
        overlayEl().querySelector('.custom-dialog-header')?.textContent,
      ).toContain('Custom Slot Header');
      expect(
        overlayEl().querySelector('.custom-dialog-body')?.textContent,
      ).toContain('Projected body paragraph');
      expect(
        overlayEl().querySelector('.custom-dialog-actions .custom-action-btn')
          ?.textContent,
      ).toContain('Done');

      hostFixture.destroy();
      await flushDialog();
      expect(dialogSurface()).toBeNull();
    });
  });
});
