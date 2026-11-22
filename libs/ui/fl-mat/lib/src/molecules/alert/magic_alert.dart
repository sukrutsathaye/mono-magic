/// Alert banner molecule composing Material 3 containers, [MagicIcon], and
/// [MagicButton] for semantic status feedback.
library;

import 'package:flutter/material.dart';

import '../../atoms/button/magic_button.dart';
import '../../core/magic_icon.dart';
import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Material 3 inline alert molecule supporting `info`, `success`, `warning`,
/// and `error` severities across `standard`, `filled`, and `outlined`
/// container variants.
///
/// Mirrors `AlertMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
class MagicAlert extends StatelessWidget {
  /// Creates a [MagicAlert].
  const MagicAlert({
    super.key,
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    this.severity = AlertSeverity.info,
    this.variant = AlertVariant.standard,
    this.title,
    required this.message,
    this.icon,
    this.iconName,
    this.hideIcon = false,
    this.dismissible = false,
    this.actionLabel,
    this.size = AtomicSize.md,
    this.onDismiss,
    this.onAction,
    this.actionSlot,
    this.child,
  });

  /// Optional logical identifier for the alert.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>`.
  final String? testId;

  /// Optional accessible semantics label overriding [title] and [message].
  final String? ariaLabel;

  /// Whether interactive alert controls are disabled.
  final bool disabled;

  /// Semantic severity controlling icon and color intent.
  final AlertSeverity severity;

  /// Material 3 visual container emphasis (`standard`, `filled`, or
  /// `outlined`).
  final AlertVariant variant;

  /// Optional bold heading displayed above [message].
  final String? title;

  /// Primary alert message body.
  final String message;

  /// Optional native Material [IconData] overriding the default severity icon.
  final IconData? icon;

  /// Optional Material icon string name overriding the default severity icon.
  final String? iconName;

  /// Whether to hide the leading severity icon.
  final bool hideIcon;

  /// Whether a close/dismiss icon button is rendered.
  final bool dismissible;

  /// Optional label for an inline action button.
  final String? actionLabel;

  /// Standardized component density/size preset.
  final AtomicSize size;

  /// Callback invoked when the dismiss button is tapped.
  final VoidCallback? onDismiss;

  /// Callback invoked when the inline action button is tapped.
  final VoidCallback? onAction;

  /// Optional custom action widget overriding [actionLabel].
  final Widget? actionSlot;

  /// Optional supplementary content rendered beneath [message].
  final Widget? child;

  ColorIntent _intentFor(AlertSeverity value) => switch (value) {
    AlertSeverity.info => ColorIntent.primary,
    AlertSeverity.success => ColorIntent.success,
    AlertSeverity.warning => ColorIntent.warning,
    AlertSeverity.error => ColorIntent.error,
  };

  IconData _defaultIconFor(AlertSeverity value) => switch (value) {
    AlertSeverity.info => Icons.info_outline,
    AlertSeverity.success => Icons.check_circle_outline,
    AlertSeverity.warning => Icons.warning_amber,
    AlertSeverity.error => Icons.error_outline,
  };

  EdgeInsetsGeometry _paddingFor(AtomicSize atomicSize) => switch (atomicSize) {
    AtomicSize.xs => const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
    AtomicSize.sm => const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
    AtomicSize.md => const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    AtomicSize.lg => const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
    AtomicSize.xl => const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
  };

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final textTheme = theme.textTheme;
    final intent = _intentFor(severity);
    final intentColors = MagicTheme.resolveIntent(context, intent);
    final metrics = MagicTheme.metricsFor(size);

    final Color backgroundColor = switch (variant) {
      AlertVariant.standard => intentColors.container,
      AlertVariant.filled => intentColors.main,
      AlertVariant.outlined => scheme.surface,
    };

    final Color borderColor = switch (variant) {
      AlertVariant.standard => intentColors.main.withValues(alpha: 0.35),
      AlertVariant.filled => Colors.transparent,
      AlertVariant.outlined => intentColors.main,
    };

