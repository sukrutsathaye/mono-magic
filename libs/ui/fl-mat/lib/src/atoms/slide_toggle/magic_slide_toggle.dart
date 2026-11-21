/// Material 3 slide toggle switch atom using Flutter 3.50 non-deprecated
/// [Switch] APIs (`activeThumbColor`, `thumbColor`, `trackColor`, `thumbIcon`).
library;

import 'package:flutter/material.dart';

import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Material 3 slide toggle atom wrapping Flutter's [Switch] widget.
///
/// Supports:
/// - Controlled [checked] state and [onChanged] toggle callback
/// - Custom [child] or [label] with [SlideToggleLabelPosition] (`before`/`after`)
/// - M3 [thumbIcon] (`Icons.check` / `Icons.close`) controlled by [hideIcon]
/// - [requiredField] indicator, [disabled], [disabledInteractive], and
///   [disableRipple]
/// - All 7 [ColorIntent] tokens and 5 [AtomicSize] metric steps
class MagicSlideToggle extends StatelessWidget {
  /// Creates a [MagicSlideToggle].
  const MagicSlideToggle({
    super.key,
    this.label,
    this.child,
    this.checked = false,
    this.onChanged,
    this.requiredField = false,
    this.hideIcon = false,
    this.labelPosition = SlideToggleLabelPosition.after,
    this.disabled = false,
    this.disabledInteractive = false,
    this.disableRipple = false,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.name,
    this.id,
    this.testId,
    this.ariaLabel,
  });

  /// Text label displayed adjacent to the switch when [child] is `null`.
  final String? label;

  /// Custom label widget overriding [label].
  final Widget? child;

  /// Whether the toggle is currently switched on.
  final bool checked;

  /// Callback invoked with the next boolean state when toggled.
  final ValueChanged<bool>? onChanged;

  /// Whether to append a `*` required marker to [label].
  final bool requiredField;

  /// Whether to hide the Material 3 check/close icons inside the thumb.
  final bool hideIcon;

  /// Placement of [label] or [child] relative to the switch control.
  final SlideToggleLabelPosition labelPosition;

  /// Whether the toggle is disabled.
  final bool disabled;

  /// When `true` alongside [disabled], keeps the switch focusable while
  /// styled visually disabled and suppressing [onChanged].
  final bool disabledInteractive;

  /// Whether splash/ripple ink feedback is suppressed.
  final bool disableRipple;

  /// Semantic color intent applied to the active track and thumb.
  final ColorIntent color;

  /// Standardized component size governing switch scale and label font size.
  final AtomicSize size;

  /// Optional logical field name for form integration.
  final String? name;

  /// Optional logical identifier for the toggle.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>`.
  final String? testId;

  /// Optional accessible semantics label.
  final String? ariaLabel;

  bool get _isVisuallyDisabledInteractive => disabled && disabledInteractive;

  ValueChanged<bool>? get _effectiveOnChanged {
    if (disabled) {
      return disabledInteractive ? _noOpBool : null;
    }
    return onChanged;
  }

  static void _noOpBool(bool _) {}

  void _handleLabelTap() {
    if (disabled || onChanged == null) {
      return;
    }
    onChanged!(!checked);
  }

  double _switchScale(AtomicSize atomicSize) => switch (atomicSize) {
    AtomicSize.xs => 0.78,
    AtomicSize.sm => 0.88,
    AtomicSize.md => 1.0,
    AtomicSize.lg => 1.12,
    AtomicSize.xl => 1.24,
  };

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final intentColors = MagicTheme.resolveIntent(context, color);
    final metrics = MagicTheme.metricsFor(size);
    final disabledContentColor = scheme.onSurface.withValues(alpha: 0.38);
    final disabledTrackColor = scheme.onSurface.withValues(alpha: 0.12);

    final WidgetStateProperty<Color?> thumbColor =
        WidgetStateProperty.resolveWith<Color?>((states) {
          if (states.contains(WidgetState.disabled) ||
              _isVisuallyDisabledInteractive) {
            return disabledContentColor;
          }
          if (states.contains(WidgetState.selected)) {
            return intentColors.onMain;
          }
          return scheme.outline;
        });

    final WidgetStateProperty<Color?> trackColor =
        WidgetStateProperty.resolveWith<Color?>((states) {
          if (states.contains(WidgetState.disabled) ||
              _isVisuallyDisabledInteractive) {
            return disabledTrackColor;
          }
          if (states.contains(WidgetState.selected)) {
            return intentColors.main;
          }
          return scheme.surfaceContainerHighest;
        });

    final WidgetStateProperty<Icon?>? thumbIcon = hideIcon
        ? null
        : WidgetStateProperty.resolveWith<Icon?>((states) {
            if (states.contains(WidgetState.selected)) {
              return Icon(
                Icons.check,
                color: (disabled || _isVisuallyDisabledInteractive)
                    ? disabledTrackColor
                    : intentColors.main,
              );
            }
            return Icon(
              Icons.close,
              color: (disabled || _isVisuallyDisabledInteractive)
                  ? disabledTrackColor
                  : scheme.surfaceContainerHighest,
            );
          });

    final Widget switchControl = Transform.scale(
      scale: _switchScale(size),
      child: Switch(
        value: checked,
        onChanged: _effectiveOnChanged,
        activeThumbColor: _isVisuallyDisabledInteractive
            ? disabledContentColor
            : intentColors.onMain,
        activeTrackColor: _isVisuallyDisabledInteractive
            ? disabledTrackColor
            : intentColors.main,
        thumbColor: thumbColor,
        trackColor: trackColor,
        thumbIcon: thumbIcon,
        overlayColor: disableRipple
            ? const WidgetStatePropertyAll<Color>(Colors.transparent)
            : null,
        splashRadius: disableRipple ? 0 : null,
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
    );

    Widget? labelWidget;
    if (child != null) {
      labelWidget = DefaultTextStyle.merge(
        style: TextStyle(
          fontSize: metrics.fontSize,
          color: disabled ? disabledContentColor : scheme.onSurface,
        ),
        child: child!,
      );
    } else if (label != null && label!.isNotEmpty) {
      final displayLabel = requiredField ? '$label *' : label!;
      labelWidget = Text(
        displayLabel,
        style: TextStyle(
          fontSize: metrics.fontSize,
          color: disabled ? disabledContentColor : scheme.onSurface,
        ),
      );
    }

    Widget content;
    if (labelWidget == null) {
      content = switchControl;
    } else {
      final Widget clickableLabel = disableRipple
          ? GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: disabled ? null : _handleLabelTap,
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 2),
                child: labelWidget,
              ),
            )
          : InkWell(
              borderRadius: const BorderRadius.all(Radius.circular(8)),
              onTap: disabled ? null : _handleLabelTap,
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 2),
                child: labelWidget,
              ),
            );

      final children = labelPosition == SlideToggleLabelPosition.before
          ? <Widget>[
              clickableLabel,
              const SizedBox(width: 8),
              switchControl,
            ]
          : <Widget>[
              switchControl,
              const SizedBox(width: 8),
              clickableLabel,
            ];

      content = Row(
        mainAxisSize: MainAxisSize.min,
        children: children,
      );
    }

    if (testId != null) {
      content = KeyedSubtree(
        key: ValueKey<String>(testId!),
        child: content,
      );
    }

    return Semantics(
      toggled: checked,
      enabled: !disabled,
      label: ariaLabel ?? label,
      child: content,
    );
  }
}
