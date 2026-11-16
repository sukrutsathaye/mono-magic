import type { Meta, StoryObj } from '@storybook/react';
import { MagicSearchBar } from './search-bar';

const meta: Meta<typeof MagicSearchBar> = {
  title: 'Molecules/SearchBar',
  component: MagicSearchBar,
  argTypes: {
    buttonVariant: {
      control: 'select',
      options: ['filled', 'tonal', 'outlined', 'elevated', 'text'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    onQueryChange: { action: 'queryChanged' },
    onSearch: { action: 'searched' },
  },
};

export default meta;
type Story = StoryObj<typeof MagicSearchBar>;

export const Default: Story = {
  args: {
    label: 'Search components',
    placeholder: 'Type an atom or molecule...',
    submitLabel: 'Search',
    buttonVariant: 'filled',
    size: 'md',
    disabled: false,
    loading: false,
  },
};
