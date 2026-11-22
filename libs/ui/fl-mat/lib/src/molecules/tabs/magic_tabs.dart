/// Tabbed navigation molecule supporting horizontal and vertical layouts,
/// primary and secondary Material 3 indicator hierarchies, scrollable strips,
/// lazy panel mounting, [MagicIcon], and [MagicBadge].
library;

import 'package:flutter/material.dart';

import '../../atoms/badge/magic_badge.dart';
import '../../core/magic_icon.dart';
import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Signature for building custom tab panel content inside [MagicTabs].
typedef MagicTabPanelBuilder = Widget Function(
  BuildContext context,
  TabItem item,
  int index,
);

/// Material 3 tabs molecule supporting horizontal and vertical strip
/// orientations, `primary` and `secondary` indicator variants, scrollable tab
/// strips, lazy panel mounting, icons, badges, controlled/uncontrolled active
/// selection, and bounded or unbounded height contexts.
///
/// Mirrors `TabsMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
class MagicTabs extends StatefulWidget {
  /// Creates a [MagicTabs].
  const MagicTabs({
    super.key,
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    required this.items,
    this.activeTabId,
    this.defaultActiveTabId,
    this.orientation = TabsOrientation.horizontal,
    this.variant = TabsVariant.primary,
    this.scrollable = false,
    this.lazy = false,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.onTabChange,
    this.panelBuilder,
  });

  /// Optional logical identifier for the tabs container.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>` on the root container.
  final String? testId;

  /// Optional accessible semantics label for the tab navigation region.
  final String? ariaLabel;

  /// Whether all tabs are disabled.
  final bool disabled;

  /// Ordered list of tab descriptors and panel definitions.
  final List<TabItem> items;

  /// Controlled active tab identifier.
  final String? activeTabId;

  /// Initial active tab identifier for uncontrolled usage.
  final String? defaultActiveTabId;

  /// Layout axis (`horizontal` or `vertical`).
  final TabsOrientation orientation;

  /// Material 3 tab indicator variant (`primary` or `secondary`).
  final TabsVariant variant;

  /// Whether the tab strip scrolls when tabs overflow.
  final bool scrollable;

  /// Whether inactive tab panels defer building until first selected.
  final bool lazy;

  /// Semantic color intent applied to active tab text and indicator.
  final ColorIntent color;

  /// Standardized component density/size preset.
  final AtomicSize size;

  /// Callback invoked when the user selects an enabled tab.
  final ValueChanged<TabItem>? onTabChange;

  /// Optional custom panel builder replacing [TabItem.content].
  final MagicTabPanelBuilder? panelBuilder;

  @override
  State<MagicTabs> createState() => _MagicTabsState();
}

class _MagicTabsState extends State<MagicTabs> {
  late String? _internalActiveId;
  final Set<String> _mountedLazyIds = <String>{};

  @override
  void initState() {
    super.initState();
    _internalActiveId = _resolveInitialId();
    _markActiveMounted();
  }

  @override
  void didUpdateWidget(covariant MagicTabs oldWidget) {
    super.didUpdateWidget(oldWidget);
    final String? current = _effectiveActiveId;
    if (current != null && !widget.items.any((item) => item.id == current)) {
      _internalActiveId = _resolveInitialId();
    }
    _markActiveMounted();
  }

  String? _resolveInitialId() {
    if (widget.items.isEmpty) {
      return null;
    }
    if (widget.activeTabId != null &&
        widget.items.any((item) => item.id == widget.activeTabId)) {
      return widget.activeTabId;
    }
    if (widget.defaultActiveTabId != null &&
        widget.items.any((item) => item.id == widget.defaultActiveTabId)) {
      return widget.defaultActiveTabId;
    }
    for (final item in widget.items) {
      if (!item.disabled) {
        return item.id;
      }
    }
    return widget.items.first.id;
  }

  String? get _effectiveActiveId {
    if (widget.items.isEmpty) {
      return null;
    }
    if (widget.activeTabId != null &&
        widget.items.any((item) => item.id == widget.activeTabId)) {
      return widget.activeTabId;
    }
    if (_internalActiveId != null &&
        widget.items.any((item) => item.id == _internalActiveId)) {
      return _internalActiveId;
    }
    return _resolveInitialId();
  }

  void _markActiveMounted() {
    final activeId = _effectiveActiveId;
    if (activeId != null) {
      _mountedLazyIds.add(activeId);
    }
  }

