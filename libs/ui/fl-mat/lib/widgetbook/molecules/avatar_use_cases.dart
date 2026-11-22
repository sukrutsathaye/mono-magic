/// Widgetbook 3.25 use cases for [MagicAvatar] and [MagicAvatarGroup].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicAvatar].
WidgetbookComponent buildMagicAvatarComponent() {
  return WidgetbookComponent(
    name: 'MagicAvatar',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Avatar & Group',
        builder: (context) {
          final name = context.knobs.string(
            label: 'Name',
            initialValue: 'Ada Lovelace',
          );
          final size = atomicSizeKnob(context);
          final color = colorIntentKnob(context);
          final shape = context.knobs.object.dropdown<AvatarShape>(
            label: 'Shape',
            options: AvatarShape.values,
            initialOption: AvatarShape.circle,
            labelBuilder: (v) => v.name,
          );
          final status = context.knobs.objectOrNull.dropdown<AvatarStatus>(
            label: 'Status',
            options: AvatarStatus.values,
            initialOption: AvatarStatus.online,
            labelBuilder: (v) => v.name,
          );
          final spacing = context.knobs.object.dropdown<AvatarGroupSpacing>(
            label: 'Group Spacing',
            options: AvatarGroupSpacing.values,
            initialOption: AvatarGroupSpacing.normal,
            labelBuilder: (v) => v.name,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                MagicAvatar(
                  name: name,
                  size: size,
                  color: color,
                  shape: shape,
                  status: status,
                  disabled: disabled,
                ),
                const SizedBox(height: 24),
                MagicAvatarGroup(
                  size: size,
                  spacing: spacing,
                  max: 3,
                  disabled: disabled,
                  items: const <AvatarGroupItem>[
                    AvatarGroupItem(
                      name: 'Ada Lovelace',
                      color: ColorIntent.primary,
                      status: AvatarStatus.online,
                    ),
                    AvatarGroupItem(
                      name: 'Grace Hopper',
                      color: ColorIntent.secondary,
                      status: AvatarStatus.busy,
                    ),
                    AvatarGroupItem(
                      name: 'Alan Turing',
                      color: ColorIntent.tertiary,
                      status: AvatarStatus.offline,
                    ),
                    AvatarGroupItem(
                      name: 'Linus Torvalds',
                      color: ColorIntent.success,
                    ),
                    AvatarGroupItem(
                      name: 'Margaret Hamilton',
                      color: ColorIntent.warning,
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Sizes, Shapes & Fallback Matrix',
        builder: (context) => Center(
          child: Wrap(
            spacing: 16,
            runSpacing: 16,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: const <Widget>[
              MagicAvatar(
                initials: 'XS',
                size: AtomicSize.xs,
                color: ColorIntent.primary,
              ),
              MagicAvatar(
                name: 'Samira Khan',
                size: AtomicSize.sm,
                shape: AvatarShape.rounded,
                color: ColorIntent.secondary,
                status: AvatarStatus.online,
              ),
              MagicAvatar(
                iconName: 'person',
                size: AtomicSize.md,
                shape: AvatarShape.square,
                color: ColorIntent.tertiary,
                status: AvatarStatus.busy,
              ),
              MagicAvatar(
                name: 'Carlos Mendez',
                size: AtomicSize.lg,
                color: ColorIntent.success,
                status: AvatarStatus.offline,
              ),
              MagicAvatar(
                initials: 'XL',
                size: AtomicSize.xl,
                color: ColorIntent.error,
              ),
            ],
          ),
        ),
      ),
    ],
  );
}
