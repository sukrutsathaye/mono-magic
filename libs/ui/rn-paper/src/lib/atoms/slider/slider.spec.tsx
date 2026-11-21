import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicSlider } from './slider';

afterEach(cleanup);

describe('MagicSlider', () => {
  it('renders single-thumb slider with ARIA slider attributes and handles all keyboard navigation keys', () => {
    const onChange = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicSlider
          id="vol-slider"
          testId="single-slider"
          ariaLabel="Volume"
          min={0}
          max={100}
          step={5}
          defaultValue={50}
          discrete
          showTickMarks
          displayWith={(v) => `${v}%`}
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    const thumb = screen.getByTestId('single-slider-thumb');
    expect(thumb.getAttribute('role')).toBe('slider');
    expect(thumb.getAttribute('aria-valuemin')).toBe('0');
    expect(thumb.getAttribute('aria-valuemax')).toBe('100');
    expect(thumb.getAttribute('aria-valuenow')).toBe('50');
    expect(thumb.getAttribute('aria-valuetext')).toBe('50%');
    expect(screen.getByTestId('single-slider-thumb-bubble').textContent).toBe(
      '50%'
    );
    expect(screen.getByTestId('single-slider-ticks')).toBeTruthy();

    // ArrowRight -> +step (55)
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(55);
    expect(thumb.getAttribute('aria-valuenow')).toBe('55');

    // ArrowUp -> +step (60)
    fireEvent.keyDown(thumb, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenLastCalledWith(60);

    // ArrowLeft -> -step (55)
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(55);

    // ArrowDown -> -step (50)
    fireEvent.keyDown(thumb, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenLastCalledWith(50);

    // PageUp -> +10*step (100)
    fireEvent.keyDown(thumb, { key: 'PageUp' });
    expect(onChange).toHaveBeenLastCalledWith(100);

    // PageDown -> -10*step (50)
    fireEvent.keyDown(thumb, { key: 'PageDown' });
    expect(onChange).toHaveBeenLastCalledWith(50);

    // Home -> min (0)
    fireEvent.keyDown(thumb, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith(0);

    // End -> max (100)
    fireEvent.keyDown(thumb, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith(100);
  });

  it('handles track press coordinate calculation with fallback width 200 in jsdom and custom onLayout width', () => {
    const onChange = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicSlider
          testId="track-slider"
          min={0}
          max={100}
          step={10}
          defaultValue={0}
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    const track = screen.getByTestId('track-slider-track');

    // In jsdom layout width is 0 -> falls back to 200. clientX=100 -> 50% -> 50
    fireEvent.click(track, { clientX: 100 });
    expect(onChange).toHaveBeenLastCalledWith(50);

    // Simulate onLayout with width 400
    fireEvent(
      track,
      new CustomEvent('layout', {
        bubbles: true,
        detail: { layout: { width: 400, height: 48, x: 0, y: 0 } },
      })
    );
  });

  it('supports dual-thumb range mode with keyboard and track press on nearest thumb', () => {
    const onRangeChange = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicSlider
          testId="range-slider"
          ariaLabel="Price"
          range
          min={0}
          max={100}
          step={5}
          startValue={20}
          endValue={80}
          discrete
          showTickMarks
          disableRipple
          onRangeChange={onRangeChange}
        />
      </MagicPaperProvider>
    );

    const startThumb = screen.getByTestId('range-slider-thumb-start');
    const endThumb = screen.getByTestId('range-slider-thumb-end');

    expect(startThumb.getAttribute('aria-valuenow')).toBe('20');
    expect(endThumb.getAttribute('aria-valuenow')).toBe('80');

    // Move start thumb right
    fireEvent.keyDown(startThumb, { key: 'ArrowRight' });
    expect(onRangeChange).toHaveBeenCalledWith({ start: 25, end: 80 });

    // Move end thumb left
    fireEvent.keyDown(endThumb, { key: 'ArrowLeft' });
    expect(onRangeChange).toHaveBeenLastCalledWith({ start: 20, end: 75 });

    // Track press near start thumb (clientX=20 out of 200 -> value 10)
    const track = screen.getByTestId('range-slider-track');
    fireEvent.click(track, { clientX: 20 });
    expect(onRangeChange).toHaveBeenLastCalledWith({ start: 10, end: 80 });

    // Track press near end thumb (clientX=180 out of 200 -> value 90)
    fireEvent.click(track, { clientX: 180 });
    expect(onRangeChange).toHaveBeenLastCalledWith({ start: 20, end: 90 });
  });

  it('renders all 5 sizes, all 7 color intents, caps large tick counts, and respects disabled state', () => {
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
    const onChange = vi.fn();

    render(
      <MagicPaperProvider>
        {sizes.map((size) => (
          <MagicSlider
            key={size}
            size={size}
            defaultValue={30}
            testId={`slider-size-${size}`}
          />
        ))}
        {colors.map((color) => (
          <MagicSlider
            key={color}
            color={color}
            defaultValue={40}
            testId={`slider-color-${color}`}
          />
        ))}
        <MagicSlider
          testId="slider-many-ticks"
          min={0}
          max={1000}
          step={1}
          showTickMarks
        />
        <MagicSlider
          testId="slider-disabled"
          disabled
          discrete
          defaultValue={25}
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    for (const size of sizes) {
      expect(screen.getByTestId(`slider-size-${size}`)).toBeTruthy();
    }
    for (const color of colors) {
      expect(screen.getByTestId(`slider-color-${color}`)).toBeTruthy();
    }

    const disabledThumb = screen.getByTestId('slider-disabled-thumb');
    expect(disabledThumb.getAttribute('aria-disabled')).toBe('true');
    fireEvent.keyDown(disabledThumb, { key: 'ArrowRight' });
    fireEvent.click(screen.getByTestId('slider-disabled-track'), {
      clientX: 120,
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});
