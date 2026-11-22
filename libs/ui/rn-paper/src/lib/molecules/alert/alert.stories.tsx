import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicAlert } from './alert';

/**
 * `MagicAlert` is the Material 3 inline feedback banner molecule for `@mono-magic/rn-paper`.
 *
 * It supports `info`, `success`, `warning`, and `error` severities, `standard`,
 * `filled`, and `outlined` visual variants, optional title/icon overrides,
 * inline actions, and dismissible controls.
 */
const meta: Meta<typeof MagicAlert> = {
  title: 'Molecules/Alert',
  component: MagicAlert,
  tags: ['autodocs', 'snapshot'],
  args: {
    severity: 'info',
    variant: 'standard',
    title: 'Workspace Notice',
    message: 'New Material 3 token presets are available in this workspace.',
    hideIcon: false,
    dismissible: true,
    actionLabel: 'Review',
    size: 'md',
    onDismiss: fn(),
    onAction: fn(),
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
    dismissible: { control: 'boolean', table: { category: 'Actions' } },
    actionLabel: { control: 'text', table: { category: 'Actions' } },
    onDismiss: { action: 'dismissed', table: { category: 'Events' } },
    onAction: { action: 'actionClicked', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicAlert>;

/**
 * Default standard info alert with interactive action & dismiss button tests.
 */
export const Default: Story = {
  args: {
    testId: 'story-alert',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Review' }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Dismiss alert' }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
  },
};

/**
 * Matrix of all four severities (`info`, `success`, `warning`, `error`) in `standard` variant.
 */
export const Severities: Story = {
  render: () => (
    <View style={{ gap: 12, maxWidth: 560 }}>
      <MagicAlert
        severity="info"
        title="Information"
        message="Scheduled maintenance starts tonight at 23:00 UTC."
      />
      <MagicAlert
        severity="success"
        title="Deployment Succeeded"
        message="Version 2.4.0 is live across all regions."
      />
      <MagicAlert
        severity="warning"
        title="Storage Warning"
        message="You have used 88% of your workspace storage quota."
      />
      <MagicAlert
        severity="error"
        title="Connection Error"
        message="Unable to reach the remote build cache."
      />
    </View>
  ),
};

/**
 * Visual variant comparison (`standard`, `filled`, `outlined`).
 */
export const Variants: Story = {
  render: () => (
    <View style={{ gap: 12, maxWidth: 560 }}>
      <MagicAlert
        severity="success"
        variant="standard"
        title="Standard"
        message="Tonal container with semantic foreground."
        dismissible
      />
      <MagicAlert
        severity="success"
        variant="filled"
        title="Filled"
        message="High-emphasis solid semantic surface."
        actionLabel="Undo"
        dismissible
      />
      <MagicAlert
        severity="success"
        variant="outlined"
        title="Outlined"
        message="Low-emphasis bordered container."
        dismissible
      />
    </View>
  ),
};

/**
 * Alerts rendered inside a dark Material 3 palette.
 */
export const DarkTheme: Story = {
  render: () => (
    <MagicPaperProvider palette="dark-theme">
      <View
        style={{
          backgroundColor: '#121410',
          padding: 16,
          borderRadius: 12,
          gap: 12,
          maxWidth: 560,
        }}
      >
        <MagicAlert
          severity="info"
          variant="standard"
          title="Dark Standard"
          message="Adapts container tokens automatically for dark mode."
        />
        <MagicAlert
          severity="warning"
          variant="filled"
          title="Dark Filled"
          message="Maintains WCAG contrast on dark backgrounds."
          dismissible
        />
      </View>
    </MagicPaperProvider>
  ),
};
