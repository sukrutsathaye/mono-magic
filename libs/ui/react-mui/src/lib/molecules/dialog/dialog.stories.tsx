import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { MagicButton } from '../../atoms/button/button';
import { MagicDialog } from './dialog';

function StatefulDialogDemo(args: React.ComponentProps<typeof MagicDialog>) {
  const [open, setOpen] = useState(Boolean(args.open));

  useEffect(() => {
    setOpen(Boolean(args.open));
  }, [args.open]);

  return (
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      {!open && (
        <MagicButton
          label={args.disablePortal === false ? 'Open Confirmation Dialog' : 'Reopen Dialog'}
          variant={args.disablePortal === false ? 'filled' : 'tonal'}
          leadingIcon="open_in_new"
          onClick={() => setOpen(true)}
        />
      )}
      <MagicDialog
        {...args}
        open={open}
        onClose={(reason) => {
          args.onClose?.(reason);
          setOpen(false);
        }}
        onActionClick={(action) => {
          args.onActionClick?.(action);
          setOpen(false);
        }}
      />
    </Stack>
  );
}

/**
 * `MagicDialog` is the Material 3 modal dialog molecule composing MUI v9 `Dialog`,
 * title/subtitle header with optional close button, scrollable body content, and
 * `MagicButton` footer actions.
 *
 * - **References**:
 *   - [Material 3 Dialogs](https://m3.material.io/components/dialogs/overview)
 *   - [MUI Dialog](https://mui.com/material-ui/react-dialog/)
 */
const meta: Meta<typeof MagicDialog> = {
  title: 'Molecules/Dialog',
  component: MagicDialog,
  tags: ['autodocs', 'snapshot'],
  args: {
    open: true,
    title: 'Publish Design Tokens',
    subtitle: 'Release v2.4.0 to workspace packages',
    content:
      'Publishing will regenerate Material 3 color variables and notify dependent libraries.',
    size: 'md',
    dismissible: true,
    closeOnBackdropClick: true,
    closeOnEscape: true,
    showCloseButton: true,
    scrollable: false,
    alignActions: 'end',
    disablePortal: true,
    actions: [
      { id: 'cancel', label: 'Cancel', variant: 'text', color: 'neutral' },
      {
        id: 'publish',
        label: 'Publish',
        variant: 'filled',
        color: 'primary',
        icon: 'rocket_launch',
      },
    ],
    onClose: fn(),
    onActionClick: fn(),
  },
  argTypes: {
    open: { control: 'boolean', table: { category: 'State' } },
    title: { control: 'text', table: { category: 'Content' } },
    subtitle: { control: 'text', table: { category: 'Content' } },
    content: { control: 'text', table: { category: 'Content' } },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'fullscreen'],
      table: { category: 'Appearance' },
    },
    dismissible: { control: 'boolean', table: { category: 'Behavior' } },
    closeOnBackdropClick: {
      control: 'boolean',
      table: { category: 'Behavior' },
    },
    closeOnEscape: { control: 'boolean', table: { category: 'Behavior' } },
    showCloseButton: { control: 'boolean', table: { category: 'Behavior' } },
    scrollable: { control: 'boolean', table: { category: 'Layout' } },
    actions: { control: 'object', table: { category: 'Content' } },
    alignActions: {
      control: 'select',
      options: ['start', 'end'],
      table: { category: 'Layout' },
    },
    disablePortal: { control: 'boolean', table: { category: 'Layout' } },
    onClose: { action: 'closed', table: { category: 'Events' } },
    onActionClick: { action: 'actionClicked', table: { category: 'Events' } },
    headerSlot: { control: false, table: { category: 'Slots' } },
    footerSlot: { control: false, table: { category: 'Slots' } },
    children: { control: false, table: { category: 'Slots' } },
    container: { control: false, table: { category: 'Layout' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          position: 'relative',
          minHeight: 360,
          '& .MuiDialog-root': { position: 'relative' },
          '& .MuiBackdrop-root': { position: 'absolute' },
          '& .MuiDialog-container': {
            position: 'relative',
            minHeight: 340,
          },
        }}
      >
        <Story />
      </Box>
    ),
  ],
  render: (args) => <StatefulDialogDemo {...args} />,
};

export default meta;
type Story = StoryObj<typeof MagicDialog>;

/**
 * Default inline-contained dialog snapshot verifying action button, close state, and reopen flow.
 */
export const Default: Story = {
  args: {
    testId: 'default-dialog',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('dialog')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: /Publish/i }));
    await expect(args.onActionClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'publish', label: 'Publish' }),
    );
    await waitFor(() =>
      expect(canvas.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Reopen Dialog' }),
    );
    await expect(canvas.getByRole('dialog')).toBeInTheDocument();
  },
};

/**
 * Triggered modal dialog rendering through a real React portal to `document.body`.
 */
export const InteractivePortal: Story = {
  args: {
    open: false,
    disablePortal: false,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open Confirmation Dialog' }),
    );
    const dialog = await screen.findByRole('dialog');
    await expect(dialog).toBeInTheDocument();
    const closeBtn = within(dialog).getByRole('button', {
      name: 'Close dialog',
    });
    await userEvent.click(closeBtn);
    await expect(args.onClose).toHaveBeenCalledWith('closeButton');
  },
};

/**
 * Scrollable dialog body with divider borders and long content.
 */
export const ScrollableContent: Story = {
  args: {
    scrollable: true,
    title: 'Terms & Architecture Notes',
    subtitle: 'Scrollable body container',
    content: undefined,
    children: (
      <Stack spacing={1.5} sx={{ maxHeight: 160 }}>
        {Array.from({ length: 6 }, (_, index) => (
          <Typography key={index} variant="body2" color="text.secondary">
            Section {index + 1}: Material 3 design tokens synchronize spacing,
            elevation, and accessible color contrast across React, Angular,
            React Native, and Flutter implementations.
          </Typography>
        ))}
      </Stack>
    ),
  },
};

/**
 * Non-dismissible confirmation dialog requiring an explicit action choice.
 */
export const NonDismissible: Story = {
  args: {
    dismissible: false,
    title: 'Required Security Update',
    subtitle: 'Action required before continuing',
    content:
      'Your workspace session needs re-authentication to preserve encrypted local state.',
    alignActions: 'start',
    actions: [
      { id: 'reauth', label: 'Sign In Now', variant: 'filled', color: 'error' },
    ],
  },
};
