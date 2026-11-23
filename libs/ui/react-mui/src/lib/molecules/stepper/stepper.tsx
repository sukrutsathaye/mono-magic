import type { ReactNode, Ref } from 'react';
import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import MuiStepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import type {
  AtomicSize,
  StepItem,
  StepperMoleculeProps,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import { resolveMagicIntentColors } from '../../theme/mui-theme';

/**
 * Props for {@link MagicStepper}, extending {@link StepperMoleculeProps}
 * with React 19 / MUI v9 step navigation callbacks, vertical step content rendering,
 * and styling overrides.
 */
export interface MagicStepperProps extends StepperMoleculeProps {
  /** Invoked whenever the user selects a step (or clicks a step indicator). */
  onStepChange?: (stepIndex: number, step: StepItem) => void;
  /** Optional custom renderer for vertical step body content. */
  renderStepContent?: (step: StepItem, index: number, isActive: boolean) => ReactNode;
  /** Optional MUI `sx` overrides applied to the outer container `Box`. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name applied to the outer container `Box`. */
  className?: string;
  /** React 19 ref forwarded directly to the outer container `<div>` element. */
  ref?: Ref<HTMLDivElement>;
}

const STEPPER_SIZE_STYLES: Record<
  AtomicSize,
  { iconBox: number; fontSize: number; captionSize: number; iconSize: AtomicSize }
> = {
  xs: { iconBox: 20, fontSize: 12, captionSize: 10, iconSize: 'xs' },
  sm: { iconBox: 22, fontSize: 13, captionSize: 11, iconSize: 'sm' },
  md: { iconBox: 26, fontSize: 14, captionSize: 12, iconSize: 'sm' },
  lg: { iconBox: 30, fontSize: 15, captionSize: 13, iconSize: 'md' },
  xl: { iconBox: 34, fontSize: 16, captionSize: 14, iconSize: 'lg' },
};

function clampStepIndex(index: number, length: number): number {
  if (length <= 0) {
    return 0;
  }
  if (index < 0) {
    return -1;
  }
  if (index >= length) {
    return length - 1;
  }
  return index;
}

/**
 * Material 3 multi-step workflow stepper molecule composing MUI v9 `Stepper`,
 * `Step`, `StepLabel`, `StepButton`, `StepContent`, and {@link MagicIcon}.
 *
 * Supports `horizontal` and `vertical` orientations, `linear` vs non-linear
 * step navigation, controlled (`activeStep`) and uncontrolled (`defaultActiveStep`)
 * state, `alternativeLabel`, optional/error/completed step states, and all 7 `ColorIntent`s.
 */
export function MagicStepper({
  id,
  testId,
  ariaLabel,
  steps,
  activeStep,
  defaultActiveStep = 0,
  orientation = 'horizontal',
  linear = true,
  alternativeLabel = false,
  color = 'primary',
  size = 'md',
  disabled = false,
  onStepChange,
  renderStepContent,
  sx,
  className,
  ref,
}: MagicStepperProps) {
  const theme = useTheme();
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];
  const sizeStyle = STEPPER_SIZE_STYLES[size];
  const intent = resolveMagicIntentColors(theme, color);

  const [currentStep, setCurrentStep] = useControllableState<number>({
    value: activeStep,
    defaultValue: clampStepIndex(defaultActiveStep, steps.length),
    onChange: (nextIndex) => {
      const matched = steps[nextIndex];
      if (matched) {
        onStepChange?.(nextIndex, matched);
      }
    },
  });

  const resolvedActiveStep = clampStepIndex(currentStep, steps.length);

  const isStepClickable = (step: StepItem, index: number): boolean => {
    if (disabled || step.disabled) {
      return false;
    }
    if (!linear) {
      return true;
    }
    return index <= resolvedActiveStep || Boolean(step.completed);
  };

  const handleStepClick = (step: StepItem, index: number) => {
    if (!isStepClickable(step, index)) {
      return;
    }
    setCurrentStep(index);
  };

  return (
    <Box
      ref={ref}
      id={id}
      data-testid={testId}
      data-orientation={orientation}
      data-linear={linear ? 'true' : 'false'}
      data-size={size}
      aria-label={ariaLabel ?? 'Progress stepper'}
      className={className}
      sx={[{ width: '100%', opacity: disabled ? 0.6 : 1 }, ...extraSx]}
    >
      <MuiStepper
        activeStep={resolvedActiveStep}
        orientation={orientation}
        nonLinear={!linear}
        alternativeLabel={orientation === 'horizontal' && alternativeLabel}
        sx={{
          '& .MuiStepIcon-root.Mui-active': {
            color: intent.main,
          },
          '& .MuiStepIcon-root.Mui-completed': {
            color: intent.main,
          },
          '& .MuiStepIcon-root.Mui-error': {
            color: theme.palette.error.main,
          },
          '& .MuiStepLabel-label': {
            fontSize: sizeStyle.fontSize,
          },
          '& .MuiStepIcon-root': {
            width: sizeStyle.iconBox,
            height: sizeStyle.iconBox,
          },
        }}
      >
        {steps.map((step, index) => {
          const isError = Boolean(step.error || step.status === 'error');
          const isCompleted = Boolean(
            !isError && (step.completed || step.status === 'completed'),
          );
          const isActive =
            !isError &&
            (step.status === 'active' || index === resolvedActiveStep);
          const isStepDisabled = Boolean(disabled || step.disabled);
          const canClick = isStepClickable(step, index);

          const optionalNode =
            isError && step.errorMessage ? (
              <Typography
                variant="caption"
                color="error"
                role="alert"
                sx={{ display: 'block', fontSize: sizeStyle.captionSize }}
              >
                {step.errorMessage}
              </Typography>
            ) : step.optional ? (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', fontSize: sizeStyle.captionSize }}
                >
                  {step.optionalLabel ?? 'Optional'}
                </Typography>
                {orientation === 'horizontal' && step.description ? (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', fontSize: sizeStyle.captionSize }}
                  >
                    {step.description}
                  </Typography>
                ) : null}
              </Box>
            ) : orientation === 'horizontal' && step.description ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', fontSize: sizeStyle.captionSize }}
              >
                {step.description}
              </Typography>
            ) : undefined;

          const stepIconName = step.icon;
          const customStepIcon = stepIconName
            ? () => (
                <Box
                  component="span"
                  sx={{
                    width: sizeStyle.iconBox,
                    height: sizeStyle.iconBox,
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isError
                      ? theme.palette.error.main
                      : isActive || isCompleted
                        ? intent.main
                        : theme.palette.action.disabledBackground,
                    color: isError
                      ? theme.palette.error.contrastText
                      : isActive || isCompleted
                        ? intent.contrastText
                        : theme.palette.text.secondary,
                  }}
                >
                  <MagicIcon
                    icon={isError ? 'error' : stepIconName}
                    size={sizeStyle.iconSize}
                    color="inherit"
                  />
                </Box>
              )
            : undefined;

          const labelElement = (
            <StepLabel
              error={isError}
              optional={optionalNode}
              slots={customStepIcon ? { stepIcon: customStepIcon } : undefined}
            >
              {step.label}
            </StepLabel>
          );

          return (
            <Step
              key={step.id}
              active={isActive}
              completed={isCompleted}
              disabled={isStepDisabled}
              expanded={orientation === 'vertical' ? isActive || isError : undefined}
              data-testid={testId ? `${testId}-step-${step.id}` : undefined}
              data-status={
                isError
                  ? 'error'
                  : isCompleted
                    ? 'completed'
                    : isActive
                      ? 'active'
                      : 'pending'
              }
            >
              {canClick ? (
                <StepButton
                  onClick={() => handleStepClick(step, index)}
                  disabled={isStepDisabled}
                  optional={optionalNode}
                  data-testid={
                    testId ? `${testId}-button-${step.id}` : undefined
                  }
                  aria-current={isActive ? 'step' : undefined}
                >
                  {labelElement}
                </StepButton>
              ) : (
                <Box
                  aria-current={isActive ? 'step' : undefined}
                  data-testid={
                    testId ? `${testId}-label-${step.id}` : undefined
                  }
                >
                  {labelElement}
                </Box>
              )}

              {orientation === 'vertical' ? (
                <StepContent
                  transitionDuration={0}
                  data-testid={
                    testId ? `${testId}-content-${step.id}` : undefined
                  }
                >
                  {renderStepContent ? (
                    renderStepContent(step, index, isActive)
                  ) : step.description ? (
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  ) : null}
                </StepContent>
              ) : null}
            </Step>
          );
        })}
      </MuiStepper>
    </Box>
  );
}
