/// Widgetbook 3.25 use cases for [MagicMenu].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicMenu].
WidgetbookComponent buildMagicMenuComponent() {
  return WidgetbookComponent(
    name: 'MagicMenu',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final triggerLabel = context.knobs.string(
            label: 'Trigger Label',
            initialValue: 'Actions',
          );
          final triggerIcon = context.knobs.string(
            label: 'Trigger Icon',
            initialValue: 'more_vert',
          );
          final triggerType = context.knobs.object.dropdown<MenuTriggerType>(
            label: 'Trigger Type',
            options: MenuTriggerType.values,
            initialOption: MenuTriggerType.button,
            labelBuilder: (v) => v.name,
          );
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: MagicMenu(
              triggerLabel: triggerLabel,
              triggerIcon: triggerIcon,
              triggerType: triggerType,
              color: color,
              size: size,
              disabled: disabled,
              items: const <MenuItemData>[
                MenuItemData(
                  id: 'edit',
                  label: 'Edit Item',
                  iconName: 'edit',
                ),
                MenuItemData(
                  id: 'share',
                  label: 'Share',
                  iconName: 'share',
                  children: <MenuItemData>[
                    MenuItemData(
                      id: 'copy-link',
                      label: 'Copy Link',
                      iconName: 'link',
                    ),
                    MenuItemData(
                      id: 'email',
                      label: 'Send Email',
                      iconName: 'email',
                    ),
                  ],
                ),
                MenuItemData(
                  id: 'delete',
                  label: 'Delete',
                  iconName: 'delete',
                  disabled: true,
                ),
              ],
              onItemSelect: (_) {},
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Icon Trigger',
        builder: (context) {
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: MagicMenu(
              triggerType: MenuTriggerType.icon,
              triggerIcon: 'more_vert',
              triggerLabel: 'More options',
              color: color,
              size: size,
              disabled: disabled,
              items: const <MenuItemData>[
                MenuItemData(
                  id: 'refresh',
                  label: 'Refresh',
                  iconName: 'refresh',
                ),
                MenuItemData(
                  id: 'settings',
                  label: 'Settings',
                  iconName: 'settings',
                ),
              ],
              onItemSelect: (_) {},
            ),
          );
        },
      ),
    ],
  );
}
