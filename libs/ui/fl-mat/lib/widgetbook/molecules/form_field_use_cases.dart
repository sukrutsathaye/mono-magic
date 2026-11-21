/// Widgetbook 3.25 use cases for [MagicFormField].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicFormField].
WidgetbookComponent buildMagicFormFieldComponent() {
  return WidgetbookComponent(
    name: 'MagicFormField',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final label = context.knobs.string(
            label: 'Label',
            initialValue: 'Full Name',
          );
          final hint = context.knobs.string(
            label: 'Hint',
            initialValue: 'Enter your legal name',
          );
          final errorText = context.knobs.string(
            label: 'Error Text',
            initialValue: '',
          );
          final appearance = formFieldAppearanceKnob(context);
          final size = atomicSizeKnob(context);
          final requiredField = context.knobs.boolean(
            label: 'Required',
            initialValue: true,
          );
          final hideRequiredMarker = context.knobs.boolean(
            label: 'Hide Required Marker',
            initialValue: false,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: SizedBox(
              width: 340,
              child: MagicFormField(
                label: label,
                hint: hint,
                errorText: errorText.isEmpty ? null : errorText,
                appearance: appearance,
                size: size,
                requiredField: requiredField,
                hideRequiredMarker: hideRequiredMarker,
                disabled: disabled,
                child: MagicTextInput(
                  placeholder: 'Ada Lovelace',
                  size: size,
                  disabled: disabled,
                ),
              ),
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Filled with Prefix & Error',
        builder: (context) => const Center(
          child: SizedBox(
            width: 340,
            child: MagicFormField(
              label: 'Work Email',
              errorText: 'Please enter a valid company domain.',
              appearance: FormFieldAppearance.filled,
              prefix: Icon(Icons.email_outlined),
              child: MagicTextInput(
                type: TextInputTypeKind.email,
                value: 'ada@personal.org',
              ),
            ),
          ),
        ),
      ),
    ],
  );
}
