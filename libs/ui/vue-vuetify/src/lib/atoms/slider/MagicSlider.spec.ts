import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createMagicVuetify } from '../../vuetify';
import MagicSlider from './MagicSlider.vue';

function mountSlider(props: InstanceType<typeof MagicSlider>['$props'] = {}) {
  return mount(MagicSlider, {
    props,
    global: {
      plugins: [createMagicVuetify()],
    },
  });
}

describe('MagicSlider', () => {
  it('renders single slider with discrete thumb label, tick marks, and displayWith formatter', () => {
    const wrapper = mountSlider({
      min: 0,
      max: 100,
      step: 10,
      value: 40,
      discrete: true,
      showTickMarks: true,
      displayWith: (v) => `${v}%`,
      testId: 'volume-slider',
      ariaLabel: 'Volume',
    });

    expect(wrapper.find('.v-slider').exists()).toBe(true);
    expect(wrapper.attributes('data-testid')).toBe('volume-slider');
    expect(wrapper.text()).toContain('40%');
  });

  it('emits update:modelValue and change on single slider update', async () => {
    const wrapper = mountSlider({
      min: 0,
      max: 100,
      step: 5,
      value: 20,
    });

    const vSlider = wrapper.findComponent({ name: 'VSlider' });
    await vSlider.vm.$emit('update:modelValue', 65);

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([65]);
    expect(wrapper.emitted('change')?.[0]).toEqual([65]);
  });

  it('renders range slider and emits tuple updates', async () => {
    const wrapper = mountSlider({
      range: true,
      min: 0,
      max: 100,
      startValue: 20,
      endValue: 80,
      discrete: true,
      color: 'secondary',
      size: 'lg',
    });

    expect(wrapper.find('.v-range-slider').exists()).toBe(true);
    const vRange = wrapper.findComponent({ name: 'VRangeSlider' });
    await vRange.vm.$emit('update:modelValue', [30, 70]);

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[30, 70]]);
    expect(wrapper.emitted('change')?.[0]).toEqual([[30, 70]]);
  });

  it('ignores updates when disabled and syncs controlled modelValue', async () => {
    const wrapper = mountSlider({
      modelValue: 50,
      disabled: true,
    });

    const vSlider = wrapper.findComponent({ name: 'VSlider' });
    await vSlider.vm.$emit('update:modelValue', 90);
    expect(wrapper.emitted('change')).toBeUndefined();

    await wrapper.setProps({ disabled: false, modelValue: 75 });
    expect(vSlider.props('modelValue')).toBe(75);
  });
});
