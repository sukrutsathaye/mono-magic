/// Material 3 checkbox atom supporting single tri-state checkboxes and
/// immutable recursive subtask trees of arbitrary depth.
library;

import 'package:flutter/material.dart';

import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Material 3 checkbox atom wrapping Flutter's [Checkbox] widget.
///
/// Supports two operating modes:
/// 1. **Single checkbox mode** (when [tasks] is `null` or empty):
///    - Controlled [checked] and [indeterminate] tri-state display
///    - Clickable [label] or custom [child] with [CheckBoxLabelPosition]
///    - [requiredField] marker, [disabled], [disabledInteractive], and
///      [disableRipple]
/// 2. **Recursive subtask tree mode** (when [tasks] is non-empty):
///    - Renders [CheckBoxTask] hierarchies of arbitrary depth with progressive
///      indentation
///    - Automatically computes tri-state (`true`, `false`, or `null`
///      indeterminate) for every parent task based on its descendant states
///    - Immutably checks/unchecks all non-disabled descendants when toggling a
///      parent task and emits the updated tree via [onTasksChanged]
///    - Respects disabled ancestors and disabled subtasks without mutating them
class MagicCheckBox extends StatelessWidget {
  /// Creates a [MagicCheckBox].
  const MagicCheckBox({
    super.key,
    this.label,
    this.child,
    this.checked = false,
    this.indeterminate = false,
    this.requiredField = false,
    this.labelPosition = CheckBoxLabelPosition.after,
    this.disabled = false,
    this.disabledInteractive = false,
    this.disableRipple = false,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.name,
    this.checkboxValue,
    this.tasks,
    this.onChanged,
    this.onTasksChanged,
    this.id,
    this.testId,
    this.ariaLabel,
  });

  /// Text label displayed adjacent to the checkbox in single mode when [child]
  /// is `null`.
  final String? label;

  /// Custom label widget overriding [label] in single checkbox mode.
  final Widget? child;

  /// Whether the single checkbox is checked.
  final bool checked;

  /// Whether the single checkbox renders in an indeterminate (`null`) state.
  final bool indeterminate;

  /// Whether to append a `*` required indicator to [label].
  final bool requiredField;

  /// Placement of labels relative to their checkbox control.
  final CheckBoxLabelPosition labelPosition;

  /// Whether the checkbox (or entire task tree) is disabled.
  final bool disabled;

  /// When `true` alongside [disabled], keeps checkboxes focusable while styled
  /// visually disabled and suppressing [onChanged] / [onTasksChanged].
  final bool disabledInteractive;

  /// Whether splash/ripple ink feedback is suppressed.
  final bool disableRipple;

  /// Semantic color intent applied to selected and indeterminate checkboxes.
  final ColorIntent color;

  /// Standardized component size governing checkbox scale and label font size.
  final AtomicSize size;

  /// Optional logical form control name.
  final String? name;

  /// Optional logical checkbox value string for form serialization.
  final String? checkboxValue;

  /// Optional hierarchical checklist tasks enabling recursive subtask tree
  /// mode when non-empty.
  final List<CheckBoxTask>? tasks;

  /// Callback invoked with the next boolean state in single checkbox mode.
  final ValueChanged<bool>? onChanged;

  /// Callback invoked with the updated immutable task tree whenever any task
  /// or descendant subtask is toggled.
  final ValueChanged<List<CheckBoxTask>>? onTasksChanged;

  /// Optional logical identifier for the checkbox or checklist group.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>`.
  final String? testId;

  /// Optional accessible semantics label.
  final String? ariaLabel;

  static void _noOpNullableBool(bool? _) {}

  double _checkboxScale(AtomicSize atomicSize) => switch (atomicSize) {
    AtomicSize.xs => 0.82,
    AtomicSize.sm => 0.90,
    AtomicSize.md => 1.0,
    AtomicSize.lg => 1.12,
    AtomicSize.xl => 1.24,
  };

  /// Computes the tri-state (`true`, `false`, or `null` for indeterminate) of
  /// [task] recursively across all descendants.
  static bool? _computeTaskState(CheckBoxTask task) {
    if (task.subtasks.isEmpty) {
      return task.checked;
    }
    return _computeListState(task.subtasks);
  }

  /// Computes the aggregate tri-state of a non-empty [subtasks] list.
  static bool? _computeListState(List<CheckBoxTask> subtasks) {
    if (subtasks.isEmpty) {
      return false;
    }
    bool allTrue = true;
    bool allFalse = true;
    for (final sub in subtasks) {
      final state = _computeTaskState(sub);
      if (state != true) {
        allTrue = false;
      }
      if (state != false) {
        allFalse = false;
      }
    }
    if (allTrue) {
      return true;
    }
    if (allFalse) {
      return false;
    }
    return null;
  }

