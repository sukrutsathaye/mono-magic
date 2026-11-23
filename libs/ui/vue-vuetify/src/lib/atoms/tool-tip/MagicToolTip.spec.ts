import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type {
  ToolTipPosition,
  ToolTipTouchGestures,
} from '@mono-magic/atomic-design-interfaces';
import { createMagicVuetify } from '../../vuetify';
import MagicToolTip from './MagicToolTip.vue';

function mountToolTip(
  props: InstanceType<typeof MagicToolTip>['$props'],
  slots?: Record<string, string>,
) {
  return mount(MagicToolTip, {
    props,
    slots,
    global: {
      plugins: [createMagicVuetify()],
    },
  });
}

describe('MagicToolTip', () => {
  it('renders fallback trigger button with id, testId, and ariaLabel', () => {
    const wrapper = mountToolTip({
      id: 'help-tip',
      testId: 'magic-tip',
      ariaLabel: 'Help trigger',
      message: 'Save changes to workspace',
      label: 'Hover me',
    });

    expect(wrapper.attributes('id')).toBe('help-tip');
    expect(wrapper.attributes('data-testid')).toBe('magic-tip');
    const trigger = wrapper.find('[data-testid="magic-tip-trigger"]');
    expect(trigger.exists()).toBe(true);
    expect(trigger.text()).toContain('Hover me');
    expect(trigger.find('button').attributes('aria-label')).toBe(
      'Help trigger',
    );
  });

  it('renders custom slot trigger when provided', () => {
    const wrapper = mountToolTip(
      {
        message: 'Publish release',
        label: 'Ignored',
      },
      {
        default: '<button type="button" data-testid="custom-btn">Publish</button>',
      },
    );

    expect(wrapper.find('[data-testid="custom-btn"]').text()).toBe('Publish');
    expect(wrapper.text()).not.toContain('Ignored');
  });

  it('supports all ToolTipPosition values and touchGestures modes', () => {
    const positions: ToolTipPosition[] = [
      'above',
      'below',
      'left',
      'right',
      'before',
      'after',
    ];
    const gestures: ToolTipTouchGestures[] = ['auto', 'on', 'off'];

    for (const position of positions) {
      const w = mountToolTip({
        position,
        message: `Tip ${position}`,
        testId: `tip-${position}`,
      });
      expect(w.attributes('data-position')).toBe(position);
    }

    for (const gesture of gestures) {
      const w = mountToolTip({
        touchGestures: gesture,
        message: `Gesture ${gesture}`,
        showDelay: 200,
        hideDelay: 100,
      });
      expect(w.attributes('data-touch-gestures')).toBe(gesture);
    }
  });

  it('emits open/close and update:modelValue when toggled, and suppresses when disabled', async () => {
    const wrapper = mountToolTip({
      message: 'Helpful tooltip',
      modelValue: false,
    });

    const vTooltip = wrapper.findComponent({ name: 'VTooltip' });
    await vTooltip.vm.$emit('update:modelValue', true);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
    expect(wrapper.emitted('open')).toHaveLength(1);

    await wrapper.setProps({ modelValue: true });
    await vTooltip.vm.$emit('update:modelValue', false);
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([false]);
    expect(wrapper.emitted('close')).toHaveLength(1);

    const disabledWrapper = mountToolTip({
      message: 'Blocked',
      disabled: true,
      modelValue: true,
    });
    expect(disabledWrapper.attributes('data-disabled')).toBe('true');
    const disabledTooltip = disabledWrapper.findComponent({ name: 'VTooltip' });
    expect(disabledTooltip.props('modelValue')).toBe(false);
    await disabledTooltip.vm.$emit('update:modelValue', true);
    expect(disabledWrapper.emitted('open')).toBeUndefined();
  });
});
