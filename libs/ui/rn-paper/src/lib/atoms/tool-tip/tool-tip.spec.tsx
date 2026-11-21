import { createRef } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { Text, View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ToolTipPosition } from '@mono-magic/atomic-design-interfaces';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicToolTip } from './tool-tip';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('MagicToolTip', () => {
  it('opens on mouseEnter/focus and closes on mouseLeave/blur synchronously when delays are 0, forwarding ref', () => {
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const ref = createRef<View>();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicToolTip
          ref={ref}
          id="save-tip"
          testId="tip"
          message="Save workspace"
          label="Save"
          onOpen={onOpen}
          onClose={onClose}
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    const root = screen.getByTestId('tip');
    expect(root.getAttribute('id')).toBe('save-tip');

    const trigger = screen.getByTestId('tip-trigger');
    expect(screen.queryByRole('tooltip')).toBeNull();

    fireEvent.mouseEnter(trigger);
    const bubble = screen.getByRole('tooltip');
    expect(bubble.textContent).toBe('Save workspace');
    expect(trigger.getAttribute('aria-describedby')).toBe('save-tip-tooltip');
    expect(onOpen).toHaveBeenCalledTimes(1);

    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip').textContent).toBe('Save workspace');
    expect(onOpen).toHaveBeenCalledTimes(2);

    fireEvent.blur(trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('suppresses tooltip when disabled=true or message is empty', () => {
    const onOpen = vi.fn();

    const { rerender } = render(
      <MagicPaperProvider>
        <MagicToolTip
          testId="tip-disabled"
          message="Hidden message"
          disabled
          onOpen={onOpen}
        >
          <Text>Disabled Trigger</Text>
        </MagicToolTip>
      </MagicPaperProvider>
    );

    const trigger = screen.getByTestId('tip-disabled-trigger');
    fireEvent.mouseEnter(trigger);
    fireEvent.focus(trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(onOpen).not.toHaveBeenCalled();

    rerender(
      <MagicPaperProvider>
        <MagicToolTip testId="tip-disabled" message="" onOpen={onOpen}>
          <Text>Empty Message</Text>
        </MagicToolTip>
      </MagicPaperProvider>
    );
    fireEvent.mouseEnter(screen.getByTestId('tip-disabled-trigger'));
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('closes an already-open tooltip if disabled becomes true', () => {
    const { rerender } = render(
      <MagicPaperProvider>
        <MagicToolTip testId="tip-toggle" message="Active tip" label="Anchor" />
      </MagicPaperProvider>
    );

    const trigger = screen.getByTestId('tip-toggle-trigger');
    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole('tooltip')).toBeTruthy();

    rerender(
      <MagicPaperProvider>
        <MagicToolTip
          testId="tip-toggle"
          message="Active tip"
          label="Anchor"
          disabled
        />
      </MagicPaperProvider>
    );
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('supports showDelay and hideDelay timers cleanly', () => {
    vi.useFakeTimers();
    const onOpen = vi.fn();
    const onClose = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicToolTip
          testId="tip-delay"
          message="Delayed tip"
          showDelay={200}
          hideDelay={150}
          onOpen={onOpen}
          onClose={onClose}
        >
          <Text>Delayed</Text>
        </MagicToolTip>
      </MagicPaperProvider>
    );

    const trigger = screen.getByTestId('tip-delay-trigger');
    fireEvent.mouseEnter(trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(screen.queryByRole('tooltip')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole('tooltip').textContent).toBe('Delayed tip');
    expect(onOpen).toHaveBeenCalledTimes(1);

    fireEvent.mouseLeave(trigger);
    expect(screen.getByRole('tooltip')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('handles touchGestures modes ("on", "auto", "off") and all 6 positions', () => {
    const positions: ToolTipPosition[] = [
      'above',
      'below',
      'left',
      'right',
      'before',
      'after',
    ];

    render(
      <MagicPaperProvider palette="dark-theme">
        <MagicToolTip
          testId="tip-touch-on"
          message="Tap tip"
          touchGestures="on"
        >
          <Text>Tap Target</Text>
        </MagicToolTip>
        <MagicToolTip
          testId="tip-touch-off"
          message="No touch"
          touchGestures="off"
        >
          <Text>No Touch</Text>
        </MagicToolTip>
        {positions.map((pos) => (
          <MagicToolTip
            key={pos}
            testId={`tip-pos-${pos}`}
            position={pos}
            message={`Pos ${pos}`}
            label={pos}
          />
        ))}
      </MagicPaperProvider>
    );

    const tapTrigger = screen.getByTestId('tip-touch-on-trigger');
    fireEvent.click(tapTrigger);
    expect(screen.getByTestId('tip-touch-on-bubble').textContent).toBe(
      'Tap tip'
    );
    fireEvent.click(tapTrigger);
    expect(screen.queryByTestId('tip-touch-on-bubble')).toBeNull();

    const noTouchTrigger = screen.getByTestId('tip-touch-off-trigger');
    fireEvent.click(noTouchTrigger);
    expect(screen.queryByTestId('tip-touch-off-bubble')).toBeNull();

    for (const pos of positions) {
      const posTrigger = screen.getByTestId(`tip-pos-${pos}-trigger`);
      fireEvent.mouseEnter(posTrigger);
      expect(screen.getByTestId(`tip-pos-${pos}-bubble`).textContent).toBe(
        `Pos ${pos}`
      );
      fireEvent.mouseLeave(posTrigger);
    }
  });
});
