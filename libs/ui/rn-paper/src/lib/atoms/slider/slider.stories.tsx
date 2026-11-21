import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { expect, fn, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicSlider } from './slider';

/**
 * `MagicSlider` is a pure-React-Native Material 3 slider atom with zero native
 * binary dependencies.
 *
 * - **Modes**: single-thumb (`range=false`) and dual-thumb range selection (`range=true`, `startValue`, `endValue`).
 * - **Accessibility**: full WAI-ARIA slider semantics (`role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`) and keyboard controls (`ArrowLeft`/`ArrowRight`, `Home`, `End`, `PageUp`/`PageDown`).
 * - **Indicators**: supports `discrete` value bubbles (`displayWith` formatter) and `showTickMarks`.
 * - **References**:
 *   - [Material 3 Sliders](https://m3.material.io/components/sliders/overview)
 */
const meta: Meta<typeof MagicSlider> = {
  title: 'Atoms/Slider',
  component: MagicSlider,
  tags: ['autodocs', 'snapshot'],
  args: {
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
    ariaLabel: 'Volume',
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
    discrete: {
      control: 'boolean',
      table: { category: 'Appearance' },
    },
    showTickMarks: {
      control: 'boolean',
      table: { category: 'Appearance' },
    },
    min: {
      control: 'number',
      table: { category: 'Range & Value' },
    },
    max: {
      control: 'number',
      table: { category: 'Range & Value' },
    },
    step: {
      control: 'number',
      table: { category: 'Range & Value' },
    },
    value: {
      control: 'number',
      table: { category: 'Range & Value' },
    },
    defaultValue: {
      control: 'number',
      table: { category: 'Range & Value' },
    },
    range: {
      control: 'boolean',
      table: { category: 'Range & Value' },
    },
    startValue: {
      control: 'number',
      table: { category: 'Range & Value' },
    },
    defaultStartValue: {
      control: 'number',
      table: { category: 'Range & Value' },
    },
    endValue: {
      control: 'number',
      table: { category: 'Range & Value' },
    },
    defaultEndValue: {
      control: 'number',
      table: { category: 'Range & Value' },
    },
    displayWith: {
      control: false,
      table: { category: 'Range & Value' },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'State' },
    },
    disableRipple: {
      control: 'boolean',
      table: { category: 'State' },
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
  },
  decorators: [
    (StoryComponent) => (
      <View style={{ width: '100%', maxWidth: 420, paddingHorizontal: 16 }}>
        <StoryComponent />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MagicSlider>;

/**
 * Interactive single-thumb slider playground.
 */
export const Playground: Story = {
  args: {
    defaultValue: 40,
    ariaLabel: 'Volume',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider', { name: 'Volume' });
    await expect(slider).toHaveAttribute('aria-valuenow', '40');
    await expect(slider).toHaveAttribute('aria-valuemin', '0');
    await expect(slider).toHaveAttribute('aria-valuemax', '100');
  },
};

/**
 * Dual-thumb range slider (`range=true`) with `startValue` and `endValue`.
 */
export const RangeMode: Story = {
  args: {
    range: true,
    defaultStartValue: 25,
    defaultEndValue: 75,
    discrete: true,
    ariaLabel: 'Price range',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const startThumb = canvas.getByRole('slider', {
      name: 'Price range start',
    });
    const endThumb = canvas.getByRole('slider', {
      name: 'Price range end',
    });
    await expect(startThumb).toHaveAttribute('aria-valuenow', '25');
    await expect(endThumb).toHaveAttribute('aria-valuenow', '75');
  },
};

/**
 * Discrete slider with step tick marks and custom `displayWith` value formatting.
 */
export const DiscreteAndTicks: Story = {
  args: {
    min: 0,
    max: 100,
    step: 10,
    defaultValue: 60,
    discrete: true,
    showTickMarks: true,
    displayWith: (v: number) => `${v}%`,
    ariaLabel: 'Progress percentage',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider', {
      name: 'Progress percentage',
    });
    await expect(slider).toHaveAttribute('aria-valuetext', '60%');
  },
};

/**
 * Comparison of all seven semantic Material 3 palette color intents.
 */
export const Colors: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      {(
        [
          'primary',
          'secondary',
          'tertiary',
          'success',
          'warning',
          'error',
          'neutral',
        ] as const
      ).map((color, idx) => (
        <MagicSlider
          key={color}
          color={color}
          defaultValue={25 + idx * 10}
          ariaLabel={`${color} slider`}
        />
      ))}
    </View>
  ),
};

/**
 * Comparison of all five Material 3 size scale tokens (`xs` through `xl`).
 */
export const Sizes: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <MagicSlider size="xs" defaultValue={20} ariaLabel="XS slider" />
      <MagicSlider size="sm" defaultValue={35} ariaLabel="SM slider" />
      <MagicSlider size="md" defaultValue={50} ariaLabel="MD slider" />
      <MagicSlider size="lg" defaultValue={65} ariaLabel="LG slider" />
      <MagicSlider size="xl" defaultValue={80} ariaLabel="XL slider" />
    </View>
  ),
};

/**
 * Disabled single-thumb and range sliders.
 */
export const Disabled: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <MagicSlider
        disabled
        defaultValue={45}
        discrete
        ariaLabel="Disabled single"
      />
      <MagicSlider
        disabled
        range
        defaultStartValue={20}
        defaultEndValue={80}
        showTickMarks
        step={20}
        ariaLabel="Disabled range"
      />
    </View>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const single = canvas.getByRole('slider', { name: 'Disabled single' });
    await expect(single).toHaveAttribute('aria-disabled', 'true');
  },
};

/**
 * Dark palette preview verifying runtime theme token adaptation.
 */
export const DarkTheme: Story = {
  render: () => (
    <MagicPaperProvider palette="dark-theme">
      <View
        style={{
          backgroundColor: '#121410',
          padding: 20,
          borderRadius: 12,
          gap: 16,
        }}
      >
        <MagicSlider
          defaultValue={55}
          discrete
          ariaLabel="Dark primary slider"
        />
        <MagicSlider
          range
          color="tertiary"
          defaultStartValue={30}
          defaultEndValue={70}
          showTickMarks
          step={10}
          ariaLabel="Dark tertiary range"
        />
      </View>
    </MagicPaperProvider>
  ),
};
