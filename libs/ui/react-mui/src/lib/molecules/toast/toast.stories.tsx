import { useState } from 'react';
import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicButton } from '../../atoms/button/button';
import { MagicToast } from './toast';

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
 * Default inline-rendered toast snapshot verifying action and dismiss interactions.
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Dismiss notification' }),
    );
    await expect(args.onClose).toHaveBeenCalledWith('dismiss');
  },
};

/**
 * All 4 toast severity levels rendered inline for visual comparison.
 */
export const Severities: Story = {
  render: () => (
    <Stack spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <MagicToast
        inline
        open
        duration={null}
        severity="info"
        title="Syncing"
        message="Downloading latest design assets..."
      />
      <MagicToast
        inline
        open
        duration={null}
        severity="success"
        title="Saved"
        message="Component baseline snapshot updated."
        actionLabel="View"
      />
      <MagicToast
        inline
        open
        duration={null}
        severity="warning"
        title="Offline Mode"
        message="Changes are queued locally until reconnected."
      />
      <MagicToast
        inline
        open
        duration={null}
        severity="error"
        title="Upload Failed"
        message="Unable to reach asset storage endpoint."
        actionLabel="Retry"
      />
    </Stack>
  ),
};

function InteractiveToastDemo(args: React.ComponentProps<typeof MagicToast>) {
  const [open, setOpen] = useState(false);

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
  render: (args) => <InteractiveToastDemo {...args} />,
};
