import { useCallback, useId, type ReactNode, type Ref } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type {
  AtomicSize,
  StepItem,
  StepperMoleculeProps,
  StepStatus,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import { useMagicPaperColors } from '../../theme/paper-theme';

export type {
  MagicStepItem,
  MagicStepperProps as StepperBaseProps,
  StepItem,
  StepperMoleculeProps,
  StepperOrientation,
  StepStatus,
} from '@mono-magic/atomic-design-interfaces';

/** Props for the React Native Paper `MagicStepper` molecule. */
export interface MagicStepperProps extends StepperMoleculeProps {
  /** Fired whenever the active step index changes. */
  onStepChange?: (stepIndex: number, step: StepItem) => void;
  /** Optional custom content renderer for the active step panel (or vertical step body). */
  renderStepContent?: (step: StepItem, index: number) => ReactNode;
  /** Optional children rendered beneath the step header strip (or active panel). */
  children?: ReactNode;
  /** Style override applied to the outer stepper container. */
  style?: StyleProp<ViewStyle>;
  /** React 19 ref forwarded to the outer container `View`. */
  ref?: Ref<View>;
}

interface StepperSizeTokens {
  indicatorSize: number;
  indicatorFontSize: number;
  iconSize: number;
  labelFontSize: number;
  descriptionFontSize: number;
  optionalFontSize: number;
  gap: number;
}

const STEPPER_SIZE_TOKENS: Record<AtomicSize, StepperSizeTokens> = {
  xs: {
    indicatorSize: 22,
    indicatorFontSize: 11,
    iconSize: 13,
    labelFontSize: 12,
    descriptionFontSize: 11,
    optionalFontSize: 10,
    gap: 6,
  },
  sm: {
    indicatorSize: 26,
    indicatorFontSize: 12,
    iconSize: 15,
    labelFontSize: 13,
    descriptionFontSize: 11,
    optionalFontSize: 10,
    gap: 8,
  },
  md: {
    indicatorSize: 30,
    indicatorFontSize: 13,
    iconSize: 17,
    labelFontSize: 14,
    descriptionFontSize: 12,
    optionalFontSize: 11,
    gap: 10,
  },
  lg: {
    indicatorSize: 36,
    indicatorFontSize: 15,
    iconSize: 20,
    labelFontSize: 15,
    descriptionFontSize: 13,
    optionalFontSize: 12,
    gap: 12,
  },
  xl: {
    indicatorSize: 42,
    indicatorFontSize: 17,
    iconSize: 22,
    labelFontSize: 16,
    descriptionFontSize: 14,
    optionalFontSize: 12,
    gap: 14,
  },
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    gap: 12,
  },
  horizontalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  verticalColumn: {
    flexDirection: 'column',
    width: '100%',
  },
  horizontalStepWrapper: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalStepWrapperLast: {
    flex: 0,
    flexShrink: 1,
  },
  horizontalButtonInline: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  horizontalButtonAlternative: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  horizontalConnector: {
    flex: 1,
    minWidth: 16,
    height: 2,
    marginHorizontal: 8,
  },
  horizontalConnectorAlt: {
    marginTop: 15,
    alignSelf: 'flex-start',
  },
  verticalStepContainer: {
    width: '100%',
  },
  verticalButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalBodyRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 20,
  },
  verticalConnectorTrack: {
    alignItems: 'center',
  },
  verticalConnectorLine: {
    flex: 1,
    width: 2,
    minHeight: 16,
    marginVertical: 4,
  },
  verticalContentSlot: {
    flex: 1,
    paddingBottom: 12,
    paddingTop: 4,
  },
  indicatorCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  indicatorText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  labelBlock: {
    minWidth: 0,
    flexShrink: 1,
    gap: 2,
  },
  labelBlockCentered: {
    alignItems: 'center',
  },
  labelText: {
    fontWeight: '600',
    lineHeight: 18,
  },
  descriptionText: {
    lineHeight: 16,
  },
  errorMessageText: {
    lineHeight: 16,
    fontWeight: '500',
  },
  activePanel: {
    width: '100%',
    paddingTop: 4,
  },
});

