import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import type {
  AlertSeverity,
  ToastPosition,
} from '@mono-magic/atomic-design-interfaces';
import { MagicToastComponent } from './toast.component';

describe('MagicToastComponent', () => {
  let fixture: ComponentFixture<MagicToastComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const surface = (): HTMLElement | null =>
    host().querySelector('.magic-toast__surface');

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [MagicToastComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicToastComponent);
    setInputs({ message: 'Saved draft.' });
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });

  describe('visibility, attributes, severities & positions', () => {
    it('does not render surface when open=false and renders when open=true with forwarded attrs', () => {
      expect(surface()).toBeNull();
      expect(host().getAttribute('id')).toBeNull();

      setInputs({
        open: true,
        id: 'save-toast',
        testId: 'toast-save',
        ariaLabel: 'Save notification',
        title: 'Saved',
        message: 'Changes synced to cloud.',
        duration: null,
      });

      const el = surface();
      expect(el).toBeTruthy();
      expect(host().getAttribute('id')).toBeNull();
      expect(el?.getAttribute('id')).toBe('save-toast');
      expect(el?.getAttribute('data-testid')).toBe('toast-save');
      expect(el?.getAttribute('aria-label')).toBe('Save notification');
      expect(el?.textContent).toContain('Saved');
      expect(el?.textContent).toContain('Changes synced to cloud.');
    });

    it.each([
      ['info', 'status', 'polite', 'info'],
      ['success', 'status', 'polite', 'check_circle'],
      ['warning', 'alert', 'assertive', 'warning'],
      ['error', 'alert', 'assertive', 'error'],
    ] as const satisfies readonly [
      AlertSeverity,
      string,
      string,
      string,
    ][])(
      'maps severity=%s to role=%s, aria-live=%s, icon=%s',
      (severity, role, ariaLive, icon) => {
        setInputs({ open: true, severity, duration: null });
        const el = surface();
        expect(el?.getAttribute('role')).toBe(role);
        expect(el?.getAttribute('aria-live')).toBe(ariaLive);
        expect(host().querySelector('.magic-toast__icon')?.textContent?.trim()).toBe(
          icon,
        );
      },
    );

    it.each([
      'top-left',
      'top-center',
      'top-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ] as ToastPosition[])('applies position=%s class', (position) => {
      setInputs({ open: true, position, duration: null });
      expect(host().classList).toContain(`magic-toast--${position}`);
      expect(surface()?.classList).toContain(`magic-toast__surface--${position}`);
    });
  });

  describe('auto-hide timer & interactive actions', () => {
    it('emits dismissed after duration expires and clears timer on destroy or manual dismiss', () => {
      const dismissedSpy = vi.fn();
      fixture.componentInstance.dismissed.subscribe(dismissedSpy);

      setInputs({ open: true, duration: 2500 });
      vi.advanceTimersByTime(2499);
      expect(dismissedSpy).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(dismissedSpy).toHaveBeenCalledTimes(1);

      // Re-open with null duration -> never auto-dismisses
      setInputs({ open: true, duration: null });
      vi.advanceTimersByTime(10000);
      expect(dismissedSpy).toHaveBeenCalledTimes(1);

      // Zero duration -> never auto-dismisses
      setInputs({ duration: 0 });
      vi.advanceTimersByTime(10000);
      expect(dismissedSpy).toHaveBeenCalledTimes(1);
    });

    it('clears pending auto-dismiss timer when destroyed before expiry', () => {
      const dismissedSpy = vi.fn();
      fixture.componentInstance.dismissed.subscribe(dismissedSpy);

      setInputs({ open: true, duration: 3000 });
      fixture.destroy();
      vi.advanceTimersByTime(5000);
      expect(dismissedSpy).not.toHaveBeenCalled();
    });

    it('emits actionClicked and dismissed on button clicks and hides dismiss button when dismissible=false', () => {
      const actionSpy = vi.fn();
      const dismissedSpy = vi.fn();
      fixture.componentInstance.actionClicked.subscribe(actionSpy);
      fixture.componentInstance.dismissed.subscribe(dismissedSpy);

      setInputs({
        open: true,
        testId: 'toast-ctrl',
        duration: 5000,
        actionLabel: 'Undo',
        dismissible: true,
      });

      const actionBtn = host().querySelector(
        '[data-testid="toast-ctrl-action"]',
      ) as HTMLButtonElement;
      const dismissBtn = host().querySelector(
        '[data-testid="toast-ctrl-dismiss"]',
      ) as HTMLButtonElement;

      actionBtn.click();
      expect(actionSpy).toHaveBeenCalledTimes(1);

      dismissBtn.click();
      expect(dismissedSpy).toHaveBeenCalledTimes(1);

      // Manual dismiss cleared pending timer
      vi.advanceTimersByTime(6000);
      expect(dismissedSpy).toHaveBeenCalledTimes(1);

      setInputs({ dismissible: false });
      expect(host().querySelector('[data-testid="toast-ctrl-dismiss"]')).toBeNull();
    });
  });
});
