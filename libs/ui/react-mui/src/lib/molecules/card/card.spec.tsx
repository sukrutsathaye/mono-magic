import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicCard } from './card';

afterEach(cleanup);

const SAMPLE_IMG = 'https://example.com/banner.png';
const SAMPLE_AVATAR = 'https://example.com/avatar.png';

describe('MagicCard (React MUI)', () => {
  it('renders basic card with title, subtitle, content, avatar, and forwards ref', () => {
    const cardRef = createRef<HTMLDivElement>();
    render(
      <MagicMuiThemeProvider>
        <MagicCard
          ref={cardRef}
          id="hero-card"
          testId="hero-card"
          ariaLabel="Hero overview card"
          title="Card Title"
          subtitle="Card Subtitle"
          content="Body paragraph content"
          avatarSrc={SAMPLE_AVATAR}
          avatarAlt="Author Avatar"
          width="400px"
        />
      </MagicMuiThemeProvider>,
    );

    expect(cardRef.current).toBeInstanceOf(HTMLDivElement);
    const card = screen.getByTestId('hero-card');
    expect(card.getAttribute('id')).toBe('hero-card');
    expect(card.getAttribute('aria-label')).toBe('Hero overview card');
    expect(screen.getByText('Card Title')).toBeTruthy();
    expect(screen.getByText('Card Subtitle')).toBeTruthy();
    expect(screen.getByText('Body paragraph content')).toBeTruthy();
    expect(screen.getByAltText('Author Avatar')).toBeTruthy();
  });

  it('supports outlined and raised appearances', () => {
    const { rerender } = render(
      <MagicMuiThemeProvider>
        <MagicCard testId="app-card" title="Outlined" appearance="outlined" />
      </MagicMuiThemeProvider>,
    );

    expect(screen.getByTestId('app-card').className).toContain(
      'MuiPaper-outlined',
    );

    rerender(
      <MagicMuiThemeProvider>
        <MagicCard testId="app-card" title="Raised" appearance="raised" />
      </MagicMuiThemeProvider>,
    );

    expect(screen.getByTestId('app-card').className).toContain(
      'MuiPaper-elevation',
    );
  });

  it('renders imageSrc across all imageSize presets', () => {
    const sizes = ['small', 'medium', 'large', 'extra-large', 'full'] as const;
    for (const size of sizes) {
      const { unmount } = render(
        <MagicMuiThemeProvider>
          <MagicCard
            testId={`card-${size}`}
            imageSrc={SAMPLE_IMG}
            imageAlt={`Alt ${size}`}
            imageSize={size}
          />
        </MagicMuiThemeProvider>,
      );

      const media = screen.getByTestId(`card-${size}-media`);
      expect(media.getAttribute('src')).toBe(SAMPLE_IMG);
      expect(media.getAttribute('alt')).toBe(`Alt ${size}`);
      expect(media.getAttribute('data-image-size')).toBe(size);
      unmount();
    }
  });

  it('renders actions, handles alignActions, and invokes onActionClick only for enabled actions', () => {
    const onActionClick = vi.fn();
    render(
      <MagicMuiThemeProvider>
        <MagicCard
          testId="action-card"
          variant="with-actions"
          alignActions="end"
          actions={[
            {
              id: 'save',
              label: 'Save',
              variant: 'filled',
              color: 'primary',
              icon: 'check',
            },
            {
              label: 'Delete',
              disabled: true,
            },
          ]}
          onActionClick={onActionClick}
        />
      </MagicMuiThemeProvider>,
    );

    const saveBtn = screen.getByTestId('action-card-action-save');
    const deleteBtn = screen.getByTestId('action-card-action-1');

    fireEvent.click(saveBtn);
    expect(onActionClick).toHaveBeenCalledTimes(1);
    expect(onActionClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'save', label: 'Save' }),
    );

    fireEvent.click(deleteBtn);
    expect(onActionClick).toHaveBeenCalledTimes(1);
  });

  it('renders chips with icons, avatars, selected and disabled states, and invokes onChipSelect', () => {
    const onChipSelect = vi.fn();
    render(
      <MagicMuiThemeProvider>
        <MagicCard
          testId="chip-card"
          variant="with-chips"
          chips={[
            {
              id: 'tag-1',
              label: 'Featured',
              selected: true,
              leadingIcon: 'star',
            },
            {
              id: 'tag-2',
              label: 'Author',
              avatarSrc: SAMPLE_AVATAR,
              avatarAlt: 'User',
            },
            {
              label: 'Archived',
              disabled: true,
            },
          ]}
          onChipSelect={onChipSelect}
        />
      </MagicMuiThemeProvider>,
    );

    const featuredChip = screen.getByTestId('chip-card-chip-tag-1');
    const authorChip = screen.getByTestId('chip-card-chip-tag-2');
    const archivedChip = screen.getByTestId('chip-card-chip-2');

    fireEvent.click(featuredChip);
    expect(onChipSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'tag-1', label: 'Featured' }),
    );

    fireEvent.click(authorChip);
    expect(onChipSelect).toHaveBeenCalledTimes(2);

    fireEvent.click(archivedChip);
    expect(onChipSelect).toHaveBeenCalledTimes(2);
  });

  it('renders headerSlot, mediaSlot, children, and footerSlot', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicCard
          testId="slot-card"
          content="Intro text"
          headerSlot={<div data-testid="custom-header">Custom Header</div>}
          mediaSlot={<div data-testid="custom-media">Custom Media</div>}
          footerSlot={<div data-testid="custom-footer">Custom Footer</div>}
          sx={[{ p: 1 }]}
        >
          <span data-testid="custom-body">Custom Body Child</span>
        </MagicCard>
      </MagicMuiThemeProvider>,
    );

    expect(screen.getByTestId('custom-header').textContent).toBe(
      'Custom Header',
    );
    expect(screen.queryByTestId('slot-card-header')).toBeNull();
    expect(screen.getByTestId('custom-media').textContent).toBe('Custom Media');
    expect(screen.getByTestId('custom-body').textContent).toBe(
      'Custom Body Child',
    );
    expect(screen.getByTestId('custom-footer').textContent).toBe(
      'Custom Footer',
    );
  });

  it('renders static non-clickable chips when onChipSelect is omitted and supports single sx object and minimal props', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicCard
          subtitle="Subtitle only"
          chips={[{ label: 'Static Chip' }]}
          actions={[{ label: 'Default Action' }]}
          sx={{ p: 1 }}
        />
      </MagicMuiThemeProvider>,
    );

    expect(screen.getByText('Subtitle only')).toBeTruthy();
    expect(screen.getByText('Static Chip')).toBeTruthy();
    expect(screen.getByText('Default Action')).toBeTruthy();
  });
});
