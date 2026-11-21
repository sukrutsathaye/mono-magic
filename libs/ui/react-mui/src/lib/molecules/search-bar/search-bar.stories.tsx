import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicSearchBar } from './search-bar';

/**
 * `MagicSearchBar` composes `MagicFormField`, `MagicTextInput`, `MagicIcon`,
 * and `MagicButton` into a semantic `role="search"` form landmark.
 *
 * - **References**:
 *   - [Material 3 Search](https://m3.material.io/components/search/overview)
 *   - [MUI FormControl](https://mui.com/material-ui/api/form-control/)
 */
const meta: Meta<typeof MagicSearchBar> = {
  title: 'Molecules/SearchBar',
  component: MagicSearchBar,
  args: {
    label: 'Search components',
    placeholder: 'Type an atom or molecule...',
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
    query: { control: 'text', table: { category: 'Content' } },
    defaultQuery: { control: 'text', table: { category: 'Content' } },
    label: { control: 'text', table: { category: 'Content' } },
    placeholder: { control: 'text', table: { category: 'Content' } },
    submitLabel: { control: 'text', table: { category: 'Content' } },
    buttonVariant: {
      control: 'select',
      options: ['filled', 'tonal', 'outlined', 'elevated', 'text'],
      table: { category: 'Appearance' },
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
      table: { category: 'Appearance' },
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
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicSearchBar>;

/**
 * Default search bar verifying typing and button click submission.
 */
export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <MagicSearchBar {...args} />
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('searchbox');
    await userEvent.type(input, 'Material 3');
    await userEvent.click(canvas.getByRole('button', { name: 'Search' }));
    await expect(args.onSearch).toHaveBeenCalledWith('Material 3');
  },
};

/**
 * Uncontrolled search bar initialized with `defaultQuery` and custom button label.
 */
export const WithInitialQuery: Story = {
  args: {
    defaultQuery: 'Design tokens',
    submitLabel: 'Find',
  },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <MagicSearchBar {...args} />
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('searchbox');
    await expect(input).toHaveValue('Design tokens');
    await userEvent.click(canvas.getByRole('button', { name: 'Find' }));
    await expect(args.onSearch).toHaveBeenCalledWith('Design tokens');
  },
};

/**
 * In-flight search state disabling the submit action while showing progress.
 */
export const Loading: Story = {
  args: {
    defaultQuery: 'components',
    loading: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <MagicSearchBar {...args} />
    </div>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button')).toBeDisabled();
    await expect(args.onSearch).not.toHaveBeenCalled();
  },
};

/**
 * Disabled search bar preventing input editing and submission.
 */
export const Disabled: Story = {
  args: {
    defaultQuery: 'locked query',
    disabled: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <MagicSearchBar {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('searchbox')).toBeDisabled();
    await expect(canvas.getByRole('button')).toBeDisabled();
  },
};

/**
 * Comparison of all five atomic size tokens (`xs`..`xl`).
 */
export const Sizes: Story = {
  render: () => (
    <Stack spacing={2} sx={{ maxWidth: 560 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <MagicSearchBar
          key={size}
          size={size}
          label={`${size.toUpperCase()} Search`}
          placeholder={`Search (${size})...`}
        />
      ))}
    </Stack>
  ),
};

/**
 * Showcase of submit button variants and semantic color intents.
 */
export const ButtonVariants: Story = {
  render: () => (
    <Stack spacing={2} sx={{ maxWidth: 560 }}>
      <MagicSearchBar
        label="Filled Primary"
        buttonVariant="filled"
        buttonColor="primary"
      />
      <MagicSearchBar
        label="Tonal Secondary"
        buttonVariant="tonal"
        buttonColor="secondary"
      />
      <MagicSearchBar
        label="Outlined Tertiary"
        buttonVariant="outlined"
        buttonColor="tertiary"
      />
      <MagicSearchBar
        label="Elevated Success"
        buttonVariant="elevated"
        buttonColor="success"
      />
    </Stack>
  ),
};
