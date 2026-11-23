<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type {
  CheckBoxAtomProps,
  CheckBoxTask,
} from '@mono-magic/atomic-design-interfaces';
import {
  mapAtomicSizeToDensity,
  mapColorIntentToVuetify,
} from '../../theme';

export interface MagicCheckBoxProps extends CheckBoxAtomProps {
  /** Vue v-model binding alias for `checked`. */
  modelValue?: boolean;
}

const props = withDefaults(defineProps<MagicCheckBoxProps>(), {
  label: undefined,
  checked: undefined,
  modelValue: undefined,
  indeterminate: false,
  required: false,
  labelPosition: 'after',
  disableRipple: false,
  disabled: false,
  disabledInteractive: false,
  color: 'primary',
  size: 'md',
  name: undefined,
  checkboxValue: undefined,
  tasks: undefined,
  id: undefined,
  testId: undefined,
  ariaLabel: undefined,
});

const emit = defineEmits<{
  'update:modelValue': [checked: boolean];
  change: [checked: boolean];
  'update:tasks': [tasks: CheckBoxTask[]];
}>();

function cloneTasks(list: readonly CheckBoxTask[] | undefined): CheckBoxTask[] {
  if (!list) {
    return [];
  }
  return list.map((task) => ({
    ...task,
    checked: Boolean(task.checked),
    subtasks: task.subtasks ? cloneTasks(task.subtasks) : undefined,
  }));
}

const internalChecked = ref<boolean>(
  Boolean(props.modelValue ?? props.checked ?? false),
);
const internalTasks = ref<CheckBoxTask[]>(cloneTasks(props.tasks));

watch(
  () => props.modelValue ?? props.checked,
  (next) => {
    if (next !== undefined) {
      internalChecked.value = next;
    }
  },
);

watch(
  () => props.tasks,
  (next) => {
    internalTasks.value = cloneTasks(next);
  },
  { deep: true },
);

const isTaskTree = computed(
  () => Array.isArray(props.tasks) && props.tasks.length > 0,
);
const isControlled = computed(
  () => props.modelValue !== undefined || props.checked !== undefined,
);

const singleChecked = computed<boolean>({
  get() {
    return isControlled.value
      ? Boolean(props.modelValue ?? props.checked)
      : internalChecked.value;
  },
  set(next) {
    if (props.disabled) {
      return;
    }
    internalChecked.value = next;
    emit('update:modelValue', next);
    emit('change', next);
  },
});

function flattenLeaves(list: readonly CheckBoxTask[]): CheckBoxTask[] {
  const leaves: CheckBoxTask[] = [];
  for (const task of list) {
    if (task.subtasks && task.subtasks.length > 0) {
      leaves.push(...flattenLeaves(task.subtasks));
    } else {
      leaves.push(task);
    }
  }
  return leaves;
}

const allTasksChecked = computed(() => {
  const leaves = flattenLeaves(internalTasks.value);
  return leaves.length > 0 && leaves.every((leaf) => Boolean(leaf.checked));
});

const someTasksChecked = computed(() => {
  const leaves = flattenLeaves(internalTasks.value);
  const checkedCount = leaves.filter((leaf) => Boolean(leaf.checked)).length;
  return checkedCount > 0 && checkedCount < leaves.length;
});

function setTreeChecked(
  list: readonly CheckBoxTask[],
  checked: boolean,
): CheckBoxTask[] {
  return list.map((task) => {
    if (task.disabled) {
      return { ...task };
    }
    const subtasks = task.subtasks
      ? setTreeChecked(task.subtasks, checked)
      : undefined;
    return {
      ...task,
      checked,
      subtasks,
    };
  });
}

function toggleAllTasks(next: boolean | null): void {
  if (props.disabled) {
    return;
  }
  const checked = Boolean(next);
  internalTasks.value = setTreeChecked(internalTasks.value, checked);
  emit('update:tasks', cloneTasks(internalTasks.value));
  emit('update:modelValue', checked);
  emit('change', checked);
}

function toggleTask(taskIndex: number, next: boolean | null): void {
  if (props.disabled) {
    return;
  }
  const checked = Boolean(next);
  const updated = cloneTasks(internalTasks.value);
  const target = updated[taskIndex];
  if (!target || target.disabled) {
    return;
  }
  target.checked = checked;
  if (target.subtasks && target.subtasks.length > 0) {
    target.subtasks = setTreeChecked(target.subtasks, checked);
  }
  internalTasks.value = updated;
  emit('update:tasks', cloneTasks(updated));
  emit('change', allTasksChecked.value);
}

