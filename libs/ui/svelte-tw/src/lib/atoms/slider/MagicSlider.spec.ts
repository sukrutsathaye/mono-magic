import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import MagicSlider from './MagicSlider.svelte';

describe('MagicSlider', () => {
  it('renders single slider with discrete badge, tick marks, and displayWith formatter', async () => {
    const onchange = vi.fn();
    render(MagicSlider, {
      props: {
        id: 'volume-slider',
        min: 0,
        max: 100,
        step: 10,
        value: 40,
        discrete: true,
        showTickMarks: true,
        displayWith: (v: number) => `${v}%`,
        ariaLabel: 'Volume',
        onchange,
      },
    });

    const root = screen.getByTestId('magic-slider');
    expect(root).toHaveAttribute('id', 'volume-slider');
    expect(root).toHaveAttribute('data-range', 'false');
    expect(screen.getByTestId('magic-slider-value-badge')).toHaveTextContent(
      '40%',
    );
    expect(screen.getByTestId('magic-slider-ticks')).toBeInTheDocument();

    const input = screen.getByTestId('magic-slider-input');
    await fireEvent.input(input, { target: { value: '70' } });
    expect(onchange).toHaveBeenCalledWith(70);
    expect(screen.getByTestId('magic-slider-value-badge')).toHaveTextContent(
      '70%',
    );
  });

  it('renders range slider and clamps start/end values without crossing', async () => {
    const onrangechange = vi.fn();
    render(MagicSlider, {
      props: {
        range: true,
        min: 0,
        max: 100,
        step: 5,
        startValue: 20,
        endValue: 80,
        discrete: true,
        color: 'secondary',
        size: 'lg',
        onrangechange,
      },
    });

    expect(screen.getByTestId('magic-slider-start-badge')).toHaveTextContent(
      '20',
    );
    expect(screen.getByTestId('magic-slider-end-badge')).toHaveTextContent(
      '80',
    );

    await fireEvent.input(screen.getByTestId('magic-slider-start-input'), {
      target: { value: '35' },
    });
    expect(onrangechange).toHaveBeenCalledWith({ startValue: 35, endValue: 80 });

    await fireEvent.input(screen.getByTestId('magic-slider-end-input'), {
      target: { value: '60' },
    });
    expect(onrangechange).toHaveBeenCalledWith({ startValue: 35, endValue: 60 });
  });

  it('ignores input updates when disabled', async () => {
    const onchange = vi.fn();
    render(MagicSlider, {
      props: {
        value: 50,
        disabled: true,
        disableRipple: true,
        onchange,
      },
    });

    await fireEvent.input(screen.getByTestId('magic-slider-input'), {
      target: { value: '90' },
    });
    expect(onchange).not.toHaveBeenCalled();
  });
});