  void _selectTab(TabItem item) {
    if (widget.disabled || item.disabled) {
      return;
    }
    if (widget.activeTabId == null) {
      setState(() {
        _internalActiveId = item.id;
        _mountedLazyIds.add(item.id);
      });
    } else {
      setState(() {
        _mountedLazyIds.add(item.id);
      });
    }
    widget.onTabChange?.call(item);
  }

  EdgeInsetsGeometry _tabPaddingFor(AtomicSize size) => switch (size) {
    AtomicSize.xs => const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
    AtomicSize.sm => const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
    AtomicSize.md => const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
    AtomicSize.lg => const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
    AtomicSize.xl => const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
  };

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final intentColors = MagicTheme.resolveIntent(context, widget.color);
    final metrics = MagicTheme.metricsFor(widget.size);

    if (widget.items.isEmpty) {
      return SizedBox.shrink(
        key: widget.testId != null ? ValueKey<String>(widget.testId!) : null,
      );
    }

    final String? activeId = _effectiveActiveId;
    final int activeIndex = widget.items
        .indexWhere((item) => item.id == activeId)
        .clamp(0, widget.items.length - 1);

    final Widget tabStrip = _buildTabStrip(
      context: context,
      scheme: scheme,
      intentColors: intentColors,
      metrics: metrics,
      activeId: activeId,
    );

    final Widget panelArea = _buildPanels(
      context: context,
      scheme: scheme,
      metrics: metrics,
      activeId: activeId,
      activeIndex: activeIndex,
    );

    return Semantics(
      container: true,
      explicitChildNodes: true,
      enabled: !widget.disabled,
      label: widget.ariaLabel ?? 'Tabs',
      child: KeyedSubtree(
        key: widget.testId != null ? ValueKey<String>(widget.testId!) : null,
        child: LayoutBuilder(
          builder: (context, constraints) {
            final bool hasBoundedHeight = constraints.hasBoundedHeight;

            if (widget.orientation == TabsOrientation.vertical) {
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.max,
                children: <Widget>[
                  ConstrainedBox(
                    constraints: const BoxConstraints(
                      minWidth: 140,
                      maxWidth: 220,
                    ),
                    child: tabStrip,
                  ),
                  VerticalDivider(
                    width: 1,
                    thickness: 1,
                    color: scheme.outlineVariant,
                  ),
                  Expanded(
                    child: hasBoundedHeight
                        ? SingleChildScrollView(child: panelArea)
                        : panelArea,
                  ),
                ],
              );
            }

            return Column(
              mainAxisSize:
                  hasBoundedHeight ? MainAxisSize.max : MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                tabStrip,
                Divider(
                  height: 1,
                  thickness: 1,
                  color: scheme.outlineVariant,
                ),
                if (hasBoundedHeight)
                  Expanded(child: SingleChildScrollView(child: panelArea))
                else
                  panelArea,
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildTabStrip({
    required BuildContext context,
    required ColorScheme scheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
    required String? activeId,
  }) {
    final bool isVertical = widget.orientation == TabsOrientation.vertical;
    final bool isPrimary = widget.variant == TabsVariant.primary;

    final List<Widget> tabWidgets = <Widget>[
      for (int i = 0; i < widget.items.length; i++)
        _buildTabButton(
          item: widget.items[i],
          selected: widget.items[i].id == activeId,
          isVertical: isVertical,
          isPrimary: isPrimary,
          scheme: scheme,
          intentColors: intentColors,
          metrics: metrics,
          expandEvenly: !isVertical && !widget.scrollable,
        ),
    ];

    if (isVertical) {
      final Widget column = Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: tabWidgets,
      );
      return widget.scrollable
          ? SingleChildScrollView(child: column)
          : column;
    }

    if (widget.scrollable) {
      return SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: tabWidgets,
        ),
      );
    }

    return Row(
      mainAxisSize: MainAxisSize.max,
      children: tabWidgets,
    );
  }

  Widget _buildTabButton({
    required TabItem item,
    required bool selected,
    required bool isVertical,
    required bool isPrimary,
    required ColorScheme scheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
    required bool expandEvenly,
  }) {
    final bool itemDisabled = widget.disabled || item.disabled;
    final Color activeColor = intentColors.main;
    final Color inactiveColor = scheme.onSurfaceVariant;
    final Color disabledColor = scheme.onSurface.withValues(alpha: 0.38);

    final Color fgColor = itemDisabled
        ? disabledColor
        : (selected ? activeColor : inactiveColor);

    final bool hasIcon =
        resolveMagicIconData(icon: item.icon, iconName: item.iconName) != null;
    final bool hasBadge =
        item.badgeContent != null && item.badgeContent.toString().isNotEmpty;

    final Widget labelRow = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment:
          isVertical ? MainAxisAlignment.start : MainAxisAlignment.center,
      children: <Widget>[
        if (hasIcon && isPrimary && !isVertical) ...<Widget>[
          // Primary horizontal tabs stack icon above label cleanly below.
        ],
        if (hasIcon && (!isPrimary || isVertical)) ...<Widget>[
          MagicIcon(
            icon: item.icon,
            iconName: item.iconName,
            size: metrics.iconSize,
            color: fgColor,
          ),
          const SizedBox(width: 8),
        ],
        Flexible(
          child: Text(
            item.label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: fgColor,
              fontSize: metrics.fontSize,
              fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
            ),
          ),
        ),
        if (hasBadge) ...<Widget>[
          const SizedBox(width: 6),
          MagicBadge(
            content: item.badgeContent,
            color: widget.color,
            size: AtomicSize.xs,
            disabled: itemDisabled,
            overlap: false,
            child: const SizedBox(width: 14, height: 14),
          ),
        ],
      ],
    );

