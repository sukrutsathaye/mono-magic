import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicSlideToggleComponent } from './slide-toggle.component';

/**
 * `MagicSlideToggleComponent` wraps `mat-slide-toggle` with Signal Forms
 * (`FormCheckboxControl`), Reactive/Template Forms support, and `<ng-content>` projection.
 *
 * @see https://material.angular.dev/components/slide-toggle/overview
 */
const meta: Meta<MagicSlideToggleComponent> = {
  title: 'Atoms/SlideToggle',
  component: MagicSlideToggleComponent,
  args: {
    label: 'Enable notifications',
    checked: false,
    disabled: false,
    required: false,
    hideIcon: false,
    labelPosition: 'after',
    disableRipple: false,
    disabledInteractive: false,
    color: 'primary',
    size: 'md',
    changed: fn(),
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Content' } },
    checked: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    required: { control: 'boolean', table: { category: 'Validation' } },
    hideIcon: { control: 'boolean', table: { category: 'Appearance' } },
    labelPosition: {
      control: 'select',
      options: ['before', 'after'],
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
    changed: { action: 'changed', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<MagicSlideToggleComponent>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch');
    await expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
    await expect(args.changed).toHaveBeenCalledWith(true);
  },
};

export const Checked: Story = {
  args: { label: 'Enabled', checked: true },
};

export const HideIcon: Story = {
  args: { label: 'No thumb icon', hideIcon: true, checked: true },
};

export const LabelBefore: Story = {
  args: { label: 'Label before switch', labelPosition: 'before' },
};

export const Disabled: Story = {
  args: { label: 'Locked setting', disabled: true, checked: true },
};

export const Colors: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <magic-slide-toggle color="primary" [checked]="true" label="Primary" />
        <magic-slide-toggle color="secondary" [checked]="true" label="Secondary" />
        <magic-slide-toggle color="tertiary" [checked]="true" label="Tertiary" />
        <magic-slide-toggle color="success" [checked]="true" label="Success" />
        <magic-slide-toggle color="warning" [checked]="true" label="Warning" />
        <magic-slide-toggle color="error" [checked]="true" label="Error" />
      </div>
    `,
  }),
};

export const ContentProjection: Story = {
  render: (args) => ({
    props: args,
    template: `
      <magic-slide-toggle ${argsToTemplate(args)}>
        <strong>Projected</strong>&nbsp;switch label
      </magic-slide-toggle>
    `,
  }),
};
