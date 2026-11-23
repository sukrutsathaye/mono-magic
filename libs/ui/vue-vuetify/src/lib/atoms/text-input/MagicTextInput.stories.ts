import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import MagicTextInput from './MagicTextInput.vue';

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
    clearable: { control: 'boolean' },
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
    clearable: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const VariantsAndSizes: Story = {
  render: () => ({
    components: { MagicTextInput },
    template: `
      <div class="d-flex flex-column ga-4" style="max-width: 420px;">
        <MagicTextInput label="Outlined (md)" variant="outlined" placeholder="Outlined input" />
        <MagicTextInput label="Filled (md)" variant="filled" placeholder="Filled input" />
        <MagicTextInput label="Compact (xs)" size="xs" placeholder="XS density" />
        <MagicTextInput label="Large (lg)" size="lg" placeholder="LG density" />
      </div>
    `,
  }),
};

export const StatesAndValidation: Story = {
  render: () => ({
    components: { MagicTextInput },
    template: `
      <div class="d-flex flex-column ga-4" style="max-width: 420px;">
        <MagicTextInput
          label="Required field"
          required
          helper-text="Cannot be left blank"
        />
        <MagicTextInput
          label="Project code"
          value="ab"
          error-text="Must be at least 3 characters"
          :min-length="3"
          :max-length="12"
        />
        <MagicTextInput
          label="Read-only token"
          value="magic_live_98a7bc"
          read-only
        />
        <MagicTextInput
          label="Disabled field"
          value="Locked value"
          disabled
        />
      </div>
    `,
  }),
};

export const InteractiveValidatedForm: Story = {
  render: () => ({
    components: { MagicTextInput },
    setup() {
      const email = ref('');
      const password = ref('');
      const search = ref('Atomic');
      const submitted = ref<string | null>(null);

      const emailError = () => {
        if (!email.value) return undefined;
        return email.value.includes('@')
          ? undefined
          : 'Enter a valid email address containing @';
      };

      const passwordError = () => {
        if (!password.value) return undefined;
        return password.value.length >= 6
          ? undefined
          : 'Password must be at least 6 characters';
      };

      const handleSubmit = () => {
        submitted.value = `Submitted ${email.value} (search="${search.value}")`;
      };

      return {
        email,
        password,
        search,
        submitted,
        emailError,
        passwordError,
        handleSubmit,
      };
    },
    template: `
      <div class="d-flex flex-column ga-4" style="max-width: 420px;">
        <MagicTextInput
          v-model="email"
          label="Work Email"
          type="email"
          required
          clearable
          prepend-inner-icon="mdi-email-outline"
          placeholder="ada@mono-magic.dev"
          helper-text="Press Enter to submit"
          :error-text="emailError()"
          @submit="handleSubmit"
        />
        <MagicTextInput
          v-model="password"
          label="Password"
          type="password"
          variant="filled"
          required
          prepend-inner-icon="mdi-lock-outline"
          :error-text="passwordError()"
        />
        <MagicTextInput
          v-model="search"
          label="Quick filter"
          type="search"
          clearable
          prepend-inner-icon="mdi-magnify"
          :max-length="24"
        />
        <div class="text-caption">
          Live state — Email: "{{ email || '(empty)' }}" | Filter: "{{ search || '(empty)' }}"
        </div>
        <div v-if="submitted" class="text-caption text-success font-weight-medium">
          {{ submitted }}
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const emailInput = canvas.getByPlaceholderText('ada@mono-magic.dev');
    await userEvent.type(emailInput, 'ada@mono-magic.dev');
    await expect(canvas.getByText(/Email: "ada@mono-magic\.dev"/)).toBeInTheDocument();
  },
};
