import { createRef, useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicSlideToggle } from './slide-toggle';

afterEach(cleanup);

function ControlledToggle({
  onChange,
}: {
  onChange: (checked: boolean) => void;
}) {
  const [checked, setChecked] = useState(true);
  return (
    <MagicSlideToggle
      label="Controlled Switch"
      checked={checked}
      onChange={(next: boolean) => {
        setChecked(next);
        onChange(next);
      }}
    />
  );
}

describe('MagicSlideToggle (React MUI)', () => {
  it('renders label, forwards ref, and toggles checked state in uncontrolled mode', () => {
    const onChange = vi.fn();
    const onToggleChange = vi.fn();
    const labelRef = createRef<HTMLLabelElement>();

    render(
      <MagicMuiThemeProvider>
        <MagicSlideToggle
          ref={labelRef}
          id="notify-switch"
          testId="magic-switch"
          name="notify"
          label="Notifications"
          onChange={onChange}
          onToggleChange={onToggleChange}
        />
      </MagicMuiThemeProvider>,
    );

    const root = screen.getByTestId('magic-switch') as HTMLLabelElement;
    expect(labelRef.current).toBe(root);
    expect(root.id).toBe('notify-switch');
    expect(root.textContent).toContain('Notifications');

    const switchInput = screen.getByRole('switch') as HTMLInputElement;
    expect(switchInput.checked).toBe(false);
    expect(switchInput.name).toBe('notify');

    fireEvent.click(switchInput);
    expect(switchInput.checked).toBe(true);
    expect(onToggleChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('supports controlled mode, children overriding label, and bare switch without label', () => {
    const onChange = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <ControlledToggle onChange={onChange} />
        <MagicSlideToggle label="Ignored Fallback">
          <span data-testid="rich-label">Projected Label</span>
        </MagicSlideToggle>
        <MagicSlideToggle
          id="bare-switch"
          testId="bare-switch"
          ariaLabel="Bare toggle"
          sx={[{ ml: 1 }]}
        />
      </MagicMuiThemeProvider>,
    );

    const controlled = screen.getByRole('switch', {
      name: 'Controlled Switch',
    }) as HTMLInputElement;
    expect(controlled.checked).toBe(true);
    fireEvent.click(controlled);
    expect(controlled.checked).toBe(false);
    expect(onChange).toHaveBeenCalledWith(false);

    expect(screen.getByTestId('rich-label').textContent).toBe(
      'Projected Label',
    );
    expect(screen.queryByText('Ignored Fallback')).toBeNull();

    const bare = screen.getByTestId('bare-switch');
    expect(bare).toBeTruthy();
    const bareInput = screen.getByRole('switch', { name: 'Bare toggle' });
    expect(bareInput.id).toBe('bare-switch');
  });

  it('supports hideIcon, labelPosition="before", required, disableRipple, all 5 sizes, and all 7 colors', () => {
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
        <MagicSlideToggle
          testId="before-toggle"
          label="Before label"
          labelPosition="before"
          hideIcon
          required
          disableRipple
          defaultChecked
        />
        {sizes.map((size) => (
          <MagicSlideToggle
            key={size}
            size={size}
            label={`s-${size}`}
            defaultChecked
          />
        ))}
        {colors.map((color) => (
          <MagicSlideToggle
            key={color}
            color={color}
            label={`c-${color}`}
            defaultChecked
          />
        ))}
      </MagicMuiThemeProvider>,
    );

    const beforeToggle = screen.getByTestId('before-toggle');
    expect(
      beforeToggle.classList.contains('MuiFormControlLabel-labelPlacementStart'),
    ).toBe(true);

    const beforeInput = screen.getByRole('switch', { name: 'Before label' });
    expect(beforeInput.getAttribute('aria-required')).toBe('true');
  });

  it('supports disabled and disabledInteractive without mutating checked state', () => {
    const onChange = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicSlideToggle
          label="Native Disabled"
          disabled
          defaultChecked
          onChange={onChange}
        />
        <MagicSlideToggle
          label="Interactive Disabled"
          disabled
          disabledInteractive
          defaultChecked={false}
          onChange={onChange}
        />
        <MagicSlideToggle
          label="Interactive Disabled Checked"
          disabled
          disabledInteractive
          hideIcon
          defaultChecked
          onChange={onChange}
        />
      </MagicMuiThemeProvider>,
    );

    const nativeSwitch = screen.getByRole('switch', {
      name: 'Native Disabled',
    }) as HTMLInputElement;
    expect(nativeSwitch.disabled).toBe(true);

    const interactiveSwitch = screen.getByRole('switch', {
      name: 'Interactive Disabled',
    }) as HTMLInputElement;
    expect(interactiveSwitch.disabled).toBe(false);
    expect(interactiveSwitch.getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(interactiveSwitch);
    expect(interactiveSwitch.checked).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });
});
