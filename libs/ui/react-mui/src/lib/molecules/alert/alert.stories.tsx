import { useState } from 'react';
import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicButton } from '../../atoms/button/button';
import { MagicAlert } from './alert';

function StatefulAlertDemo(args: React.ComponentProps<typeof MagicAlert>) {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return (
      <MagicButton
        label="Show Alert"
        variant="tonal"
        size="sm"
        onClick={() => setVisible(true)}
      />
    );
  }

  return (
    <MagicAlert
      {...args}
      onDismiss={() => {
        args.onDismiss?.();
        setVisible(false);
      }}
    />
  );
}

function StatefulVariantsDemo() {
  const [visible, setVisible] = useState({
    standard: true,
    filled: true,
    outlined: true,
  });

  const anyHidden = Object.values(visible).some((v) => !v);

  return (
    <Stack spacing={1.5} sx={{ maxWidth: 560, alignItems: 'flex-start' }}>
      {anyHidden && (
        <MagicButton
          label="Reset Alerts"
          variant="tonal"
          size="sm"
          onClick={() =>
            setVisible({ standard: true, filled: true, outlined: true })
          }
        />
      )}
      {visible.standard && (
        <MagicAlert
          severity="success"
          variant="standard"
          title="Standard Variant"
          message="Soft container surface for inline feedback."
          actionLabel="Undo"
          dismissible
          onDismiss={() => setVisible((prev) => ({ ...prev, standard: false }))}
        />
      )}
      {visible.filled && (
        <MagicAlert
          severity="success"
          variant="filled"
          title="Filled Variant"
          message="High-emphasis solid surface for critical status."
          actionLabel="Undo"
          dismissible
          onDismiss={() => setVisible((prev) => ({ ...prev, filled: false }))}
        />
      )}
      {visible.outlined && (
        <MagicAlert
          severity="success"
          variant="outlined"
          title="Outlined Variant"
          message="Low-emphasis bordered container."
          actionLabel="Undo"
          dismissible
          onDismiss={() => setVisible((prev) => ({ ...prev, outlined: false }))}
        />
      )}
    </Stack>
  );
}

/**
 * `MagicAlert` is the Material 3 inline alert banner molecule composing
 * MUI v9 `Alert`, `AlertTitle`, `MagicIcon`, and `MagicButton` action/dismiss controls.
 *
 * - **References**:
 *   - [MUI Alert](https://mui.com/material-ui/react-alert/)
 */
const meta: Meta<typeof MagicAlert> = {
  title: 'Molecules/Alert',
  component: MagicAlert,
  tags: ['autodocs', 'snapshot'],
  args: {
    severity: 'info',
    variant: 'standard',
    title: 'Workspace Sync Available',
    message: 'New Material 3 theme tokens are ready to apply.',
    hideIcon: false,
    dismissible: true,
    actionLabel: 'Review',
    size: 'md',
    onAction: fn(),
    onDismiss: fn(),
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
    hideIcon: { control: 'boolean', table: { category: 'Behavior' } },
    dismissible: { control: 'boolean', table: { category: 'Behavior' } },
    actionLabel: { control: 'text', table: { category: 'Actions' } },
    onAction: { action: 'actionClicked', table: { category: 'Events' } },
    onDismiss: { action: 'dismissed', table: { category: 'Events' } },
    iconSlot: { control: false, table: { category: 'Slots' } },
    children: { control: false, table: { category: 'Slots' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicAlert>;

/**
 * Default standard info alert verifying action, dismiss, and restore interactions.
 */
export const Default: Story = {
  render: (args) => <StatefulAlertDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('alert')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Review' }));
    await expect(args.onAction).toHaveBeenCalledTimes(1);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Dismiss alert' }),
    );
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByRole('alert')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Show Alert' }));
    await expect(canvas.getByRole('alert')).toBeInTheDocument();
  },
};

/**
 * All 4 semantic severities (`info`, `success`, `warning`, `error`) in standard style.
 */
export const Severities: Story = {
  render: () => (
    <Stack spacing={1.5} sx={{ maxWidth: 560 }}>
      <MagicAlert
        severity="info"
        title="Information"
        message="Scheduled maintenance starts tonight at 02:00 UTC."
      />
      <MagicAlert
        severity="success"
        title="Deployment Complete"
        message="All 5 UI libraries passed visual regression checks."
      />
      <MagicAlert
        severity="warning"
        title="Storage Threshold"
        message="Artifact cache usage has reached 85% of the project quota."
      />
      <MagicAlert
        severity="error"
        title="Build Failed"
        message="TypeScript strict check reported 2 contract mismatches."
      />
    </Stack>
  ),
};

/**
 * Comparison of `standard`, `filled`, and `outlined` alert emphasis variants.
 */
export const Variants: Story = {
  render: () => <StatefulVariantsDemo />,
};

/**
 * Comparison of all 5 atomic sizes (`xs`..`xl`).
 */
export const Sizes: Story = {
  render: () => (
    <Stack spacing={1.25} sx={{ maxWidth: 560 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <MagicAlert
          key={size}
          size={size}
          severity="info"
          message={`Size "${size}" inline alert banner`}
        />
      ))}
    </Stack>
  ),
};
