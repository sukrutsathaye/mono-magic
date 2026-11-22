import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicButton } from '../../atoms/button/button';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicToast } from './toast';

function StatefulToastDemo(args: React.ComponentProps<typeof MagicToast>) {
  const [open, setOpen] = useState(Boolean(args.open));

  useEffect(() => {
    setOpen(Boolean(args.open));
  }, [args.open]);

  if (!open) {
    return (
      <MagicButton
        label={args.inline === false ? 'Show Toast' : 'Reopen Toast'}
        variant="tonal"
        onPress={() => setOpen(true)}
      />
    );
  }

  return (
    <MagicToast
      {...args}
      open={open}
      onClose={(reason) => {
        args.onClose?.(reason);
        setOpen(false);
      }}
    />
  );
}

function StatefulSeveritiesDemo() {
  const [visible, setVisible] = useState({
    info: true,
    success: true,
    warning: true,
    error: true,
  });
  const anyHidden = Object.values(visible).some((v) => !v);

  return (
    <View style={{ gap: 12, alignItems: 'flex-start' }}>
      {anyHidden && (
        <MagicButton
          label="Reset Toasts"
          variant="tonal"
          size="sm"
          onPress={() =>
            setVisible({ info: true, success: true, warning: true, error: true })
          }
        />
      )}
      <MagicToast
        open={visible.info}
        inline
        duration={null}
        severity="info"
        title="Syncing"
        message="Fetching latest build artifacts."
        onClose={() => setVisible((prev) => ({ ...prev, info: false }))}
      />
      <MagicToast
        open={visible.success}
        inline
        duration={null}
        severity="success"
        title="Saved"
        message="Design tokens exported."
        onClose={() => setVisible((prev) => ({ ...prev, success: false }))}
      />
      <MagicToast
        open={visible.warning}
        inline
        duration={null}
        severity="warning"
        title="Latency"
        message="Cache server responded slowly."
        onClose={() => setVisible((prev) => ({ ...prev, warning: false }))}
      />
      <MagicToast
        open={visible.error}
        inline
        duration={null}
        severity="error"
        title="Failed"
        message="Deployment aborted due to lint errors."
        actionLabel="Retry"
        onClose={() => setVisible((prev) => ({ ...prev, error: false }))}
      />
    </View>
  );
}

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
 * Default inline persistent toast preview verifying action, dismiss, and reopen callbacks.
 */
export const Default: Story = {
  args: {
    testId: 'story-toast',
  },
  render: (args) => <StatefulToastDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Dismiss notification' })
    );
    await expect(args.onClose).toHaveBeenCalledWith('dismiss');
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Reopen Toast' }));
    await expect(canvas.getByRole('status')).toBeInTheDocument();
  },
};

function InteractiveToastDemo(args: React.ComponentProps<typeof MagicToast>) {
  const [open, setOpen] = useState(Boolean(args.open));

  useEffect(() => {
    setOpen(Boolean(args.open));
  }, [args.open]);

  return (
    <View style={{ minHeight: 80, alignItems: 'flex-start' }}>
      <MagicButton
        label="Show Toast"
        variant="tonal"
        onPress={() => setOpen(true)}
      />
      <MagicToast
        {...args}
        message={args.message ?? 'Your workspace tokens were synced cleanly.'}
        inline={false}
        duration={null}
        open={open}
        onClose={(reason) => {
          args.onClose?.(reason);
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
  args: {
    open: false,
    inline: false,
  },
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
 * Severity showcase (`info`, `success`, `warning`, `error`) rendered inline with dismiss controls.
 */
export const Severities: Story = {
  render: () => <StatefulSeveritiesDemo />,
};

/**
 * Toast rendered inside a dark Material 3 palette.
 */
export const DarkTheme: Story = {
  render: () => (
    <MagicPaperProvider palette="dark-theme">
      <View style={{ backgroundColor: '#121410', padding: 16, borderRadius: 12 }}>
        <StatefulToastDemo
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
