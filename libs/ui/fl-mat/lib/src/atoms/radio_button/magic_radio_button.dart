/// Material 3 radio button group atom built on Flutter 3.50's [RadioGroup]
/// and [Radio] APIs with vertical/horizontal layouts, clickable labels, and
/// semantic color intents.
library;

import 'package:flutter/material.dart';

import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Material 3 radio button group atom wrapping [RadioGroup] and [Radio].
///
/// Supports:
/// - Strongly typed generic selection `<T>` via [RadioOption<T>]
/// - Flutter 3.50 [RadioGroup<T>] + `Radio<T>(value:, enabled:)` (zero
///   deprecated `groupValue`/`onChanged` props)
/// - Vertical ([Column]) and horizontal ([Wrap]) layouts via [vertical]
/// - Per-option [RadioOption.labelPosition] overriding group [labelPosition]
/// - Group-level and per-option [disabled], [disabledInteractive], and
///   [disableRipple]
/// - All 7 [ColorIntent] semantic tokens and 5 [AtomicSize] label/spacing steps
class MagicRadioButton<T> extends StatelessWidget {
  /// Creates a [MagicRadioButton] group.
  const MagicRadioButton({
    super.key,
    required this.options,
    this.value,
    this.onChanged,
    this.name,
    this.labelPosition = RadioLabelPosition.after,
    this.requiredField = false,
    this.disabled = false,
    this.disabledInteractive = false,
    this.disableRipple = false,
    this.vertical = true,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.id,
    this.testId,
    this.ariaLabel,
  });

  /// Selectable options rendered inside the radio group.
  final List<RadioOption<T>> options;

  /// Currently selected option value.
  final T? value;

  /// Callback invoked with the selected [RadioOption.value] when changed.
  final ValueChanged<T?>? onChanged;

  /// Optional logical field name for form integration.
  final String? name;

  /// Default placement of option labels relative to their radio indicator.
  final RadioLabelPosition labelPosition;

  /// Whether selecting an option is required.
  final bool requiredField;

  /// Whether the entire radio group is disabled.
  final bool disabled;

  /// When `true` alongside [disabled], keeps options visually disabled and
  /// suppresses [onChanged] while preserving focusability.
  final bool disabledInteractive;

  /// Whether splash/ripple ink feedback is suppressed on radio controls and
  /// clickable labels.
  final bool disableRipple;

  /// Whether options are arranged vertically (`true`) or wrapped horizontally
  /// (`false`).
  final bool vertical;

  /// Semantic color intent applied to selected radio indicators.
  final ColorIntent color;

  /// Standardized component size governing label font size and row spacing.
  final AtomicSize size;

  /// Optional logical identifier for the radio group.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>`.
  final String? testId;

  /// Optional accessible semantics label describing the group.
  final String? ariaLabel;

  bool _isOptionDisabled(RadioOption<T> option) => disabled || option.disabled;

  void _handleGroupChanged(T? nextValue) {
    if (disabled || onChanged == null) {
      return;
    }
    if (nextValue != null) {
      for (final opt in options) {
        if (opt.value == nextValue && opt.disabled) {
          return;
        }
      }
    }
    onChanged!(nextValue);
  }

  double _radioScale(AtomicSize atomicSize) => switch (atomicSize) {
    AtomicSize.xs => 0.85,
    AtomicSize.sm => 0.92,
    AtomicSize.md => 1.0,
    AtomicSize.lg => 1.1,
    AtomicSize.xl => 1.2,
  };

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final intentColors = MagicTheme.resolveIntent(context, color);
    final metrics = MagicTheme.metricsFor(size);
    final disabledColor = scheme.onSurface.withValues(alpha: 0.38);

    final fillColor = WidgetStateProperty.resolveWith<Color?>((states) {
      if (states.contains(WidgetState.disabled) || disabled) {
        return disabledColor;
      }
      if (states.contains(WidgetState.selected)) {
        return intentColors.main;
      }
      return scheme.onSurfaceVariant;
    });

    final List<Widget> children = <Widget>[
      for (final option in options)
        _buildOptionRow(
          context: context,
          option: option,
          metrics: metrics,
          fillColor: fillColor,
          disabledColor: disabledColor,
          scheme: scheme,
        ),
    ];

    Widget content = vertical
        ? Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: children,
          )
        : Wrap(
            spacing: 16,
            runSpacing: 8,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: children,
          );

    content = RadioGroup<T>(
      groupValue: value,
      onChanged: _handleGroupChanged,
      child: content,
    );

    if (disableRipple) {
      content = Theme(
        data: theme.copyWith(splashFactory: NoSplash.splashFactory),
        child: content,
      );
    }

    if (testId != null) {
      content = KeyedSubtree(
        key: ValueKey<String>(testId!),
        child: content,
      );
    }

    if (ariaLabel != null) {
      content = Semantics(
        label: ariaLabel,
        child: content,
      );
    }

    return content;
  }

  Widget _buildOptionRow({
    required BuildContext context,
    required RadioOption<T> option,
    required MagicSizeMetrics metrics,
    required WidgetStateProperty<Color?> fillColor,
    required Color disabledColor,
    required ColorScheme scheme,
  }) {
    final optDisabled = _isOptionDisabled(option);
    final effectiveLabelPos = option.labelPosition ?? labelPosition;
    final showRequiredStar = requiredField || option.requiredField;
    final labelText = showRequiredStar ? '${option.label} *' : option.label;
    final bool radioEnabled = !optDisabled || disabledInteractive;

    final Widget radio = Transform.scale(
      scale: _radioScale(size),
      child: Radio<T>(
        value: option.value,
        enabled: radioEnabled,
        fillColor: fillColor,
        overlayColor: disableRipple
            ? const WidgetStatePropertyAll<Color>(Colors.transparent)
            : null,
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
    );

    final Widget labelWidget = Text(
      labelText,
      style: TextStyle(
        fontSize: metrics.fontSize,
        color: optDisabled ? disabledColor : scheme.onSurface,
      ),
    );

    final rowChildren = effectiveLabelPos == RadioLabelPosition.before
        ? <Widget>[
            labelWidget,
            const SizedBox(width: 4),
            radio,
          ]
        : <Widget>[
            radio,
            const SizedBox(width: 4),
            labelWidget,
          ];

    final row = Row(
      mainAxisSize: MainAxisSize.min,
      children: rowChildren,
    );

    if (disableRipple) {
      return GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: optDisabled ? null : () => _handleGroupChanged(option.value),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 2),
          child: row,
        ),
      );
    }

    return InkWell(
      borderRadius: const BorderRadius.all(Radius.circular(8)),
      onTap: optDisabled ? null : () => _handleGroupChanged(option.value),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 2),
        child: row,
      ),
    );
  }
}
