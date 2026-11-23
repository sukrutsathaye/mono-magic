/// Material 3 breadcrumbs navigation molecule supporting custom separators,
/// leading icons, middle-item collapse via maxItems with expandable ellipsis,
/// current-page styling, and per-item or group disabled states.
library;

import 'package:flutter/material.dart';

import '../../core/magic_icon.dart';
import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Material 3 breadcrumbs molecule rendering a hierarchical navigation trail of
/// [MagicBreadcrumbItem] segments with configurable separators, leading icons,
/// middle-item collapse behind an expandable ellipsis button, and current item
/// semantics.
///
/// Mirrors `BreadcrumbsMoleculeProps` from
/// `@mono-magic/atomic-design-interfaces`.
class MagicBreadcrumbs extends StatefulWidget {
  /// Creates a [MagicBreadcrumbs].
  const MagicBreadcrumbs({
    super.key,
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    required this.items,
    this.separator = '/',
    this.maxItems,
    this.itemsBeforeCollapse = 1,
    this.itemsAfterCollapse = 1,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.onItemTap,
  });

  /// Optional logical identifier for the breadcrumbs container.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>` on the root container.
  final String? testId;

  /// Optional accessible semantics label for the navigation trail.
  final String? ariaLabel;

  /// Whether all breadcrumb links are disabled.
  final bool disabled;

  /// Ordered trail of navigation breadcrumb descriptors.
  final List<MagicBreadcrumbItem> items;

  /// Separator token rendered between adjacent breadcrumb items.
  final String separator;

  /// Maximum number of visible breadcrumb items before collapsing middle items
  /// behind an expandable ellipsis button.
  final int? maxItems;

  /// Number of leading items kept visible when collapsed.
  final int itemsBeforeCollapse;

  /// Number of trailing items kept visible when collapsed.
  final int itemsAfterCollapse;

  /// Semantic accent color intent applied to interactive breadcrumb links.
  final ColorIntent color;

  /// Standardized component density/size preset.
  final AtomicSize size;

  /// Callback invoked when a non-current, enabled breadcrumb item is tapped.
  final ValueChanged<MagicBreadcrumbItem>? onItemTap;

  @override
  State<MagicBreadcrumbs> createState() => _MagicBreadcrumbsState();
}

sealed class _CrumbSlot {}

class _CrumbItemSlot extends _CrumbSlot {
  _CrumbItemSlot(this.item, this.originalIndex);
  final MagicBreadcrumbItem item;
  final int originalIndex;
}

class _CrumbCollapseSlot extends _CrumbSlot {}

class _MagicBreadcrumbsState extends State<MagicBreadcrumbs> {
  bool _expanded = false;

