<script lang="ts">
  import { Checkbox } from 'bits-ui';
  import type {
    AtomicSize,
    CheckBoxAtomProps,
    CheckBoxTask,
    ColorIntent,
  } from '@mono-magic/atomic-design-interfaces';
  import { cn, getColorIntentClasses } from '../../theme';

  export interface MagicCheckBoxProps extends CheckBoxAtomProps {
    onchange?: (checked: boolean) => void;
    ontaskschange?: (tasks: readonly CheckBoxTask[]) => void;
  }

  let {
    id,
    testId = 'magic-check-box',
    ariaLabel,
    disabled = false,
    label = '',
    checked = $bindable(false),
    indeterminate = $bindable(false),
    required = false,
    labelPosition = 'after',
    disableRipple = false,
    disabledInteractive = false,
    color = 'primary',
    size = 'md',
    name,
    checkboxValue,
    tasks,
    onchange,
    ontaskschange,
  }: MagicCheckBoxProps = $props();

  const BOX_SIZE_CLASSES: Readonly<Record<AtomicSize, string>> = {
    xs: 'h-3.5 w-3.5 text-[10px]',
    sm: 'h-4 w-4 text-xs',
    md: 'h-5 w-5 text-xs',
    lg: 'h-6 w-6 text-sm',
    xl: 'h-7 w-7 text-base',
  };

  const LABEL_SIZE_CLASSES: Readonly<Record<AtomicSize, string>> = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const colorClasses = $derived(getColorIntentClasses(color as ColorIntent));
  const boxSizeClass = $derived(BOX_SIZE_CLASSES[size as AtomicSize]);
  const labelSizeClass = $derived(LABEL_SIZE_CLASSES[size as AtomicSize]);

  let internalTasks = $state<CheckBoxTask[]>([]);

  $effect(() => {
    if (tasks) {
      internalTasks = tasks.map((task) => ({
        ...task,
        subtasks: task.subtasks ? task.subtasks.map((sub) => ({ ...sub })) : undefined,
      }));
    } else {
      internalTasks = [];
    }
  });

  const hasTasks = $derived(internalTasks.length > 0);

  function computeTaskChecked(task: CheckBoxTask): boolean {
    if (task.subtasks && task.subtasks.length > 0) {
      return task.subtasks.every((sub) => Boolean(sub.checked));
    }
    return Boolean(task.checked);
  }

  function computeTaskIndeterminate(task: CheckBoxTask): boolean {
    if (task.subtasks && task.subtasks.length > 0) {
      const checkedCount = task.subtasks.filter((sub) => Boolean(sub.checked)).length;
      return checkedCount > 0 && checkedCount < task.subtasks.length;
    }
    return false;
  }

  const rootChecked = $derived(
    hasTasks ? internalTasks.every((task) => computeTaskChecked(task)) : checked,
  );

  const rootIndeterminate = $derived(
    hasTasks
      ? !rootChecked &&
          internalTasks.some(
            (task) => computeTaskChecked(task) || computeTaskIndeterminate(task),
          )
      : indeterminate,
  );

  function handleRootChange(nextChecked: boolean): void {
    if (disabled) return;
    checked = nextChecked;
    indeterminate = false;

    if (hasTasks) {
      const updated = internalTasks.map((task) =>
        task.disabled
          ? task
          : {
              ...task,
              checked: nextChecked,
              subtasks: task.subtasks?.map((sub) =>
                sub.disabled ? sub : { ...sub, checked: nextChecked },
              ),
            },
      );
      internalTasks = updated;
      ontaskschange?.(updated);
    }

    onchange?.(nextChecked);
  }

  function handleTaskToggle(taskIndex: number, nextChecked: boolean): void {
    if (disabled) return;
    const updated = internalTasks.map((task, idx) => {
      if (idx !== taskIndex || task.disabled) return task;
      return {
        ...task,
        checked: nextChecked,
        subtasks: task.subtasks?.map((sub) =>
          sub.disabled ? sub : { ...sub, checked: nextChecked },
        ),
      };
    });
    internalTasks = updated;
    const allChecked = updated.every((task) => computeTaskChecked(task));
    checked = allChecked;
    indeterminate =
      !allChecked &&
      updated.some((task) => computeTaskChecked(task) || computeTaskIndeterminate(task));
    ontaskschange?.(updated);
    onchange?.(allChecked);
  }

  function handleSubtaskToggle(
    taskIndex: number,
    subIndex: number,
    nextChecked: boolean,
  ): void {
    if (disabled) return;
    const updated = internalTasks.map((task, idx) => {
      if (idx !== taskIndex || !task.subtasks) return task;
      const nextSubtasks = task.subtasks.map((sub, sIdx) =>
        sIdx === subIndex && !sub.disabled ? { ...sub, checked: nextChecked } : sub,
      );
      return {
        ...task,
        checked: nextSubtasks.every((sub) => Boolean(sub.checked)),
        subtasks: nextSubtasks,
      };
    });
    internalTasks = updated;
    const allChecked = updated.every((task) => computeTaskChecked(task));
    checked = allChecked;
    indeterminate =
      !allChecked &&
      updated.some((task) => computeTaskChecked(task) || computeTaskIndeterminate(task));
    ontaskschange?.(updated);
    onchange?.(allChecked);
  }
