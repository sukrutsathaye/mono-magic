import type { Meta, StoryObj } from '@storybook/react';
import { Text, View } from 'react-native';
import { expect, within } from 'storybook/test';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicBadge } from './badge';

/**
 * `MagicBadge` wraps React Native Paper's `Badge` around projected anchor
 * content (or `icon` / `label` fallbacks) with 8-way positioning, dot mode,
 * semantic color intents, and Material 3 sizing.
 *
 * - **References**:
 *   - [React Native Paper Badge](https://callstack.github.io/react-native-paper/docs/components/Badge)
 *   - [Material 3 Badges](https://m3.material.io/components/badges/overview)
 */
const meta: Meta<typeof MagicBadge> = {
  title: 'Atoms/Badge',
  component: MagicBadge,
  tags: ['autodocs', 'snapshot'],
  args: {
    content: 7,
    icon: 'mail',
    label: 'Inbox',
    color: 'primary',
    size: 'md',
    position: 'above after',
    overlap: true,
    hidden: false,
    disabled: false,
    description: '7 unread items',
  },
  argTypes: {
    content: { control: 'text', table: { category: 'Content' } },
    icon: { control: 'text', table: { category: 'Content' } },
    label: { control: 'text', table: { category: 'Content' } },
    children: { control: false, table: { category: 'Content' } },
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
    position: {
      control: 'select',
      options: [
        'above after',
        'above before',
        'below after',
        'below before',
        'above',
        'below',
        'before',
        'after',
      ],
      table: { category: 'Appearance' },
    },
    overlap: { control: 'boolean', table: { category: 'Appearance' } },
    hidden: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    description: { control: 'text', table: { category: 'Accessibility' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicBadge>;

/**
 * Default icon badge displaying a numeric unread count.
 *
 * Props: `content=7`, `icon="mail"`, `color="primary"`, `size="md"`, `position="above after"`, `overlap=true`.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('7')).toBeInTheDocument();
  },
};

/**
 * Badge anchored around custom projected children with `overlap=false` so it sits inline next to the anchor.
 */
export const WrappingChild: Story = {
  args: {
    icon: undefined,
    content: 12,
    color: 'error',
    overlap: false,
    testId: 'wrapped-badge',
  },
  render: (args) => (
    <MagicBadge {...args}>
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#74777f',
        }}
      >
        <Text>Notifications</Text>
      </View>
    </MagicBadge>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Notifications')).toBeInTheDocument();
    await expect(canvas.getByText('12')).toBeInTheDocument();
  },
};

/**
 * Comparison of all 8 anchor position placements (`above after`, `above before`, `below after`, `below before`, `above`, `below`, `before`, `after`).
 */
export const Positions: Story = {
  render: () => (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 28,
        padding: 16,
      }}
    >
      <MagicBadge content={1} icon="inbox" position="above after" />
      <MagicBadge content={2} icon="inbox" position="above before" />
      <MagicBadge content={3} icon="inbox" position="below after" />
      <MagicBadge content={4} icon="inbox" position="below before" />
      <MagicBadge content={5} icon="inbox" position="above" />
      <MagicBadge content={6} icon="inbox" position="below" />
      <MagicBadge content={7} icon="inbox" position="before" />
      <MagicBadge content={8} icon="inbox" position="after" />
    </View>
  ),
};

/**
 * Comparison of dot badge, hidden (`hidden=true`), and muted (`disabled=true`) states.
 */
export const StatesAndDot: Story = {
  render: () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        padding: 12,
      }}
    >
      <MagicBadge icon="notifications" description="Unread dot" testId="dot-badge" />
      <MagicBadge content={3} icon="notifications" hidden testId="hidden-badge" />
      <MagicBadge content={3} icon="notifications" disabled testId="disabled-badge" />
    </View>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('dot-badge-badge')).toBeInTheDocument();
    await expect(canvas.queryByTestId('hidden-badge-badge')).toBeNull();
    await expect(canvas.getByTestId('disabled-badge-badge')).toBeInTheDocument();
  },
};

/**
 * Gallery of all five size tokens (`xs`..`xl`) paired with all seven semantic color intents.
 */
export const SizesAndColors: Story = {
  render: () => (
    <View style={{ gap: 20, padding: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 28 }}>
        <MagicBadge size="xs" color="primary" content={1} icon="home" />
        <MagicBadge size="sm" color="secondary" content={4} icon="star" />
        <MagicBadge size="md" color="tertiary" content={9} icon="mail" />
        <MagicBadge size="lg" color="success" content={42} icon="check_circle" />
        <MagicBadge size="xl" color="error" content="99+" icon="error" />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 28 }}>
        <MagicBadge color="warning" content="!" icon="warning" />
        <MagicBadge color="neutral" content={0} label="Messages" overlap={false} />
      </View>
    </View>
  ),
};

/**
 * Dynamic Material 3 dark theme verification for `MagicBadge`.
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
          gap: 24,
        }}
      >
        <MagicBadge content={5} color="primary" icon="mail" />
        <MagicBadge content={12} color="error" icon="notifications" />
        <MagicBadge color="success" icon="check_circle" />
      </View>
    </MagicPaperProvider>
  ),
};
