import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AtomicSize,
  CheckBoxTask,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { allComplete, MagicCheckBox, someComplete } from './check-box';

afterEach(cleanup);

describe('MagicCheckBox (React MUI)', () => {
  it('renders label, forwards React 19 ref, and toggles uncontrolled checked state', () => {
    const onChange = vi.fn();
    const onIndeterminateChange = vi.fn();
    const rootRef = createRef<HTMLDivElement>();

    render(
      <MagicMuiThemeProvider>
        <MagicCheckBox
          ref={rootRef}
          id="terms-cb"
          testId="magic-cb"
          label="Accept terms"
          name="terms"
          checkboxValue="yes"
          indeterminate
          required
          onChange={onChange}
          onIndeterminateChange={onIndeterminateChange}
        />
      </MagicMuiThemeProvider>,
    );

    const container = screen.getByTestId('magic-cb');
    expect(rootRef.current).toBe(container);
    expect(container.textContent).toContain('Accept terms');
    expect(container.textContent).toContain('*');

    const input = screen.getByRole('checkbox', {
      name: 'Accept terms',
    }) as HTMLInputElement;
    expect(input.checked).toBe(false);
    expect(input.name).toBe('terms');
    expect(input.value).toBe('yes');

    fireEvent.click(input);
    expect(onIndeterminateChange).toHaveBeenCalledWith(false);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(input.checked).toBe(true);
  });

  it('supports controlled checked state, bare checkbox without label, and labelPosition="before"', () => {
    const onChange = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicCheckBox
          checked={true}
          ariaLabel="Bare checkbox"
          testId="bare-cb"
          onChange={onChange}
        />
        <MagicCheckBox
          label="Before label"
          labelPosition="before"
          disableRipple
          sx={[{ ml: 1 }]}
          testId="before-cb"
        >
          <span data-testid="projected-child">Custom Child</span>
        </MagicCheckBox>
      </MagicMuiThemeProvider>,
    );

    const bareInput = screen.getByRole('checkbox', {
      name: 'Bare checkbox',
    }) as HTMLInputElement;
    expect(bareInput.checked).toBe(true);
    fireEvent.click(bareInput);
    expect(onChange).toHaveBeenCalledWith(false);

    expect(screen.getByTestId('projected-child').textContent).toBe(
      'Custom Child',
    );
  });

  it('supports all 5 AtomicSizes and all 7 ColorIntents', () => {
    const sizes: AtomicSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    const colors: ColorIntent[] = [
      'primary',
      'secondary',
      'tertiary',
      'success',
      'warning',
      'error',
      'neutral',
    ];

    render(
      <MagicMuiThemeProvider>
        {sizes.map((size) => (
          <MagicCheckBox
            key={size}
            size={size}
            label={`size-${size}`}
            testId={`size-${size}`}
          />
        ))}
        {colors.map((color) => (
          <MagicCheckBox
            key={color}
            color={color}
            defaultChecked
            label={`color-${color}`}
            testId={`color-${color}`}
          />
        ))}
      </MagicMuiThemeProvider>,
    );

    for (const size of sizes) {
      expect(screen.getByTestId(`size-${size}`)).toBeTruthy();
    }
    for (const color of colors) {
      expect(screen.getByTestId(`color-${color}`)).toBeTruthy();
    }
  });

  it('blocks state changes when disabled or disabledInteractive is true', () => {
    const onChange = vi.fn();

    render(
      <MagicMuiThemeProvider>
        <MagicCheckBox
          label="Native Disabled"
          disabled
          onChange={onChange}
        />
        <MagicCheckBox
          label="Interactive Disabled"
          disabled
          disabledInteractive
          onChange={onChange}
        />
      </MagicMuiThemeProvider>,
    );

    const nativeInput = screen.getByRole('checkbox', {
      name: 'Native Disabled',
    }) as HTMLInputElement;
    expect(nativeInput.disabled).toBe(true);

    const interactiveInput = screen.getByRole('checkbox', {
      name: 'Interactive Disabled',
    }) as HTMLInputElement;
    expect(interactiveInput.disabled).toBe(false);
    expect(interactiveInput.getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(interactiveInput);
    fireEvent.change(interactiveInput, { target: { checked: true } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('manages hierarchical tasks mode: allComplete, someComplete, parent toggle, and subtask toggle', () => {
    const onTasksChange = vi.fn();
    const onChange = vi.fn();
    const initialTasks: CheckBoxTask[] = [
      {
        id: 't1',
        name: 'Frontend',
        checked: false,
        subtasks: [
          { id: 's1', name: 'Lint', checked: true },
          { id: 's2', name: 'Unit Tests', checked: false },
          { id: 's3', name: 'Locked Step', checked: false, disabled: true },
        ],
      },
      {
        id: 't2',
        name: 'Standalone Task',
        checked: false,
      },
      {
        id: 't3',
        name: 'Disabled Parent',
        checked: false,
        disabled: true,
        subtasks: [{ id: 's4', name: 'Child of Disabled', checked: false }],
      },
    ];

    expect(allComplete(initialTasks[0])).toBe(false);
    expect(someComplete(initialTasks[0])).toBe(true);
    expect(allComplete(initialTasks[1])).toBe(false);
    expect(someComplete(initialTasks[1])).toBe(false);

    render(
      <MagicMuiThemeProvider>
        <MagicCheckBox
          testId="tasks-group"
          ariaLabel="Build tasks"
          required
          tasks={initialTasks}
          onTasksChange={onTasksChange}
          onChange={onChange}
        />
      </MagicMuiThemeProvider>,
    );

    const group = screen.getByTestId('tasks-group');
    expect(group.getAttribute('role')).toBe('group');

    // Toggle subtask 'Unit Tests' -> true
    const unitTestsBox = screen.getByRole('checkbox', { name: 'Unit Tests' });
    fireEvent.click(unitTestsBox);
    expect(onTasksChange).toHaveBeenCalledTimes(1);
    const afterSubToggle = onTasksChange.mock.calls[0][0] as CheckBoxTask[];
    expect(afterSubToggle[0].subtasks?.[1].checked).toBe(true);
    // s3 is still false because it was disabled
    expect(afterSubToggle[0].checked).toBe(false);

    // Toggle parent 'Frontend' -> toggles all non-disabled subtasks to true
    const frontendBox = screen.getByRole('checkbox', { name: 'Frontend' });
    fireEvent.click(frontendBox);
    expect(onChange).toHaveBeenCalledWith(true);

    // Toggle standalone task without subtasks
    const standaloneBox = screen.getByRole('checkbox', {
      name: 'Standalone Task',
    });
    fireEvent.click(standaloneBox);
    expect(onTasksChange).toHaveBeenCalledTimes(3);

    // Clicking disabled parent or disabled subtask does nothing
    const disabledParentBox = screen.getByRole('checkbox', {
      name: 'Disabled Parent',
    });
    fireEvent.click(disabledParentBox);
    expect(onTasksChange).toHaveBeenCalledTimes(3);
  });

  it('handles disabledInteractive in hierarchical tasks mode', () => {
    const onTasksChange = vi.fn();
    const tasks: CheckBoxTask[] = [
      {
        name: 'Parent Task',
        disabled: true,
        subtasks: [{ name: 'Sub Task', checked: false }],
      },
    ];

    render(
      <MagicMuiThemeProvider>
        <MagicCheckBox
          tasks={tasks}
          disabledInteractive
          onTasksChange={onTasksChange}
        />
      </MagicMuiThemeProvider>,
    );

    const parentInput = screen.getByRole('checkbox', { name: 'Parent Task' });
    const subInput = screen.getByRole('checkbox', { name: 'Sub Task' });
    expect(parentInput.getAttribute('aria-disabled')).toBe('true');
    expect(subInput.getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(parentInput);
    fireEvent.click(subInput);
    expect(onTasksChange).not.toHaveBeenCalled();
  });
});