  @override
  void didUpdateWidget(covariant MagicBreadcrumbs oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.testId != oldWidget.testId ||
        widget.maxItems != oldWidget.maxItems ||
        widget.items.length != oldWidget.items.length) {
      _expanded = false;
    }
  }

  List<_CrumbSlot> _visibleSlots() {
    final int count = widget.items.length;
    final int? maxItems = widget.maxItems;
    final int before = widget.itemsBeforeCollapse.clamp(0, count);
    final int after = widget.itemsAfterCollapse.clamp(0, count);

    final bool shouldCollapse =
        !_expanded &&
        maxItems != null &&
        maxItems > 0 &&
        count > maxItems &&
        (before + after) < count;

    if (!shouldCollapse) {
      return <_CrumbSlot>[
        for (int i = 0; i < count; i++) _CrumbItemSlot(widget.items[i], i),
      ];
    }

    return <_CrumbSlot>[
      for (int i = 0; i < before; i++) _CrumbItemSlot(widget.items[i], i),
      _CrumbCollapseSlot(),
      for (int i = count - after; i < count; i++)
        _CrumbItemSlot(widget.items[i], i),
    ];
  }

  @override
  Widget build(BuildContext context) {
    if (widget.items.isEmpty) {
      return SizedBox.shrink(
        key: widget.testId != null ? ValueKey<String>(widget.testId!) : null,
      );
    }

    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final intentColors = MagicTheme.resolveIntent(context, widget.color);
    final metrics = MagicTheme.metricsFor(widget.size);

    final bool hasExplicitCurrent = widget.items.any((item) => item.current);
    final List<_CrumbSlot> slots = _visibleSlots();

    return Semantics(
      container: true,
      explicitChildNodes: true,
      enabled: !widget.disabled,
      label: widget.ariaLabel ?? 'Breadcrumbs',
      child: KeyedSubtree(
        key: widget.testId != null ? ValueKey<String>(widget.testId!) : null,
        child: Wrap(
          spacing: 6,
          runSpacing: 4,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: <Widget>[
            for (int i = 0; i < slots.length; i++) ...<Widget>[
              _buildSlot(
                slot: slots[i],
                hasExplicitCurrent: hasExplicitCurrent,
                scheme: scheme,
                intentColors: intentColors,
                metrics: metrics,
              ),
              if (i < slots.length - 1)
                Text(
                  widget.separator,
                  style: TextStyle(
                    fontSize: metrics.fontSize,
                    color: scheme.onSurfaceVariant,
                  ),
                ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSlot({
    required _CrumbSlot slot,
    required bool hasExplicitCurrent,
    required ColorScheme scheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
  }) {
    if (slot is _CrumbCollapseSlot) {
      return Semantics(
        button: true,
        enabled: !widget.disabled,
        label: 'Show hidden breadcrumbs',
        child: InkWell(
          key: widget.testId != null
              ? ValueKey<String>('${widget.testId}-expand')
              : null,
          borderRadius: const BorderRadius.all(Radius.circular(6)),
          onTap: widget.disabled
              ? null
              : () {
                  setState(() {
                    _expanded = true;
                  });
                },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: scheme.surfaceContainerHighest,
              borderRadius: const BorderRadius.all(Radius.circular(6)),
            ),
            child: Text(
              '...',
              style: TextStyle(
                fontSize: metrics.fontSize,
                fontWeight: FontWeight.w600,
                color: widget.disabled
                    ? scheme.onSurface.withValues(alpha: 0.38)
                    : scheme.onSurface,
              ),
            ),
          ),
        ),
      );
    }

    final itemSlot = slot as _CrumbItemSlot;
    final item = itemSlot.item;
    final bool isCurrent =
        item.current ||
        (!hasExplicitCurrent &&
            itemSlot.originalIndex == widget.items.length - 1);
    final bool itemDisabled = widget.disabled || item.disabled;
    final bool isInteractive = !itemDisabled && !isCurrent;

    final Color textColor;
    if (itemDisabled) {
      textColor = scheme.onSurface.withValues(alpha: 0.38);
    } else if (isCurrent) {
      textColor = scheme.onSurface;
    } else {
      textColor = intentColors.main;
    }

    final IconData? resolvedIcon = resolveMagicIconData(
      icon: item.icon,
      iconName: item.iconName,
    );

    final Widget inner = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          if (resolvedIcon != null) ...<Widget>[
            MagicIcon(
              icon: resolvedIcon,
              size: metrics.iconSize,
              color: textColor,
            ),
            const SizedBox(width: 4),
          ],
          Text(
            item.label,
            style: TextStyle(
              fontSize: metrics.fontSize,
              fontWeight: isCurrent ? FontWeight.w600 : FontWeight.w500,
              color: textColor,
            ),
          ),
        ],
      ),
    );

    return Semantics(
      link: isInteractive,
      selected: isCurrent ? true : null,
      enabled: !itemDisabled,
      label: item.label,
      child: InkWell(
        key: widget.testId != null
            ? ValueKey<String>('${widget.testId}-item-${item.id}')
            : null,
        borderRadius: const BorderRadius.all(Radius.circular(6)),
        onTap: isInteractive ? () => widget.onItemTap?.call(item) : null,
        child: inner,
      ),
    );
  }
}
