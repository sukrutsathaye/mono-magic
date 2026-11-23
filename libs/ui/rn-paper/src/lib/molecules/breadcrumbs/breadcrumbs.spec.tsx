import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Text, type View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicBreadcrumbs, type BreadcrumbItem } from './breadcrumbs';

afterEach(cleanup);

const TRAIL: readonly BreadcrumbItem[] = [
  { id: 'home', label: 'Home', icon: 'home', href: '/' },
  { id: 'docs', label: 'Docs', href: '/docs' },
  { id: 'ui', label: 'UI Library', disabled: true },
  { id: 'molecules', label: 'Molecules' },
  { id: 'breadcrumbs', label: 'Breadcrumbs', current: true },
];

describe('MagicBreadcrumbs', () => {
  it('renders trail items, marks current crumb, and fires callbacks for active ancestors', () => {
    const ref = createRef<View>();
    const onItemPress = vi.fn();
    const onItemClick = vi.fn();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicBreadcrumbs
          ref={ref}
          id="nav-crumbs"
          testId="rn-crumbs"
          items={TRAIL}
          separator="chevron_right"
          onItemPress={onItemPress}
          onItemClick={onItemClick}
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    expect(screen.getByTestId('rn-crumbs').getAttribute('id')).toBe(
      'nav-crumbs'
    );
    expect(
      screen
        .getByTestId('rn-crumbs-item-breadcrumbs')
        .getAttribute('aria-current')
    ).toBe('page');

    fireEvent.click(screen.getByTestId('rn-crumbs-item-docs'));
    expect(onItemPress).toHaveBeenCalledWith(TRAIL[1], 1);
    expect(onItemClick).toHaveBeenCalledWith(TRAIL[1], 1);

    // Disabled item and current item do not trigger callbacks
    fireEvent.click(screen.getByTestId('rn-crumbs-item-ui'));
    fireEvent.click(screen.getByTestId('rn-crumbs-item-breadcrumbs'));
    expect(onItemPress).toHaveBeenCalledTimes(1);
  });

  it('collapses middle items when maxItems is exceeded and expands on ellipsis click', () => {
    render(
      <MagicPaperProvider>
        <MagicBreadcrumbs
          testId="collapsed-crumbs"
          items={TRAIL}
          maxItems={3}
          itemsBeforeCollapse={1}
          itemsAfterCollapse={2}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.queryByText('Docs')).toBeNull();
    expect(screen.getByText('Molecules')).toBeTruthy();
    expect(screen.getByText('Breadcrumbs')).toBeTruthy();

    fireEvent.click(screen.getByTestId('collapsed-crumbs-expand'));
    expect(screen.getByText('Docs')).toBeTruthy();
    expect(screen.getByText('UI Library')).toBeTruthy();
  });

  it('supports custom separatorSlot, disabled group, sizes, and dark theme', () => {
    const onItemPress = vi.fn();

    render(
      <MagicPaperProvider palette="dark-theme">
        <MagicBreadcrumbs
          testId="slot-crumbs"
          items={TRAIL.slice(0, 3)}
          separatorSlot={<Text>/</Text>}
          disabled
          size="lg"
          color="secondary"
          onItemPress={onItemPress}
        />
      </MagicPaperProvider>
    );

    fireEvent.click(screen.getByTestId('slot-crumbs-item-home'));
    expect(onItemPress).not.toHaveBeenCalled();
  });
});
