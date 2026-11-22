import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import type {
  AlertSeverity,
  AlertVariant,
  AtomicSize,
} from '@mono-magic/atomic-design-interfaces';
import { MagicAlertComponent } from './alert.component';

describe('MagicAlertComponent', () => {
  let fixture: ComponentFixture<MagicAlertComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const surface = (): HTMLElement =>
    host().querySelector('.magic-alert__surface') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicAlertComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicAlertComponent);
    setInputs({ message: 'Heads up: synchronization scheduled.' });
  });

  describe('rendering, severities, variants & sizes', () => {
    it('renders role="alert", cleans host id, and forwards id/testId/ariaLabel/title/message', () => {
      setInputs({
        id: 'sync-alert',
        testId: 'sync',
        ariaLabel: 'Sync notice',
        title: 'Scheduled maintenance',
        message: 'Database read-only from 02:00 UTC.',
      });

      expect(host().getAttribute('id')).toBeNull();
      expect(surface().getAttribute('id')).toBe('sync-alert');
      expect(surface().getAttribute('data-testid')).toBe('sync');
      expect(surface().getAttribute('aria-label')).toBe('Sync notice');
      expect(surface().getAttribute('role')).toBe('alert');
      expect(host().querySelector('.magic-alert__title')?.textContent).toContain(
        'Scheduled maintenance',
      );
      expect(host().querySelector('.magic-alert__message')?.textContent).toContain(
        'Database read-only from 02:00 UTC.',
      );
    });

    it.each([
      ['info', 'info', 'magic-color-primary'],
      ['success', 'check_circle', 'magic-color-success'],
      ['warning', 'warning', 'magic-color-warning'],
      ['error', 'error', 'magic-color-error'],
    ] as const satisfies readonly [AlertSeverity, string, string][])(
      'maps severity=%s to default icon %s and color token %s',
      (severity, expectedIcon, expectedColorClass) => {
        setInputs({ severity });
        expect(host().classList).toContain(expectedColorClass);
        expect(host().querySelector('.magic-alert__icon')?.textContent?.trim()).toBe(
          expectedIcon,
        );
      },
    );

    it.each(['standard', 'filled', 'outlined'] as AlertVariant[])(
      'applies variant=%s surface class',
      (variant) => {
        setInputs({ variant });
        expect(surface().classList).toContain(`magic-alert__surface--${variant}`);
      },
    );

    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as AtomicSize[])(
      'applies magic-size-%s class',
      (size) => {
        setInputs({ size });
        expect(host().classList).toContain(`magic-size-${size}`);
      },
    );

    it('supports custom icon override and hideIcon=true', () => {
      setInputs({ icon: 'campaign' });
      expect(host().querySelector('.magic-alert__icon')?.textContent?.trim()).toBe(
        'campaign',
      );

      setInputs({ hideIcon: true });
      expect(host().querySelector('.magic-alert__icon')).toBeNull();
    });
  });

  describe('actions & dismissal', () => {
    it('renders action and dismiss buttons and emits actionClicked and dismissed', () => {
      const actionSpy = vi.fn();
      const dismissedSpy = vi.fn();
      fixture.componentInstance.actionClicked.subscribe(actionSpy);
      fixture.componentInstance.dismissed.subscribe(dismissedSpy);

      setInputs({
        testId: 'alert-ctrl',
        severity: 'warning',
        actionLabel: 'Retry',
        dismissible: true,
      });

      const actionBtn = host().querySelector(
        '[data-testid="alert-ctrl-action"]',
      ) as HTMLButtonElement;
      const dismissBtn = host().querySelector(
        '[data-testid="alert-ctrl-dismiss"]',
      ) as HTMLButtonElement;

      expect(actionBtn).toBeTruthy();
      expect(actionBtn.textContent).toContain('Retry');
      expect(dismissBtn).toBeTruthy();

      actionBtn.click();
      dismissBtn.click();
      expect(actionSpy).toHaveBeenCalledTimes(1);
      expect(dismissedSpy).toHaveBeenCalledTimes(1);
    });
  });
});
