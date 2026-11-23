import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import type {
  AtomicSize,
  BadgePosition,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import MagicBadge from './MagicBadge.svelte';

describe('MagicBadge', () => {
  it('renders badge content, label, and icon with default attributes', () => {
    render(MagicBadge, {
      props: {
        id: 'notif-badge',
        content: 7,
        label: 'Inbox',
        icon: '✉',
        description: '7 unread messages',
      },
    });

    const root = screen.getByTestId('magic-badge');
    expect(root).toHaveAttribute('id', 'notif-badge');
    expect(root).toHaveAttribute('data-overlap', 'true');
    expect(screen.getByText('Inbox')).toBeInTheDocument();
    expect(screen.getByTestId('magic-badge-icon')).toHaveTextContent('✉');

    const indicator = screen.getByTestId('magic-badge-indicator');
    expect(indicator).toHaveTextContent('7');
    expect(indicator).toHaveAttribute('role', 'status');
    expect(indicator).toHaveAttribute('aria-label', '7 unread messages');
  });

  it('renders a dot badge when content is omitted and hides when hidden=true', () => {
    const { rerender } = render(MagicBadge, {
      props: { label: 'Status', ariaLabel: 'Online status' },
    });

    const indicator = screen.getByTestId('magic-badge-indicator');
    expect(indicator).toHaveTextContent('');
    expect(indicator).toHaveAttribute('aria-label', 'Online status');

    rerender({ label: 'Status', hidden: true });
    expect(screen.queryByTestId('magic-badge-indicator')).not.toBeInTheDocument();
  });

  it('supports all ColorIntents, AtomicSizes, positions, overlap=false, and disabled', () => {
    const colors: ColorIntent[] = [
      'primary',
      'secondary',
      'tertiary',
      'success',
      'warning',
      'error',
      'neutral',
    ];
    const sizes: AtomicSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    const positions: BadgePosition[] = [
      'above after',
      'above before',
      'below after',
      'below before',
      'above',
      'below',
      'before',
      'after',
    ];

    for (const color of colors) {
      const { unmount } = render(MagicBadge, {
        props: { content: '9+', color, testId: `badge-${color}` },
      });
      expect(screen.getByTestId(`badge-${color}-indicator`)).toHaveClass(
        `bg-magic-${color}`,
      );
      unmount();
    }

    for (const size of sizes) {
      const { unmount } = render(MagicBadge, {
        props: { content: 3, size, testId: `badge-${size}` },
      });
      expect(screen.getByTestId(`badge-${size}-indicator`)).toBeInTheDocument();
      unmount();
    }

    for (const position of positions) {
      const { unmount } = render(MagicBadge, {
        props: {
          content: 1,
          label: 'Item',
          position,
          overlap: false,
          disabled: true,
          testId: `badge-pos`,
        },
      });
      const root = screen.getByTestId('badge-pos');
      expect(root).toHaveAttribute('data-position', position);
      expect(root).toHaveAttribute('data-overlap', 'false');
      expect(root).toHaveAttribute('data-disabled', 'true');
      unmount();
    }
  });
});
