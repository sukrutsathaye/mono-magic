import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { BreadcrumbItem } from '@mono-magic/atomic-design-interfaces';
import { MagicBreadcrumbs } from './breadcrumbs';

const FULL_TRAIL: readonly BreadcrumbItem[] = [
  { id: 'workspace', label: 'Workspace', icon: 'home' },
  { id: 'libs', label: 'Libs', icon: 'folder' },
  { id: 'ui', label: 'UI Kit' },
  { id: 'molecules', label: 'Molecules' },
  { id: 'breadcrumbs', label: 'Breadcrumbs' },
];

/**
 * `MagicBreadcrumbs` is the Material 3 navigation trail molecule composing
 * MUI v9 `Breadcrumbs`, `Link`, `Typography`, and `MagicIcon`.
 *
 * - **References**:
 *   - [MUI Breadcrumbs](https://mui.com/material-ui/react-breadcrumbs/)
 */
const meta: Meta<typeof MagicBreadcrumbs> = {
  title: 'Molecules/Breadcrumbs',
  component: MagicBreadcrumbs,
  tags: ['autodocs', 'snapshot'],
  args: {
    items: FULL_TRAIL,
    separator: 'chevron_right',
    color: 'primary',
    size: 'md',
    disabled: false,
    onItemClick: fn(),
  },
  argTypes: {
    items: { control: 'object', table: { category: 'Content' } },
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
    onItemClick: { action: 'itemClicked', table: { category: 'Events' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicBreadcrumbs>;

function InteractiveTrailDemo() {
  const [activeLength, setActiveLength] = useState(FULL_TRAIL.length);
  const visibleTrail = FULL_TRAIL.slice(0, activeLength).map((item, idx) => ({
    ...item,
    current: idx === activeLength - 1,
  }));

  return (
    <Stack spacing={1.5}>
      <MagicBreadcrumbs
        testId="interactive-breadcrumbs"
        items={visibleTrail}
        separator="chevron_right"
        onItemClick={(_item, index) => setActiveLength(index + 1)}
      />
      <Typography variant="caption" color="text.secondary" data-testid="active-location">
        Current location: {visibleTrail[visibleTrail.length - 1]?.label}
      </Typography>
    </Stack>
  );
}

/**
 * Stateful interactive breadcrumb trail where clicking any ancestor updates the active trail.
 */
export const InteractiveTrail: Story = {
  render: () => <InteractiveTrailDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('active-location')).toHaveTextContent(
      'Current location: Breadcrumbs',
    );
    await userEvent.click(canvas.getByTestId('interactive-breadcrumbs-item-libs'));
    await expect(canvas.getByTestId('active-location')).toHaveTextContent(
      'Current location: Libs',
    );
  },
};

/**
 * Collapsed long trail with `maxItems={3}` expanding on ellipsis click.
 */
export const CollapsedWithMaxItems: Story = {
  args: {
    testId: 'collapsed-breadcrumbs',
    maxItems: 3,
    itemsBeforeCollapse: 1,
    itemsAfterCollapse: 1,
    separator: '/',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const expandButton = canvas.getByRole('button', { name: /show path/i });
    await userEvent.click(expandButton);
    await expect(canvas.getByText('Molecules')).toBeVisible();
  },
};

/**
 * Sizes, custom separators, and disabled breadcrumb items comparison.
 */
export const SizesAndDisabled: Story = {
  render: () => (
    <Stack spacing={2}>
      <MagicBreadcrumbs
        size="sm"
        separator="›"
        color="secondary"
        items={[
          { id: 'home', label: 'Root', icon: 'home' },
          { id: 'locked', label: 'Restricted', disabled: true },
          { id: 'leaf', label: 'Details' },
        ]}
      />
      <MagicBreadcrumbs
        size="lg"
        separator="navigate_next"
        color="tertiary"
        items={FULL_TRAIL.slice(0, 3)}
      />
      <MagicBreadcrumbs
        size="md"
        disabled
        items={FULL_TRAIL.slice(0, 3)}
      />
    </Stack>
  ),
};
