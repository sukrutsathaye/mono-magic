/// Collapsible accordion molecule supporting single and multi-expand modes,
/// outlined and raised Material 3 appearances, summary subheadings, icons,
/// and per-item or group disabled states.
library;

import 'package:flutter/material.dart';

import '../../core/magic_icon.dart';
import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Signature for building custom panel body content inside [MagicAccordion].
typedef MagicAccordionContentBuilder = Widget Function(
  BuildContext context,
  AccordionItem item,
  int index,
);

/// Material 3 accordion molecule rendering a list of collapsible panels with
/// `outlined` or `raised` surfaces, single or multiple simultaneous expansion,
/// leading icons, optional summary subheadings, and controlled/uncontrolled
/// state.
///
/// Mirrors `AccordionMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
class MagicAccordion extends StatefulWidget {
  /// Creates a [MagicAccordion].
  const MagicAccordion({
    super.key,
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    required this.items,
    this.multiple = false,
    this.expandedIds,
    this.defaultExpandedIds,
    this.appearance = AccordionAppearance.outlined,
    this.size = AtomicSize.md,
    this.onExpandedChange,
    this.contentBuilder,
  });

  /// Optional logical identifier for the accordion.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>` on the root container.
  final String? testId;

  /// Optional accessible semantics label for the accordion group.
  final String? ariaLabel;

  /// Whether all panels in the accordion are disabled.
  final bool disabled;

  /// Ordered list of collapsible accordion panel descriptors.
  final List<AccordionItem> items;

  /// Whether multiple panels can remain expanded simultaneously.
  final bool multiple;

  /// Controlled list of expanded panel identifiers.
  final List<String>? expandedIds;

  /// Initial list of expanded panel identifiers for uncontrolled usage.
  final List<String>? defaultExpandedIds;

  /// Material 3 surface appearance (`outlined` or `raised`).
  final AccordionAppearance appearance;

  /// Standardized component density/size preset.
  final AtomicSize size;

  /// Callback invoked with the updated list of expanded panel identifiers.
  final ValueChanged<List<String>>? onExpandedChange;

  /// Optional custom body builder overriding [AccordionItem.content].
  final MagicAccordionContentBuilder? contentBuilder;

  @override
  State<MagicAccordion> createState() => _MagicAccordionState();
}

class _MagicAccordionState extends State<MagicAccordion> {
  late Set<String> _internalExpandedIds;

  @override
  void initState() {
    super.initState();
    _internalExpandedIds = _resolveInitialExpandedIds();
  }

