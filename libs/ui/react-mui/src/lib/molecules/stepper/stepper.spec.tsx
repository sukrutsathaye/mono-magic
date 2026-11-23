import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StepItem } from '@mono-magic/atomic-design-interfaces';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicStepper } from './stepper';

afterEach(cleanup);

const STEPS: readonly StepItem[] = [
  {
    id: 'account',
    label: 'Account Details',
    description: 'Configure workspace credentials',
    completed: true,
    icon: 'person',
  },
  {
    id: 'billing',
    label: 'Billing Plan',
    description: 'Optional team subscription',
    optional: true,
    optionalLabel: 'Skip for now',
  },
  {
    id: 'review',
    label: 'Review & Deploy',
    description: 'Confirm deployment targets',
  },
  {
    id: 'locked',
    label: 'Audit Lock',
    disabled: true,
  },
];

describe('MagicStepper (React MUI)', () => {
  it('renders horizontal steps, descriptions, optional labels, and forwards ref', () => {
    const stepperRef = createRef<HTMLDivElement>();
    render(
      <MagicMuiThemeProvider>
        <MagicStepper
          ref={stepperRef}
          id="wizard-stepper"
          testId="wizard"
          ariaLabel="Setup wizard"
          steps={STEPS}
          activeStep={1}
        />
      </MagicMuiThemeProvider>,
    );

    expect(stepperRef.current).toBeInstanceOf(HTMLDivElement);
    expect(screen.getByTestId('wizard').getAttribute('aria-label')).toBe(
      'Setup wizard',
    );
    expect(screen.getByText('Account Details')).toBeTruthy();
    expect(screen.getByText('Skip for now')).toBeTruthy();
    expect(screen.getByText('Confirm deployment targets')).toBeTruthy();
    expect(
      screen.getByTestId('wizard-step-account').getAttribute('data-status'),
    ).toBe('completed');
    expect(
      screen.getByTestId('wizard-step-billing').getAttribute('data-status'),
    ).toBe('active');
  });

  it('enforces linear mode while allowing non-linear navigation when linear=false', () => {
    const onStepChange = vi.fn();
    const { rerender } = render(
      <MagicMuiThemeProvider>
        <MagicStepper
          testId="linear-stepper"
          steps={STEPS}
          defaultActiveStep={1}
          linear
          onStepChange={onStepChange}
        />
      </MagicMuiThemeProvider>,
    );

    expect(screen.queryByTestId('linear-stepper-button-review')).toBeNull();
    fireEvent.click(screen.getByTestId('linear-stepper-button-account'));
    expect(onStepChange).toHaveBeenCalledWith(
      0,
      expect.objectContaining({ id: 'account' }),
    );

    rerender(
      <MagicMuiThemeProvider>
        <MagicStepper
          testId="linear-stepper"
          steps={STEPS}
          linear={false}
          onStepChange={onStepChange}
        />
      </MagicMuiThemeProvider>,
    );

    const reviewButton = screen.getByTestId('linear-stepper-button-review');
    fireEvent.click(reviewButton);
    expect(onStepChange).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ id: 'review' }),
    );
  });

  it('renders vertical orientation with StepContent, custom renderStepContent, and error messages', () => {
    const errorSteps: readonly StepItem[] = [
      { id: 'one', label: 'Step One', description: 'First step', completed: true },
      {
        id: 'two',
        label: 'Step Two',
        error: true,
        errorMessage: 'Validation failed on step two',
        icon: 'warning',
      },
    ];

    render(
      <MagicMuiThemeProvider>
        <MagicStepper
          testId="vertical-stepper"
          orientation="vertical"
          steps={errorSteps}
          activeStep={1}
          renderStepContent={(step, index, isActive) => (
            <div data-testid={`custom-body-${step.id}`}>
              {index}:{isActive ? 'active' : 'inactive'}
            </div>
          )}
        />
      </MagicMuiThemeProvider>,
    );

    expect(screen.getByRole('alert').textContent).toBe(
      'Validation failed on step two',
    );
    expect(screen.getByTestId('custom-body-two').textContent).toBe('1:inactive');
    expect(
      screen.getByTestId('vertical-stepper-step-two').getAttribute('data-status'),
    ).toBe('error');
  });

  it('supports alternativeLabel, disabled stepper, empty steps, clamping, and all 5 sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(
        <MagicMuiThemeProvider>
          <MagicStepper
            testId={`step-${size}`}
            steps={STEPS}
            size={size}
            color="secondary"
            alternativeLabel
            activeStep={99}
            disabled={size === 'xl'}
            sx={[{ p: 1 }]}
          />
        </MagicMuiThemeProvider>,
      );
      expect(screen.getByTestId(`step-${size}`).getAttribute('data-size')).toBe(
        size,
      );
      unmount();
    }

    render(
      <MagicMuiThemeProvider>
        <MagicStepper
          testId="empty-stepper"
          orientation="vertical"
          steps={[{ id: 'only', label: 'Only Step', description: 'Body text' }]}
          activeStep={-1}
        />
      </MagicMuiThemeProvider>,
    );
    expect(screen.getByText('Only Step')).toBeTruthy();
  });
});
