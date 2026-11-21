import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicIcon } from '../../core/icon';
import { MagicButton } from '../button/button';
import { MagicToolTip } from './tool-tip';

/**
 * `MagicToolTip` wraps MUI's `Tooltip` around a trigger element with a
 * focusable `MagicButton` fallback when `children` is omitted.
 *
 * - **Positions**: `above`, `below`, `left`, `right`, `before`, `after`.
 * - **Timing & Touch**: Configurable `showDelay`, `hideDelay`, and `touchGestures`.
 * - **References**:
 *   - [MUI Tooltip](https://mui.com/material-ui/react-tooltip/)
 *   - [Material 3 Tooltips](https://m3.material.io/components/tooltips/overview)
 */
const meta: Meta<typeof MagicToolTip> = {
  title: 'Atoms/ToolTip',
  component: MagicToolTip,
  tags: ['autodocs', 'snapshot'],
  args: {
    message: 'Save changes to workspace',
    label: 'Hover me',
    position: 'above',
    showDelay: 0,
    hideDelay: 0,
    touchGestures: 'auto',
    disabled: false,
    onOpen: fn(),
    onClose: fn(),
  },
  argTypes: {
    message: { control: 'text', table: { category: 'Content' } },
    label: { control: 'text', table: { category: 'Content' } },
    children: { control: false, table: { category: 'Content' } },
    position: {
      control: 'select',
      options: ['above', 'below', 'left', 'right', 'before', 'after'],
      table: { category: 'Layout' },
    },
    showDelay: { control: 'number', table: { category: 'Behavior' } },
    hideDelay: { control: 'number', table: { category: 'Behavior' } },
    touchGestures: {
      control: 'select',
      options: ['auto', 'on', 'off'],
      table: { category: 'Behavior' },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    onOpen: { action: 'opened', table: { category: 'Behavior' } },
    onClose: { action: 'closed', table: { category: 'Behavior' } },
    sx: { control: false, table: { category: 'Appearance' } },
    slotProps: { control: false, table: { category: 'Behavior' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicToolTip>;

/**
 * Default tooltip using the built-in focusable fallback button trigger.
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Hover me' });
    await userEvent.hover(trigger);
    await expect(args.onOpen).toHaveBeenCalled();
  },
};

/**
 * Tooltip wrapping a custom `MagicButton` trigger.
 */
export const WithProjectedButton: Story = {
  render: (args) => (
    <div style={{ padding: 32, display: 'flex', justifyContent: 'center' }}>
      <MagicToolTip {...args} message="Publish release">
        <MagicButton variant="filled" leadingIcon="publish" label="Publish" />
      </MagicToolTip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: 'Publish' });
    await userEvent.hover(btn);
    await expect(btn).toBeInTheDocument();
  },
};

/**
 * Directional tooltip placement options around trigger buttons.
 */
export const Positions: Story = {
  render: () => (
    <Stack
      direction="row"
      spacing={2}
      useFlexGap
      sx={{ p: 4, justifyContent: 'center', flexWrap: 'wrap' }}
    >
      {(['above', 'below', 'left', 'right', 'before', 'after'] as const).map(
        (position) => (
          <MagicToolTip
            key={position}
            position={position}
            message={`Placed ${position}`}
          >
            <MagicButton variant="tonal" label={position} />
          </MagicToolTip>
        ),
      )}
    </Stack>
  ),
};

/**
 * Delayed show/hide timing and touch gesture configuration examples.
 */
export const DelaysAndTouchGestures: Story = {
  render: () => (
    <Stack direction="row" spacing={2} useFlexGap sx={{ p: 2 }}>
      <MagicToolTip
        message="Appears after 400ms"
        showDelay={400}
        hideDelay={200}
        touchGestures="on"
      >
        <MagicButton variant="outlined" label="Delayed (400ms)" />
      </MagicToolTip>
      <MagicToolTip message="Touch disabled" touchGestures="off">
        <MagicButton variant="outlined" label="Touch Off" />
      </MagicToolTip>
    </Stack>
  ),
};

/**
 * Disabled tooltip that remains suppressed on hover and focus.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Tooltip disabled',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Tooltip disabled' });
    await userEvent.hover(trigger);
    await expect(args.onOpen).not.toHaveBeenCalled();
  },
};

/**
 * Icon button trigger paired with a descriptive tooltip message.
 */
export const WithIconTrigger: Story = {
  render: () => (
    <MagicToolTip message="Help documentation" position="right">
      <MagicButton
        kind="icon"
        variant="tonal"
        leadingIcon={<MagicIcon icon="help_outline" />}
        ariaLabel="Help"
      />
    </MagicToolTip>
  ),
};
