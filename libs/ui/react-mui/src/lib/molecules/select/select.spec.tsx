import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  SelectOption,
  SelectOptionGroup,
} from '@mono-magic/atomic-design-interfaces';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicFormField } from '../form-field/form-field';
import { MagicSelect } from './select';

afterEach(cleanup);

const FLAT_OPTIONS: readonly SelectOption<string>[] = [
  { value: 'alpha', label: 'Alpha Option' },
  { value: 'beta', label: 'Beta Option' },
  { value: 'gamma', label: 'Gamma Option' },
  { value: 'disabled', label: 'Disabled Option', disabled: true },
];

const GROUPED_OPTIONS: readonly SelectOptionGroup<string>[] = [
  {
    label: 'Primary Group',
    options: [
      { value: 'g1', label: 'Group 1 Item' },
      { value: 'g2', label: 'Group 2 Item', disabled: true },
    ],
  },
  {
    label: 'Disabled Group',
    disabled: true,
    options: [{ value: 'g3', label: 'Group 3 Item' }],
  },
];

describe('MagicSelect (React MUI)', () => {
  it('renders single select with label, hint, opens dropdown, and commits selected option', () => {
    const ref = createRef<HTMLDivElement>();
    const onChange = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicSelect
          ref={ref}
          id="tier-select"
          testId="tier-select"
          label="Service Tier"
          hint="Select your deployment tier"
          options={FLAT_OPTIONS}
          onChange={onChange}
          onOpenChange={onOpenChange}
        />
      </MagicMuiThemeProvider>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(screen.getByTestId('tier-select-field')).toBeTruthy();
    expect(screen.getByText('Select your deployment tier')).toBeTruthy();

    const trigger = screen.getByTestId('tier-select');
    fireEvent.mouseDown(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    const betaOpt = screen.getByTestId('tier-select-option-beta');
    fireEvent.click(betaOpt);

    expect(onChange).toHaveBeenCalledWith('beta');
    expect(trigger.textContent).toContain('Beta Option');
  });

  it('supports grouped options (optionGroups) and respects group and option disabled flags', () => {
    const onChange = vi.fn();
    render(
      <MagicMuiThemeProvider>
        <MagicSelect
          testId="group-select"
          label="Grouped Select"
          appearance="filled"
          size="sm"
          optionGroups={GROUPED_OPTIONS}
          panelClass="custom-select-panel"
          onChange={onChange}
        />
      </MagicMuiThemeProvider>,
    );

    const trigger = screen.getByTestId('group-select');
    fireEvent.mouseDown(trigger);

    expect(screen.getByText('Primary Group')).toBeTruthy();
    expect(screen.getByText('Disabled Group')).toBeTruthy();

    const g2 = screen.getByTestId('group-select-option-g2');
    const g3 = screen.getByTestId('group-select-option-g3');
    expect(g2.getAttribute('aria-disabled')).toBe('true');
    expect(g3.getAttribute('aria-disabled')).toBe('true');

    const g1 = screen.getByTestId('group-select-option-g1');
    fireEvent.click(g1);
    expect(onChange).toHaveBeenCalledWith('g1');
  });

  it('supports multiple selection with checkboxes and formats customTriggerSummary for 1, 2, and 3+ items', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <MagicMuiThemeProvider>
        <MagicSelect
          testId="multi-select"
          label="Tags"
          multiple
          customTriggerSummary
          options={FLAT_OPTIONS}
          value={['alpha']}
          onChange={onChange}
        />
      </MagicMuiThemeProvider>,
    );

    const trigger = screen.getByTestId('multi-select');
    expect(trigger.textContent).toBe('Alpha Option');

    rerender(
      <MagicMuiThemeProvider>
        <MagicSelect
          testId="multi-select"
          label="Tags"
          multiple
          customTriggerSummary
          options={FLAT_OPTIONS}
          value={['alpha', 'beta']}
          onChange={onChange}
        />
      </MagicMuiThemeProvider>,
    );
    expect(trigger.textContent).toBe('Alpha Option (+1 other)');

    rerender(
      <MagicMuiThemeProvider>
        <MagicSelect
          testId="multi-select"
          label="Tags"
          multiple
          customTriggerSummary
          options={FLAT_OPTIONS}
          value={['alpha', 'beta', 'gamma']}
          onChange={onChange}
        />
      </MagicMuiThemeProvider>,
    );
    expect(trigger.textContent).toBe('Alpha Option (+2 others)');

    rerender(
      <MagicMuiThemeProvider>
        <MagicSelect
          key="uncontrolled-multi"
          testId="multi-select"
          label="Tags"
          multiple
          customTriggerSummary={false}
          options={FLAT_OPTIONS}
          defaultValue={['alpha', 'beta']}
          onChange={onChange}
        />
      </MagicMuiThemeProvider>,
    );
    const freshTrigger = screen.getByTestId('multi-select');
    expect(freshTrigger.textContent).toBe('Alpha Option, Beta Option');

    fireEvent.mouseDown(freshTrigger);
    const gammaOpt = screen.getByTestId('multi-select-option-gamma');
    fireEvent.click(gammaOpt);
    expect(onChange).toHaveBeenCalledWith(['alpha', 'beta', 'gamma']);
    fireEvent.blur(freshTrigger);
  });

  it('displays errorText with alert role, floatLabel="always" placeholder, and works inside external MagicFormField', () => {
    render(
      <MagicMuiThemeProvider>
        <MagicSelect
          testId="error-select"
          label="Always Float Select"
          floatLabel="always"
          placeholder="Pick one..."
          errorText="Selection is required"
          required
          options={FLAT_OPTIONS}
        />
        <MagicFormField label="External Wrapper" hint="Wrapped externally">
          <MagicSelect
            testId="inner-select"
            options={FLAT_OPTIONS}
            defaultValue="alpha"
            sx={[{ minWidth: 120 }]}
          />
        </MagicFormField>
      </MagicMuiThemeProvider>,
    );

    expect(screen.getByRole('alert').textContent).toBe('Selection is required');
    expect(screen.getByTestId('error-select').textContent).toContain(
      'Pick one...',
    );
    expect(screen.getByTestId('inner-select').textContent).toContain(
      'Alpha Option',
    );
  });

  it('handles empty multi-select placeholder, unknown value fallback, and explicit empty option', () => {
    const onOpenChange = vi.fn();
    render(
      <MagicMuiThemeProvider>
        <MagicSelect
          testId="empty-multi"
          multiple
          floatLabel="always"
          placeholder="Choose tags..."
          options={FLAT_OPTIONS}
          sx={{ width: 240 }}
          onOpenChange={onOpenChange}
        />
        <MagicSelect
          testId="unknown-val"
          options={FLAT_OPTIONS}
          value="custom-unlisted"
        />
        <MagicSelect
          testId="explicit-empty"
          options={[
            { value: '', label: 'All Items' },
            ...FLAT_OPTIONS,
          ]}
          value=""
        />
      </MagicMuiThemeProvider>,
    );

    const emptyMulti = screen.getByTestId('empty-multi');
    expect(emptyMulti.textContent).toContain('Choose tags...');

    fireEvent.focus(emptyMulti);
    fireEvent.mouseDown(emptyMulti);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    const listbox = screen.getByRole('listbox');
    fireEvent.keyDown(listbox, { key: 'Escape', code: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);

    expect(screen.getByTestId('unknown-val').textContent).toBe(
      'custom-unlisted',
    );
    expect(screen.getByTestId('explicit-empty').textContent).toBe('All Items');
  });
});
