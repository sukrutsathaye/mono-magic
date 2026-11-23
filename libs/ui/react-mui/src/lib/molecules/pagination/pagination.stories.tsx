import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, within } from 'storybook/test';
import { MagicPagination } from './pagination';

/**
 * `MagicPagination` is the Material 3 pagination molecule composing MUI v9
 * `Pagination`, `PaginationItem`, and `Select`.
 *
 * - **References**:
 *   - [MUI Pagination](https://mui.com/material-ui/react-pagination/)
 */
const meta: Meta<typeof MagicPagination> = {
  title: 'Molecules/Pagination',
  component: MagicPagination,
  tags: ['autodocs', 'snapshot'],
  args: {
    defaultPage: 1,
    totalItems: 125,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50],
    siblingCount: 1,
    boundaryCount: 1,
    showFirstLast: true,
    showPageSizeSelector: true,
    showTotalCount: true,
    variant: 'outlined',
    shape: 'rounded',
    color: 'primary',
    size: 'md',
    disabled: false,
    onPageChange: fn(),
    onPageSizeChange: fn(),
  },
  argTypes: {
    page: { control: 'number', table: { category: 'State' } },
    defaultPage: { control: 'number', table: { category: 'State' } },
    totalItems: { control: 'number', table: { category: 'Content' } },
    pageSize: { control: 'number', table: { category: 'Content' } },
    pageSizeOptions: { control: 'object', table: { category: 'Content' } },
    siblingCount: { control: 'number', table: { category: 'Layout' } },
    boundaryCount: { control: 'number', table: { category: 'Layout' } },
    showFirstLast: { control: 'boolean', table: { category: 'Behavior' } },
    showPageSizeSelector: { control: 'boolean', table: { category: 'Behavior' } },
    showTotalCount: { control: 'boolean', table: { category: 'Behavior' } },
    variant: {
      control: 'select',
      options: ['text', 'outlined', 'filled'],
      table: { category: 'Appearance' },
    },
    shape: {
      control: 'select',
      options: ['rounded', 'circular'],
      table: { category: 'Appearance' },
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'tertiary',
        'success',
        'warning',
        'error',
        'neutral',
      ],
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: { category: 'Appearance' },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
    onPageChange: { action: 'pageChanged', table: { category: 'Events' } },
    onPageSizeChange: { action: 'pageSizeChanged', table: { category: 'Events' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicPagination>;

function InteractivePaginationDemo() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = 95;

  return (
    <Stack spacing={2} sx={{ maxWidth: 720 }}>
      <Typography variant="body2" color="text.secondary" data-testid="page-banner">
        Viewing page {page} with {pageSize} rows per page
      </Typography>
      <MagicPagination
        testId="interactive-pagination"
        page={page}
        totalItems={totalItems}
        pageSize={pageSize}
        pageSizeOptions={[10, 25, 50]}
        showFirstLast
        showPageSizeSelector
        showTotalCount
        variant="filled"
        shape="rounded"
        onPageChange={setPage}
        onPageSizeChange={(nextSize) => {
          setPageSize(nextSize);
          setPage(1);
        }}
      />
    </Stack>
  );
}

/**
 * Stateful interactive pagination with live page switching, page-size selector, and item range summary.
 */
export const InteractiveDataTablePagination: Story = {
  render: () => <InteractivePaginationDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('interactive-pagination-total')).toHaveTextContent(
      '1-10 of 95',
    );
    await userEvent.click(canvas.getByTestId('interactive-pagination-item-page-3'));
    await expect(canvas.getByTestId('page-banner')).toHaveTextContent(
      'Viewing page 3 with 10 rows per page',
    );
    await expect(canvas.getByTestId('interactive-pagination-total')).toHaveTextContent(
      '21-30 of 95',
    );

    const sizeCombo = within(
      canvas.getByTestId('interactive-pagination-page-size'),
    ).getByRole('combobox');
    await userEvent.click(sizeCombo);
    const opt25 = await screen.findByRole('option', { name: '25' });
    await userEvent.click(opt25);
    await expect(canvas.getByTestId('page-banner')).toHaveTextContent(
      'Viewing page 1 with 25 rows per page',
    );
    await expect(canvas.getByTestId('interactive-pagination-total')).toHaveTextContent(
      '1-25 of 95',
    );
  },
};

/**
 * Comparison of `text`, `outlined`, and `filled` variants and `circular` vs `rounded` shapes.
 */
export const VariantsAndShapes: Story = {
  render: () => (
    <Stack spacing={2.5} sx={{ maxWidth: 680 }}>
      <MagicPagination
        totalItems={80}
        defaultPage={2}
        variant="text"
        shape="circular"
        color="primary"
      />
      <MagicPagination
        totalItems={80}
        defaultPage={3}
        variant="outlined"
        shape="rounded"
        color="secondary"
      />
      <MagicPagination
        totalItems={80}
        defaultPage={4}
        variant="filled"
        shape="circular"
        color="tertiary"
        showFirstLast
      />
    </Stack>
  ),
};

/**
 * Disabled and compact (`xs`) vs large (`lg`) pagination presets.
 */
export const SizesAndDisabled: Story = {
  render: () => (
    <Stack spacing={2} sx={{ maxWidth: 680 }}>
      <MagicPagination totalItems={50} size="xs" variant="outlined" showTotalCount />
      <MagicPagination totalItems={50} size="lg" variant="filled" color="success" />
      <MagicPagination totalItems={50} disabled variant="outlined" showFirstLast />
    </Stack>
  ),
};
