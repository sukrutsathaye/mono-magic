/// Material 3 single and range slider atom using Flutter 3.50 non-deprecated
/// [SliderTheme], [Slider], and [RangeSlider] APIs.
library;

import 'package:flutter/material.dart';

import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Default compact numeric formatter for discrete [MagicSlider] value
/// indicators, matching `ng-mat`'s compact `k`/`M`/`B` notation.
///
/// Formats magnitudes:
/// - `>= 1e9` with a `B` suffix (trimming trailing `.0`)
/// - `>= 1e6` with an `M` suffix (trimming trailing `.0`)
/// - `>= 1e3` with a `k` suffix (trimming trailing `.0`)
/// - `< 1e3` as an integer string when whole, or a compact decimal string
String defaultMagicSliderDisplayWith(double value) {
  String formatScaled(double scaled, String suffix) {
    final fixed = scaled.toStringAsFixed(1);
    final trimmed = fixed.endsWith('.0')
        ? fixed.substring(0, fixed.length - 2)
        : fixed;
    return '$trimmed$suffix';
  }

  final absValue = value.abs();
  if (absValue >= 1e9) {
    return formatScaled(value / 1e9, 'B');
  }
  if (absValue >= 1e6) {
    return formatScaled(value / 1e6, 'M');
  }
  if (absValue >= 1e3) {
    return formatScaled(value / 1e3, 'k');
  }
  if (value == value.truncateToDouble()) {
    return value.toInt().toString();
  }
  return value.toStringAsFixed(2).replaceFirst(RegExp(r'\.?0+$'), '');
}

/// Material 3 slider atom wrapping Flutter's [Slider] (single thumb) and
/// [RangeSlider] (dual range thumbs).
///
/// Supports:
/// - Single value mode ([value] + [onChanged]) and range mode ([range]: `true`,
///   [startValue]/[endValue] + [onRangeChanged])
/// - Boundary-safe normalization when [max] `<=` [min], out-of-range values,
///   or reversed `[startValue, endValue]` bounds
/// - Discrete value indicators (`ShowValueIndicator.onDrag`) with
///   [defaultMagicSliderDisplayWith] or custom [displayWith]
/// - Step [showTickMarks] via `RoundSliderTickMarkShape` /
///   `RoundRangeSliderTickMarkShape`
/// - All 7 [ColorIntent] semantic tokens and 5 [AtomicSize] scale steps
class MagicSlider extends StatelessWidget {
  /// Creates a [MagicSlider].
  const MagicSlider({
    super.key,
    this.min = 0,
    this.max = 100,
    this.step = 1,
    this.value = 0,
    this.range = false,
    this.startValue = 0,
    this.endValue = 100,
    this.discrete = false,
    this.showTickMarks = false,
    this.disabled = false,
    this.disableRipple = false,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.displayWith,
    this.onChanged,
    this.onRangeChanged,
    this.id,
    this.testId,
    this.ariaLabel,
  });

  /// Minimum slider bound.
  final double min;

  /// Maximum slider bound. Safely normalized to `min + 1` when `max <= min`.
  final double max;

  /// Increment step used to derive discrete divisions and tick marks.
  final double step;

  /// Current numeric value in single-thumb mode.
  final double value;

  /// Whether to render a two-thumb [RangeSlider] instead of a single [Slider].
  final bool range;

  /// Lower thumb value when [range] is `true`.
  final double startValue;

  /// Upper thumb value when [range] is `true`.
  final double endValue;

  /// Whether to display value indicator bubbles while dragging.
  final bool discrete;

  /// Whether to display tick marks along the slider track.
  final bool showTickMarks;

  /// Whether slider interaction is disabled.
  final bool disabled;

  /// Whether the thumb touch overlay ripple is suppressed.
  final bool disableRipple;

  /// Semantic color intent applied to the active track, thumb, and indicator.
  final ColorIntent color;

  /// Standardized component size scaling track height and thumb radius.
  final AtomicSize size;

  /// Optional custom formatter for discrete value indicator labels.
  /// Defaults to [defaultMagicSliderDisplayWith].
  final String Function(double value)? displayWith;

  /// Callback invoked with the updated value in single-thumb mode.
  final ValueChanged<double>? onChanged;

  /// Callback invoked with the updated [RangeValues] in range mode.
  final ValueChanged<RangeValues>? onRangeChanged;

  /// Optional logical identifier for the slider.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>`.
  final String? testId;

  /// Optional accessible semantics label.
  final String? ariaLabel;

