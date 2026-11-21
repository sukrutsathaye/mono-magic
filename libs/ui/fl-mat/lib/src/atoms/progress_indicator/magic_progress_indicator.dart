/// Material 3 progress indicator atom supporting linear bars and circular
/// spinners across determinate, indeterminate, buffer, and query modes.
library;

import 'package:flutter/material.dart';

import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Material 3 progress indicator atom wrapping [LinearProgressIndicator] and
/// [CircularProgressIndicator].
///
/// Values ([value] and [bufferValue]) follow the cross-library `0..100`
/// percentage scale and are normalized internally to `0.0..1.0`.
class MagicProgressIndicator extends StatelessWidget {
  /// Creates a [MagicProgressIndicator].
  const MagicProgressIndicator({
    super.key,
    this.type = ProgressIndicatorType.bar,
    this.mode = ProgressIndicatorMode.indeterminate,
    this.value = 0,
    this.bufferValue = 0,
    this.diameter,
    this.strokeWidth,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.id,
    this.testId,
    this.ariaLabel,
  });

  /// Visual presentation style (`bar` or `spinner`).
  final ProgressIndicatorType type;

  /// Behavioral mode (`determinate`, `indeterminate`, `buffer`, or `query`).
  ///
  /// When [type] is [ProgressIndicatorType.spinner], `buffer` and `query`
  /// fall back to `indeterminate`.
  final ProgressIndicatorMode mode;

  /// Current progress percentage on a `0..100` scale.
  final double value;

  /// Secondary buffered progress percentage on a `0..100` scale (used when
  /// [type] is [ProgressIndicatorType.bar] and [mode] is
  /// [ProgressIndicatorMode.buffer]).
  final double bufferValue;

  /// Explicit diameter in logical pixels for [ProgressIndicatorType.spinner].
  ///
  /// When `null`, defaults according to [size] (`xs: 20, sm: 28, md: 40, lg: 56, xl: 72`).
  final double? diameter;

  /// Explicit stroke thickness in logical pixels for
  /// [ProgressIndicatorType.spinner].
  ///
  /// When `null`, defaults according to [size] (`xs: 2, sm: 3, md: 4, lg: 5, xl: 6`).
  final double? strokeWidth;

  /// Semantic color intent applied to indicator and track colors.
  final ColorIntent color;

  /// Standardized size controlling bar thickness and default spinner dimensions.
  final AtomicSize size;

  /// Optional logical identifier for the indicator.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>`.
  final String? testId;

  /// Optional accessible semantics label.
  final String? ariaLabel;

  double get _normalizedValue => (value / 100).clamp(0.0, 1.0);

  double get _normalizedBufferValue => (bufferValue / 100).clamp(0.0, 1.0);

  double _defaultSpinnerDiameter(AtomicSize atomicSize) => switch (atomicSize) {
    AtomicSize.xs => 20,
    AtomicSize.sm => 28,
    AtomicSize.md => 40,
    AtomicSize.lg => 56,
    AtomicSize.xl => 72,
  };

  double _defaultSpinnerStrokeWidth(AtomicSize atomicSize) =>
      switch (atomicSize) {
        AtomicSize.xs => 2,
        AtomicSize.sm => 3,
        AtomicSize.md => 4,
        AtomicSize.lg => 5,
        AtomicSize.xl => 6,
      };

  double _barHeight(AtomicSize atomicSize) => switch (atomicSize) {
    AtomicSize.xs => 2,
    AtomicSize.sm => 3,
    AtomicSize.md => 4,
    AtomicSize.lg => 6,
    AtomicSize.xl => 8,
  };

  @override
  Widget build(BuildContext context) {
    final intentColors = MagicTheme.resolveIntent(context, color);

    Widget indicator = switch (type) {
      ProgressIndicatorType.bar => _buildBar(intentColors),
      ProgressIndicatorType.spinner => _buildSpinner(intentColors),
    };

    if (testId != null) {
      indicator = KeyedSubtree(
        key: ValueKey<String>(testId!),
        child: indicator,
      );
    }

    if (ariaLabel != null) {
      indicator = Semantics(
        label: ariaLabel,
        child: indicator,
      );
    }

    return indicator;
  }

  Widget _buildBar(MagicIntentColorSet intentColors) {
    final barHeight = _barHeight(size);
    final semanticsValue = '${value.clamp(0, 100).round()}%';

    return switch (mode) {
      ProgressIndicatorMode.determinate => LinearProgressIndicator(
        value: _normalizedValue,
        minHeight: barHeight,
        color: intentColors.main,
        backgroundColor: intentColors.container,
        semanticsLabel: ariaLabel,
        semanticsValue: semanticsValue,
      ),
      ProgressIndicatorMode.indeterminate => LinearProgressIndicator(
        minHeight: barHeight,
        color: intentColors.main,
        backgroundColor: intentColors.container,
        semanticsLabel: ariaLabel,
      ),
      ProgressIndicatorMode.buffer => Stack(
        alignment: Alignment.centerLeft,
        children: <Widget>[
          LinearProgressIndicator(
            value: _normalizedBufferValue,
            minHeight: barHeight,
            color: intentColors.main.withValues(alpha: 0.35),
            backgroundColor: intentColors.container,
          ),
          LinearProgressIndicator(
            value: _normalizedValue,
            minHeight: barHeight,
            color: intentColors.main,
            backgroundColor: Colors.transparent,
            semanticsLabel: ariaLabel,
            semanticsValue: semanticsValue,
          ),
        ],
      ),
      ProgressIndicatorMode.query => Transform.flip(
        flipX: true,
        child: LinearProgressIndicator(
          minHeight: barHeight,
          color: intentColors.main,
          backgroundColor: intentColors.container,
          semanticsLabel: ariaLabel,
        ),
      ),
    };
  }

  Widget _buildSpinner(MagicIntentColorSet intentColors) {
    final effectiveDiameter = diameter ?? _defaultSpinnerDiameter(size);
    final effectiveStroke = strokeWidth ?? _defaultSpinnerStrokeWidth(size);
    final isDeterminate = mode == ProgressIndicatorMode.determinate;
    final semanticsValue =
        isDeterminate ? '${value.clamp(0, 100).round()}%' : null;

    return SizedBox(
      width: effectiveDiameter,
      height: effectiveDiameter,
      child: CircularProgressIndicator(
        value: isDeterminate ? _normalizedValue : null,
        strokeWidth: effectiveStroke,
        color: intentColors.main,
        backgroundColor: intentColors.container,
        semanticsLabel: ariaLabel,
        semanticsValue: semanticsValue,
      ),
    );
  }
}
