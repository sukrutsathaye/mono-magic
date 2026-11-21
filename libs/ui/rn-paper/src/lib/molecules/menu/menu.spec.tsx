import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Text, type View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicMenu, type MenuItem } from './menu';

afterEach(cleanup);

const TEST_ITEMS: readonly MenuItem[] = [
  { id: 'rename', label: 'Rename', icon: 'edit' },
  {
    id: 'export',
    label: 'Export',
    icon: 'download',
    children: [
      { id: 'pdf', label: 'Export PDF', icon: 'picture_as_pdf' },
      {
        id: 'csv',
        label: 'Export CSV',
        role: 'menuitemcheckbox',
        disableRipple: true,
      },
    ],
  },
  { id: 'locked', label: 'Locked Action', disabled: true },
];

describe('MagicMenu', () => {
  it('opens on button trigger click, renders menu items, and closes on leaf item selection', () => {
    const onMenuOpen = vi.fn();
    const onMenuClose = vi.fn();
    const onItemSelect = vi.fn();
    const ref = createRef<View>();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicMenu
          ref={ref}
          id="doc-menu"
          testId="rn-menu"
          triggerLabel="Document"
          triggerIcon="folder"
          items={TEST_ITEMS}
          onMenuOpen={onMenuOpen}
          onMenuClose={onMenuClose}
          onItemSelect={onItemSelect}
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    expect(screen.queryByTestId('rn-menu-panel')).toBeNull();

    const trigger = screen.getByTestId('rn-menu-trigger');
    fireEvent.click(trigger);
    expect(onMenuOpen).toHaveBeenCalledTimes(1);

    const panel = screen.getByTestId('rn-menu-panel');
    expect(panel.getAttribute('role')).toBe('menu');

    // Disabled item should not select or close
    fireEvent.click(screen.getByTestId('rn-menu-item-locked'));
    expect(onItemSelect).not.toHaveBeenCalled();
    expect(screen.getByTestId('rn-menu-panel')).toBeTruthy();

    // Leaf item selects and closes with 'click'
    fireEvent.click(screen.getByTestId('rn-menu-item-rename'));
    expect(onItemSelect).toHaveBeenCalledWith(TEST_ITEMS[0]);
    expect(onMenuClose).toHaveBeenCalledWith('click');
    expect(screen.queryByTestId('rn-menu-panel')).toBeNull();
  });

  it('supports icon triggerType and toggles closed when clicking trigger while open', () => {
    const onMenuClose = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicMenu
          testId="icon-menu"
          triggerType="icon"
          triggerIcon="more_horiz"
          ariaLabel="More actions"
          items={TEST_ITEMS}
          onMenuClose={onMenuClose}
        />
      </MagicPaperProvider>
    );

    const trigger = screen.getByTestId('icon-menu-trigger');
    expect(trigger.getAttribute('aria-label')).toBe('More actions');

    fireEvent.click(trigger);
    expect(screen.getByTestId('icon-menu-panel')).toBeTruthy();

    fireEvent.click(trigger);
    expect(onMenuClose).toHaveBeenCalledWith('click');
    expect(screen.queryByTestId('icon-menu-panel')).toBeNull();
  });

  it('supports recursive submenu drill-down and back navigation', () => {
    const onItemSelect = vi.fn();
    const onMenuClose = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicMenu
          testId="sub-menu"
          items={TEST_ITEMS}
          onItemSelect={onItemSelect}
          onMenuClose={onMenuClose}
        />
      </MagicPaperProvider>
    );

    fireEvent.click(screen.getByTestId('sub-menu-trigger'));

    // Click parent item with children
    fireEvent.click(screen.getByTestId('sub-menu-item-export'));
    expect(onItemSelect).not.toHaveBeenCalled();

    // Child items and Back row are visible
    expect(screen.getByTestId('sub-menu-back')).toBeTruthy();
    expect(screen.getByTestId('sub-menu-item-pdf')).toBeTruthy();

    // Navigate back to root level
    fireEvent.click(screen.getByTestId('sub-menu-back'));
    expect(screen.queryByTestId('sub-menu-back')).toBeNull();
    expect(screen.getByTestId('sub-menu-item-rename')).toBeTruthy();

    // Drill down again and pick child
    fireEvent.click(screen.getByTestId('sub-menu-item-export'));
    fireEvent.click(screen.getByTestId('sub-menu-item-csv'));
    expect(onItemSelect).toHaveBeenCalledWith(TEST_ITEMS[1].children?.[1]);
    expect(onMenuClose).toHaveBeenCalledWith('click');
  });

  it('closes on backdrop click, Escape keydown, and Tab keydown', () => {
    const onMenuClose = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicMenu
          testId="dismiss-menu"
          items={TEST_ITEMS}
          xPosition="before"
          yPosition="above"
          overlapTrigger
          onMenuClose={onMenuClose}
        />
      </MagicPaperProvider>
    );

    // 1. Backdrop click
    fireEvent.click(screen.getByTestId('dismiss-menu-trigger'));
    fireEvent.click(screen.getByTestId('dismiss-menu-backdrop'));
    expect(onMenuClose).toHaveBeenLastCalledWith('click');
    expect(screen.queryByTestId('dismiss-menu-panel')).toBeNull();

    // 2. Escape keydown
    fireEvent.click(screen.getByTestId('dismiss-menu-trigger'));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onMenuClose).toHaveBeenLastCalledWith('keydown');
    expect(screen.queryByTestId('dismiss-menu-panel')).toBeNull();

    // 3. Tab keydown
    fireEvent.click(screen.getByTestId('dismiss-menu-trigger'));
    fireEvent.keyDown(window, { key: 'Tab' });
    expect(onMenuClose).toHaveBeenLastCalledWith('tab');
    expect(screen.queryByTestId('dismiss-menu-panel')).toBeNull();
  });

  it('respects disabled prop, controlled open prop, hasBackdrop=false, and custom triggerSlot', () => {
    const onMenuOpen = vi.fn();
    const { rerender } = render(
      <MagicPaperProvider>
        <MagicMenu
          testId="ctrl-menu"
          disabled
          triggerSlot={<Text>Custom Trigger</Text>}
          items={TEST_ITEMS}
          onMenuOpen={onMenuOpen}
        />
      </MagicPaperProvider>
    );

    fireEvent.click(screen.getByTestId('ctrl-menu-trigger'));
    expect(onMenuOpen).not.toHaveBeenCalled();

    rerender(
      <MagicPaperProvider>
        <MagicMenu
          testId="ctrl-menu"
          open
          hasBackdrop={false}
          triggerSlot={<Text>Custom Trigger</Text>}
          items={TEST_ITEMS}
          onMenuOpen={onMenuOpen}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('ctrl-menu-panel')).toBeTruthy();
    expect(screen.queryByTestId('ctrl-menu-backdrop')).toBeNull();
  });
});
