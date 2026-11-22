import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { AccordionItem } from '@mono-magic/atomic-design-interfaces';
import { MagicAccordion } from './accordion';

const DEFAULT_ITEMS: readonly AccordionItem[] = [
  {
    id: 'tokens',
    title: 'Material 3 Design Tokens',
    summary: '7 built-in themes and semantic color intents',
    content:
      'Every component resolves surface, outline, primary, secondary, tertiary, success, warning, error, and neutral roles.',
    icon: 'palette',
    expanded: true,
  },
  {
    id: 'a11y',
    title: 'Accessibility & Keyboard Support',
    summary: 'WCAG 2.1 AA ARIA landmarks',
    content:
      'Headers and regions wire aria-controls and aria-labelledby automatically.',
    icon: 'accessibility_new',
  },
  {
    id: 'testing',
    title: 'Visual Snapshot Testing',
    summary: 'Chromium visual regression baselines',
    content:
      'Stories tagged with snapshot are verified on every change via storybook-addon-vis.',
    icon: 'verified',
  },
  {
    id: 'archived',
    title: 'Deprecated Legacy Panel',
    content: 'Unavailable in current workspace.',
    icon: 'lock',
    disabled: true,
  },
];

/**
 * `MagicAccordion` is the Material 3 collapsible panel group molecule composing
 * MUI v9 `Accordion`, `AccordionSummary`, `AccordionDetails`, and `MagicIcon`.
 *
 * - **References**:
 *   - [MUI Accordion](https://mui.com/material-ui/react-accordion/)
 */
const meta: Meta<typeof MagicAccordion> = {
  title: 'Molecules/Accordion',
  component: MagicAccordion,
  tags: ['autodocs', 'snapshot'],
  args: {
    items: DEFAULT_ITEMS,
    multiple: false,
    appearance: 'outlined',
    size: 'md',
    onExpandedChange: fn(),
  },
  argTypes: {
    items: { control: 'object', table: { category: 'Content' } },
    multiple: { control: 'boolean', table: { category: 'Behavior' } },
    expandedIds: { control: 'object', table: { category: 'State' } },
    defaultExpandedIds: { control: 'object', table: { category: 'State' } },
    appearance: {
      control: 'select',
      options: ['outlined', 'raised'],
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: { category: 'Appearance' },
    },
    onExpandedChange: { action: 'expandedChanged', table: { category: 'Events' } },
    renderItemContent: { control: false, table: { category: 'Slots' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
  render: (args) => (
    <Stack sx={{ maxWidth: 620 }}>
      <MagicAccordion {...args} />
    </Stack>
  ),
};

export default meta;
type Story = StoryObj<typeof MagicAccordion>;

/**
 * Default single-expansion outlined accordion verifying panel toggling.
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const a11yHeader = canvas.getByRole('button', {
      name: /Accessibility & Keyboard Support/i,
    });
    await userEvent.click(a11yHeader);
    await expect(args.onExpandedChange).toHaveBeenCalledWith(
      ['a11y'],
      expect.objectContaining({ id: 'a11y' }),
    );
  },
};

/**
 * Multi-expansion raised accordion allowing multiple sections open together.
 */
export const MultipleRaised: Story = {
  args: {
    multiple: true,
    appearance: 'raised',
    defaultExpandedIds: ['tokens', 'a11y'],
  },
};

/**
 * Comparison of compact (`xs`) and spacious (`lg`) accordion density presets.
 */
export const Sizes: Story = {
  render: () => (
    <Stack spacing={3} sx={{ maxWidth: 620 }}>
      <MagicAccordion
        size="xs"
        items={DEFAULT_ITEMS.slice(0, 2)}
        defaultExpandedIds={['tokens']}
      />
      <MagicAccordion
        size="lg"
        appearance="raised"
        items={DEFAULT_ITEMS.slice(0, 2)}
        defaultExpandedIds={['a11y']}
      />
    </Stack>
  ),
};