function toggleSubtask(
  taskIndex: number,
  subIndex: number,
  next: boolean | null,
): void {
  if (props.disabled) {
    return;
  }
  const checked = Boolean(next);
  const updated = cloneTasks(internalTasks.value);
  const parent = updated[taskIndex];
  const sub = parent?.subtasks?.[subIndex];
  if (!parent || !sub || sub.disabled) {
    return;
  }
  sub.checked = checked;
  parent.checked = parent.subtasks!.every((item) => Boolean(item.checked));
  internalTasks.value = updated;
  emit('update:tasks', cloneTasks(updated));
  emit('change', allTasksChecked.value);
}

function isTaskIndeterminate(task: CheckBoxTask): boolean {
  if (!task.subtasks || task.subtasks.length === 0) {
    return false;
  }
  const count = task.subtasks.filter((sub) => Boolean(sub.checked)).length;
  return count > 0 && count < task.subtasks.length;
}

const vuetifyColor = computed(() => mapColorIntentToVuetify(props.color));
const vuetifyDensity = computed(() => mapAtomicSizeToDensity(props.size));
const nativeDisabled = computed(
  () => props.disabled && !props.disabledInteractive,
);
const ariaDisabled = computed(() =>
  props.disabled && props.disabledInteractive ? 'true' : undefined,
);
const labelBeforeClass = computed(() =>
  props.labelPosition === 'before' ? 'magic-checkbox--label-before' : '',
);
</script>

<template>
  <div
    v-if="isTaskTree"
    :id="id"
    :data-testid="testId"
    :aria-label="ariaLabel ?? label"
    class="magic-checkbox-tree"
    :class="labelBeforeClass"
  >
    <v-checkbox
      :model-value="allTasksChecked"
      :indeterminate="someTasksChecked"
      :label="label ?? 'All tasks'"
      :color="vuetifyColor"
      :density="vuetifyDensity"
      :disabled="nativeDisabled"
      :aria-disabled="ariaDisabled"
      :ripple="!disableRipple"
      hide-details
      @update:model-value="toggleAllTasks"
    />
    <div class="pl-6">
      <div
        v-for="(task, taskIdx) in internalTasks"
        :key="task.id ?? task.name"
      >
        <v-checkbox
          :model-value="Boolean(task.checked)"
          :indeterminate="isTaskIndeterminate(task)"
          :label="task.name"
          :color="vuetifyColor"
          :density="vuetifyDensity"
          :disabled="nativeDisabled || Boolean(task.disabled)"
          :ripple="!disableRipple"
          hide-details
          @update:model-value="toggleTask(taskIdx, $event)"
        />
        <div v-if="task.subtasks && task.subtasks.length > 0" class="pl-6">
          <v-checkbox
            v-for="(sub, subIdx) in task.subtasks"
            :key="sub.id ?? sub.name"
            :model-value="Boolean(sub.checked)"
            :label="sub.name"
            :color="vuetifyColor"
            :density="vuetifyDensity"
            :disabled="nativeDisabled || Boolean(sub.disabled)"
            :ripple="!disableRipple"
            hide-details
            @update:model-value="toggleSubtask(taskIdx, subIdx, $event)"
          />
        </div>
      </div>
    </div>
  </div>

  <v-checkbox
    v-else
    :id="id"
    v-model="singleChecked"
    :data-testid="testId"
    :label="label"
    :indeterminate="indeterminate"
    :required="required"
    :name="name"
    :true-value="true"
    :false-value="false"
    :data-value="checkboxValue"
    :color="vuetifyColor"
    :density="vuetifyDensity"
    :disabled="nativeDisabled"
    :readonly="disabled && disabledInteractive"
    :aria-disabled="ariaDisabled"
    :aria-label="ariaLabel ?? label"
    :ripple="!disableRipple"
    hide-details
    :class="[labelBeforeClass, { 'opacity-60': disabled && disabledInteractive }]"
  />
</template>

<style scoped>
.magic-checkbox--label-before :deep(.v-selection-control) {
  flex-direction: row-reverse;
  justify-content: flex-end;
}
</style>
