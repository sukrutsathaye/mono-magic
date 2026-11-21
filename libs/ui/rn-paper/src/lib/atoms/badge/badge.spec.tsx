import { createRef } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { Text, View } from 'react-native';
import { afterEach, describe, expect, it } from 'vitest';
import type {
  AtomicSize,
  BadgePosition,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicBadge } from './badge';

afterEach(cleanup);

describe('MagicBadge', () => {
  it('renders numeric content with icon fallback and forwards ref', () => {
    const ref = createRef<View>();
    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicBadge
          ref={ref}
          id="inbox-badge"
          testId="badge-main"
          content={7}
          icon="mail"
          description="7 unread messages"
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    const root = screen.getByTestId('badge-main');
    expect(root.getAttribute('id')).toBe('inbox-badge');
    expect(root.getAttribute('aria-label')).toBe('7 unread messages');

    const badge = screen.getByTestId('badge-main-badge');
    expect(badge.textContent).toBe('7');
    expect(badge.getAttribute('aria-label')).toBe('7 unread messages');
  });

  it('renders label fallback when neither children nor icon is provided, and projects children when supplied', () => {
    render(
      <MagicPaperProvider>
        <MagicBadge testId="label-fallback" label="Alerts" content="New" />
        <MagicBadge testId="child-anchor" label="Ignored" content={3}>
          <Text>Custom Anchor</Text>
        </MagicBadge>
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('label-fallback').textContent).toContain('Alerts');
    expect(screen.getByTestId('label-fallback-badge').textContent).toBe('New');

    const childRoot = screen.getByTestId('child-anchor');
    expect(childRoot.textContent).toContain('Custom Anchor');
    expect(childRoot.textContent).not.toContain('Ignored');
  });

  it('renders dot badge when content is omitted or empty', () => {
    render(
      <MagicPaperProvider>
        <MagicBadge
          testId="dot-badge"
          icon="notifications"
          description="Unread alert"
        />
      </MagicPaperProvider>
    );

    const dot = screen.getByTestId('dot-badge-badge');
    expect(dot.textContent).toBe('');
    expect(dot.getAttribute('aria-label')).toBe('Unread alert');
  });

  it('hides the badge when hidden=true and applies disabled colors when disabled=true', () => {
    render(
      <MagicPaperProvider>
        <MagicBadge testId="hidden-badge" content={4} icon="mail" hidden />
        <MagicBadge
          testId="disabled-badge"
          content={4}
          icon="mail"
          disabled
          ariaLabel="Disabled badge"
        />
      </MagicPaperProvider>
    );

    expect(screen.queryByTestId('hidden-badge-badge')).toBeNull();
    expect(screen.getByTestId('disabled-badge-badge')).toBeTruthy();
    expect(
      screen.getByTestId('disabled-badge').getAttribute('aria-label')
    ).toBe('Disabled badge');
  });

  it('supports all 8 position variants and overlap=false placement', () => {
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
      <MagicPaperProvider>
        {positions.map((pos, idx) => (
          <MagicBadge
            key={`ov-${pos}`}
            testId={`pos-ov-${idx}`}
            position={pos}
            content={idx + 1}
            icon="inbox"
            overlap
          />
        ))}
        {positions.map((pos, idx) => (
          <MagicBadge
            key={`no-ov-${pos}`}
            testId={`pos-no-${idx}`}
            position={pos}
            content={idx + 1}
            label={`Item-${idx}`}
            overlap={false}
          />
        ))}
      </MagicPaperProvider>
    );

    positions.forEach((_, idx) => {
      expect(screen.getByTestId(`pos-ov-${idx}-badge`).textContent).toBe(
        String(idx + 1)
      );
      expect(screen.getByTestId(`pos-no-${idx}-badge`).textContent).toBe(
        String(idx + 1)
      );
    });
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
      <MagicPaperProvider palette="dark-theme">
        {sizes.map((size) => (
          <MagicBadge
            key={size}
            testId={`size-${size}`}
            size={size}
            content={size}
            icon="star"
          />
        ))}
        {colors.map((color) => (
          <MagicBadge
            key={color}
            testId={`color-${color}`}
            color={color}
            content={99}
            icon="mail"
          />
        ))}
      </MagicPaperProvider>
    );

    for (const size of sizes) {
      expect(screen.getByTestId(`size-${size}-badge`).textContent).toBe(size);
    }
    for (const color of colors) {
      expect(screen.getByTestId(`color-${color}-badge`).textContent).toBe('99');
    }
  });
});
