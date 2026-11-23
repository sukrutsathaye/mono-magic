import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BreadcrumbItem } from '@mono-magic/atomic-design-interfaces';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicBreadcrumbs } from './breadcrumbs';

afterEach(cleanup);

const TRAIL: readonly BreadcrumbItem[] = [
  { id: 'home', label: 'Home', icon: 'home', href: '#home' },
  { id: 'libs', label: 'Libraries' },
  { id: 'ui', label: 'UI Kit', disabled: true },
  { id: 'breadcrumbs', label: 'Breadcrumbs', current: true },
];

describe('MagicBreadcrumbs (React MUI)', () => {
  it('renders trail, icons, aria-current, disabled item, and forwards ref', () => {
    const navRef = createRef<HTMLElement>();
    const onItemClick = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicBreadcrumbs
          ref={navRef}
          id="nav-crumbs"
          testId="nav-crumbs"
          ariaLabel="Docs breadcrumb"
          items={TRAIL}
          separator="chevron_right"
          onItemClick={onItemClick}
        />
      </MagicMuiThemeProvider>,
    );

    expect(navRef.current).toBeInstanceOf(HTMLElement);
    expect(screen.getByTestId('nav-crumbs').getAttribute('aria-label')).toBe(
      'Docs breadcrumb',
    );

    const homeLink = screen.getByTestId('nav-crumbs-item-home');
    expect(homeLink.getAttribute('href')).toBe('#home');
    fireEvent.click(homeLink);
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'home' }),
      0,
    );

    const libsBtn = screen.getByTestId('nav-crumbs-item-libs');
    expect(libsBtn.tagName).toBe('BUTTON');
    fireEvent.click(libsBtn);
    expect(onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'libs' }),
      1,
    );

    const disabledItem = screen.getByTestId('nav-crumbs-item-ui');
    expect(disabledItem.getAttribute('aria-disabled')).toBe('true');

    const currentItem = screen.getByTestId('nav-crumbs-item-breadcrumbs');
    expect(currentItem.getAttribute('aria-current')).toBe('page');
  });

  it('supports maxItems collapse/expand, global disabled, and all 5 sizes', () => {
    const longTrail: readonly BreadcrumbItem[] = [
      { id: '1', label: 'Root' },
      { id: '2', label: 'Domain' },
      { id: '3', label: 'Package' },
      { id: '4', label: 'Molecules' },
      { id: '5', label: 'Breadcrumbs' },
    ];

    render(
      <MagicMuiThemeProvider>
        <MagicBreadcrumbs
          testId="collapsed-crumbs"
          items={longTrail}
          maxItems={3}
          itemsBeforeCollapse={1}
          itemsAfterCollapse={1}
        />
      </MagicMuiThemeProvider>,
    );

    expect(screen.queryByText('Package')).toBeNull();
    const expandBtn = screen.getByRole('button', { name: /show path/i });
    fireEvent.click(expandBtn);
    expect(screen.getByText('Package')).toBeTruthy();

    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(
        <MagicMuiThemeProvider>
          <MagicBreadcrumbs
            testId={`crumbs-${size}`}
            items={TRAIL}
            size={size}
            color="secondary"
            disabled={size === 'xl'}
            sx={[{ py: 0.5 }]}
          />
        </MagicMuiThemeProvider>,
      );
      expect(screen.getByTestId(`crumbs-${size}`).getAttribute('data-size')).toBe(
        size,
      );
      unmount();
    }
  });
});