    final Color activeForeground = switch (variant) {
      AlertVariant.standard => intentColors.onContainer,
      AlertVariant.filled => intentColors.onMain,
      AlertVariant.outlined => scheme.onSurface,
    };

    final Color activeIconColor = switch (variant) {
      AlertVariant.standard => intentColors.main,
      AlertVariant.filled => intentColors.onMain,
      AlertVariant.outlined => intentColors.main,
    };

    final Color disabledForeground = scheme.onSurface.withValues(alpha: 0.38);
    final Color foregroundColor = disabled
        ? disabledForeground
        : activeForeground;
    final Color iconColor = disabled ? disabledForeground : activeIconColor;

    final bool hasTitle = title != null && title!.isNotEmpty;
    final bool hasAction =
        actionSlot != null || (actionLabel != null && actionLabel!.isNotEmpty);

    final Widget? actionWidget = hasAction
        ? (actionSlot ??
              MagicButton(
                testId: testId != null ? '$testId-action' : null,
                label: actionLabel!,
                variant: ButtonVariant.text,
                color: intent,
                size: AtomicSize.sm,
                disabled: disabled,
                onPressed: disabled ? null : onAction,
                child: variant == AlertVariant.filled
                    ? Text(
                        actionLabel!,
                        style: TextStyle(
                          color: foregroundColor,
                          fontSize: metrics.fontSize - 1,
                          fontWeight: FontWeight.w600,
                        ),
                      )
                    : null,
              ))
        : null;

    final Widget? dismissButton = dismissible
        ? MagicButton(
            testId: testId != null ? '$testId-dismiss' : null,
            kind: ButtonKind.icon,
            variant: ButtonVariant.text,
            color: intent,
            size: AtomicSize.xs,
            ariaLabel: 'Dismiss alert',
            disabled: disabled,
            onPressed: disabled ? null : onDismiss,
            child: MagicIcon(
              iconName: 'close',
              size: metrics.iconSize,
              color: foregroundColor,
            ),
          )
        : null;

    final Widget container = Container(
      key: testId != null ? ValueKey<String>(testId!) : null,
      padding: _paddingFor(size),
      decoration: BoxDecoration(
        color: disabled
            ? scheme.surfaceContainerHighest.withValues(alpha: 0.5)
            : backgroundColor,
        borderRadius: const BorderRadius.all(Radius.circular(12)),
        border: Border.all(
          color: disabled
              ? scheme.outlineVariant.withValues(alpha: 0.38)
              : borderColor,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          if (!hideIcon) ...<Widget>[
            Padding(
              padding: const EdgeInsets.only(top: 1),
              child: MagicIcon(
                icon: icon,
                iconName: iconName,
                fallbackIcon: _defaultIconFor(severity),
                size: metrics.iconSize + 2,
                color: iconColor,
              ),
            ),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                if (hasTitle)
                  Text(
                    title!,
                    style: textTheme.titleSmall?.copyWith(
                      color: foregroundColor,
                      fontSize: metrics.fontSize + 1,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                if (hasTitle && message.isNotEmpty) const SizedBox(height: 2),
                if (message.isNotEmpty)
                  Text(
                    message,
                    style: textTheme.bodyMedium?.copyWith(
                      color: foregroundColor,
                      fontSize: metrics.fontSize,
                    ),
                  ),
                if (child != null) ...<Widget>[
                  const SizedBox(height: 6),
                  child!,
                ],
              ],
            ),
          ),
          if (actionWidget != null) ...<Widget>[
            const SizedBox(width: 8),
            actionWidget,
          ],
          if (dismissButton != null) ...<Widget>[
            const SizedBox(width: 4),
            dismissButton,
          ],
        ],
      ),
    );

    final String defaultSemantics = hasTitle ? '$title: $message' : message;
    return Semantics(
      container: true,
      explicitChildNodes: true,
      liveRegion: true,
      enabled: !disabled,
      label: ariaLabel ?? defaultSemantics,
      child: container,
    );
  }
}
