import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { defaultSliderDisplayWith, MagicSlider } from './slider';

afterEach(cleanup);

describe('MagicSlider (React MUI)', () => {
  it('renders single-thumb slider, forwards React 19 ref, and triggers onChange', () => {
    const onChange = vi.fn();
    const sliderRef = createRef<HTMLSpanElement>();

    render(
      <MagicMuiThemeProvider>
        <MagicSlider
          ref={sliderRef}
          id="vol-slider"
          testId="magic-slider"
          ariaLabel="Volume"
          min={0}
          max={100}
          step={5}
          defaultValue={30}
          onChange={onChange}
        />
      </MagicMuiThemeProvider>,
    );

    const root = screen.getByTestId('magic-slider');
    expect(sliderRef.current).toBe(root);
    expect(root.id).toBe('vol-slider');

    const input = screen.getByRole('slider', {
      name: 'Volume',
    }) as HTMLInputElement;
    expect(input.value).toBe('30');

    fireEvent.change(input, { target: { value: 55 } });
    expect(onChange).toHaveBeenCalledWith(55);
    expect(input.value).toBe('55');
  });

  it('supports controlled single-thumb value, discrete valueLabelDisplay, showTickMarks, and custom displayWith', () => {
    const onChange = vi.fn();
    const displayWith = vi.fn((v: number) => `${v}%`);

    render(
      <MagicMuiThemeProvider>
        <MagicSlider
          value={75}
          discrete
          showTickMarks
          disableRipple
          sx={[{ mt: 1 }]}
          displayWith={displayWith}
          testId="discrete-slider"
          onChange={onChange}
        />
      </MagicMuiThemeProvider>,
    );

    const input = screen.getByRole('slider', {
      name: 'Slider',
    }) as HTMLInputElement;
    expect(input.value).toBe('75');
    expect(displayWith).toHaveBeenCalledWith(75, 0);

    fireEvent.change(input, { target: { value: 80 } });
    expect(onChange).toHaveBeenCalledWith(80);
  });

  it('supports range mode (controlled and uncontrolled) and triggers onRangeChange', () => {
    const onRangeChange = vi.fn();

    const { rerender } = render(
      <MagicMuiThemeProvider>
        <MagicSlider
          range
          min={10}
          max={90}
          ariaLabel="Budget"
          onRangeChange={onRangeChange}
        />
      </MagicMuiThemeProvider>,
    );

    const thumbs = screen.getAllByRole('slider') as HTMLInputElement[];
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0].value).toBe('10');
    expect(thumbs[1].value).toBe('90');

    fireEvent.change(thumbs[0], { target: { value: 25 } });
    expect(onRangeChange).toHaveBeenCalledWith({ start: 25, end: 90 });

    // Controlled range mode with explicit startValue and endValue
    rerender(
      <MagicMuiThemeProvider>
        <MagicSlider
          range
          startValue={30}
          endValue={70}
          ariaLabel="Budget"
          onRangeChange={onRangeChange}
        />
      </MagicMuiThemeProvider>,
    );

    const controlledThumbs = screen.getAllByRole(
      'slider',
    ) as HTMLInputElement[];
    expect(controlledThumbs[0].value).toBe('30');
    expect(controlledThumbs[1].value).toBe('70');

    fireEvent.change(controlledThumbs[1], { target: { value: 85 } });
    expect(onRangeChange).toHaveBeenLastCalledWith({ start: 30, end: 85 });
  });

  it('formats numbers with defaultSliderDisplayWith matching ng-mat', () => {
    expect(defaultSliderDisplayWith(42)).toBe('42');
    expect(defaultSliderDisplayWith(2500)).toBe('3k');
    expect(defaultSliderDisplayWith(4_000_000)).toBe('4M');
    expect(defaultSliderDisplayWith(2_000_000_000)).toBe('2B');
  });

  it('supports all 5 AtomicSizes, all 7 ColorIntents, and disabled state', () => {
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
      <MagicMuiThemeProvider>
        {sizes.map((size) => (
          <MagicSlider
            key={size}
            size={size}
            ariaLabel={`size-${size}`}
            testId={`size-${size}`}
          />
        ))}
        {colors.map((color) => (
          <MagicSlider
            key={color}
            color={color}
            ariaLabel={`color-${color}`}
            testId={`color-${color}`}
          />
        ))}
        <MagicSlider
          disabled
          ariaLabel="disabled-slider"
          testId="disabled-slider"
        />
      </MagicMuiThemeProvider>,
    );

    for (const size of sizes) {
      expect(screen.getByTestId(`size-${size}`)).toBeTruthy();
    }
    for (const color of colors) {
      expect(screen.getByTestId(`color-${color}`)).toBeTruthy();
    }
    const disabledInput = screen.getByRole('slider', {
      name: 'disabled-slider',
    }) as HTMLInputElement;
    expect(disabledInput.disabled).toBe(true);
  });
});
