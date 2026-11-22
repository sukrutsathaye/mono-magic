import { createRef } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicToast } from './toast';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('MagicToast (React MUI)', () => {
  it('renders open toast with title, message, polite live region, and forwards ref', () => {
    const toastRef = createRef<HTMLDivElement>();
    render(
      <MagicMuiThemeProvider>
        <MagicToast
          ref={toastRef}
          id="save-toast"
          testId="save-toast"
          open
          severity="success"
          title="Saved"
          message="Your profile changes were stored."
          duration={null}
        />
      </MagicMuiThemeProvider>,
    );

    expect(toastRef.current).toBeInstanceOf(HTMLDivElement);
    const toast = screen.getByTestId('save-toast');
    expect(toast.getAttribute('role')).toBe('status');
    expect(toast.getAttribute('aria-live')).toBe('polite');
    expect(toast.getAttribute('data-position')).toBe('bottom-right');
    expect(screen.getByText('Saved')).toBeTruthy();
    expect(screen.getByText('Your profile changes were stored.')).toBeTruthy();
  });

  it('uses assertive alert semantics for error/warning severities and hides when closed', async () => {
    const { rerender } = render(
      <MagicMuiThemeProvider>
        <MagicToast
          testId="err-toast"
          open
          severity="error"
          message="Connection lost"
          duration={null}
        />
      </MagicMuiThemeProvider>,
    );

    const toast = screen.getByTestId('err-toast');
    expect(toast.getAttribute('role')).toBe('alert');
    expect(toast.getAttribute('aria-live')).toBe('assertive');

    rerender(
      <MagicMuiThemeProvider>
        <MagicToast
          testId="err-toast"
          open={false}
          severity="error"
          message="Connection lost"
          duration={null}
        />
      </MagicMuiThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('err-toast')).toBeNull();
    });
  });

  it('supports all 6 ToastPosition presets and inline preview mode', () => {
    const positions = [
      'top-left',
      'top-center',
      'top-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ] as const;

    for (const position of positions) {
      const { unmount } = render(
        <MagicMuiThemeProvider>
          <MagicToast
            testId={`toast-${position}`}
            open
            position={position}
            message={`Toast ${position}`}
            duration={null}
          />
        </MagicMuiThemeProvider>,
      );

      expect(
        screen.getByTestId(`toast-${position}`).getAttribute('data-position'),
      ).toBe(position);
      unmount();
    }

    const { rerender } = render(
      <MagicMuiThemeProvider>
        <MagicToast
          testId="inline-toast"
          inline
          open
          message="Inline preview"
          duration={null}
        />
      </MagicMuiThemeProvider>,
    );
    expect(screen.getByTestId('inline-toast')).toBeTruthy();

    rerender(
      <MagicMuiThemeProvider>
        <MagicToast
          testId="inline-toast"
          inline
          open={false}
          message="Inline preview"
          duration={null}
        />
      </MagicMuiThemeProvider>,
    );
    expect(screen.queryByTestId('inline-toast')).toBeNull();
  });

  it('auto-dismisses after duration and clears timer cleanly on unmount or when duration is 0/null', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    const { unmount } = render(
      <MagicMuiThemeProvider>
        <MagicToast
          testId="timed-toast"
          open
          message="Auto hiding"
          duration={1500}
          onClose={onClose}
        />
      </MagicMuiThemeProvider>,
    );

    vi.advanceTimersByTime(1400);
    expect(onClose).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(onClose).toHaveBeenCalledWith('timeout');

    onClose.mockClear();
    const unmountEarly = render(
      <MagicMuiThemeProvider>
        <MagicToast
          testId="unmount-toast"
          open
          message="Unmounted before timer"
          duration={2000}
          onClose={onClose}
        />
      </MagicMuiThemeProvider>,
    );
    unmountEarly.unmount();
    vi.advanceTimersByTime(3000);
    expect(onClose).not.toHaveBeenCalled();

    render(
      <MagicMuiThemeProvider>
        <MagicToast
          testId="persistent-toast"
          open
          message="Persistent"
          duration={0}
          onClose={onClose}
        />
      </MagicMuiThemeProvider>,
    );
    vi.advanceTimersByTime(5000);
    expect(onClose).not.toHaveBeenCalled();

    unmount();
  });

  it('invokes onAction and onClose("dismiss") on button clicks and supports sx arrays/objects', () => {
    const onAction = vi.fn();
    const onClose = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicToast
          testId="action-toast"
          open
          severity="warning"
          message="Item archived"
          actionLabel="Undo"
          dismissible
          duration={null}
          onAction={onAction}
          onClose={onClose}
          sx={[{ m: 1 }]}
        />
      </MagicMuiThemeProvider>,
    );

    fireEvent.click(screen.getByTestId('action-toast-alert-action'));
    expect(onAction).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('action-toast-alert-dismiss'));
    expect(onClose).toHaveBeenCalledWith('dismiss');
  });
});
