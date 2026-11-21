import type { Meta, StoryObj } from '@storybook/react';
import { Text, View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicButton } from '../button/button';
import { MagicToolTip } from './tool-tip';

/**
 * `MagicToolTip` provides an accessible Material 3 plain tooltip anchored around
 * a trigger child (or `MagicButton` fallback), supporting 6 directional
 * placements, configurable delays, touch gestures, and `disabled` suppression.
 *
 * - **References**:
 *   - [React Native Paper Tooltip](https://callstack.github.io/react-native-paper/docs/components/Tooltip)
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
      table: { category: 'Appearance' },
    },
    showDelay: { control: 'number', table: { category: 'Timing' } },
    hideDelay: { control: 'number', table: { category: 'Timing' } },
    touchGestures: {
      control: 'select',
      options: ['auto', 'on', 'off'],
      table: { category: 'Behavior' },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    onOpen: { action: 'opened', table: { category: 'Events' } },
    onClose: { action: 'closed', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicToolTip>;

/**
 * Default tooltip using the fallback `MagicButton` trigger, verified with hover interaction.
 */
export const Default: Story = {
  render: (args) => (
    <View style={{ padding: 48, alignItems: 'center' }}>
      <MagicToolTip {...args} />
    </View>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Hover me' });
    await userEvent.hover(trigger);
    await expect(canvas.getByRole('tooltip')).toHaveTextContent(
      'Save changes to workspace'
    );
    await expect(args.onOpen).toHaveBeenCalledTimes(1);
    await userEvent.unhover(trigger);
    await expect(canvas.queryByRole('tooltip')).toBeNull();
    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

/**
 * Comparison of directional tooltip placements (`above`, `below`, `left`, `right`, `before`, `after`).
 */
export const Positions: Story = {
  render: () => (
    <View
      style={{
        padding: 56,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
        justifyContent: 'center',
      }}
    >
      <MagicToolTip position="above" message="Above tooltip">
        <MagicButton variant="tonal" label="Above" />
      </MagicToolTip>
      <MagicToolTip position="below" message="Below tooltip">
        <MagicButton variant="tonal" label="Below" />
      </MagicToolTip>
      <MagicToolTip position="left" message="Left tooltip">
        <MagicButton variant="tonal" label="Left" />
      </MagicToolTip>
      <MagicToolTip position="right" message="Right tooltip">
        <MagicButton variant="tonal" label="Right" />
      </MagicToolTip>
      <MagicToolTip position="before" message="Before tooltip">
        <MagicButton variant="outlined" label="Before" />
      </MagicToolTip>
      <MagicToolTip position="after" message="After tooltip">
        <MagicButton variant="outlined" label="After" />
      </MagicToolTip>
    </View>
  ),
};

/**
 * Tooltip triggered by tap (`touchGestures="on"`) wrapping custom child content.
 */
export const TouchActivated: Story = {
  args: {
    message: 'Copied to clipboard',
    touchGestures: 'on',
    position: 'below',
  },
  render: (args) => (
    <View style={{ padding: 48, alignItems: 'center' }}>
      <MagicToolTip {...args}>
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#74777f',
          }}
        >
          <Text>Tap me</Text>
        </View>
      </MagicToolTip>
    </View>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByText('Tap me');
    await userEvent.click(trigger);
    await expect(canvas.getByRole('tooltip')).toHaveTextContent(
      'Copied to clipboard'
    );
  },
};

/**
 * Suppressed tooltip state (`disabled=true`) that will not open on hover or focus.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Tooltip Disabled',
  },
  render: (args) => (
    <View style={{ padding: 48, alignItems: 'center' }}>
      <MagicToolTip {...args} />
    </View>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Tooltip Disabled' });
    await userEvent.hover(trigger);
    await expect(canvas.queryByRole('tooltip')).toBeNull();
    await expect(args.onOpen).not.toHaveBeenCalled();
  },
};

/**
 * Dynamic Material 3 dark palette tooltip appearance.
 */
export const DarkTheme: Story = {
  render: () => (
    <MagicPaperProvider palette="dark-theme">
      <View
        style={{
          backgroundColor: '#121410',
          padding: 48,
          borderRadius: 12,
          alignItems: 'center',
        }}
      >
        <MagicToolTip message="Dark palette tooltip" label="Dark Trigger" />
      </View>
    </MagicPaperProvider>
  ),
};
