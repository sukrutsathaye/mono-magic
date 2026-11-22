import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Text, type View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicAlert } from './alert';

afterEach(cleanup);

describe('MagicAlert', () => {
  it('renders title, message, severity icon, ref, and ARIA alert semantics', () => {
    const ref = createRef<View>();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicAlert
          ref={ref}
          id="sync-alert"
          testId="rn-alert"
          severity="success"
          title="Sync Complete"
          message="All workspace packages are up to date."
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    const alert = screen.getByTestId('rn-alert');
    expect(alert.getAttribute('id')).toBe('sync-alert');
    expect(alert.getAttribute('role')).toBe('alert');
    expect(alert.getAttribute('aria-live')).toBe('polite');
    expect(screen.getByTestId('rn-alert-icon').textContent).toBe('check_circle');
    expect(screen.getByTestId('rn-alert-title').textContent).toBe('Sync Complete');
    expect(screen.getByTestId('rn-alert-message').textContent).toBe(
      'All workspace packages are up to date.'
    );
  });

  it('supports all severities, variants, sizes, custom icon, and hideIcon', () => {
    const { rerender } = render(
      <MagicPaperProvider>
        <MagicAlert
          testId="var-alert"
          severity="error"
          variant="filled"
          size="xs"
          message="Build failed"
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('var-alert').getAttribute('aria-live')).toBe(
      'assertive'
    );
    expect(screen.getByTestId('var-alert-icon').textContent).toBe('error');

    rerender(
      <MagicPaperProvider palette="dark-theme">
        <MagicAlert
          testId="var-alert"
          severity="warning"
          variant="outlined"
          size="xl"
          icon="bolt"
          message="High memory usage"
        >
          <Text>Extra details</Text>
        </MagicAlert>
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('var-alert').style.borderTopWidth).toBe('1px');
    expect(screen.getByTestId('var-alert-icon').textContent).toBe('bolt');
    expect(screen.getByText('Extra details')).toBeTruthy();

    rerender(
      <MagicPaperProvider>
        <MagicAlert
          testId="var-alert"
          severity="info"
          variant="standard"
          size="sm"
          hideIcon
          message="No icon alert"
        />
      </MagicPaperProvider>
    );

    expect(screen.queryByTestId('var-alert-icon')).toBeNull();
  });

  it('triggers onAction and onDismiss callbacks when buttons are clicked', () => {
    const onAction = vi.fn();
    const onDismiss = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicAlert
          testId="interactive-alert"
          severity="warning"
          message="Unsaved changes detected."
          actionLabel="Save Now"
          dismissible
          onAction={onAction}
          onDismiss={onDismiss}
        />
      </MagicPaperProvider>
    );

    fireEvent.click(screen.getByTestId('interactive-alert-action'));
    expect(onAction).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('interactive-alert-dismiss'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
