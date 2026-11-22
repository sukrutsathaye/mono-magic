import { signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicButtonComponent } from '../../atoms/button/button.component';
import { MagicAlertComponent } from './alert.component';

const renderStatefulAlert: Story['render'] = (args) => {
  const visible = signal(true);

  return {
    props: {
      ...args,
      visible,
      handleDismiss() {
        visible.set(false);
        args.dismissed?.();
      },
      handleAction() {
        args.actionClicked?.();
      },
      handleRestore() {
        visible.set(true);
      },
    },
    template: `
      @if (visible()) {
        <magic-alert
          [severity]="severity"
          [variant]="variant"
          [title]="title"
          [message]="message"
          [icon]="icon"
          [hideIcon]="hideIcon"
          [dismissible]="dismissible"
          [actionLabel]="actionLabel"
          [size]="size"
          [id]="id"
          [testId]="testId"
          [ariaLabel]="ariaLabel"
          (dismissed)="handleDismiss()"
          (actionClicked)="handleAction()"
        />
      } @else {
        <magic-button
          label="Show Alert"
          variant="tonal"
          size="sm"
          (clicked)="handleRestore()"
        />
      }
    `,
  };
};

/**
 * `MagicAlertComponent` renders Material 3 status banners across `info`,
 * `success`, `warning`, and `error` severities and `standard`, `filled`, and
 * `outlined` visual variants, with optional title, custom icon, inline action,
 * and dismissal controls.
 *
 * - **References**:
 *   - [Material 3 Color Roles](https://m3.material.io/styles/color/roles)
 */
const meta: Meta<MagicAlertComponent> = {
  title: 'Molecules/Alert',
  component: MagicAlertComponent,
  decorators: [
    moduleMetadata({
      imports: [MagicButtonComponent],
    }),
  ],
  args: {
    severity: 'info',
    variant: 'standard',
    title: 'System update available',
    message: 'Version 2.4.0 includes updated Material 3 typography tokens.',
    hideIcon: false,
    dismissible: false,
    size: 'md',
    dismissed: fn(),
    actionClicked: fn(),
  },
  argTypes: {
    severity: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
      table: { category: 'Appearance' },
    },
    variant: {
      control: 'select',
      options: ['standard', 'filled', 'outlined'],
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: { category: 'Appearance' },
    },
    title: { control: 'text', table: { category: 'Content' } },
    message: { control: 'text', table: { category: 'Content' } },
    icon: { control: 'text', table: { category: 'Content' } },
    hideIcon: { control: 'boolean', table: { category: 'Content' } },
    dismissible: { control: 'boolean', table: { category: 'Behavior' } },
    actionLabel: { control: 'text', table: { category: 'Actions' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    dismissed: { action: 'dismissed', table: { category: 'Events' } },
    actionClicked: { action: 'actionClicked', table: { category: 'Events' } },
  },
  render: renderStatefulAlert,
};

export default meta;
type Story = StoryObj<MagicAlertComponent>;

/**
 * Default standard info alert banner with title and message.
 *
 * Inputs: `severity="info"`, `variant="standard"`, `title`, `message`.
 */
export const Default: Story = {};

/**
 * Interactive alert with inline action, dismiss, and restore controls verified by play assertions.
 *
 * Inputs: `severity="warning"`, `actionLabel="Review"`, `dismissible=true`.
 */
export const WithActionsAndDismiss: Story = {
  args: {
    severity: 'warning',
    title: 'API quota nearing limit',
    message: 'You have consumed 85% of your monthly inference tokens.',
    actionLabel: 'Review',
    dismissible: true,
    testId: 'quota-alert',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Review' }));
    await expect(args.actionClicked).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss alert' }));
    await expect(args.dismissed).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Show Alert' }));
    await expect(canvas.getByRole('alert')).toBeInTheDocument();
  },
};

/**
 * Matrix comparing all four semantic severities across standard, filled, and outlined variants.
 *
 * Inputs: `severity="info" | "success" | "warning" | "error"`, `variant="standard" | "filled" | "outlined"`.
 */
export const SeveritiesAndVariants: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: grid; gap: 12px; max-width: 640px;">
        <magic-alert severity="info" variant="standard" title="Info Standard" message="Informational notice using primary container tokens." />
        <magic-alert severity="success" variant="filled" title="Success Filled" message="Deployment succeeded cleanly with zero regressions." />
        <magic-alert severity="warning" variant="outlined" title="Warning Outlined" message="Scheduled maintenance begins in 15 minutes." />
        <magic-alert severity="error" variant="standard" title="Error Standard" message="Unable to reach upstream telemetry collector." actionLabel="Retry" />
      </div>
    `,
  }),
};

/**
 * Compact alert without an icon for dense inline banners.
 *
 * Inputs: `size="sm"`, `hideIcon=true`, `title=undefined`.
 */
export const CompactNoIcon: Story = {
  args: {
    size: 'sm',
    hideIcon: true,
    title: undefined,
    message: 'Filters applied to current view.',
  },
};
