/// Transient toast notification molecule with 6 viewport anchor positions,
/// auto-dismiss timer management, and [showMagicToast] overlay helper.
library;

import 'dart:async';

import 'package:flutter/material.dart';

import '../../atoms/button/magic_button.dart';
import '../../core/magic_icon.dart';
import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Displays a transient [MagicToast] via the nearest [Overlay] and returns the
/// inserted [OverlayEntry] handle.
///
/// The overlay entry automatically removes itself when the toast auto-dismisses
/// or the user taps the dismiss button.
OverlayEntry showMagicToast({
  required BuildContext context,
  String? id,
  String? testId,
  String? ariaLabel,
  bool disabled = false,
  AlertSeverity severity = AlertSeverity.info,
  String? title,
  required String message,
  int? duration = 4000,
  ToastPosition position = ToastPosition.bottomRight,
  bool dismissible = true,
  String? actionLabel,
  VoidCallback? onClose,
  VoidCallback? onAction,
}) {
  final overlay = Overlay.of(context);
  late final OverlayEntry entry;

  void handleClose() {
    if (entry.mounted) {
      entry.remove();
    }
    onClose?.call();
  }

  entry = OverlayEntry(
    builder: (overlayContext) => Positioned.fill(
      child: Material(
        type: MaterialType.transparency,
        child: SafeArea(
          child: MagicToast(
            id: id,
            testId: testId,
            ariaLabel: ariaLabel,
            disabled: disabled,
            open: true,
            severity: severity,
            title: title,
            message: message,
            duration: duration,
            position: position,
            dismissible: dismissible,
            actionLabel: actionLabel,
            onClose: handleClose,
            onAction: onAction,
          ),
        ),
      ),
    ),
  );

  overlay.insert(entry);
  return entry;
}

/// Material 3 transient notification molecule supporting 6 [ToastPosition]
/// viewport anchors, semantic [AlertSeverity] accents, inline action buttons,
/// manual dismissal, and timer-driven auto-dismissal.
///
/// Mirrors `ToastMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
class MagicToast extends StatefulWidget {
  /// Creates a [MagicToast].
  const MagicToast({
    super.key,
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    this.open = false,
    this.severity = AlertSeverity.info,
    this.title,
    required this.message,
    this.duration = 4000,
    this.position = ToastPosition.bottomRight,
    this.dismissible = true,
    this.actionLabel,
    this.onClose,
    this.onAction,
  });

  /// Optional logical identifier for the toast.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>` on the toast surface.
  final String? testId;

  /// Optional accessible semantics label overriding [title] and [message].
  final String? ariaLabel;

  /// Whether the toast controls and auto-dismiss timer are disabled.
  final bool disabled;

  /// Whether the toast notification is currently visible.
  final bool open;

  /// Semantic severity level controlling accent color and icon.
  final AlertSeverity severity;

  /// Optional bold heading displayed above [message].
  final String? title;

  /// Primary notification message text.
  final String message;

  /// Auto-dismiss timeout in milliseconds, or `null` to remain persistent.
  final int? duration;

  /// Viewport anchor position when rendered inside a bounded viewport.
  final ToastPosition position;

  /// Whether a manual dismiss icon button is rendered.
  final bool dismissible;

  /// Optional label for an inline action button (e.g., `'Undo'`).
  final String? actionLabel;

  /// Callback invoked when the toast dismisses (manually or via timeout).
  final VoidCallback? onClose;

  /// Callback invoked when the inline action button is pressed.
  final VoidCallback? onAction;

  @override
  State<MagicToast> createState() => _MagicToastState();
}

class _MagicToastState extends State<MagicToast> {
  Timer? _autoDismissTimer;

  @override
  void initState() {
    super.initState();
    _syncAutoDismissTimer();
  }

