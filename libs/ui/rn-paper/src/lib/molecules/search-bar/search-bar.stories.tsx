import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicSearchBar } from './search-bar';

/**
 * `MagicSearchBar` composes `MagicFormField`, `MagicTextInput`, `MagicIcon`,
 * and `MagicButton` into a semantic `role="search"` landmark.
 *
 * - **References**:
 *   - [Material 3 Search](https://m3.material.io/components/search/overview)
 */
const meta: Meta<typeof MagicSearchBar> = {
  title: 'Molecules/SearchBar',
  component: MagicSearchBar,
  args: {
    label: 'Search',
    placeholder: 'Search...',
    submitLabel: 'Search',
    buttonVariant: 'filled',
    buttonColor: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    onQueryChange: fn(),
    onSearch: fn(),
  },
  argTypes: {
    query: { control: 'text', table: { category: 'Value' } },
    defaultQuery: { control: 'text', table: { category: 'Value' } },
    label: { control: 'text', table: { category: 'Content' } },
    placeholder: { control: 'text', table: { category: 'Content' } },
    submitLabel: { control: 'text', table: { category: 'Content' } },
    buttonVariant: {
      control: 'select',
      options: ['filled', 'tonal', 'outlined', 'elevated', 'text'],
      table: { category: 'Button' },
    },
    buttonColor: {
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
      table: { category: 'Button' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: { category: 'Appearance' },
    },
    disabled: { control: 'boolean', table: { category: 'State' } },
    loading: { control: 'boolean', table: { category: 'State' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    onQueryChange: { action: 'queryChanged', table: { category: 'Events' } },
    onSearch: { action: 'searched', table: { category: 'Events' } },
  },
  render: (args) => (
    <View style={{ maxWidth: 520, width: '100%' }}>
      <MagicSearchBar {...args} />
    </View>
  ),
};

export default meta;
type Story = StoryObj<typeof MagicSearchBar>;

/**
 * Default search bar with typing and submit-button interaction verification.
 *
 * Props: `label="Search"`, `placeholder="Search..."`, `submitLabel="Search"`, `buttonVariant="filled"`.
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const inputEl = canvas.getByRole('searchbox');
    await userEvent.type(inputEl, 'Material');
    await userEvent.click(canvas.getByRole('button', { name: 'Search' }));
    await expect(args.onSearch).toHaveBeenCalledWith('Material');
  },
};

/**
 * Search bar initialized with an existing query string and custom submit button label.
 *
 * Props: `defaultQuery="Design tokens"`, `submitLabel="Find"`.
 */
export const Prefilled: Story = {
  args: { defaultQuery: 'Design tokens', submitLabel: 'Find' },
};

/**
 * Search bar styled with a secondary tonal submit button.
 *
 * Props: `buttonVariant="tonal"`, `buttonColor="secondary"`.
 */
export const TonalButton: Story = {
  args: { buttonVariant: 'tonal', buttonColor: 'secondary' },
};

/**
 * In-flight search state that disables the submit button while loading.
 *
 * Props: `defaultQuery="components"`, `loading=true`.
 */
export const Loading: Story = {
  args: { defaultQuery: 'components', loading: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const submit = canvas.getByRole('button');
    await expect(submit).toHaveAttribute('aria-disabled', 'true');
    await expect(args.onSearch).not.toHaveBeenCalled();
  },
};

/**
 * Disabled state locking both the search input and submit button.
 *
 * Props: `defaultQuery="locked"`, `disabled=true`.
 */
export const Disabled: Story = {
  args: { defaultQuery: 'locked', disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('searchbox')).toBeDisabled();
    await expect(canvas.getByRole('button')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  },
};

/**
 * Comparison of all five search bar size scale tokens (`xs` through `xl`).
 */
export const Sizes: Story = {
  render: () => (
    <View style={{ gap: 12, maxWidth: 520, width: '100%' }}>
      <MagicSearchBar size="xs" label="XS Search" />
      <MagicSearchBar size="sm" label="SM Search" />
      <MagicSearchBar size="md" label="MD Search" />
      <MagicSearchBar size="lg" label="LG Search" />
      <MagicSearchBar size="xl" label="XL Search" />
    </View>
  ),
};
