import { createRef, useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
  RadioOption,
} from '@mono-magic/atomic-design-interfaces';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicRadioButton } from './radio-button';

afterEach(cleanup);

const OPTIONS: RadioOption[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma', disabled: true },
];

function ControlledHost({ onChange }: { onChange: (val: string) => void }) {
  const [value, setValue] = useState('a');
  return (
    <MagicRadioButton
      ariaLabel="Controlled radios"
      options={OPTIONS}
      value={value}
      onChange={(next: string) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

describe('MagicRadioButton (React MUI)', () => {
  it('renders options, forwards ref, and updates selection in uncontrolled mode', () => {
    const onChange = vi.fn();
    const groupRef = createRef<HTMLDivElement>();

    render(
      <MagicMuiThemeProvider>
        <MagicRadioButton
          ref={groupRef}
          id="tier-group"
          testId="radio-group"
          ariaLabel="Choose tier"
          name="tier"
          options={OPTIONS}
          defaultValue="a"
          onChange={onChange}
        />
      </MagicMuiThemeProvider>,
    );

    const group = screen.getByTestId('radio-group') as HTMLDivElement;
    expect(groupRef.current).toBe(group);
    expect(group.id).toBe('tier-group');
    expect(group.getAttribute('aria-label')).toBe('Choose tier');

    const alpha = screen.getByRole('radio', { name: 'Alpha' }) as HTMLInputElement;
    const beta = screen.getByRole('radio', { name: 'Beta' }) as HTMLInputElement;
    const gamma = screen.getByRole('radio', { name: 'Gamma' }) as HTMLInputElement;

    expect(alpha.checked).toBe(true);
    expect(alpha.name).toBe('tier');
    expect(gamma.disabled).toBe(true);

    fireEvent.click(beta);
    expect(beta.checked).toBe(true);
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('supports controlled value updates and generic non-string values', () => {
    const onControlledChange = vi.fn();
    const onNumericChange = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <ControlledHost onChange={onControlledChange} />
        <MagicRadioButton<number>
          ariaLabel="Numeric radios"
          defaultValue={10}
          options={[
            { value: 10, label: 'Ten' },
            { value: 20, label: 'Twenty' },
          ]}
          onChange={onNumericChange}
        />
      </MagicMuiThemeProvider>,
    );

    const beta = screen.getByRole('radio', { name: 'Beta' }) as HTMLInputElement;
    fireEvent.click(beta);
    expect(beta.checked).toBe(true);
    expect(onControlledChange).toHaveBeenCalledWith('b');

    const twenty = screen.getByRole('radio', { name: 'Twenty' }) as HTMLInputElement;
    fireEvent.click(twenty);
    expect(twenty.checked).toBe(true);
    expect(onNumericChange).toHaveBeenCalledWith(20);
  });

  it('supports vertical layout, labelPosition="before", required, disableRipple, sizes, and colors', () => {
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
        <MagicRadioButton
          testId="vertical-group"
          ariaLabel="Vertical"
          vertical
          required
          disableRipple
          labelPosition="before"
          sx={[{ p: 1 }]}
          options={[
            { value: 'x', label: 'X-opt' },
            { value: 'y', label: 'Y-opt', labelPosition: 'after', required: false },
          ]}
        />
        {sizes.map((size) => (
          <MagicRadioButton
            key={size}
            size={size}
            ariaLabel={`size-${size}`}
            options={[{ value: '1', label: `s-${size}` }]}
          />
        ))}
        {colors.map((color) => (
          <MagicRadioButton
            key={color}
            color={color}
            defaultValue="1"
            ariaLabel={`color-${color}`}
            options={[{ value: '1', label: `c-${color}` }]}
          />
        ))}
      </MagicMuiThemeProvider>,
    );

    const verticalGroup = screen.getByTestId('vertical-group');
    expect(verticalGroup.getAttribute('aria-required')).toBe('true');
    expect(
      verticalGroup.querySelector('.MuiFormControlLabel-labelPlacementStart'),
    ).toBeTruthy();
    expect(
      verticalGroup.querySelector('.MuiFormControlLabel-labelPlacementEnd'),
    ).toBeTruthy();
  });

  it('supports disabled and disabledInteractive without mutating selection', () => {
    const onChange = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicRadioButton
          testId="native-disabled"
          ariaLabel="Native disabled"
          disabled
          defaultValue="a"
          options={OPTIONS}
          onChange={onChange}
        />
        <MagicRadioButton
          testId="interactive-disabled"
          ariaLabel="Interactive disabled"
          disabled
          disabledInteractive
          defaultValue="a"
          options={[
            { value: 'a', label: 'Int A' },
            { value: 'b', label: 'Int B' },
          ]}
          onChange={onChange}
        />
      </MagicMuiThemeProvider>,
    );

    const nativeAlpha = screen.getByRole('radio', {
      name: 'Alpha',
    }) as HTMLInputElement;
    expect(nativeAlpha.disabled).toBe(true);

    const intGroup = screen.getByTestId('interactive-disabled');
    expect(intGroup.getAttribute('aria-disabled')).toBe('true');

    const intB = screen.getByRole('radio', { name: 'Int B' }) as HTMLInputElement;
    expect(intB.disabled).toBe(false);
    expect(intB.getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(intB);
    expect(intB.checked).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });
});
