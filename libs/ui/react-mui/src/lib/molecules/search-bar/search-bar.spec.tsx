import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicSearchBar } from './search-bar';

afterEach(cleanup);

describe('MagicSearchBar (React MUI)', () => {
  it('renders a semantic search landmark composing form-field, text-input, and button', () => {
    const formRef = createRef<HTMLFormElement>();
    const onQueryChange = vi.fn();
    const onSearch = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicSearchBar
          ref={formRef}
          id="catalog-search"
          testId="magic-search"
          label="Search catalog"
          placeholder="Find components..."
          submitLabel="Find"
          onQueryChange={onQueryChange}
          onSearch={onSearch}
        />
      </MagicMuiThemeProvider>,
    );

    const landmark = screen.getByRole('search', { name: 'Search catalog' });
    expect(formRef.current).toBe(landmark);
    expect(landmark.getAttribute('id')).toBe('catalog-search');

    const input = screen.getByTestId('magic-search-input') as HTMLInputElement;
    expect(input.type).toBe('search');

    fireEvent.change(input, { target: { value: 'button' } });
    expect(onQueryChange).toHaveBeenCalledWith('button');

    fireEvent.click(screen.getByTestId('magic-search-submit'));
    expect(onSearch).toHaveBeenCalledWith('button');
  });

  it('supports uncontrolled defaultQuery and Enter submission via form submit', () => {
    const onSearch = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicSearchBar
          testId="uncontrolled-search"
          defaultQuery="tokens"
          onSearch={onSearch}
        />
      </MagicMuiThemeProvider>,
    );

    const input = screen.getByTestId(
      'uncontrolled-search-input',
    ) as HTMLInputElement;
    expect(input.value).toBe('tokens');

    fireEvent.submit(screen.getByTestId('uncontrolled-search'));
    expect(onSearch).toHaveBeenCalledWith('tokens');
  });

  it('supports controlled query mode', () => {
    const onQueryChange = vi.fn();
    const onSearch = vi.fn();

    const { rerender } = render(
      <MagicMuiThemeProvider>
        <MagicSearchBar
          testId="controlled-search"
          query="alpha"
          onQueryChange={onQueryChange}
          onSearch={onSearch}
        />
      </MagicMuiThemeProvider>,
    );

    const input = screen.getByTestId(
      'controlled-search-input',
    ) as HTMLInputElement;
    expect(input.value).toBe('alpha');

    fireEvent.change(input, { target: { value: 'beta' } });
    expect(onQueryChange).toHaveBeenCalledWith('beta');

    rerender(
      <MagicMuiThemeProvider>
        <MagicSearchBar
          testId="controlled-search"
          query="beta"
          onQueryChange={onQueryChange}
          onSearch={onSearch}
        />
      </MagicMuiThemeProvider>,
    );

    fireEvent.submit(screen.getByTestId('controlled-search'));
    expect(onSearch).toHaveBeenCalledWith('beta');
  });

  it('blocks submission when disabled or loading', () => {
    const onSearch = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicSearchBar
          testId="disabled-search"
          defaultQuery="locked"
          disabled
          onSearch={onSearch}
        />
        <MagicSearchBar
          testId="loading-search"
          defaultQuery="busy"
          loading
          onSearch={onSearch}
        />
      </MagicMuiThemeProvider>,
    );

    fireEvent.submit(screen.getByTestId('disabled-search'));
    fireEvent.submit(screen.getByTestId('loading-search'));

    expect(onSearch).not.toHaveBeenCalled();
    expect(
      (screen.getByTestId('disabled-search-input') as HTMLInputElement)
        .disabled,
    ).toBe(true);
    expect(
      (screen.getByTestId('loading-search-submit') as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });
});
