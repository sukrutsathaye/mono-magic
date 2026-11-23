import { signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaginationComponent } from './pagination.component';

/**
 * `MagicPaginationComponent` provides 1-indexed page navigation with
 * configurable `boundaryCount` & `siblingCount` ellipses, first/last jump
 * buttons, a live `MatSelect` page-size selector (`showPageSizeSelector`),
 * range summary (`showTotalCount`), `text` / `outlined` / `filled` variants,
 * and `rounded` / `circular` button shapes.
 *
 * - **References**:
 *   - [Angular Material Paginator](https://material.angular.dev/components/paginator/overview)
 */
const meta: Meta<MagicPaginationComponent> = {
  title: 'Molecules/Pagination',
  component: MagicPaginationComponent,
  args: {
    totalItems: 120,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50],
    defaultPage: 1,
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
    pageChange: fn(),
    pageSizeChange: fn(),
  },
  argTypes: {
    page: { control: 'number', table: { category: 'State' } },
    defaultPage: { control: 'number', table: { category: 'State' } },
    totalItems: { control: 'number', table: { category: 'Data' } },
    pageSize: { control: 'number', table: { category: 'Data' } },
    pageSizeOptions: { control: 'object', table: { category: 'Data' } },
    siblingCount: { control: 'number', table: { category: 'Layout' } },
    boundaryCount: { control: 'number', table: { category: 'Layout' } },
    showFirstLast: { control: 'boolean', table: { category: 'Features' } },
    showPageSizeSelector: { control: 'boolean', table: { category: 'Features' } },
    showTotalCount: { control: 'boolean', table: { category: 'Features' } },
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
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    pageChange: { action: 'pageChange', table: { category: 'Events' } },
    pageSizeChange: { action: 'pageSizeChange', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<MagicPaginationComponent>;

/**
 * Interactive pagination bar with live page switching, page-size selector, first/last jumps, and total count.
 */
export const InteractivePagination: Story = {
  render: (args) => {
    const currentPage = signal(1);
    const currentSize = signal(10);

    return {
      props: {
        ...args,
        currentPage,
        currentSize,
        onPage(p: number) {
          currentPage.set(p);
          args.pageChange?.(p);
        },
        onPageSize(s: number) {
          currentSize.set(s);
          args.pageSizeChange?.(s);
        },
      },
      template: `
        <div style="display: grid; gap: 12px;">
          <magic-pagination
            [page]="currentPage()"
            [totalItems]="totalItems"
            [pageSize]="currentSize()"
            [pageSizeOptions]="pageSizeOptions"
            [siblingCount]="siblingCount"
            [boundaryCount]="boundaryCount"
            [showFirstLast]="showFirstLast"
            [showPageSizeSelector]="showPageSizeSelector"
            [showTotalCount]="showTotalCount"
            [variant]="variant"
            [shape]="shape"
            [color]="color"
            [size]="size"
            [disabled]="disabled"
            testId="interactive-pg"
            (pageChange)="onPage($event)"
            (pageSizeChange)="onPageSize($event)"
          />
          <p data-testid="pg-live-readout" style="margin: 0; font-size: 0.875rem;">
            Showing page {{ currentPage() }} ({{ currentSize() }} per page)
          </p>
        </div>
      `,
    };
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('interactive-pg-next'));
    await expect(args.pageChange).toHaveBeenCalledWith(2);
    await expect(canvas.getByTestId('pg-live-readout')).toHaveTextContent(
      'Showing page 2 (10 per page)',
    );
    await userEvent.click(canvas.getByTestId('interactive-pg-last'));
    await expect(args.pageChange).toHaveBeenCalledWith(12);

    const selectTrigger = canvas.getByTestId('interactive-pg-page-size');
    await userEvent.click(selectTrigger);
    const doc = within(document.body);
    await userEvent.click(doc.getByRole('option', { name: '25' }));
    await expect(args.pageSizeChange).toHaveBeenCalledWith(25);
  },
};

/**
 * Circular filled, outlined, and text variants across colors and sizes.
 */
export const VariantsShapesAndSizes: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 16px;">
        <magic-pagination [totalItems]="80" [defaultPage]="4" variant="text" shape="rounded" color="primary" size="sm" />
        <magic-pagination [totalItems]="80" [defaultPage]="4" variant="outlined" shape="circular" color="secondary" size="md" [showFirstLast]="true" />
        <magic-pagination [totalItems]="80" [defaultPage]="4" variant="filled" shape="circular" color="tertiary" size="lg" [showTotalCount]="true" />
        <magic-pagination [totalItems]="50" [defaultPage]="2" variant="outlined" [disabled]="true" />
      </div>
    `,
  }),
};
