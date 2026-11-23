import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import type {
  ToolTipPosition,
  ToolTipTouchGestures,
} from '@mono-magic/atomic-design-interfaces';
import MagicToolTip from './MagicToolTip.svelte';

describe('MagicToolTip', () => {
  it('renders trigger and opens controlled tooltip content with message', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(MagicToolTip, {
      props: {
        id: 'help-tip',
        message: 'Save changes to workspace',
        label: 'Hover me',
        ariaLabel: 'Help trigger',
        open: false,
        onOpenChange,
      },
    });

    const root = screen.getByTestId('magic-tool-tip');
    expect(root).toHaveAttribute('id', 'help-tip');
    const trigger = screen.getByTestId('magic-tool-tip-trigger');
    expect(trigger).toHaveTextContent('Hover me');
    expect(trigger).toHaveAttribute('aria-label', 'Help trigger');

    rerender({
      message: 'Save changes to workspace',
      label: 'Hover me',
      open: true,
      onOpenChange,
    });
    expect(screen.getByTestId('magic-tool-tip-content')).toHaveTextContent(
      'Save changes to workspace',
    );
  });

  it('supports all ToolTipPosition values and touchGestures modes', () => {
    const positions: ToolTipPosition[] = [
      'above',
      'below',
      'left',
      'right',
      'before',
      'after',
    ];
    const gestures: ToolTipTouchGestures[] = ['auto', 'on', 'off'];

    for (const position of positions) {
      const { unmount } = render(MagicToolTip, {
        props: {
          message: `Tip ${position}`,
          position,
          testId: `tip-${position}`,
        },
      });
      expect(screen.getByTestId(`tip-${position}`)).toHaveAttribute(
        'data-position',
        position,
      );
      unmount();
    }

    for (const gesture of gestures) {
      const { unmount } = render(MagicToolTip, {
        props: {
          message: `Gesture ${gesture}`,
          touchGestures: gesture,
          showDelay: 100,
          hideDelay: 50,
          testId: `gesture-${gesture}`,
        },
      });
      const el = screen.getByTestId(`gesture-${gesture}`);
      expect(el).toHaveAttribute('data-touch-gestures', gesture);
      expect(el).toHaveAttribute('data-hide-delay', '50');
      unmount();
    }
  });

  it('suppresses tooltip content when disabled', async () => {
    const onOpenChange = vi.fn();
    render(MagicToolTip, {
      props: {
        message: 'Hidden message',
        disabled: true,
        open: true,
        onOpenChange,
      },
    });

    expect(
      screen.queryByTestId('magic-tool-tip-content'),
    ).not.toBeInTheDocument();
    await fireEvent.focus(screen.getByTestId('magic-tool-tip-trigger'));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