  @override
  void didUpdateWidget(covariant MagicAccordion oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.expandedIds == null && oldWidget.expandedIds != null) {
      _internalExpandedIds = _resolveInitialExpandedIds();
    }
  }

  Set<String> _resolveInitialExpandedIds() {
    final Set<String> initial = <String>{};
    if (widget.defaultExpandedIds != null) {
      initial.addAll(widget.defaultExpandedIds!);
    } else {
      for (final item in widget.items) {
        if (item.expanded) {
          initial.add(item.id);
        }
      }
    }
    if (!widget.multiple && initial.length > 1) {
      return <String>{initial.first};
    }
    return initial;
  }

  Set<String> get _effectiveExpandedIds {
    if (widget.expandedIds != null) {
      final controlled = widget.expandedIds!.toSet();
      if (!widget.multiple && controlled.length > 1) {
        return <String>{controlled.first};
      }
      return controlled;
    }
    return _internalExpandedIds;
  }

  void _toggleItem(AccordionItem item) {
    if (widget.disabled || item.disabled) {
      return;
    }
    final current = Set<String>.from(_effectiveExpandedIds);
    final bool isCurrentlyExpanded = current.contains(item.id);

    final Set<String> next;
    if (widget.multiple) {
      next = Set<String>.from(current);
      if (isCurrentlyExpanded) {
        next.remove(item.id);
      } else {
        next.add(item.id);
      }
    } else {
      next = isCurrentlyExpanded ? <String>{} : <String>{item.id};
    }

    if (widget.expandedIds == null) {
      setState(() {
        _internalExpandedIds = next;
      });
    }

    final List<String> orderedNext = <String>[
      for (final entry in widget.items)
        if (next.contains(entry.id)) entry.id,
    ];
    widget.onExpandedChange?.call(orderedNext);
  }

  EdgeInsetsGeometry _headerPaddingFor(AtomicSize size) => switch (size) {
    AtomicSize.xs => const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
    AtomicSize.sm => const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
    AtomicSize.md => const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    AtomicSize.lg => const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
    AtomicSize.xl => const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
  };

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final textTheme = theme.textTheme;
    final metrics = MagicTheme.metricsFor(widget.size);
    final expandedSet = _effectiveExpandedIds;
    final bool isOutlined = widget.appearance == AccordionAppearance.outlined;

    return Semantics(
      container: true,
      explicitChildNodes: true,
      enabled: !widget.disabled,
      label: widget.ariaLabel ?? 'Accordion',
      child: KeyedSubtree(
        key: widget.testId != null ? ValueKey<String>(widget.testId!) : null,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            for (int i = 0; i < widget.items.length; i++) ...<Widget>[
              _buildPanel(
                context: context,
                item: widget.items[i],
                index: i,
                isExpanded: expandedSet.contains(widget.items[i].id),
                isOutlined: isOutlined,
                scheme: scheme,
                textTheme: textTheme,
                metrics: metrics,
              ),
              if (i < widget.items.length - 1) const SizedBox(height: 8),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildPanel({
    required BuildContext context,
    required AccordionItem item,
    required int index,
    required bool isExpanded,
    required bool isOutlined,
    required ColorScheme scheme,
    required TextTheme textTheme,
    required MagicSizeMetrics metrics,
  }) {
    final bool itemDisabled = widget.disabled || item.disabled;
    final Color titleColor = itemDisabled
        ? scheme.onSurface.withValues(alpha: 0.38)
        : scheme.onSurface;
    final Color subtitleColor = itemDisabled
        ? scheme.onSurface.withValues(alpha: 0.38)
        : scheme.onSurfaceVariant;
    final bool hasIcon =
        resolveMagicIconData(icon: item.icon, iconName: item.iconName) != null;
    final bool hasSummary = item.summary != null && item.summary!.isNotEmpty;

    final Widget bodyContent =
        widget.contentBuilder?.call(context, item, index) ??
        Text(
          item.content ?? '',
          style: textTheme.bodyMedium?.copyWith(
            color: subtitleColor,
            fontSize: metrics.fontSize,
          ),
        );

    return Material(
      key: widget.testId != null
          ? ValueKey<String>('${widget.testId}-panel-${item.id}')
          : null,
      color: isOutlined ? scheme.surface : scheme.surfaceContainerLow,
      elevation: isOutlined ? 0 : 2,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: const BorderRadius.all(Radius.circular(12)),
        side: isOutlined
            ? BorderSide(color: scheme.outlineVariant)
            : BorderSide.none,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Semantics(
            button: true,
            expanded: isExpanded,
            enabled: !itemDisabled,
            label: item.title,
            child: InkWell(
              key: widget.testId != null
                  ? ValueKey<String>('${widget.testId}-header-${item.id}')
                  : null,
              onTap: itemDisabled ? null : () => _toggleItem(item),
              child: Padding(
                padding: _headerPaddingFor(widget.size),
                child: Row(
                  children: <Widget>[
                    if (hasIcon) ...<Widget>[
                      MagicIcon(
                        icon: item.icon,
                        iconName: item.iconName,
                        size: metrics.iconSize,
                        color: itemDisabled ? titleColor : scheme.primary,
                      ),
                      const SizedBox(width: 12),
                    ],
                    Expanded(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(
                            item.title,
                            style: textTheme.titleSmall?.copyWith(
                              color: titleColor,
                              fontSize: metrics.fontSize + 1,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          if (hasSummary) ...<Widget>[
                            const SizedBox(height: 2),
                            Text(
                              item.summary!,
                              style: textTheme.bodySmall?.copyWith(
                                color: subtitleColor,
                                fontSize: metrics.fontSize - 1,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    MagicIcon(
                      icon: isExpanded
                          ? Icons.expand_less
                          : Icons.expand_more,
                      size: metrics.iconSize + 2,
                      color: subtitleColor,
                    ),
                  ],
                ),
              ),
            ),
          ),
          AnimatedCrossFade(
            firstChild: const SizedBox.shrink(),
            secondChild: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                Divider(
                  height: 1,
                  thickness: 1,
                  color: scheme.outlineVariant.withValues(alpha: 0.6),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                  child: bodyContent,
                ),
              ],
            ),
            crossFadeState: isExpanded
                ? CrossFadeState.showSecond
                : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 180),
          ),
        ],
      ),
    );
  }
}
