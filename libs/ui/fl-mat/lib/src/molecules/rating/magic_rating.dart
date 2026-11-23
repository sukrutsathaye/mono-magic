/// Material 3 star rating molecule supporting full and half-star precision,
/// controlled/uncontrolled value, readOnly/disabled states, numeric score and
/// review count display, custom icons, and semantics accessibility.
library;

import 'package:flutter/material.dart';

import '../../core/magic_icon.dart';
import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Material 3 star rating molecule supporting `0.5` and `1.0` step precision,
/// configurable [max] stars, controlled/uncontrolled state, `readOnly` and
/// `disabled` modes, numeric value and review count display, semantic
/// [ColorIntent], and accessible semantics actions.
///
/// Mirrors `RatingMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
class MagicRating extends StatefulWidget {
  /// Creates a [MagicRating].
  const MagicRating({
    super.key,
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    this.value,
    this.defaultValue = 0,
    this.max = 5,
    this.precision = MagicRatingPrecision.full,
    this.readOnly = false,
    this.showValue = false,
    this.reviewCount,
    this.icon,
    this.emptyIcon,
    this.color = ColorIntent.warning,
    this.size = AtomicSize.md,
    this.label,
    this.onChanged,
  });

  /// Optional logical identifier for the rating control.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>` on the root container.
  final String? testId;

  /// Optional accessible semantics label overriding [label].
  final String? ariaLabel;

  /// Whether the rating control is disabled.
  final bool disabled;

  /// Controlled numeric rating value between `0` and [max].
  final double? value;

  /// Initial uncontrolled numeric rating value.
  final double defaultValue;

  /// Maximum number of rating icons rendered.
  final int max;

  /// Step precision (`MagicRatingPrecision.half` or `MagicRatingPrecision.full`).
  final MagicRatingPrecision precision;

  /// Whether the rating is display-only and ignores user input.
  final bool readOnly;

  /// Whether to display the formatted numeric rating beside the stars.
  final bool showValue;

  /// Optional total review count displayed beside the rating (e.g. `(128)`).
  final int? reviewCount;

  /// Optional Material icon string name for filled rating units (defaults to `'star'`).
  final String? icon;

  /// Optional Material icon string name for unfilled rating units (defaults to `'star_border'`).
  final String? emptyIcon;

  /// Semantic accent color intent applied to filled rating icons.
  final ColorIntent color;

  /// Standardized component density/size preset.
  final AtomicSize size;

  /// Optional visible label describing what is being rated.
  final String? label;

  /// Callback invoked with the newly selected numeric rating value.
  final ValueChanged<double>? onChanged;

  @override
  State<MagicRating> createState() => _MagicRatingState();
}

class _MagicRatingState extends State<MagicRating> {
  late double _internalValue;

  @override
  void initState() {
    super.initState();
    _internalValue = _clampValue(widget.defaultValue);
  }

