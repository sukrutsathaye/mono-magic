import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicRating } from './rating';

afterEach(cleanup);

describe('MagicRating (React MUI)', () => {
  it('renders rating stars, numeric value, review count, and forwards ref', () => {
    const ratingRef = createRef<HTMLDivElement>();
    const onChange = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicRating
          ref={ratingRef}
          id="course-rating"
          testId="course-rating"
          label="Course Quality"
          defaultValue={3.5}
          precision={0.5}
          showValue
          reviewCount={128}
          onChange={onChange}
        />
      </MagicMuiThemeProvider>,
    );

    expect(ratingRef.current).toBeInstanceOf(HTMLDivElement);
    expect(screen.getByText('Course Quality')).toBeTruthy();
    expect(screen.getByTestId('course-rating-value').textContent).toBe('3.5');
    expect(screen.getByTestId('course-rating-reviews').textContent).toBe('(128)');

    const fourStars = screen.getByRole('radio', { name: '4 Stars' });
    fireEvent.click(fourStars);
    expect(onChange).toHaveBeenCalledWith(4);
    expect(screen.getByTestId('course-rating-value').textContent).toBe('4.0');
  });

  it('respects controlled value, readOnly, disabled, custom max, and hover callback', () => {
    const onChange = vi.fn();
    const onHoverChange = vi.fn();

    const { rerender } = render(
      <MagicMuiThemeProvider>
        <MagicRating
          testId="ro-rating"
          value={4}
          max={10}
          readOnly
          showValue
          onChange={onChange}
        />
      </MagicMuiThemeProvider>,
    );

    expect(screen.getByTestId('ro-rating-value').textContent).toBe('4');
    expect(screen.getByTestId('ro-rating').getAttribute('data-readonly')).toBe(
      'true',
    );

    rerender(
      <MagicMuiThemeProvider>
        <MagicRating
          testId="ro-rating"
          value={2}
          max={5}
          disabled
          onChange={onChange}
          onHoverChange={onHoverChange}
        />
      </MagicMuiThemeProvider>,
    );

    const threeStarsInput = screen.getByRole('radio', {
      name: '3 Stars',
    }) as HTMLInputElement;
    expect(threeStarsInput.disabled).toBe(true);
    fireEvent.click(threeStarsInput);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clamps out-of-range values and supports all 5 sizes and custom icons', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(
        <MagicMuiThemeProvider>
          <MagicRating
            testId={`rating-${size}`}
            value={99}
            max={5}
            size={size}
            color="error"
            icon="favorite"
            emptyIcon="favorite_border"
            showValue
            sx={[{ p: 0.5 }]}
          />
        </MagicMuiThemeProvider>,
      );
      expect(screen.getByTestId(`rating-${size}`).getAttribute('data-size')).toBe(
        size,
      );
      expect(screen.getByTestId(`rating-${size}-value`).textContent).toBe('5');
      unmount();
    }
  });
});
