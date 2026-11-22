import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicDialog } from './dialog';

afterEach(cleanup);

describe('MagicDialog (React MUI)', () => {
  it('renders open dialog with title, subtitle, content, ARIA attributes, and forwards ref', () => {
    const dialogRef = createRef<HTMLDivElement>();
    render(
      <MagicMuiThemeProvider>
        <MagicDialog
          ref={dialogRef}
          id="confirm-dialog"
          testId="confirm-dialog"
          open
          title="Delete Workspace"
          subtitle="Permanent action"
          content="All local settings and cached bundles will be removed."
        />
      </MagicMuiThemeProvider>,
    );

    expect(dialogRef.current).toBeInstanceOf(HTMLDivElement);
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-labelledby')).toBe('confirm-dialog-title');
    expect(dialog.getAttribute('aria-describedby')).toBe(
      'confirm-dialog-description',
    );
    expect(screen.getByTestId('confirm-dialog-title').textContent).toBe(
      'Delete Workspace',
    );
    expect(screen.getByTestId('confirm-dialog-subtitle').textContent).toBe(
      'Permanent action',
    );
    expect(
      screen.getByText('All local settings and cached bundles will be removed.'),
    ).toBeTruthy();
  });

  it('does not render dialog contents when open is false', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicDialog
          testId="closed-dialog"
          open={false}
          title="Hidden Title"
          content="Hidden Content"
        />
      </MagicMuiThemeProvider>,
    );

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByText('Hidden Title')).toBeNull();
  });

  it('supports all 4 DialogSize presets (sm, md, lg, fullscreen)', () => {
    const sizes = ['sm', 'md', 'lg', 'fullscreen'] as const;
    for (const size of sizes) {
      const { unmount } = render(
        <MagicMuiThemeProvider>
          <MagicDialog
            testId={`dialog-${size}`}
            open
            disablePortal
            size={size}
            title={`Size ${size}`}
          />
        </MagicMuiThemeProvider>,
      );

      const root = screen.getByTestId(`dialog-${size}`);
      expect(root.getAttribute('data-size')).toBe(size);
      const paper = screen.getByTestId(`dialog-${size}-paper`);
      if (size === 'fullscreen') {
        expect(paper.className).toContain('MuiDialog-paperFullScreen');
      } else {
        expect(paper.className).not.toContain('MuiDialog-paperFullScreen');
      }
      unmount();
    }
  });

  it('emits onClose for close button, backdrop click, and Escape key when enabled', () => {
    const onClose = vi.fn();
    render(
      <MagicMuiThemeProvider>
        <MagicDialog
          testId="dismiss-dialog"
          open
          title="Dismissable"
          onClose={onClose}
        />
      </MagicMuiThemeProvider>,
    );

    fireEvent.click(screen.getByTestId('dismiss-dialog-close'));
    expect(onClose).toHaveBeenCalledWith('closeButton');

    const backdrop = document.querySelector('.MuiBackdrop-root');
    expect(backdrop).toBeTruthy();
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    expect(onClose).toHaveBeenCalledWith('backdropClick');

    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
    });
    expect(onClose).toHaveBeenCalledWith('escapeKeyDown');
  });

  it('respects dismissible=false, closeOnBackdropClick=false, closeOnEscape=false, and showCloseButton=false', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <MagicMuiThemeProvider>
        <MagicDialog
          testId="locked-dialog"
          open
          title="Locked"
          dismissible={false}
          onClose={onClose}
        />
      </MagicMuiThemeProvider>,
    );

    expect(screen.queryByTestId('locked-dialog-close')).toBeNull();
    const backdrop = document.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      fireEvent.click(backdrop);
    }
    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
    });
    expect(onClose).not.toHaveBeenCalled();

    rerender(
      <MagicMuiThemeProvider>
        <MagicDialog
          testId="locked-dialog"
          open
          title="Selective Lock"
          dismissible
          showCloseButton={false}
          closeOnBackdropClick={false}
          closeOnEscape={false}
          onClose={onClose}
        />
      </MagicMuiThemeProvider>,
    );

    expect(screen.queryByTestId('locked-dialog-close')).toBeNull();
    const nextBackdrop = document.querySelector('.MuiBackdrop-root');
    if (nextBackdrop) {
      fireEvent.click(nextBackdrop);
    }
    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders actions with alignActions, invokes onActionClick only when enabled, and supports slots & scrollable', () => {
    const onActionClick = vi.fn();
    render(
      <MagicMuiThemeProvider>
        <MagicDialog
          testId="rich-dialog"
          open
          ariaLabel="Custom accessible dialog"
          scrollable
          alignActions="start"
          headerSlot={<div data-testid="custom-header">Custom Header</div>}
          footerSlot={<span data-testid="custom-footer">Draft saved</span>}
          actions={[
            { id: 'cancel', label: 'Cancel', variant: 'text' },
            {
              id: 'save',
              label: 'Save',
              variant: 'filled',
              color: 'primary',
              icon: 'check',
            },
            { label: 'Blocked', disabled: true },
          ]}
          onActionClick={onActionClick}
          sx={[{ zIndex: 1400 }]}
        >
          <div data-testid="custom-body">Projected body</div>
        </MagicDialog>
      </MagicMuiThemeProvider>,
    );

    expect(screen.getByRole('dialog').getAttribute('aria-label')).toBe(
      'Custom accessible dialog',
    );
    expect(screen.getByTestId('custom-header').textContent).toBe('Custom Header');
    expect(screen.getByTestId('custom-body').textContent).toBe('Projected body');
    expect(screen.getByTestId('custom-footer').textContent).toBe('Draft saved');
    expect(screen.getByTestId('rich-dialog-content').className).toContain(
      'MuiDialogContent-dividers',
    );

    fireEvent.click(screen.getByTestId('rich-dialog-action-save'));
    expect(onActionClick).toHaveBeenCalledTimes(1);
    expect(onActionClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'save', label: 'Save' }),
    );

    fireEvent.click(screen.getByTestId('rich-dialog-action-2'));
    expect(onActionClick).toHaveBeenCalledTimes(1);
  });

  it('supports single sx object and minimal dialog without header/body/footer', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicDialog
          testId="bare-dialog"
          open
          showCloseButton={false}
          ariaLabel="Bare dialog"
          sx={{ p: 1 }}
        />
      </MagicMuiThemeProvider>,
    );

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.queryByTestId('bare-dialog-header')).toBeNull();
    expect(screen.queryByTestId('bare-dialog-content')).toBeNull();
    expect(screen.queryByTestId('bare-dialog-actions')).toBeNull();
  });
});
