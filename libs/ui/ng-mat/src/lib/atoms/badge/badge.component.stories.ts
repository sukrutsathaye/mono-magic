import {
  argsToTemplate,
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@storybook/angular';
import { expect, within } from 'storybook/test';
import { MagicButtonComponent } from '../button/button.component';
import { MagicBadgeComponent } from './badge.component';

/**
 * `MagicBadgeComponent` wraps Material's `matBadge` around projected content
 * (e.g. a `magic-button` or icon) with `icon` and `label` fallbacks.
 * - **References**:
 *   - [Angular Material Badge](https://material.angular.dev/components/badge/overview)
 *   - [MD3 Badge](https://m3.material.io/components/badges/overview)
 */
const meta: Meta<MagicBadgeComponent> = {
  title: 'Atoms/Badge',
  component: MagicBadgeComponent,
  decorators: [
    moduleMetadata({
      imports: [MagicButtonComponent],
    }),
  ],
  args: {
    content: 7,
    icon: 'mail',
    label: 'Inbox',
    color: 'primary',
    size: 'md',
    position: 'above after',
    overlap: true,
    hidden: false,
    disabled: false,
    description: '7 unread items',
  },
  argTypes: {
    content: { control: 'text', table: { category: 'Content' } },
    icon: { control: 'text', table: { category: 'Content' } },
    label: { control: 'text', table: { category: 'Content' } },
    description: { control: 'text', table: { category: 'Accessibility' } },
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
    position: {
      control: 'select',
      options: [
        'above after',
        'above before',
        'below after',
        'below before',
        'above',
        'below',
        'before',
        'after',
      ],
      table: { category: 'Appearance' },
    },
    overlap: { control: 'boolean', table: { category: 'Appearance' } },
    hidden: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
  },
};

export default meta;
type Story = StoryObj<MagicBadgeComponent>;

/**
 * Default icon badge displaying a numeric unread count.
 *
 * Inputs: `content=7`, `icon="mail"`, `label="Inbox"`, `color="primary"`, `size="md"`, `position="above after"`, `overlap=true`.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('7')).toBeInTheDocument();
  },
};

/**
 * Badge anchored outside a projected `<magic-button>` without overlapping it.
 *
 * Inputs: `icon=undefined`, `content=12`, `color="error"`, `overlap=false`, projected `<magic-button>`.
 */
export const WrappingButton: Story = {
  render: (args) => ({
    props: args,
    template: `
      <magic-badge ${argsToTemplate(args)}>
        <magic-button variant="tonal" label="Notifications" />
      </magic-badge>
    `,
  }),
  args: { icon: undefined, content: 12, color: 'error', overlap: false },
};

/**
 * Comparison of hidden (`hidden=true`) and muted (`disabled=true`) badge states.
 *
 * Inputs: `content=3`, `icon="notifications"`, `hidden=true` vs. `disabled=true`.
 */
export const HiddenAndDisabled: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 24px; align-items: center;">
        <magic-badge [content]="3" icon="notifications" [hidden]="true" />
        <magic-badge [content]="3" icon="notifications" [disabled]="true" />
      </div>
    `,
  }),
};

/**
 * Gallery of badge size tokens paired with semantic status colors.
 *
 * Inputs: `size="sm" | "md" | "lg" | "xl"`, `color="primary" | "success" | "warning" | "error"`.
 */
export const SizesAndColors: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 28px; align-items: center; padding: 12px;">
        <magic-badge size="sm" color="primary" [content]="1" icon="home" />
        <magic-badge size="md" color="success" [content]="9" icon="check_circle" />
        <magic-badge size="lg" color="warning" [content]="99" icon="warning" />
        <magic-badge size="xl" color="error" content="99+" icon="error" />
      </div>
    `,
  }),
};
