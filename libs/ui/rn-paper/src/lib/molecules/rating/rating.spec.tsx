import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicRating } from './rating';

afterEach(cleanup);

describe('MagicRating', () => {
  it('renders stars, label, value, reviewCount, and updates whole-star selection', () => {
    const ref = createRef<View>();
    const onChange = vi.fn();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicRating
          ref={ref}
          id="product-rating"
          testId="rn-rating"
          label="Overall Quality"
          defaultValue={3}
          showValue
          reviewCount={128}
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    expect(screen.getByTestId('rn-rating').getAttribute('id')).toBe(
      'product-rating'
    );
    expect(screen.getByText('Overall Quality')).toBeTruthy();
    expect(screen.getByTestId('rn-rating-value').textContent).toBe('3');
    expect(screen.getByTestId('rn-rating-reviews').textContent).toBe('(128)');

    fireEvent.click(screen.getByTestId('rn-rating-star-5'));
    expect(onChange).toHaveBeenCalledWith(5);
    expect(screen.getByTestId('rn-rating-value').textContent).toBe('5');

    // Clicking active star resets to 0
    fireEvent.click(screen.getByTestId('rn-rating-star-5'));
    expect(onChange).toHaveBeenLastCalledWith(0);
    expect(screen.getByTestId('rn-rating-value').textContent).toBe('0');
  });

  it('supports half-star precision={0.5} hit zones and custom max', () => {
    const onChange = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicRating
          testId="half-rating"
          precision={0.5}
          max={4}
          defaultValue={2.5}
          showValue
          color="primary"
          size="lg"
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('half-rating-value').textContent).toBe('2.5');
    fireEvent.click(screen.getByTestId('half-rating-star-3.5'));
    expect(onChange).toHaveBeenCalledWith(3.5);
    expect(screen.getByTestId('half-rating-value').textContent).toBe('3.5');
  });

  it('respects readOnly, disabled, controlled value, and dark theme', () => {
    const onChange = vi.fn();

    const { rerender } = render(
      <MagicPaperProvider palette="dark-theme">
        <MagicRating
          testId="ro-rating"
          value={4}
          readOnly
          showValue
          size="xs"
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('ro-rating-value').textContent).toBe('4');
    fireEvent.click(screen.getByTestId('ro-rating-star-2'));
    expect(onChange).not.toHaveBeenCalled();

    rerender(
      <MagicPaperProvider palette="dark-theme">
        <MagicRating
          testId="ro-rating"
          value={2}
          disabled
          showValue
          size="xl"
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('ro-rating-value').textContent).toBe('2');
    fireEvent.click(screen.getByTestId('ro-rating-star-5'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
