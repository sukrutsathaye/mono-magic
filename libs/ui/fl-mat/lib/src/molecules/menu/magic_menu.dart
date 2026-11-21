/// Menu molecule composing [MagicButton] and Flutter 3.50 non-deprecated
/// [MenuAnchor], [MenuItemButton], and recursive [SubmenuButton].
library;

import 'package:flutter/material.dart';

import '../../atoms/button/magic_button.dart';
import '../../core/magic_icon.dart';
import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Material 3 dropdown menu molecule supporting standard button and icon
/// triggers, configurable x/y positioning, overlap mode, outside-tap backdrop
/// consumption, and recursive nested submenus of arbitrary depth.
///
/// Mirrors `MenuMoleculeProps` from `@mono-magic/atomic-design-interfaces`
/// and `ng-mat`'s `MagicMenuComponent`.
class MagicMenu extends StatelessWidget {
  /// Creates a [MagicMenu].
  const MagicMenu({
    super.key,
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    required this.items,
    this.triggerLabel = 'Menu',
    this.triggerIcon = 'more_vert',
    this.triggerType = MenuTriggerType.button,
    this.xPosition = MenuPositionX.after,
    this.yPosition = MenuPositionY.below,
    this.overlapTrigger = false,
    this.hasBackdrop = true,
    this.size = AtomicSize.md,
    this.color = ColorIntent.primary,
    this.onItemSelect,
    this.onMenuOpen,
    this.onMenuClose,
  });

  /// Optional logical identifier for the menu.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>`.
  final String? testId;

  /// Optional accessible semantics label for the menu trigger and overlay.
  final String? ariaLabel;

  /// Whether the menu trigger is disabled.
  final bool disabled;

  /// Hierarchical collection of menu items (items with non-empty
  /// [MenuItemData.children] render recursive [SubmenuButton] cascades).
  final List<MenuItemData> items;

  /// Label displayed on the trigger when [triggerType] is
  /// [MenuTriggerType.button], or used as tooltip fallback for icon triggers.
  final String triggerLabel;

  /// Material icon name displayed on the trigger button.
  final String triggerIcon;

  /// Visual style of the trigger control (`button` or `icon`).
  final MenuTriggerType triggerType;

  /// Horizontal menu opening alignment relative to the trigger (`before` or
  /// `after`).
  final MenuPositionX xPosition;

  /// Vertical menu opening alignment relative to the trigger (`above` or
  /// `below`).
  final MenuPositionY yPosition;

  /// Whether the menu panel overlaps the trigger vertically instead of opening
  /// adjacent to its edge.
  final bool overlapTrigger;

  /// Whether outside taps are consumed when closing the menu.
  final bool hasBackdrop;

  /// Standardized component size applied to the trigger and menu items.
  final AtomicSize size;

  /// Semantic color intent applied to the trigger button.
  final ColorIntent color;

  /// Callback invoked when an enabled leaf [MenuItemData] is selected.
  final ValueChanged<MenuItemData>? onItemSelect;

  /// Callback invoked when the root menu panel opens.
  final VoidCallback? onMenuOpen;

  /// Callback invoked when the root menu panel closes.
  final VoidCallback? onMenuClose;

  Offset _computeAlignmentOffset(MagicSizeMetrics metrics) {
    final double dx = xPosition == MenuPositionX.before ? -24.0 : 0.0;
    final double dy;
    if (overlapTrigger) {
      dy = -metrics.height;
    } else if (yPosition == MenuPositionY.above) {
      dy = -(metrics.height * 2);
    } else {
      dy = 0.0;
    }
    return Offset(dx, dy);
  }

  List<Widget> _buildMenuChildren(
    BuildContext context,
    List<MenuItemData> nodeList,
    MagicSizeMetrics metrics,
  ) {
    return <Widget>[
      for (final item in nodeList)
        _buildMenuNode(context, item, metrics),
    ];
  }

  Widget _buildMenuNode(
    BuildContext context,
    MenuItemData item,
    MagicSizeMetrics metrics,
  ) {
    final Widget? leadingIconWidget =
        (item.icon != null || (item.iconName != null && item.iconName!.isNotEmpty))
        ? MagicIcon(
            icon: item.icon,
            iconName: item.iconName,
            size: metrics.iconSize,
          )
        : null;

    if (item.children.isNotEmpty) {
      return SubmenuButton(
        key: item.id != null ? ValueKey<String>('menu-item-${item.id}') : null,
        leadingIcon: leadingIconWidget,
        menuChildren: item.disabled
            ? const <Widget>[]
            : _buildMenuChildren(context, item.children, metrics),
        child: Text(
          item.label,
          style: TextStyle(fontSize: metrics.fontSize),
        ),
      );
    }

    return MenuItemButton(
      key: item.id != null ? ValueKey<String>('menu-item-${item.id}') : null,
      leadingIcon: leadingIconWidget,
      onPressed: item.disabled ? null : () => onItemSelect?.call(item),
      child: Text(
        item.label,
        style: TextStyle(fontSize: metrics.fontSize),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final metrics = MagicTheme.metricsFor(size);
    final bool isIconTrigger = triggerType == MenuTriggerType.icon;

    Widget menuAnchor = MenuAnchor(
      consumeOutsideTap: hasBackdrop,
      alignmentOffset: _computeAlignmentOffset(metrics),
      onOpen: onMenuOpen,
      onClose: onMenuClose,
      menuChildren: _buildMenuChildren(context, items, metrics),
      builder: (context, controller, child) {
        return MagicButton(
          id: id,
          testId: testId != null ? '$testId-trigger' : null,
          ariaLabel: ariaLabel ?? triggerLabel,
          label: triggerLabel,
          kind: isIconTrigger ? ButtonKind.icon : ButtonKind.standard,
          variant: isIconTrigger ? ButtonVariant.text : ButtonVariant.tonal,
          color: color,
          size: size,
          disabled: disabled,
          leadingIconName: triggerIcon.isNotEmpty ? triggerIcon : null,
          onPressed: disabled
              ? null
              : () {
                  if (controller.isOpen) {
                    controller.close();
                  } else {
                    controller.open();
                  }
                },
        );
      },
    );

    if (testId != null) {
      menuAnchor = KeyedSubtree(
        key: ValueKey<String>(testId!),
        child: menuAnchor,
      );
    }

    return Semantics(
      container: true,
      enabled: !disabled,
      label: ariaLabel ?? triggerLabel,
      child: menuAnchor,
    );
  }
}
