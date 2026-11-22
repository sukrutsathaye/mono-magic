import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import {
  computeAvatarInitials,
  MagicAvatar,
  MagicAvatarGroup,
} from './avatar';

afterEach(cleanup);

const SAMPLE_AVATAR_SVG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%233f51b5"/></svg>';

describe('MagicAvatar & MagicAvatarGroup (React MUI)', () => {
  it('computes initials cleanly from single, multi-word, and empty names', () => {
    expect(computeAvatarInitials('Ada Lovelace')).toBe('AL');
    expect(computeAvatarInitials('Grace Hopper')).toBe('GH');
    expect(computeAvatarInitials('Ada')).toBe('AD');
    expect(computeAvatarInitials('   ')).toBe('');
    expect(computeAvatarInitials(undefined)).toBe('');
  });

  it('renders image avatar, falls back to initials on image error, and forwards ref', () => {
    const avatarRef = createRef<HTMLDivElement>();
    const onImageError = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicAvatar
          ref={avatarRef}
          id="user-avatar"
          testId="user-avatar"
          src={SAMPLE_AVATAR_SVG}
          alt="Ada Lovelace"
          name="Ada Lovelace"
          onImageError={onImageError}
        />
      </MagicMuiThemeProvider>,
    );

    expect(avatarRef.current).toBeInstanceOf(HTMLDivElement);
    const img = screen.getByRole('img', { name: 'Ada Lovelace' });
    expect(img.getAttribute('src')).toBe(SAMPLE_AVATAR_SVG);

    fireEvent.error(img);
    expect(onImageError).toHaveBeenCalledTimes(1);
    expect(screen.getByText('AL')).toBeTruthy();
  });

  it('supports explicit initials, custom icon fallback, default person icon, shapes, sizes, colors, and statuses', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    const shapes = ['circle', 'rounded', 'square'] as const;
    const statuses = ['online', 'busy', 'offline'] as const;

    for (const size of sizes) {
      const shape = shapes[sizes.indexOf(size) % shapes.length];
      const status = statuses[sizes.indexOf(size) % statuses.length];
      const { unmount } = render(
        <MagicMuiThemeProvider>
          <MagicAvatar
            testId={`av-${size}`}
            initials="MK"
            size={size}
            shape={shape}
            color="tertiary"
            status={status}
            statusLabel={`User is ${status}`}
            sx={[{ m: 0.5 }]}
          />
        </MagicMuiThemeProvider>,
      );

      const root = screen.getByTestId(`av-${size}`);
      expect(root.getAttribute('data-size')).toBe(size);
      expect(root.getAttribute('data-shape')).toBe(shape);
      expect(screen.getByText('MK')).toBeTruthy();
      expect(screen.getByRole('img', { name: `User is ${status}` })).toBeTruthy();
      unmount();
    }

    const { rerender } = render(
      <MagicMuiThemeProvider>
        <MagicAvatar testId="icon-av" icon="engineering" color="success" />
      </MagicMuiThemeProvider>,
    );
    expect(screen.getByText('engineering')).toBeTruthy();

    rerender(
      <MagicMuiThemeProvider>
        <MagicAvatar testId="icon-av" sx={{ p: 0 }} />
      </MagicMuiThemeProvider>,
    );
    expect(screen.getByText('person')).toBeTruthy();
  });

  it('renders MagicAvatarGroup with max overflow +N indicator, spacing, and click handler', () => {
    const groupRef = createRef<HTMLDivElement>();
    const onAvatarClick = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicAvatarGroup
          ref={groupRef}
          id="team-group"
          testId="team-group"
          ariaLabel="Project maintainers"
          max={2}
          size="md"
          spacing="tight"
          onAvatarClick={onAvatarClick}
          sx={[{ mt: 1 }]}
          items={[
            { id: 'u1', name: 'Ada Lovelace', status: 'online' },
            { id: 'u2', name: 'Alan Turing', status: 'busy' },
            { id: 'u3', name: 'Grace Hopper', status: 'offline' },
            { id: 'u4', name: 'Tim Berners' },
          ]}
        />
      </MagicMuiThemeProvider>,
    );

    expect(groupRef.current).toBeInstanceOf(HTMLDivElement);
    expect(screen.getByTestId('team-group').getAttribute('data-spacing')).toBe(
      'tight',
    );
    expect(screen.getByTestId('team-group-overflow').textContent).toBe('+2');
    expect(screen.getByText('AL')).toBeTruthy();
    expect(screen.getByText('AT')).toBeTruthy();
    expect(screen.queryByText('GH')).toBeNull();

    fireEvent.click(screen.getByTestId('team-group-item-u1'));
    expect(onAvatarClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'u1', name: 'Ada Lovelace' }),
      0,
    );
  });

  it('renders MagicAvatarGroup without overflow when items fit within max', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicAvatarGroup
          testId="small-group"
          spacing="normal"
          sx={{ gap: 0 }}
          items={[
            { name: 'One User' },
            { initials: 'TW' },
          ]}
        />
      </MagicMuiThemeProvider>,
    );

    expect(screen.queryByTestId('small-group-overflow')).toBeNull();
    expect(screen.getByText('OU')).toBeTruthy();
    expect(screen.getByText('TW')).toBeTruthy();
  });
});
