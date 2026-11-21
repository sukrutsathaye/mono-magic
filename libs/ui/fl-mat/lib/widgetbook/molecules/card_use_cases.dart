/// Widgetbook 3.25 use cases for [MagicCard].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicCard].
WidgetbookComponent buildMagicCardComponent() {
  return WidgetbookComponent(
    name: 'MagicCard',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final title = context.knobs.string(
            label: 'Title',
            initialValue: 'Mono-Magic Design System',
          );
          final subtitle = context.knobs.string(
            label: 'Subtitle',
            initialValue: 'Cross-framework Atomic Design 3.0',
          );
          final content = context.knobs.string(
            label: 'Content',
            initialValue:
                'Unified Material 3 tokens, strict interface parity, and 80%+ test coverage.',
          );
          final appearance = context.knobs.object.dropdown<CardAppearance>(
            label: 'Appearance',
            options: CardAppearance.values,
            initialOption: CardAppearance.outlined,
            labelBuilder: (v) => v.name,
          );
          final variant = context.knobs.object.dropdown<CardVariant>(
            label: 'Variant',
            options: CardVariant.values,
            initialOption: CardVariant.withActions,
            labelBuilder: (v) => v.name,
          );
          final alignActions =
              context.knobs.object.dropdown<CardActionsAlignment>(
                label: 'Align Actions',
                options: CardActionsAlignment.values,
                initialOption: CardActionsAlignment.end,
                labelBuilder: (v) => v.name,
              );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: MagicCard(
              title: title,
              subtitle: subtitle,
              content: content,
              appearance: appearance,
              variant: variant,
              alignActions: alignActions,
              disabled: disabled,
              width: 380,
              chips: const <ChipItem>[
                ChipItem(id: 'm3', label: 'Material 3'),
                ChipItem(id: 'flutter', label: 'Flutter 3.50'),
              ],
              actions: const <CardActionItem>[
                CardActionItem(
                  id: 'docs',
                  label: 'Docs',
                  variant: ButtonVariant.text,
                ),
                CardActionItem(
                  id: 'explore',
                  label: 'Explore',
                  variant: ButtonVariant.filled,
                ),
              ],
              onActionClick: (_) {},
              onChipSelect: (_) {},
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Raised with Chips & Custom Footer',
        builder: (context) {
          final appearance = context.knobs.object.dropdown<CardAppearance>(
            label: 'Appearance',
            options: CardAppearance.values,
            initialOption: CardAppearance.raised,
            labelBuilder: (v) => v.name,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: MagicCard(
              title: 'Release v3.50',
              subtitle: 'Production Ready',
              content: 'Includes all 11 atoms and 5 molecules.',
              appearance: appearance,
              variant: CardVariant.withChips,
              disabled: disabled,
              width: 360,
              chips: const <ChipItem>[
                ChipItem(label: 'Verified', leadingIconName: 'verified'),
                ChipItem(label: 'Stable', leadingIconName: 'check_circle'),
              ],
              footerSlot: const Text('Last updated today'),
            ),
          );
        },
      ),
    ],
  );
}
