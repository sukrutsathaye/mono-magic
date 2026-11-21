import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicProgressIndicator } from './progress-indicator';

afterEach(cleanup);

describe('MagicProgressIndicator', () => {
  it('renders determinate bar, clamps values to [0, 100], fires onAnimationEnd at 100, and forwards ref', () => {
    const onAnimationEnd = vi.fn();
    const ref = createRef<View>();

    const { rerender } = render(
      <MagicPaperProvider palette="azure-blue">
        <MagicProgressIndicator
          ref={ref}
          id="upload-bar"
          testId="bar-det"
          type="bar"
          mode="determinate"
          value={-20}
          ariaLabel="Upload progress"
          onAnimationEnd={onAnimationEnd}
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    const bar = screen.getByTestId('bar-det');
    expect(bar.getAttribute('id')).toBe('upload-bar');
    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('0');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
    expect(screen.getByTestId('bar-det-fill').style.width).toBe('0%');
    expect(onAnimationEnd).not.toHaveBeenCalled();

    rerender(
      <MagicPaperProvider palette="azure-blue">
        <MagicProgressIndicator
          ref={ref}
          id="upload-bar"
          testId="bar-det"
          type="bar"
          mode="determinate"
          value={140}
          onAnimationEnd={onAnimationEnd}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('bar-det').getAttribute('aria-valuenow')).toBe(
      '100'
    );
    expect(screen.getByTestId('bar-det-fill').style.width).toBe('100%');
    expect(onAnimationEnd).toHaveBeenCalledTimes(1);
  });

  it('supports buffer, indeterminate, and query bar modes with strokeWidth override', () => {
    render(
      <MagicPaperProvider>
        <MagicProgressIndicator
          testId="bar-buffer"
          mode="buffer"
          value={35}
          bufferValue={80}
          strokeWidth={10}
        />
        <MagicProgressIndicator testId="bar-indet" mode="indeterminate" />
        <MagicProgressIndicator testId="bar-query" mode="query" />
        <MagicProgressIndicator
          testId="bar-nan"
          mode="determinate"
          value={Number.NaN}
        />
      </MagicPaperProvider>
    );

    const bufferBar = screen.getByTestId('bar-buffer');
    expect(bufferBar.style.height).toBe('10px');
    expect(screen.getByTestId('bar-buffer-fill').style.width).toBe('35%');
    expect(screen.getByTestId('bar-buffer-buffer').style.width).toBe('80%');

    const indet = screen.getByTestId('bar-indet');
    expect(indet.getAttribute('aria-valuenow')).toBeNull();
    expect(indet.getAttribute('aria-busy')).toBe('true');
    expect(screen.getByTestId('bar-indet-fill')).toBeTruthy();

    expect(screen.getByTestId('bar-query-fill')).toBeTruthy();
    expect(screen.getByTestId('bar-nan').getAttribute('aria-valuenow')).toBe(
      '0'
    );
  });

  it('renders indeterminate and determinate spinners with diameter and strokeWidth overrides', () => {
    render(
      <MagicPaperProvider>
        <MagicProgressIndicator
          testId="spin-indet"
          type="spinner"
          mode="indeterminate"
          diameter={44}
        />
        <MagicProgressIndicator
          testId="spin-det-20"
          type="spinner"
          mode="determinate"
          value={20}
          strokeWidth={4}
        />
        <MagicProgressIndicator
          testId="spin-det-80"
          type="spinner"
          mode="determinate"
          value={80}
          size="xl"
        />
      </MagicPaperProvider>
    );

    const indet = screen.getByTestId('spin-indet');
    expect(indet.getAttribute('role')).toBe('progressbar');
    expect(indet.style.width).toBe('44px');
    expect(indet.style.height).toBe('44px');
    expect(indet.getAttribute('aria-busy')).toBe('true');

    const det20 = screen.getByTestId('spin-det-20');
    expect(det20.getAttribute('aria-valuenow')).toBe('20');

    const det80 = screen.getByTestId('spin-det-80');
    expect(det80.getAttribute('aria-valuenow')).toBe('80');
    expect(det80.style.width).toBe('64px');
  });

  it('handles disabled state and all 5 sizes + 7 semantic colors', () => {
    const sizes: AtomicSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    const colors: ColorIntent[] = [
      'primary',
      'secondary',
      'tertiary',
      'success',
      'warning',
      'error',
      'neutral',
    ];

    render(
      <MagicPaperProvider palette="dark-theme">
        <MagicProgressIndicator
          testId="bar-disabled"
          type="bar"
          value={50}
          disabled
        />
        <MagicProgressIndicator
          testId="spin-disabled"
          type="spinner"
          mode="indeterminate"
          disabled
        />
        <MagicProgressIndicator
          testId="spin-det-disabled"
          type="spinner"
          mode="determinate"
          value={60}
          disabled
        />
        {sizes.map((size) => (
          <MagicProgressIndicator
            key={size}
            testId={`size-${size}`}
            size={size}
            value={40}
          />
        ))}
        {colors.map((color) => (
          <MagicProgressIndicator
            key={color}
            testId={`color-${color}`}
            color={color}
            value={60}
          />
        ))}
      </MagicPaperProvider>
    );

    expect(
      screen.getByTestId('bar-disabled').getAttribute('aria-disabled')
    ).toBe('true');
    expect(
      screen.getByTestId('spin-disabled').getAttribute('aria-disabled')
    ).toBe('true');
    expect(
      screen.getByTestId('spin-det-disabled').getAttribute('aria-disabled')
    ).toBe('true');

    for (const size of sizes) {
      expect(screen.getByTestId(`size-${size}`)).toBeTruthy();
    }
    for (const color of colors) {
      expect(screen.getByTestId(`color-${color}`)).toBeTruthy();
    }
  });
});
