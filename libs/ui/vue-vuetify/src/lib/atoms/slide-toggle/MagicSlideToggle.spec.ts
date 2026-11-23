import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createMagicVuetify } from '../../vuetify';
import MagicSlideToggle from './MagicSlideToggle.vue';

function mountSlideToggle(
  props: InstanceType<typeof MagicSlideToggle>['$props'] = {},
) {
  return mount(MagicSlideToggle, {
    props,
    global: {
      plugins: [createMagicVuetify()],
    },
  });
}

describe('MagicSlideToggle', () => {
  it('renders switch with label and emits update:modelValue and change', async () => {
    const wrapper = mountSlideToggle({
      label: 'Enable Notifications',
      id: 'notif-switch',
      testId: 'notif-toggle',
      name: 'notifications',
      required: true,
    });

    expect(wrapper.text()).toContain('Enable Notifications');
    const input = wrapper.find('input[type="checkbox"]');
    await input.setValue(true);

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
    expect(wrapper.emitted('change')?.[0]).toEqual([true]);
  });

  it('supports hideIcon, labelPosition before, and controlled checked updates', async () => {
    const wrapper = mountSlideToggle({
      label: 'Dark Mode',
      checked: false,
      hideIcon: true,
      labelPosition: 'before',
      color: 'tertiary',
      size: 'sm',
      disableRipple: true,
    });

    expect(wrapper.classes()).toContain('magic-switch--label-before');
    await wrapper.setProps({ checked: true });
    expect(
      (wrapper.find('input[type="checkbox"]').element as HTMLInputElement)
        .checked,
    ).toBe(true);
  });

  it('blocks toggle when disabledInteractive is enabled', async () => {
    const wrapper = mountSlideToggle({
      label: 'Locked Setting',
      checked: true,
      disabled: true,
      disabledInteractive: true,
    });

    await wrapper.find('input[type="checkbox"]').setValue(false);
    expect(wrapper.emitted('change')).toBeUndefined();
  });
});