</script>

<div
  data-testid={testId}
  data-label-position={labelPosition}
  data-disable-ripple={disableRipple ? 'true' : undefined}
  class="inline-flex flex-col gap-2"
>
  <label
    class={cn(
      'inline-flex items-center gap-2 select-none',
      labelPosition === 'before' && 'flex-row-reverse justify-end',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    )}
  >
    <Checkbox.Root
      {id}
      checked={rootChecked}
      indeterminate={rootIndeterminate}
      onCheckedChange={handleRootChange}
      disabled={disabled && !disabledInteractive}
      readonly={disabled && disabledInteractive}
      {required}
      {name}
      value={checkboxValue}
      aria-label={ariaLabel ?? (label || 'Checkbox')}
      data-testid={`${testId}-control`}
      class={cn(
        'inline-flex items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        boxSizeClass,
        colorClasses.ring,
        rootChecked || rootIndeterminate
          ? cn(colorClasses.solid, 'border-transparent')
          : 'border-slate-400 bg-white',
      )}
    >
      {#snippet children({ checked: isChecked, indeterminate: isIndet })}
        {#if isIndet}
          <span aria-hidden="true" data-testid={`${testId}-indeterminate`}>−</span>
        {:else if isChecked}
          <span aria-hidden="true" data-testid={`${testId}-checked`}>✓</span>
        {/if}
      {/snippet}
    </Checkbox.Root>

    {#if label}
      <span class={cn('font-medium text-slate-800', labelSizeClass)}>
        {label}{#if required}<span class="ml-0.5 text-magic-error" aria-hidden="true">*</span>{/if}
      </span>
    {/if}
  </label>

  {#if hasTasks}
    <ul class="ml-6 flex flex-col gap-1.5" data-testid={`${testId}-tasks`}>
      {#each internalTasks as task, taskIndex (task.id ?? `${task.name}-${taskIndex}`)}
        {@const taskChecked = computeTaskChecked(task)}
        {@const taskIndet = computeTaskIndeterminate(task)}
        {@const taskDisabled = Boolean(disabled || task.disabled)}
        <li class="flex flex-col gap-1">
          <label
            class={cn(
              'inline-flex items-center gap-2 select-none',
              taskDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            )}
          >
            <Checkbox.Root
              checked={taskChecked}
              indeterminate={taskIndet}
              onCheckedChange={(next) => handleTaskToggle(taskIndex, next)}
              disabled={taskDisabled && !disabledInteractive}
              aria-label={task.name}
              data-testid={`${testId}-task-${taskIndex}`}
              class={cn(
                'inline-flex items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                boxSizeClass,
                colorClasses.ring,
                taskChecked || taskIndet
                  ? cn(colorClasses.solid, 'border-transparent')
                  : 'border-slate-400 bg-white',
              )}
            >
              {#snippet children({ checked: c, indeterminate: ind })}
                {#if ind}
                  <span aria-hidden="true">−</span>
                {:else if c}
                  <span aria-hidden="true">✓</span>
                {/if}
              {/snippet}
            </Checkbox.Root>
            <span class={cn('text-slate-700', labelSizeClass)}>{task.name}</span>
          </label>

          {#if task.subtasks && task.subtasks.length > 0}
            <ul class="ml-6 flex flex-col gap-1">
              {#each task.subtasks as subtask, subIndex (subtask.id ?? `${subtask.name}-${subIndex}`)}
                {@const subDisabled = Boolean(taskDisabled || subtask.disabled)}
                <li>
                  <label
                    class={cn(
                      'inline-flex items-center gap-2 select-none',
                      subDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                    )}
                  >
                    <Checkbox.Root
                      checked={Boolean(subtask.checked)}
                      onCheckedChange={(next) =>
                        handleSubtaskToggle(taskIndex, subIndex, next)}
                      disabled={subDisabled && !disabledInteractive}
                      aria-label={subtask.name}
                      data-testid={`${testId}-task-${taskIndex}-sub-${subIndex}`}
                      class={cn(
                        'inline-flex items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                        boxSizeClass,
                        colorClasses.ring,
                        subtask.checked
                          ? cn(colorClasses.solid, 'border-transparent')
                          : 'border-slate-400 bg-white',
                      )}
                    >
                      {#snippet children({ checked: sc })}
                        {#if sc}
                          <span aria-hidden="true">✓</span>
                        {/if}
                      {/snippet}
                    </Checkbox.Root>
                    <span class={cn('text-slate-600', labelSizeClass)}>{subtask.name}</span>
                  </label>
                </li>
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>
