import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import type { StepItem } from '@mono-magic/atomic-design-interfaces';
import { MagicButton } from '../../atoms/button/button';
import { MagicStepper } from './stepper';

const BASE_STEPS: readonly StepItem[] = [
  {
    id: 'workspace',
    label: 'Workspace Setup',
    description: 'Configure monorepo targets & tags',
    icon: 'folder_open',
  },
  {
    id: 'contracts',
    label: 'Design Contracts',
    description: 'Select shared Material 3 tokens',
    optional: true,
  },
  {
    id: 'verify',
    label: 'Verify & Publish',
    description: 'Run tests and deploy Storybook',
    icon: 'rocket_launch',
  },
];

/**
 * `MagicStepper` is the Material 3 multi-step workflow molecule composing MUI v9
 * `Stepper`, `Step`, `StepLabel`, `StepButton`, `StepContent`, and `MagicIcon`.
 *
 * - **References**:
 *   - [MUI Stepper](https://mui.com/material-ui/react-stepper/)
 */
const meta: Meta<typeof MagicStepper> = {
  title: 'Molecules/Stepper',
  component: MagicStepper,
  tags: ['autodocs', 'snapshot'],
  args: {
    steps: BASE_STEPS,
    defaultActiveStep: 0,
    orientation: 'horizontal',
    linear: true,
    alternativeLabel: false,
    color: 'primary',
    size: 'md',
    disabled: false,
    onStepChange: fn(),
  },
  argTypes: {
    steps: { control: 'object', table: { category: 'Content' } },
    activeStep: { control: 'number', table: { category: 'State' } },
    defaultActiveStep: { control: 'number', table: { category: 'State' } },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      table: { category: 'Layout' },
    },
    linear: { control: 'boolean', table: { category: 'Behavior' } },
    alternativeLabel: { control: 'boolean', table: { category: 'Layout' } },
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
    disabled: { control: 'boolean', table: { category: 'State' } },
    onStepChange: { action: 'stepChanged', table: { category: 'Events' } },
    renderStepContent: { control: false, table: { category: 'Slots' } },
    sx: { control: false, table: { category: 'Appearance' } },
    className: { control: 'text', table: { category: 'Appearance' } },
    ref: { control: false, table: { category: 'Accessibility' } },
  },
};

export default meta;
type Story = StoryObj<typeof MagicStepper>;

function InteractiveWorkflowDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<Record<number, boolean>>({});
  const [hasError, setHasError] = useState(false);

  const steps: StepItem[] = BASE_STEPS.map((step, index) => ({
    ...step,
    completed: Boolean(completed[index]),
    error: hasError && index === activeStep,
    errorMessage:
      hasError && index === activeStep
        ? 'Please resolve validation warnings before continuing.'
        : undefined,
  }));

  const handleNext = () => {
    setHasError(false);
    setCompleted((prev) => ({ ...prev, [activeStep]: true }));
    setActiveStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setHasError(false);
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setHasError(false);
    setCompleted({});
    setActiveStep(0);
  };

  const allDone = activeStep >= steps.length;

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 680 }}>
      <MagicStepper
        testId="interactive-stepper"
        steps={steps}
        activeStep={allDone ? steps.length - 1 : activeStep}
        linear
        onStepChange={(index) => {
          setHasError(false);
          setActiveStep(index);
        }}
      />
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" data-testid="stepper-status">
          {allDone
            ? 'All workflow steps completed!'
            : `Step ${activeStep + 1} of ${steps.length}: ${steps[activeStep]?.label}`}
        </Typography>
      </Box>
      <Stack direction="row" spacing={1.5}>
        <MagicButton
          testId="stepper-back"
          variant="outlined"
          label="Back"
          disabled={activeStep === 0}
          onClick={handleBack}
        />
        <MagicButton
          testId="stepper-error-btn"
          variant="tonal"
          color="error"
          label="Simulate Error"
          disabled={allDone}
          onClick={() => setHasError(true)}
        />
        {allDone ? (
          <MagicButton
            testId="stepper-reset"
            variant="filled"
            label="Reset"
            onClick={handleReset}
          />
        ) : (
          <MagicButton
            testId="stepper-next"
            variant="filled"
            label={activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            onClick={handleNext}
          />
        )}
      </Stack>
    </Stack>
  );
}

/**
 * Stateful interactive linear wizard with Next, Back, Skip, Trigger Error, and Reset controls.
 */
export const InteractiveWorkflow: Story = {
  render: () => <InteractiveWorkflowDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('stepper-status')).toHaveTextContent(
      'Step 1 of 3: Workspace Setup',
    );
    await userEvent.click(canvas.getByTestId('stepper-next'));
    await expect(canvas.getByTestId('stepper-status')).toHaveTextContent(
      'Step 2 of 3: Design Contracts',
    );
    await userEvent.click(canvas.getByTestId('stepper-error-btn'));
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Please resolve validation warnings before continuing.',
    );
    await userEvent.click(canvas.getByTestId('stepper-next'));
    await expect(canvas.getByTestId('stepper-status')).toHaveTextContent(
      'Step 3 of 3: Verify & Publish',
    );
    await userEvent.click(canvas.getByTestId('stepper-next'));
    await expect(canvas.getByTestId('stepper-status')).toHaveTextContent(
      'All workflow steps completed!',
    );
    await userEvent.click(canvas.getByTestId('stepper-reset'));
    await expect(canvas.getByTestId('stepper-status')).toHaveTextContent(
      'Step 1 of 3: Workspace Setup',
    );
  },
};

function VerticalNonLinearDemo() {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <Box sx={{ maxWidth: 520 }}>
      <MagicStepper
        testId="vertical-stepper"
        orientation="vertical"
        linear={false}
        color="secondary"
        steps={BASE_STEPS}
        activeStep={activeStep}
        onStepChange={(index) => setActiveStep(index)}
        renderStepContent={(step, index) => (
          <Stack spacing={1} sx={{ py: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {step.description}
            </Typography>
            {index < BASE_STEPS.length - 1 ? (
              <Box>
                <MagicButton
                  size="sm"
                  variant="tonal"
                  label="Continue"
                  onClick={() => setActiveStep(index + 1)}
                />
              </Box>
            ) : null}
          </Stack>
        )}
      />
    </Box>
  );
}

/**
 * Vertical non-linear stepper with expandable step content and free step jumping.
 */
export const VerticalNonLinear: Story = {
  render: () => <VerticalNonLinearDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const verifyBtn = canvas.getByTestId('vertical-stepper-button-verify');
    await userEvent.click(verifyBtn);
    await expect(
      canvas.getByTestId('vertical-stepper-step-verify'),
    ).toHaveAttribute('data-status', 'active');
  },
};

/**
 * Horizontal alternative-label layout with completed, error, and disabled step states.
 */
export const AlternativeLabelAndError: Story = {
  args: {
    alternativeLabel: true,
    linear: false,
    activeStep: 1,
    steps: [
      { id: 's1', label: 'Create Branch', completed: true },
      {
        id: 's2',
        label: 'Run Visual Tests',
        error: true,
        errorMessage: '1 baseline mismatch',
      },
      { id: 's3', label: 'Optional Review', optional: true },
      { id: 's4', label: 'Merge to Dev', disabled: true },
    ],
  },
};
