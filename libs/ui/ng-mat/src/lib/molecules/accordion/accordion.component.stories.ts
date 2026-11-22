import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicAccordionComponent } from './accordion.component';

/**
 * `MagicAccordionComponent` composes `MatAccordion` and `MatExpansionPanel`
 * with single and multi-expand modes, controlled/uncontrolled state, icons,
 * summaries, `outlined`/`raised` M3 surface styling, and `[magicAccordionPanel]`
 * templates.
 *
 * - **References**:
 *   - [Angular Material Expansion](https://material.angular.dev/components/expansion/overview)
 */
const meta: Meta<MagicAccordionComponent> = {
  title: 'Molecules/Accordion',
  component: MagicAccordionComponent,
  args: {
    multiple: false,
    appearance: 'outlined',
    size: 'md',
    defaultExpandedIds: ['tokens'],
    items: [
      {
        id: 'tokens',
        title: 'Design Tokens',
        summary: 'M3 color & typography',
        icon: 'palette',
        content:
          'All semantic color roles and spacing tokens map cleanly across Angular Material and Flutter.',
      },
      {
        id: 'a11y',
        title: 'Accessibility',
        summary: 'WCAG 2.1 AA compliant',
        icon: 'accessibility_new',
        content:
          'Keyboard focus management, ARIA roles, and high-contrast palettes are tested on every story.',
      },
      {
        id: 'locked',
        title: 'Enterprise Policy',
        summary: 'Managed externally',
        icon: 'lock',
        disabled: true,
        content: 'Managed by workspace security administrator.',
      },
    ],
    expandedIdsChange: fn(),
  },
  argTypes: {
    items: { control: 'object', table: { category: 'Data' } },
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
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    expandedIdsChange: {
      action: 'expandedIdsChange',
      table: { category: 'Events' },
    },
  },
};

export default meta;
type Story = StoryObj<MagicAccordionComponent>;

/**
 * Default outlined single-expand accordion toggling panels cleanly.
 *
 * Inputs: `appearance="outlined"`, `multiple=false`, `defaultExpandedIds=['tokens']`.
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Accessibility'));
    await expect(args.expandedIdsChange).toHaveBeenCalledWith(['a11y']);
  },
};

/**
 * Raised multi-expand accordion allowing multiple panels open concurrently.
 *
 * Inputs: `appearance="raised"`, `multiple=true`, `defaultExpandedIds=['tokens', 'a11y']`.
 */
export const MultiExpandRaised: Story = {
  args: {
    appearance: 'raised',
    multiple: true,
    defaultExpandedIds: ['tokens', 'a11y'],
  },
};
