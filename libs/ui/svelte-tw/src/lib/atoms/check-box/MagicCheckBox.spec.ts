import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import type { CheckBoxTask } from '@mono-magic/atomic-design-interfaces';
import MagicCheckBox from './MagicCheckBox.svelte';

describe('MagicCheckBox', () => {
  it('toggles checked state and emits onchange', async () => {
    const onchange = vi.fn();
    render(MagicCheckBox, {
      props: {
        id: 'terms-checkbox',
        label: 'Accept Terms',
        required: true,
        name: 'terms',
        checkboxValue: 'accepted',
        onchange,
      },
    });

    const control = screen.getByTestId('magic-check-box-control');
    expect(control).toHaveAttribute('id', 'terms-checkbox');
    expect(control).toHaveAttribute('aria-checked', 'false');

    await fireEvent.click(control);
    expect(onchange).toHaveBeenCalledWith(true);
    expect(screen.getByTestId('magic-check-box-checked')).toBeInTheDocument();
  });

  it('renders indeterminate state and labelPosition="before"', () => {
    render(MagicCheckBox, {
      props: {
        label: 'Select All',
        indeterminate: true,
        labelPosition: 'before',
        color: 'tertiary',
        size: 'lg',
        disableRipple: true,
      },
    });

    expect(screen.getByTestId('magic-check-box')).toHaveAttribute(
      'data-label-position',
      'before',
    );
    expect(
      screen.getByTestId('magic-check-box-indeterminate'),
    ).toBeInTheDocument();
  });

  it('handles nested tasks with parent/child indeterminate propagation', async () => {
    const onchange = vi.fn();
    const ontaskschange = vi.fn();
    const tasks: CheckBoxTask[] = [
      {
        id: 't1',
        name: 'Frontend',
        checked: false,
        subtasks: [
          { id: 's1', name: 'Svelte 5', checked: true },
          { id: 's2', name: 'Tailwind v4', checked: false },
        ],
      },
      { id: 't2', name: 'Tests', checked: false },
    ];

    render(MagicCheckBox, {
      props: {
        label: 'Release Checklist',
        tasks,
        onchange,
        ontaskschange,
      },
    });

    // Partially checked subtask -> root is indeterminate
    expect(
      screen.getByTestId('magic-check-box-indeterminate'),
    ).toBeInTheDocument();

    // Check remaining subtask under task 0
    await fireEvent.click(screen.getByTestId('magic-check-box-task-0-sub-1'));
    expect(ontaskschange).toHaveBeenCalled();

    // Check task 1 -> all tasks now checked -> root checked
    await fireEvent.click(screen.getByTestId('magic-check-box-task-1'));
    expect(onchange).toHaveBeenLastCalledWith(true);
    expect(screen.getByTestId('magic-check-box-checked')).toBeInTheDocument();

    // Toggle root off -> unchecks all tasks
    await fireEvent.click(screen.getByTestId('magic-check-box-control'));
    expect(onchange).toHaveBeenLastCalledWith(false);
  });

  it('blocks interaction when disabled', async () => {
    const onchange = vi.fn();
    render(MagicCheckBox, {
      props: {
        label: 'Locked',
        disabled: true,
        disabledInteractive: true,
        onchange,
      },
    });

    await fireEvent.click(screen.getByTestId('magic-check-box-control'));
    expect(onchange).not.toHaveBeenCalled();
  });
});
