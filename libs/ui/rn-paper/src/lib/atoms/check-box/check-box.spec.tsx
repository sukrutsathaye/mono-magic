import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Text } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AtomicSize,
  CheckBoxTask,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicCheckBox } from './check-box';

afterEach(cleanup);

describe('MagicCheckBox', () => {
  it('renders single uncontrolled checkbox and toggles checked state on press', () => {
    const onChange = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicCheckBox
          id="terms-cb"
          testId="single-cb"
          label="Accept terms"
          name="terms"
          checkboxValue="yes"
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    const cb = screen.getByTestId('single-cb');
    expect(cb.getAttribute('aria-checked')).toBe('false');
    expect(cb.textContent).toContain('Accept terms');

    fireEvent.click(cb);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(cb.getAttribute('aria-checked')).toBe('true');
    expect(screen.getByTestId('single-cb-icon').textContent).toBe('check');

    fireEvent.click(cb);
    expect(onChange).toHaveBeenCalledWith(false);
    expect(cb.getAttribute('aria-checked')).toBe('false');
  });

  it('supports controlled checked, indeterminate state, required marker, and custom children', () => {
    const onChange = vi.fn();
    const onIndeterminateChange = vi.fn();

    const { rerender } = render(
      <MagicPaperProvider>
        <MagicCheckBox
          testId="ctrl-cb"
          checked={false}
          indeterminate
          required
          labelPosition="before"
          disableRipple
          onChange={onChange}
          onIndeterminateChange={onIndeterminateChange}
        >
          Custom Projected Label
        </MagicCheckBox>
      </MagicPaperProvider>
    );

    const cb = screen.getByTestId('ctrl-cb');
    expect(cb.getAttribute('aria-checked')).toBe('mixed');
    expect(screen.getByTestId('ctrl-cb-icon').textContent).toBe('remove');
    expect(cb.textContent).toContain('Custom Projected Label');
    expect(cb.textContent).toContain('*');

    fireEvent.click(cb);
    expect(onIndeterminateChange).toHaveBeenCalledWith(false);
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(
      <MagicPaperProvider>
        <MagicCheckBox
          testId="ctrl-cb"
          checked
          indeterminate={false}
          required
          onChange={onChange}
        >
          <Text>Node Label</Text>
        </MagicCheckBox>
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('ctrl-cb').getAttribute('aria-checked')).toBe(
      'true'
    );
  });

  it('renders all 5 sizes and all 7 semantic color intents', () => {
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
      <MagicPaperProvider>
        {sizes.map((size) => (
          <MagicCheckBox
            key={size}
            size={size}
            defaultChecked
            testId={`cb-size-${size}`}
          />
        ))}
        {colors.map((color) => (
          <MagicCheckBox
            key={color}
            color={color}
            defaultChecked
            label={color}
            testId={`cb-color-${color}`}
          />
        ))}
      </MagicPaperProvider>
    );

    for (const size of sizes) {
      expect(screen.getByTestId(`cb-size-${size}`)).toBeTruthy();
    }
    for (const color of colors) {
      expect(screen.getByTestId(`cb-color-${color}`).textContent).toContain(
        color
      );
    }
  });

  it('handles disabled and disabledInteractive states without emitting onChange', () => {
    const onChange = vi.fn();

    render(
      <MagicPaperProvider>
        <MagicCheckBox
          testId="cb-disabled"
          label="Disabled Unchecked"
          disabled
          required
          onChange={onChange}
        />
        <MagicCheckBox
          testId="cb-disabled-interactive"
          label="Disabled Interactive Checked"
          disabled
          disabledInteractive
          defaultChecked
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    const disabledCb = screen.getByTestId('cb-disabled');
    expect(disabledCb.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(disabledCb);
    expect(onChange).not.toHaveBeenCalled();

    const interactiveCb = screen.getByTestId('cb-disabled-interactive');
    expect(interactiveCb.getAttribute('aria-disabled')).toBe('true');
    expect(interactiveCb.getAttribute('tabindex')).toBe('0');
    fireEvent.click(interactiveCb);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('manages hierarchical tasks mode with allComplete, someComplete, and disabled subtasks', () => {
    const onTasksChange = vi.fn();
    const onChange = vi.fn();

    const initialTasks: CheckBoxTask[] = [
      {
        id: 'parent-1',
        name: 'Build Pipeline',
        checked: false,
        subtasks: [
          { id: 'sub-1', name: 'Compile', checked: true },
          { id: 'sub-2', name: 'Test', checked: false },
          { id: 'sub-3', name: 'Locked Step', checked: false, disabled: true },
        ],
      },
      {
        name: 'Standalone Task',
        checked: false,
      },
    ];

    render(
      <MagicPaperProvider>
        <MagicCheckBox
          id="tasks-group"
          testId="tasks-cb"
          tasks={initialTasks}
          onTasksChange={onTasksChange}
          onChange={onChange}
        />
      </MagicPaperProvider>
    );

    const parent0 = screen.getByTestId('tasks-cb-task-0');
    expect(parent0.getAttribute('aria-checked')).toBe('mixed');

    // Toggle subtask 1 ('Test') to true
    const sub1 = screen.getByTestId('tasks-cb-subtask-0-1');
    fireEvent.click(sub1);
    expect(onTasksChange).toHaveBeenCalledTimes(1);
    const afterSubToggle = onTasksChange.mock.calls[0][0] as CheckBoxTask[];
    expect(afterSubToggle[0].subtasks?.[1].checked).toBe(true);
    // Subtask 2 is disabled and false, so parent checked is still false
    expect(afterSubToggle[0].checked).toBe(false);

    // Toggle parent 0 -> non-disabled subtasks become true
    fireEvent.click(parent0);
    expect(onChange).toHaveBeenCalledWith(true);
    const afterParentToggle = onTasksChange.mock.calls[1][0] as CheckBoxTask[];
    expect(afterParentToggle[0].subtasks?.[0].checked).toBe(true);
    expect(afterParentToggle[0].subtasks?.[1].checked).toBe(true);
    expect(afterParentToggle[0].subtasks?.[2].checked).toBe(false);

    // Toggle standalone parent task 1 (no subtasks)
    const parent1 = screen.getByTestId('tasks-cb-task-1');
    fireEvent.click(parent1);
    const afterStandaloneToggle =
      onTasksChange.mock.calls[2][0] as CheckBoxTask[];
    expect(afterStandaloneToggle[1].checked).toBe(true);
  });

  it('computes allComplete=true when all subtasks are checked', () => {
    const onTasksChange = vi.fn();
    const tasks: CheckBoxTask[] = [
      {
        name: 'All Done Group',
        checked: false,
        subtasks: [
          { name: 'One', checked: true },
          { name: 'Two', checked: false },
        ],
      },
    ];

    render(
      <MagicPaperProvider>
        <MagicCheckBox
          testId="all-done"
          tasks={tasks}
          onTasksChange={onTasksChange}
        />
      </MagicPaperProvider>
    );

    // Click subtask 'Two' to complete all subtasks
    fireEvent.click(screen.getByTestId('all-done-subtask-0-1'));
    const updated = onTasksChange.mock.calls[0][0] as CheckBoxTask[];
    expect(updated[0].checked).toBe(true);
  });
});
