import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicCheckBox } from './check-box';

/**
 * `MagicCheckBox` wraps MUI's `Checkbox` and `FormControlLabel` behind a
 * cross-platform Material 3 atomic design API.
 *
 * - **Single mode**: Controllable `checked`, `indeterminate`, `required`,
 *   `labelPosition` (`before` | `after`), and `disabledInteractive`.
 * - **Tasks mode**: Immutable hierarchical parent/subtask checklist with
 *   automatic `allComplete` and `someComplete` (indeterminate) calculation.
 * - **References**:
 *   - [MUI Checkbox](https://mui.com/material-ui/react-checkbox/)
 *   - [Material 3 Checkboxes](https://m3.material.io/components/checkbox/overview)
 */
const meta: Meta<typeof MagicCheckBox> = {
  title: 'Atoms/CheckBox',
  component: MagicCheckBox,
  tags: ['autodocs', 'snapshot'],
  args: {
    label: 'Accept terms and conditions',
    defaultChecked: false,
    indeterminate: false,
    required: false,
    labelPosition: 'after',
    disableRipple: false,
    disabled: false,
    disabledInteractive: false,
    color: 'primary',
    size: 'md',
    onChange: fn(),
    onIndeterminateChange: fn(),
    onTasksChange: fn(),
  },
  argTypes: {
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'tertiary',
        'success',
        'warning',
        'error',
        'neutral',
      ],
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: { category: 'Appearance' },
    },
    labelPosition: {
      control: 'select',
      options: ['before', 'after'],
      table: { category: 'Layout' },
    },
    label: {
      control: 'text',
      table: { category: 'Content' },
    },
    children: {
      control: false,
      table: { category: 'Content' },
    },
    tasks: {
      control: 'object',
      table: { category: 'Content' },
    },
    defaultTasks: {
      control: 'object',
      table: { category: 'Content' },
    },
    checked: {
      control: 'boolean',
      table: { category: 'State' },
    },
    defaultChecked: {
      control: 'boolean',
      table: { category: 'State' },
    },
    indeterminate: {
      control: 'boolean',
      table: { category: 'State' },
    },
    required: {
      control: 'boolean',
      table: { category: 'Validation' },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'State' },
    },
    disabledInteractive: {
      control: 'boolean',
      table: { category: 'State' },
    },
    disableRipple: {
      control: 'boolean',
      table: { category: 'Behavior' },
    },
    name: {
      control: 'text',
      table: { category: 'Behavior' },
    },
    checkboxValue: {
      control: 'text',
      table: { category: 'Behavior' },
    },
    id: {
      control: 'text',
      table: { category: 'Accessibility' },
    },
    testId: {
      control: 'text',
      table: { category: 'Accessibility' },
    },
    ariaLabel: {
      control: 'text',
      table: { category: 'Accessibility' },
    },
    onChange: {
      action: 'changed',
      table: { category: 'Events' },
    },
    onIndeterminateChange: {
      action: 'indeterminateChanged',
      table: { category: 'Events' },
    },
    onTasksChange: {
      action: 'tasksChanged',
      table: { category: 'Events' },
    },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicCheckBox>;

/**
 * Default uncontrolled checkbox with toggle interaction test.
 */
export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', {
      name: 'Accept terms and conditions',
    });
    await expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.onChange).toHaveBeenCalledWith(true);
  },
};

/**
 * All seven semantic palette color intents rendered in checked state.
 */
export const Colors: Story = {
  render: () => {
    const intents = [
      'primary',
      'secondary',
      'tertiary',
      'success',
      'warning',
      'error',
      'neutral',
    ] as const;

    return (
      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {intents.map((color) => (
          <MagicCheckBox
            key={color}
            color={color}
            defaultChecked
            label={color.charAt(0).toUpperCase() + color.slice(1)}
          />
        ))}
      </Stack>
    );
  },
};

/**
 * Comparison of all five atomic size tokens (`xs`, `sm`, `md`, `lg`, `xl`).
 */
export const Sizes: Story = {
  render: () => (
    <Stack
      direction="row"
      spacing={2}
      useFlexGap
      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
    >
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <MagicCheckBox
          key={size}
          size={size}
          defaultChecked
          label={size.toUpperCase()}
        />
      ))}
    </Stack>
  ),
};

function StatefulIndeterminateCheckboxes() {
  const [indeterminate, setIndeterminate] = useState(true);

  return (
    <Stack spacing={1.5}>
      <MagicCheckBox
        label="Indeterminate state"
        indeterminate={indeterminate}
        onIndeterminateChange={setIndeterminate}
      />
      <MagicCheckBox label="Required agreement" required />
      <MagicCheckBox
        label="Label positioned before"
        labelPosition="before"
        defaultChecked
      />
      <MagicCheckBox
        label="Label positioned after"
        labelPosition="after"
        defaultChecked
      />
    </Stack>
  );
}

/**
 * Indeterminate, required, and label position (`before` vs `after`) variations.
 */
export const IndeterminateAndLabelPositions: Story = {
  render: () => <StatefulIndeterminateCheckboxes />,
};

/**
 * Hierarchical `tasks` mode with parent and subtask indeterminate/completion sync.
 */
export const HierarchicalTasks: Story = {
  args: {
    ariaLabel: 'Release checklist',
    defaultTasks: [
      {
        id: 'ci',
        name: 'CI Pipeline',
        checked: false,
        subtasks: [
          { id: 'lint', name: 'Run ESLint', checked: true },
          { id: 'test', name: 'Run Vitest', checked: false },
          { id: 'build', name: 'Build Artifacts', checked: false },
        ],
      },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const parentBox = canvas.getByRole('checkbox', { name: 'CI Pipeline' });
    await expect(parentBox).toHaveAttribute('data-indeterminate', 'true');

    await userEvent.click(parentBox);
    await expect(parentBox).toBeChecked();
    await expect(args.onTasksChange).toHaveBeenCalled();
    await expect(args.onChange).toHaveBeenCalledWith(true);
  },
};

/**
 * Comparison of natively disabled vs focusable `disabledInteractive` checkboxes.
 */
export const DisabledStates: Story = {
  args: {
    onChange: fn(),
  },
  render: (args) => (
    <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <MagicCheckBox
        label="Disabled Unchecked"
        disabled
        onChange={args.onChange}
      />
      <MagicCheckBox
        label="Disabled Checked"
        disabled
        defaultChecked
        onChange={args.onChange}
      />
      <MagicCheckBox
        label="Disabled Interactive"
        disabled
        disabledInteractive
        onChange={args.onChange}
      />
    </Stack>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const nativeDisabled = canvas.getByRole('checkbox', {
      name: 'Disabled Unchecked',
    });
    const interactiveDisabled = canvas.getByRole('checkbox', {
      name: 'Disabled Interactive',
    });
    await expect(nativeDisabled).toBeDisabled();
    await expect(interactiveDisabled).not.toBeDisabled();
    await expect(interactiveDisabled).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(interactiveDisabled);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/**
 * Custom JSX children projected as the checkbox label.
 */
export const CustomChildren: Story = {
  render: (args) => (
    <MagicCheckBox {...args} label="Ignored fallback">
      <Typography component="span" sx={{ fontWeight: 600 }}>
        Subscribe to security advisories
      </Typography>
    </MagicCheckBox>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Subscribe to security advisories'),
    ).toBeInTheDocument();
  },
};
