import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  computed,
  contentChildren,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {
  MatStep,
  MatStepLabel,
  MatStepper,
  MatStepperIcon,
} from '@angular/material/stepper';
import type { StepperSelectionEvent } from '@angular/cdk/stepper';
import type {
  AtomicSize,
  ColorIntent,
  StepItem,
  StepStatus,
  StepperMoleculeProps,
  StepperOrientation,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';

export type { StepItem, StepStatus, StepperOrientation };

/**
 * Marks a custom `<ng-template>` step body inside `<magic-stepper>` keyed by
 * `magicStepContent` (matching `StepItem.id`).
 */
@Directive({
  selector: 'ng-template[magicStepContent]',
})
export class MagicStepContentDirective {
  /** Identifier matching `StepItem.id`. */
  readonly stepId = input.required<string>({ alias: 'magicStepContent' });
  /** Template reference rendered inside the matching step panel body. */
  readonly templateRef = inject(TemplateRef<unknown>);
}

/**
 * A Material 3 multi-step workflow molecule composing `MatStepper` and `MatStep`,
 * supporting `horizontal` and `vertical` orientations, `linear` and non-linear
 * progression, `alternativeLabel` bottom labels, custom step icons, optional
 * badges, per-step `error` / `errorMessage` states, controlled (`activeStep`)
 * and uncontrolled (`defaultActiveStep`) active step tracking, and
 * `[magicStepContent]` projection.
 *
 * @see https://material.angular.dev/components/stepper/overview
 */
@Component({
  selector: 'magic-stepper',
  imports: [
    NgTemplateOutlet,
    MatStepper,
    MatStep,
    MatStepLabel,
    MatStepperIcon,
    MatIcon,
  ],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicStepperComponent implements SignalProps<StepperMoleculeProps> {
  /** Id applied to the inner `mat-stepper` (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the inner `mat-stepper` (`-step-<id>` on steps). */
  readonly testId = input<string>();
  /** Accessible name applied to the stepper (`aria-label`). */
  readonly ariaLabel = input<string>();
  /** Ordered list of workflow steps to display. */
  readonly steps = input.required<readonly StepItem[]>();
  /** Controlled zero-based index of the currently active step. */
  readonly activeStep = input<number>();
  /** Initial zero-based active step index for uncontrolled usage (defaults to `0`). */
  readonly defaultActiveStep = input<number>();
  /** Layout orientation (`horizontal` or `vertical`). */
  readonly orientation = input<StepperOrientation>('horizontal');
  /** When true, users must complete preceding steps before advancing. */
  readonly linear = input<boolean>(false);
  /** When true in horizontal orientation, places step labels beneath the step icon. */
  readonly alternativeLabel = input<boolean>(false);
  /** Semantic accent color intent for active and completed step indicators. */
  readonly color = input<ColorIntent>('primary');
  /** Standardized component density/size preset (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');
  /** Whether the entire stepper is disabled and non-interactive. */
  readonly disabled = input<boolean>(false);

  /** Emits the updated zero-based active step index when step selection changes. */
  readonly activeStepChange = output<number>();
  /** Emits the activated `StepItem` whenever the active step changes. */
  readonly stepSelected = output<StepItem>();

  private readonly matStepper = viewChild(MatStepper);
  private readonly projectedPanels = contentChildren(MagicStepContentDirective);
  private readonly uncontrolledActiveStep = signal<number | undefined>(
    undefined,
  );

  /** Effective zero-based active step index (`activeStep` overrides local state). */
  readonly currentActiveStep = computed(() => {
    const count = this.steps().length;
    if (count === 0) {
      return 0;
    }
    const controlled = this.activeStep();
    if (controlled !== undefined) {
      return this.clampIndex(controlled, count);
    }
    const local = this.uncontrolledActiveStep();
    if (local !== undefined) {
      return this.clampIndex(local, count);
    }
    const fallback = this.defaultActiveStep() ?? 0;
    return this.clampIndex(fallback, count);
  });

  protected readonly panelMap = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const panel of this.projectedPanels()) {
      map.set(panel.stepId(), panel.templateRef);
    }
    return map;
  });

  protected readonly hostClasses = computed(() =>
    [
      'magic-stepper',
      `magic-size-${this.size()}`,
      `magic-color-${this.color()}`,
      `magic-stepper--${this.orientation()}`,
      this.disabled() ? 'magic-stepper--disabled' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  /** Programmatically advances to the next enabled step when possible. */
  next(): void {
    if (this.disabled()) {
      return;
    }
    const current = this.currentActiveStep();
    const list = this.steps();
    if (this.linear()) {
      const currItem = list[current];
      if (currItem && !this.isStepCompleted(currItem, current) && !currItem.optional) {
        return;
      }
    }
    for (let idx = current + 1; idx < list.length; idx += 1) {
      if (!list[idx]?.disabled) {
        this.selectStepIndex(idx);
        return;
      }
    }
  }

  /** Programmatically moves to the previous enabled step when possible. */
  previous(): void {
    if (this.disabled()) {
      return;
    }
    const current = this.currentActiveStep();
    const list = this.steps();
    for (let idx = current - 1; idx >= 0; idx -= 1) {
      if (!list[idx]?.disabled) {
        this.selectStepIndex(idx);
        return;
      }
    }
  }

  /** Resets the uncontrolled step back to `defaultActiveStep ?? 0` and resets MatStepper state. */
  reset(): void {
    const target = this.clampIndex(
      this.defaultActiveStep() ?? 0,
      this.steps().length,
    );
    if (this.activeStep() === undefined) {
      this.uncontrolledActiveStep.set(target);
    }
    this.matStepper()?.reset();
    this.activeStepChange.emit(target);
  }

  protected customContentFor(stepId: string): TemplateRef<unknown> | null {
    return this.panelMap().get(stepId) ?? null;
  }

  protected isStepCompleted(step: StepItem, index: number): boolean {
    if (step.status === 'completed') {
      return true;
    }
    if (step.status === 'pending' || step.status === 'active' || step.status === 'error') {
      return false;
    }
    if (step.completed !== undefined) {
      return step.completed;
    }
    return index < this.currentActiveStep() && !this.isStepError(step);
  }

  protected isStepError(step: StepItem): boolean {
    return step.status === 'error' || Boolean(step.error);
  }

  protected resolvedStepState(step: StepItem, index: number): string {
    if (this.isStepError(step)) {
      return 'error';
    }
    if (step.icon) {
      return `custom-${index}`;
    }
    if (this.isStepCompleted(step, index)) {
      return 'done';
    }
    return 'number';
  }

  protected isStepEditable(step: StepItem): boolean {
    return !this.disabled() && !step.disabled;
  }

  protected onSelectionChange(event: StepperSelectionEvent): void {
    const targetIndex = event.selectedIndex;
    const target = this.steps()[targetIndex];
    if (this.disabled() || !target || target.disabled) {
      return;
    }
    if (this.linear() && targetIndex > event.previouslySelectedIndex) {
      for (let i = 0; i < targetIndex; i += 1) {
        const prev = this.steps()[i];
        if (prev && !prev.optional && !this.isStepCompleted(prev, i)) {
          return;
        }
      }
    }
    this.commitActiveStep(targetIndex, target);
  }

  /** Selects a specific zero-based step index respecting `disabled` and `linear` constraints. */
  selectStepIndex(index: number): void {
    const list = this.steps();
    const target = list[index];
    if (this.disabled() || !target || target.disabled) {
      return;
    }
    if (this.linear() && index > this.currentActiveStep()) {
      for (let i = 0; i < index; i += 1) {
        const prev = list[i];
        if (prev && !prev.optional && !this.isStepCompleted(prev, i)) {
          return;
        }
      }
    }
    this.commitActiveStep(index, target);
  }

  private commitActiveStep(index: number, item: StepItem): void {
    const clamped = this.clampIndex(index, this.steps().length);
    const prev = this.currentActiveStep();
    if (this.activeStep() === undefined) {
      this.uncontrolledActiveStep.set(clamped);
    }
    if (prev !== clamped) {
      this.activeStepChange.emit(clamped);
      this.stepSelected.emit(item);
    }
  }

  private clampIndex(index: number, count: number): number {
    if (count <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(index, count - 1));
  }
}
