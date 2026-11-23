import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text, View } from 'react-native';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicButton } from '../../atoms/button/button';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicStepper, type StepItem } from './stepper';

const BASE_STEPS: readonly StepItem[] = [
  {
    id: 'account',
    label: 'Account',
    description: 'Create credentials',
    icon: 'person',
  },
  {
    id: 'profile',
    label: 'Profile',
    description: 'Workspace preferences',
    optional: true,
  },
  {
    id: 'review',
    label: 'Review & Deploy',
    description: 'Confirm configuration',
    icon: 'rocket_launch',
  },
];

/**
 * `MagicStepper` is the Material 3 multi-step workflow molecule for `@mono-magic/rn-paper`.
 *
 * It supports `horizontal` and `vertical` orientations, `linear` progression guards,
 * `alternativeLabel` placement, optional steps, error banners, and custom step panels.
 */
const meta: Meta<typeof MagicStepper> = {
  title: 'Molecules/Stepper',
  component: MagicStepper,
  tags: ['autodocs', 'snapshot'],
  args: {
    steps: BASE_STEPS,
    defaultActiveStep: 0,
    orientation: 'horizontal',
    linear: false,
    alternativeLabel: false,
    color: 'primary',
    size: 'md',
    disabled: false,
    onStepChange: fn(),
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      table: { category: 'Layout' },
    },
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
    linear: { control: 'boolean', table: { category: 'Behavior' } },
    alternativeLabel: { control: 'boolean', table: { category: 'Layout' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    onStepChange: { action: 'stepChanged', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicStepper>;

function InteractiveWizardDemo(args: React.ComponentProps<typeof MagicStepper>) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedIds, setCompletedIds] = useState<readonly string[]>([]);
  const [hasError, setHasError] = useState(false);

  const steps: StepItem[] = BASE_STEPS.map((step, idx) => ({
    ...step,
    completed: completedIds.includes(step.id),
    error: hasError && idx === activeStep,
    errorMessage:
      hasError && idx === activeStep
        ? 'Validation failed — fix before continuing'
        : undefined,
  }));

  const handleNext = () => {
    setHasError(false);
    const current = steps[activeStep];
    if (current && !completedIds.includes(current.id)) {
      setCompletedIds((prev) => [...prev, current.id]);
    }
    if (activeStep < steps.length - 1) {
      const next = activeStep + 1;
      setActiveStep(next);
      args.onStepChange?.(next, steps[next]);
    }
  };

  const handleBack = () => {
    setHasError(false);
    if (activeStep > 0) {
      const prev = activeStep - 1;
      setActiveStep(prev);
      args.onStepChange?.(prev, steps[prev]);
    }
  };

  const handleReset = () => {
    setHasError(false);
    setCompletedIds([]);
    setActiveStep(0);
  };

  return (
    <View style={{ maxWidth: 640, width: '100%', gap: 16 }}>
      <MagicStepper
        testId="wizard-stepper"
        steps={steps}
        activeStep={activeStep}
        linear
        onStepChange={(idx, step) => {
          setHasError(false);
          setActiveStep(idx);
          args.onStepChange?.(idx, step);
        }}
        renderStepContent={(step, idx) => (
          <View
            style={{
              padding: 12,
              borderRadius: 8,
              backgroundColor: '#f3f4f8',
              gap: 4,
            }}
          >
            <Text style={{ fontWeight: '600' }}>
              {`Step ${idx + 1}: ${step.label}`}
            </Text>
            <Text>{step.description}</Text>
          </View>
        )}
      />
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <MagicButton
          testId="wizard-back"
          label="Back"
          variant="outlined"
          disabled={activeStep === 0}
          onPress={handleBack}
        />
        <MagicButton
          testId="wizard-next"
          label={activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          variant="filled"
          onPress={handleNext}
        />
        <MagicButton
          testId="wizard-error"
          label="Toggle Error"
          variant="tonal"
          color="error"
          onPress={() => setHasError((prev) => !prev)}
        />
        <MagicButton
          testId="wizard-reset"
          label="Reset"
          variant="text"
          onPress={handleReset}
        />
      </View>
    </View>
  );
}

/**
 * Stateful interactive linear wizard with Next, Back, Simulate Error, and Reset controls.
 */
export const InteractiveWizardFlow: Story = {
  render: (args) => <InteractiveWizardDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Step 1: Account')).toBeInTheDocument();

    await userEvent.click(canvas.getByTestId('wizard-next'));
    await expect(canvas.getByText('Step 2: Profile')).toBeInTheDocument();

    await userEvent.click(canvas.getByTestId('wizard-error'));
    await expect(
      canvas.getByText('Validation failed — fix before continuing')
    ).toBeInTheDocument();

    await userEvent.click(canvas.getByTestId('wizard-reset'));
    await expect(canvas.getByText('Step 1: Account')).toBeInTheDocument();
  },
};

/**
 * Vertical non-linear stepper showing completed, active, error, and disabled steps.
 */
export const VerticalWithStates: Story = {
  args: {
    orientation: 'vertical',
    alternativeLabel: false,
    activeStep: 1,
    steps: [
      { id: '1', label: 'Repository Connected', completed: true },
      { id: '2', label: 'Configure Build', description: 'Run pnpm nx build' },
      {
        id: '3',
        label: 'Security Scan',
        error: true,
        errorMessage: '2 dependency warnings',
      },
      { id: '4', label: 'Production Release', disabled: true },
    ],
  },
};

/**
 * Horizontal stepper with alternative centered labels beneath step indicators.
 */
export const AlternativeLabels: Story = {
  args: {
    alternativeLabel: true,
    defaultActiveStep: 1,
    color: 'tertiary',
    steps: [
      { id: 'cart', label: 'Cart', completed: true },
      { id: 'shipping', label: 'Shipping', optional: true },
      { id: 'payment', label: 'Payment' },
    ],
  },
};

/**
 * Stepper rendered inside a dark Material 3 palette.
 */
export const DarkTheme: Story = {
  render: () => (
    <MagicPaperProvider palette="dark-theme">
      <View style={{ backgroundColor: '#121410', padding: 16, borderRadius: 12 }}>
        <MagicStepper
          steps={[
            { id: 'a', label: 'Initialize', completed: true },
            { id: 'b', label: 'Verify', description: 'Running checks' },
            { id: 'c', label: 'Publish' },
          ]}
          defaultActiveStep={1}
          orientation="horizontal"
        />
      </View>
    </MagicPaperProvider>
  ),
};
