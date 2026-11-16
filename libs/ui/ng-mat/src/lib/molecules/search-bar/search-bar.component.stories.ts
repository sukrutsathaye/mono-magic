import type { Meta, StoryObj } from '@storybook/angular';
import { MagicSearchBarComponent } from './search-bar.component';

const meta: Meta<MagicSearchBarComponent> = {
  title: 'Molecules/SearchBar',
  component: MagicSearchBarComponent,
  argTypes: {
    buttonVariant: {
      control: 'select',
      options: ['filled', 'tonal', 'outlined', 'elevated', 'text'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    queryChange: { action: 'queryChange' },
    searched: { action: 'searched' },
  },
};

export default meta;
type Story = StoryObj<MagicSearchBarComponent>;

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
