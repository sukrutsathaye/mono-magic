import type {
  AtomicSize,
  BaseMoleculeProps,
  ColorIntent,
} from '../common/atomic.interface.js';

/** Layout axis for `MagicStepper` step indicators and connectors. */
export type StepperOrientation = 'horizontal' | 'vertical';

/** Ordered list of supported stepper orientations. */
export const STEPPER_ORIENTATIONS: readonly StepperOrientation[] = [
  'horizontal',
  'vertical',
] as const;

/** Explicit lifecycle state of an individual step within `MagicStepper`. */
export type StepStatus = 'pending' | 'active' | 'completed' | 'error';

/** Ordered list of supported step statuses. */
export const STEP_STATUSES: readonly StepStatus[] = [
  'pending',
  'active',
  'completed',
  'error',
] as const;

/** Individual step descriptor rendered inside `MagicStepper`. */
export interface StepItem {
  /** Unique identifier for the step. */
  id: string;
  /** Primary step label displayed beside or beneath the step indicator. */
  label: string;
  /** Optional supporting description for the step. */
  description?: string;
  /** Whether the step may be skipped without completing it. */
  optional?: boolean;
  /** Custom label displayed when `optional` is true (defaults to `"Optional"`). */
  optionalLabel?: string;
  /** Whether the step has been completed. */
  completed?: boolean;
  /** Whether the step is currently in an error state. */
  error?: boolean;
  /** Optional error message displayed when `error` is true. */
  errorMessage?: string;
  /** Whether this individual step is disabled and cannot be selected. */
  disabled?: boolean;
  /** Optional Material icon string name overriding the numeric step index. */
  icon?: string;
  /** Explicit status override for the step (`pending`, `active`, `completed`, or `error`). */
  status?: StepStatus;
}

/** Alias for {@link StepItem} aligned with `MagicStepper` component naming. */
export type MagicStepItem = StepItem;

/** Shared property contract for `MagicStepper` across all UI libraries. */
export interface StepperMoleculeProps extends BaseMoleculeProps {
  /** Ordered list of workflow steps to display. */
  steps: readonly StepItem[];
  /** Controlled zero-based index of the currently active step. */
  activeStep?: number;
  /** Initial zero-based active step index for uncontrolled usage. */
  defaultActiveStep?: number;
  /** Layout orientation (`horizontal` or `vertical`). */
  orientation?: StepperOrientation;
  /** When true, users must complete preceding steps before advancing. */
  linear?: boolean;
  /** When true in horizontal orientation, places step labels beneath the step icon. */
  alternativeLabel?: boolean;
  /** Semantic accent color intent for active and completed step indicators. */
  color?: ColorIntent;
  /** Standardized component density/size preset. */
  size?: AtomicSize;
  /** Whether the entire stepper is disabled and non-interactive. */
  disabled?: boolean;
}

/** Alias for {@link StepperMoleculeProps} aligned with `MagicStepper` component naming. */
export type MagicStepperProps = StepperMoleculeProps;
