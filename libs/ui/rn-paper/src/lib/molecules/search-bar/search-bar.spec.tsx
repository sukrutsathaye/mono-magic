import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicSearchBar } from './search-bar';

afterEach(cleanup);

describe('MagicSearchBar', () => {
  it('composes MagicFormField, MagicTextInput, and MagicButton inside a search landmark', () => {
    const onQueryChange = vi.fn();
    const onSearch = vi.fn();
    const ref = createRef<View>();

    render(
      <MagicPaperProvider>
        <MagicSearchBar
          ref={ref}
          id="catalog-search"
          testId="rn-search"
          label="Catalog"
          placeholder="Find components..."
          submitLabel="Go"
          onQueryChange={onQueryChange}
          onSearch={onSearch}
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    const landmark = screen.getByRole('search', { name: 'Catalog' });
    expect(landmark).toBeTruthy();

    const input = screen.getByTestId('rn-search-input') as HTMLInputElement;
    expect(input.getAttribute('type')).toBe('search');
    fireEvent.change(input, { target: { value: 'atomic' } });
    expect(onQueryChange).toHaveBeenCalledWith('atomic');

    const submit = screen.getByTestId('rn-search-submit');
    fireEvent.click(submit);
    expect(onSearch).toHaveBeenCalledWith('atomic');
  });

  it('submits query when pressing Enter inside the search input', () => {
    const onSearch = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicSearchBar
          testId="enter-search"
          defaultQuery="tokens"
          onSearch={onSearch}
        />
      </MagicPaperProvider>
    );

    const input = screen.getByTestId('enter-search-input');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSearch).toHaveBeenCalledWith('tokens');
  });

  it('supports controlled query prop', () => {
    const onQueryChange = vi.fn();
    const onSearch = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicSearchBar
          testId="ctrl-search"
          query="paper"
          onQueryChange={onQueryChange}
          onSearch={onSearch}
        />
      </MagicPaperProvider>
    );

    const input = screen.getByTestId('ctrl-search-input') as HTMLInputElement;
    expect(input.value).toBe('paper');

    fireEvent.click(screen.getByTestId('ctrl-search-submit'));
    expect(onSearch).toHaveBeenCalledWith('paper');
  });

  it('blocks interaction and submission when disabled or loading', () => {
    const onSearch = vi.fn();
    const { rerender } = render(
      <MagicPaperProvider>
        <MagicSearchBar
          testId="locked-search"
          defaultQuery="locked"
          disabled
          onSearch={onSearch}
        />
      </MagicPaperProvider>
    );

    const input = screen.getByTestId('locked-search-input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
    fireEvent.click(screen.getByTestId('locked-search-submit'));
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSearch).not.toHaveBeenCalled();

    rerender(
      <MagicPaperProvider>
        <MagicSearchBar
          testId="locked-search"
          defaultQuery="loading"
          loading
          onSearch={onSearch}
        />
      </MagicPaperProvider>
    );

    fireEvent.click(screen.getByTestId('locked-search-submit'));
    fireEvent.keyDown(screen.getByTestId('locked-search-input'), {
      key: 'Enter',
    });
    expect(onSearch).not.toHaveBeenCalled();
  });
});
