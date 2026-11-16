import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicSearchBar } from './search-bar';

afterEach(cleanup);

describe('MagicSearchBar (React MUI)', () => {
  it('composes TextInput and Button atoms and submits the query', () => {
    const onQueryChange = vi.fn();
    const onSearch = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicSearchBar
          testId="search-bar"
          label="Catalog"
          submitLabel="Go"
          onQueryChange={onQueryChange}
          onSearch={onSearch}
        />
      </MagicMuiThemeProvider>
    );

    const input = screen.getByTestId('search-bar-input');
    fireEvent.change(input, { target: { value: 'atomic' } });
    expect(onQueryChange).toHaveBeenCalledWith('atomic');

    const submit = screen.getByTestId('search-bar-submit');
    fireEvent.click(submit);
    expect(onSearch).toHaveBeenCalledWith('atomic');
  });
});