    final Widget tabInner = isPrimary && hasIcon && !isVertical
        ? Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              MagicIcon(
                icon: item.icon,
                iconName: item.iconName,
                size: metrics.iconSize,
                color: fgColor,
              ),
              const SizedBox(height: 4),
              labelRow,
            ],
          )
        : labelRow;

    final Border? indicatorBorder = selected
        ? (isVertical
              ? Border(
                  right: BorderSide(
                    color: itemDisabled ? disabledColor : activeColor,
                    width: isPrimary ? 3 : 2,
                  ),
                )
              : Border(
                  bottom: BorderSide(
                    color: itemDisabled ? disabledColor : activeColor,
                    width: isPrimary ? 3 : 2,
                  ),
                ))
        : null;

    final Widget tabTile = Semantics(
      button: true,
      selected: selected,
      enabled: !itemDisabled,
      label: item.label,
      child: InkWell(
        key: widget.testId != null
            ? ValueKey<String>('${widget.testId}-tab-${item.id}')
            : null,
        onTap: itemDisabled ? null : () => _selectTab(item),
        child: Container(
          constraints: BoxConstraints(minHeight: metrics.height),
          padding: _tabPaddingFor(widget.size),
          decoration: BoxDecoration(
            color: selected && !isPrimary
                ? intentColors.container.withValues(alpha: 0.35)
                : null,
            border: indicatorBorder,
          ),
          alignment: isVertical ? Alignment.centerLeft : Alignment.center,
          child: tabInner,
        ),
      ),
    );

    if (expandEvenly) {
      return Expanded(child: tabTile);
    }
    return tabTile;
  }

  Widget _buildPanels({
    required BuildContext context,
    required ColorScheme scheme,
    required MagicSizeMetrics metrics,
    required String? activeId,
    required int activeIndex,
  }) {
    if (!widget.lazy) {
      return IndexedStack(
        index: activeIndex,
        children: <Widget>[
          for (int i = 0; i < widget.items.length; i++)
            _buildSinglePanel(
              context: context,
              item: widget.items[i],
              index: i,
              scheme: scheme,
              metrics: metrics,
            ),
        ],
      );
    }

    // Lazy mode: only build panels that have been activated at least once,
    // preserving state of previously visited panels via Offstage.
    return Stack(
      children: <Widget>[
        for (int i = 0; i < widget.items.length; i++)
          if (_mountedLazyIds.contains(widget.items[i].id))
            Offstage(
              offstage: widget.items[i].id != activeId,
              child: _buildSinglePanel(
                context: context,
                item: widget.items[i],
                index: i,
                scheme: scheme,
                metrics: metrics,
              ),
            ),
      ],
    );
  }

  Widget _buildSinglePanel({
    required BuildContext context,
    required TabItem item,
    required int index,
    required ColorScheme scheme,
    required MagicSizeMetrics metrics,
  }) {
    final Widget contentWidget =
        widget.panelBuilder?.call(context, item, index) ??
        Text(
          item.content ?? '',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: widget.disabled
                ? scheme.onSurface.withValues(alpha: 0.38)
                : scheme.onSurface,
            fontSize: metrics.fontSize,
          ),
        );

    return KeyedSubtree(
      key: widget.testId != null
          ? ValueKey<String>('${widget.testId}-panel-${item.id}')
          : null,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: contentWidget,
      ),
    );
  }
}
