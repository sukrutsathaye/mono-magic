import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text, View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicButton } from '../../atoms/button/button';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicDialog, type DialogActionItem } from './dialog';

const DEFAULT_ACTIONS: readonly DialogActionItem[] = [
  { id: 'cancel', label: 'Cancel', variant: 'text', color: 'neutral' },
  {
    id: 'confirm',
    label: 'Publish',
    variant: 'filled',
    color: 'primary',
    icon: 'check',
  },
];

function StatefulDialogDemo(args: React.ComponentProps<typeof MagicDialog>) {
  const [isOpen, setIsOpen] = useState(Boolean(args.open));

  useEffect(() => {
    setIsOpen(Boolean(args.open));
  }, [args.open]);

  return (
    <View style={{ minHeight: 80, alignItems: 'flex-start', width: '100%' }}>
      {!isOpen && (
        <MagicButton
          label={args.inline === false ? 'Open Dialog' : 'Reopen Dialog'}
          variant={args.inline === false ? 'filled' : 'tonal'}
          onPress={() => setIsOpen(true)}
        />
      )}
      <MagicDialog
        {...args}
        open={isOpen}
        onClose={(reason) => {
          args.onClose?.(reason);
          setIsOpen(false);
        }}
        onActionClick={(action) => {
          args.onActionClick?.(action);
          setIsOpen(false);
        }}
      />
    </View>
  );
}

/**
 * `MagicDialog` is the Material 3 modal dialog molecule for `@mono-magic/rn-paper`.
 *
 * It composes a scrim backdrop, responsive M3 surface (`sm`, `md`, `lg`, `fullscreen`),
 * accessible header with optional close button, optional scrollable body, and footer
 * `MagicButton` actions.
 */
const meta: Meta<typeof MagicDialog> = {
  title: 'Molecules/Dialog',
  component: MagicDialog,
  tags: ['autodocs', 'snapshot'],
  args: {
    open: true,
    inline: true,
    title: 'Publish Design Tokens',
    subtitle: 'Release v2.4.0 to workspace',
    content:
      'Publishing updates shared Material 3 color, typography, and spacing tokens across all polyglot UI packages.',
    size: 'md',
    dismissible: true,
    closeOnBackdropClick: true,
    closeOnEscape: true,
    showCloseButton: true,
    scrollable: false,
    actions: DEFAULT_ACTIONS,
    alignActions: 'end',
    onClose: fn(),
    onActionClick: fn(),
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'fullscreen'],
      table: { category: 'Appearance' },
    },
    alignActions: {
      control: 'select',
      options: ['start', 'end'],
      table: { category: 'Actions' },
    },
    open: { control: 'boolean', table: { category: 'State' } },
    inline: { control: 'boolean', table: { category: 'Layout' } },
    scrollable: { control: 'boolean', table: { category: 'Layout' } },
    dismissible: { control: 'boolean', table: { category: 'Behavior' } },
    closeOnBackdropClick: {
      control: 'boolean',
      table: { category: 'Behavior' },
    },
    closeOnEscape: { control: 'boolean', table: { category: 'Behavior' } },
    showCloseButton: { control: 'boolean', table: { category: 'Behavior' } },
    title: { control: 'text', table: { category: 'Content' } },
    subtitle: { control: 'text', table: { category: 'Content' } },
    content: { control: 'text', table: { category: 'Content' } },
    actions: { control: 'object', table: { category: 'Actions' } },
    headerSlot: { control: false, table: { category: 'Slots' } },
    footerSlot: { control: false, table: { category: 'Slots' } },
    children: { control: false, table: { category: 'Slots' } },
    onClose: { action: 'closed', table: { category: 'Events' } },
    onActionClick: { action: 'actionClicked', table: { category: 'Events' } },
  },
  render: (args) => <StatefulDialogDemo {...args} />,
};

export default meta;
type Story = StoryObj<typeof MagicDialog>;

/**
 * Default inline dialog preview verifying title, action click, close state, and reopen flow.
 */
export const Default: Story = {
  args: {
    testId: 'story-dialog',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('dialog')).toBeInTheDocument();
    const publishBtn = canvas.getByRole('button', { name: 'Publish' });
    await userEvent.click(publishBtn);
    await expect(args.onActionClick).toHaveBeenCalledWith(DEFAULT_ACTIONS[1]);
    await expect(canvas.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Reopen Dialog' })
    );
    await expect(canvas.getByRole('dialog')).toBeInTheDocument();
  },
};

/**
 * Interactive modal overlay triggered from a button, supporting backdrop & button dismissal.
 */
export const InteractiveTrigger: Story = {
  args: {
    open: false,
    inline: false,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Open Dialog' }));
    const dialog = canvas.getByRole('dialog');
    await expect(dialog).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Close dialog' }));
    await expect(args.onClose).toHaveBeenCalledWith('close-button');
  },
};

/**
 * Scrollable dialog body for long legal or release note content.
 */
export const Scrollable: Story = {
  args: {
    size: 'sm',
    scrollable: true,
    title: 'Terms & Guidelines',
    subtitle: 'Scrollable body example',
    content: undefined,
    children: Array.from({ length: 8 }, (_, idx) => (
      <Text key={idx} style={{ fontSize: 14, lineHeight: 20, color: '#44474e' }}>
        Section {idx + 1}: Consistent Material 3 spacing, semantic color intents,
        and keyboard accessibility guidelines apply across React, Angular,
        React Native, and Flutter.
      </Text>
    )),
  },
};

/**
 * Dialog rendered inside a dark Material 3 palette.
 */
export const DarkTheme: Story = {
  args: {
    open: true,
    inline: true,
    title: 'Dark Mode Dialog',
    subtitle: 'High-contrast M3 elevation level 3',
  },
  render: (args) => (
    <MagicPaperProvider palette="dark-theme">
      <View style={{ backgroundColor: '#121410', padding: 16, borderRadius: 12 }}>
        <StatefulDialogDemo {...args} />
      </View>
    </MagicPaperProvider>
  ),
};
