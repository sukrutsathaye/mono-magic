import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, userEvent, within } from 'storybook/test';
import MagicTextInput from './MagicTextInput.svelte';
import TextInputStoryDemo from './TextInputStoryDemo.svelte';

const meta: Meta<typeof MagicTextInput> = {
  title: 'Atoms/TextInput',
  component: MagicTextInput,
  tags: ['autodocs', 'snapshot'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['outlined', 'filled'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search', 'tel', 'url', 'number'],
    },
    required: { control: 'boolean' },
    readOnly: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Email address',
    placeholder: 'dev@mono-magic.dev',
    helperText: 'Use your workspace email.',
    variant: 'outlined',
    size: 'md',
    type: 'email',
    required: false,
    readOnly: false,
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FilledWithError: Story = {
  args: {
    label: 'Project code',
    variant: 'filled',
    value: 'ab',
    errorText: 'Must be at least 3 characters',
    required: true,
  },
};

export const InteractiveValidatedForm: Story = {
  render: () => ({
    Component: TextInputStoryDemo,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const emailInput = canvas.getByTestId('demo-email-input');
    await userEvent.type(emailInput, 'ada@magic.dev');
    await expect(canvas.getByTestId('input-demo-status')).toHaveTextContent(
      'Email: ada@magic.dev | Code: ab',
    );
    const codeInput = canvas.getByTestId('demo-code-input');
    await userEvent.type(codeInput, 'c');
    await expect(canvas.queryByTestId('demo-code-error')).toBeNull();
  },
};
