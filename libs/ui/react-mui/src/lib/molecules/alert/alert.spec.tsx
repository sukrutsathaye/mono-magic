import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicAlert } from './alert';

afterEach(cleanup);

describe('MagicAlert (React MUI)', () => {
  it('renders alert with role="alert", title, message, and forwards ref', () => {
    const alertRef = createRef<HTMLDivElement>();
    render(
      <MagicMuiThemeProvider>
        <MagicAlert
          ref={alertRef}
          id="sync-alert"
          testId="sync-alert"
          ariaLabel="Sync status alert"
          title="Sync Complete"
          message="All local tokens match the remote workspace."
        />
      </MagicMuiThemeProvider>,
    );

    expect(alertRef.current).toBeInstanceOf(HTMLDivElement);
    const alert = screen.getByRole('alert');
    expect(alert.getAttribute('id')).toBe('sync-alert');
    expect(alert.getAttribute('aria-label')).toBe('Sync status alert');
    expect(screen.getByTestId('sync-alert-title').textContent).toBe(
      'Sync Complete',
    );
    expect(screen.getByTestId('sync-alert-message').textContent).toBe(
      'All local tokens match the remote workspace.',
    );
  });

  it('supports all severities (info, success, warning, error) and variants (standard, filled, outlined)', () => {
    const severities = ['info', 'success', 'warning', 'error'] as const;
    const variants = ['standard', 'filled', 'outlined'] as const;

    for (const severity of severities) {
      for (const variant of variants) {
        const { unmount } = render(
          <MagicMuiThemeProvider>
            <MagicAlert
              testId={`alert-${severity}-${variant}`}
              severity={severity}
              variant={variant}
              message={`${severity} ${variant}`}
            />
          </MagicMuiThemeProvider>,
        );

        const root = screen.getByTestId(`alert-${severity}-${variant}`);
        expect(root.getAttribute('data-severity')).toBe(severity);
        expect(root.getAttribute('data-variant')).toBe(variant);
        unmount();
      }
    }
  });

  it('supports all 5 sizes (xs..xl), custom icon, iconSlot, and hideIcon', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(
        <MagicMuiThemeProvider>
          <MagicAlert
            testId={`alert-size-${size}`}
            size={size}
            icon="notifications"
            message={`Size ${size}`}
          />
        </MagicMuiThemeProvider>,
      );

      expect(
        screen.getByTestId(`alert-size-${size}`).getAttribute('data-size'),
      ).toBe(size);
      expect(screen.getByText('notifications')).toBeTruthy();
      unmount();
    }

    const { rerender } = render(
      <MagicMuiThemeProvider>
        <MagicAlert
          testId="icon-alert"
          iconSlot={<span data-testid="custom-icon">!</span>}
          message="Custom icon slot"
        />
      </MagicMuiThemeProvider>,
    );
    expect(screen.getByTestId('custom-icon')).toBeTruthy();

    rerender(
      <MagicMuiThemeProvider>
        <MagicAlert
          testId="icon-alert"
          hideIcon
          message="No icon"
        />
      </MagicMuiThemeProvider>,
    );
    expect(
      screen.getByTestId('icon-alert').querySelector('.MuiAlert-icon'),
    ).toBeNull();
  });

  it('invokes onAction and onDismiss callbacks and renders projected children', () => {
    const onAction = vi.fn();
    const onDismiss = vi.fn();
    render(
      <MagicMuiThemeProvider>
        <MagicAlert
          testId="interactive-alert"
          severity="warning"
          message="Quota at 90%"
          actionLabel="Upgrade"
          dismissible
          dismissAriaLabel="Close warning"
          onAction={onAction}
          onDismiss={onDismiss}
          sx={[{ mb: 2 }]}
        >
          <span data-testid="alert-extra">Additional context</span>
        </MagicAlert>
      </MagicMuiThemeProvider>,
    );

    fireEvent.click(screen.getByTestId('interactive-alert-action'));
    expect(onAction).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Close warning' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('alert-extra').textContent).toBe(
      'Additional context',
    );
  });

  it('supports single sx object and minimal message-only configuration', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicAlert
          message="Simple notice"
          sx={{ mt: 1 }}
        />
      </MagicMuiThemeProvider>,
    );

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Simple notice')).toBeTruthy();
  });
});
