/// Widgetbook 3.25 use cases for [MagicBadge].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicBadge].
WidgetbookComponent buildBadgeComponent() {
  return WidgetbookComponent(
    name: 'MagicBadge',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final content = context.knobs.string(
            label: 'Content',
            initialValue: '7',
          );
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);
          final position = context.knobs.object.dropdown<BadgePosition>(
            label: 'Position',
            options: BadgePosition.values,
            initialOption: BadgePosition.aboveAfter,
            labelBuilder: (value) => value.name,
          );
          final overlap = context.knobs.boolean(
            label: 'Overlap',
            initialValue: true,
          );
          final hidden = context.knobs.boolean(
            label: 'Hidden',
            initialValue: false,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: MagicBadge(
              content: content.isEmpty ? null : content,
              color: color,
              size: size,
              position: position,
              overlap: overlap,
              hidden: hidden,
              disabled: disabled,
              child: const Icon(Icons.notifications_outlined, size: 32),
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Positions & Colors Gallery',
        builder: (context) {
          final size = atomicSizeKnob(context);
          final overlap = context.knobs.boolean(
            label: 'Overlap',
            initialValue: true,
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
                children: <Widget>[
                  Wrap(
                    spacing: 32,
                    runSpacing: 24,
                    alignment: WrapAlignment.center,
                    children: <Widget>[
                      for (final pos in BadgePosition.values)
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          children: <Widget>[
                            MagicBadge(
                              content: '4',
                              position: pos,
                              size: size,
                              overlap: overlap,
                              disabled: disabled,
                              child: const Icon(Icons.mail_outline, size: 28),
                            ),
                            const SizedBox(height: 10),
                            Text(pos.name),
                          ],
                        ),
                    ],
                  ),
                  const SizedBox(height: 28),
                  Wrap(
                    spacing: 28,
                    runSpacing: 20,
                    alignment: WrapAlignment.center,
                    children: <Widget>[
                      for (final intent in ColorIntent.values)
                        MagicBadge(
                          content: '99+',
                          color: intent,
                          size: size,
                          overlap: overlap,
                          disabled: disabled,
                          child: Chip(label: Text(intent.name)),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Dot & Icon Fallback Gallery',
        builder: (context) {
          final color = colorIntentKnob(
            context,
            initialValue: ColorIntent.error,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: Wrap(
              spacing: 32,
              runSpacing: 24,
              alignment: WrapAlignment.center,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: <Widget>[
                for (final sz in AtomicSize.values)
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      MagicBadge(
                        size: sz,
                        color: color,
                        disabled: disabled,
                        iconName: 'notifications',
                        description: 'Unread notifications',
                      ),
                      const SizedBox(height: 8),
                      Text('Dot (${sz.name})'),
                    ],
                  ),
                MagicBadge(
                  content: 'NEW',
                  color: ColorIntent.success,
                  disabled: disabled,
                  label: 'Inbox',
                ),
                MagicBadge(
                  content: 3,
                  overlap: false,
                  color: ColorIntent.warning,
                  disabled: disabled,
                  icon: Icons.shopping_cart_outlined,
                ),
              ],
            ),
          );
        },
      ),
    ],
  );
}
