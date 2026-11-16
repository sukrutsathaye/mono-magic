import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicSearchBar } from './search-bar';

afterEach(cleanup);

describe('MagicSearchBar (React Native Paper)', () => {
  it('composes MagicTextInput and MagicButton and submits query', () => {
    const onQueryChange = vi.fn();
    const onSearch = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicSearchBar
          testId="rn-search"
          label="Catalog"
          submitLabel="Go"
          onQueryChange={onQueryChange}
          onSearch={onSearch}
        />
      </MagicPaperProvider>
    );

    const input = screen.getByTestId('rn-search-input');
    fireEvent.change(input, { target: { value: 'atomic' } });
    expect(onQueryChange).toHaveBeenCalledWith('atomic');

    const submit = screen.getByTestId('rn-search-submit');
    fireEvent.click(submit);
    expect(onSearch).toHaveBeenCalledWith('atomic');
  });
});
