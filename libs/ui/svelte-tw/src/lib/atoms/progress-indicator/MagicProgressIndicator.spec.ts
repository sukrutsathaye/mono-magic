import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
  ProgressIndicatorMode,
} from '@mono-magic/atomic-design-interfaces';
import MagicProgressIndicator from './MagicProgressIndicator.svelte';

describe('MagicProgressIndicator', () => {
  it('renders determinate bar with clamped value and buffer mode', () => {
    const { rerender } = render(MagicProgressIndicator, {
      props: {
        id: 'upload-bar',
        type: 'bar',
        mode: 'determinate',
        value: 150,
        ariaLabel: 'Upload progress',
      },
    });

    const bar = screen.getByTestId('magic-progress-indicator');
    expect(bar).toHaveAttribute('id', 'upload-bar');
    expect(bar).toHaveAttribute('data-type', 'bar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByTestId('magic-progress-indicator-fill')).toHaveStyle({
      width: '100%',
    });

    rerender({
      type: 'bar',
      mode: 'buffer',
      value: 40,
      bufferValue: 75,
      color: 'secondary',
      size: 'lg',
    });
    expect(screen.getByTestId('magic-progress-indicator-buffer')).toHaveStyle({
      width: '75%',
    });
  });

  it('renders indeterminate and query bar modes without aria-valuenow', () => {
    const modes: ProgressIndicatorMode[] = ['indeterminate', 'query'];
    for (const mode of modes) {
      const { unmount } = render(MagicProgressIndicator, {
        props: {
          type: 'bar',
          mode,
          testId: `bar-${mode}`,
        },
      });
      const el = screen.getByTestId(`bar-${mode}`);
      expect(el).toHaveAttribute('data-mode', mode);
      expect(el).not.toHaveAttribute('aria-valuenow');
      unmount();
    }
  });

  it('renders circular spinner across sizes, colors, custom diameter/stroke, and disabled state', () => {
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

    for (const size of sizes) {
      const { unmount } = render(MagicProgressIndicator, {
        props: {
          type: 'spinner',
          mode: 'determinate',
          value: 55,
          size,
          testId: `spinner-${size}`,
        },
      });
      const el = screen.getByTestId(`spinner-${size}`);
      expect(el).toHaveAttribute('data-type', 'spinner');
      expect(el).toHaveAttribute('aria-valuenow', '55');
      unmount();
    }

    for (const color of colors) {
      const { unmount } = render(MagicProgressIndicator, {
        props: {
          type: 'spinner',
          mode: 'indeterminate',
          color,
          diameter: 48,
          strokeWidth: 5,
          disabled: true,
          testId: `spinner-${color}`,
        },
      });
      const el = screen.getByTestId(`spinner-${color}`);
      expect(el).toHaveStyle({ width: '48px', height: '48px' });
      expect(el).toHaveClass('opacity-50');
      unmount();
    }
  });
});
