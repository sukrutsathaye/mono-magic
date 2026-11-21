/// Material 3 badge atom supporting numeric/string content, dot indicators,
/// 8 directional anchor positions, overlap toggling, and semantic intents.
library;

import 'package:flutter/material.dart';

import '../../core/magic_icon.dart';
import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Material 3 badge atom wrapping Flutter's [Badge] widget.
///
/// Supports:
/// - Numeric or string [content] rendered as a pill badge, or a compact dot
///   badge when [content] is `null` or empty
/// - All 8 [BadgePosition] anchor placements with optional [overlap]
/// - All 7 [ColorIntent] semantic tokens via [MagicTheme.resolveIntent]
/// - All 5 [AtomicSize] steps controlling badge dimensions and fallback icon
/// - [hidden] and [disabled] visibility suppression
/// - Fallback anchor resolution: [child] -> [icon]/[iconName] -> [label]
class MagicBadge extends StatelessWidget {
  /// Creates a [MagicBadge].
  const MagicBadge({
    super.key,
    this.content,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.position = BadgePosition.aboveAfter,
    this.overlap = true,
    this.hidden = false,
    this.disabled = false,
    this.description,
    this.label,
    this.icon,
    this.iconName,
    this.child,
    this.id,
    this.testId,
    this.ariaLabel,
  });

  /// Badge content rendered inside the pill (`int`, `String`, etc.).
  ///
  /// When `null` or empty, Flutter's [Badge] renders a compact dot indicator.
  final Object? content;

  /// Semantic color intent applied to the badge fill and foreground text.
  final ColorIntent color;

  /// Standardized size governing badge dimensions and fallback icon sizing.
  final AtomicSize size;

  /// Anchor placement of the badge relative to its wrapped anchor widget.
  final BadgePosition position;

  /// Whether the badge overlaps the anchor corner (`true`) or sits further
  /// outside the anchor bounds (`false`).
  final bool overlap;

  /// Whether the badge indicator is hidden while still rendering the anchor.
  final bool hidden;

  /// Whether the badge is disabled (suppresses the badge indicator).
  final bool disabled;

  /// Accessible description used as semantics fallback when [ariaLabel] is
  /// omitted.
  final String? description;

  /// Fallback text anchor rendered when neither [child] nor [icon]/[iconName]
  /// is provided.
  final String? label;

  /// Fallback native Material [IconData] anchor rendered when [child] is `null`.
  final IconData? icon;

  /// Fallback Material icon string name resolved via [MagicIcon] when [child]
  /// is `null`.
  final String? iconName;

  /// Primary anchor widget decorated by this badge.
  final Widget? child;

  /// Optional logical identifier for the badge.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>`.
  final String? testId;

  /// Optional accessible semantics label overriding [description].
  final String? ariaLabel;

  _BadgeSizeMetrics _badgeMetricsFor(AtomicSize atomicSize) =>
      switch (atomicSize) {
        AtomicSize.xs => const _BadgeSizeMetrics(
          smallSize: 6,
          largeSize: 14,
          fontSize: 10,
          horizontalPadding: 4,
        ),
        AtomicSize.sm => const _BadgeSizeMetrics(
          smallSize: 7,
          largeSize: 16,
          fontSize: 11,
          horizontalPadding: 4,
        ),
        AtomicSize.md => const _BadgeSizeMetrics(
          smallSize: 8,
          largeSize: 18,
          fontSize: 12,
          horizontalPadding: 5,
        ),
        AtomicSize.lg => const _BadgeSizeMetrics(
          smallSize: 10,
          largeSize: 22,
          fontSize: 13,
          horizontalPadding: 6,
        ),
        AtomicSize.xl => const _BadgeSizeMetrics(
          smallSize: 12,
          largeSize: 26,
          fontSize: 14,
          horizontalPadding: 8,
        ),
      };

