import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createMagicVuetify } from '../../vuetify';
import MagicProgressIndicator from './MagicProgressIndicator.vue';

function mountProgress(
  props: InstanceType<typeof MagicProgressIndicator>['$props'] = {},
) {
  return mount(MagicProgressIndicator, {
    props,
    global: {
      plugins: [createMagicVuetify()],
    },
  });
}

describe('MagicProgressIndicator', () => {
  it('renders determinate linear progress bar with clamped value and a11y attrs', () => {
    const wrapper = mountProgress({
      type: 'bar',
      mode: 'determinate',
      value: 65,
      id: 'upload-progress',
      testId: 'progress-bar',
      ariaLabel: 'Upload progress',
    });

    expect(wrapper.find('.v-progress-linear').exists()).toBe(true);
    expect(wrapper.attributes('id')).toBe('upload-progress');
    expect(wrapper.attributes('data-testid')).toBe('progress-bar');
    expect(wrapper.attributes('aria-label')).toBe('Upload progress');
    expect(wrapper.attributes('aria-valuenow')).toBe('65');
  });

  it('clamps out-of-range values to [0, 100]', () => {
    const over = mountProgress({ value: 150 });
    expect(over.attributes('aria-valuenow')).toBe('100');

    const under = mountProgress({ value: -20 });
    expect(under.attributes('aria-valuenow')).toBe('0');
  });

  it('supports buffer and query modes on bar', () => {
    const buffer = mountProgress({
      type: 'bar',
      mode: 'buffer',
      value: 40,
      bufferValue: 75,
      size: 'lg',
    });
    expect(buffer.find('.v-progress-linear__stream').exists()).toBe(true);

    const query = mountProgress({
      type: 'bar',
      mode: 'query',
      color: 'warning',
    });
    expect(query.find('.v-progress-linear--indeterminate').exists()).toBe(true);
    expect(query.attributes('aria-valuenow')).toBeUndefined();
  });

  it('renders circular spinner with custom diameter, strokeWidth, and disabled state', () => {
    const wrapper = mountProgress({
      type: 'spinner',
      mode: 'indeterminate',
      diameter: 64,
      strokeWidth: 6,
      color: 'tertiary',
      disabled: true,
    });

    expect(wrapper.find('.v-progress-circular').exists()).toBe(true);
    expect(wrapper.find('.v-progress-circular--indeterminate').exists()).toBe(
      true,
    );
    expect(wrapper.classes()).toContain('opacity-50');
  });
});
