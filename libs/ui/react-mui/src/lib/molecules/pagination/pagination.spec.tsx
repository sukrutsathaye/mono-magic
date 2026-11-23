import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PAGINATION_SHAPES,
  PAGINATION_VARIANTS,
} from '@mono-magic/atomic-design-interfaces';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicPagination } from './pagination';

afterEach(cleanup);

describe('MagicPagination (React MUI)', () => {
  it('renders total count range, page buttons, first/last controls, and forwards ref', () => {
    const paginationRef = createRef<HTMLDivElement>();
    const onPageChange = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicPagination
          ref={paginationRef}
          id="users-pagination"
          testId="users-pagination"
          ariaLabel="Users pagination"
          totalItems={95}
          pageSize={10}
          defaultPage={1}
          showFirstLast
          showTotalCount
          onPageChange={onPageChange}
        />
      </MagicMuiThemeProvider>,
    );

    expect(paginationRef.current).toBeInstanceOf(HTMLDivElement);
    expect(screen.getByTestId('users-pagination-total').textContent).toBe(
      '1-10 of 95',
    );

    fireEvent.click(screen.getByTestId('users-pagination-item-page-2'));
    expect(onPageChange).toHaveBeenCalledWith(2);
    expect(screen.getByTestId('users-pagination-total').textContent).toBe(
      '11-20 of 95',
    );

    fireEvent.click(screen.getByTestId('users-pagination-item-last'));
    expect(onPageChange).toHaveBeenLastCalledWith(10);
    expect(screen.getByTestId('users-pagination-total').textContent).toBe(
      '91-95 of 95',
    );
  });

  it('supports pageSize selector and controlled page clamping', () => {
    const onPageSizeChange = vi.fn();
    const onPageChange = vi.fn();

    const { rerender } = render(
      <MagicMuiThemeProvider>
        <MagicPagination
          testId="table-pagination"
          totalItems={50}
          pageSize={10}
          defaultPage={5}
          showPageSizeSelector
          showTotalCount
          pageSizeOptions={[10, 25, 50]}
          onPageSizeChange={onPageSizeChange}
          onPageChange={onPageChange}
        />
      </MagicMuiThemeProvider>,
    );

    const selectTrigger = screen
      .getByTestId('table-pagination-page-size')
      .querySelector('[role="combobox"]');
    expect(selectTrigger).toBeTruthy();
    fireEvent.mouseDown(selectTrigger as Element);
    fireEvent.click(screen.getByRole('option', { name: '25' }));
    expect(onPageSizeChange).toHaveBeenCalledWith(25);

    rerender(
      <MagicMuiThemeProvider>
        <MagicPagination
          testId="table-pagination"
          totalItems={0}
          pageSize={25}
          page={2}
          showTotalCount
        />
      </MagicMuiThemeProvider>,
    );
    expect(screen.getByTestId('table-pagination-total').textContent).toBe(
      '0 of 0',
    );
  });

  it('supports all variants, shapes, sizes, colors, and disabled state', () => {
    for (const variant of PAGINATION_VARIANTS) {
      for (const shape of PAGINATION_SHAPES) {
        const { unmount } = render(
          <MagicMuiThemeProvider>
            <MagicPagination
              testId={`pag-${variant}-${shape}`}
              totalItems={60}
              variant={variant}
              shape={shape}
              color="tertiary"
              size="lg"
              sx={[{ p: 1 }]}
            />
          </MagicMuiThemeProvider>,
        );
        const root = screen.getByTestId(`pag-${variant}-${shape}`);
        expect(root.getAttribute('data-variant')).toBe(variant);
        expect(root.getAttribute('data-shape')).toBe(shape);
        unmount();
      }
    }

    const onPageChange = vi.fn();
    render(
      <MagicMuiThemeProvider>
        <MagicPagination
          testId="disabled-pag"
          totalItems={40}
          disabled
          size="xs"
          onPageChange={onPageChange}
        />
      </MagicMuiThemeProvider>,
    );
    const page2 = screen.getByTestId('disabled-pag-item-page-2');
    expect(page2.hasAttribute('disabled')).toBe(true);
  });
});
