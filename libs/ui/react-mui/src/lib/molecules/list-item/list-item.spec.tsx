import { createRef } from 'react';
import List from '@mui/material/List';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LIST_ITEM_APPEARANCES } from '@mono-magic/atomic-design-interfaces';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicListItem } from './list-item';

afterEach(cleanup);

describe('MagicListItem (React MUI)', () => {
  it('renders primary, secondary, overline text, icons, badge, and forwards ref', () => {
    const itemRef = createRef<HTMLLIElement>();
    render(
      <MagicMuiThemeProvider>
        <List>
          <MagicListItem
            ref={itemRef}
            id="inbox-row"
            testId="inbox-row"
            ariaLabel="Inbox messages"
            overlineText="WORKSPACE"
            primaryText="Design System Updates"
            secondaryText="Wave 2 molecules parity review"
            leadingIcon="inbox"
            trailingText="2m ago"
            trailingBadge={12}
            trailingIcon="chevron_right"
            divider
          />
        </List>
      </MagicMuiThemeProvider>,
    );

    expect(itemRef.current).toBeInstanceOf(HTMLLIElement);
    const root = screen.getByTestId('inbox-row');
    expect(root.getAttribute('aria-label')).toBe('Inbox messages');
    expect(screen.getByText('WORKSPACE')).toBeTruthy();
    expect(screen.getByText('Design System Updates')).toBeTruthy();
    expect(screen.getByText('Wave 2 molecules parity review')).toBeTruthy();
    expect(screen.getByText('2m ago')).toBeTruthy();
    expect(screen.getByTestId('inbox-row-trailing-badge').textContent).toBe('12');
    expect(screen.getByTestId('inbox-row-leading-icon')).toBeTruthy();
    expect(screen.getByTestId('inbox-row-trailing-icon')).toBeTruthy();
  });

  it('toggles selection in uncontrolled mode and respects controlled selected state', () => {
    const onSelectedChange = vi.fn();
    const onClick = vi.fn();

    const { rerender } = render(
      <MagicMuiThemeProvider>
        <List>
          <MagicListItem
            testId="selectable-row"
            primaryText="Enable Telemetry"
            selectable
            defaultSelected={false}
            onSelectedChange={onSelectedChange}
            onClick={onClick}
          />
        </List>
      </MagicMuiThemeProvider>,
    );

    const btn = screen.getByTestId('selectable-row-button');
    expect(btn.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(btn);
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(btn.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(btn);
    expect(onSelectedChange).toHaveBeenLastCalledWith(false);
    expect(btn.getAttribute('aria-pressed')).toBe('false');

    rerender(
      <MagicMuiThemeProvider>
        <List>
          <MagicListItem
            testId="selectable-row"
            primaryText="Enable Telemetry"
            selectable
            selected
            onSelectedChange={onSelectedChange}
          />
        </List>
      </MagicMuiThemeProvider>,
    );

    expect(
      screen.getByTestId('selectable-row').getAttribute('data-selected'),
    ).toBe('true');
  });

  it('ignores clicks when disabled and supports interactive mode without selectable', () => {
    const onClick = vi.fn();
    const onSelectedChange = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <List>
          <MagicListItem
            testId="disabled-row"
            primaryText="Archived Row"
            selectable
            disabled
            onClick={onClick}
            onSelectedChange={onSelectedChange}
          />
          <MagicListItem
            testId="nav-row"
            primaryText="Open Settings"
            interactive
            onClick={onClick}
          />
        </List>
      </MagicMuiThemeProvider>,
    );

    fireEvent.click(screen.getByTestId('disabled-row-button'));
    expect(onClick).not.toHaveBeenCalled();
    expect(onSelectedChange).not.toHaveBeenCalled();

    const navBtn = screen.getByTestId('nav-row-button');
    expect(navBtn.getAttribute('aria-pressed')).toBeNull();
    fireEvent.click(navBtn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders leading avatars, custom slots, dense rows, appearances, and all 5 sizes', () => {
    for (const appearance of LIST_ITEM_APPEARANCES) {
      const { unmount } = render(
        <MagicMuiThemeProvider>
          <List>
            <MagicListItem
              testId={`app-${appearance}`}
              primaryText={`Appearance ${appearance}`}
              appearance={appearance}
              selected={appearance === 'filled'}
              leadingAvatarText="SS"
              dense
            />
          </List>
        </MagicMuiThemeProvider>,
      );
      expect(
        screen.getByTestId(`app-${appearance}`).getAttribute('data-appearance'),
      ).toBe(appearance);
      expect(screen.getByText('SS')).toBeTruthy();
      unmount();
    }

    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(
        <MagicMuiThemeProvider>
          <List>
            <MagicListItem
              testId={`size-${size}`}
              primaryText={`Size ${size}`}
              size={size}
              color="tertiary"
              leadingSlot={<span data-testid="custom-lead">L</span>}
              trailingSlot={<span data-testid="custom-trail">T</span>}
              sx={[{ mb: 1 }]}
            />
          </List>
        </MagicMuiThemeProvider>,
      );
      expect(screen.getByTestId(`size-${size}`).getAttribute('data-size')).toBe(
        size,
      );
      expect(screen.getByTestId('custom-lead')).toBeTruthy();
      expect(screen.getByTestId('custom-trail')).toBeTruthy();
      unmount();
    }
  });
});
