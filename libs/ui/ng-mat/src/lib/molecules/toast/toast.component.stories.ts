import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicToastComponent } from './toast.component';

/**
 * `MagicToastComponent` renders Material 3 transient notifications with
 * semantic severities, ARIA live-region announcements, auto-dismiss timers,
 * action buttons, and dismiss controls.
 *
 * - **References**:
 *   - [Material 3 Snackbar](https://m3.material.io/components/snackbar/overview)
 */
const meta: Meta<MagicToastComponent> = {
  title: 'Molecules/Toast',
  component: MagicToastComponent,
  args: {
    open: true,
    severity: 'info',
    title: 'Workspace synced',
    message: 'All component baselines are up to date.',
    duration: null,
    position: 'bottom-right',
    dismissible: true,
    actionLabel: 'View',
    dismissed: fn(),
    actionClicked: fn(),
  },
  argTypes: {
    open: { control: 'boolean', table: { category: 'State' } },
    severity: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
      table: { category: 'Appearance' },
    },
    position: {
      control: 'select',
      options: [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
      table: { category: 'Layout' },
    },
    title: { control: 'text', table: { category: 'Content' } },
    message: { control: 'text', table: { category: 'Content' } },
    duration: { control: 'number', table: { category: 'Behavior' } },
    dismissible: { control: 'boolean', table: { category: 'Behavior' } },
    actionLabel: { control: 'text', table: { category: 'Actions' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    dismissed: { action: 'dismissed', table: { category: 'Events' } },
    actionClicked: { action: 'actionClicked', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<MagicToastComponent>;

/**
 * Persistent open toast with action and dismiss buttons verified by play assertions.
 *
 * Inputs: `open=true`, `duration=null`, `severity="info"`, `actionLabel="View"`, `dismissible=true`.
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'View' }));
    await expect(args.actionClicked).toHaveBeenCalledTimes(1);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Dismiss notification' }),
    );
    await expect(args.dismissed).toHaveBeenCalledTimes(1);
  },
};

/**
 * Stack comparing all four semantic toast severities with `duration=null` for stable visual snapshots.
 *
 * Inputs: `severity="info" | "success" | "warning" | "error"`, `open=true`, `duration=null`.
 */
export const Severities: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: grid; gap: 12px; justify-items: start;">
        <magic-toast [open]="true" severity="info" title="Info" message="Sync started in background." [duration]="null" />
        <magic-toast [open]="true" severity="success" title="Published" message="Release v2.4.0 is live." actionLabel="Undo" [duration]="null" />
        <magic-toast [open]="true" severity="warning" title="Slow network" message="Retrying artifact upload..." [duration]="null" />
        <magic-toast [open]="true" severity="error" title="Upload failed" message="Checksum mismatch on bundle.js." actionLabel="Retry" [duration]="null" />
      </div>
    `,
  }),
};
