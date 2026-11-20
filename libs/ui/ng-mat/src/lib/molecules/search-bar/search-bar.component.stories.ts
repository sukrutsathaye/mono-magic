import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicSearchBarComponent } from './search-bar.component';

/**
 * `MagicSearchBarComponent` composes `magic-form-field`, `magic-text-input`
 * and `magic-button` into a semantic `role="search"` landmark form.
 *
 * - **References**:
 *   - [Material 3 Search](https://m3.material.io/components/search/overview)
 *   - [Angular Material Form Field](https://material.angular.dev/components/form-field/overview)
 *   - [Angular Material Input](https://material.angular.dev/components/input/overview)
 *   - [Angular Material Button](https://material.angular.dev/components/button/overview)
 */
const meta: Meta<MagicSearchBarComponent> = {
  title: 'Molecules/SearchBar',
  component: MagicSearchBarComponent,
  args: {
    query: '',
    label: 'Search',
    placeholder: 'Search...',
    submitLabel: 'Search',
    buttonVariant: 'filled',
    buttonColor: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    searched: fn(),
  },
  argTypes: {
    query: { control: 'text', table: { category: 'Value' } },
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
    searched: { action: 'searched', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<MagicSearchBarComponent>;

/**
 * Default search bar with typing and submit-button interaction verification.
 *
 * Inputs: `query=""`, `label="Search"`, `placeholder="Search..."`, `submitLabel="Search"`, `buttonVariant="filled"`, `buttonColor="primary"`, `size="md"`.
 */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const inputEl = canvas.getByRole('searchbox');
    await userEvent.type(inputEl, 'Material');
    await userEvent.click(canvas.getByRole('button', { name: 'Search' }));
    await expect(args.searched).toHaveBeenCalledWith('Material');
  },
};

/**
 * Search bar initialized with an existing query string and custom submit button label.
 *
 * Inputs: `query="Design tokens"`, `submitLabel="Find"`.
 */
export const Prefilled: Story = {
  args: { query: 'Design tokens', submitLabel: 'Find' },
};

/**
 * Search bar styled with a secondary tonal submit button.
 *
 * Inputs: `buttonVariant="tonal"`, `buttonColor="secondary"`.
 */
export const TonalButton: Story = {
  args: { buttonVariant: 'tonal', buttonColor: 'secondary' },
};

/**
 * In-flight search state that disables the submit button while loading.
 *
 * Inputs: `query="components"`, `loading=true`.
 */
export const Loading: Story = {
  args: { query: 'components', loading: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button')).toBeDisabled();
    await expect(args.searched).not.toHaveBeenCalled();
  },
};

/**
 * Disabled state locking both the search input and submit button.
 *
 * Inputs: `query="locked"`, `disabled=true`.
 */
export const Disabled: Story = {
  args: { query: 'locked', disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('searchbox')).toBeDisabled();
    await expect(canvas.getByRole('button')).toBeDisabled();
  },
};

/**
 * Comparison of all five search bar size scale tokens.
 *
 * Inputs: `size="xs" | "sm" | "md" | "lg" | "xl"`.
 */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 12px; max-width: 520px;">
        <magic-search-bar size="xs" label="XS Search" />
        <magic-search-bar size="sm" label="SM Search" />
        <magic-search-bar size="md" label="MD Search" />
        <magic-search-bar size="lg" label="LG Search" />
        <magic-search-bar size="xl" label="XL Search" />
      </div>
    `,
  }),
};
