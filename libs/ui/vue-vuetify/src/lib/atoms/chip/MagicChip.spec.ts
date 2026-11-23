import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import type { ChipItem } from '@mono-magic/atomic-design-interfaces';
import { createMagicVuetify } from '../../vuetify';
import MagicChip from './MagicChip.vue';

function mountChip(props: InstanceType<typeof MagicChip>['$props'] = {}) {
  return mount(MagicChip, {
    props,
    global: {
      plugins: [createMagicVuetify()],
    },
  });
}

describe('MagicChip', () => {
  it('renders a standalone chip when label is provided', async () => {
    const wrapper = mountChip({
      label: 'Vue 3',
      color: 'success',
      removable: true,
      testId: 'single-chip',
    });

    expect(wrapper.attributes('data-testid')).toBe('single-chip');
    expect(wrapper.text()).toContain('Vue 3');

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')?.[0]).toEqual([{ label: 'Vue 3' }]);

    const closeBtn = wrapper.find('.v-chip__close');
    await closeBtn.trigger('click');
    expect(wrapper.emitted('remove')?.[0]).toEqual([{ label: 'Vue 3' }, 0]);
  });

  it('supports selectable chip group with single and multiple selection', async () => {
    const chips: ChipItem[] = [
      { id: '1', label: 'TypeScript', selected: true },
      { id: '2', label: 'Vue' },
      { id: '3', label: 'Vuetify', leadingIcon: 'star' },
    ];

    const wrapper = mountChip({
      chips,
      variant: 'selectable',
      multiple: true,
      color: 'primary',
    });

    const chipEls = wrapper.findAll('.v-chip');
    expect(chipEls).toHaveLength(3);

    await chipEls[1].trigger('click');
    expect(wrapper.emitted('select')?.[0]).toEqual([['TypeScript', 'Vue']]);
  });

  it('supports input variant for adding and removing chips', async () => {
    const wrapper = mountChip({
      chips: [{ id: '1', label: 'Alpha', removable: true }],
      variant: 'input',
      inputPlaceholder: 'New tag...',
    });

    const input = wrapper.find('input');
    expect(input.attributes('placeholder')).toBe('New tag...');

    await input.setValue('Beta');
    await input.trigger('keydown.enter');

    expect(wrapper.emitted('add')?.[0]).toEqual(['Beta']);
    expect(wrapper.findAll('.v-chip')).toHaveLength(2);

    await wrapper.find('.v-chip__close').trigger('click');
    expect(wrapper.emitted('remove')).toHaveLength(1);
    expect(wrapper.findAll('.v-chip')).toHaveLength(1);
  });

  it('supports draggable variant reordering and vertical orientation', async () => {
    const chips: ChipItem[] = [
      { id: 'a', label: 'First' },
      { id: 'b', label: 'Second' },
    ];
    const wrapper = mountChip({
      chips,
      variant: 'draggable',
      orientation: 'vertical',
    });

    const rendered = wrapper.findAll('.v-chip');
    await rendered[0].trigger('dragstart');
    await rendered[1].trigger('drop');

    const reordered = wrapper.emitted('reorder')?.[0]?.[0] as ChipItem[];
    expect(reordered.map((c) => c.label)).toEqual(['Second', 'First']);
  });
});
