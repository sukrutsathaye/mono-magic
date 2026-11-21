import { createRef, useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AtomicSize,
  ButtonToggleOption,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicButtonToggle } from './button-toggle';

afterEach(cleanup);

const OPTIONS: ButtonToggleOption[] = [
  { value: 'bold', label: 'Bold', icon: 'format_bold' },
  { value: 'italic', label: 'Italic', icon: 'format_italic' },
  { value: 'underline', label: 'Underline', disabled: true },
];

function ControlledMultipleHost({
  onChange,
}: {
  onChange: (val: string[]) => void;
}) {
  const [val, setVal] = useState<string[]>(['bold']);
  return (
    <MagicButtonToggle
      ariaLabel="Controlled formatting"
      selectionMode="multiple"
      options={OPTIONS}
      value={val}
      onChange={(next: string | string[]) => {
        const arr = next as string[];
        setVal(arr);
        onChange(arr);
      }}
    />
  );
}

describe('MagicButtonToggle (React MUI)', () => {
  it('renders options with icons, forwards ref, and updates single selection', () => {
    const onChange = vi.fn();
    const groupRef = createRef<HTMLDivElement>();

    render(
      <MagicMuiThemeProvider>
        <MagicButtonToggle
          ref={groupRef}
          id="fmt-group"
          testId="magic-btn-toggle"
          ariaLabel="Text formatting"
          name="formatting"
          required
          options={OPTIONS}
          defaultValue="bold"
          onChange={onChange}
        />
      </MagicMuiThemeProvider>,
    );

    const group = screen.getByTestId('magic-btn-toggle') as HTMLDivElement;
    expect(groupRef.current).toBe(group);
    expect(group.id).toBe('fmt-group');
    expect(group.getAttribute('aria-label')).toBe('Text formatting');
    expect(group.getAttribute('aria-required')).toBe('true');
    expect(group.getAttribute('data-name')).toBe('formatting');

    const boldBtn = screen.getByRole('button', { name: 'Bold' });
    const italicBtn = screen.getByRole('button', { name: 'Italic' });
    const underlineBtn = screen.getByRole('button', {
      name: 'Underline',
    }) as HTMLButtonElement;

    expect(boldBtn.getAttribute('aria-pressed')).toBe('true');
    expect(underlineBtn.disabled).toBe(true);

    fireEvent.click(italicBtn);
    expect(italicBtn.getAttribute('aria-pressed')).toBe('true');
    expect(onChange).toHaveBeenCalledWith('italic');
  });

  it('supports multiple selection mode in controlled and uncontrolled usage', () => {
    const onControlled = vi.fn();
    const onUncontrolled = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <ControlledMultipleHost onChange={onControlled} />
        <MagicButtonToggle
          ariaLabel="Uncontrolled multi"
          selectionMode="multiple"
          options={OPTIONS}
          onChange={onUncontrolled}
        />
      </MagicMuiThemeProvider>,
    );

    const italicButtons = screen.getAllByRole('button', { name: 'Italic' });
    fireEvent.click(italicButtons[0]);
    expect(onControlled).toHaveBeenCalledWith(['bold', 'italic']);

    fireEvent.click(italicButtons[1]);
    expect(onUncontrolled).toHaveBeenCalledWith(['italic']);
  });

  it('supports vertical, appearance="legacy", hideSelectionIndicator, sizes, colors, and icon-only options', () => {
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
        <MagicButtonToggle
          testId="legacy-vertical"
          ariaLabel="Legacy vertical"
          vertical
          appearance="legacy"
          hideSelectionIndicator
          defaultValue="a"
          sx={[{ m: 1 }]}
          options={[
            { value: 'a', label: '', icon: 'star', ariaLabel: 'Star' },
            { value: 'b', label: 'Two' },
          ]}
        />
        {sizes.map((size) => (
          <MagicButtonToggle
            key={size}
            size={size}
            defaultValue="1"
            ariaLabel={`s-${size}`}
            options={[{ value: '1', label: `size-${size}` }]}
          />
        ))}
        {colors.map((color) => (
          <MagicButtonToggle
            key={color}
            color={color}
            defaultValue="1"
            ariaLabel={`c-${color}`}
            options={[{ value: '1', label: `color-${color}` }]}
          />
        ))}
      </MagicMuiThemeProvider>,
    );

    const legacyGroup = screen.getByTestId('legacy-vertical');
    expect(legacyGroup.classList.contains('MuiToggleButtonGroup-vertical')).toBe(
      true,
    );
    expect(screen.getByRole('button', { name: 'Star' })).toBeTruthy();
  });

  it('supports disabled and disabledInteractive without mutating selection', () => {
    const onChange = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicButtonToggle
          ariaLabel="Native disabled"
          disabled
          defaultValue="bold"
          options={OPTIONS}
          onChange={onChange}
        />
        <MagicButtonToggle
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

    const nativeBold = screen.getByRole('button', {
      name: 'Bold',
    }) as HTMLButtonElement;
    expect(nativeBold.disabled).toBe(true);

    const interactiveGroup = screen.getByTestId('interactive-disabled');
    expect(interactiveGroup.getAttribute('aria-disabled')).toBe('true');

    const intB = screen.getByRole('button', {
      name: 'Int B',
    }) as HTMLButtonElement;
    expect(intB.disabled).toBe(false);
    expect(intB.getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(intB);
    expect(onChange).not.toHaveBeenCalled();
  });
});
