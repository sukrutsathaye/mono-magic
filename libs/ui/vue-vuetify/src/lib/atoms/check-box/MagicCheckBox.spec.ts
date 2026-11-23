import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type { CheckBoxTask } from '@mono-magic/atomic-design-interfaces';
import { createMagicVuetify } from '../../vuetify';
import MagicCheckBox from './MagicCheckBox.vue';

function mountCheckBox(
  props: InstanceType<typeof MagicCheckBox>['$props'] = {},
) {
  return mount(MagicCheckBox, {
    props,
    global: {
      plugins: [createMagicVuetify()],
    },
  });
}

describe('MagicCheckBox', () => {
  it('renders single checkbox and emits update:modelValue and change on toggle', async () => {
    const wrapper = mountCheckBox({
      label: 'Accept Terms',
      id: 'terms-cb',
      testId: 'terms-checkbox',
      required: true,
      name: 'terms',
      checkboxValue: 'accepted',
    });

    const input = wrapper.find('input[type="checkbox"]');
    expect(input.exists()).toBe(true);
    expect(wrapper.text()).toContain('Accept Terms');

    await input.setValue(true);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
    expect(wrapper.emitted('change')?.[0]).toEqual([true]);
  });

  it('supports indeterminate, labelPosition before, and disabledInteractive', async () => {
    const wrapper = mountCheckBox({
      label: 'Select All',
      indeterminate: true,
      labelPosition: 'before',
      disabled: true,
      disabledInteractive: true,
      disableRipple: true,
      color: 'success',
      size: 'sm',
    });

    expect(wrapper.classes()).toContain('magic-checkbox--label-before');
    await wrapper.find('input[type="checkbox"]').setValue(true);
    expect(wrapper.emitted('change')).toBeUndefined();
  });

  it('supports nested tasks with parent indeterminate state and cascade toggle', async () => {
    const tasks: CheckBoxTask[] = [
      { id: 't1', name: 'Lint', checked: true },
      {
        id: 't2',
        name: 'Tests',
        checked: false,
        subtasks: [
          { id: 's1', name: 'Unit tests', checked: true },
          { id: 's2', name: 'E2E tests', checked: false },
        ],
      },
    ];

    const wrapper = mountCheckBox({
      label: 'Release Checklist',
      tasks,
      testId: 'checklist',
    });

    expect(wrapper.attributes('data-testid')).toBe('checklist');
    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    // Parent + Lint + Tests + Unit tests + E2E tests = 5
    expect(checkboxes).toHaveLength(5);

    // Toggle parent to check all
    await checkboxes[0].setValue(true);
    const updatedTasks = wrapper.emitted('update:tasks')?.[0]?.[0] as CheckBoxTask[];
    expect(updatedTasks[0].checked).toBe(true);
    expect(updatedTasks[1].checked).toBe(true);
    expect(updatedTasks[1].subtasks?.every((s) => s.checked)).toBe(true);

    // Toggle subtask s2 off -> parent becomes indeterminate
    await checkboxes[4].setValue(false);
    const afterSub = wrapper.emitted('update:tasks')?.[1]?.[0] as CheckBoxTask[];
    expect(afterSub[1].checked).toBe(false);
    expect(afterSub[1].subtasks?.[1].checked).toBe(false);

    // Toggle task t1 off
    await checkboxes[1].setValue(false);
    const afterTask = wrapper.emitted('update:tasks')?.[2]?.[0] as CheckBoxTask[];
    expect(afterTask[0].checked).toBe(false);
  });

  it('respects controlled checked prop updates', async () => {
    const wrapper = mountCheckBox({
      label: 'Controlled',
      checked: false,
    });

    await wrapper.setProps({ checked: true });
    expect(
      (wrapper.find('input[type="checkbox"]').element as HTMLInputElement).checked,
    ).toBe(true);
  });
});
