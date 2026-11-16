import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicButton } from './button';

afterEach(cleanup);

describe('MagicButton (React MUI)', () => {
  it('renders label and triggers onClick', () => {
    const onClick = vi.fn();
    render(
      <MagicMuiThemeProvider>
        <MagicButton label="Submit" testId="magic-btn" onClick={onClick} />
      </MagicMuiThemeProvider>
    );

    const btn = screen.getByTestId('magic-btn');
    expect(btn.textContent).toContain('Submit');

    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables interaction when disabled or loading', () => {
    const onClick = vi.fn();
    render(
      <MagicMuiThemeProvider>
        <MagicButton
          label="Saving"
          loading
          testId="loading-btn"
          onClick={onClick}
        />
      </MagicMuiThemeProvider>
    );

    const btn = screen.getByTestId('loading-btn') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });
});
