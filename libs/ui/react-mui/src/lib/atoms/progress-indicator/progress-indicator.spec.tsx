import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
  ProgressIndicatorMode,
} from '@mono-magic/atomic-design-interfaces';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicProgressIndicator } from './progress-indicator';

afterEach(cleanup);

describe('MagicProgressIndicator (React MUI)', () => {
  it('renders determinate bar by default, forwards ref, and preserves exact zero', () => {
    const divRef = createRef<HTMLDivElement>();

    render(
      <MagicMuiThemeProvider>
        <MagicProgressIndicator
          ref={divRef}
          id="upload-prog"
          testId="prog-zero"
          ariaLabel="Upload progress"
          value={0}
        />
      </MagicMuiThemeProvider>,
    );

    const wrapper = screen.getByTestId('prog-zero') as HTMLDivElement;
    expect(divRef.current).toBe(wrapper);
    expect(wrapper.id).toBe('upload-prog');
    const bar = screen.getByRole('progressbar', { name: 'Upload progress' });
    expect(bar.getAttribute('aria-valuenow')).toBe('0');
  });

  it('clamps value and bufferValue to [0, 100] and handles NaN safely', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicProgressIndicator
          testId="clamped-low"
          ariaLabel="Low"
          mode="determinate"
          value={-25}
        />
        <MagicProgressIndicator
          testId="clamped-high"
          ariaLabel="High"
          mode="buffer"
          value={150}
          bufferValue={180}
        />
        <MagicProgressIndicator
          testId="clamped-nan"
          ariaLabel="NaN"
          mode="determinate"
          value={Number.NaN}
        />
      </MagicMuiThemeProvider>,
    );

    expect(
      screen.getByRole('progressbar', { name: 'Low' }).getAttribute('aria-valuenow'),
    ).toBe('0');
    expect(
      screen.getByRole('progressbar', { name: 'High' }).getAttribute('aria-valuenow'),
    ).toBe('100');
    expect(
      screen.getByRole('progressbar', { name: 'NaN' }).getAttribute('aria-valuenow'),
    ).toBe('0');
  });

  it('supports all 4 bar modes (determinate, indeterminate, buffer, query)', () => {
    const modes: ProgressIndicatorMode[] = [
      'determinate',
      'indeterminate',
      'buffer',
      'query',
    ];

    render(
      <MagicMuiThemeProvider>
        {modes.map((mode) => (
          <MagicProgressIndicator
            key={mode}
            type="bar"
            mode={mode}
            value={45}
            bufferValue={75}
            ariaLabel={`mode-${mode}`}
            testId={`bar-${mode}`}
          />
        ))}
      </MagicMuiThemeProvider>,
    );

    for (const mode of modes) {
      expect(screen.getByTestId(`bar-${mode}`)).toBeTruthy();
    }
    expect(
      screen
        .getByRole('progressbar', { name: 'mode-determinate' })
        .getAttribute('aria-valuenow'),
    ).toBe('45');
    expect(
      screen
        .getByRole('progressbar', { name: 'mode-indeterminate' })
        .getAttribute('aria-valuenow'),
    ).toBeNull();
  });

  it('renders spinner type in determinate and indeterminate modes with diameter and strokeWidth', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicProgressIndicator
          type="spinner"
          mode="determinate"
          value={75}
          diameter={64}
          strokeWidth={5}
          ariaLabel="Det spinner"
          testId="det-spinner"
        />
        <MagicProgressIndicator
          type="spinner"
          mode="indeterminate"
          size="xl"
          ariaLabel="Indet spinner"
          testId="indet-spinner"
        />
      </MagicMuiThemeProvider>,
    );

    const det = screen.getByRole('progressbar', { name: 'Det spinner' });
    expect(det.getAttribute('aria-valuenow')).toBe('75');
    expect(det.style.width).toBe('64px');

    const indet = screen.getByRole('progressbar', { name: 'Indet spinner' });
    expect(indet.style.width).toBe('72px');
    expect(indet.getAttribute('aria-valuenow')).toBeNull();
  });

  it('supports all 5 sizes, all 7 colors, disabled opacity, sx, and onAnimationEnd', () => {
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
    const onAnimationEnd = vi.fn();

    render(
      <MagicMuiThemeProvider>
        {sizes.map((size) => (
          <MagicProgressIndicator
            key={size}
            size={size}
            value={50}
            ariaLabel={`size-${size}`}
            testId={`size-${size}`}
          />
        ))}
        {colors.map((color) => (
          <MagicProgressIndicator
            key={color}
            type="spinner"
            color={color}
            value={50}
            ariaLabel={`color-${color}`}
            testId={`color-${color}`}
          />
        ))}
        <MagicProgressIndicator
          testId="disabled-bar"
          disabled
          value={30}
          sx={[{ mt: 1 }]}
          onAnimationEnd={onAnimationEnd}
        />
      </MagicMuiThemeProvider>,
    );

    for (const size of sizes) {
      expect(screen.getByTestId(`size-${size}`)).toBeTruthy();
    }
    for (const color of colors) {
      expect(screen.getByTestId(`color-${color}`)).toBeTruthy();
    }

    const disabledBar = screen.getByTestId('disabled-bar');
    expect(getComputedStyle(disabledBar).opacity).toBe('0.38');
    fireEvent.animationEnd(disabledBar);
    expect(onAnimationEnd).toHaveBeenCalledTimes(1);
  });
});