  double _trackHeight(AtomicSize atomicSize) => switch (atomicSize) {
    AtomicSize.xs => 2.5,
    AtomicSize.sm => 3.0,
    AtomicSize.md => 4.0,
    AtomicSize.lg => 5.5,
    AtomicSize.xl => 7.0,
  };

  double _thumbRadius(AtomicSize atomicSize) => switch (atomicSize) {
    AtomicSize.xs => 7.0,
    AtomicSize.sm => 8.5,
    AtomicSize.md => 10.0,
    AtomicSize.lg => 11.5,
    AtomicSize.xl => 13.0,
  };

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final intentColors = MagicTheme.resolveIntent(context, color);
    final metrics = MagicTheme.metricsFor(size);
    final formatter = displayWith ?? defaultMagicSliderDisplayWith;

    final double effectiveMax = max > min ? max : min + 1;
    final double effectiveValue = value.clamp(min, effectiveMax).toDouble();
    final double clampedStart = startValue.clamp(min, effectiveMax).toDouble();
    final double clampedEnd = endValue.clamp(min, effectiveMax).toDouble();
    final double effectiveStart = clampedStart <= clampedEnd
        ? clampedStart
        : clampedEnd;
    final double effectiveEnd = clampedStart <= clampedEnd
        ? clampedEnd
        : clampedStart;
    final RangeValues effectiveRange = RangeValues(
      effectiveStart,
      effectiveEnd,
    );

    final int? effectiveDivisions = (discrete || showTickMarks) && step > 0
        ? ((effectiveMax - min) / step).round().clamp(1, 1000)
        : null;

    final double trackHeight = _trackHeight(size);
    final double thumbRadius = _thumbRadius(size);

    final SliderThemeData sliderTheme = theme.sliderTheme.copyWith(
      trackHeight: trackHeight,
      activeTrackColor: intentColors.main,
      inactiveTrackColor: intentColors.main.withValues(alpha: 0.24),
      disabledActiveTrackColor: scheme.onSurface.withValues(alpha: 0.38),
      disabledInactiveTrackColor: scheme.onSurface.withValues(alpha: 0.12),
      thumbColor: intentColors.main,
      disabledThumbColor: scheme.onSurface.withValues(alpha: 0.38),
      overlayColor: disableRipple
          ? Colors.transparent
          : intentColors.main.withValues(alpha: 0.12),
      overlayShape: disableRipple
          ? SliderComponentShape.noOverlay
          : RoundSliderOverlayShape(overlayRadius: thumbRadius + 10),
      thumbShape: RoundSliderThumbShape(enabledThumbRadius: thumbRadius),
      rangeThumbShape: RoundRangeSliderThumbShape(
        enabledThumbRadius: thumbRadius,
      ),
      tickMarkShape: showTickMarks
          ? const RoundSliderTickMarkShape()
          : SliderTickMarkShape.noTickMark,
      rangeTickMarkShape: showTickMarks
          ? const RoundRangeSliderTickMarkShape()
          : const RoundRangeSliderTickMarkShape(tickMarkRadius: 0),
      activeTickMarkColor: intentColors.onMain.withValues(alpha: 0.54),
      inactiveTickMarkColor: intentColors.main.withValues(alpha: 0.54),
      showValueIndicator: discrete
          ? ShowValueIndicator.onDrag
          : ShowValueIndicator.never,
      valueIndicatorColor: intentColors.main,
      valueIndicatorTextStyle: TextStyle(
        color: intentColors.onMain,
        fontSize: (metrics.fontSize - 1).clamp(11, 18).toDouble(),
      ),
    );

    Widget sliderControl;
    if (range) {
      sliderControl = RangeSlider(
        values: effectiveRange,
        min: min,
        max: effectiveMax,
        divisions: effectiveDivisions,
        labels: discrete
            ? RangeLabels(
                formatter(effectiveRange.start),
                formatter(effectiveRange.end),
              )
            : null,
        onChanged: disabled ? null : onRangeChanged,
      );
    } else {
      sliderControl = Slider(
        value: effectiveValue,
        min: min,
        max: effectiveMax,
        divisions: effectiveDivisions,
        label: discrete ? formatter(effectiveValue) : null,
        onChanged: disabled ? null : onChanged,
      );
    }

    Widget content = SliderTheme(data: sliderTheme, child: sliderControl);

    if (testId != null) {
      content = KeyedSubtree(
        key: ValueKey<String>(testId!),
        child: content,
      );
    }

    return Semantics(
      slider: true,
      enabled: !disabled,
      label: ariaLabel,
      value: range
          ? '${formatter(effectiveRange.start)} - ${formatter(effectiveRange.end)}'
          : formatter(effectiveValue),
      child: content,
    );
  }
}
