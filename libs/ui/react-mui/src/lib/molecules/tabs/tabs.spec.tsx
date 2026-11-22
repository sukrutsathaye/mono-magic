import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TabItem } from '@mono-magic/atomic-design-interfaces';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicTabs } from './tabs';

afterEach(cleanup);

const ITEMS: readonly TabItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'dashboard',
    content: 'Overview panel content',
  },
  {
    id: 'alerts',
    label: 'Alerts',
    badgeContent: 4,
    content: 'Alerts panel content',
  },
  {
    id: 'archive',
    label: 'Archive',
    disabled: true,
    content: 'Archive panel content',
  },
];

describe('MagicTabs (React MUI)', () => {
  it('renders tabs, active panel, icons, badges, ARIA bindings, and forwards ref', () => {
    const tabsRef = createRef<HTMLDivElement>();
    render(
      <MagicMuiThemeProvider>
        <MagicTabs
          ref={tabsRef}
          id="workspace-tabs"
          testId="workspace-tabs"
          ariaLabel="Workspace sections"
          items={ITEMS}
        />
      </MagicMuiThemeProvider>,
    );

    expect(tabsRef.current).toBeInstanceOf(HTMLDivElement);
    const tablist = screen.getByRole('tablist', { name: 'Workspace sections' });
    expect(tablist).toBeTruthy();

    const overviewTab = screen.getByRole('tab', { name: /Overview/i });
    const overviewPanel = screen.getByTestId('workspace-tabs-panel-overview');
    expect(overviewTab.getAttribute('aria-selected')).toBe('true');
    expect(overviewTab.getAttribute('aria-controls')).toBe(
      'workspace-tabs-panel-overview',
    );
    expect(overviewPanel.getAttribute('role')).toBe('tabpanel');
    expect(overviewPanel.getAttribute('aria-labelledby')).toBe(
      'workspace-tabs-tab-overview',
    );
    expect(overviewPanel.hidden).toBe(false);
    expect(screen.getByText('4')).toBeTruthy();
  });

  it('switches tabs in uncontrolled mode using defaultActiveTabId and emits onTabChange', () => {
    const onTabChange = vi.fn();
    render(
      <MagicMuiThemeProvider>
        <MagicTabs
          testId="uncontrolled-tabs"
          items={ITEMS}
          defaultActiveTabId="alerts"
          onTabChange={onTabChange}
        />
      </MagicMuiThemeProvider>,
    );

    expect(
      screen.getByTestId('uncontrolled-tabs-panel-alerts').hidden,
    ).toBe(false);
    expect(
      screen.getByTestId('uncontrolled-tabs-panel-overview').hidden,
    ).toBe(true);

    fireEvent.click(screen.getByTestId('uncontrolled-tabs-tab-overview'));
    expect(onTabChange).toHaveBeenCalledWith(
      'overview',
      expect.objectContaining({ id: 'overview', label: 'Overview' }),
    );
    expect(
      screen.getByTestId('uncontrolled-tabs-panel-overview').hidden,
    ).toBe(false);

    // Disabled tab should not trigger onTabChange
    fireEvent.click(screen.getByTestId('uncontrolled-tabs-tab-archive'));
    expect(onTabChange).toHaveBeenCalledTimes(1);
  });

  it('supports controlled activeTabId and lazy panel mounting', () => {
    const onTabChange = vi.fn();
    const { rerender } = render(
      <MagicMuiThemeProvider>
        <MagicTabs
          testId="lazy-tabs"
          items={ITEMS}
          activeTabId="overview"
          lazy
          onTabChange={onTabChange}
        />
      </MagicMuiThemeProvider>,
    );

    expect(screen.getByTestId('lazy-tabs-panel-overview')).toBeTruthy();
    expect(screen.queryByTestId('lazy-tabs-panel-alerts')).toBeNull();

    fireEvent.click(screen.getByTestId('lazy-tabs-tab-alerts'));
    expect(onTabChange).toHaveBeenCalledWith(
      'alerts',
      expect.objectContaining({ id: 'alerts' }),
    );
    // Still controlled at 'overview' until prop updates
    expect(screen.queryByTestId('lazy-tabs-panel-alerts')).toBeNull();

    rerender(
      <MagicMuiThemeProvider>
        <MagicTabs
          testId="lazy-tabs"
          items={ITEMS}
          activeTabId="alerts"
          lazy
          onTabChange={onTabChange}
        />
      </MagicMuiThemeProvider>,
    );

    expect(screen.getByTestId('lazy-tabs-panel-alerts').hidden).toBe(false);
  });

  it('supports vertical orientation, secondary variant, scrollable, all sizes, colors, and renderPanel', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(
        <MagicMuiThemeProvider>
          <MagicTabs
            testId={`tabs-${size}`}
            items={ITEMS}
            size={size}
            color="tertiary"
            orientation="vertical"
            variant="secondary"
            scrollable
            renderPanel={(item, isActive) => (
              <span data-testid={`custom-${item.id}`}>
                {item.label}:{isActive ? 'active' : 'idle'}
              </span>
            )}
            sx={[{ border: '1px solid transparent' }]}
          />
        </MagicMuiThemeProvider>,
      );

      expect(
        screen.getByTestId(`tabs-${size}`).getAttribute('data-orientation'),
      ).toBe('vertical');
      expect(
        screen.getByTestId(`tabs-${size}`).getAttribute('data-variant'),
      ).toBe('secondary');
      expect(screen.getByTestId('custom-overview').textContent).toBe(
        'Overview:active',
      );
      unmount();
    }
  });

  it('handles items starting with a disabled tab and single sx object', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicTabs
          testId="fallback-tabs"
          items={[
            { id: 'first', label: 'First', disabled: true },
            { id: 'second', label: 'Second', content: 'Enabled second' },
          ]}
          sx={{ mt: 1 }}
        />
      </MagicMuiThemeProvider>,
    );

    expect(screen.getByTestId('fallback-tabs-panel-second').hidden).toBe(false);
  });
});