  /// Recursively sets [nextChecked] on [task] and all non-disabled descendants
  /// while leaving disabled nodes untouched.
  static CheckBoxTask _setTaskCheckedRecursive(
    CheckBoxTask task,
    bool nextChecked,
  ) {
    if (task.disabled) {
      return task;
    }
    if (task.subtasks.isEmpty) {
      return task.copyWith(checked: nextChecked);
    }
    final updatedSubtasks = task.subtasks
        .map((sub) => _setTaskCheckedRecursive(sub, nextChecked))
        .toList(growable: false);
    final aggregateState = _computeListState(updatedSubtasks);
    return task.copyWith(
      checked: aggregateState == true,
      subtasks: updatedSubtasks,
    );
  }

  /// Immutably updates the task located at index [path] within [list],
  /// recomputing ancestor `checked` flags along the return path.
  static List<CheckBoxTask> _toggleTaskAtPath(
    List<CheckBoxTask> list,
    List<int> path,
    int depth,
  ) {
    final targetIndex = path[depth];
    return List<CheckBoxTask>.generate(list.length, (index) {
      final task = list[index];
      if (index != targetIndex) {
        return task;
      }
      if (task.disabled) {
        return task;
      }
      if (depth == path.length - 1) {
        final currentState = _computeTaskState(task);
        final nextChecked = currentState != true;
        return _setTaskCheckedRecursive(task, nextChecked);
      }
      final updatedSubtasks = _toggleTaskAtPath(
        task.subtasks,
        path,
        depth + 1,
      );
      final aggregateState = _computeListState(updatedSubtasks);
      return task.copyWith(
        checked: aggregateState == true,
        subtasks: updatedSubtasks,
      );
    }, growable: false);
  }

  void _handleSingleToggle() {
    if (disabled || onChanged == null) {
      return;
    }
    onChanged!(!checked);
  }

  void _handleTaskToggle(List<int> path, bool effectiveDisabled) {
    if (disabled || effectiveDisabled || onTasksChanged == null) {
      return;
    }
    final currentTasks = tasks;
    if (currentTasks == null || currentTasks.isEmpty) {
      return;
    }
    final updated = _toggleTaskAtPath(currentTasks, path, 0);
    onTasksChanged!(updated);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final intentColors = MagicTheme.resolveIntent(context, color);
    final metrics = MagicTheme.metricsFor(size);
    final disabledColor = scheme.onSurface.withValues(alpha: 0.38);

    final bool hasTasks = tasks != null && tasks!.isNotEmpty;

    Widget content = hasTasks
        ? _buildTaskTree(
            context: context,
            taskList: tasks!,
            pathPrefix: const <int>[],
            depth: 0,
            ancestorDisabled: disabled,
            scheme: scheme,
            intentColors: intentColors,
            metrics: metrics,
            disabledColor: disabledColor,
          )
        : _buildSingleCheckBox(
            scheme: scheme,
            intentColors: intentColors,
            metrics: metrics,
            disabledColor: disabledColor,
          );

    if (disableRipple) {
      content = Theme(
        data: theme.copyWith(splashFactory: NoSplash.splashFactory),
        child: content,
      );
    }

    if (testId != null) {
      content = KeyedSubtree(
        key: ValueKey<String>(testId!),
        child: content,
      );
    }

    if (hasTasks) {
      return Semantics(
        container: true,
        enabled: !disabled,
        label: ariaLabel ?? label,
        child: content,
      );
    }

    return Semantics(
      checked: indeterminate ? null : checked,
      mixed: indeterminate,
      enabled: !disabled,
      label: ariaLabel ?? label,
      child: content,
    );
  }

  Widget _buildSingleCheckBox({
    required ColorScheme scheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
    required Color disabledColor,
  }) {
    Widget? labelWidget;
    if (child != null) {
      labelWidget = DefaultTextStyle.merge(
        style: TextStyle(
          fontSize: metrics.fontSize,
          color: disabled ? disabledColor : scheme.onSurface,
        ),
        child: child!,
      );
    } else if (label != null && label!.isNotEmpty) {
      final displayLabel = requiredField ? '$label *' : label!;
      labelWidget = Text(
        displayLabel,
        style: TextStyle(
          fontSize: metrics.fontSize,
          color: disabled ? disabledColor : scheme.onSurface,
        ),
      );
    }

    return _buildCheckBoxRow(
      value: indeterminate ? null : checked,
      tristate: indeterminate,
      isDisabled: disabled,
      labelWidget: labelWidget,
      onToggle: _handleSingleToggle,
      scheme: scheme,
      intentColors: intentColors,
      disabledColor: disabledColor,
    );
  }

