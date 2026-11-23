import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Text, type View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicListItem } from './list-item';

afterEach(cleanup);

describe('MagicListItem', () => {
  it('renders overline, primary, secondary, leading icon, trailing badge/text/icon, and divider', () => {
    const ref = createRef<View>();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicListItem
          ref={ref}
          id="inbox-row"
          testId="li-basic"
          overlineText="WORKSPACE"
          primaryText="Design System Updates"
          secondaryText="6 new molecules implemented"
          leadingIcon="inbox"
          trailingText="2m"
          trailingBadge={6}
          trailingIcon="chevron_right"
          divider
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    expect(screen.getByTestId('li-basic').getAttribute('id')).toBe(
      'inbox-row'
    );
    expect(screen.getByText('WORKSPACE')).toBeTruthy();
    expect(screen.getByText('Design System Updates')).toBeTruthy();
    expect(screen.getByText('6 new molecules implemented')).toBeTruthy();
    expect(screen.getByText('2m')).toBeTruthy();
    expect(screen.getByText('6')).toBeTruthy();
    expect(screen.getByTestId('li-basic-divider')).toBeTruthy();
  });

  it('supports interactive press and uncontrolled selectable toggling', () => {
    const onPress = vi.fn();
    const onClick = vi.fn();
    const onSelectedChange = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicListItem
          testId="li-select"
          primaryText="Enable Dark Mode"
          selectable
          interactive
          appearance="outlined"
          color="secondary"
          onPress={onPress}
          onClick={onClick}
          onSelectedChange={onSelectedChange}
        />
      </MagicPaperProvider>
    );

    const row = screen.getByTestId('li-select-row');
    expect(row.getAttribute('aria-selected')).toBe('false');

    fireEvent.click(row);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(row.getAttribute('aria-selected')).toBe('true');

    fireEvent.click(row);
    expect(onSelectedChange).toHaveBeenLastCalledWith(false);
    expect(row.getAttribute('aria-selected')).toBe('false');
  });

  it('supports controlled selected state, disabled guard, leading avatar, and custom slots', () => {
    const onSelectedChange = vi.fn();
    const onPress = vi.fn();

    const { rerender } = render(
      <MagicPaperProvider palette="dark-theme">
        <MagicListItem
          testId="li-ctrl"
          primaryText="Sukrut Sathaye"
          leadingAvatarText="SS"
          selectable
          selected
          appearance="filled"
          dense
          size="lg"
          onSelectedChange={onSelectedChange}
          onPress={onPress}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('li-ctrl-avatar')).toBeTruthy();
    expect(screen.getByText('SS')).toBeTruthy();
    fireEvent.click(screen.getByTestId('li-ctrl-row'));
    expect(onSelectedChange).toHaveBeenCalledWith(false);

    rerender(
      <MagicPaperProvider palette="dark-theme">
        <MagicListItem
          testId="li-ctrl"
          primaryText="Locked Item"
          disabled
          selectable
          appearance="filled"
          leadingSlot={<Text>CustomLead</Text>}
          trailingSlot={<Text>CustomTrail</Text>}
          onSelectedChange={onSelectedChange}
          onPress={onPress}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByText('CustomLead')).toBeTruthy();
    expect(screen.getByText('CustomTrail')).toBeTruthy();
    fireEvent.click(screen.getByTestId('li-ctrl-row'));
    expect(onSelectedChange).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders avatar image source and all density sizes cleanly', () => {
    render(
      <MagicPaperProvider>
        <MagicListItem
          testId="li-img"
          primaryText="Avatar Image Row"
          leadingAvatarSrc="https://example.com/avatar.png"
          size="xs"
        />
        <MagicListItem
          testId="li-xl"
          primaryText="XL Row"
          leadingIcon="star"
          size="xl"
          appearance="outlined"
          disabled
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('li-img-avatar-image')).toBeTruthy();
    expect(screen.getByText('XL Row')).toBeTruthy();
  });
});
