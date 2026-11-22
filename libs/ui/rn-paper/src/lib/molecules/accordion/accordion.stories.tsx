import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicAccordion, type AccordionItem } from './accordion';

const SAMPLE_ITEMS: readonly AccordionItem[] = [
  {
    id: 'tokens',
    title: 'Material 3 Design Tokens',
    summary: 'Color, typography, and spacing presets',
    icon: 'palette',
    content:
      'All UI packages share canonical color intents, size metrics, and corner radii through MagicPaperProvider.',
    expanded: true,
  },
  {
    id: 'a11y',
    title: 'Accessibility & Keyboard Support',
    summary: 'WCAG 2.1 AA ARIA roles and live regions',
    icon: 'accessibility',
    content:
      'Interactive controls expose aria-expanded, aria-controls, and semantic accessibility states across web and native.',
  },
  {
    id: 'enterprise',
    title: 'Enterprise Overrides (Locked)',
    summary: 'Disabled panel demonstration',
    icon: 'lock',
    disabled: true,
    content: 'Unavailable in sandbox mode.',
  },
];

/**
 * `MagicAccordion` is the Material 3 collapsible panel group molecule for `@mono-magic/rn-paper`.
 *
 * It supports single or multi-panel expansion via `useControllableState`, `'outlined'`
 * and `'raised'` surface appearances, leading icons, summary captions, and disabled panels.
 */
const meta: Meta<typeof MagicAccordion> = {
  title: 'Molecules/Accordion',
  component: MagicAccordion,
  tags: ['autodocs', 'snapshot'],
  args: {
    items: SAMPLE_ITEMS,
    multiple: false,
    appearance: 'outlined',
    size: 'md',
    onExpandedChange: fn(),
    onItemToggle: fn(),
  },
  argTypes: {
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
    multiple: { control: 'boolean', table: { category: 'Behavior' } },
    items: { control: 'object', table: { category: 'Content' } },
    onExpandedChange: { action: 'expandedChanged', table: { category: 'Events' } },
    onItemToggle: { action: 'itemToggled', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicAccordion>;

/**
 * Default single-expand outlined accordion with interactive panel toggle test.
 */
export const Default: Story = {
  args: {
    testId: 'story-accordion',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const secondHeader = canvas.getByRole('button', {
      name: 'Accessibility & Keyboard Support',
    });
    await userEvent.click(secondHeader);
    await expect(args.onExpandedChange).toHaveBeenCalledWith(['a11y']);
    await expect(secondHeader).toHaveAttribute('aria-expanded', 'true');
  },
};

/**
 * Raised multi-expand accordion allowing multiple panels open concurrently.
 */
export const MultiRaised: Story = {
  args: {
    multiple: true,
    appearance: 'raised',
    defaultExpandedIds: ['tokens', 'a11y'],
  },
};

/**
 * Accordion rendered inside a dark Material 3 palette.
 */
export const DarkTheme: Story = {
  render: () => (
    <MagicPaperProvider palette="dark-theme">
      <View style={{ backgroundColor: '#121410', padding: 16, borderRadius: 12 }}>
        <MagicAccordion
          items={SAMPLE_ITEMS}
          appearance="raised"
          multiple
          defaultExpandedIds={['tokens']}
        />
      </View>
    </MagicPaperProvider>
  ),
};
