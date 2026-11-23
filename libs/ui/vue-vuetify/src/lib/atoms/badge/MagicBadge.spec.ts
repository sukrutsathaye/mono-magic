import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type { BadgePosition } from '@mono-magic/atomic-design-interfaces';
import { createMagicVuetify } from '../../vuetify';
import MagicBadge from './MagicBadge.vue';

function mountBadge(
  props: InstanceType<typeof MagicBadge>['$props'] = {},
  slots?: Record<string, string>,
) {
  return mount(MagicBadge, {
    props,
    slots,
    global: {
      plugins: [createMagicVuetify()],
    },
  });
}

describe('MagicBadge', () => {
  it('renders badge content with fallback label', () => {
    const wrapper = mountBadge({
      content: 5,
      label: 'Notifications',
      testId: 'notif-badge',
      id: 'badge-1',
    });

    expect(wrapper.attributes('id')).toBe('badge-1');
    expect(wrapper.attributes('data-testid')).toBe('notif-badge');
    expect(wrapper.text()).toContain('Notifications');
    expect(wrapper.text()).toContain('5');
  });

  it('renders fallback icon when icon prop is provided without slot', () => {
    const wrapper = mountBadge({
      content: '99+',
      icon: 'bell',
      size: 'lg',
      color: 'error',
    });

    const icon = wrapper.find('.v-icon');
    expect(icon.exists()).toBe(true);
    expect(icon.classes()).toContain('mdi-bell');
    expect(wrapper.text()).toContain('99+');
  });

  it('renders projected default slot content', () => {
    const wrapper = mountBadge(
      { content: 3, color: 'success' },
      { default: '<button type="button">Inbox</button>' },
    );

    expect(wrapper.find('button').text()).toBe('Inbox');
    expect(wrapper.text()).toContain('3');
  });

  it('supports dot mode when content is omitted and hides when hidden is true', async () => {
    const wrapper = mountBadge({
      label: 'Status',
      hidden: false,
    });

    expect(wrapper.find('.v-badge--dot').exists()).toBe(true);

    await wrapper.setProps({ hidden: true });
    expect(wrapper.find('.v-badge__badge').isVisible()).toBe(false);
  });

  it('maps all BadgePosition values and overlap flag', () => {
    const positions: BadgePosition[] = [
      'above after',
      'above before',
      'below after',
      'below before',
      'above',
      'below',
      'before',
      'after',
    ];

    for (const position of positions) {
      const wrapper = mountBadge({
        content: 1,
        label: position,
        position,
        overlap: false,
      });
      expect(wrapper.find('.v-badge--floating').exists()).toBe(true);
    }
  });

  it('applies disabled state and screen reader description / ariaLabel', () => {
    const wrapper = mountBadge({
      content: 0,
      label: 'Messages',
      disabled: true,
      description: 'Zero unread messages',
      ariaLabel: 'Unread messages badge',
    });

    expect(wrapper.attributes('aria-disabled')).toBe('true');
    expect(wrapper.attributes('aria-label')).toBe('Unread messages badge');
    expect(wrapper.classes()).toContain('opacity-50');
    expect(wrapper.find('.d-sr-only').text()).toBe('Zero unread messages');
  });
});
