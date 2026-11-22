import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Text, type View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicToast } from './toast';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('MagicToast', () => {
  it('renders nothing when open is false', () => {
    render(
      <MagicPaperProvider>
        <MagicToast testId="closed-toast" open={false} message="Hidden" />
      </MagicPaperProvider>
    );

    expect(screen.queryByTestId('closed-toast')).toBeNull();
  });

  it('renders title, message, ref, and live-region ARIA attributes when open', () => {
    const ref = createRef<View>();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicToast
          ref={ref}
          id="save-toast"
          testId="rn-toast"
          open
          severity="success"
          title="Saved"
          message="Profile updated successfully."
          duration={null}
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    const toast = screen.getByTestId('rn-toast');
    expect(toast.getAttribute('id')).toBe('save-toast');
    expect(toast.getAttribute('role')).toBe('status');
    expect(toast.getAttribute('aria-live')).toBe('polite');
    expect(screen.getByTestId('rn-toast-icon').textContent).toBe('check_circle');
    expect(screen.getByTestId('rn-toast-title').textContent).toBe('Saved');
    expect(screen.getByTestId('rn-toast-message').textContent).toBe(
      'Profile updated successfully.'
    );
  });

  it('auto-dismisses after duration and clears timer on unmount', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    const { unmount } = render(
      <MagicPaperProvider>
        <MagicToast
          testId="timer-toast"
          open
          duration={2500}
          message="Closing soon"
          onClose={onClose}
        />
      </MagicPaperProvider>
    );

    vi.advanceTimersByTime(2499);
    expect(onClose).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith('timeout');

    // Verify unmount cleans up pending timer
    const onCloseUnmount = vi.fn();
    const res = render(
      <MagicPaperProvider>
        <MagicToast
          testId="unmount-toast"
          open
          duration={3000}
          message="Will unmount"
          onClose={onCloseUnmount}
        />
      </MagicPaperProvider>
    );
    res.unmount();
    vi.advanceTimersByTime(5000);
    expect(onCloseUnmount).not.toHaveBeenCalled();
    unmount();
  });

  it('handles action, manual dismiss, assertive error mode, and anchor positions', () => {
    const onClose = vi.fn();
    const onAction = vi.fn();

    const { rerender } = render(
      <MagicPaperProvider>
        <MagicToast
          testId="err-toast"
          open
          severity="error"
          position="top-center"
          duration={null}
          message="Upload failed"
          actionLabel="Retry"
          onAction={onAction}
          onClose={onClose}
        >
          <Text>Error code 503</Text>
        </MagicToast>
      </MagicPaperProvider>
    );

    const toast = screen.getByTestId('err-toast');
    expect(toast.getAttribute('role')).toBe('alert');
    expect(toast.getAttribute('aria-live')).toBe('assertive');
    expect(screen.getByText('Error code 503')).toBeTruthy();

    fireEvent.click(screen.getByTestId('err-toast-action'));
    expect(onAction).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('err-toast-dismiss'));
    expect(onClose).toHaveBeenCalledWith('dismiss');

    rerender(
      <MagicPaperProvider palette="dark-theme">
        <MagicToast
          testId="err-toast"
          open
          inline
          dismissible={false}
          duration={null}
          message="Inline persistent toast"
        />
      </MagicPaperProvider>
    );

    expect(screen.queryByTestId('err-toast-dismiss')).toBeNull();
  });
});
