import { signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicButtonComponent } from '../../atoms/button/button.component';
import { MagicToastComponent } from './toast.component';

const renderStatefulToast: Story['render'] = (args) => {
  const isOpen = signal(Boolean(args.open));

  return {
    props: {
      ...args,
      isOpen,
      handleOpen() {
        isOpen.set(true);
      },
      handleDismiss() {
        isOpen.set(false);
        args.dismissed?.();
      },
      handleAction() {
        args.actionClicked?.();
      },
    },
    template: `
      @if (!isOpen()) {
        <magic-button
          [label]="open ? 'Reopen Toast' : 'Show Toast'"
          [variant]="open ? 'tonal' : 'filled'"
          color="primary"
          leadingIcon="notifications"
          (clicked)="handleOpen()"
        />
      }
      <magic-toast
        [open]="isOpen()"
        [severity]="severity"
        [title]="title"
        [message]="message"
        [duration]="duration"
        [position]="position"
        [dismissible]="dismissible"
        [actionLabel]="actionLabel"
        [id]="id"
        [testId]="testId"
        [ariaLabel]="ariaLabel"
        (dismissed)="handleDismiss()"
        (actionClicked)="handleAction()"
      />
    `,
  };
};

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
  decorators: [
    moduleMetadata({
      imports: [MagicButtonComponent],
    }),
  ],
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
  render: renderStatefulToast,
};

export default meta;
type Story = StoryObj<MagicToastComponent>;

/**
 * Persistent open toast with action, dismiss, and reopen interactions verified by play assertions.
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
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Reopen Toast' }));
    await expect(canvas.getByRole('status')).toBeInTheDocument();
  },
};

/**
 * Interactive button-triggered toast opening and dismissing cleanly.
 *
 * Inputs: `open=false`, `duration=null`, `severity="success"`.
 */
export const InteractiveTrigger: Story = {
  args: {
    open: false,
    severity: 'success',
    title: 'Snapshot updated',
    message: 'Visual baseline verified cleanly.',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show Toast' }));
    await expect(canvas.getByRole('status')).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Dismiss notification' }),
    );
    await expect(args.dismissed).toHaveBeenCalledTimes(1);
  },
};

/**
 * Stack comparing all four semantic toast severities with interactive dismiss and reset controls.
 *
 * Inputs: `severity="info" | "success" | "warning" | "error"`, `open=true`, `duration=null`.
 */
export const Severities: Story = {
  render: (args) => {
    const openInfo = signal(true);
    const openSuccess = signal(true);
    const openWarning = signal(true);
    const openError = signal(true);

    return {
      props: {
        ...args,
        openInfo,
        openSuccess,
        openWarning,
        openError,
        resetAll() {
          openInfo.set(true);
          openSuccess.set(true);
          openWarning.set(true);
          openError.set(true);
        },
      },
      template: `
        <div style="display: grid; gap: 12px; justify-items: start;">
          @if (!openInfo() || !openSuccess() || !openWarning() || !openError()) {
            <magic-button
              label="Reset Toasts"
              variant="tonal"
              size="sm"
              (clicked)="resetAll()"
            />
          }
          <magic-toast [open]="openInfo()" severity="info" title="Info" message="Sync started in background." [duration]="null" (dismissed)="openInfo.set(false)" />
          <magic-toast [open]="openSuccess()" severity="success" title="Published" message="Release v2.4.0 is live." actionLabel="Undo" [duration]="null" (dismissed)="openSuccess.set(false)" />
          <magic-toast [open]="openWarning()" severity="warning" title="Slow network" message="Retrying artifact upload..." [duration]="null" (dismissed)="openWarning.set(false)" />
          <magic-toast [open]="openError()" severity="error" title="Upload failed" message="Checksum mismatch on bundle.js." actionLabel="Retry" [duration]="null" (dismissed)="openError.set(false)" />
        </div>
      `,
    };
  },
};
