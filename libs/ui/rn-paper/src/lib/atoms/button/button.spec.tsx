import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicButton } from './button';

afterEach(cleanup);

describe('MagicButton (React Native Paper)', () => {
  it('renders label and triggers onPress', () => {
    const onPress = vi.fn();
    render(
      <MagicPaperProvider>
        <MagicButton label="Submit" testId="rn-btn" onPress={onPress} />
      </MagicPaperProvider>
    );

    const btn = screen.getByTestId('rn-btn');
    expect(btn.textContent).toContain('Submit');

    fireEvent.click(btn);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('prevents interaction when disabled or loading', () => {
    const onPress = vi.fn();
    render(
      <MagicPaperProvider>
        <MagicButton
          label="Saving"
          loading
          testId="rn-loading-btn"
          onPress={onPress}
        />
      </MagicPaperProvider>
    );

    const btn = screen.getByTestId('rn-loading-btn');
    fireEvent.click(btn);
    expect(onPress).not.toHaveBeenCalled();
  });
});
