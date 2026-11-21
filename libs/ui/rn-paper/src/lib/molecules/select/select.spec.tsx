import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import {
  MagicSelect,
  type SelectOption,
  type SelectOptionGroup,
} from './select';

afterEach(cleanup);

const FLAT_OPTIONS: readonly SelectOption<string>[] = [
  { value: 'alpha', label: 'Alpha' },
  { value: 'beta', label: 'Beta' },
  { value: 'gamma', label: 'Gamma' },
  { value: 'disabled-opt', label: 'Disabled Option', disabled: true },
];

const GROUPS: readonly SelectOptionGroup<string>[] = [
  {
    label: 'Primary Group',
    options: [
      { value: 'g1', label: 'Group One' },
      { value: 'g2', label: 'Group Two' },
    ],
  },
  {
    label: 'Disabled Group',
    disabled: true,
    options: [{ value: 'g3', label: 'Group Three' }],
  },
];

describe('MagicSelect', () => {
  it('renders inside MagicFormField with combobox trigger, opens listbox, and selects single option', () => {
    const onChange = vi.fn();
    const onOpenChange = vi.fn();
    const ref = createRef<View>();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicSelect
          ref={ref}
          id="tier-select"
          testId="rn-select"
          label="Service Tier"
          hint="Select your deployment tier"
          placeholder="Choose a tier"
          options={FLAT_OPTIONS}
          panelClass="custom-panel"
          onChange={onChange}
          onOpenChange={onOpenChange}
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    expect(screen.getByTestId('rn-select-label').textContent).toBe(
      'Service Tier'
    );
    expect(screen.getByTestId('rn-select-hint').textContent).toBe(
      'Select your deployment tier'
    );
    expect(screen.getByTestId('rn-select-value').textContent).toBe(
      'Choose a tier'
    );

    const trigger = screen.getByTestId('rn-select-trigger');
    expect(trigger.getAttribute('role')).toBe('combobox');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    const panel = screen.getByTestId('rn-select-panel');
    expect(panel.getAttribute('role')).toBe('listbox');
    expect(panel.getAttribute('data-panel-class')).toBe('custom-panel');

    // Clicking disabled option does not select or close
    fireEvent.click(screen.getByTestId('rn-select-option-disabled-opt'));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByTestId('rn-select-panel')).toBeTruthy();

    // Clicking enabled option selects and closes
    fireEvent.click(screen.getByTestId('rn-select-option-beta'));
    expect(onChange).toHaveBeenCalledWith('beta');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByTestId('rn-select-panel')).toBeNull();
    expect(screen.getByTestId('rn-select-value').textContent).toBe('Beta');
  });

  it('supports multiple selection and customTriggerSummary ("+1 other" and "+N others")', () => {
    const onChange = vi.fn();

    const { rerender } = render(
      <MagicPaperProvider>
        <MagicSelect
          testId="multi-select"
          label="Tags"
          multiple
          customTriggerSummary
          options={FLAT_OPTIONS}
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    fireEvent.click(screen.getByTestId('multi-select-trigger'));
    const panel = screen.getByTestId('multi-select-panel');
    expect(panel.getAttribute('aria-multiselectable')).toBe('true');

    // Select 1st item
    fireEvent.click(screen.getByTestId('multi-select-option-alpha'));
    expect(onChange).toHaveBeenLastCalledWith(['alpha']);
    expect(screen.getByTestId('multi-select-value').textContent).toBe('Alpha');

    // Select 2nd item -> "Alpha (+1 other)"
    fireEvent.click(screen.getByTestId('multi-select-option-beta'));
    expect(onChange).toHaveBeenLastCalledWith(['alpha', 'beta']);
    expect(screen.getByTestId('multi-select-value').textContent).toBe(
      'Alpha (+1 other)'
    );

    // Select 3rd item -> "Alpha (+2 others)"
    fireEvent.click(screen.getByTestId('multi-select-option-gamma'));
    expect(onChange).toHaveBeenLastCalledWith(['alpha', 'beta', 'gamma']);
    expect(screen.getByTestId('multi-select-value').textContent).toBe(
      'Alpha (+2 others)'
    );

    // Deselect 2nd item -> back to "Alpha (+1 other)"
    fireEvent.click(screen.getByTestId('multi-select-option-beta'));
    expect(onChange).toHaveBeenLastCalledWith(['alpha', 'gamma']);
    expect(screen.getByTestId('multi-select-value').textContent).toBe(
      'Alpha (+1 other)'
    );

    // Without customTriggerSummary, joins labels with ", "
    rerender(
      <MagicPaperProvider>
        <MagicSelect
          testId="multi-select"
          label="Tags"
          multiple
          customTriggerSummary={false}
          value={['alpha', 'gamma']}
          options={FLAT_OPTIONS}
          onChange={onChange}
        />
      </MagicPaperProvider>
    );
    expect(screen.getByTestId('multi-select-value').textContent).toBe(
      'Alpha, Gamma'
    );
  });

  it('renders optionGroups and cascades group disabled state to options', () => {
    const onChange = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicSelect
          testId="grp-select"
          label="Groups"
          optionGroups={GROUPS}
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    fireEvent.click(screen.getByTestId('grp-select-trigger'));
    expect(screen.getByTestId('grp-select-group-0')).toBeTruthy();
    expect(screen.getByTestId('grp-select-group-1')).toBeTruthy();

    // Option in disabled group cannot be selected
    fireEvent.click(screen.getByTestId('grp-select-option-g3'));
    expect(onChange).not.toHaveBeenCalled();

    // Option in enabled group selects normally
    fireEvent.click(screen.getByTestId('grp-select-option-g2'));
    expect(onChange).toHaveBeenCalledWith('g2');
    expect(screen.getByTestId('grp-select-value').textContent).toBe(
      'Group Two'
    );
  });

  it('closes on backdrop click and Escape keydown', () => {
    const onOpenChange = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicSelect
          testId="esc-select"
          label="Close Test"
          options={FLAT_OPTIONS}
          onOpenChange={onOpenChange}
        />
      </MagicPaperProvider>
    );

    // Backdrop click
    fireEvent.click(screen.getByTestId('esc-select-trigger'));
    expect(screen.getByTestId('esc-select-panel')).toBeTruthy();
    fireEvent.click(screen.getByTestId('esc-select-backdrop'));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByTestId('esc-select-panel')).toBeNull();

    // Escape keydown
    fireEvent.click(screen.getByTestId('esc-select-trigger'));
    expect(screen.getByTestId('esc-select-panel')).toBeTruthy();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByTestId('esc-select-panel')).toBeNull();
  });

  it('supports errorText, required, disabled, filled appearance, and dark theme', () => {
    const onOpenChange = vi.fn();

    render(
      <MagicPaperProvider palette="dark-theme">
        <MagicSelect
          testId="err-select"
          label="Environment"
          appearance="filled"
          size="lg"
          required
          disabled
          errorText="Selection is required"
          defaultValue="alpha"
          options={FLAT_OPTIONS}
          onOpenChange={onOpenChange}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('err-select-label').textContent).toBe(
      'Environment *'
    );
    expect(screen.getByTestId('err-select-error').textContent).toBe(
      'Selection is required'
    );
    const trigger = screen.getByTestId('err-select-trigger');
    expect(trigger.getAttribute('aria-disabled')).toBe('true');
    expect(trigger.getAttribute('aria-invalid')).toBe('true');
    expect(trigger.getAttribute('aria-required')).toBe('true');

    fireEvent.click(trigger);
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
