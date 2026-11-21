import {
  type ChangeEvent,
  type FocusEventHandler,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import Box from '@mui/material/Box';
import MuiCheckbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import type {
  AtomicSize,
  CheckBoxAtomProps,
  CheckBoxLabelPosition,
  CheckBoxTask,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { useControllableState } from '../../core/use-controllable-state';
import {
  MAGIC_SIZE_METRICS,
  resolveMagicIntentColors,
} from '../../theme/mui-theme';

export type { CheckBoxLabelPosition, CheckBoxTask };

/**
 * Props for {@link MagicCheckBox}, extending {@link CheckBoxAtomProps} with React 19 / MUI v9
 * ergonomics (`defaultChecked`, `children`, `onChange`, `onIndeterminateChange`,
 * `onTasksChange`, `onBlur`, `sx`, `className`, and direct `ref` prop).
 */
export interface MagicCheckBoxProps extends CheckBoxAtomProps {
  /** Initial checked state when used in uncontrolled single-checkbox mode. Defaults to `false`. */
  defaultChecked?: boolean;
  /** Initial tasks array when used in uncontrolled hierarchical tasks mode. */
  defaultTasks?: readonly CheckBoxTask[];
  /** Rich React label content; takes precedence over `label` in single-checkbox mode. */
  children?: ReactNode;
  /** Called whenever the checked boolean toggles in single mode or when a parent task toggles. */
  onChange?: (checked: boolean) => void;
  /** Called whenever the indeterminate state transitions (e.g. cleared to `false` on user click). */
  onIndeterminateChange?: (indeterminate: boolean) => void;
  /** Called with the immutably updated task list when any parent task or subtask is toggled. */
  onTasksChange?: (tasks: CheckBoxTask[]) => void;
  /** Native blur event handler forwarded from the checkbox input. */
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  /** Optional MUI `sx` overrides. */
  sx?: SxProps<Theme>;
  /** Optional CSS class name. */
  className?: string;
  /** React 19 ref forwarded to the root container element (`<div>`). */
  ref?: Ref<HTMLDivElement>;
}

const MUI_CHECKBOX_SIZE_MAP: Record<AtomicSize, 'small' | 'medium' | 'large'> =
  {
    xs: 'small',
    sm: 'small',
    md: 'medium',
    lg: 'large',
    xl: 'large',
  };

/**
 * Returns `true` when all subtasks of `task` are checked (or `task.checked` if no subtasks exist).
 */
export function allComplete(task: CheckBoxTask): boolean {
  if (!task.subtasks || task.subtasks.length === 0) {
    return Boolean(task.checked);
  }
  return task.subtasks.every((sub) => Boolean(sub.checked));
}

/**
 * Returns `true` when some, but not all, subtasks of `task` are checked.
 */
export function someComplete(task: CheckBoxTask): boolean {
  if (!task.subtasks || task.subtasks.length === 0) {
    return false;
  }
  const hasSome = task.subtasks.some((sub) => Boolean(sub.checked));
  return hasSome && !allComplete(task);
}

/**
 * Material 3 checkbox atom supporting both single controllable checkbox mode and
 * immutable hierarchical `tasks` / `subtasks` checklist mode.
 *
 * - **Single mode**: Controllable `checked` (`useControllableState`), `indeterminate`,
 *   `required` marker, `labelPosition` (`'before'` | `'after'`), `disabledInteractive`
 *   (`aria-disabled="true"`), all 5 `AtomicSize` tokens, and all 7 `ColorIntent` tokens.
 * - **Tasks mode**: Computes parent `allComplete(task)` and `someComplete(task)` (indeterminate)
 *   from subtasks, toggles all non-disabled subtasks when clicking a parent task, and
 *   updates parent completion when clicking a subtask.
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
  onBlur,
  children,
  sx,
  className,
  ref,
}: MagicCheckBoxProps) {
  const theme = useTheme();
  const metrics = MAGIC_SIZE_METRICS[size];
  const intent = resolveMagicIntentColors(theme, color);
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];

  const [currentChecked, setCurrentChecked] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    onChange,
  });

  const [currentTasks, setCurrentTasks] = useControllableState<CheckBoxTask[]>({
    value: tasks ? [...tasks] : undefined,
    defaultValue: defaultTasks ? [...defaultTasks] : [],
    onChange: onTasksChange,
  });

  const isNativeDisabled = disabled && !disabledInteractive;
  const isAriaDisabled = (disabled && disabledInteractive) || undefined;
  const labelPlacement = labelPosition === 'before' ? 'start' : 'end';

  const checkboxColorSx = {
    color: theme.palette.text.secondary,
    '&.Mui-checked, &.MuiCheckbox-indeterminate': {
      color: intent.main,
    },
    '&.Mui-disabled, &[aria-disabled="true"]': {
      color: theme.palette.action.disabled,
      cursor: 'not-allowed',
    },
    '& .MuiSvgIcon-root': {
      fontSize: metrics.iconSize + 4,
    },
  };

  const handleBlockedClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleSingleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }
    const nextBool = event.target.checked;
    if (indeterminate) {
      onIndeterminateChange?.(false);
    }
    setCurrentChecked(nextBool);
  };

  const handleParentTaskToggle = (taskIndex: number) => {
    const targetTask = currentTasks[taskIndex];
    if (!targetTask || disabled || targetTask.disabled) {
      return;
    }
    const nextBool = !allComplete(targetTask);
    const updatedTasks: CheckBoxTask[] = currentTasks.map((task, idx) => {
      if (idx !== taskIndex) {
        return task;
      }
      if (!task.subtasks || task.subtasks.length === 0) {
        return { ...task, checked: nextBool };
      }
      const nextSubtasks = task.subtasks.map((sub) =>
        sub.disabled ? sub : { ...sub, checked: nextBool },
      );
      return {
        ...task,
        checked: nextSubtasks.every((sub) => Boolean(sub.checked)),
        subtasks: nextSubtasks,
      };
    });

    setCurrentTasks(updatedTasks);
    onChange?.(nextBool);
  };

  const handleSubtaskToggle = (taskIndex: number, subtaskIndex: number) => {
    const parentTask = currentTasks[taskIndex];
    const targetSub = parentTask?.subtasks?.[subtaskIndex];
    if (
      !parentTask ||
      !targetSub ||
      disabled ||
      parentTask.disabled ||
      targetSub.disabled
    ) {
      return;
    }
    const nextSubBool = !targetSub.checked;
    const updatedTasks: CheckBoxTask[] = currentTasks.map((task, idx) => {
      if (idx !== taskIndex) {
        return task;
      }
      const nextSubtasks = (task.subtasks ?? []).map((sub, sIdx) =>
        sIdx === subtaskIndex ? { ...sub, checked: nextSubBool } : sub,
      );
      const allChecked =
        nextSubtasks.length > 0 &&
        nextSubtasks.every((sub) => Boolean(sub.checked));
      return {
        ...task,
        checked: allChecked,
        subtasks: nextSubtasks,
      };
    });

    setCurrentTasks(updatedTasks);
  };

  if (currentTasks.length > 0) {
    return (
      <Box
        ref={ref}
        id={id}
        data-testid={testId}
        role="group"
        aria-label={ariaLabel ?? label}
        className={className}
        sx={[
          {
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          },
          ...extraSx,
        ]}
      >
        {currentTasks.map((task, taskIdx) => {
          const taskDisabled = disabled || Boolean(task.disabled);
          const taskNativeDisabled = taskDisabled && !disabledInteractive;
          const taskAriaDisabled =
            (taskDisabled && disabledInteractive) || undefined;
          const isTaskChecked = allComplete(task);
          const isTaskIndeterminate = someComplete(task);
          const taskLabelNode = (
            <Box
              component="span"
              sx={{ fontSize: metrics.fontSize, fontWeight: 500 }}
            >
              {task.name}
              {required ? ' *' : ''}
            </Box>
          );

          return (
            <Box
              key={task.id ?? `${task.name}-${taskIdx}`}
              sx={{ display: 'flex', flexDirection: 'column' }}
            >
              <FormControlLabel
                labelPlacement={labelPlacement}
                disabled={taskNativeDisabled}
                label={taskLabelNode}
                sx={{ m: 0, gap: 0.5 }}
                control={
                  <MuiCheckbox
                    color={color as ColorIntent}
                    size={MUI_CHECKBOX_SIZE_MAP[size]}
                    checked={isTaskChecked}
                    indeterminate={isTaskIndeterminate}
                    disabled={taskNativeDisabled}
                    disableRipple={disableRipple}
                    required={required}
                    aria-disabled={taskAriaDisabled}
                    slotProps={{
                      input: {
                        'aria-label': task.name,
                        ...(taskAriaDisabled
                          ? { 'aria-disabled': 'true' }
                          : {}),
                      },
                    }}
                    onClick={(e) => {
                      if (taskDisabled) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                    onChange={() => handleParentTaskToggle(taskIdx)}
                    onBlur={onBlur}
                    sx={checkboxColorSx}
                  />
                }
              />

              {task.subtasks && task.subtasks.length > 0 ? (
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    pl: 3.5,
                    m: 0,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {task.subtasks.map((subtask, subIdx) => {
                    const subDisabled =
                      taskDisabled || Boolean(subtask.disabled);
                    const subNativeDisabled =
                      subDisabled && !disabledInteractive;
                    const subAriaDisabled =
                      (subDisabled && disabledInteractive) || undefined;

                    return (
                      <Box
                        component="li"
                        key={subtask.id ?? `${subtask.name}-${subIdx}`}
                      >
                        <FormControlLabel
                          labelPlacement={labelPlacement}
                          disabled={subNativeDisabled}
                          label={
                            <Box
                              component="span"
                              sx={{ fontSize: metrics.fontSize }}
                            >
                              {subtask.name}
                            </Box>
                          }
                          sx={{ m: 0, gap: 0.5 }}
                          control={
                            <MuiCheckbox
                              color={color as ColorIntent}
                              size={MUI_CHECKBOX_SIZE_MAP[size]}
                              checked={Boolean(subtask.checked)}
                              disabled={subNativeDisabled}
                              disableRipple={disableRipple}
                              required={required}
                              aria-disabled={subAriaDisabled}
                              slotProps={{
                                input: {
                                  'aria-label': subtask.name,
                                  ...(subAriaDisabled
                                    ? { 'aria-disabled': 'true' }
                                    : {}),
                                },
                              }}
                              onClick={(e) => {
                                if (subDisabled) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }
                              }}
                              onChange={() =>
                                handleSubtaskToggle(taskIdx, subIdx)
                              }
                              onBlur={onBlur}
                              sx={checkboxColorSx}
                            />
                          }
                        />
                      </Box>
                    );
                  })}
                </Box>
              ) : null}
            </Box>
          );
        })}
      </Box>
    );
  }

  const labelContent = children ?? label;
  const resolvedAriaLabel =
    ariaLabel ?? (typeof label === 'string' && label.trim() ? label : 'Checkbox');

  const checkboxNode = (
    <MuiCheckbox
      id={id}
      color={color as ColorIntent}
      size={MUI_CHECKBOX_SIZE_MAP[size]}
      checked={currentChecked}
      indeterminate={indeterminate}
      disabled={isNativeDisabled}
      disableRipple={disableRipple}
      required={required}
      name={name}
      value={checkboxValue}
      aria-disabled={isAriaDisabled}
      slotProps={{
        input: {
          'aria-label': resolvedAriaLabel,
          ...(isAriaDisabled ? { 'aria-disabled': 'true' } : {}),
        },
      }}
      onClick={handleBlockedClick}
      onChange={handleSingleChange}
      onBlur={onBlur}
      sx={checkboxColorSx}
    />
  );

  return (
    <Box
      ref={ref}
      data-testid={testId}
      className={className}
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
        },
        ...extraSx,
      ]}
    >
      {labelContent !== undefined && labelContent !== null ? (
        <FormControlLabel
          labelPlacement={labelPlacement}
          disabled={isNativeDisabled}
          control={checkboxNode}
          label={
            <Box component="span" sx={{ fontSize: metrics.fontSize }}>
              {labelContent}
              {required ? (
                <Box
                  component="span"
                  aria-hidden="true"
                  sx={{ color: theme.palette.error.main, ml: 0.25 }}
                >
                  *
                </Box>
              ) : null}
            </Box>
          }
          sx={{
            m: 0,
            gap: 0.5,
            ...(isAriaDisabled
              ? {
                  color: theme.palette.action.disabled,
                  cursor: 'not-allowed',
                }
              : {}),
          }}
        />
      ) : (
        checkboxNode
      )}
    </Box>
  );
}
