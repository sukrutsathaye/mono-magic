import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Text, type View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicCard, type CardActionItem, type ChipItem } from './card';

afterEach(cleanup);

describe('MagicCard', () => {
  it('renders title, subtitle, content, and forwards ref and accessibility props', () => {
    const ref = createRef<View>();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicCard
          ref={ref}
          id="hero-card"
          testId="rn-card"
          ariaLabel="Feature overview card"
          title="Atomic Architecture"
          subtitle="Material 3 Molecules"
          content="Shared TypeScript interfaces across web and mobile."
          width="360px"
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    const card = screen.getByTestId('rn-card');
    expect(card.getAttribute('id')).toBe('hero-card');
    expect(card.getAttribute('aria-label')).toBe('Feature overview card');
    expect(screen.getByTestId('rn-card-title').textContent).toBe(
      'Atomic Architecture'
    );
    expect(screen.getByTestId('rn-card-subtitle').textContent).toBe(
      'Material 3 Molecules'
    );
    expect(screen.getByTestId('rn-card-content-text').textContent).toBe(
      'Shared TypeScript interfaces across web and mobile.'
    );
  });

  it('supports outlined and raised appearances and percentage/numeric widths', () => {
    const { rerender } = render(
      <MagicPaperProvider>
        <MagicCard
          testId="app-card"
          appearance="outlined"
          title="Outlined"
          width="80%"
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('app-card').style.borderTopWidth).toBe('1px');
    expect(screen.getByTestId('app-card').style.width).toBe('80%');

    rerender(
      <MagicPaperProvider>
        <MagicCard
          testId="app-card"
          appearance="raised"
          title="Raised"
          width="320"
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('app-card').style.borderTopWidth).toBe('0px');
    expect(screen.getByTestId('app-card').style.width).toBe('320px');

    rerender(
      <MagicPaperProvider>
        <MagicCard
          testId="app-card"
          appearance="raised"
          title="Invalid width"
          width="auto-invalid"
        />
      </MagicPaperProvider>
    );
    expect(screen.getByTestId('app-card')).toBeTruthy();
  });

  it('renders imageSrc across all imageSize presets with imageAlt accessibilityLabel', () => {
    const sizes = ['small', 'medium', 'large', 'extra-large', 'full'] as const;

    const { rerender } = render(
      <MagicPaperProvider>
        <MagicCard
          testId="img-card"
          imageSrc="https://example.com/banner.png"
          imageAlt="Sample cover"
          imageSize="small"
        />
      </MagicPaperProvider>
    );

    for (const size of sizes) {
      rerender(
        <MagicPaperProvider>
          <MagicCard
            testId="img-card"
            imageSrc="https://example.com/banner.png"
            imageAlt={`Cover ${size}`}
            imageSize={size}
          />
        </MagicPaperProvider>
      );
      expect(screen.getByTestId('img-card-media')).toBeTruthy();
      expect(screen.getByLabelText(`Cover ${size}`)).toBeTruthy();
    }
  });

  it('renders actions and emits onActionClick for enabled actions only', () => {
    const onActionClick = vi.fn();
    const actions: readonly CardActionItem[] = [
      {
        id: 'save',
        label: 'Save',
        variant: 'filled',
        color: 'primary',
        icon: 'check',
      },
      {
        label: 'Delete',
        variant: 'outlined',
        color: 'error',
        disabled: true,
      },
    ];

    render(
      <MagicPaperProvider>
        <MagicCard
          testId="act-card"
          variant="with-actions"
          alignActions="end"
          actions={actions}
          onActionClick={onActionClick}
        />
      </MagicPaperProvider>
    );

    const actionsContainer = screen.getByTestId('act-card-actions');
    expect(actionsContainer).toBeTruthy();

    fireEvent.click(screen.getByTestId('act-card-action-save'));
    expect(onActionClick).toHaveBeenCalledTimes(1);
    expect(onActionClick).toHaveBeenCalledWith(actions[0]);

    // Disabled action should not trigger onActionClick
    fireEvent.click(screen.getByTestId('act-card-action-1'));
    expect(onActionClick).toHaveBeenCalledTimes(1);
  });

  it('renders chips with icons/avatars/selected states and emits onChipSelect for enabled chips', () => {
    const onChipSelect = vi.fn();
    const chips: readonly ChipItem[] = [
      { id: 'c1', label: 'Selected Chip', selected: true },
      {
        id: 'c2',
        label: 'Avatar Chip',
        avatarSrc: 'https://example.com/a.png',
        avatarAlt: 'User avatar',
      },
      { label: 'Icon Chip', leadingIcon: 'star' },
      { id: 'c4', label: 'Disabled Chip', disabled: true },
    ];

    render(
      <MagicPaperProvider>
        <MagicCard
          testId="chip-card"
          variant="with-chips"
          chips={chips}
          onChipSelect={onChipSelect}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('chip-card-chips')).toBeTruthy();

    fireEvent.click(screen.getByTestId('chip-card-chip-c1'));
    expect(onChipSelect).toHaveBeenCalledWith(chips[0]);

    fireEvent.click(screen.getByTestId('chip-card-chip-c2'));
    expect(onChipSelect).toHaveBeenCalledWith(chips[1]);

    fireEvent.click(screen.getByTestId('chip-card-chip-2'));
    expect(onChipSelect).toHaveBeenCalledWith(chips[2]);

    fireEvent.click(screen.getByTestId('chip-card-chip-c4'));
    expect(onChipSelect).toHaveBeenCalledTimes(3);
  });

  it('renders headerSlot, mediaSlot, children, and footerSlot even when data props are omitted', () => {
    render(
      <MagicPaperProvider palette="dark-theme">
        <MagicCard
          testId="slot-card"
          headerSlot={<Text>Custom Header</Text>}
          mediaSlot={<Text>Custom Media</Text>}
          footerSlot={<Text>Custom Footer</Text>}
        >
          <Text>Custom Body Child</Text>
        </MagicCard>
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('slot-card-header').textContent).toBe(
      'Custom Header'
    );
    expect(screen.getByTestId('slot-card-media').textContent).toBe(
      'Custom Media'
    );
    expect(screen.getByTestId('slot-card-content').textContent).toBe(
      'Custom Body Child'
    );
    expect(screen.getByTestId('slot-card-footer').textContent).toBe(
      'Custom Footer'
    );
  });
});
