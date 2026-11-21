/// Material 3 tooltip atom wrapping Flutter's [Tooltip] with delay controls,
/// placement preferences, touch gesture modes, and disabled suppression.
library;

import 'package:flutter/material.dart';

import '../../interfaces/atomic_interfaces.dart';

/// Material 3 tooltip atom wrapping Flutter's [Tooltip] widget.
///
/// Uses Flutter 3.50 non-deprecated [Tooltip.constraints] (never
/// `Tooltip.height`), configurable [showDelay] / [hideDelay], [position]
/// preference, and [touchGestures] trigger mode.
class MagicToolTip extends StatelessWidget {
  /// Creates a [MagicToolTip].
  const MagicToolTip({
    super.key,
    required this.message,
    this.label,
    this.position = ToolTipPosition.below,
    this.showDelay = 0,
    this.hideDelay = 0,
    this.disabled = false,
    this.touchGestures = ToolTipTouchGestures.auto,
    this.child,
    this.id,
    this.testId,
    this.ariaLabel,
  });

  /// Tooltip text displayed inside the overlay when triggered.
  final String message;

  /// Fallback trigger text rendered when [child] is `null`.
  final String? label;

  /// Preferred placement position relative to the trigger widget.
  final ToolTipPosition position;

  /// Delay in milliseconds before the tooltip appears on hover/focus.
  final int showDelay;

  /// Duration in milliseconds the tooltip remains visible after release.
  final int hideDelay;

  /// Whether the tooltip overlay is suppressed while keeping the trigger
  /// widget rendered.
  final bool disabled;

  /// Touch gesture behavior (`auto`, `on`, or `off`).
  final ToolTipTouchGestures touchGestures;

  /// Trigger widget wrapped by the tooltip.
  final Widget? child;

  /// Optional logical identifier for the tooltip.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>`.
  final String? testId;

  /// Optional accessible semantics label.
  final String? ariaLabel;

  TooltipTriggerMode? _resolveTriggerMode() => switch (touchGestures) {
    ToolTipTouchGestures.auto => null,
    ToolTipTouchGestures.on => TooltipTriggerMode.tap,
    ToolTipTouchGestures.off => TooltipTriggerMode.manual,
  };

  @override
  Widget build(BuildContext context) {
    final Widget triggerChild = child ?? Text(label ?? '');

    Widget result;
    if (disabled || message.isEmpty) {
      result = triggerChild;
    } else {
      result = Tooltip(
        message: message,
        waitDuration: Duration(milliseconds: showDelay < 0 ? 0 : showDelay),
        showDuration: Duration(milliseconds: hideDelay < 0 ? 0 : hideDelay),
        preferBelow: position == ToolTipPosition.below,
        triggerMode: _resolveTriggerMode(),
        constraints: const BoxConstraints(minHeight: 32),
        excludeFromSemantics: ariaLabel != null,
        child: triggerChild,
      );
    }

    if (testId != null) {
      result = KeyedSubtree(
        key: ValueKey<String>(testId!),
        child: result,
      );
    }

    if (ariaLabel != null) {
      result = Semantics(
        label: ariaLabel,
        child: result,
      );
    }

    return result;
  }
}
