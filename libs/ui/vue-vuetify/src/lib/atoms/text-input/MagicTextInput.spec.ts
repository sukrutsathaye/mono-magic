import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type {
  AtomicSize,
  TextInputVariant,
} from '@mono-magic/atomic-design-interfaces';
import { createMagicVuetify } from '../../vuetify';
import MagicTextInput from './MagicTextInput.vue';

function mountTextInput(
  props: InstanceType<typeof MagicTextInput>['$props'],
) {
  return mount(MagicTextInput, {
    props,
    global: {
      plugins: [createMagicVuetify()],
    },
  });
}

describe('MagicTextInput', () => {
  it('renders label, helperText, placeholder, and emits input/change/submit', async () => {
    const wrapper = mountTextInput({
      id: 'email-field',
      testId: 'magic-email',
      label: 'Email address',
      placeholder: 'you@magic.dev',
      helperText: 'Work email required',
      type: 'email',
      name: 'email',
      autocomplete: 'email',
      required: true,
    });

    const input = wrapper.find('input');
    expect(input.attributes('id')).toBe('email-field');
    expect(input.attributes('type')).toBe('email');
    expect(input.attributes('name')).toBe('email');
    expect(input.attributes('placeholder')).toBe('you@magic.dev');
    expect(wrapper.text()).toContain('Email address *');
    expect(wrapper.text()).toContain('Work email required');

    await input.setValue('dev@magic.dev');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['dev@magic.dev']);
    expect(wrapper.emitted('input')?.[0]).toEqual(['dev@magic.dev']);
    expect(wrapper.emitted('change')?.[0]).toEqual(['dev@magic.dev']);

    await input.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('submit')?.[0]).toEqual(['dev@magic.dev']);
  });

  it('displays errorText and aria-invalid when in error state', () => {
    const wrapper = mountTextInput({
      label: 'Username',
      value: 'ab',
      errorText: 'Must be at least 3 characters',
      minLength: 3,
      maxLength: 20,
      ariaLabel: 'Username input',
    });

    const input = wrapper.find('input');
    expect(input.attributes('aria-invalid')).toBe('true');
    expect(wrapper.text()).toContain('Must be at least 3 characters');
  });

  it('supports variants, sizes, clearable, and focus/blur events', async () => {
    const variants: TextInputVariant[] = ['outlined', 'filled'];
    const sizes: AtomicSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

    for (const variant of variants) {
      const w = mountTextInput({
        label: variant,
        variant,
        testId: `input-${variant}`,
      });
      expect(w.attributes('data-variant')).toBe(variant);
    }

    for (const size of sizes) {
      const w = mountTextInput({
        label: size,
        size,
        testId: `input-${size}`,
      });
      expect(w.attributes('data-size')).toBe(size);
    }

    const wrapper = mountTextInput({
      label: 'Search',
      value: 'hello',
      clearable: true,
    });
    const input = wrapper.find('input');
    await input.trigger('focus');
    expect(wrapper.emitted('focus')).toHaveLength(1);
    await input.trigger('blur');
    expect(wrapper.emitted('blur')).toHaveLength(1);

    const vTextField = wrapper.findComponent({ name: 'VTextField' });
    await vTextField.vm.$emit('click:clear');
    expect(wrapper.emitted('clear')).toHaveLength(1);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['']);
  });

  it('blocks edits and clear when disabled or readOnly and syncs controlled modelValue', async () => {
    const disabledWrapper = mountTextInput({
      label: 'Disabled',
      modelValue: 'locked',
      disabled: true,
      clearable: true,
    });
    const vtfDisabled = disabledWrapper.findComponent({ name: 'VTextField' });
    await vtfDisabled.vm.$emit('update:modelValue', 'hack');
    await vtfDisabled.vm.$emit('click:clear');
    expect(disabledWrapper.emitted('change')).toBeUndefined();
    expect(disabledWrapper.emitted('clear')).toBeUndefined();

    const roWrapper = mountTextInput({
      label: 'Read only',
      value: 'fixed',
      readOnly: true,
    });
    expect(roWrapper.find('input').attributes('readonly')).toBeDefined();
    await roWrapper.setProps({ value: 'updated-prop' });
    expect((roWrapper.find('input').element as HTMLInputElement).value).toBe(
      'updated-prop',
    );
  });
});
