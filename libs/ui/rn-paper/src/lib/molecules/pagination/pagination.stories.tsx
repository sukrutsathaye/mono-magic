import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text, View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicPagination } from './pagination';

/**
 * `MagicPagination` is the Material 3 pagination molecule for `@mono-magic/rn-paper`.
 *
 * It supports 1-indexed paging, ellipsis collapsing (`siblingCount` / `boundaryCount`),
 * first/last jump buttons, total count ranges, an interactive page-size dropdown,
 * `'text' | 'outlined' | 'filled'` variants, and `'rounded' | 'circular'` shapes.
 */
const meta: Meta<typeof MagicPagination> = {
  title: 'Molecules/Pagination',
  component: MagicPagination,
  tags: ['autodocs', 'snapshot'],
  args: {
    totalItems: 120,
    pageSize: 10,
    defaultPage: 1,
    siblingCount: 1,
    boundaryCount: 1,
    showFirstLast: true,
    showPageSizeSelector: false,
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
    showFirstLast: { control: 'boolean', table: { category: 'Controls' } },
    showPageSizeSelector: { control: 'boolean', table: { category: 'Controls' } },
    showTotalCount: { control: 'boolean', table: { category: 'Controls' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    onPageChange: { action: 'pageChanged', table: { category: 'Events' } },
    onPageSizeChange: { action: 'pageSizeChanged', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicPagination>;

function InteractiveDataPagerDemo(
  args: React.ComponentProps<typeof MagicPagination>
) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  return (
    <View style={{ maxWidth: 680, width: '100%', gap: 12, minHeight: 160 }}>
      <Text style={{ fontWeight: '600' }}>
        {`Viewing Page ${page} (${pageSize} rows/page)`}
      </Text>
      <MagicPagination
        testId="story-pagination"
        totalItems={95}
        page={page}
        pageSize={pageSize}
        pageSizeOptions={[10, 25, 50]}
        showFirstLast
        showTotalCount
        showPageSizeSelector
        variant="outlined"
        shape="rounded"
        onPageChange={(nextPage) => {
          setPage(nextPage);
          args.onPageChange?.(nextPage);
        }}
        onPageSizeChange={(nextSize) => {
          setPageSize(nextSize);
          args.onPageSizeChange?.(nextSize);
        }}
      />
    </View>
  );
}

/**
 * Stateful pagination table controller with live page switching and rows-per-page selector.
 */
export const InteractiveDataPager: Story = {
  render: (args) => <InteractiveDataPagerDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('story-pagination-next'));
    await expect(args.onPageChange).toHaveBeenCalledWith(2);
    await expect(canvas.getByText('11-20 of 95')).toBeInTheDocument();

    await userEvent.click(
      canvas.getByTestId('story-pagination-page-size-trigger')
    );
    await userEvent.click(
      canvas.getByTestId('story-pagination-page-size-option-25')
    );
    await expect(args.onPageSizeChange).toHaveBeenCalledWith(25);
    await expect(canvas.getByText('1-25 of 95')).toBeInTheDocument();
  },
};

/**
 * Circular filled and text pagination variants across sizes.
 */
export const VariantsAndShapes: Story = {
  render: () => (
    <View style={{ gap: 16, maxWidth: 640, width: '100%' }}>
      <MagicPagination
        totalItems={80}
        defaultPage={4}
        variant="filled"
        shape="circular"
        color="secondary"
        size="sm"
        showFirstLast
      />
      <MagicPagination
        totalItems={80}
        defaultPage={3}
        variant="text"
        shape="rounded"
        color="tertiary"
        size="md"
        showTotalCount
      />
      <MagicPagination
        totalItems={40}
        defaultPage={2}
        variant="outlined"
        disabled
        showFirstLast
        showTotalCount
      />
    </View>
  ),
};

/**
 * Pagination rendered inside a dark Material 3 palette.
 */
export const DarkTheme: Story = {
  render: () => (
    <MagicPaperProvider palette="dark-theme">
      <View style={{ backgroundColor: '#121410', padding: 16, borderRadius: 12 }}>
        <MagicPagination
          totalItems={120}
          defaultPage={5}
          showFirstLast
          showTotalCount
          showPageSizeSelector
          variant="filled"
          shape="circular"
        />
      </View>
    </MagicPaperProvider>
  ),
};
