import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicButton } from '../../atoms/button/button';
import { MagicToast } from './toast';

function StatefulInlineToast(args: React.ComponentProps<typeof MagicToast>) {
  const [open, setOpen] = useState(Boolean(args.open));

  useEffect(() => {
    setOpen(Boolean(args.open));
  }, [args.open]);

  if (!open) {
    return (
      <MagicButton
        label="Reopen Toast"
        variant="tonal"
        leadingIcon="notifications"
        onClick={() => setOpen(true)}
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
    <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      {anyHidden && (
        <MagicButton
          label="Reset Toasts"
          variant="tonal"
          size="sm"
          onClick={() =>
            setVisible({ info: true, success: true, warning: true, error: true })
          }
        />
      )}
      <MagicToast
        inline
        open={visible.info}
        duration={null}
        severity="info"
        title="Syncing"
        message="Downloading latest design assets..."
        onClose={() => setVisible((prev) => ({ ...prev, info: false }))}
      />
      <MagicToast
        inline
        open={visible.success}
        duration={null}
        severity="success"
        title="Saved"
        message="Component baseline snapshot updated."
        actionLabel="View"
        onClose={() => setVisible((prev) => ({ ...prev, success: false }))}
      />
      <MagicToast
        inline
        open={visible.warning}
        duration={null}
        severity="warning"
        title="Offline Mode"
        message="Changes are queued locally until reconnected."
        onClose={() => setVisible((prev) => ({ ...prev, warning: false }))}
      />
      <MagicToast
        inline
        open={visible.error}
        duration={null}
        severity="error"
        title="Upload Failed"
        message="Unable to reach asset storage endpoint."
        actionLabel="Retry"
        onClose={() => setVisible((prev) => ({ ...prev, error: false }))}
      />
    </Stack>
  );
}

/**
 * `MagicToast` is the Material 3 transient notification molecule composing
 * MUI v9 `Snackbar` and `MagicAlert` with 6 viewport positions, live-region
 * accessibility, and clean auto-dismiss timers.
 *
 * - **References**:
 *   - [Material 3 Snackbar](https://m3.material.io/components/snackbar/overview)
 *   - [MUI Snackbar](https://mui.com/material-ui/react-snackbar/)
 */
const meta: Meta<typeof MagicToast> = {
  title: 'Molecules/Toast',
  component: MagicToast,
  tags: ['autodocs', 'snapshot'],
  args: {
    open: true,
    severity: 'success',
    title: 'Changes Published',
    message: 'Workspace theme tokens updated across 4 libraries.',
    duration: null,
    position: 'bottom-right',
    dismissible: true,
    actionLabel: 'Undo',
    inline: true,
    onAction: fn(),
    onClose: fn(),
  },
  argTypes: {
    open: { control: 'boolean', table: { category: 'State' } },
    severity: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
      table: { category: 'Appearance' },
    },
    title: { control: 'text', table: { category: 'Content' } },
    message: { control: 'text', table: { category: 'Content' } },
    duration: { control: 'number', table: { category: 'Behavior' } },
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
    dismissible: { control: 'boolean', table: { category: 'Behavior' } },
    actionLabel: { control: 'text', table: { category: 'Actions' } },
    inline: { control: 'boolean', table: { category: 'Layout' } },
    onAction: { action: 'actionClicked', table: { category: 'Events' } },
    onClose: { action: 'closed', table: { category: 'Events' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicToast>;

/**
 * Default inline-rendered toast snapshot verifying action, dismiss, and reopen interactions.
 */
export const Default: Story = {
  render: (args) => <StatefulInlineToast {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Dismiss notification' }),
    );
    await expect(args.onClose).toHaveBeenCalledWith('dismiss');
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Reopen Toast' }));
    await expect(canvas.getByRole('status')).toBeInTheDocument();
  },
};

/**
 * All 4 toast severity levels rendered inline with interactive dismiss controls.
 */
export const Severities: Story = {
  render: () => <StatefulSeveritiesDemo />,
};

function InteractiveToastDemo(args: React.ComponentProps<typeof MagicToast>) {
  const [open, setOpen] = useState(Boolean(args.open));

  useEffect(() => {
    setOpen(Boolean(args.open));
  }, [args.open]);

  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <MagicButton
        label="Show Floating Toast"
        variant="filled"
        leadingIcon="notifications"
        onClick={() => setOpen(true)}
      />
      <MagicToast
        {...args}
        inline={false}
        duration={3000}
        open={open}
        onClose={(reason) => {
          args.onClose?.(reason);
          setOpen(false);
        }}
      />
    </Stack>
  );
}

/**
 * Interactive floating Snackbar toast triggered by button click.
 */
export const InteractiveFloating: Story = {
  args: {
    open: false,
    inline: false,
    duration: 3000,
  },
  render: (args) => <InteractiveToastDemo {...args} />,
};
