import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicButton } from '../../atoms/button/button';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicToast } from './toast';

/**
 * `MagicToast` is the Material 3 transient notification molecule for `@mono-magic/rn-paper`.
 *
 * It supports 6 viewport anchor positions (`top-left` through `bottom-right`),
 * semantic `AlertSeverity` accents, auto-dismiss `duration`, inline action buttons,
 * and manual dismiss controls.
 */
const meta: Meta<typeof MagicToast> = {
  title: 'Molecules/Toast',
  component: MagicToast,
  tags: ['autodocs', 'snapshot'],
  args: {
    open: true,
    inline: true,
    severity: 'success',
    title: 'Changes Published',
    message: 'Your workspace tokens were synced cleanly.',
    duration: null,
    position: 'bottom-right',
    dismissible: true,
    actionLabel: 'Undo',
    onClose: fn(),
    onAction: fn(),
  },
  argTypes: {
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
      table: { category: 'Positioning' },
    },
    open: { control: 'boolean', table: { category: 'State' } },
    inline: { control: 'boolean', table: { category: 'Layout' } },
    dismissible: { control: 'boolean', table: { category: 'Actions' } },
    actionLabel: { control: 'text', table: { category: 'Actions' } },
    duration: { control: 'number', table: { category: 'Behavior' } },
    title: { control: 'text', table: { category: 'Content' } },
    message: { control: 'text', table: { category: 'Content' } },
    onClose: { action: 'closed', table: { category: 'Events' } },
    onAction: { action: 'actionClicked', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicToast>;

/**
 * Default inline persistent toast preview verifying action and dismiss callbacks.
 */
export const Default: Story = {
  args: {
    testId: 'story-toast',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Dismiss notification' })
    );
    await expect(args.onClose).toHaveBeenCalledWith('dismiss');
  },
};

function InteractiveToastDemo(args: Story['args']) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ minHeight: 80, alignItems: 'flex-start' }}>
      <MagicButton
        label="Show Toast"
        variant="tonal"
        onPress={() => setOpen(true)}
      />
      <MagicToast
        {...args}
        message={args?.message ?? 'Your workspace tokens were synced cleanly.'}
        inline={false}
        duration={null}
        open={open}
        onClose={(reason) => {
          args?.onClose?.(reason);
          setOpen(false);
        }}
      />
    </View>
  );
}

/**
 * Interactive toast trigger showing live fixed-overlay toast notification.
 */
export const InteractiveTrigger: Story = {
  render: (args) => <InteractiveToastDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show Toast' }));
    await expect(canvas.getByRole('status')).toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Dismiss notification' })
    );
    await expect(args.onClose).toHaveBeenCalledWith('dismiss');
  },
};

/**
 * Severity showcase (`info`, `success`, `warning`, `error`) rendered inline.
 */
export const Severities: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <MagicToast
        open
        inline
        duration={null}
        severity="info"
        title="Syncing"
        message="Fetching latest build artifacts."
      />
      <MagicToast
        open
        inline
        duration={null}
        severity="success"
        title="Saved"
        message="Design tokens exported."
      />
      <MagicToast
        open
        inline
        duration={null}
        severity="warning"
        title="Latency"
        message="Cache server responded slowly."
      />
      <MagicToast
        open
        inline
        duration={null}
        severity="error"
        title="Failed"
        message="Deployment aborted due to lint errors."
        actionLabel="Retry"
      />
    </View>
  ),
};

/**
 * Toast rendered inside a dark Material 3 palette.
 */
export const DarkTheme: Story = {
  render: () => (
    <MagicPaperProvider palette="dark-theme">
      <View style={{ backgroundColor: '#121410', padding: 16, borderRadius: 12 }}>
        <MagicToast
          open
          inline
          duration={null}
          severity="success"
          title="Dark Mode Toast"
          message="Elevated M3 container with semantic border."
          actionLabel="View"
        />
      </View>
    </MagicPaperProvider>
  ),
};
