import { createRef } from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { Text, type View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import {
  MagicAvatar,
  MagicAvatarGroup,
  type AvatarGroupItem,
} from './avatar';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('MagicAvatar', () => {
  it('renders image, handles onError fallback to initials, and forwards ref', () => {
    const ref = createRef<View>();
    const createdImages: Array<{
      src: string;
      onerror: ((ev: Event) => void) | null;
      onload: ((ev: Event) => void) | null;
    }> = [];

    vi.spyOn(window, 'Image').mockImplementation(function MockImage() {
      const instance = {
        src: '',
        onerror: null as ((ev: Event) => void) | null,
        onload: null as ((ev: Event) => void) | null,
      };
      createdImages.push(instance);
      return instance as unknown as HTMLImageElement;
    } as unknown as typeof window.Image);

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicAvatar
          ref={ref}
          id="user-avatar"
          testId="rn-avatar"
          src="https://example.com/broken.png"
          alt="Ada Lovelace"
          name="Ada Lovelace"
          status="online"
          statusLabel="Available"
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    const avatar = screen.getByTestId('rn-avatar');
    expect(avatar.getAttribute('id')).toBe('user-avatar');
    expect(avatar.getAttribute('role')).toBe('img');
    expect(avatar.getAttribute('aria-label')).toBe('Ada Lovelace (Available)');

    const img = screen.getByTestId('rn-avatar-image');
    expect(img).toBeTruthy();
    expect(screen.getByTestId('rn-avatar-status')).toBeTruthy();
    expect(createdImages.length).toBeGreaterThan(0);

    // Trigger RNW ImageLoader's onerror inside act -> invokes MagicAvatar's onError -> falls back to "AL"
    act(() => {
      createdImages[0]?.onerror?.(new Event('error'));
    });
    expect(screen.queryByTestId('rn-avatar-image')).toBeNull();
    expect(screen.getByTestId('rn-avatar-initials').textContent).toBe('AL');
  });

  it('derives initials for single-word names, respects explicit initials, and falls back to icon', () => {
    const { rerender } = render(
      <MagicPaperProvider>
        <MagicAvatar testId="fb-avatar" name="Grace" shape="rounded" size="lg" />
      </MagicPaperProvider>
    );
    expect(screen.getByTestId('fb-avatar-initials').textContent).toBe('GR');

    rerender(
      <MagicPaperProvider>
        <MagicAvatar
          testId="fb-avatar"
          name="Grace Hopper"
          initials="gh"
          shape="square"
          color="secondary"
          status="busy"
        />
      </MagicPaperProvider>
    );
    expect(screen.getByTestId('fb-avatar-initials').textContent).toBe('GH');

    rerender(
      <MagicPaperProvider>
        <MagicAvatar testId="fb-avatar" status="offline" size="xs" />
      </MagicPaperProvider>
    );
    expect(screen.getByTestId('fb-avatar-icon').textContent).toBe('person');

    rerender(
      <MagicPaperProvider palette="dark-theme">
        <MagicAvatar testId="fb-avatar" icon="smart_toy" size="xl">
          <Text>AI</Text>
        </MagicAvatar>
      </MagicPaperProvider>
    );
    expect(screen.getByText('AI')).toBeTruthy();
  });
});

describe('MagicAvatarGroup', () => {
  const items: readonly AvatarGroupItem[] = [
    { id: '1', name: 'Ada Lovelace', color: 'primary' },
    { id: '2', name: 'Alan Turing', color: 'secondary' },
    { id: '3', name: 'Grace Hopper', color: 'tertiary' },
    { id: '4', name: 'Linus Torvalds', color: 'success' },
  ];

  it('renders max visible items and +N overflow badge with spacing presets', () => {
    const ref = createRef<View>();

    const { rerender } = render(
      <MagicPaperProvider>
        <MagicAvatarGroup
          ref={ref}
          id="team-avatars"
          testId="rn-group"
          items={items}
          max={2}
          size="md"
          spacing="tight"
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    expect(screen.getByTestId('rn-group-item-1')).toBeTruthy();
    expect(screen.getByTestId('rn-group-item-2')).toBeTruthy();
    expect(screen.queryByTestId('rn-group-item-3')).toBeNull();
    expect(screen.getByTestId('rn-group-overflow-initials').textContent).toBe(
      '+2'
    );

    rerender(
      <MagicPaperProvider>
        <MagicAvatarGroup
          testId="rn-group"
          items={items}
          size="sm"
          spacing="normal"
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('rn-group-item-4')).toBeTruthy();
    expect(screen.queryByTestId('rn-group-overflow')).toBeNull();
  });
});
