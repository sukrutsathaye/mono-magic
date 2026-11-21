/// Widgetbook 3.25 use cases for [MagicCheckBox].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicCheckBox].
WidgetbookComponent buildCheckBoxComponent() {
  return WidgetbookComponent(
    name: 'MagicCheckBox',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final label = context.knobs.string(
            label: 'Label',
            initialValue: 'Accept terms and conditions',
          );
          final checked = context.knobs.boolean(
            label: 'Checked',
            initialValue: true,
          );
          final indeterminate = context.knobs.boolean(
            label: 'Indeterminate',
            initialValue: false,
          );
          final labelPosition =
              context.knobs.object.dropdown<CheckBoxLabelPosition>(
                label: 'Label Position',
                options: CheckBoxLabelPosition.values,
                initialOption: CheckBoxLabelPosition.after,
                labelBuilder: (value) => value.name,
              );
          final requiredField = context.knobs.boolean(
            label: 'Required Field',
            initialValue: false,
          );
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          var currentChecked = checked;

          return Center(
            child: StatefulBuilder(
              builder: (context, setState) {
                return MagicCheckBox(
                  label: label,
                  checked: currentChecked,
                  indeterminate: indeterminate,
                  labelPosition: labelPosition,
                  requiredField: requiredField,
                  color: color,
                  size: size,
                  disabled: disabled,
                  onChanged: (next) => setState(() => currentChecked = next),
                );
              },
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Subtasks Hierarchy',
        builder: (context) {
          var tasks = const <CheckBoxTask>[
            CheckBoxTask(
              id: 'release',
              name: 'Release Checklist',
              subtasks: <CheckBoxTask>[
                CheckBoxTask(
                  id: 'lint',
                  name: 'Run flutter analyze',
                  checked: true,
                ),
                CheckBoxTask(
                  id: 'tests',
                  name: 'Verify widget test coverage >= 85%',
                  checked: false,
                ),
                CheckBoxTask(
                  id: 'docs',
                  name: 'Publish Widgetbook catalog',
                  checked: true,
                ),
              ],
            ),
          ];

          return Center(
            child: StatefulBuilder(
              builder: (context, setState) {
                return MagicCheckBox(
                  tasks: tasks,
                  color: ColorIntent.primary,
                  onTasksChanged: (next) => setState(() => tasks = next),
                );
              },
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Sizes & Colors Gallery',
        builder: (context) => Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Wrap(
                  spacing: 20,
                  runSpacing: 12,
                  children: <Widget>[
                    for (final sz in AtomicSize.values)
                      MagicCheckBox(
                        label: 'Size ${sz.name}',
                        size: sz,
                        checked: true,
                        onChanged: (_) {},
                      ),
                  ],
                ),
                const SizedBox(height: 20),
                Wrap(
                  spacing: 20,
                  runSpacing: 12,
                  children: <Widget>[
                    for (final intent in ColorIntent.values)
                      MagicCheckBox(
                        label: intent.name,
                        color: intent,
                        checked: true,
                        onChanged: (_) {},
                      ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    ],
  );
}
