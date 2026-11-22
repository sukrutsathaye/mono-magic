import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Text, type View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicDialog, type DialogActionItem } from './dialog';

afterEach(cleanup);

describe('MagicDialog', () => {
  it('renders nothing when open is false', () => {
    render(
      <MagicPaperProvider>
        <MagicDialog testId="closed-dialog" open={false} title="Hidden" />
      </MagicPaperProvider>
    );

    expect(screen.queryByTestId('closed-dialog')).toBeNull();
  });

  it('renders title, subtitle, content, ref, and ARIA attributes when open', () => {
    const ref = createRef<View>();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicDialog
          ref={ref}
          id="confirm-dialog"
          testId="rn-dialog"
          open
          title="Delete Workspace"
          subtitle="Permanent Action"
          content="This action cannot be undone."
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    const dialog = screen.getByTestId('rn-dialog');
    expect(dialog.getAttribute('id')).toBe('confirm-dialog');
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByTestId('rn-dialog-title').textContent).toBe(
      'Delete Workspace'
    );
    expect(screen.getByTestId('rn-dialog-subtitle').textContent).toBe(
      'Permanent Action'
    );
    expect(screen.getByTestId('rn-dialog-content').textContent).toBe(
      'This action cannot be undone.'
    );
  });

  it('handles close button, backdrop click, and Escape key when dismissible', () => {
    const onClose = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicDialog
          testId="dismiss-dialog"
          open
          title="Session Timeout"
          onClose={onClose}
        />
      </MagicPaperProvider>
    );

    fireEvent.click(screen.getByTestId('dismiss-dialog-close'));
    expect(onClose).toHaveBeenCalledWith('close-button');

    fireEvent.click(screen.getByTestId('dismiss-dialog-backdrop'));
    expect(onClose).toHaveBeenCalledWith('backdrop');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledWith('escape');
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('respects dismissible=false, closeOnBackdropClick=false, and closeOnEscape=false', () => {
    const onClose = vi.fn();

    const { rerender } = render(
      <MagicPaperProvider>
        <MagicDialog
          testId="locked-dialog"
          open
          title="Locked"
          dismissible={false}
          onClose={onClose}
        />
      </MagicPaperProvider>
    );

    expect(screen.queryByTestId('locked-dialog-close')).toBeNull();
    fireEvent.click(screen.getByTestId('locked-dialog-backdrop'));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();

    rerender(
      <MagicPaperProvider>
        <MagicDialog
          testId="locked-dialog"
          open
          title="Partially Locked"
          dismissible
          closeOnBackdropClick={false}
          closeOnEscape={false}
          showCloseButton={false}
          onClose={onClose}
        />
      </MagicPaperProvider>
    );

    expect(screen.queryByTestId('locked-dialog-close')).toBeNull();
    fireEvent.click(screen.getByTestId('locked-dialog-backdrop'));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders actions, aligns them, and fires onActionClick only for enabled actions', () => {
    const onActionClick = vi.fn();
    const actions: readonly DialogActionItem[] = [
      { id: 'cancel', label: 'Cancel', variant: 'text', color: 'neutral' },
      {
        id: 'confirm',
        label: 'Confirm',
        variant: 'filled',
        color: 'primary',
        icon: 'check',
      },
      { label: 'Disabled', disabled: true },
    ];

    render(
      <MagicPaperProvider>
        <MagicDialog
          testId="act-dialog"
          open
          title="Confirm Changes"
          actions={actions}
          alignActions="start"
          onActionClick={onActionClick}
        />
      </MagicPaperProvider>
    );

    fireEvent.click(screen.getByTestId('act-dialog-action-confirm'));
    expect(onActionClick).toHaveBeenCalledTimes(1);
    expect(onActionClick).toHaveBeenCalledWith(actions[1]);

    fireEvent.click(screen.getByTestId('act-dialog-action-2'));
    expect(onActionClick).toHaveBeenCalledTimes(1);
  });

  it('supports size presets, scrollable body, inline mode, and custom slots', () => {
    const { rerender } = render(
      <MagicPaperProvider palette="dark-theme">
        <MagicDialog
          testId="slot-dialog"
          open
          inline
          size="sm"
          scrollable
          headerSlot={<Text>Custom Header</Text>}
          footerSlot={<Text>Custom Footer</Text>}
        >
          <Text>Scrollable body child</Text>
        </MagicDialog>
      </MagicPaperProvider>
    );

    expect(screen.getByText('Custom Header')).toBeTruthy();
    expect(screen.getByText('Scrollable body child')).toBeTruthy();
    expect(screen.getByText('Custom Footer')).toBeTruthy();
    expect(screen.getByTestId('slot-dialog').getAttribute('aria-modal')).toBe(
      'false'
    );

    rerender(
      <MagicPaperProvider>
        <MagicDialog
          testId="slot-dialog"
          open
          size="fullscreen"
          ariaLabel="Fullscreen modal"
          content="Fullscreen content"
        />
      </MagicPaperProvider>
    );
    expect(screen.getByLabelText('Fullscreen modal')).toBeTruthy();

    rerender(
      <MagicPaperProvider>
        <MagicDialog
          testId="slot-dialog"
          open
          inline
          size="fullscreen"
          title="Inline Fullscreen"
        />
      </MagicPaperProvider>
    );
    expect(screen.getByText('Inline Fullscreen')).toBeTruthy();
  });
});
