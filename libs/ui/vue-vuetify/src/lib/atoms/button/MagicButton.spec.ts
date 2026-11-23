import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type {
  ButtonKind,
  ButtonShape,
  ButtonVariant,
} from '@mono-magic/atomic-design-interfaces';
import { createMagicVuetify } from '../../vuetify';
import MagicButton from './MagicButton.vue';

function mountButton(props: InstanceType<typeof MagicButton>['$props']) {
  return mount(MagicButton, {
    props,
    global: {
      plugins: [createMagicVuetify()],
    },
  });
}

describe('MagicButton', () => {
  it('renders label, id, testId, and emits click', async () => {
    const wrapper = mountButton({
      label: 'Save Changes',
      id: 'save-btn',
      testId: 'magic-save-btn',
      ariaLabel: 'Save changes now',
    });

    const btn = wrapper.find('button');
    expect(btn.attributes('id')).toBe('save-btn');
    expect(btn.attributes('data-testid')).toBe('magic-save-btn');
    expect(btn.attributes('aria-label')).toBe('Save changes now');
    expect(btn.text()).toContain('Save Changes');

    await btn.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('supports all variants, shapes, and fullWidth', () => {
    const variants: ButtonVariant[] = [
      'filled',
      'tonal',
      'outlined',
      'elevated',
      'text',
    ];
    for (const variant of variants) {
      const wrapper = mountButton({
        label: variant,
        variant,
        color: 'secondary',
        fullWidth: true,
      });
      expect(wrapper.find('.v-btn--block').exists()).toBe(true);
    }

    const shapes: ButtonShape[] = ['default', 'square', 'rounded', 'pill'];
    for (const shape of shapes) {
      const wrapper = mountButton({ label: shape, shape });
      expect(wrapper.find('button').exists()).toBe(true);
    }
  });

  it('supports icon, fab, mini-fab, and extended-fab kinds', () => {
    const kinds: ButtonKind[] = ['icon', 'fab', 'mini-fab', 'extended-fab'];
    for (const kind of kinds) {
      const wrapper = mountButton({
        label: `Action ${kind}`,
        kind,
        leadingIcon: 'plus',
      });
      expect(wrapper.find('.v-icon').exists()).toBe(true);
      if (kind !== 'extended-fab') {
        expect(wrapper.find('button').attributes('aria-label')).toBe(
          `Action ${kind}`,
        );
      }
    }
  });

  it('blocks click when disabled or loading, and preserves focusability with disabledInteractive', async () => {
    const disabledWrapper = mountButton({
      label: 'Disabled',
      disabled: true,
    });
    expect(disabledWrapper.find('button').attributes('disabled')).toBeDefined();

    const interactiveDisabled = mountButton({
      label: 'Interactive Disabled',
      disabled: true,
      disabledInteractive: true,
    });
    const interactiveBtn = interactiveDisabled.find('button');
    expect(interactiveBtn.attributes('disabled')).toBeUndefined();
    expect(interactiveBtn.attributes('aria-disabled')).toBe('true');
    await interactiveBtn.trigger('click');
    expect(interactiveDisabled.emitted('click')).toBeUndefined();

    const loadingWrapper = mountButton({
      label: 'Saving',
      loading: true,
    });
    await loadingWrapper.find('button').trigger('click');
    expect(loadingWrapper.emitted('click')).toBeUndefined();
  });

  it('renders leading and trailing icons on default buttons', () => {
    const wrapper = mountButton({
      label: 'Next',
      leadingIcon: 'mdi-star',
      trailingIcon: 'arrow-right',
      disableRipple: true,
      type: 'submit',
    });

    expect(wrapper.find('button').attributes('type')).toBe('submit');
    expect(wrapper.findAll('.v-icon').length).toBe(2);
  });
});