  AlignmentDirectional _alignmentFor(BadgePosition pos) => switch (pos) {
    BadgePosition.aboveAfter => AlignmentDirectional.topEnd,
    BadgePosition.aboveBefore => AlignmentDirectional.topStart,
    BadgePosition.belowAfter => AlignmentDirectional.bottomEnd,
    BadgePosition.belowBefore => AlignmentDirectional.bottomStart,
    BadgePosition.above => AlignmentDirectional.topCenter,
    BadgePosition.below => AlignmentDirectional.bottomCenter,
    BadgePosition.before => AlignmentDirectional.centerStart,
    BadgePosition.after => AlignmentDirectional.centerEnd,
  };

  Offset _offsetFor(BadgePosition pos, TextDirection textDirection) {
    final double dir = textDirection == TextDirection.rtl ? -1.0 : 1.0;
    if (overlap) {
      return switch (pos) {
        BadgePosition.aboveAfter => Offset(4 * dir, -4),
        BadgePosition.aboveBefore => Offset(-4 * dir, -4),
        BadgePosition.belowAfter => Offset(4 * dir, -4),
        BadgePosition.belowBefore => Offset(-4 * dir, -4),
        BadgePosition.above => const Offset(0, -6),
        BadgePosition.below => const Offset(0, -2),
        BadgePosition.before => Offset(-6 * dir, -8),
        BadgePosition.after => Offset(6 * dir, -8),
      };
    }
    return switch (pos) {
      BadgePosition.aboveAfter => Offset(12 * dir, -12),
      BadgePosition.aboveBefore => Offset(-12 * dir, -12),
      BadgePosition.belowAfter => Offset(12 * dir, 4),
      BadgePosition.belowBefore => Offset(-12 * dir, 4),
      BadgePosition.above => const Offset(0, -14),
      BadgePosition.below => const Offset(0, 6),
      BadgePosition.before => Offset(-14 * dir, -8),
      BadgePosition.after => Offset(14 * dir, -8),
    };
  }

  Widget _buildAnchorChild(MagicSizeMetrics metrics) {
    if (child != null) {
      return child!;
    }
    if (icon != null || iconName != null) {
      return MagicIcon(
        icon: icon,
        iconName: iconName,
        size: metrics.iconSize,
      );
    }
    if (label != null) {
      return Text(label!);
    }
    return const SizedBox.shrink();
  }

  @override
  Widget build(BuildContext context) {
    final intentColors = MagicTheme.resolveIntent(context, color);
    final metrics = MagicTheme.metricsFor(size);
    final badgeMetrics = _badgeMetricsFor(size);
    final textDirection = Directionality.of(context);
    final contentText = content?.toString();
    final hasTextContent = contentText != null && contentText.isNotEmpty;

    Widget badgeWidget = Badge(
      backgroundColor: intentColors.main,
      textColor: intentColors.onMain,
      smallSize: badgeMetrics.smallSize,
      largeSize: badgeMetrics.largeSize,
      textStyle: TextStyle(
        fontSize: badgeMetrics.fontSize,
        fontWeight: FontWeight.w600,
        height: 1.0,
      ),
      padding: EdgeInsets.symmetric(horizontal: badgeMetrics.horizontalPadding),
      alignment: _alignmentFor(position),
      offset: _offsetFor(position, textDirection),
      isLabelVisible: !hidden && !disabled,
      label: hasTextContent ? Text(contentText) : null,
      child: _buildAnchorChild(metrics),
    );

    if (testId != null) {
      badgeWidget = KeyedSubtree(
        key: ValueKey<String>(testId!),
        child: badgeWidget,
      );
    }

    return Semantics(
      label: ariaLabel ?? description,
      child: badgeWidget,
    );
  }
}

@immutable
class _BadgeSizeMetrics {
  const _BadgeSizeMetrics({
    required this.smallSize,
    required this.largeSize,
    required this.fontSize,
    required this.horizontalPadding,
  });

  final double smallSize;
  final double largeSize;
  final double fontSize;
  final double horizontalPadding;
}
