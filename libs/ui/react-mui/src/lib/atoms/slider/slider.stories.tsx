import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { MagicSlider } from './slider';

/**
 * `MagicSlider` wraps MUI's `Slider` behind a Material 3 atomic design API
 * supporting both single-thumb (`range === false`) and dual-thumb range
 * (`range === true`) modes.
 *
 * - **Modes**: Single-thumb (`value` / `defaultValue`) and range (`startValue` / `endValue`).
 * - **Features**: Discrete value tooltip (`discrete`), tick marks (`showTickMarks`),
 *   custom `displayWith` value formatter, 5 `AtomicSize` tokens, and 7 `ColorIntent` tokens.
 * - **References**:
 *   - [MUI Slider](https://mui.com/material-ui/react-slider/)
 *   - [Material 3 Sliders](https://m3.material.io/components/sliders/overview)
 */
const meta: Meta<typeof MagicSlider> = {
  title: 'Atoms/Slider',
  component: MagicSlider,
  tags: ['autodocs', 'snapshot'],
  args: {
    ariaLabel: 'Volume',
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 40,
    range: false,
    discrete: false,
    showTickMarks: false,
    disableRipple: false,
    disabled: false,
    color: 'primary',
    size: 'md',
    onChange: fn(),
    onRangeChange: fn(),
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
    min: {
      control: 'number',
      table: { category: 'Range' },
    },
    max: {
      control: 'number',
      table: { category: 'Range' },
    },
    step: {
      control: 'number',
      table: { category: 'Range' },
    },
    value: {
      control: 'number',
      table: { category: 'Value' },
    },
    defaultValue: {
      control: 'number',
      table: { category: 'Value' },
    },
    range: {
      control: 'boolean',
      table: { category: 'Behavior' },
    },
    startValue: {
      control: 'number',
      table: { category: 'Value' },
    },
    endValue: {
      control: 'number',
      table: { category: 'Value' },
    },
    defaultStartValue: {
      control: 'number',
      table: { category: 'Value' },
    },
    defaultEndValue: {
      control: 'number',
      table: { category: 'Value' },
    },
    discrete: {
      control: 'boolean',
      table: { category: 'Appearance' },
    },
    showTickMarks: {
      control: 'boolean',
      table: { category: 'Appearance' },
    },
    disableRipple: {
      control: 'boolean',
      table: { category: 'Behavior' },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'State' },
    },
    displayWith: {
      control: false,
      table: { category: 'Formatting' },
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
    onRangeChange: {
      action: 'rangeChanged',
      table: { category: 'Events' },
    },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicSlider>;

/**
 * Default single-thumb slider.
 */
export const Default: Story = {
  args: {
    ariaLabel: 'Volume',
    defaultValue: 40,
  },
  render: (args) => (
    <Box sx={{ width: 320, px: 2, py: 1 }}>
      <MagicSlider {...args} />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider', { name: 'Volume' });
    await expect(slider).toHaveAttribute('aria-valuenow', '40');
  },
};

/**
 * Dual-thumb range slider (`range={true}`) with `defaultStartValue` and `defaultEndValue`.
 */
export const Range: Story = {
  args: {
    ariaLabel: 'Price range',
    range: true,
    defaultStartValue: 20,
    defaultEndValue: 80,
    discrete: true,
  },
  render: (args) => (
    <Box sx={{ width: 320, px: 2, py: 2 }}>
      <MagicSlider {...args} />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sliders = canvas.getAllByRole('slider');
    await expect(sliders).toHaveLength(2);
    await expect(sliders[0]).toHaveAttribute('aria-valuenow', '20');
    await expect(sliders[1]).toHaveAttribute('aria-valuenow', '80');
  },
};

/**
 * Discrete slider with step tick marks (`discrete` + `showTickMarks`).
 */
export const DiscreteWithTickMarks: Story = {
  args: {
    ariaLabel: 'Step slider',
    min: 0,
    max: 100,
    step: 10,
    defaultValue: 50,
    discrete: true,
    showTickMarks: true,
  },
  render: (args) => (
    <Box sx={{ width: 320, px: 2, py: 2 }}>
      <MagicSlider {...args} />
    </Box>
  ),
};

/**
 * Discrete slider using a custom `displayWith` formatter (e.g. temperature in `°C`).
 */
export const CustomDisplayWith: Story = {
  args: {
    ariaLabel: 'Temperature',
    min: -10,
    max: 40,
    step: 5,
    defaultValue: 20,
    discrete: true,
    displayWith: (val: number) => `${val}°C`,
  },
  render: (args) => (
    <Box sx={{ width: 320, px: 2, py: 2 }}>
      <MagicSlider {...args} />
    </Box>
  ),
};

/**
 * All seven semantic palette color intents.
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
      <Stack spacing={2} sx={{ width: 320, px: 2 }}>
        {intents.map((color, idx) => (
          <MagicSlider
            key={color}
            color={color}
            ariaLabel={`${color} slider`}
            defaultValue={30 + idx * 10}
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
    <Stack spacing={2.5} sx={{ width: 320, px: 2 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size, idx) => (
        <MagicSlider
          key={size}
          size={size}
          ariaLabel={`${size} slider`}
          defaultValue={25 + idx * 15}
        />
      ))}
    </Stack>
  ),
};

/**
 * Disabled and `disableRipple` slider states.
 */
export const DisabledAndNoRipple: Story = {
  render: () => (
    <Stack spacing={2} sx={{ width: 320, px: 2 }}>
      <MagicSlider ariaLabel="Disabled slider" defaultValue={60} disabled />
      <MagicSlider
        ariaLabel="No ripple slider"
        defaultValue={45}
        disableRipple
      />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabledInput = canvas.getByRole('slider', {
      name: 'Disabled slider',
    });
    await expect(disabledInput).toBeDisabled();
  },
};
