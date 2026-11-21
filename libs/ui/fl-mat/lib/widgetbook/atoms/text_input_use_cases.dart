/// Widgetbook 3.25 use cases for [MagicTextInput].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicTextInput].
WidgetbookComponent buildTextInputComponent() {
  return WidgetbookComponent(
    name: 'MagicTextInput',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final type = context.knobs.object.dropdown<TextInputTypeKind>(
            label: 'Type',
            options: TextInputTypeKind.values,
            initialOption: TextInputTypeKind.email,
            labelBuilder: (value) => value.name,
          );
          final placeholder = context.knobs.string(
            label: 'Placeholder',
            initialValue: 'ada@lovelace.dev',
          );
          final value = context.knobs.string(
            label: 'Value',
            initialValue: '',
          );
          final size = atomicSizeKnob(context);
          final requiredField = context.knobs.boolean(
            label: 'Required Field',
            initialValue: true,
          );
          final readOnly = context.knobs.boolean(
            label: 'Read Only',
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
                label: 'Input (${type.name})',
                hint: 'Wrapped in MagicFormField per atomic design contract',
                appearance: FormFieldAppearance.outlined,
                size: size,
                requiredField: requiredField,
                disabled: disabled,
                child: MagicTextInput(
                  type: type,
                  placeholder: placeholder,
                  value: value.isEmpty ? null : value,
                  size: size,
                  requiredField: requiredField,
                  readOnly: readOnly,
                  disabled: disabled,
                  onChanged: (_) {},
                ),
              ),
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Bare Standalone & Input Types Gallery',
        builder: (context) {
          final size = atomicSizeKnob(context);
          final readOnly = context.knobs.boolean(
            label: 'Read Only',
            initialValue: false,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: SizedBox(
                width: 340,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: <Widget>[
                    const Text('Bare Standalone Controls'),
                    const SizedBox(height: 8),
                    MagicTextInput(
                      type: TextInputTypeKind.text,
                      placeholder: 'Standalone text control',
                      size: size,
                      readOnly: readOnly,
                      disabled: disabled,
                    ),
                    const SizedBox(height: 12),
                    MagicTextInput(
                      type: TextInputTypeKind.search,
                      placeholder: 'Standalone search control',
                      size: AtomicSize.sm,
                      readOnly: readOnly,
                      disabled: disabled,
                    ),
                    const SizedBox(height: 20),
                    const Text('Input Types inside MagicFormField'),
                    const SizedBox(height: 8),
                    MagicFormField(
                      label: 'Password',
                      appearance: FormFieldAppearance.filled,
                      size: size,
                      disabled: disabled,
                      child: MagicTextInput(
                        type: TextInputTypeKind.password,
                        value: 'secret123',
                        size: size,
                        readOnly: readOnly,
                        disabled: disabled,
                      ),
                    ),
                    const SizedBox(height: 12),
                    MagicFormField(
                      label: 'Phone',
                      size: size,
                      disabled: disabled,
                      child: MagicTextInput(
                        type: TextInputTypeKind.tel,
                        placeholder: '+1 (555) 010-9988',
                        size: size,
                        readOnly: readOnly,
                        disabled: disabled,
                      ),
                    ),
                    const SizedBox(height: 12),
                    MagicFormField(
                      label: 'Quantity',
                      errorText: 'Must be greater than 0',
                      size: size,
                      disabled: disabled,
                      child: MagicTextInput(
                        type: TextInputTypeKind.number,
                        value: '0',
                        invalid: true,
                        size: size,
                        readOnly: readOnly,
                        disabled: disabled,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    ],
  );
}