  @override
  void didUpdateWidget(covariant MagicRating oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value == null && oldWidget.value != null) {
      _internalValue = _clampValue(oldWidget.value!);
    }
  }

  double _clampValue(double raw) {
    if (widget.max <= 0) {
      return 0;
    }
    return raw.clamp(0.0, widget.max.toDouble());
  }

  double get _effectiveValue =>
      _clampValue(widget.value ?? _internalValue);

  bool get _isInteractive => !widget.disabled && !widget.readOnly;

  void _selectRating(double nextValue) {
    if (!_isInteractive) {
      return;
    }
    final clamped = _clampValue(nextValue);
    if (widget.value == null) {
      setState(() {
        _internalValue = clamped;
      });
    }
    widget.onChanged?.call(clamped);
  }

  double _iconSizeFor(AtomicSize size) => switch (size) {
    AtomicSize.xs => 18,
    AtomicSize.sm => 22,
    AtomicSize.md => 26,
    AtomicSize.lg => 32,
    AtomicSize.xl => 38,
  };

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final intentColors = MagicTheme.resolveIntent(context, widget.color);
    final metrics = MagicTheme.metricsFor(widget.size);
    final double starSize = _iconSizeFor(widget.size);
    final double current = _effectiveValue;

    final Color activeColor = widget.disabled
        ? scheme.onSurface.withValues(alpha: 0.38)
        : intentColors.main;
    final Color emptyColor = widget.disabled
        ? scheme.onSurface.withValues(alpha: 0.24)
        : scheme.outline;

    final IconData filledData =
        resolveMagicIconData(iconName: widget.icon) ?? Icons.star;
    final IconData emptyData =
        resolveMagicIconData(iconName: widget.emptyIcon) ?? Icons.star_border;

    final String formattedScore =
        widget.precision == MagicRatingPrecision.half
        ? current.toStringAsFixed(1)
        : (current % 1 == 0
              ? current.toStringAsFixed(1)
              : current.toStringAsFixed(1));

    final String semanticsBase = widget.ariaLabel ?? widget.label ?? 'Rating';

    final double step = widget.precision.value;
    final String? increasedScore = _isInteractive && current < widget.max
        ? _clampValue(current + step).toStringAsFixed(1)
        : null;
    final String? decreasedScore = _isInteractive && current > 0
        ? _clampValue(current - step).toStringAsFixed(1)
        : null;

    return Semantics(
      container: true,
      explicitChildNodes: true,
      enabled: !widget.disabled,
      readOnly: widget.readOnly,
      label: '$semanticsBase: $formattedScore out of ${widget.max}',
      value: formattedScore,
      increasedValue: increasedScore,
      decreasedValue: decreasedScore,
      onIncrease: increasedScore != null
          ? () => _selectRating(current + step)
          : null,
      onDecrease: decreasedScore != null
          ? () => _selectRating(current - step)
          : null,
      child: KeyedSubtree(
        key: widget.testId != null ? ValueKey<String>(widget.testId!) : null,
        child: Wrap(
          spacing: 6,
          runSpacing: 4,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: <Widget>[
            if (widget.label != null && widget.label!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(right: 4),
                child: Text(
                  widget.label!,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontSize: metrics.fontSize,
                    fontWeight: FontWeight.w500,
                    color: widget.disabled
                        ? scheme.onSurface.withValues(alpha: 0.38)
                        : scheme.onSurface,
                  ),
                ),
              ),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                for (int i = 1; i <= widget.max; i++)
                  _buildStar(
                    starIndex: i,
                    currentValue: current,
                    starSize: starSize,
                    filledData: filledData,
                    emptyData: emptyData,
                    activeColor: activeColor,
                    emptyColor: emptyColor,
                  ),
              ],
            ),
            if (widget.showValue)
              Text(
                formattedScore,
                key: widget.testId != null
                    ? ValueKey<String>('${widget.testId}-value')
                    : null,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontSize: metrics.fontSize,
                  fontWeight: FontWeight.w600,
                  color: widget.disabled
                      ? scheme.onSurface.withValues(alpha: 0.38)
                      : scheme.onSurface,
                ),
              ),
            if (widget.reviewCount != null)
              Text(
                '(${widget.reviewCount})',
                key: widget.testId != null
                    ? ValueKey<String>('${widget.testId}-reviews')
                    : null,
                style: theme.textTheme.bodySmall?.copyWith(
                  fontSize: (metrics.fontSize - 1).clamp(11, 16).toDouble(),
                  color: widget.disabled
                      ? scheme.onSurface.withValues(alpha: 0.38)
                      : scheme.onSurfaceVariant,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStar({
    required int starIndex,
    required double currentValue,
    required double starSize,
    required IconData filledData,
    required IconData emptyData,
    required Color activeColor,
    required Color emptyColor,
  }) {
    final bool isFull = currentValue >= starIndex;
    final bool isHalf =
        !isFull &&
        widget.precision == MagicRatingPrecision.half &&
        currentValue >= starIndex - 0.5;

    final IconData iconData = isFull
        ? filledData
        : (isHalf ? Icons.star_half : emptyData);
    final Color iconColor = (isFull || isHalf) ? activeColor : emptyColor;

    final Widget starWidget = SizedBox(
      width: starSize + 4,
      height: starSize + 4,
      child: Center(
        child: Icon(
          iconData,
          size: starSize,
          color: iconColor,
        ),
      ),
    );

    if (!_isInteractive) {
      return KeyedSubtree(
        key: widget.testId != null
            ? ValueKey<String>('${widget.testId}-star-$starIndex')
            : null,
        child: starWidget,
      );
    }

    return GestureDetector(
      key: widget.testId != null
          ? ValueKey<String>('${widget.testId}-star-$starIndex')
          : null,
      behavior: HitTestBehavior.opaque,
      onTapDown: (details) {
        if (widget.precision == MagicRatingPrecision.half &&
            details.localPosition.dx < (starSize + 4) / 2) {
          _selectRating(starIndex - 0.5);
        } else {
          _selectRating(starIndex.toDouble());
        }
      },
      child: starWidget,
    );
  }
}
