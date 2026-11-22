import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Text, type View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicTabs, type TabItem } from './tabs';

afterEach(cleanup);

const TAB_ITEMS: readonly TabItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'dashboard',
    content: 'Overview panel body',
  },
  {
    id: 'alerts',
    label: 'Alerts',
    icon: 'notifications',
    badgeContent: 4,
    content: 'Alerts panel body',
  },
  {
    id: 'locked',
    label: 'Locked',
    disabled: true,
    content: 'Locked panel body',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    content: 'Settings panel body',
  },
];

describe('MagicTabs', () => {
  it('renders tabs, ref, badges, active indicator, and switches tabs in uncontrolled mode', () => {
    const ref = createRef<View>();
    const onTabChange = vi.fn();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicTabs
          ref={ref}
          id="main-tabs"
          testId="rn-tabs"
          ariaLabel="Workspace sections"
          items={TAB_ITEMS}
          onTabChange={onTabChange}
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    const tablist = screen.getByTestId('rn-tabs-tablist');
    expect(tablist.getAttribute('role')).toBe('tablist');
    expect(tablist.getAttribute('aria-orientation')).toBe('horizontal');

    expect(
      screen.getByTestId('rn-tabs-tab-overview').getAttribute('aria-selected')
    ).toBe('true');
    expect(screen.getByTestId('rn-tabs-indicator-overview')).toBeTruthy();
    expect(screen.getByTestId('rn-tabs-badge-alerts')).toBeTruthy();
    expect(screen.getByText('Overview panel body')).toBeTruthy();

    // Click disabled tab — should not change
    fireEvent.click(screen.getByTestId('rn-tabs-tab-locked'));
    expect(onTabChange).not.toHaveBeenCalled();

    // Click enabled tab
    fireEvent.click(screen.getByTestId('rn-tabs-tab-alerts'));
    expect(onTabChange).toHaveBeenCalledWith('alerts', TAB_ITEMS[1]);
    expect(
      screen.getByTestId('rn-tabs-tab-alerts').getAttribute('aria-selected')
    ).toBe('true');
  });

  it('supports controlled activeTabId, lazy mounting, and custom renderPanel', () => {
    const onTabChange = vi.fn();

    const { rerender } = render(
      <MagicPaperProvider>
        <MagicTabs
          testId="lazy-tabs"
          items={TAB_ITEMS}
          activeTabId="overview"
          lazy
          variant="secondary"
          scrollable
          color="tertiary"
          size="sm"
          onTabChange={onTabChange}
          renderPanel={(item) => <Text>Custom: {item.label}</Text>}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByText('Custom: Overview')).toBeTruthy();
    expect(screen.queryByTestId('lazy-tabs-panel-settings')).toBeNull();

    rerender(
      <MagicPaperProvider>
        <MagicTabs
          testId="lazy-tabs"
          items={TAB_ITEMS}
          activeTabId="settings"
          lazy
          variant="secondary"
          scrollable
          color="tertiary"
          size="sm"
          onTabChange={onTabChange}
          renderPanel={(item) => <Text>Custom: {item.label}</Text>}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('lazy-tabs-panel-settings')).toBeTruthy();
    expect(screen.getByText('Custom: Settings')).toBeTruthy();
  });

  it('supports keyboard arrow, Home, and End navigation in horizontal and vertical modes', () => {
    const onTabChange = vi.fn();

    const { rerender } = render(
      <MagicPaperProvider>
        <MagicTabs
          testId="kbd-tabs"
          items={TAB_ITEMS}
          defaultActiveTabId="overview"
          orientation="horizontal"
          onTabChange={onTabChange}
        />
      </MagicPaperProvider>
    );

    const overviewTab = screen.getByTestId('kbd-tabs-tab-overview');
    fireEvent.keyDown(overviewTab, { key: 'ArrowRight' });
    expect(onTabChange).toHaveBeenLastCalledWith('alerts', TAB_ITEMS[1]);

    // ArrowRight from alerts skips disabled 'locked' -> 'settings'
    fireEvent.keyDown(screen.getByTestId('kbd-tabs-tab-alerts'), {
      key: 'ArrowRight',
    });
    expect(onTabChange).toHaveBeenLastCalledWith('settings', TAB_ITEMS[3]);

    // Home returns to first enabled tab
    fireEvent.keyDown(screen.getByTestId('kbd-tabs-tab-settings'), {
      key: 'Home',
    });
    expect(onTabChange).toHaveBeenLastCalledWith('overview', TAB_ITEMS[0]);

    // End jumps to last enabled tab
    fireEvent.keyDown(overviewTab, { key: 'End' });
    expect(onTabChange).toHaveBeenLastCalledWith('settings', TAB_ITEMS[3]);

    // Vertical orientation with ArrowUp/ArrowDown
    rerender(
      <MagicPaperProvider palette="dark-theme">
        <MagicTabs
          testId="kbd-tabs"
          items={TAB_ITEMS}
          orientation="vertical"
          onTabChange={onTabChange}
        />
      </MagicPaperProvider>
    );

    expect(
      screen.getByTestId('kbd-tabs-tablist').getAttribute('aria-orientation')
    ).toBe('vertical');
    fireEvent.keyDown(screen.getByTestId('kbd-tabs-tab-settings'), {
      key: 'ArrowUp',
    });
    expect(onTabChange).toHaveBeenLastCalledWith('alerts', TAB_ITEMS[1]);
  });
});
