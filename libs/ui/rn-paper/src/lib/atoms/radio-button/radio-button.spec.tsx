import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicRadioButton } from './radio-button';

afterEach(cleanup);

const SAMPLE_OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma', disabled: true },
];

describe('MagicRadioButton', () => {
  it('supports uncontrolled mode, fires onChange, ignores disabled option, and forwards ref', () => {
    const onChange = vi.fn();
    const ref = createRef<View>();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicRadioButton
          ref={ref}
          id="tier-radio"
          testId="radio-group"
          ariaLabel="Tier selection"
          options={SAMPLE_OPTIONS}
          defaultValue="a"
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    const group = screen.getByRole('radiogroup', { name: 'Tier selection' });
    expect(group.getAttribute('id')).toBe('tier-radio');

    const alpha = screen.getByRole('radio', { name: 'Alpha' });
    const beta = screen.getByRole('radio', { name: 'Beta' });
    const gamma = screen.getByRole('radio', { name: 'Gamma' });

    expect(alpha.getAttribute('aria-checked')).toBe('true');
    expect(beta.getAttribute('aria-checked')).toBe('false');
    expect(gamma.getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(beta);
    expect(onChange).toHaveBeenCalledWith('b');
    expect(beta.getAttribute('aria-checked')).toBe('true');
    expect(alpha.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(gamma);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('supports controlled mode without mutating state internally', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MagicPaperProvider>
        <MagicRadioButton
          testId="ctrl-radio"
          options={SAMPLE_OPTIONS}
          value="a"
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    const beta = screen.getByRole('radio', { name: 'Beta' });
    fireEvent.click(beta);
    expect(onChange).toHaveBeenCalledWith('b');
    expect(
      screen.getByRole('radio', { name: 'Alpha' }).getAttribute('aria-checked')
    ).toBe('true');

    rerender(
      <MagicPaperProvider>
        <MagicRadioButton
          testId="ctrl-radio"
          options={SAMPLE_OPTIONS}
          value="b"
          onChange={onChange}
        />
      </MagicPaperProvider>
    );
    expect(
      screen.getByRole('radio', { name: 'Beta' }).getAttribute('aria-checked')
    ).toBe('true');
  });

  it('supports vertical layout, labelPosition="before", per-option labelPosition, and required indicator', () => {
    render(
      <MagicPaperProvider>
        <MagicRadioButton
          testId="vert-radio"
          vertical
          labelPosition="before"
          required
          options={[
            { value: '1', label: 'First' },
            {
              value: '2',
              label: 'Second',
              labelPosition: 'after',
              required: false,
            },
          ]}
          defaultValue="1"
        />
      </MagicPaperProvider>
    );

    const group = screen.getByTestId('vert-radio');
    expect(group.getAttribute('aria-required')).toBe('true');
    expect(getComputedStyle(group).flexDirection).toBe('column');
    expect(screen.getByTestId('vert-radio-option-0').textContent).toContain(
      'First *'
    );
    expect(screen.getByTestId('vert-radio-option-1').textContent).toBe(
      'Second'
    );
  });

  it('blocks selection in disabled and disabledInteractive states', () => {
    const onChange = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicRadioButton
          testId="dis-radio"
          options={SAMPLE_OPTIONS}
          defaultValue="a"
          disabled
          onChange={onChange}
        />
        <MagicRadioButton
          testId="dis-int-radio"
          options={SAMPLE_OPTIONS}
          defaultValue="a"
          disabled
          disabledInteractive
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    fireEvent.click(screen.getByTestId('dis-radio-option-1'));
    const intOpt = screen.getByTestId('dis-int-radio-option-1');
    expect(intOpt.getAttribute('aria-disabled')).toBe('true');
    expect(intOpt.getAttribute('tabindex')).toBe('0');
    fireEvent.click(intOpt);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders all 5 sizes and all 7 semantic color intents', () => {
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
        {sizes.map((size) => (
          <MagicRadioButton
            key={size}
            testId={`size-${size}`}
            size={size}
            value="x"
            options={[{ value: 'x', label: `Size-${size}` }]}
          />
        ))}
        {colors.map((color) => (
          <MagicRadioButton
            key={color}
            testId={`color-${color}`}
            color={color}
            value="x"
            options={[{ value: 'x', label: `Color-${color}` }]}
          />
        ))}
      </MagicPaperProvider>
    );

    for (const size of sizes) {
      expect(screen.getByTestId(`size-${size}`).textContent).toContain(
        `Size-${size}`
      );
    }
    for (const color of colors) {
      expect(screen.getByTestId(`color-${color}`).textContent).toContain(
        `Color-${color}`
      );
    }
  });
});
