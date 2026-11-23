import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicPagination } from './pagination';

afterEach(cleanup);

describe('MagicPagination', () => {
  it('renders page buttons, ellipsis, total count, and navigates between pages', () => {
    const ref = createRef<View>();
    const onPageChange = vi.fn();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicPagination
          ref={ref}
          id="table-pager"
          testId="rn-pager"
          totalItems={95}
          pageSize={10}
          defaultPage={1}
          showFirstLast
          showTotalCount
          onPageChange={onPageChange}
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    expect(screen.getByTestId('rn-pager').getAttribute('id')).toBe(
      'table-pager'
    );
    expect(screen.getByTestId('rn-pager-total').textContent).toBe('1-10 of 95');
    expect(screen.getByTestId('rn-pager-end-ellipsis')).toBeTruthy();

    fireEvent.click(screen.getByTestId('rn-pager-next'));
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(screen.getByTestId('rn-pager-total').textContent).toBe('11-20 of 95');

    fireEvent.click(screen.getByTestId('rn-pager-last'));
    expect(onPageChange).toHaveBeenLastCalledWith(10);
    expect(screen.getByTestId('rn-pager-total').textContent).toBe('91-95 of 95');
    expect(screen.getByTestId('rn-pager-start-ellipsis')).toBeTruthy();

    fireEvent.click(screen.getByTestId('rn-pager-prev'));
    expect(onPageChange).toHaveBeenLastCalledWith(9);

    fireEvent.click(screen.getByTestId('rn-pager-first'));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
  });

  it('supports interactive pageSize selector and updates total pages', () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicPagination
          testId="size-pager"
          totalItems={100}
          defaultPage={4}
          pageSizeOptions={[10, 25, 50]}
          showPageSizeSelector
          showTotalCount
          variant="outlined"
          shape="circular"
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('size-pager-page-size-value').textContent).toBe(
      '10'
    );
    fireEvent.click(screen.getByTestId('size-pager-page-size-trigger'));
    expect(screen.getByTestId('size-pager-page-size-menu')).toBeTruthy();

    fireEvent.click(screen.getByTestId('size-pager-page-size-option-50'));
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(screen.getByTestId('size-pager-page-size-value').textContent).toBe(
      '50'
    );
    expect(screen.getByTestId('size-pager-total').textContent).toBe(
      '51-100 of 100'
    );
  });

  it('supports controlled page, filled variant, disabled state, and zero items', () => {
    const onPageChange = vi.fn();

    const { rerender } = render(
      <MagicPaperProvider palette="dark-theme">
        <MagicPagination
          testId="ctrl-pager"
          totalItems={50}
          pageSize={10}
          page={2}
          variant="filled"
          color="tertiary"
          size="lg"
          onPageChange={onPageChange}
        />
      </MagicPaperProvider>
    );

    expect(
      screen.getByTestId('ctrl-pager-page-2').getAttribute('aria-current')
    ).toBe('page');
    fireEvent.click(screen.getByTestId('ctrl-pager-page-3'));
    expect(onPageChange).toHaveBeenCalledWith(3);

    rerender(
      <MagicPaperProvider palette="dark-theme">
        <MagicPagination
          testId="ctrl-pager"
          totalItems={0}
          pageSize={10}
          disabled
          showTotalCount
          showPageSizeSelector
          size="xs"
          onPageChange={onPageChange}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('ctrl-pager-total').textContent).toBe('0-0 of 0');
    fireEvent.click(screen.getByTestId('ctrl-pager-next'));
    expect(onPageChange).toHaveBeenCalledTimes(1);
  });
});