function resolveStepStatus(
  step: StepItem,
  index: number,
  activeStep: number
): StepStatus {
  if (step.status) {
    return step.status;
  }
  if (step.error) {
    return 'error';
  }
  if (step.completed) {
    return 'completed';
  }
  if (index === activeStep) {
    return 'active';
  }
  return 'pending';
}

function canSelectStep(
  steps: readonly StepItem[],
  targetIndex: number,
  activeStep: number,
  linear: boolean,
  stepperDisabled: boolean
): boolean {
  const targetStep = steps[targetIndex];
  if (!targetStep || stepperDisabled || targetStep.disabled) {
    return false;
  }
  if (!linear || targetIndex <= activeStep) {
    return true;
  }
  // In linear mode, allow advancing only when all preceding steps are completed or optional.
  for (let i = 0; i < targetIndex; i += 1) {
    const prev = steps[i];
    if (!prev.completed && !prev.optional && prev.status !== 'completed') {
      return false;
    }
  }
  return true;
}

/**
 * Material 3 workflow stepper molecule for `@mono-magic/rn-paper`.
 *
 * Supports `'horizontal'` and `'vertical'` orientations, `alternativeLabel`
 * layout, `linear` and non-linear step navigation, `optional` steps, per-step
 * `error` + `errorMessage`, custom icons, controlled/uncontrolled `activeStep`,
 * and custom step panel rendering.
 */
