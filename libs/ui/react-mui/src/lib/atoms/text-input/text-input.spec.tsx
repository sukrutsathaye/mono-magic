import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicTextInput } from './text-input';

afterEach(cleanup);

describe('MagicTextInput (React MUI)', () => {
  it('renders label, helper text, and emits changes', () => {
    const onChange = vi.fn();
    render(
      <MagicMuiThemeProvider>
        <MagicTextInput
          label="Email"
          placeholder="you@example.com"
          helperText="Work email preferred"
          testId="email-input"
          onChange={onChange}
        />
      </MagicMuiThemeProvider>
    );

    const input = screen.getByTestId('email-input') as HTMLInputElement;
    expect(screen.getByText('Work email preferred')).toBeTruthy();

    fireEvent.change(input, { target: { value: 'ada@example.com' } });
    expect(onChange).toHaveBeenCalledWith('ada@example.com');
  });

  it('prefers errorText over helperText when error is present', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicTextInput
          label="Username"
          helperText="Choose a handle"
          errorText="Handle is required"
          testId="username-input"
        />
      </MagicMuiThemeProvider>
    );

    expect(screen.getByText('Handle is required')).toBeTruthy();
    expect(screen.queryByText('Choose a handle')).toBeNull();
  });
});
