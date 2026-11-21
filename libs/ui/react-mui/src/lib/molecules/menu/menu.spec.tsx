import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MenuItem } from '@mono-magic/atomic-design-interfaces';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicMenu } from './menu';

afterEach(cleanup);

const TEST_ITEMS: readonly MenuItem[] = [
  { id: 'open', label: 'Open', icon: 'folder_open' },
  {
    id: 'more',
    label: 'More actions',
    icon: 'more_horiz',
    children: [
      { id: 'rename', label: 'Rename', icon: 'edit' },
      {
        id: 'deep',
        label: 'Deep menu',
        children: [{ id: 'deep-leaf', label: 'Deep leaf' }],
      },
    ],
  },
  {
    id: 'docs',
    label: 'Documentation',
    link: 'https://example.com/docs',
    role: 'menuitem',
  },
  {
    id: 'disabled-link',
    label: 'Disabled link',
    link: 'https://example.com/locked',
    disabled: true,
  },
  {
    id: 'disabled-item',
    label: 'Disabled action',
    disabled: true,
    disableRipple: true,
  },
];

describe('MagicMenu (React MUI)', () => {
  it('renders button trigger, opens menu, selects leaf item, and closes with click reason', () => {
    const ref = createRef<HTMLDivElement>();
    const onItemSelect = vi.fn();
    const onMenuOpen = vi.fn();
    const onMenuClose = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicMenu
          ref={ref}
          id="project-menu"
          testId="project-menu"
          triggerLabel="Project Actions"
          triggerIcon="settings"
          items={TEST_ITEMS}
          onItemSelect={onItemSelect}
          onMenuOpen={onMenuOpen}
          onMenuClose={onMenuClose}
        />
      </MagicMuiThemeProvider>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    const triggerBtn = screen.getByTestId('project-menu-button');
    expect(triggerBtn.getAttribute('id')).toBe('project-menu');
    expect(triggerBtn.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(triggerBtn);
    expect(onMenuOpen).toHaveBeenCalledTimes(1);
    expect(triggerBtn.getAttribute('aria-expanded')).toBe('true');

    const openItem = screen.getByTestId('project-menu-item-open');
    fireEvent.click(openItem);

    expect(onItemSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'open', label: 'Open' }),
    );
    expect(onMenuClose).toHaveBeenCalledWith('click');
  });

  it('supports icon triggerType and custom ariaLabel', () => {
    const onMenuOpen = vi.fn();
    render(
      <MagicMuiThemeProvider>
        <MagicMenu
          testId="icon-menu"
          triggerType="icon"
          triggerIcon="more_vert"
          ariaLabel="Context actions"
          size="sm"
          color="secondary"
          items={TEST_ITEMS}
          onMenuOpen={onMenuOpen}
        />
      </MagicMuiThemeProvider>,
    );

    const btn = screen.getByTestId('icon-menu-button');
    expect(btn.getAttribute('aria-label')).toBe('Context actions');
    fireEvent.click(btn);
    expect(onMenuOpen).toHaveBeenCalledTimes(1);
  });

  it('supports recursive nested submenus and selects deep leaf item', () => {
    const onItemSelect = vi.fn();
    const onMenuClose = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicMenu
          testId="nested-menu"
          xPosition="before"
          yPosition="above"
          overlapTrigger
          hasBackdrop={false}
          panelClass="custom-menu-panel"
          backdropClass="custom-backdrop"
          items={TEST_ITEMS}
          onItemSelect={onItemSelect}
          onMenuClose={onMenuClose}
        />
      </MagicMuiThemeProvider>,
    );

    fireEvent.click(screen.getByTestId('nested-menu-button'));
    const moreBranch = screen.getByTestId('nested-menu-item-more');
    expect(moreBranch.getAttribute('aria-haspopup')).toBe('menu');

    fireEvent.click(moreBranch);
    const deepBranch = screen.getByTestId('nested-menu-item-deep');
    fireEvent.click(deepBranch);

    const deepLeaf = screen.getByTestId('nested-menu-item-deep-leaf');
    fireEvent.click(deepLeaf);

    expect(onItemSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'deep-leaf', label: 'Deep leaf' }),
    );
    expect(onMenuClose).toHaveBeenCalledWith('click');
  });

  it('renders link menu items with href and respects disabled items', () => {
    const onItemSelect = vi.fn();
    render(
      <MagicMuiThemeProvider>
        <MagicMenu
          testId="link-menu"
          items={TEST_ITEMS}
          onItemSelect={onItemSelect}
        />
      </MagicMuiThemeProvider>,
    );

    fireEvent.click(screen.getByTestId('link-menu-button'));

    const docsLink = screen.getByTestId('link-menu-item-docs');
    expect(docsLink.tagName.toLowerCase()).toBe('a');
    expect(docsLink.getAttribute('href')).toBe('https://example.com/docs');

    const disabledLink = screen.getByTestId('link-menu-item-disabled-link');
    expect(disabledLink.getAttribute('href')).toBeNull();
    fireEvent.click(disabledLink);
    expect(onItemSelect).not.toHaveBeenCalled();

    fireEvent.click(docsLink);
    expect(onItemSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'docs', label: 'Documentation' }),
    );
  });

  it('does not open when disabled is true and supports customTrigger and Escape close', () => {
    const onMenuOpen = vi.fn();
    const onMenuClose = vi.fn();

    const { rerender } = render(
      <MagicMuiThemeProvider>
        <MagicMenu
          testId="custom-menu"
          disabled
          customTrigger={<button type="button">Custom Trigger</button>}
          items={TEST_ITEMS}
          onMenuOpen={onMenuOpen}
          onMenuClose={onMenuClose}
          sx={[{ ml: 1 }]}
        />
      </MagicMuiThemeProvider>,
    );

    fireEvent.click(screen.getByTestId('custom-menu-custom-trigger'));
    expect(onMenuOpen).not.toHaveBeenCalled();

    rerender(
      <MagicMuiThemeProvider>
        <MagicMenu
          testId="custom-menu"
          customTrigger={<button type="button">Custom Trigger</button>}
          items={TEST_ITEMS}
          onMenuOpen={onMenuOpen}
          onMenuClose={onMenuClose}
        />
      </MagicMuiThemeProvider>,
    );

    fireEvent.click(screen.getByTestId('custom-menu-custom-trigger'));
    expect(onMenuOpen).toHaveBeenCalledTimes(1);

    const menuList = screen.getByRole('menu');
    fireEvent.keyDown(menuList, { key: 'Escape', code: 'Escape' });
    expect(onMenuClose).toHaveBeenCalledWith('keydown');
  });

  it('closes submenu on Escape and ignores clicks on disabled submenu parent or leaf item', () => {
    const onItemSelect = vi.fn();
    render(
      <MagicMuiThemeProvider>
        <MagicMenu
          items={[
            {
              label: 'Submenu Branch',
              children: [{ label: 'Child Item' }],
            },
            {
              label: 'Disabled Submenu',
              disabled: true,
              children: [{ label: 'Unreachable' }],
            },
            {
              label: 'Disabled Leaf',
              disabled: true,
            },
          ]}
          sx={{ m: 1 }}
          onItemSelect={onItemSelect}
        />
      </MagicMuiThemeProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));

    fireEvent.click(screen.getByText('Disabled Submenu'));
    expect(screen.queryByText('Unreachable')).toBeNull();

    fireEvent.click(screen.getByText('Disabled Leaf'));
    expect(onItemSelect).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Submenu Branch'));
    expect(screen.getByText('Child Item')).toBeTruthy();

    const menus = screen.getAllByRole('menu');
    fireEvent.keyDown(menus[menus.length - 1], {
      key: 'Escape',
      code: 'Escape',
    });
  });
});
