import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicTextInput } from './text-input';

afterEach(cleanup);

describe('MagicTextInput (React Native Paper)', () => {
  it('renders helper text and emits value changes', () => {
    const onChangeText = vi.fn();
    render(
      <MagicPaperProvider>
        <MagicTextInput
          label="Email"
          placeholder="you@example.com"
          helperText="Work email preferred"
          testId="rn-input"
          onChangeText={onChangeText}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByText('Work email preferred')).toBeTruthy();

    const input = screen.getByTestId('rn-input');
    fireEvent.change(input, { target: { value: 'ada@example.com' } });
    expect(onChangeText).toHaveBeenCalledWith('ada@example.com');
  });

  it('prefers errorText over helperText when error is present', () => {
    render(
      <MagicPaperProvider>
        <MagicTextInput
          label="Username"
          helperText="Choose a handle"
          errorText="Handle is required"
          testId="rn-err-input"
        />
      </MagicPaperProvider>
    );

    expect(screen.getByText('Handle is required')).toBeTruthy();
    expect(screen.queryByText('Choose a handle')).toBeNull();
  });
});
