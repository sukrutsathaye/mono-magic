import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type { ButtonToggleOption } from '@mono-magic/atomic-design-interfaces';
import { createMagicVuetify } from '../../vuetify';
import MagicButtonToggle from './MagicButtonToggle.vue';

const ALIGN_OPTIONS: readonly ButtonToggleOption<string>[] = [
  { value: 'left', label: 'Left', icon: 'format-align-left' },
  { value: 'center', label: 'Center', icon: 'format-align-center' },
  { value: 'right', label: 'Right', icon: 'format-align-right' },
];

function mountToggle(props: InstanceType<typeof MagicButtonToggle>['$props']) {
  return mount(MagicButtonToggle, {
    props,
    global: {
      plugins: [createMagicVuetify()],
    },
  });
}

describe('MagicButtonToggle', () => {
  it('renders all options and emits change on single selection', async () => {
    const wrapper = mountToggle({
      options: ALIGN_OPTIONS,
      testId: 'align-toggle',
      ariaLabel: 'Text alignment',
    });

    expect(wrapper.attributes('data-testid')).toBe('align-toggle');
    expect(wrapper.attributes('aria-label')).toBe('Text alignment');
    const buttons = wrapper.findAll('button');
    expect(buttons).toHaveLength(3);

    await buttons[1].trigger('click');
    expect(wrapper.emitted('change')?.[0]).toEqual(['center']);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['center']);
  });

  it('supports multiple selection mode', async () => {
    const wrapper = mountToggle({
      options: ALIGN_OPTIONS,
      selectionMode: 'multiple',
      color: 'secondary',
    });

    const buttons = wrapper.findAll('button');
    await buttons[0].trigger('click');
    await buttons[2].trigger('click');

    const changes = wrapper.emitted('change');
    expect(changes?.[0]).toEqual([['left']]);
    expect(changes?.[1]).toEqual([['left', 'right']]);
  });

  it('supports vertical layout, legacy appearance, and hideSelectionIndicator', () => {
    const wrapper = mountToggle({
      options: ALIGN_OPTIONS,
      value: 'left',
      vertical: true,
      appearance: 'legacy',
      hideSelectionIndicator: true,
      required: true,
    });

    expect(wrapper.classes()).toContain('flex-column');
    expect(wrapper.find('.mdi-check').exists()).toBe(false);
  });

  it('respects disabled and disabledInteractive states', async () => {
    const wrapper = mountToggle({
      options: ALIGN_OPTIONS,
      value: 'left',
      disabled: true,
      disabledInteractive: true,
    });

    expect(wrapper.attributes('aria-disabled')).toBe('true');
    await wrapper.findAll('button')[1].trigger('click');
    expect(wrapper.emitted('change')).toBeUndefined();
  });

  it('updates when controlled modelValue prop changes', async () => {
    const wrapper = mountToggle({
      options: ALIGN_OPTIONS,
      modelValue: 'left',
    });

    await wrapper.setProps({ modelValue: 'right' });
    expect(wrapper.findAll('button')[2].classes()).toContain('v-btn--active');
  });
});
