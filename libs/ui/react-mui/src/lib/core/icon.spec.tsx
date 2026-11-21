import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MagicMuiThemeProvider } from '../theme/mui-theme';
import { MagicIcon } from './icon';

afterEach(cleanup);

describe('MagicIcon', () => {
  it('renders Material Icons ligature string with decorative aria-hidden by default', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicIcon icon="search" testId="search-icon" />
      </MagicMuiThemeProvider>,
    );

    const el = screen.getByTestId('search-icon');
    expect(el.textContent).toBe('search');
    expect(el.className).toContain('material-icons');
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.getAttribute('role')).toBeNull();
  });

  it('renders accessible role and aria-label when ariaLabel is provided', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicIcon
          icon="favorite"
          ariaLabel="Favorite item"
          color="primary"
          size="lg"
          testId="fav-icon"
        />
      </MagicMuiThemeProvider>,
    );

    const el = screen.getByTestId('fav-icon');
    expect(el.getAttribute('role')).toBe('img');
    expect(el.getAttribute('aria-label')).toBe('Favorite item');
    expect(el.getAttribute('aria-hidden')).toBeNull();
  });

  it('supports explicit numeric sizes, custom className, and sx overrides', () => {
    render(
      <MagicMuiThemeProvider palette="dark-theme">
        <MagicIcon
          icon="bolt"
          size={30}
          color="tertiary"
          className="custom-icon"
          sx={[{ opacity: 0.9 }]}
          testId="bolt-icon"
        />
      </MagicMuiThemeProvider>,
    );

    const el = screen.getByTestId('bolt-icon');
    expect(el.className).toContain('custom-icon');
    expect(window.getComputedStyle(el).fontSize).toBe('30px');
  });

  it('renders custom ReactNode icons cleanly', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicIcon
          icon={
            <svg data-testid="custom-svg" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
            </svg>
          }
          size="xl"
          color="success"
          ariaLabel="Custom status"
          sx={{ marginRight: 1 }}
          testId="node-wrapper"
        />
      </MagicMuiThemeProvider>,
    );

    const wrapper = screen.getByTestId('node-wrapper');
    expect(wrapper.getAttribute('role')).toBe('img');
    expect(wrapper.getAttribute('aria-label')).toBe('Custom status');
    expect(screen.getByTestId('custom-svg')).toBeTruthy();
  });

  it('returns null for empty string, whitespace, null, undefined, or false', () => {
    const { container } = render(
      <MagicMuiThemeProvider withCssBaseline={false}>
        <MagicIcon icon="" />
        <MagicIcon icon="   " />
        <MagicIcon icon={null} />
        <MagicIcon icon={undefined} />
        <MagicIcon icon={false} />
      </MagicMuiThemeProvider>,
    );

    expect(container.innerHTML).toBe('');
  });
});