  Widget _buildTaskTree({
    required BuildContext context,
    required List<CheckBoxTask> taskList,
    required List<int> pathPrefix,
    required int depth,
    required bool ancestorDisabled,
    required ColorScheme scheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
    required Color disabledColor,
  }) {
    final List<Widget> rows = <Widget>[];
    for (int i = 0; i < taskList.length; i++) {
      final task = taskList[i];
      final currentPath = <int>[...pathPrefix, i];
      final effectiveDisabled = ancestorDisabled || task.disabled;
      final taskState = _computeTaskState(task);
      final hasSubtasks = task.subtasks.isNotEmpty;

      final Widget labelWidget = Text(
        task.name,
        style: TextStyle(
          fontSize: metrics.fontSize,
          color: effectiveDisabled ? disabledColor : scheme.onSurface,
        ),
      );

      final Widget row = Padding(
        padding: EdgeInsetsDirectional.only(start: depth * 28.0),
        child: _buildCheckBoxRow(
          value: taskState,
          tristate: hasSubtasks,
          isDisabled: effectiveDisabled,
          labelWidget: labelWidget,
          onToggle: () => _handleTaskToggle(currentPath, effectiveDisabled),
          scheme: scheme,
          intentColors: intentColors,
          disabledColor: disabledColor,
        ),
      );

      rows.add(row);

      if (hasSubtasks) {
        rows.add(
          _buildTaskTree(
            context: context,
            taskList: task.subtasks,
            pathPrefix: currentPath,
            depth: depth + 1,
            ancestorDisabled: effectiveDisabled,
            scheme: scheme,
            intentColors: intentColors,
            metrics: metrics,
            disabledColor: disabledColor,
          ),
        );
      }
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: rows,
    );
  }

  Widget _buildCheckBoxRow({
    required bool? value,
    required bool tristate,
    required bool isDisabled,
    required Widget? labelWidget,
    required VoidCallback onToggle,
    required ColorScheme scheme,
    required MagicIntentColorSet intentColors,
    required Color disabledColor,
  }) {
    final bool isVisuallyDisabledInteractive =
        isDisabled && disabledInteractive;

    final WidgetStateProperty<Color?> fillColor =
        WidgetStateProperty.resolveWith<Color?>((states) {
          final isSelected = states.contains(WidgetState.selected);
          if (states.contains(WidgetState.disabled) ||
              isVisuallyDisabledInteractive) {
            return isSelected ? disabledColor : Colors.transparent;
          }
          if (isSelected) {
            return intentColors.main;
          }
          return Colors.transparent;
        });

    final Color checkColor =
        (isDisabled || isVisuallyDisabledInteractive)
        ? scheme.surface
        : intentColors.onMain;

    final WidgetStateBorderSide side = WidgetStateBorderSide.resolveWith((
      states,
    ) {
      if (states.contains(WidgetState.selected)) {
        return BorderSide.none;
      }
      final Color borderColor =
          (states.contains(WidgetState.disabled) ||
              isVisuallyDisabledInteractive)
          ? disabledColor
          : scheme.onSurfaceVariant;
      return BorderSide(color: borderColor, width: 2);
    });

    final WidgetStateProperty<Color?> overlayColor = disableRipple
        ? const WidgetStatePropertyAll<Color>(Colors.transparent)
        : WidgetStateProperty.resolveWith<Color?>((states) {
            if (states.contains(WidgetState.pressed)) {
              return intentColors.main.withValues(alpha: 0.12);
            }
            if (states.contains(WidgetState.hovered)) {
              return intentColors.main.withValues(alpha: 0.08);
            }
            if (states.contains(WidgetState.focused)) {
              return intentColors.main.withValues(alpha: 0.10);
            }
            return null;
          });

    final ValueChanged<bool?>? effectiveOnChanged;
    if (isDisabled) {
      effectiveOnChanged = disabledInteractive ? _noOpNullableBool : null;
    } else {
      effectiveOnChanged = (_) => onToggle();
    }

    final Widget checkboxControl = Transform.scale(
      scale: _checkboxScale(size),
      child: Checkbox(
        value: value,
        tristate: tristate,
        onChanged: effectiveOnChanged,
        fillColor: fillColor,
        checkColor: checkColor,
        side: side,
        overlayColor: overlayColor,
        splashRadius: disableRipple ? 0 : null,
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
    );

    if (labelWidget == null) {
      return checkboxControl;
    }

    final Widget clickableLabel = disableRipple
        ? GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: isDisabled ? null : onToggle,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 2),
              child: labelWidget,
            ),
          )
        : InkWell(
            borderRadius: const BorderRadius.all(Radius.circular(8)),
            onTap: isDisabled ? null : onToggle,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 2),
              child: labelWidget,
            ),
          );

    final List<Widget> children = labelPosition == CheckBoxLabelPosition.before
        ? <Widget>[
            clickableLabel,
            const SizedBox(width: 4),
            checkboxControl,
          ]
        : <Widget>[
            checkboxControl,
            const SizedBox(width: 4),
            clickableLabel,
          ];

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: children,
    );
  }
}
