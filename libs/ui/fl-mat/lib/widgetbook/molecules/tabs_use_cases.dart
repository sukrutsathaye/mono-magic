/// Widgetbook 3.25 use cases for [MagicTabs].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicTabs].
WidgetbookComponent buildMagicTabsComponent() {
  return WidgetbookComponent(
    name: 'MagicTabs',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final orientation = context.knobs.object.dropdown<TabsOrientation>(
            label: 'Orientation',
            options: TabsOrientation.values,
            initialOption: TabsOrientation.horizontal,
            labelBuilder: (v) => v.name,
          );
          final variant = context.knobs.object.dropdown<TabsVariant>(
            label: 'Variant',
            options: TabsVariant.values,
            initialOption: TabsVariant.primary,
            labelBuilder: (v) => v.name,
          );
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);
          final scrollable = context.knobs.boolean(
            label: 'Scrollable',
            initialValue: false,
          );
          final lazy = context.knobs.boolean(
            label: 'Lazy',
            initialValue: false,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 640, maxHeight: 360),
              child: MagicTabs(
                orientation: orientation,
                variant: variant,
                color: color,
                size: size,
                scrollable: scrollable,
                lazy: lazy,
                disabled: disabled,
                defaultActiveTabId: 'overview',
                items: const <TabItem>[
                  TabItem(
                    id: 'overview',
                    label: 'Overview',
                    iconName: 'dashboard',
                    content:
                        'Overview metrics and Material 3 design system status.',
                  ),
                  TabItem(
                    id: 'alerts',
                    label: 'Alerts',
                    iconName: 'notifications',
                    badgeContent: 4,
                    content: '4 active notifications across workspace CI runs.',
                  ),
                  TabItem(
                    id: 'settings',
                    label: 'Settings',
                    iconName: 'settings',
                    content: 'Configure tokens, contrast palettes, and flags.',
                  ),
                  TabItem(
                    id: 'archived',
                    label: 'Archived',
                    iconName: 'folder',
                    disabled: true,
                    content: 'Disabled archive tab.',
                  ),
                ],
                onTabChange: (_) {},
              ),
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Vertical Secondary Tabs',
        builder: (context) => const Center(
          child: SizedBox(
            width: 560,
            child: MagicTabs(
              orientation: TabsOrientation.vertical,
              variant: TabsVariant.secondary,
              color: ColorIntent.secondary,
              items: <TabItem>[
                TabItem(
                  id: 'profile',
                  label: 'Profile',
                  iconName: 'person',
                  content: 'Manage profile avatar, initials, and display name.',
                ),
                TabItem(
                  id: 'security',
                  label: 'Security',
                  iconName: 'security',
                  badgeContent: 'New',
                  content: 'Configure MFA and active session policies.',
                ),
                TabItem(
                  id: 'billing',
                  label: 'Billing',
                  iconName: 'shopping_bag',
                  content: 'View usage invoices and subscription tiers.',
                ),
              ],
            ),
          ),
        ),
      ),
    ],
  );
}
