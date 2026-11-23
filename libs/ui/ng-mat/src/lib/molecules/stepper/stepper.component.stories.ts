import { signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicButtonComponent } from '../../atoms/button/button.component';
import { MagicStepperComponent, type StepItem } from './stepper.component';

const DEFAULT_STEPS: readonly StepItem[] = [
  {
    id: 'details',
    label: 'Project Details',
    description: 'Name your workspace and pick a template.',
    icon: 'edit',
  },
  {
    id: 'team',
    label: 'Invite Team',
    description: 'Add collaborators or skip for now.',
    optional: true,
    optionalLabel: 'Optional',
  },
  {
    id: 'review',
    label: 'Review & Launch',
    description: 'Verify settings before provisioning.',
    icon: 'rocket_launch',
  },
];

/**
 * `MagicStepperComponent` wraps Angular Material `MatStepper` and `MatStep`,
 * supporting `horizontal` and `vertical` orientations, `linear` and non-linear
 * workflows, `alternativeLabel` layouts, optional steps, custom icons,
 * per-step error messages, and `[magicStepContent]` templates.
 *
 * - **References**:
 *   - [Angular Material Stepper](https://material.angular.dev/components/stepper/overview)
 */
const meta: Meta<MagicStepperComponent> = {
  title: 'Molecules/Stepper',
  component: MagicStepperComponent,
  decorators: [
    moduleMetadata({
      imports: [MagicButtonComponent],
    }),
  ],
  args: {
    steps: DEFAULT_STEPS,
    defaultActiveStep: 0,
    orientation: 'horizontal',
    linear: false,
    alternativeLabel: false,
    color: 'primary',
    size: 'md',
    disabled: false,
    activeStepChange: fn(),
    stepSelected: fn(),
  },
  argTypes: {
    steps: { control: 'object', table: { category: 'Data' } },
    activeStep: { control: 'number', table: { category: 'State' } },
    defaultActiveStep: { control: 'number', table: { category: 'State' } },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      table: { category: 'Layout' },
    },
    linear: { control: 'boolean', table: { category: 'Behavior' } },
    alternativeLabel: { control: 'boolean', table: { category: 'Layout' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
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
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    activeStepChange: {
      action: 'activeStepChange',
      table: { category: 'Events' },
    },
    stepSelected: { action: 'stepSelected', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<MagicStepperComponent>;

/**
 * Stateful interactive checkout/onboarding flow with Next, Back, Reset, and Error toggle buttons.
 */
export const InteractiveFlow: Story = {
  render: (args) => {
    const active = signal(0);
    const hasError = signal(false);
    const stepsSignal = signal<readonly StepItem[]>(DEFAULT_STEPS);

    const syncSteps = (currentIdx: number, errorFlag: boolean): void => {
      stepsSignal.set([
        {
          id: 'details',
          label: 'Project Details',
          description: 'Name your workspace and pick a template.',
          completed: currentIdx > 0,
        },
        {
          id: 'team',
          label: 'Invite Team',
          description: 'Configure team billing & member permissions.',
          optional: true,
          optionalLabel: 'Optional',
          completed: currentIdx > 1 && !errorFlag,
          error: errorFlag,
          errorMessage: errorFlag ? 'Invalid billing email address' : undefined,
        },
        {
          id: 'review',
          label: 'Review & Launch',
          description: 'Everything is ready to deploy.',
          completed: currentIdx > 2,
        },
      ]);
    };

    return {
      props: {
        ...args,
        active,
        hasError,
        stepsSignal,
        onStepChange(next: number) {
          active.set(next);
          syncSteps(next, hasError());
          args.activeStepChange?.(next);
        },
        nextStep() {
          const next = Math.min(2, active() + 1);
          active.set(next);
          syncSteps(next, hasError());
          args.activeStepChange?.(next);
        },
        prevStep() {
          const next = Math.max(0, active() - 1);
          active.set(next);
          syncSteps(next, hasError());
          args.activeStepChange?.(next);
        },
        toggleError() {
          const nextErr = !hasError();
          hasError.set(nextErr);
          if (nextErr) {
            active.set(1);
          }
          syncSteps(active(), nextErr);
        },
        resetFlow() {
          hasError.set(false);
          active.set(0);
          syncSteps(0, false);
          args.activeStepChange?.(0);
        },
      },
      template: `
        <div style="display: grid; gap: 16px;">
          <magic-stepper
            [steps]="stepsSignal()"
            [activeStep]="active()"
            [orientation]="orientation"
            [linear]="linear"
            [alternativeLabel]="alternativeLabel"
            [color]="color"
            [size]="size"
            [disabled]="disabled"
            testId="flow-stepper"
            (activeStepChange)="onStepChange($event)"
          />
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <magic-button
              label="Back"
              variant="outlined"
              size="sm"
              testId="stepper-back"
              [disabled]="active() === 0"
              (clicked)="prevStep()"
            />
            <magic-button
              label="Next"
              variant="filled"
              size="sm"
              testId="stepper-next"
              [disabled]="active() === 2"
              (clicked)="nextStep()"
            />
            <magic-button
              label="Toggle Step 2 Error"
              variant="tonal"
              color="error"
              size="sm"
              testId="stepper-toggle-error"
              (clicked)="toggleError()"
            />
            <magic-button
              label="Reset"
              variant="text"
              size="sm"
              testId="stepper-reset"
              (clicked)="resetFlow()"
            />
            <span data-testid="stepper-status" style="font-size: 0.875rem;">
              Active step: {{ active() + 1 }} of 3
            </span>
          </div>
        </div>
      `,
    };
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('stepper-status')).toHaveTextContent(
      'Active step: 1 of 3',
    );
    await userEvent.click(canvas.getByTestId('stepper-next'));
    await expect(args.activeStepChange).toHaveBeenCalledWith(1);
    await expect(canvas.getByTestId('stepper-status')).toHaveTextContent(
      'Active step: 2 of 3',
    );
    await userEvent.click(canvas.getByTestId('stepper-toggle-error'));
    await expect(
      canvas.getByText('Invalid billing email address'),
    ).toBeInTheDocument();
    await userEvent.click(canvas.getByTestId('stepper-reset'));
    await expect(canvas.getByTestId('stepper-status')).toHaveTextContent(
      'Active step: 1 of 3',
    );
  },
};

/**
 * Vertical linear stepper with optional step, error message, and disabled final step.
 */
export const VerticalWithErrorAndDisabled: Story = {
  args: {
    orientation: 'vertical',
    linear: true,
    defaultActiveStep: 1,
    steps: [
      {
        id: 'verify',
        label: 'Verify Identity',
        description: 'Account identity verified.',
        completed: true,
      },
      {
        id: 'payment',
        label: 'Payment Details',
        description: 'Update card details to continue.',
        error: true,
        errorMessage: 'Card expired — please update payment method',
      },
      {
        id: 'notes',
        label: 'Delivery Notes',
        description: 'Leave special courier instructions.',
        optional: true,
      },
      {
        id: 'confirm',
        label: 'Confirmation',
        description: 'Locked until payment succeeds.',
        disabled: true,
      },
    ],
  },
};

/**
 * Horizontal stepper with `alternativeLabel` placing labels beneath step indicators.
 */
export const AlternativeLabel: Story = {
  args: {
    orientation: 'horizontal',
    alternativeLabel: true,
    color: 'secondary',
    defaultActiveStep: 1,
  },
};
