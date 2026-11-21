/// Widgetbook 3.25 use cases for [MagicSlideToggle].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicSlideToggle].
WidgetbookComponent buildSlideToggleComponent() {
  return WidgetbookComponent(
    name: 'MagicSlideToggle',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final label = context.knobs.string(
            label: 'Label',
            initialValue: 'Enable Notifications',
          );
          final checked = context.knobs.boolean(
            label: 'Checked',
            initialValue: true,
          );
          final hideIcon = context.knobs.boolean(
            label: 'Hide Icon',
            initialValue: false,
          );
          final labelPosition =
              context.knobs.object.dropdown<SlideToggleLabelPosition>(
                label: 'Label Position',
                options: SlideToggleLabelPosition.values,
                initialOption: SlideToggleLabelPosition.after,
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
                return MagicSlideToggle(
                  label: label,
                  checked: currentChecked,
                  hideIcon: hideIcon,
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
        name: 'Sizes, Colors & Label Positions Gallery',
        builder: (context) {
          final hideIcon = context.knobs.boolean(
            label: 'Hide Icon',
            initialValue: false,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
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
                        MagicSlideToggle(
                          label: sz.name.toUpperCase(),
                          size: sz,
                          checked: true,
                          hideIcon: hideIcon,
                          disabled: disabled,
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
                        MagicSlideToggle(
                          label: intent.name,
                          color: intent,
                          checked: true,
                          hideIcon: hideIcon,
                          disabled: disabled,
                          onChanged: (_) {},
                        ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Wrap(
                    spacing: 24,
                    runSpacing: 12,
                    children: <Widget>[
                      MagicSlideToggle(
                        label: 'Label Before',
                        labelPosition: SlideToggleLabelPosition.before,
                        checked: true,
                        hideIcon: hideIcon,
                        disabled: disabled,
                        onChanged: (_) {},
                      ),
                      MagicSlideToggle(
                        label: 'No Thumb Icon',
                        hideIcon: true,
                        checked: false,
                        disabled: disabled,
                        onChanged: (_) {},
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    ],
  );
}
