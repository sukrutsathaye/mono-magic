import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type { RadioOption } from '@mono-magic/atomic-design-interfaces';
import { createMagicVuetify } from '../../vuetify';
import MagicRadioButton from './MagicRadioButton.vue';

const PLAN_OPTIONS: readonly RadioOption<string>[] = [
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise', disabled: true },
];

function mountRadio(props: InstanceType<typeof MagicRadioButton>['$props']) {
  return mount(MagicRadioButton, {
    props,
    global: {
      plugins: [createMagicVuetify()],
    },
  });
}

describe('MagicRadioButton', () => {
  it('renders radio options and emits change on selection', async () => {
    const wrapper = mountRadio({
      options: PLAN_OPTIONS,
      name: 'plan',
      testId: 'plan-radio',
      ariaLabel: 'Select plan',
    });

    expect(wrapper.attributes('data-testid')).toBe('plan-radio');
    expect(wrapper.attributes('aria-label')).toBe('Select plan');

    const inputs = wrapper.findAll('input[type="radio"]');
    expect(inputs).toHaveLength(3);
    expect(inputs[2].attributes('disabled')).toBeDefined();

    await inputs[1].setValue(true);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['pro']);
    expect(wrapper.emitted('change')?.[0]).toEqual(['pro']);
  });

  it('supports horizontal inline layout, labelPosition before, and controlled value', async () => {
    const wrapper = mountRadio({
      options: PLAN_OPTIONS,
      value: 'starter',
      vertical: false,
      labelPosition: 'before',
      color: 'secondary',
      size: 'sm',
      disableRipple: true,
    });

    expect(wrapper.find('.v-selection-control-group--inline').exists()).toBe(
      true,
    );
    expect(wrapper.find('.magic-radio--label-before').exists()).toBe(true);

    await wrapper.setProps({ value: 'pro' });
    const inputs = wrapper.findAll('input[type="radio"]');
    expect((inputs[1].element as HTMLInputElement).checked).toBe(true);
  });

  it('respects disabledInteractive by preventing value changes while remaining focusable', async () => {
    const wrapper = mountRadio({
      options: PLAN_OPTIONS,
      value: 'starter',
      disabled: true,
      disabledInteractive: true,
    });

    expect(wrapper.attributes('aria-disabled')).toBe('true');
    await wrapper.findAll('input[type="radio"]')[1].setValue(true);
    expect(wrapper.emitted('change')).toBeUndefined();
  });
});
