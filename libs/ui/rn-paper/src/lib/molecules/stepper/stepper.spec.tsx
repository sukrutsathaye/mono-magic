import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Text, type View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicStepper, type StepItem } from './stepper';

afterEach(cleanup);

const STEPS: readonly StepItem[] = [
  {
    id: 'account',
    label: 'Account Setup',
    description: 'Create credentials',
    completed: true,
  },
  {
    id: 'profile',
    label: 'Profile Details',
    description: 'Add team info',
    optional: true,
  },
  {
    id: 'billing',
    label: 'Billing',
    error: true,
    errorMessage: 'Card declined',
  },
  {
    id: 'confirm',
    label: 'Confirm',
    icon: 'verified',
    disabled: true,
  },
];

describe('MagicStepper', () => {
  it('renders horizontal steps, supports non-linear navigation, and forwards ref', () => {
    const ref = createRef<View>();
    const onStepChange = vi.fn();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicStepper
          ref={ref}
          id="onboarding-stepper"
          testId="rn-stepper"
          ariaLabel="Onboarding"
          steps={STEPS}
          defaultActiveStep={1}
          onStepChange={onStepChange}
          renderStepContent={(step) => <Text>Body: {step.label}</Text>}
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    expect(screen.getByTestId('rn-stepper').getAttribute('id')).toBe(
      'onboarding-stepper'
    );
    expect(screen.getByText('Optional')).toBeTruthy();
    expect(screen.getByText('Card declined')).toBeTruthy();
    expect(screen.getByText('Body: Profile Details')).toBeTruthy();

    fireEvent.click(screen.getByTestId('rn-stepper-step-billing'));
    expect(onStepChange).toHaveBeenCalledWith(2, STEPS[2]);
    expect(screen.getByText('Body: Billing')).toBeTruthy();

    // Disabled individual step does not fire onStepChange
    fireEvent.click(screen.getByTestId('rn-stepper-step-confirm'));
    expect(onStepChange).toHaveBeenCalledTimes(1);
  });

  it('enforces linear mode and allows jumping to completed/optional preceding steps', () => {
    const onStepChange = vi.fn();
    const linearSteps: readonly StepItem[] = [
      { id: 's1', label: 'Step 1', completed: true },
      { id: 's2', label: 'Step 2', optional: true, optionalLabel: 'Skippable' },
      { id: 's3', label: 'Step 3' },
      { id: 's4', label: 'Step 4' },
    ];

    render(
      <MagicPaperProvider>
        <MagicStepper
          testId="linear-stepper"
          steps={linearSteps}
          linear
          alternativeLabel
          defaultActiveStep={0}
          onStepChange={onStepChange}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByText('Skippable')).toBeTruthy();

    // Step 4 cannot be reached directly because Step 3 is neither completed nor optional
    fireEvent.click(screen.getByTestId('linear-stepper-step-s4'));
    expect(onStepChange).not.toHaveBeenCalled();

    // Step 3 can be reached because Step 1 is completed and Step 2 is optional
    fireEvent.click(screen.getByTestId('linear-stepper-step-s3'));
    expect(onStepChange).toHaveBeenCalledWith(2, linearSteps[2]);
  });

  it('supports vertical orientation, controlled activeStep, disabled stepper, and sizes', () => {
    const onStepChange = vi.fn();

    const { rerender } = render(
      <MagicPaperProvider palette="dark-theme">
        <MagicStepper
          testId="vert-stepper"
          steps={STEPS}
          orientation="vertical"
          activeStep={0}
          size="lg"
          color="secondary"
          onStepChange={onStepChange}
          renderStepContent={(step) => <Text>Vertical: {step.id}</Text>}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByText('Vertical: account')).toBeTruthy();
    fireEvent.click(screen.getByTestId('vert-stepper-step-profile'));
    expect(onStepChange).toHaveBeenCalledWith(1, STEPS[1]);
    // Still controlled at 0
    expect(screen.getByText('Vertical: account')).toBeTruthy();

    rerender(
      <MagicPaperProvider palette="dark-theme">
        <MagicStepper
          testId="vert-stepper"
          steps={STEPS}
          orientation="vertical"
          activeStep={1}
          disabled
          size="xs"
          onStepChange={onStepChange}
        />
      </MagicPaperProvider>
    );

    fireEvent.click(screen.getByTestId('vert-stepper-step-account'));
    expect(onStepChange).toHaveBeenCalledTimes(1);
  });

  it('handles empty steps array gracefully', () => {
    render(
      <MagicPaperProvider>
        <MagicStepper testId="empty-stepper" steps={[]} size="xl" />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('empty-stepper')).toBeTruthy();
  });
});
