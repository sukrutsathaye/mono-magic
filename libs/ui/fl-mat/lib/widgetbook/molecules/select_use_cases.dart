/// Widgetbook 3.25 use cases for [MagicSelect].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicSelect].
WidgetbookComponent buildMagicSelectComponent() {
  return WidgetbookComponent(
    name: 'MagicSelect',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Single Select',
        builder: (context) {
          final label = context.knobs.string(
            label: 'Label',
            initialValue: 'Target Framework',
          );
          final placeholder = context.knobs.string(
            label: 'Placeholder',
            initialValue: 'Select a framework',
          );
          final hint = context.knobs.string(
            label: 'Hint',
            initialValue: 'Choose a primary UI stack',
          );
          final appearance = formFieldAppearanceKnob(context);
          final size = atomicSizeKnob(context);
          final requiredField = context.knobs.boolean(
            label: 'Required',
            initialValue: true,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: SizedBox(
              width: 340,
              child: MagicSelect<String>(
                label: label,
                placeholder: placeholder,
                hint: hint,
                appearance: appearance,
                size: size,
                requiredField: requiredField,
                disabled: disabled,
                value: 'flutter',
                options: const <SelectOption<String>>[
                  SelectOption<String>(
                    value: 'flutter',
                    label: 'Flutter Material 3',
                  ),
                  SelectOption<String>(
                    value: 'angular',
                    label: 'Angular Material 3',
                  ),
                  SelectOption<String>(
                    value: 'react',
                    label: 'React MUI (Planned)',
                    disabled: true,
                  ),
                ],
                onChanged: (_) {},
              ),
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Multi-Select with Groups & Summary',
        builder: (context) {
          final appearance = formFieldAppearanceKnob(context);
          final size = atomicSizeKnob(context);
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: SizedBox(
              width: 340,
              child: MagicSelect<String>(
                label: 'Enabled Palettes',
                appearance: appearance,
                size: size,
                disabled: disabled,
                multiple: true,
                customTriggerSummary: true,
                values: const <String>['azure-blue', 'dark-theme'],
                optionGroups: const <SelectOptionGroup<String>>[
                  SelectOptionGroup<String>(
                    label: 'Light Palettes',
                    options: <SelectOption<String>>[
                      SelectOption<String>(
                        value: 'azure-blue',
                        label: 'Azure Blue',
                      ),
                      SelectOption<String>(
                        value: 'rose-red',
                        label: 'Rose Red',
                      ),
                    ],
                  ),
                  SelectOptionGroup<String>(
                    label: 'Dark Palettes',
                    options: <SelectOption<String>>[
                      SelectOption<String>(
                        value: 'dark-theme',
                        label: 'Green / Orange',
                      ),
                      SelectOption<String>(
                        value: 'cyan-orange',
                        label: 'Cyan Orange',
                      ),
                    ],
                  ),
                ],
                onMultiChanged: (_) {},
              ),
            ),
          );
        },
      ),
    ],
  );
}
