import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Text, View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicSlideToggle } from './slide-toggle';

afterEach(cleanup);

describe('MagicSlideToggle', () => {
  it('supports uncontrolled toggling, fires onChange and onToggleChange, and forwards ref', () => {
    const onChange = vi.fn();
    const onToggleChange = vi.fn();
    const ref = createRef<View>();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicSlideToggle
          ref={ref}
          id="notif-switch"
          testId="switch-main"
          label="Notifications"
          onChange={onChange}
          onToggleChange={onToggleChange}
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    const toggle = screen.getByRole('switch', { name: 'Notifications' });
    expect(toggle.getAttribute('id')).toBe('notif-switch');
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    expect(toggle.textContent).toContain('close');

    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect(toggle.textContent).toContain('check');
    expect(onChange).toHaveBeenCalledWith(true);
    expect(onToggleChange).toHaveBeenCalledTimes(1);
  });

  it('supports controlled mode without mutating checked internally', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MagicPaperProvider>
        <MagicSlideToggle
          testId="ctrl-switch"
          label="Controlled"
          checked={false}
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    const toggle = screen.getByRole('switch', { name: 'Controlled' });
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(toggle.getAttribute('aria-checked')).toBe('false');

    rerender(
      <MagicPaperProvider>
        <MagicSlideToggle
          testId="ctrl-switch"
          label="Controlled"
          checked={true}
          onChange={onChange}
        />
      </MagicPaperProvider>
    );
    expect(toggle.getAttribute('aria-checked')).toBe('true');
  });

  it('supports hideIcon, labelPosition="before", required, and string/ReactNode children', () => {
    render(
      <MagicPaperProvider>
        <MagicSlideToggle
          testId="sw-hide-icon"
          label="No Icon"
          defaultChecked={false}
          hideIcon
          labelPosition="before"
          required
        />
        <MagicSlideToggle testId="sw-str-child" required>
          String Child
        </MagicSlideToggle>
        <MagicSlideToggle testId="sw-node-child" ariaLabel="Custom Node">
          <Text>Node Label</Text>
        </MagicSlideToggle>
        <MagicSlideToggle testId="sw-no-label" ariaLabel="Bare Switch" />
      </MagicPaperProvider>
    );

    const noIcon = screen.getByTestId('sw-hide-icon');
    expect(noIcon.getAttribute('aria-required')).toBe('true');
    expect(noIcon.textContent).toContain('No Icon *');
    expect(noIcon.textContent).not.toContain('check');
    expect(noIcon.textContent).not.toContain('close');
    expect(getComputedStyle(noIcon).flexDirection).toBe('row-reverse');

    expect(screen.getByTestId('sw-str-child').textContent).toContain(
      'String Child *'
    );
    expect(screen.getByTestId('sw-node-child').textContent).toContain(
      'Node Label'
    );
    expect(
      screen.getByTestId('sw-no-label').getAttribute('aria-label')
    ).toBe('Bare Switch');
  });

  it('blocks toggling in disabled and disabledInteractive states', () => {
    const onChange = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicSlideToggle
          testId="sw-dis-off"
          label="Disabled Off"
          disabled
          onChange={onChange}
        />
        <MagicSlideToggle
          testId="sw-dis-on"
          label="Disabled On"
          disabled
          defaultChecked
          onChange={onChange}
        />
        <MagicSlideToggle
          testId="sw-dis-int"
          label="Disabled Interactive"
          disabled
          disabledInteractive
          defaultChecked
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    fireEvent.click(screen.getByTestId('sw-dis-off'));
    fireEvent.click(screen.getByTestId('sw-dis-on'));
    const intToggle = screen.getByTestId('sw-dis-int');
    expect(intToggle.getAttribute('aria-disabled')).toBe('true');
    expect(intToggle.getAttribute('tabindex')).toBe('0');
    fireEvent.click(intToggle);
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
          <MagicSlideToggle
            key={size}
            testId={`size-${size}`}
            size={size}
            defaultChecked
            label={`Size-${size}`}
          />
        ))}
        {colors.map((color) => (
          <MagicSlideToggle
            key={color}
            testId={`color-${color}`}
            color={color}
            defaultChecked
            label={`Color-${color}`}
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
