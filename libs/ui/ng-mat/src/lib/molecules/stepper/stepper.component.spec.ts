import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
  StepItem,
  StepperOrientation,
} from '@mono-magic/atomic-design-interfaces';
import {
  MagicStepContentDirective,
  MagicStepperComponent,
} from './stepper.component';

const SAMPLE_STEPS: readonly StepItem[] = [
  {
    id: 'account',
    label: 'Account',
    description: 'Configure your workspace identity.',
    completed: true,
  },
  {
    id: 'profile',
    label: 'Profile',
    description: 'Optional team bio.',
    optional: true,
    optionalLabel: 'Skip if solo',
    icon: 'person',
  },
  {
    id: 'billing',
    label: 'Billing',
    description: 'Select plan & payment method.',
    error: true,
    errorMessage: 'Card verification failed',
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Locked until approved.',
    disabled: true,
  },
];

@Component({
  imports: [MagicStepperComponent, MagicStepContentDirective],
  template: `
    <magic-stepper [steps]="steps()" [defaultActiveStep]="0" testId="proj-step">
      <ng-template magicStepContent="account">
        <div class="projected-step-body">Custom Projected Account Form</div>
      </ng-template>
    </magic-stepper>
  `,
})
class ProjectedStepperHostComponent {
  readonly steps = signal<readonly StepItem[]>(SAMPLE_STEPS);
}

