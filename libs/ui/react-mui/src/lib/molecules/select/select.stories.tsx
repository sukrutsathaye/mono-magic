import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, within } from 'storybook/test';
import type {
  SelectOption,
  SelectOptionGroup,
} from '@mono-magic/atomic-design-interfaces';
import { MagicSelect } from './select';

const FRAMEWORK_OPTIONS: readonly SelectOption<string>[] = [
  { value: 'angular', label: 'Angular Material' },
  { value: 'react', label: 'React MUI' },
  { value: 'vue', label: 'Vue Vuetify' },
  { value: 'flutter', label: 'Flutter Material 3' },
  { value: 'legacy', label: 'Legacy Adapter (Deprecated)', disabled: true },
];

const GROUPED_OPTIONS: readonly SelectOptionGroup<string>[] = [
  {
    label: 'Web Libraries',
    options: [
      { value: 'ng-mat', label: 'Angular (@mono-magic/ng-mat)' },
      { value: 'react-mui', label: 'React (@mono-magic/react-mui)' },
      { value: 'vue-vuetify', label: 'Vue (@mono-magic/vue-vuetify)' },
    ],
  },
  {
    label: 'Mobile & Desktop',
    options: [{ value: 'flutter', label: 'Flutter (flutter_material)' }],
  },
  {
    label: 'Experimental',
    disabled: true,
    options: [{ value: 'solid', label: 'SolidJS Adapter' }],
  },
];

/**
 * `MagicSelect` is the Material 3 dropdown select molecule composing `MagicFormField`
 * and MUI v9 `Select`.
 *
 * Supports flat `options`, grouped `optionGroups`, single and `multiple` selection
 * with checkboxes, optional `"First (+N other/others)"` `customTriggerSummary`,
 * and full `MagicFormField` appearance/size/validation ergonomics.
 *
 * - **References**:
 *   - [Material 3 Menus & Selects](https://m3.material.io/components/menus/overview)
 *   - [MUI Select](https://mui.com/material-ui/react-select/)
 */
const meta: Meta<typeof MagicSelect<string>> = {
  title: 'Molecules/Select',
  component: MagicSelect,
  tags: ['autodocs', 'snapshot'],
  args: {
    label: 'Target UI Library',
    hint: 'Choose a Material 3 implementation.',
    placeholder: 'Select a library',
    options: FRAMEWORK_OPTIONS,
    appearance: 'outlined',
    size: 'md',
    floatLabel: 'auto',
    subscriptSizing: 'fixed',
    hideRequiredMarker: false,
    multiple: false,
    required: false,
    disabled: false,
    disableRipple: false,
    customTriggerSummary: false,
    onChange: fn(),
    onOpenChange: fn(),
  },
  argTypes: {
    label: { control: 'text', table: { category: 'Content' } },
    hint: { control: 'text', table: { category: 'Content' } },
    errorText: { control: 'text', table: { category: 'Validation' } },
    placeholder: { control: 'text', table: { category: 'Content' } },
    options: { control: 'object', table: { category: 'Content' } },
    optionGroups: { control: 'object', table: { category: 'Content' } },
    value: { control: 'text', table: { category: 'Value' } },
    defaultValue: { control: 'text', table: { category: 'Value' } },
    appearance: {
      control: 'select',
      options: ['outlined', 'filled'],
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: { category: 'Appearance' },
    },
    floatLabel: {
      control: 'select',
      options: ['auto', 'always'],
      table: { category: 'Behavior' },
    },
    subscriptSizing: {
      control: 'select',
      options: ['fixed', 'dynamic'],
      table: { category: 'Layout' },
    },
    hideRequiredMarker: {
      control: 'boolean',
      table: { category: 'Appearance' },
    },
    multiple: { control: 'boolean', table: { category: 'Behavior' } },
    customTriggerSummary: {
      control: 'boolean',
      table: { category: 'Behavior' },
    },
    required: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    disableRipple: { control: 'boolean', table: { category: 'Appearance' } },
    panelClass: { control: 'text', table: { category: 'Appearance' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    onChange: { action: 'changed', table: { category: 'Events' } },
    onOpenChange: { action: 'openChanged', table: { category: 'Events' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <MagicSelect {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof MagicSelect<string>>;

/**
 * Default single-selection outlined select verifying dropdown opening and option click.
 */
export const Default: Story = {
  args: {
    testId: 'default-select',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);
    await expect(args.onOpenChange).toHaveBeenCalledWith(true);

    const reactOption = await screen.findByRole('option', {
      name: 'React MUI',
    });
    await userEvent.click(reactOption);
    await expect(args.onChange).toHaveBeenCalledWith('react');
  },
};

/**
 * Filled Material 3 appearance with preselected value.
 */
export const Filled: Story = {
  args: {
    appearance: 'filled',
    defaultValue: 'react',
  },
};

/**
 * Grouped options rendered with `ListSubheader` sections.
 */
export const WithOptionGroups: Story = {
  args: {
    label: 'Platform Package',
    options: [],
    optionGroups: GROUPED_OPTIONS,
    defaultValue: 'react-mui',
  },
};

/**
 * Multi-select mode with checkboxes and `"First (+N other/others)"` trigger summary.
 */
export const MultipleWithCustomSummary: Story = {
  args: {
    label: 'Enabled Targets',
    multiple: true,
    customTriggerSummary: true,
    defaultValue: ['angular', 'react', 'vue'],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Angular Material (+2 others)'),
    ).toBeInTheDocument();
  },
};

/**
 * Error validation state where `errorText` takes precedence over `hint`.
 */
export const WithError: Story = {
  args: {
    label: 'Required Library',
    required: true,
    errorText: 'Please select a target UI library.',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('alert');
    await expect(alert).toHaveTextContent(
      'Please select a target UI library.',
    );
  },
};

/**
 * Comparison of all five atomic size tokens (`xs`..`xl`).
 */
export const Sizes: Story = {
  render: () => (
    <Stack spacing={1.5} sx={{ maxWidth: 360 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <MagicSelect
          key={size}
          size={size}
          label={`${size.toUpperCase()} Select`}
          options={FRAMEWORK_OPTIONS}
          defaultValue="react"
          subscriptSizing="dynamic"
        />
      ))}
    </Stack>
  ),
};

/**
 * Disabled select control preventing user interaction.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'angular',
  },
};
