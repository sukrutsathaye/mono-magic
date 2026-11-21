import type { Meta, StoryObj } from '@storybook/react';
import { Text, View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicCard, type CardActionItem, type ChipItem } from './card';

const SAMPLE_ACTIONS: readonly CardActionItem[] = [
  { id: 'share', label: 'Share', variant: 'text', color: 'primary' },
  { id: 'explore', label: 'Explore', variant: 'filled', color: 'primary' },
];

const SAMPLE_CHIPS: readonly ChipItem[] = [
  { id: 'design', label: 'Design Systems', selected: true },
  { id: 'm3', label: 'Material 3', leadingIcon: 'palette' },
  { id: 'archived', label: 'Archived', disabled: true },
];

const SVG_PLACEHOLDER_URI =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="320"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23005cbb"/><stop offset="100%" stop-color="%237d00fa"/></linearGradient></defs><rect width="600" height="320" fill="url(%23g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="28">Material 3 Media</text></svg>';

/**
 * `MagicCard` is the Material 3 card container molecule for `@mono-magic/rn-paper`.
 *
 * It composes header, media, body content, status/category chips, action buttons
 * (`MagicButton`), and custom slots (`headerSlot`, `mediaSlot`, `children`, `footerSlot`)
 * with `'outlined'` and `'raised'` surface appearances.
 *
 * - **References**:
 *   - [Material 3 Cards](https://m3.material.io/components/cards/overview)
 *   - [React Native Paper Card](https://callstack.github.io/react-native-paper/docs/components/Card)
 */
const meta: Meta<typeof MagicCard> = {
  title: 'Molecules/Card',
  component: MagicCard,
  tags: ['autodocs', 'snapshot'],
  args: {
    title: 'Atomic Design System',
    subtitle: 'Cross-platform Material 3 tokens',
    content:
      'Build consistent user interfaces across Angular Material, React Native Paper, and Flutter using shared atomic contracts.',
    appearance: 'outlined',
    variant: 'basic',
    imageSize: 'full',
    imageAlt: 'Card cover banner',
    alignActions: 'start',
    width: '380px',
    actions: [],
    chips: [],
    onActionClick: fn(),
    onChipSelect: fn(),
  },
  argTypes: {
    appearance: {
      control: 'select',
      options: ['outlined', 'raised'],
      table: { category: 'Appearance' },
    },
    variant: {
      control: 'select',
      options: ['basic', 'with-actions', 'with-chips'],
      table: { category: 'Appearance' },
    },
    imageSize: {
      control: 'select',
      options: ['small', 'medium', 'large', 'extra-large', 'full'],
      table: { category: 'Media' },
    },
    width: {
      control: 'text',
      table: { category: 'Appearance' },
    },
    alignActions: {
      control: 'select',
      options: ['start', 'end'],
      table: { category: 'Actions' },
    },
    title: { control: 'text', table: { category: 'Content' } },
    subtitle: { control: 'text', table: { category: 'Content' } },
    content: { control: 'text', table: { category: 'Content' } },
    imageSrc: { control: 'text', table: { category: 'Media' } },
    imageAlt: { control: 'text', table: { category: 'Media' } },
    actions: { control: 'object', table: { category: 'Actions' } },
    chips: { control: 'object', table: { category: 'Chips' } },
    headerSlot: { control: false, table: { category: 'Slots' } },
    mediaSlot: { control: false, table: { category: 'Slots' } },
    footerSlot: { control: false, table: { category: 'Slots' } },
    children: { control: false, table: { category: 'Slots' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    onActionClick: { action: 'actionClicked', table: { category: 'Events' } },
    onChipSelect: { action: 'chipSelected', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicCard>;

/**
 * Default outlined card displaying title, subtitle, and body content.
 *
 * Props: `appearance="outlined"`, `variant="basic"`.
 */
export const OutlinedBasic: Story = {
  args: {
    appearance: 'outlined',
    variant: 'basic',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Atomic Design System')).toBeInTheDocument();
    await expect(
      canvas.getByText('Cross-platform Material 3 tokens')
    ).toBeInTheDocument();
  },
};

/**
 * Raised Material 3 card with elevated surface shadow and end-aligned action buttons.
 *
 * Props: `appearance="raised"`, `variant="with-actions"`, `alignActions="end"`.
 */
export const RaisedWithActions: Story = {
  args: {
    appearance: 'raised',
    variant: 'with-actions',
    alignActions: 'end',
    actions: SAMPLE_ACTIONS,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const exploreBtn = canvas.getByRole('button', { name: 'Explore' });
    await userEvent.click(exploreBtn);
    await expect(args.onActionClick).toHaveBeenCalledWith(SAMPLE_ACTIONS[1]);
  },
};

/**
 * Card displaying category chips that emit `onChipSelect` when activated.
 *
 * Props: `variant="with-chips"`, `chips=SAMPLE_CHIPS`.
 */
export const WithChips: Story = {
  args: {
    variant: 'with-chips',
    chips: SAMPLE_CHIPS,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const chipBtn = canvas.getByRole('button', { name: 'Material 3' });
    await userEvent.click(chipBtn);
    await expect(args.onChipSelect).toHaveBeenCalledWith(SAMPLE_CHIPS[1]);
  },
};

/**
 * Full-bleed media card with cover image, chips, and footer actions.
 *
 * Props: `imageSrc`, `imageSize="full"`, `actions=SAMPLE_ACTIONS`, `chips=SAMPLE_CHIPS`.
 */
export const WithFullMedia: Story = {
  args: {
    appearance: 'raised',
    imageSrc: SVG_PLACEHOLDER_URI,
    imageAlt: 'Gradient cover media',
    imageSize: 'full',
    chips: SAMPLE_CHIPS.slice(0, 2),
    actions: SAMPLE_ACTIONS,
  },
};

/**
 * Comparison of all five media image size presets (`small`, `medium`, `large`, `extra-large`, `full`).
 */
export const ImageSizes: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
      {(['small', 'medium', 'large', 'extra-large', 'full'] as const).map(
        (size) => (
          <MagicCard
            key={size}
            title={`Image: ${size}`}
            subtitle="Media size preset"
            imageSrc={SVG_PLACEHOLDER_URI}
            imageAlt={`${size} preview`}
            imageSize={size}
            width="260px"
          />
        )
      )}
    </View>
  ),
};

/**
 * Card demonstrating `headerSlot`, `mediaSlot`, `children`, and `footerSlot` composition.
 */
export const CustomSlots: Story = {
  render: (args) => (
    <MagicCard
      {...args}
      headerSlot={
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#005cbb' }}>
          FEATURED RELEASE
        </Text>
      }
      mediaSlot={
        <View
          style={{
            height: 72,
            backgroundColor: '#d7e3ff',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#001b3f', fontWeight: '600' }}>
            Custom Media Slot Banner
          </Text>
        </View>
      }
      footerSlot={
        <Text style={{ fontSize: 12, color: '#565e71' }}>
          Updated 5 minutes ago
        </Text>
      }
    >
      <Text style={{ fontSize: 13, color: '#44474e' }}>
        Additional projected body children inside the card content area.
      </Text>
    </MagicCard>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('FEATURED RELEASE')).toBeInTheDocument();
    await expect(
      canvas.getByText('Custom Media Slot Banner')
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Updated 5 minutes ago')
    ).toBeInTheDocument();
  },
};

/**
 * Outlined and raised cards rendered inside a dark Material 3 palette.
 */
export const DarkTheme: Story = {
  render: () => (
    <MagicPaperProvider palette="dark-theme">
      <View
        style={{
          backgroundColor: '#121410',
          padding: 16,
          borderRadius: 12,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <MagicCard
          appearance="outlined"
          title="Outlined Dark Card"
          subtitle="Surface & outline tokens"
          content="Uses dark M3 surface and outline colors automatically."
          width="320px"
          chips={[{ id: 'dark', label: 'Dark Mode', selected: true }]}
        />
        <MagicCard
          appearance="raised"
          title="Raised Dark Card"
          subtitle="Elevated level 1 container"
          content="Combines elevated surface token with action buttons."
          width="320px"
          alignActions="end"
          actions={SAMPLE_ACTIONS}
        />
      </View>
    </MagicPaperProvider>
  ),
};
