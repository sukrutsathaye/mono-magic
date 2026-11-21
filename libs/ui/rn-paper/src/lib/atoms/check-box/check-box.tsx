import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme, type MD3Theme } from 'react-native-paper';
import type {
  AtomicSize,
  CheckBoxAtomProps,
  CheckBoxLabelPosition,
  CheckBoxTask,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicIcon } from '../../core/icon';
import { useControllableState } from '../../core/use-controllable-state';
import {
  resolveMagicPaperIntent,
  useMagicPaperColors,
} from '../../theme/paper-theme';

export type { CheckBoxTask };

export interface MagicCheckBoxProps extends CheckBoxAtomProps {
  /** Initial checked state when rendered in uncontrolled mode. */
  defaultChecked?: boolean;
  /** Initial task hierarchy when rendered in uncontrolled mode. */
  defaultTasks?: readonly CheckBoxTask[];
  /** Emits the updated checked boolean when the checkbox toggles. */
  onChange?: (checked: boolean) => void;
  /** Emits when the indeterminate state transitions (e.g. cleared on user toggle). */
  onIndeterminateChange?: (indeterminate: boolean) => void;
  /** Emits the updated immutable task hierarchy when any task or subtask toggles. */
  onTasksChange?: (tasks: CheckBoxTask[]) => void;
  /** Optional custom label content taking precedence over `label`. */
  children?: ReactNode;
  /** Optional style override applied to the root container. */
  style?: StyleProp<ViewStyle>;
}

interface CheckBoxSizeMetrics {
  boxSize: number;
  iconSize: number;
  fontSize: number;
  gap: number;
  borderRadius: number;
}

const CHECKBOX_SIZE_METRICS: Record<AtomicSize, CheckBoxSizeMetrics> = {
  xs: { boxSize: 16, iconSize: 12, fontSize: 12, gap: 6, borderRadius: 3 },
  sm: { boxSize: 18, iconSize: 14, fontSize: 13, gap: 8, borderRadius: 4 },
  md: { boxSize: 20, iconSize: 16, fontSize: 14, gap: 10, borderRadius: 4 },
  lg: { boxSize: 24, iconSize: 18, fontSize: 16, gap: 12, borderRadius: 5 },
  xl: { boxSize: 28, iconSize: 22, fontSize: 18, gap: 14, borderRadius: 6 },
};

