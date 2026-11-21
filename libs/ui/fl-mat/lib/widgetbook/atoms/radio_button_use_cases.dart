/// Widgetbook 3.25 use cases for [MagicRadioButton].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

const List<RadioOption<String>> _deliveryOptions = <RadioOption<String>>[
  RadioOption<String>(value: 'standard', label: 'Standard Shipping'),
  RadioOption<String>(value: 'express', label: 'Express (2-Day)'),
  RadioOption<String>(
    value: 'overnight',
    label: 'Overnight (Unavailable)',
    disabled: true,
  ),
];

/// Builds the [WidgetbookComponent] catalog entry for [MagicRadioButton].
WidgetbookComponent buildRadioButtonComponent() {
  return WidgetbookComponent(
    name: 'MagicRadioButton',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final vertical = context.knobs.boolean(
            label: 'Vertical',
            initialValue: true,
          );
          final labelPosition =
              context.knobs.object.dropdown<RadioLabelPosition>(
                label: 'Label Position',
                options: RadioLabelPosition.values,
                initialOption: RadioLabelPosition.after,
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
          final disabledInteractive = context.knobs.boolean(
            label: 'Disabled Interactive',
            initialValue: false,
          );

          String? selected = 'standard';

          return Center(
            child: StatefulBuilder(
              builder: (context, setState) {
                return MagicRadioButton<String>(
                  options: _deliveryOptions,
                  value: selected,
                  vertical: vertical,
                  labelPosition: labelPosition,
                  requiredField: requiredField,
                  color: color,
                  size: size,
                  disabled: disabled,
                  disabledInteractive: disabledInteractive,
                  onChanged: (next) => setState(() => selected = next),
                );
              },
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Horizontal vs Vertical & Colors Gallery',
        builder: (context) {
          final size = atomicSizeKnob(context);
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          String? horizontalChoice = 'email';
          String? verticalChoice = 'dark';

          return Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: StatefulBuilder(
                builder: (context, setState) {
                  return Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      MagicRadioButton<String>(
                        vertical: false,
                        color: ColorIntent.secondary,
                        size: size,
                        disabled: disabled,
                        value: horizontalChoice,
                        options: const <RadioOption<String>>[
                          RadioOption<String>(value: 'email', label: 'Email'),
                          RadioOption<String>(value: 'sms', label: 'SMS'),
                          RadioOption<String>(value: 'push', label: 'Push'),
                        ],
                        onChanged: (next) =>
                            setState(() => horizontalChoice = next),
                      ),
                      const SizedBox(height: 24),
                      MagicRadioButton<String>(
                        vertical: true,
                        color: ColorIntent.tertiary,
                        size: size,
                        disabled: disabled,
                        labelPosition: RadioLabelPosition.before,
                        value: verticalChoice,
                        options: const <RadioOption<String>>[
                          RadioOption<String>(value: 'light', label: 'Light'),
                          RadioOption<String>(value: 'dark', label: 'Dark'),
                          RadioOption<String>(value: 'system', label: 'System'),
                        ],
                        onChanged: (next) =>
                            setState(() => verticalChoice = next),
                      ),
                    ],
                  );
                },
              ),
            ),
          );
        },
      ),
    ],
  );
}