  @override
  void didUpdateWidget(covariant MagicToast oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.open != widget.open ||
        oldWidget.duration != widget.duration ||
        oldWidget.disabled != widget.disabled) {
      _syncAutoDismissTimer();
    }
  }

  @override
  void dispose() {
    _cancelTimer();
    super.dispose();
  }

  void _cancelTimer() {
    _autoDismissTimer?.cancel();
    _autoDismissTimer = null;
  }

  void _syncAutoDismissTimer() {
    _cancelTimer();
    final int? durationMs = widget.duration;
    if (!widget.open ||
        widget.disabled ||
        durationMs == null ||
        durationMs <= 0) {
      return;
    }
    _autoDismissTimer = Timer(Duration(milliseconds: durationMs), () {
      if (mounted && widget.open) {
        widget.onClose?.call();
      }
    });
  }

  ColorIntent _intentFor(AlertSeverity value) => switch (value) {
    AlertSeverity.info => ColorIntent.primary,
    AlertSeverity.success => ColorIntent.success,
    AlertSeverity.warning => ColorIntent.warning,
    AlertSeverity.error => ColorIntent.error,
  };

  IconData _iconFor(AlertSeverity value) => switch (value) {
    AlertSeverity.info => Icons.info_outline,
    AlertSeverity.success => Icons.check_circle_outline,
    AlertSeverity.warning => Icons.warning_amber,
    AlertSeverity.error => Icons.error_outline,
  };

  Alignment _alignmentFor(ToastPosition pos) => switch (pos) {
    ToastPosition.topLeft => Alignment.topLeft,
    ToastPosition.topCenter => Alignment.topCenter,
    ToastPosition.topRight => Alignment.topRight,
    ToastPosition.bottomLeft => Alignment.bottomLeft,
    ToastPosition.bottomCenter => Alignment.bottomCenter,
    ToastPosition.bottomRight => Alignment.bottomRight,
  };

  @override
  Widget build(BuildContext context) {
    if (!widget.open) {
      return const SizedBox.shrink();
    }

    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final textTheme = theme.textTheme;
    final intent = _intentFor(widget.severity);
    final intentColors = MagicTheme.resolveIntent(context, intent);
    final bool hasTitle = widget.title != null && widget.title!.isNotEmpty;
    final bool hasAction =
        widget.actionLabel != null && widget.actionLabel!.isNotEmpty;

    final Color surfaceColor = scheme.inverseSurface;
    final Color foregroundColor = widget.disabled
        ? scheme.onInverseSurface.withValues(alpha: 0.38)
        : scheme.onInverseSurface;
    final Color accentColor = widget.disabled
        ? foregroundColor
        : intentColors.container;

    final Widget toastCard = ConstrainedBox(
      constraints: const BoxConstraints(minWidth: 260, maxWidth: 420),
      child: Material(
        key: widget.testId != null ? ValueKey<String>(widget.testId!) : null,
        color: surfaceColor,
        elevation: 6,
        borderRadius: const BorderRadius.all(Radius.circular(12)),
        clipBehavior: Clip.antiAlias,
        child: Container(
          decoration: BoxDecoration(
            border: Border(
              left: BorderSide(
                color: widget.disabled ? foregroundColor : intentColors.main,
                width: 4,
              ),
            ),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: <Widget>[
              MagicIcon(
                icon: _iconFor(widget.severity),
                size: 20,
                color: accentColor,
              ),
              const SizedBox(width: 12),
              Flexible(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    if (hasTitle)
                      Text(
                        widget.title!,
                        style: textTheme.titleSmall?.copyWith(
                          color: foregroundColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    if (hasTitle && widget.message.isNotEmpty)
                      const SizedBox(height: 2),
                    Text(
                      widget.message,
                      style: textTheme.bodyMedium?.copyWith(
                        color: foregroundColor,
                      ),
                    ),
                  ],
                ),
              ),
              if (hasAction) ...<Widget>[
                const SizedBox(width: 8),
                MagicButton(
                  testId: widget.testId != null
                      ? '${widget.testId}-action'
                      : null,
                  label: widget.actionLabel!,
                  variant: ButtonVariant.text,
                  size: AtomicSize.sm,
                  disabled: widget.disabled,
                  onPressed: widget.disabled ? null : widget.onAction,
                  child: Text(
                    widget.actionLabel!,
                    style: TextStyle(
                      color: accentColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
              if (widget.dismissible) ...<Widget>[
                const SizedBox(width: 4),
                MagicButton(
                  testId: widget.testId != null
                      ? '${widget.testId}-dismiss'
                      : null,
                  kind: ButtonKind.icon,
                  variant: ButtonVariant.text,
                  size: AtomicSize.xs,
                  ariaLabel: 'Dismiss notification',
                  disabled: widget.disabled,
                  onPressed: widget.disabled ? null : widget.onClose,
                  child: MagicIcon(
                    iconName: 'close',
                    size: 18,
                    color: foregroundColor,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );

    final String defaultSemantics = hasTitle
        ? '${widget.title}: ${widget.message}'
        : widget.message;

    final Widget semanticToast = Semantics(
      container: true,
      explicitChildNodes: true,
      liveRegion: true,
      enabled: !widget.disabled,
      label: widget.ariaLabel ?? defaultSemantics,
      child: toastCard,
    );

    return LayoutBuilder(
      builder: (context, constraints) {
        final bool hasBoundedViewport =
            constraints.hasBoundedWidth && constraints.hasBoundedHeight;
        if (!hasBoundedViewport) {
          return semanticToast;
        }
        return Align(
          alignment: _alignmentFor(widget.position),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: semanticToast,
          ),
        );
      },
    );
  }
}
