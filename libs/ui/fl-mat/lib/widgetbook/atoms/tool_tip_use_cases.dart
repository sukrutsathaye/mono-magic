/// Widgetbook 3.25 use cases for [MagicToolTip].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicToolTip].
WidgetbookComponent buildToolTipComponent() {
  return WidgetbookComponent(
    name: 'MagicToolTip',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final message = context.knobs.string(
            label: 'Message',
            initialValue: 'Hover or tap to inspect action details',
          );
          final label = context.knobs.string(
            label: 'Label',
            initialValue: 'Inspect Element',
          );
          final position = context.knobs.object.dropdown<ToolTipPosition>(
            label: 'Position',
            options: ToolTipPosition.values,
            initialOption: ToolTipPosition.below,
            labelBuilder: (value) => value.name,
          );
          final touchGestures =
              context.knobs.object.dropdown<ToolTipTouchGestures>(
                label: 'Touch Gestures',
                options: ToolTipTouchGestures.values,
                initialOption: ToolTipTouchGestures.auto,
                labelBuilder: (value) => value.name,
              );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: MagicToolTip(
              message: message,
              position: position,
              touchGestures: touchGestures,
              disabled: disabled,
              child: MagicButton(
                label: label,
                variant: ButtonVariant.tonal,
                onPressed: () {},
              ),
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'All 6 Positions Gallery',
        builder: (context) {
          final touchGestures =
              context.knobs.object.dropdown<ToolTipTouchGestures>(
                label: 'Touch Gestures',
                options: ToolTipTouchGestures.values,
                initialOption: ToolTipTouchGestures.on,
                labelBuilder: (value) => value.name,
              );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Wrap(
                spacing: 16,
                runSpacing: 16,
                alignment: WrapAlignment.center,
                children: <Widget>[
                  for (final pos in ToolTipPosition.values)
                    MagicToolTip(
                      message: 'Tooltip positioned ${pos.name}',
                      position: pos,
                      touchGestures: touchGestures,
                      disabled: disabled,
                      child: MagicButton(
                        label: pos.name,
                        variant: ButtonVariant.outlined,
                        onPressed: () {},
                      ),
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
