import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import type { FormCheckboxControl } from '@angular/forms/signals';
import {
  MatCheckbox,
  type MatCheckboxChange,
} from '@angular/material/checkbox';
import type {
  AtomicSize,
  CheckBoxAtomProps,
  CheckBoxLabelPosition,
  CheckBoxTask,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';
import {
  provideMagicValueAccessor,
  type MagicCvaTarget,
} from '../../forms/magic-cva';

export type { CheckBoxTask };

/**
 * Wraps Angular Material's `mat-checkbox` with Signal Forms (`FormCheckboxControl`),
 * Reactive/Template Forms (`NG_VALUE_ACCESSOR` bridge), indeterminate state, and
 * optional immutable hierarchical task lists.
 *
 * Content is projected (`<magic-check-box>Accept</magic-check-box>`) with `label` fallback.
 *
 * @see https://material.angular.dev/components/checkbox/overview
 */
@Component({
  selector: 'magic-check-box',
  imports: [MatCheckbox],
  templateUrl: './check-box.component.html',
  styleUrl: './check-box.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideMagicValueAccessor(() => MagicCheckBoxComponent)],
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicCheckBoxComponent
  implements
    SignalProps<CheckBoxAtomProps>,
    FormCheckboxControl,
    MagicCvaTarget<boolean>
{
  /** Id applied to the inner checkbox/group (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid`. */
  readonly testId = input<string>();
  /** Accessible name; falls back to `label`. */
  readonly ariaLabel = input<string>();
  /** Label fallback when no content is projected. */
  readonly label = input<string>();
  /** Checked state. Two-way bindable and synced with forms. */
  readonly checked = model(false);
  /** Indeterminate visual state. */
  readonly indeterminate = model(false);
  /** Disables the checkbox. */
  readonly disabled = input(false);
  /** Marks the checkbox as required. */
  readonly required = input(false);
  /** Places the label `'before'` or `'after'` the box. */
  readonly labelPosition = input<CheckBoxLabelPosition>('after');
  /** Disables the ripple animation. */
  readonly disableRipple = input(false);
  /** Keeps the checkbox focusable while disabled. */
  readonly disabledInteractive = input(false);
  /** Semantic color role. */
  readonly color = input<ColorIntent>('primary');
  /** Control size token (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');
  /** Native form control `name`. */
  readonly name = input<string>('');
  /** Native HTML checkbox `value` attribute. */
  readonly checkboxValue = input<string>();
  /** Optional parent/subtask checklist items (updated immutably). */
  readonly tasks = model<readonly CheckBoxTask[]>([]);
  /** Signal Forms invalid state. */
  readonly invalid = input(false);
  /** Signal Forms touched state. */
  readonly touched = input(false);
  /** Signal Forms dirty state. */
  readonly dirty = input(false);

  /** Emits when the single checkbox toggles. */
  readonly changed = output<boolean>();
  /** Emits the updated immutable task list when any task changes. */
  readonly tasksChanged = output<readonly CheckBoxTask[]>();
  /** Emits when focus leaves the control (`FormCheckboxControl.touch`). */
  readonly touch = output<void>();

  /** @internal */
  readonly formDisabled = signal(false);

  /** Effective disabled state combining `disabled` input and form disabled state. */
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  protected readonly hostClasses = computed(
    () => `magic-size-${this.size()} magic-color-${this.color()}`,
  );

  /** Returns true when some (but not all) subtasks of `taskIndex` are checked. */
  isPartiallyComplete(taskIndex: number): boolean {
    const subtasks = this.tasks()[taskIndex]?.subtasks;
    if (!subtasks?.length) {
      return false;
    }
    const allChecked = subtasks.every((sub) => Boolean(sub.checked));
    const someChecked = subtasks.some((sub) => Boolean(sub.checked));
    return someChecked && !allChecked;
  }

  /** Immutably toggles a parent task or a single subtask. */
  toggleTask(taskIndex: number, subtaskIndex?: number, nextChecked?: boolean): void {
    const updated = this.tasks().map((task, idx) => {
      if (idx !== taskIndex) {
        return task;
      }
      if (subtaskIndex === undefined) {
        const checked = nextChecked ?? !task.checked;
        return {
          ...task,
          checked,
          subtasks: task.subtasks?.map((sub) => ({ ...sub, checked })),
        };
      }
      const nextSubtasks = (task.subtasks ?? []).map((sub, sIdx) =>
        sIdx === subtaskIndex
          ? { ...sub, checked: nextChecked ?? !sub.checked }
          : sub,
      );
      const allChecked =
        nextSubtasks.length > 0 && nextSubtasks.every((sub) => Boolean(sub.checked));
      return {
        ...task,
        checked: allChecked,
        subtasks: nextSubtasks,
      };
    });

    this.tasks.set(updated);
    this.tasksChanged.emit(updated);
  }

  protected onSingleChange(event: MatCheckboxChange): void {
    this.indeterminate.set(false);
    this.checked.set(event.checked);
    this.changed.emit(event.checked);
  }
}