export function MagicStepper({
  id,
  testId,
  ariaLabel,
  steps,
  activeStep: controlledActiveStep,
  defaultActiveStep = 0,
  orientation = 'horizontal',
  linear = false,
  alternativeLabel = false,
  color = 'primary',
  size = 'md',
  disabled = false,
  onStepChange,
  renderStepContent,
  children,
  style,
  ref,
}: MagicStepperProps) {
  const { colors, resolveIntent } = useMagicPaperColors();
  const intent = resolveIntent(color);
  const errorIntent = resolveIntent('error');
  const tokens = STEPPER_SIZE_TOKENS[size];
  const generatedId = useId();
  const baseId = id ?? generatedId;

  const [rawActiveStep, setActiveStep] = useControllableState<number>({
    value: controlledActiveStep,
    defaultValue: defaultActiveStep,
  });

  const activeStep =
    steps.length === 0
      ? -1
      : Math.max(0, Math.min(rawActiveStep, steps.length - 1));

  const handleSelectStep = useCallback(
    (index: number) => {
      const targetStep = steps[index];
      if (!targetStep || !canSelectStep(steps, index, activeStep, linear, disabled)) {
        return;
      }
      setActiveStep(index);
      onStepChange?.(index, targetStep);
    },
    [activeStep, disabled, linear, onStepChange, setActiveStep, steps]
  );

  const dividerColor = colors.outlineVariant ?? colors.outline;

  const renderIndicator = (
    step: StepItem,
    index: number,
    status: StepStatus,
    isStepDisabled: boolean
  ) => {
    const circleBg = isStepDisabled
      ? colors.surfaceDisabled
      : status === 'error'
        ? errorIntent.main
        : status === 'active' || status === 'completed'
          ? intent.main
          : colors.surfaceVariant;

    const circleFg = isStepDisabled
      ? colors.onSurfaceDisabled
      : status === 'error'
        ? errorIntent.onMain
        : status === 'active' || status === 'completed'
          ? intent.onMain
          : colors.onSurfaceVariant;

    let indicatorInner: ReactNode;
    if (status === 'error') {
      indicatorInner = (
        <MagicIcon icon="priority_high" size={tokens.iconSize} color={circleFg} />
      );
    } else if (status === 'completed') {
      indicatorInner = (
        <MagicIcon icon="check" size={tokens.iconSize} color={circleFg} />
      );
    } else if (step.icon) {
      indicatorInner = (
        <MagicIcon icon={step.icon} size={tokens.iconSize} color={circleFg} />
      );
    } else {
      indicatorInner = (
        <Text
          style={[
            styles.indicatorText,
            { color: circleFg, fontSize: tokens.indicatorFontSize },
          ]}
        >
          {index + 1}
        </Text>
      );
    }

    return (
      <View
        testID={testId ? `${testId}-indicator-${step.id}` : undefined}
        style={[
          styles.indicatorCircle,
          {
            width: tokens.indicatorSize,
            height: tokens.indicatorSize,
            borderRadius: tokens.indicatorSize / 2,
            backgroundColor: circleBg,
          },
        ]}
      >
        {indicatorInner}
      </View>
    );
  };

  const renderLabels = (
    step: StepItem,
    status: StepStatus,
    isStepDisabled: boolean,
    centered: boolean
  ) => {
    const labelColor = isStepDisabled
      ? colors.onSurfaceDisabled
      : status === 'error'
        ? errorIntent.main
        : status === 'active' || status === 'completed'
          ? colors.onSurface
          : colors.onSurfaceVariant;

    const subtitleColor = isStepDisabled
      ? colors.onSurfaceDisabled
      : colors.onSurfaceVariant;

    const optionalText = step.optional ? (step.optionalLabel ?? 'Optional') : undefined;

    return (
      <View style={[styles.labelBlock, centered ? styles.labelBlockCentered : undefined]}>
        <Text
          testID={testId ? `${testId}-label-${step.id}` : undefined}
          style={[
            styles.labelText,
            {
              color: labelColor,
              fontSize: tokens.labelFontSize,
              textAlign: centered ? 'center' : 'left',
            },
          ]}
        >
          {step.label}
        </Text>

        {step.error && step.errorMessage ? (
          <Text
            testID={testId ? `${testId}-error-${step.id}` : undefined}
            style={[
              styles.errorMessageText,
              {
                color: errorIntent.main,
                fontSize: tokens.descriptionFontSize,
                textAlign: centered ? 'center' : 'left',
              },
            ]}
          >
            {step.errorMessage}
          </Text>
        ) : step.description ? (
          <Text
            testID={testId ? `${testId}-desc-${step.id}` : undefined}
            style={[
              styles.descriptionText,
              {
                color: subtitleColor,
                fontSize: tokens.descriptionFontSize,
                textAlign: centered ? 'center' : 'left',
              },
            ]}
          >
            {step.description}
          </Text>
        ) : null}

        {optionalText ? (
          <Text
            testID={testId ? `${testId}-optional-${step.id}` : undefined}
            style={{
              color: subtitleColor,
              fontSize: tokens.optionalFontSize,
              textAlign: centered ? 'center' : 'left',
            }}
          >
            {optionalText}
          </Text>
        ) : null}
      </View>
    );
  };

  const activeStepItem = activeStep >= 0 ? steps[activeStep] : undefined;

  return (
    <View
      ref={ref}
      nativeID={baseId}
      testID={testId}
      accessibilityLabel={ariaLabel ?? 'Progress stepper'}
      style={[styles.root, style]}
    >
      {orientation === 'horizontal' ? (
        <View
          testID={testId ? `${testId}-steps` : undefined}
          style={styles.horizontalRow}
        >
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const status = resolveStepStatus(step, index, activeStep);
            const isStepDisabled = Boolean(disabled || step.disabled);
            const isSelectable = canSelectStep(
              steps,
              index,
              activeStep,
              linear,
              disabled
            );
            const isActive = index === activeStep;
            const connectorDone =
              status === 'completed' || index < activeStep;

            const webAriaCurrent =
              Platform.OS === 'web' && isActive
                ? ({ 'aria-current': 'step' } as Record<string, unknown>)
                : {};

            return (
              <View
                key={step.id}
                style={[
                  styles.horizontalStepWrapper,
                  isLast && !alternativeLabel
                    ? styles.horizontalStepWrapperLast
                    : undefined,
                ]}
              >
                <Pressable
                  testID={testId ? `${testId}-step-${step.id}` : undefined}
                  disabled={!isSelectable}
                  accessibilityRole="button"
                  accessibilityLabel={step.label}
                  accessibilityState={{
                    selected: isActive,
                    disabled: !isSelectable,
                  }}
                  onPress={() => handleSelectStep(index)}
                  style={[
                    alternativeLabel
                      ? styles.horizontalButtonAlternative
                      : styles.horizontalButtonInline,
                    { gap: tokens.gap },
                  ]}
                  {...webAriaCurrent}
                >
                  {renderIndicator(step, index, status, isStepDisabled)}
                  {renderLabels(step, status, isStepDisabled, alternativeLabel)}
                </Pressable>

                {!isLast ? (
                  <View
                    testID={testId ? `${testId}-connector-${index}` : undefined}
                    style={[
                      styles.horizontalConnector,
                      alternativeLabel
                        ? [
                            styles.horizontalConnectorAlt,
                            { marginTop: tokens.indicatorSize / 2 - 1 },
                          ]
                        : undefined,
                      {
                        backgroundColor: connectorDone ? intent.main : dividerColor,
                      },
                    ]}
                  />
                ) : null}
              </View>
            );
          })}
        </View>
      ) : (
        <View
          testID={testId ? `${testId}-steps` : undefined}
          style={styles.verticalColumn}
        >
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const status = resolveStepStatus(step, index, activeStep);
            const isStepDisabled = Boolean(disabled || step.disabled);
            const isSelectable = canSelectStep(
              steps,
              index,
              activeStep,
              linear,
              disabled
            );
            const isActive = index === activeStep;
            const connectorDone =
              status === 'completed' || index < activeStep;
            const showBodyRow = !isLast || (isActive && Boolean(renderStepContent));

            const webAriaCurrent =
              Platform.OS === 'web' && isActive
                ? ({ 'aria-current': 'step' } as Record<string, unknown>)
                : {};

            return (
              <View key={step.id} style={styles.verticalStepContainer}>
                <Pressable
                  testID={testId ? `${testId}-step-${step.id}` : undefined}
                  disabled={!isSelectable}
                  accessibilityRole="button"
                  accessibilityLabel={step.label}
                  accessibilityState={{
                    selected: isActive,
                    disabled: !isSelectable,
                  }}
                  onPress={() => handleSelectStep(index)}
                  style={[styles.verticalButton, { gap: tokens.gap }]}
                  {...webAriaCurrent}
                >
                  {renderIndicator(step, index, status, isStepDisabled)}
                  {renderLabels(step, status, isStepDisabled, false)}
                </Pressable>

                {showBodyRow ? (
                  <View style={styles.verticalBodyRow}>
                    <View
                      style={[
                        styles.verticalConnectorTrack,
                        { width: tokens.indicatorSize },
                      ]}
                    >
                      {!isLast ? (
                        <View
                          testID={testId ? `${testId}-connector-${index}` : undefined}
                          style={[
                            styles.verticalConnectorLine,
                            {
                              backgroundColor: connectorDone
                                ? intent.main
                                : dividerColor,
                            },
                          ]}
                        />
                      ) : null}
                    </View>
                    <View
                      style={[
                        styles.verticalContentSlot,
                        { paddingLeft: tokens.gap },
                      ]}
                    >
                      {isActive && renderStepContent
                        ? renderStepContent(step, index)
                        : null}
                    </View>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      )}

      {orientation === 'horizontal' && renderStepContent && activeStepItem ? (
        <View
          testID={testId ? `${testId}-panel` : undefined}
          style={styles.activePanel}
        >
          {renderStepContent(activeStepItem, activeStep)}
        </View>
      ) : null}

      {children}
    </View>
  );
}