const styles = StyleSheet.create({
  group: {
    gap: 8,
  },
  taskBlock: {
    gap: 6,
  },
  subtaskList: {
    paddingLeft: 28,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  label: {
    includeFontPadding: false,
  },
  requiredMark: {
    fontWeight: '600',
  },
});

interface SingleCheckBoxRowProps {
  id?: string;
  testId?: string;
  ariaLabel?: string;
  label?: string;
  children?: ReactNode;
  checked: boolean;
  indeterminate: boolean;
  required: boolean;
  labelPosition: CheckBoxLabelPosition;
  disableRipple: boolean;
  disabled: boolean;
  disabledInteractive: boolean;
  color: ColorIntent;
  size: AtomicSize;
  name?: string;
  checkboxValue?: string;
  style?: StyleProp<ViewStyle>;
  onToggle: (nextChecked: boolean) => void;
}

function SingleCheckBoxRow({
  id,
  testId,
  ariaLabel,
  label,
  children,
  checked,
  indeterminate,
  required,
  labelPosition,
  disableRipple,
  disabled,
  disabledInteractive,
  color,
  size,
  onToggle,
  style,
}: SingleCheckBoxRowProps) {
  const theme = useTheme<MD3Theme>();
  const { semantic } = useMagicPaperColors();
  const intent = resolveMagicPaperIntent(color, theme, semantic);
  const metrics = CHECKBOX_SIZE_METRICS[size];

  const isFilled = checked || indeterminate;
  const nativeDisabled = Boolean(disabled && !disabledInteractive);

  const boxBackgroundColor = disabled
    ? isFilled
      ? theme.colors.onSurfaceDisabled
      : 'transparent'
    : isFilled
      ? intent.main
      : 'transparent';

  const boxBorderColor = disabled
    ? theme.colors.onSurfaceDisabled
    : isFilled
      ? intent.main
      : theme.colors.onSurfaceVariant;

  const iconColor = disabled ? theme.colors.surface : intent.onMain;
  const labelColor = disabled
    ? theme.colors.onSurfaceDisabled
    : theme.colors.onSurface;

  const handlePress = useCallback(() => {
    if (disabled) {
      return;
    }
    const next = indeterminate ? true : !checked;
    onToggle(next);
  }, [checked, disabled, indeterminate, onToggle]);

  const resolvedAriaLabel =
    ariaLabel ||
    label ||
    (typeof children === 'string' ? children : 'Checkbox');

  const labelContent =
    children !== undefined ? children : label !== undefined ? label : null;

  const rowRef = useRef<View | null>(null);
  const ariaCheckedValue = indeterminate ? 'mixed' : checked ? 'true' : 'false';

  useEffect(() => {
    const el = rowRef.current as unknown as HTMLElement | null;
    if (!el || typeof el.setAttribute !== 'function') {
      return;
    }
    el.setAttribute('aria-checked', ariaCheckedValue);
    if (disabled) {
      el.setAttribute('aria-disabled', 'true');
      el.setAttribute('tabindex', disabledInteractive ? '0' : '-1');
    } else {
      el.removeAttribute('aria-disabled');
      el.setAttribute('tabindex', '0');
    }
  }, [ariaCheckedValue, disabled, disabledInteractive]);

  return (
    <Pressable
      ref={rowRef}
      nativeID={id}
      testID={testId}
      accessible
      accessibilityRole="checkbox"
      accessibilityLabel={resolvedAriaLabel}
      accessibilityState={{
        checked: indeterminate ? 'mixed' : checked,
        disabled,
      }}
      disabled={nativeDisabled}
      android_ripple={
        disableRipple || disabled
          ? undefined
          : { color: intent.container, borderless: false }
      }
      onPress={handlePress}
      style={[
        styles.row,
        labelPosition === 'before' ? styles.rowReverse : undefined,
        { gap: metrics.gap },
        style,
      ]}
    >
      <View
        testID={testId ? `${testId}-box` : undefined}
        style={[
          styles.box,
          {
            width: metrics.boxSize,
            height: metrics.boxSize,
            borderRadius: metrics.borderRadius,
            backgroundColor: boxBackgroundColor,
            borderColor: boxBorderColor,
          },
        ]}
      >
        {indeterminate ? (
          <MagicIcon
            icon="remove"
            size={metrics.iconSize}
            color={iconColor}
            testID={testId ? `${testId}-icon` : undefined}
          />
        ) : checked ? (
          <MagicIcon
            icon="check"
            size={metrics.iconSize}
            color={iconColor}
            testID={testId ? `${testId}-icon` : undefined}
          />
        ) : null}
      </View>

      {labelContent !== null ? (
        <Text
          style={[
            styles.label,
            {
              fontSize: metrics.fontSize,
              lineHeight: Math.round(metrics.fontSize * 1.35),
              color: labelColor,
            },
          ]}
        >
          {labelContent}
          {required ? (
            <Text
              style={[
                styles.requiredMark,
                {
                  color: disabled
                    ? theme.colors.onSurfaceDisabled
                    : theme.colors.error,
                },
              ]}
            >
              {' *'}
            </Text>
          ) : null}
        </Text>
      ) : null}
    </Pressable>
  );
}

function computeTaskStates(task: CheckBoxTask): {
  allComplete: boolean;
  someComplete: boolean;
} {
  const subtasks = task.subtasks;
  if (!subtasks || subtasks.length === 0) {
    return {
      allComplete: Boolean(task.checked),
      someComplete: false,
    };
  }
  const allComplete = subtasks.every((sub) => Boolean(sub.checked));
  const someChecked = subtasks.some((sub) => Boolean(sub.checked));
  return {
    allComplete,
    someComplete: someChecked && !allComplete,
  };
}

/**
 * Material 3 checkbox atom for React Native Paper supporting single controllable
 * checkboxes, indeterminate tri-state visuals, `labelPosition` (`before` | `after`),
 * `disabledInteractive`, and immutable parent/subtask checklists (`tasks`).
 */
export function MagicCheckBox({
  id,
  testId,
  ariaLabel,
  label,
  checked,
  defaultChecked = false,
  indeterminate = false,
  required = false,
  labelPosition = 'after',
  disableRipple = false,
  disabled = false,
  disabledInteractive = false,
  color = 'primary',
  size = 'md',
  name,
  checkboxValue,
  tasks,
  defaultTasks,
  onChange,
  onIndeterminateChange,
  onTasksChange,
  children,
  style,
}: MagicCheckBoxProps) {
  const [isChecked, setIsChecked] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    onChange,
  });

  const [taskList, setTaskList] = useControllableState<readonly CheckBoxTask[]>(
    {
      value: tasks,
      defaultValue: defaultTasks ?? [],
      onChange: (next) => onTasksChange?.([...next]),
    }
  );

  const handleSingleToggle = useCallback(
    (nextChecked: boolean) => {
      if (indeterminate) {
        onIndeterminateChange?.(false);
      }
      setIsChecked(nextChecked);
    },
    [indeterminate, onIndeterminateChange, setIsChecked]
  );

  const handleParentTaskToggle = useCallback(
    (taskIndex: number, nextChecked: boolean) => {
      const updated = taskList.map((task, idx): CheckBoxTask => {
        if (idx !== taskIndex) {
          return task;
        }
        const nextSubtasks = task.subtasks?.map((sub) =>
          sub.disabled ? sub : { ...sub, checked: nextChecked }
        );
        const allComplete =
          nextSubtasks && nextSubtasks.length > 0
            ? nextSubtasks.every((sub) => Boolean(sub.checked))
            : nextChecked;
        return {
          ...task,
          checked: allComplete,
          subtasks: nextSubtasks,
        };
      });
      setTaskList(updated);
      onChange?.(nextChecked);
    },
    [onChange, setTaskList, taskList]
  );

  const handleSubtaskToggle = useCallback(
    (taskIndex: number, subtaskIndex: number, nextChecked: boolean) => {
      const updated = taskList.map((task, idx): CheckBoxTask => {
        if (idx !== taskIndex) {
          return task;
        }
        const nextSubtasks = (task.subtasks ?? []).map((sub, sIdx) =>
          sIdx === subtaskIndex ? { ...sub, checked: nextChecked } : sub
        );
        const allComplete =
          nextSubtasks.length > 0 &&
          nextSubtasks.every((sub) => Boolean(sub.checked));
        return {
          ...task,
          checked: allComplete,
          subtasks: nextSubtasks,
        };
      });
      setTaskList(updated);
    },
    [setTaskList, taskList]
  );

  if (taskList && taskList.length > 0) {
    return (
      <View
        nativeID={id}
        testID={testId}
        accessibilityLabel={ariaLabel || label || 'Checkbox task group'}
        style={[styles.group, style]}
      >
        {taskList.map((task, taskIndex) => {
          const { allComplete, someComplete } = computeTaskStates(task);
          const taskDisabled = Boolean(disabled || task.disabled);
          const taskKey = task.id ?? `${task.name}-${taskIndex}`;
          const taskTestId = testId ? `${testId}-task-${taskIndex}` : undefined;

          return (
            <View key={taskKey} style={styles.taskBlock}>
              <SingleCheckBoxRow
                testId={taskTestId}
                ariaLabel={task.name}
                label={task.name}
                checked={allComplete}
                indeterminate={someComplete}
                required={required}
                labelPosition={labelPosition}
                disableRipple={disableRipple}
                disabled={taskDisabled}
                disabledInteractive={disabledInteractive}
                color={color}
                size={size}
                onToggle={(next) => handleParentTaskToggle(taskIndex, next)}
              />
              {task.subtasks && task.subtasks.length > 0 ? (
                <View style={styles.subtaskList}>
                  {task.subtasks.map((subtask, subIndex) => {
                    const subDisabled = Boolean(
                      taskDisabled || subtask.disabled
                    );
                    const subKey =
                      subtask.id ?? `${subtask.name}-${taskIndex}-${subIndex}`;
                    const subTestId = testId
                      ? `${testId}-subtask-${taskIndex}-${subIndex}`
                      : undefined;

                    return (
                      <SingleCheckBoxRow
                        key={subKey}
                        testId={subTestId}
                        ariaLabel={subtask.name}
                        label={subtask.name}
                        checked={Boolean(subtask.checked)}
                        indeterminate={false}
                        required={required}
                        labelPosition={labelPosition}
                        disableRipple={disableRipple}
                        disabled={subDisabled}
                        disabledInteractive={disabledInteractive}
                        color={color}
                        size={size}
                        onToggle={(next) =>
                          handleSubtaskToggle(taskIndex, subIndex, next)
                        }
                      />
                    );
                  })}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <SingleCheckBoxRow
      id={id}
      testId={testId}
      ariaLabel={ariaLabel}
      label={label}
      children={children}
      checked={isChecked}
      indeterminate={indeterminate}
      required={required}
      labelPosition={labelPosition}
      disableRipple={disableRipple}
      disabled={disabled}
      disabledInteractive={disabledInteractive}
      color={color}
      size={size}
      name={name}
      checkboxValue={checkboxValue}
      style={style}
      onToggle={handleSingleToggle}
    />
  );
}
