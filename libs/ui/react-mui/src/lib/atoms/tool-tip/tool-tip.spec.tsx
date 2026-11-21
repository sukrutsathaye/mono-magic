import { createRef } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  ToolTipPosition,
  ToolTipTouchGestures,
} from '@mono-magic/atomic-design-interfaces';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicToolTip } from './tool-tip';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('MagicToolTip (React MUI)', () => {
  it('renders fallback focusable button trigger, forwards ref, and fires onOpen/onClose', () => {
    vi.useFakeTimers();
    const onOpen = vi.fn();
    const onClose = vi.fn();
    const wrapperRef = createRef<HTMLDivElement>();

    render(
      <MagicMuiThemeProvider>
        <MagicToolTip
          ref={wrapperRef}
          id="help-tip"
          testId="magic-tip"
          ariaLabel="Help trigger"
          message="Helpful details"
          label="Hover me"
          showDelay={0}
          hideDelay={0}
          onOpen={onOpen}
          onClose={onClose}
        />
      </MagicMuiThemeProvider>,
    );

    const wrapper = screen.getByTestId('magic-tip');
    expect(wrapperRef.current).toBe(wrapper);
    expect(wrapper.id).toBe('help-tip');
    expect(wrapper.getAttribute('aria-label')).toBe('Help trigger');

    const btn = screen.getByTestId('magic-tip-trigger');
    expect(btn.textContent).toContain('Hover me');

    fireEvent.mouseOver(wrapper);
    act(() => {
      vi.runAllTimers();
    });
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(document.body.textContent).toContain('Helpful details');

    fireEvent.mouseLeave(wrapper);
    act(() => {
      vi.runAllTimers();
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders projected children instead of fallback button', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicToolTip message="Projected tip" label="Ignored">
          <button type="button" data-testid="custom-trigger">
            Custom Trigger
          </button>
        </MagicToolTip>
      </MagicMuiThemeProvider>,
    );

    expect(screen.getByTestId('custom-trigger').textContent).toBe(
      'Custom Trigger',
    );
    expect(screen.queryByText('Ignored')).toBeNull();
  });

  it('supports all 6 ToolTipPosition values and all touchGesture modes', () => {
    const positions: ToolTipPosition[] = [
      'above',
      'below',
      'left',
      'right',
      'before',
      'after',
    ];
    const gestures: ToolTipTouchGestures[] = ['auto', 'on', 'off'];

    render(
      <MagicMuiThemeProvider>
        {positions.map((pos) => (
          <MagicToolTip
            key={pos}
            position={pos}
            message={`Tip ${pos}`}
            label={pos}
            testId={`pos-${pos}`}
          />
        ))}
        {gestures.map((gesture) => (
          <MagicToolTip
            key={gesture}
            touchGestures={gesture}
            message={`Gesture ${gesture}`}
            label={`g-${gesture}`}
            testId={`gesture-${gesture}`}
          />
        ))}
      </MagicMuiThemeProvider>,
    );

    for (const pos of positions) {
      expect(screen.getByTestId(`pos-${pos}`)).toBeTruthy();
    }
    for (const gesture of gestures) {
      expect(screen.getByTestId(`gesture-${gesture}`)).toBeTruthy();
    }
  });

  it('suppresses tooltip when disabled or message is empty, and forwards sx array', () => {
    vi.useFakeTimers();
    const onOpen = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicToolTip
          testId="disabled-tip"
          message="Should not show"
          disabled
          sx={[{ margin: 1 }]}
          onOpen={onOpen}
        />
        <MagicToolTip
          testId="empty-msg-tip"
          message=""
          label="Empty message"
          onOpen={onOpen}
        />
      </MagicMuiThemeProvider>,
    );

    fireEvent.mouseOver(screen.getByTestId('disabled-tip'));
    fireEvent.mouseOver(screen.getByTestId('empty-msg-tip'));
    act(() => {
      vi.runAllTimers();
    });

    expect(onOpen).not.toHaveBeenCalled();
    expect(document.body.textContent).not.toContain('Should not show');
  });
});
