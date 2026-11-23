import { signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  type BreadcrumbItem,
  MagicBreadcrumbsComponent,
} from './breadcrumbs.component';

const CATALOG_TRAIL: readonly BreadcrumbItem[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'workspace', label: 'Workspace', icon: 'workspaces' },
  { id: 'design', label: 'Design System' },
  { id: 'molecules', label: 'Molecules' },
  { id: 'breadcrumbs', label: 'Breadcrumbs', current: true },
];

/**
 * `MagicBreadcrumbsComponent` renders an accessible WAI-ARIA breadcrumb trail
 * supporting icons, custom text or Material icon separators, `maxItems` middle
 * collapsing with interactive expansion, disabled items, and size/color tokens.
 *
 * - **References**:
 *   - [WAI-ARIA Breadcrumb Pattern](https://www.wAI.org/WAI/ARIA/apg/patterns/breadcrumb/)
 */
const meta: Meta<MagicBreadcrumbsComponent> = {
  title: 'Molecules/Breadcrumbs',
  component: MagicBreadcrumbsComponent,
  args: {
    items: CATALOG_TRAIL,
    separator: 'chevron_right',
    itemsBeforeCollapse: 1,
    itemsAfterCollapse: 1,
    color: 'primary',
    size: 'md',
    disabled: false,
    itemClicked: fn(),
  },
  argTypes: {
    items: { control: 'object', table: { category: 'Data' } },
    separator: { control: 'text', table: { category: 'Appearance' } },
    maxItems: { control: 'number', table: { category: 'Layout' } },
    itemsBeforeCollapse: { control: 'number', table: { category: 'Layout' } },
    itemsAfterCollapse: { control: 'number', table: { category: 'Layout' } },
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
    itemClicked: { action: 'itemClicked', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<MagicBreadcrumbsComponent>;

/**
 * Interactive breadcrumb navigation where clicking any crumb updates the active trail.
 */
export const InteractiveTrail: Story = {
  render: (args) => {
    const trail = signal<readonly BreadcrumbItem[]>(CATALOG_TRAIL);

    return {
      props: {
        ...args,
        trail,
        onSelect(item: BreadcrumbItem) {
          const idx = trail().findIndex((entry) => entry.id === item.id);
          if (idx >= 0) {
            trail.set(
              trail()
                .slice(0, idx + 1)
                .map((entry, i, arr) => ({
                  ...entry,
                  current: i === arr.length - 1,
                })),
            );
          }
          args.itemClicked?.(item);
        },
        resetTrail() {
          trail.set(CATALOG_TRAIL);
        },
      },
      template: `
        <div style="display: grid; gap: 12px;">
          <magic-breadcrumbs
            [items]="trail()"
            [separator]="separator"
            [color]="color"
            [size]="size"
            [disabled]="disabled"
            testId="interactive-bc"
            (itemClicked)="onSelect($event)"
          />
          <div>
            <button type="button" data-testid="bc-reset" (click)="resetTrail()">
              Reset Trail
            </button>
          </div>
        </div>
      `,
    };
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('interactive-bc-item-design'));
    await expect(args.itemClicked).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'design' }),
    );
    await expect(
      canvas.queryByTestId('interactive-bc-item-breadcrumbs'),
    ).toBeNull();
    await userEvent.click(canvas.getByTestId('bc-reset'));
    await expect(
      canvas.getByTestId('interactive-bc-item-breadcrumbs'),
    ).toBeInTheDocument();
  },
};

/**
 * Collapsed long trail (`maxItems = 3`) expanding when the ellipsis button is clicked.
 */
export const CollapsedWithExpand: Story = {
  args: {
    maxItems: 3,
    itemsBeforeCollapse: 1,
    itemsAfterCollapse: 2,
    separator: '/',
    testId: 'collapsed-bc',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryByTestId('collapsed-bc-item-workspace'),
    ).toBeNull();
    await userEvent.click(canvas.getByTestId('collapsed-bc-expand'));
    await expect(
      canvas.getByTestId('collapsed-bc-item-workspace'),
    ).toBeInTheDocument();
  },
};

/**
 * Breadcrumb trail with disabled item, custom separators, and size comparison.
 */
export const SeparatorsDisabledAndSizes: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 14px;">
        <magic-breadcrumbs
          [items]="[
            { id: 'root', label: 'Root', icon: 'folder' },
            { id: 'locked', label: 'Restricted', disabled: true },
            { id: 'file', label: 'tokens.json', current: true }
          ]"
          separator=">"
          size="sm"
        />
        <magic-breadcrumbs
          [items]="[
            { id: 'home', label: 'Home', icon: 'home' },
            { id: 'docs', label: 'Docs' },
            { id: 'api', label: 'API Reference', current: true }
          ]"
          separator="chevron_right"
          color="secondary"
          size="lg"
        />
      </div>
    `,
  }),
};
