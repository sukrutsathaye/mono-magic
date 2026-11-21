import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { ChipItem } from '@mono-magic/atomic-design-interfaces';
import { MagicCard } from './card';

/**
 * `MagicCard` is the Material 3 card container molecule composing header,
 * media (`imageSize` `'small'`..`'full'`), body content, status/category chips,
 * action buttons (`MagicButton`), and custom React slots (`headerSlot`, `mediaSlot`, `footerSlot`).
 *
 * - **References**:
 *   - [Material 3 Cards](https://m3.material.io/components/cards/overview)
 *   - [MUI Card](https://mui.com/material-ui/react-card/)
 */
const meta: Meta<typeof MagicCard> = {
  title: 'Molecules/Card',
  component: MagicCard,
  tags: ['autodocs', 'snapshot'],
  args: {
    title: 'Design System Foundations',
    subtitle: 'Material 3 Tokens & Atomic Components',
    content:
      'Build accessible, themeable applications with shared design interfaces across Angular, React, Vue, and Flutter.',
    appearance: 'outlined',
    variant: 'basic',
    imageSize: 'full',
    width: '360px',
    alignActions: 'start',
    onActionClick: fn(),
    onChipSelect: fn(),
  },
  argTypes: {
    title: { control: 'text', table: { category: 'Content' } },
    subtitle: { control: 'text', table: { category: 'Content' } },
    content: { control: 'text', table: { category: 'Content' } },
    avatarSrc: { control: 'text', table: { category: 'Media' } },
    avatarAlt: { control: 'text', table: { category: 'Media' } },
    imageSrc: { control: 'text', table: { category: 'Media' } },
    imageAlt: { control: 'text', table: { category: 'Media' } },
    imageSize: {
      control: 'select',
      options: ['small', 'medium', 'large', 'extra-large', 'full'],
      table: { category: 'Media' },
    },
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
    width: { control: 'text', table: { category: 'Layout' } },
    alignActions: {
      control: 'select',
      options: ['start', 'end'],
      table: { category: 'Layout' },
    },
    actions: { control: 'object', table: { category: 'Content' } },
    chips: { control: 'object', table: { category: 'Content' } },
    headerSlot: { control: false, table: { category: 'Slots' } },
    mediaSlot: { control: false, table: { category: 'Slots' } },
    footerSlot: { control: false, table: { category: 'Slots' } },
    children: { control: false, table: { category: 'Slots' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    onActionClick: { action: 'actionClicked', table: { category: 'Events' } },
    onChipSelect: { action: 'chipSelected', table: { category: 'Events' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicCard>;

const SAMPLE_SVG_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220"><rect width="400" height="220" fill="%23d7e3ff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23001b3f" font-family="sans-serif" font-size="20">M3 Card Media</text></svg>';

/**
 * Default outlined card with title, subtitle, and body content.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Design System Foundations'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Material 3 Tokens & Atomic Components'),
    ).toBeInTheDocument();
  },
};

/**
 * Raised card with surface elevation and action buttons.
 */
export const WithActions: Story = {
  args: {
    appearance: 'raised',
    variant: 'with-actions',
    alignActions: 'end',
    actions: [
      { id: 'dismiss', label: 'Dismiss', variant: 'text', color: 'neutral' },
      {
        id: 'explore',
        label: 'Explore',
        variant: 'filled',
        color: 'primary',
        icon: 'arrow_forward',
      },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const exploreBtn = canvas.getByRole('button', { name: /Explore/i });
    await userEvent.click(exploreBtn);
    await expect(args.onActionClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'explore', label: 'Explore' }),
    );
  },
};

function StatefulChipsCard(args: React.ComponentProps<typeof MagicCard>) {
  const [chips, setChips] = useState<readonly ChipItem[]>(args.chips ?? []);

  return (
    <MagicCard
      {...args}
      chips={chips}
      onChipSelect={(clicked) => {
        args.onChipSelect?.(clicked);
        setChips((prev) =>
          prev.map((chip) =>
            chip.id === clicked.id
              ? { ...chip, selected: !chip.selected }
              : chip,
          ),
        );
      }}
    />
  );
}

/**
 * Card displaying interactive status and category chips in the footer.
 */
export const WithChips: Story = {
  args: {
    variant: 'with-chips',
    chips: [
      { id: 'm3', label: 'Material 3', selected: true, leadingIcon: 'palette' },
      { id: 'react', label: 'React 19', selectable: true },
      { id: 'a11y', label: 'WCAG AA', selectable: true },
    ],
  },
  render: (args) => <StatefulChipsCard {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const reactChip = canvas.getByRole('button', { name: 'React 19' });
    await userEvent.click(reactChip);
    await expect(args.onChipSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'react', label: 'React 19' }),
    );
  },
};

/**
 * Card with full-bleed media banner and action buttons.
 */
export const WithFullMedia: Story = {
  args: {
    imageSrc: SAMPLE_SVG_IMAGE,
    imageAlt: 'M3 Card Media Preview',
    imageSize: 'full',
    variant: 'with-actions',
    actions: [
      { id: 'share', label: 'Share', variant: 'tonal', color: 'secondary' },
      { id: 'read', label: 'Read Guide', variant: 'filled', color: 'primary' },
    ],
  },
};

/**
 * Comparison of all 5 card media size presets (`small`, `medium`, `large`, `extra-large`, `full`).
 */
export const ImageSizes: Story = {
  render: () => (
    <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {(['small', 'medium', 'large', 'extra-large', 'full'] as const).map(
        (imageSize) => (
          <MagicCard
            key={imageSize}
            title={`Image: ${imageSize}`}
            subtitle="CardImageSize preset"
            content="Consistent object-fit cover rendering."
            imageSrc={SAMPLE_SVG_IMAGE}
            imageAlt={`${imageSize} preview`}
            imageSize={imageSize}
            width="280px"
          />
        ),
      )}
    </Stack>
  ),
};

/**
 * Comparison of `'outlined'` vs `'raised'` Material 3 card appearances.
 */
export const Appearances: Story = {
  render: () => (
    <Stack direction="row" spacing={3} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <MagicCard
        title="Outlined Card"
        subtitle="appearance='outlined'"
        content="Uses 1px Material 3 outline border without elevation."
        appearance="outlined"
        width="320px"
      />
      <MagicCard
        title="Raised Card"
        subtitle="appearance='raised'"
        content="Uses Material 3 surface container elevation shadow."
        appearance="raised"
        width="320px"
      />
    </Stack>
  ),
};

/**
 * Custom header, media, body children, and footer slots for rich composition.
 */
export const CustomSlots: Story = {
  render: (args) => (
    <MagicCard
      {...args}
      headerSlot={
        <Typography variant="overline" color="primary">
          FEATURED RELEASE
        </Typography>
      }
      mediaSlot={
        <Box
          sx={{
            px: 2,
            py: 3,
            bgcolor: 'action.hover',
            textAlign: 'center',
          }}
        >
          <Typography variant="subtitle2">Custom Media Slot</Typography>
        </Box>
      }
      footerSlot={
        <Typography variant="caption" color="text.secondary">
          Last updated 2 hours ago
        </Typography>
      }
    >
      <Typography variant="body2">
        Custom projected child content inside CardContent.
      </Typography>
    </MagicCard>
  ),
};
