/// Widgetbook 3.25 use cases for [MagicSearchBar].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicSearchBar].
WidgetbookComponent buildMagicSearchBarComponent() {
  return WidgetbookComponent(
    name: 'MagicSearchBar',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final label = context.knobs.string(
            label: 'Label',
            initialValue: 'Search components',
          );
          final placeholder = context.knobs.string(
            label: 'Placeholder',
            initialValue: 'Type an atom or molecule...',
          );
          final submitLabel = context.knobs.string(
            label: 'Submit Label',
            initialValue: 'Search',
          );
          final appearance = formFieldAppearanceKnob(context);
          final buttonVariant = buttonVariantKnob(context);
          final buttonColor = colorIntentKnob(context, label: 'Button Color');
          final size = atomicSizeKnob(context);
          final loading = context.knobs.boolean(
            label: 'Loading',
            initialValue: false,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: SizedBox(
              width: 440,
              child: MagicSearchBar(
                label: label,
                placeholder: placeholder,
                submitLabel: submitLabel,
                appearance: appearance,
                buttonVariant: buttonVariant,
                buttonColor: buttonColor,
                size: size,
                loading: loading,
                disabled: disabled,
                onSubmitted: (_) {},
              ),
            ),
          );
        },
      ),
    ],
  );
}