describe('MagicStepperComponent', () => {
  let fixture: ComponentFixture<MagicStepperComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const matStepper = (): HTMLElement =>
    host().querySelector('mat-stepper') as HTMLElement;
  const stepHeaders = (): HTMLElement[] =>
    Array.from(host().querySelectorAll('mat-step-header'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicStepperComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicStepperComponent);
    setInputs({ steps: SAMPLE_STEPS });
  });

  describe('rendering, orientations & props', () => {
    it('forwards id/testId/ariaLabel cleanly and renders step labels, optional text, and errors', () => {
      setInputs({
        id: 'checkout-stepper',
        testId: 'checkout',
        ariaLabel: 'Checkout steps',
      });

      expect(host().getAttribute('id')).toBeNull();
      expect(matStepper().getAttribute('id')).toBe('checkout-stepper');
      expect(matStepper().getAttribute('data-testid')).toBe('checkout');
      expect(matStepper().getAttribute('aria-label')).toBe('Checkout steps');
      expect(stepHeaders()).toHaveLength(4);
      expect(host().textContent).toContain('Account');
      expect(host().textContent).toContain('Skip if solo');
      expect(host().textContent).toContain('Card verification failed');
    });

    it('handles empty steps array and explicit status overrides cleanly', () => {
      setInputs({ steps: [] });
      expect(fixture.componentInstance.currentActiveStep()).toBe(0);

      setInputs({
        steps: [
          { id: 'done', label: 'Done', status: 'completed' },
          { id: 'err', label: 'Err', status: 'error', errorMessage: 'Oops' },
          { id: 'act', label: 'Act', status: 'active' },
          { id: 'pend', label: 'Pend', status: 'pending' },
        ],
        defaultActiveStep: 2,
      });
      expect(fixture.componentInstance.currentActiveStep()).toBe(2);
      expect(host().textContent).toContain('Oops');
    });

    it.each(['horizontal', 'vertical'] as StepperOrientation[])(
      'supports orientation=%s',
      (orientation) => {
        setInputs({ orientation });
        expect(host().classList).toContain(`magic-stepper--${orientation}`);
      },
    );

    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as AtomicSize[])(
      'applies magic-size-%s class',
      (size) => {
        setInputs({ size });
        expect(host().classList).toContain(`magic-size-${size}`);
      },
    );

    it.each(['primary', 'secondary', 'success', 'warning'] as ColorIntent[])(
      'applies magic-color-%s class',
      (color) => {
        setInputs({ color });
        expect(host().classList).toContain(`magic-color-${color}`);
      },
    );

    it('supports alternativeLabel in horizontal mode', () => {
      setInputs({ orientation: 'horizontal', alternativeLabel: true });
      expect(
        matStepper().classList.contains('mat-stepper-label-position-bottom'),
      ).toBe(true);
    });
  });

  describe('navigation, linear constraints & controlled/uncontrolled state', () => {
    it('navigates uncontrolled steps via next(), previous(), reset(), and header clicks', () => {
      const stepSpy = vi.fn();
      const itemSpy = vi.fn();
      fixture.componentInstance.activeStepChange.subscribe(stepSpy);
      fixture.componentInstance.stepSelected.subscribe(itemSpy);

      setInputs({ defaultActiveStep: 0, linear: false });
      expect(fixture.componentInstance.currentActiveStep()).toBe(0);

      // previous() at step 0 is a no-op
      fixture.componentInstance.previous();
      expect(fixture.componentInstance.currentActiveStep()).toBe(0);

      fixture.componentInstance.next();
      fixture.detectChanges();
      expect(fixture.componentInstance.currentActiveStep()).toBe(1);
      expect(stepSpy).toHaveBeenCalledWith(1);
      expect(itemSpy).toHaveBeenCalledWith(SAMPLE_STEPS[1]);

      fixture.componentInstance.previous();
      fixture.detectChanges();
      expect(fixture.componentInstance.currentActiveStep()).toBe(0);
      expect(stepSpy).toHaveBeenLastCalledWith(0);

      stepHeaders()[2].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.currentActiveStep()).toBe(2);

      // next() when remaining steps are disabled is a no-op
      fixture.componentInstance.next();
      expect(fixture.componentInstance.currentActiveStep()).toBe(2);

      // Disabled step header click is ignored
      stepHeaders()[3].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.currentActiveStep()).toBe(2);

      // selectStepIndex out of range or disabled is ignored
      fixture.componentInstance.selectStepIndex(3);
      fixture.componentInstance.selectStepIndex(99);
      expect(fixture.componentInstance.currentActiveStep()).toBe(2);

      fixture.componentInstance.reset();
      fixture.detectChanges();
      expect(fixture.componentInstance.currentActiveStep()).toBe(0);
    });

    it('enforces linear mode while allowing advancement past completed or optional steps', () => {
      const linearSteps: readonly StepItem[] = [
        { id: 's1', label: 'Step 1', status: 'active' },
        { id: 's2', label: 'Step 2', optional: true },
        { id: 's3', label: 'Step 3', status: 'pending' },
      ];
      setInputs({ steps: linearSteps, linear: true, defaultActiveStep: 0 });

      fixture.componentInstance.next();
      fixture.detectChanges();
      expect(fixture.componentInstance.currentActiveStep()).toBe(0);

      fixture.componentInstance.selectStepIndex(2);
      fixture.detectChanges();
      expect(fixture.componentInstance.currentActiveStep()).toBe(0);

      // Mark step 1 completed and advance through optional step 2 to step 3
      setInputs({
        steps: [
          { id: 's1', label: 'Step 1', completed: true },
          { id: 's2', label: 'Step 2', optional: true },
          { id: 's3', label: 'Step 3' },
        ],
      });
      fixture.componentInstance.selectStepIndex(2);
      fixture.detectChanges();
      expect(fixture.componentInstance.currentActiveStep()).toBe(2);
    });

    it('honors controlled activeStep without mutating internal state and blocks interaction when disabled=true', () => {
      const stepSpy = vi.fn();
      fixture.componentInstance.activeStepChange.subscribe(stepSpy);

      setInputs({ activeStep: 0 });
      fixture.componentInstance.next();
      fixture.detectChanges();

      expect(stepSpy).toHaveBeenCalledWith(1);
      expect(fixture.componentInstance.currentActiveStep()).toBe(0);

      fixture.componentInstance.reset();
      expect(fixture.componentInstance.currentActiveStep()).toBe(0);

      stepSpy.mockClear();
      setInputs({ disabled: true });
      expect(host().classList).toContain('magic-stepper--disabled');
      fixture.componentInstance.next();
      fixture.componentInstance.previous();
      fixture.componentInstance.selectStepIndex(1);
      expect(stepSpy).not.toHaveBeenCalled();
    });
  });

  describe('custom step content projection', () => {
    it('renders [magicStepContent] template for matching step id', () => {
      const hostFixture = TestBed.createComponent(ProjectedStepperHostComponent);
      hostFixture.detectChanges();
      expect(
        (hostFixture.nativeElement as HTMLElement).querySelector(
          '.projected-step-body',
        )?.textContent,
      ).toContain('Custom Projected Account Form');
    });
  });
});
