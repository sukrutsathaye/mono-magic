/// Material 3 list item molecule supporting overline, primary, and secondary
/// text, leading icons or avatars, trailing text/icons/badges, selectable state,
/// dividers, dense layout, and surface appearances.
library;

import 'package:flutter/material.dart';

import '../../atoms/badge/magic_badge.dart';
import '../../core/magic_icon.dart';
import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';
import '../avatar/magic_avatar.dart';

/// Material 3 list item molecule rendering structured row content with optional
/// leading icon/avatar, overline/primary/secondary text, trailing
/// text/badge/icon, selection state, and hairline divider.
///
/// Mirrors `ListItemMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
class MagicListItem extends StatefulWidget {
  /// Creates a [MagicListItem].
  const MagicListItem({
    super.key,
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    required this.primaryText,
    this.secondaryText,
    this.overlineText,
    this.leadingIcon,
    this.leadingIconData,
    this.leadingAvatarText,
    this.leadingAvatarSrc,
    this.leadingSlot,
    this.trailingIcon,
    this.trailingIconData,
    this.trailingText,
    this.trailingBadge,
    this.trailingSlot,
    this.interactive = false,
    this.selectable = false,
    this.selected,
    this.defaultSelected = false,
    this.divider = false,
    this.dense = false,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.appearance = MagicListItemAppearance.standard,
    this.onTap,
    this.onSelectedChange,
  });

  /// Optional logical identifier for the list item.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>` on the root container.
  final String? testId;

  /// Optional accessible semantics label overriding [primaryText].
  final String? ariaLabel;

  /// Whether the list item is disabled and non-interactive.
  final bool disabled;

  /// Primary headline text displayed in the list item row.
  final String primaryText;

  /// Optional supporting text displayed beneath [primaryText].
  final String? secondaryText;

  /// Optional short overline label displayed above [primaryText].
  final String? overlineText;

  /// Optional Material icon string name rendered in the leading slot.
  final String? leadingIcon;

  /// Optional native Material [IconData] rendered in the leading slot.
  final IconData? leadingIconData;

  /// Optional initials or short text rendered inside a leading [MagicAvatar].
  final String? leadingAvatarText;

  /// Optional image URL rendered inside a leading [MagicAvatar].
  final String? leadingAvatarSrc;

  /// Optional custom leading widget overriding icon/avatar props.
  final Widget? leadingSlot;

  /// Optional Material icon string name rendered in the trailing slot.
  final String? trailingIcon;

  /// Optional native Material [IconData] rendered in the trailing slot.
  final IconData? trailingIconData;

  /// Optional metadata text rendered in the trailing slot.
  final String? trailingText;

  /// Optional badge content (`String` or `int`) rendered in the trailing slot.
  final Object? trailingBadge;

  /// Optional custom trailing widget overriding trailing text/badge/icon props.
  final Widget? trailingSlot;

  /// Whether the list item responds to pointer/keyboard activation.
  final bool interactive;

  /// Whether the list item can be toggled into a selected state.
  final bool selectable;

  /// Controlled selected state. When `null`, selection is managed internally
  /// starting from [defaultSelected].
  final bool? selected;

  /// Initial selected state for uncontrolled [selectable] usage.
  final bool defaultSelected;

  /// Whether a bottom hairline divider is rendered beneath the row.
  final bool divider;

  /// Whether compact vertical padding is applied to the row.
  final bool dense;

  /// Semantic accent color intent applied to selection and icon highlights.
  final ColorIntent color;

  /// Standardized component density/size preset.
  final AtomicSize size;

  /// Material 3 surface appearance (`standard`, `outlined`, or `filled`).
  final MagicListItemAppearance appearance;

  /// Callback invoked when an interactive or selectable list item is tapped.
  final VoidCallback? onTap;

  /// Callback invoked with the next selected state when a [selectable] item
  /// is toggled.
  final ValueChanged<bool>? onSelectedChange;

  @override
  State<MagicListItem> createState() => _MagicListItemState();
}

class _MagicListItemState extends State<MagicListItem> {
  late bool _internalSelected;

  @override
  void initState() {
    super.initState();
    _internalSelected = widget.defaultSelected;
  }

