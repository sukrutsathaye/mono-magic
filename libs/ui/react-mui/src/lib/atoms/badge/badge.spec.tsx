import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type {
  AtomicSize,
  BadgePosition,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicBadge } from './badge';

afterEach(cleanup);

describe('MagicBadge (React MUI)', () => {
  it('renders badge content, label fallback, and forwards React 19 ref', () => {
    const badgeRef = createRef<HTMLSpanElement>();

    render(
      <MagicMuiThemeProvider>
        <MagicBadge
          ref={badgeRef}
          id="inbox-badge"
          testId="magic-badge"
          content={4}
          label="Messages"
          description="4 unread messages"
        />
      </MagicMuiThemeProvider>,
    );

    const root = screen.getByTestId('magic-badge') as HTMLSpanElement;
    expect(badgeRef.current).toBe(root);
    expect(root.id).toBe('inbox-badge');
    expect(root.getAttribute('aria-label')).toBe('4 unread messages');
    expect(root.textContent).toContain('Messages');
    expect(root.textContent).toContain('4');
  });

  it('renders icon fallback (string or ReactNode) and prefers children over fallbacks', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicBadge testId="icon-badge" icon="notifications" content={2} />
        <MagicBadge
          testId="node-icon-badge"
          icon={<span data-testid="custom-icon">!</span>}
          content={0}
        />
        <MagicBadge testId="children-badge" icon="mail" label="Fallback" content={5}>
          <span data-testid="projected">Inbox</span>
        </MagicBadge>
      </MagicMuiThemeProvider>,
    );

    expect(screen.getByTestId('icon-badge').textContent).toContain('notifications');
    expect(screen.getByTestId('custom-icon').textContent).toBe('!');
    expect(screen.getByTestId('node-icon-badge').textContent).toContain('0');

    const childrenBadge = screen.getByTestId('children-badge');
    expect(screen.getByTestId('projected').textContent).toBe('Inbox');
    expect(childrenBadge.textContent).not.toContain('Fallback');
  });

  it('supports all 5 sizes and all 7 semantic color intents', () => {
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
        {sizes.map((size) => (
          <MagicBadge
            key={size}
            size={size}
            content={1}
            icon="home"
            testId={`size-${size}`}
          />
        ))}
        {colors.map((color) => (
          <MagicBadge
            key={color}
            color={color}
            content={2}
            icon="star"
            testId={`color-${color}`}
          />
        ))}
      </MagicMuiThemeProvider>,
    );

    for (const size of sizes) {
      expect(screen.getByTestId(`size-${size}`)).toBeTruthy();
    }
    for (const color of colors) {
      expect(screen.getByTestId(`color-${color}`)).toBeTruthy();
    }
  });

  it('supports all 8 positions, overlap=false, dot variant, hidden, disabled, sx, and slotProps', () => {
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

    render(
      <MagicMuiThemeProvider>
        {positions.map((position) => (
          <MagicBadge
            key={position}
            position={position}
            content={9}
            overlap={false}
            testId={`pos-${position}`}
          >
            <span>Target</span>
          </MagicBadge>
        ))}
        <MagicBadge testId="dot-badge" icon="chat" />
        <MagicBadge testId="hidden-badge" content={3} hidden icon="mail" />
        <MagicBadge
          testId="disabled-badge"
          content={3}
          disabled
          ariaLabel="Disabled notifications"
          sx={[{ margin: 1 }]}
          slotProps={{
            root: { title: 'Root title' },
            badge: { sx: [{ letterSpacing: 1 }] },
          }}
        />
      </MagicMuiThemeProvider>,
    );

    for (const position of positions) {
      expect(screen.getByTestId(`pos-${position}`)).toBeTruthy();
    }

    const dotBadge = screen.getByTestId('dot-badge');
    expect(dotBadge.querySelector('.MuiBadge-dot')).toBeTruthy();

    const hiddenBubble = screen
      .getByTestId('hidden-badge')
      .querySelector('.MuiBadge-invisible');
    expect(hiddenBubble).toBeTruthy();

    const disabledBadge = screen.getByTestId('disabled-badge');
    expect(disabledBadge.getAttribute('aria-label')).toBe(
      'Disabled notifications',
    );
    expect(disabledBadge.getAttribute('title')).toBe('Root title');
    expect(disabledBadge.querySelector('.MuiBadge-invisible')).toBeTruthy();
  });
});
