import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicButtonToggle } from './button-toggle';

afterEach(cleanup);

const ALIGN_OPTIONS = [
  { value: 'left', label: 'Left', icon: 'format_align_left' },
  { value: 'center', label: 'Center', icon: 'format_align_center' },
  { value: 'right', label: 'Right', ariaLabel: 'Align Right' },
  { value: 'justify', label: 'Justify', disabled: true },
];

describe('MagicButtonToggle', () => {
  it('supports single-select uncontrolled mode, icons, checkmark indicator, and ref forwarding', () => {
    const onChange = vi.fn();
    const ref = createRef<View>();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicButtonToggle
          ref={ref}
          id="align-toggle"
          testId="bt-single"
          ariaLabel="Alignment"
          options={ALIGN_OPTIONS}
          defaultValue="left"
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    const group = screen.getByRole('radiogroup', { name: 'Alignment' });
    expect(group.getAttribute('id')).toBe('align-toggle');

    const left = screen.getByRole('radio', { name: 'Left' });
    const center = screen.getByRole('radio', { name: 'Center' });
    const right = screen.getByRole('radio', { name: 'Align Right' });
    const justify = screen.getByRole('radio', { name: 'Justify' });

    expect(left.getAttribute('aria-checked')).toBe('true');
    expect(left.textContent).toContain('check');
    expect(left.textContent).toContain('format_align_left');
    expect(justify.getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(center);
    expect(onChange).toHaveBeenCalledWith('center');
    expect(center.getAttribute('aria-checked')).toBe('true');
    expect(left.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(right);
    expect(onChange).toHaveBeenCalledWith('right');

    fireEvent.click(justify);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('supports multiple selection mode (add and remove items) and default empty selection', () => {
    const onChange = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicButtonToggle
          testId="bt-multi"
          ariaLabel="Formatting"
          selectionMode="multiple"
          options={[
            { value: 'bold', label: 'Bold' },
            { value: 'italic', label: 'Italic' },
            { value: 'underline', label: 'Underline' },
          ]}
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    const bold = screen.getByRole('button', { name: 'Bold' });
    const italic = screen.getByRole('button', { name: 'Italic' });

    expect(bold.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(bold);
    expect(onChange).toHaveBeenLastCalledWith(['bold']);
    expect(bold.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(italic);
    expect(onChange).toHaveBeenLastCalledWith(['bold', 'italic']);
    expect(italic.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(bold);
    expect(onChange).toHaveBeenLastCalledWith(['italic']);
    expect(bold.getAttribute('aria-pressed')).toBe('false');
  });

  it('supports controlled mode without mutating state internally', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MagicPaperProvider>
        <MagicButtonToggle
          testId="bt-ctrl"
          options={[
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ]}
          value="a"
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    fireEvent.click(screen.getByRole('radio', { name: 'B' }));
    expect(onChange).toHaveBeenCalledWith('b');
    expect(
      screen.getByRole('radio', { name: 'A' }).getAttribute('aria-checked')
    ).toBe('true');

    rerender(
      <MagicPaperProvider>
        <MagicButtonToggle
          testId="bt-ctrl"
          options={[
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ]}
          value="b"
          onChange={onChange}
        />
      </MagicPaperProvider>
    );
    expect(
      screen.getByRole('radio', { name: 'B' }).getAttribute('aria-checked')
    ).toBe('true');
  });

  it('supports vertical layout, legacy appearance, hideSelectionIndicator, required, and icon-only options', () => {
    render(
      <MagicPaperProvider>
        <MagicButtonToggle
          testId="bt-vert"
          vertical
          appearance="legacy"
          hideSelectionIndicator
          required
          defaultValue="up"
          options={[
            { value: 'up', label: 'Up' },
            { value: 'down', label: '', icon: 'arrow_downward', ariaLabel: 'Down' },
          ]}
        />
      </MagicPaperProvider>
    );

    const group = screen.getByTestId('bt-vert');
    expect(getComputedStyle(group).flexDirection).toBe('column');
    expect(group.getAttribute('aria-required')).toBe('true');

    const up = screen.getByTestId('bt-vert-option-0');
    expect(up.textContent).not.toContain('check');
    expect(screen.getByTestId('bt-vert-option-1').getAttribute('aria-label')).toBe(
      'Down'
    );
  });

  it('blocks selection when disabled or disabledInteractive', () => {
    const onChange = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicButtonToggle
          testId="bt-dis"
          disabled
          defaultValue="a"
          options={[
            { value: 'a', label: 'One' },
            { value: 'b', label: 'Two' },
          ]}
          onChange={onChange}
        />
        <MagicButtonToggle
          testId="bt-dis-int"
          disabled
          disabledInteractive
          defaultValue="a"
          options={[
            { value: 'a', label: 'Alpha' },
            { value: 'b', label: 'Beta' },
          ]}
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    fireEvent.click(screen.getByTestId('bt-dis-option-1'));
    const intBeta = screen.getByTestId('bt-dis-int-option-1');
    expect(intBeta.getAttribute('aria-disabled')).toBe('true');
    expect(intBeta.getAttribute('tabindex')).toBe('0');
    fireEvent.click(intBeta);
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
          <MagicButtonToggle
            key={size}
            testId={`size-${size}`}
            size={size}
            value="x"
            options={[{ value: 'x', label: `Size-${size}` }]}
          />
        ))}
        {colors.map((color) => (
          <MagicButtonToggle
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