  @override
  void didUpdateWidget(covariant MagicListItem oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.selected == null && oldWidget.selected != null) {
      _internalSelected = oldWidget.selected!;
    }
  }

  bool get _isSelected => widget.selected ?? _internalSelected;

  bool get _isInteractive =>
      !widget.disabled &&
      (widget.interactive ||
          widget.selectable ||
          widget.onTap != null ||
          widget.onSelectedChange != null);

  void _handleTap() {
    if (widget.disabled) {
      return;
    }
    if (widget.selectable) {
      final bool next = !_isSelected;
      if (widget.selected == null) {
        setState(() {
          _internalSelected = next;
        });
      }
      widget.onSelectedChange?.call(next);
    }
    widget.onTap?.call();
  }

  EdgeInsetsGeometry _contentPaddingFor(AtomicSize size, bool dense) {
    final double h = switch (size) {
      AtomicSize.xs => 10,
      AtomicSize.sm => 12,
      AtomicSize.md => 16,
      AtomicSize.lg => 20,
      AtomicSize.xl => 24,
    };
    final double baseV = switch (size) {
      AtomicSize.xs => 2,
      AtomicSize.sm => 4,
      AtomicSize.md => 8,
      AtomicSize.lg => 10,
      AtomicSize.xl => 12,
    };
    final double v = dense ? (baseV * 0.5).floorToDouble() : baseV;
    return EdgeInsets.symmetric(horizontal: h, vertical: v);
  }

  AtomicSize _avatarSizeFor(AtomicSize size) => switch (size) {
    AtomicSize.xs => AtomicSize.xs,
    AtomicSize.sm => AtomicSize.sm,
    AtomicSize.md => AtomicSize.md,
    AtomicSize.lg => AtomicSize.md,
    AtomicSize.xl => AtomicSize.lg,
  };

  Widget? _buildLeading(
    ColorScheme scheme,
    MagicIntentColorSet intentColors,
    MagicSizeMetrics metrics,
    bool selected,
  ) {
    if (widget.leadingSlot != null) {
      return widget.leadingSlot;
    }

    final hasAvatar =
        (widget.leadingAvatarSrc != null &&
            widget.leadingAvatarSrc!.trim().isNotEmpty) ||
        (widget.leadingAvatarText != null &&
            widget.leadingAvatarText!.trim().isNotEmpty);

    if (hasAvatar) {
      return MagicAvatar(
        testId: widget.testId != null ? '${widget.testId}-avatar' : null,
        src: widget.leadingAvatarSrc,
        initials: widget.leadingAvatarText,
        size: _avatarSizeFor(widget.size),
        color: widget.color,
        disabled: widget.disabled,
      );
    }

    final resolvedIcon = resolveMagicIconData(
      icon: widget.leadingIconData,
      iconName: widget.leadingIcon,
    );
    if (resolvedIcon != null) {
      return MagicIcon(
        icon: resolvedIcon,
        size: metrics.iconSize + 2,
        color: widget.disabled
            ? scheme.onSurface.withValues(alpha: 0.38)
            : (selected ? intentColors.main : scheme.onSurfaceVariant),
      );
    }

    return null;
  }

  Widget? _buildTrailing(
    ColorScheme scheme,
    MagicIntentColorSet intentColors,
    MagicSizeMetrics metrics,
    bool selected,
  ) {
    if (widget.trailingSlot != null) {
      return widget.trailingSlot;
    }

    final bool hasText =
        widget.trailingText != null && widget.trailingText!.isNotEmpty;
    final bool hasBadge =
        widget.trailingBadge != null &&
        widget.trailingBadge.toString().isNotEmpty;
    final IconData? resolvedTrailingIcon = resolveMagicIconData(
      icon: widget.trailingIconData,
      iconName: widget.trailingIcon,
    );

    if (!hasText && !hasBadge && resolvedTrailingIcon == null) {
      return null;
    }

    final Color mutedColor = widget.disabled
        ? scheme.onSurface.withValues(alpha: 0.38)
        : (selected ? intentColors.main : scheme.onSurfaceVariant);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        if (hasText)
          Text(
            widget.trailingText!,
            style: TextStyle(
              fontSize: (metrics.fontSize - 1).clamp(11, 16).toDouble(),
              color: mutedColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        if (hasBadge) ...<Widget>[
          if (hasText) const SizedBox(width: 8),
          MagicBadge(
            testId: widget.testId != null ? '${widget.testId}-badge' : null,
            content: widget.trailingBadge,
            color: widget.color,
            size: AtomicSize.sm,
            disabled: widget.disabled,
            overlap: false,
            child: resolvedTrailingIcon != null
                ? MagicIcon(
                    icon: resolvedTrailingIcon,
                    size: metrics.iconSize + 2,
                    color: mutedColor,
                  )
                : const SizedBox(width: 18, height: 18),
          ),
        ] else if (resolvedTrailingIcon != null) ...<Widget>[
          if (hasText) const SizedBox(width: 8),
          MagicIcon(
            icon: resolvedTrailingIcon,
            size: metrics.iconSize + 2,
            color: mutedColor,
          ),
        ],
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final textTheme = theme.textTheme;
    final intentColors = MagicTheme.resolveIntent(context, widget.color);
    final metrics = MagicTheme.metricsFor(widget.size);
    final bool selected = _isSelected;

    final Color titleColor = widget.disabled
        ? scheme.onSurface.withValues(alpha: 0.38)
        : (selected ? intentColors.onContainer : scheme.onSurface);
    final Color subtitleColor = widget.disabled
        ? scheme.onSurface.withValues(alpha: 0.38)
        : scheme.onSurfaceVariant;

    final Color backgroundColor = switch (widget.appearance) {
      MagicListItemAppearance.standard =>
        selected
            ? intentColors.container.withValues(alpha: 0.45)
            : Colors.transparent,
      MagicListItemAppearance.outlined =>
        selected
            ? intentColors.container.withValues(alpha: 0.45)
            : scheme.surface,
      MagicListItemAppearance.filled =>
        selected
            ? intentColors.container
            : scheme.surfaceContainerLow,
    };

    final ShapeBorder? shape = switch (widget.appearance) {
      MagicListItemAppearance.standard => null,
      MagicListItemAppearance.outlined => RoundedRectangleBorder(
        borderRadius: const BorderRadius.all(Radius.circular(12)),
        side: BorderSide(
          color: selected ? intentColors.main : scheme.outlineVariant,
          width: selected ? 1.5 : 1,
        ),
      ),
      MagicListItemAppearance.filled => const RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(12)),
      ),
    };

    final bool hasOverline =
        widget.overlineText != null && widget.overlineText!.isNotEmpty;
    final bool hasSecondary =
        widget.secondaryText != null && widget.secondaryText!.isNotEmpty;

    final Widget titleWidget = hasOverline
        ? Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                widget.overlineText!,
                style: textTheme.labelSmall?.copyWith(
                  color: subtitleColor,
                  letterSpacing: 0.5,
                  fontSize: (metrics.fontSize - 3).clamp(10, 13).toDouble(),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                widget.primaryText,
                style: textTheme.bodyLarge?.copyWith(
                  color: titleColor,
                  fontSize: metrics.fontSize,
                  fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                ),
              ),
            ],
          )
        : Text(
            widget.primaryText,
            style: textTheme.bodyLarge?.copyWith(
              color: titleColor,
              fontSize: metrics.fontSize,
              fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
            ),
          );

    final Widget? subtitleWidget = hasSecondary
        ? Text(
            widget.secondaryText!,
            style: textTheme.bodyMedium?.copyWith(
              color: subtitleColor,
              fontSize: (metrics.fontSize - 1).clamp(11, 16).toDouble(),
            ),
          )
        : null;

    Widget rowContent = Material(
      color: backgroundColor,
      shape: shape,
      clipBehavior: shape != null ? Clip.antiAlias : Clip.none,
      child: ListTile(
        enabled: !widget.disabled,
        selected: selected,
        dense: widget.dense || widget.size == AtomicSize.xs,
        contentPadding: _contentPaddingFor(widget.size, widget.dense),
        leading: _buildLeading(scheme, intentColors, metrics, selected),
        title: titleWidget,
        subtitle: subtitleWidget,
        trailing: _buildTrailing(scheme, intentColors, metrics, selected),
        selectedColor: intentColors.onContainer,
        onTap: _isInteractive ? _handleTap : null,
      ),
    );

    if (widget.divider) {
      rowContent = Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          rowContent,
          Divider(
            height: 1,
            thickness: 1,
            color: scheme.outlineVariant.withValues(alpha: 0.7),
          ),
        ],
      );
    }

    return Semantics(
      container: true,
      explicitChildNodes: true,
      button: widget.interactive || widget.selectable || widget.onTap != null,
      selected: widget.selectable ? selected : null,
      enabled: !widget.disabled,
      label: widget.ariaLabel ?? widget.primaryText,
      child: KeyedSubtree(
        key: widget.testId != null ? ValueKey<String>(widget.testId!) : null,
        child: rowContent,
      ),
    );
  }
}
