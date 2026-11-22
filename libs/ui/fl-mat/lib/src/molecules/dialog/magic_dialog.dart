/// Dialog molecule composing Material 3 [Dialog], [MagicButton], and
/// accessible modal scrim / Escape dismissal controls.
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../atoms/button/magic_button.dart';
import '../../interfaces/atomic_interfaces.dart';

/// Displays a modal [MagicDialog] using Flutter's [showDialog] route overlay.
///
/// Mirrors the declarative [MagicDialog] contract while delegating modal route
/// barrier handling, Escape dismissal, and navigation stack popping to
/// [Navigator].
Future<T?> showMagicDialog<T>({
  required BuildContext context,
  String? id,
  String? testId,
  String? ariaLabel,
  bool disabled = false,
  String? title,
  String? subtitle,
  String? content,
  DialogSize size = DialogSize.md,
  bool dismissible = true,
  bool closeOnBackdropClick = true,
  bool closeOnEscape = true,
  bool showCloseButton = true,
  bool scrollable = false,
  List<DialogActionItem> actions = const <DialogActionItem>[],
  DialogActionsAlignment alignActions = DialogActionsAlignment.end,
  ValueChanged<DialogActionItem>? onActionClick,
  VoidCallback? onClose,
  Widget? child,
  Widget? headerSlot,
  Widget? actionsSlot,
}) {
  return showDialog<T>(
    context: context,
    barrierDismissible: !disabled && dismissible && closeOnBackdropClick,
    useSafeArea: size != DialogSize.fullscreen,
    builder: (dialogContext) {
      void handleClose() {
        onClose?.call();
        Navigator.of(dialogContext).maybePop();
      }

      return PopScope(
        canPop: !disabled && dismissible && closeOnEscape,
        onPopInvokedWithResult: (didPop, _) {
          if (didPop) {
            onClose?.call();
          }
        },
        child: MagicDialog(
          id: id,
          testId: testId,
          ariaLabel: ariaLabel,
          disabled: disabled,
          open: true,
          title: title,
          subtitle: subtitle,
          content: content,
          size: size,
          dismissible: dismissible,
          closeOnBackdropClick: closeOnBackdropClick,
          closeOnEscape: closeOnEscape,
          showCloseButton: showCloseButton,
          scrollable: scrollable,
          actions: actions,
          alignActions: alignActions,
          renderBackdrop: false,
          onActionClick: onActionClick,
          onClose: handleClose,
          headerSlot: headerSlot,
          actionsSlot: actionsSlot,
          child: child,
        ),
      );
    },
  );
}

/// Material 3 dialog molecule supporting responsive size presets (`sm`, `md`,
/// `lg`, `fullscreen`), backdrop and Escape dismissal, scrollable content,
/// data-driven footer [MagicButton] actions, and custom header/body/action slots.
///
/// Mirrors `DialogMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
class MagicDialog extends StatelessWidget {
  /// Creates a [MagicDialog].
  const MagicDialog({
    super.key,
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    this.open = false,
    this.title,
    this.subtitle,
    this.content,
    this.size = DialogSize.md,
    this.dismissible = true,
    this.closeOnBackdropClick = true,
    this.closeOnEscape = true,
    this.showCloseButton = true,
    this.scrollable = false,
    this.actions = const <DialogActionItem>[],
    this.alignActions = DialogActionsAlignment.end,
    this.renderBackdrop = true,
    this.onClose,
    this.onActionClick,
    this.headerSlot,
    this.actionsSlot,
    this.child,
  });

  /// Optional logical identifier for the dialog.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>` on the dialog surface.
  final String? testId;

  /// Optional accessible semantics label overriding [title].
  final String? ariaLabel;

  /// Whether dialog controls and close actions are disabled.
  final bool disabled;

  /// Whether the dialog is currently visible.
  final bool open;

  /// Primary heading displayed in the dialog header when [headerSlot] is
  /// `null`.
  final String? title;

  /// Optional secondary subtitle displayed beneath [title].
  final String? subtitle;

  /// Body text message rendered when [child] is omitted or alongside [child].
  final String? content;

  /// Responsive container width preset (`sm`, `md`, `lg`, `fullscreen`).
  final DialogSize size;

  /// Whether the dialog can be dismissed by user interaction.
  final bool dismissible;

  /// Whether tapping the backdrop scrim triggers [onClose].
  final bool closeOnBackdropClick;

  /// Whether pressing the Escape key triggers [onClose].
  final bool closeOnEscape;

  /// Whether a close icon button is rendered in the dialog header.
  final bool showCloseButton;

  /// Whether long body content scrolls independently inside the dialog.
  final bool scrollable;

  /// Data-driven footer action buttons rendered via [MagicButton].
  final List<DialogActionItem> actions;

  /// Horizontal alignment of footer action buttons (`start` or `end`).
  final DialogActionsAlignment alignActions;

  /// Whether to render a declarative modal scrim behind the dialog surface.
  ///
  /// Set to `false` when [MagicDialog] is hosted inside [showMagicDialog] or
  /// Flutter's [showDialog] route, which supplies its own barrier scrim.
  final bool renderBackdrop;

  /// Callback invoked when the user requests to close the dialog.
  final VoidCallback? onClose;

  /// Callback invoked when an enabled [DialogActionItem] button is pressed.
  final ValueChanged<DialogActionItem>? onActionClick;

  /// Optional custom header widget replacing the default [title]/[subtitle]
  /// header.
  final Widget? headerSlot;

  /// Optional custom footer actions widget replacing [actions].
  final Widget? actionsSlot;

  /// Optional custom body widget rendered inside the dialog content section.
  final Widget? child;

  double _maxWidthFor(DialogSize preset) => switch (preset) {
    DialogSize.sm => 400,
    DialogSize.md => 560,
    DialogSize.lg => 760,
    DialogSize.fullscreen => double.infinity,
  };

  @override
  Widget build(BuildContext context) {
    if (!open) {
      return const SizedBox.shrink();
    }

    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final textTheme = theme.textTheme;
    final bool isFullscreen = size == DialogSize.fullscreen;
    final bool canDismiss = !disabled && dismissible;
    final bool canBackdropDismiss = canDismiss && closeOnBackdropClick;
    final bool canEscapeDismiss = canDismiss && closeOnEscape;

    final bool hasTitle = title != null && title!.isNotEmpty;
    final bool hasSubtitle = subtitle != null && subtitle!.isNotEmpty;
    final bool hasHeader =
        headerSlot != null ||
        hasTitle ||
        hasSubtitle ||
        (showCloseButton && dismissible);
    final bool hasContentText = content != null && content!.isNotEmpty;
    final bool hasBody = hasContentText || child != null;
    final bool hasActions = actionsSlot != null || actions.isNotEmpty;

    final Widget? headerWidget = hasHeader
        ? Padding(
            padding: const EdgeInsets.fromLTRB(24, 20, 16, 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Expanded(
                  child:
                      headerSlot ??
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          if (hasTitle)
                            Text(
                              title!,
                              style: textTheme.headlineSmall?.copyWith(
                                color: disabled
                                    ? scheme.onSurface.withValues(alpha: 0.38)
                                    : scheme.onSurface,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          if (hasSubtitle) ...<Widget>[
                            if (hasTitle) const SizedBox(height: 4),
                            Text(
                              subtitle!,
                              style: textTheme.bodyMedium?.copyWith(
                                color: disabled
                                    ? scheme.onSurface.withValues(alpha: 0.38)
                                    : scheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ],
                      ),
                ),
                if (showCloseButton && dismissible) ...<Widget>[
                  const SizedBox(width: 8),
                  MagicButton(
                    testId: testId != null ? '$testId-close' : null,
                    kind: ButtonKind.icon,
                    variant: ButtonVariant.text,
                    color: ColorIntent.neutral,
                    size: AtomicSize.sm,
                    leadingIconName: 'close',
                    ariaLabel: 'Close dialog',
                    disabled: disabled,
                    onPressed: canDismiss ? onClose : null,
                  ),
                ],
              ],
            ),
          )
        : null;

    Widget? bodyContent = hasBody
        ? Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              if (hasContentText)
                Text(
                  content!,
                  style: textTheme.bodyMedium?.copyWith(
                    color: disabled
                        ? scheme.onSurface.withValues(alpha: 0.38)
                        : scheme.onSurfaceVariant,
                  ),
                ),
              if (hasContentText && child != null) const SizedBox(height: 12),
              ?child,
            ],
          )
        : null;

    if (bodyContent != null) {
      bodyContent = Padding(
        padding: EdgeInsets.fromLTRB(
          24,
          hasHeader ? 4 : 24,
          24,
          hasActions ? 12 : 24,
        ),
        child: bodyContent,
      );
      if (scrollable) {
        bodyContent = Flexible(
          child: SingleChildScrollView(child: bodyContent),
        );
      } else if (isFullscreen) {
        bodyContent = Expanded(
          child: SingleChildScrollView(child: bodyContent),
        );
      }
    } else if (isFullscreen) {
      bodyContent = const Spacer();
    }

    final Widget? footerWidget = hasActions
        ? Padding(
            padding: const EdgeInsets.fromLTRB(24, 8, 24, 20),
            child:
                actionsSlot ??
                Row(
                  mainAxisAlignment:
                      alignActions == DialogActionsAlignment.start
                      ? MainAxisAlignment.start
                      : MainAxisAlignment.end,
                  children: <Widget>[
                    Flexible(
                      child: Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        alignment: alignActions == DialogActionsAlignment.start
                            ? WrapAlignment.start
                            : WrapAlignment.end,
                        children: <Widget>[
                          for (final action in actions)
                            MagicButton(
                              id: action.id,
                              testId: testId != null && action.id != null
                                  ? '$testId-action-${action.id}'
                                  : null,
                              label: action.label,
                              variant: action.variant ?? ButtonVariant.text,
                              color: action.color ?? ColorIntent.primary,
                              leadingIcon: action.icon,
                              leadingIconName: action.iconName,
                              disabled: disabled || action.disabled,
                              onPressed: (disabled || action.disabled)
                                  ? null
                                  : () => onActionClick?.call(action),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
          )
        : null;

    final Widget surface = Material(
      key: testId != null ? ValueKey<String>(testId!) : null,
      color: scheme.surfaceContainerHigh,
      elevation: isFullscreen ? 0 : 6,
      surfaceTintColor: scheme.surfaceTint,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: isFullscreen
            ? BorderRadius.zero
            : const BorderRadius.all(Radius.circular(28)),
      ),
      child: Column(
        mainAxisSize: isFullscreen ? MainAxisSize.max : MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          ?headerWidget,
          ?bodyContent,
          ?footerWidget,
        ],
      ),
    );

    Widget dialogTree = isFullscreen
        ? surface
        : ConstrainedBox(
            constraints: BoxConstraints(
              minWidth: 280,
              maxWidth: _maxWidthFor(size),
            ),
            child: surface,
          );

    if (canEscapeDismiss && onClose != null) {
      dialogTree = CallbackShortcuts(
        bindings: <ShortcutActivator, VoidCallback>{
          const SingleActivator(LogicalKeyboardKey.escape): onClose!,
        },
        child: Focus(autofocus: true, child: dialogTree),
      );
    }

    dialogTree = Semantics(
      container: true,
      scopesRoute: true,
      namesRoute: true,
      explicitChildNodes: true,
      enabled: !disabled,
      label: ariaLabel ?? title ?? 'Dialog',
      child: dialogTree,
    );

    if (!renderBackdrop) {
      if (isFullscreen) {
        return SizedBox.expand(child: dialogTree);
      }
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: dialogTree,
        ),
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final bool hasBoundedViewport =
            constraints.hasBoundedWidth && constraints.hasBoundedHeight;

        if (!hasBoundedViewport) {
          return isFullscreen
              ? SizedBox(width: 480, height: 360, child: dialogTree)
              : Center(child: dialogTree);
        }

        return SizedBox(
          width: constraints.maxWidth,
          height: constraints.maxHeight,
          child: Stack(
            alignment: Alignment.center,
            children: <Widget>[
              Positioned.fill(
                child: GestureDetector(
                  key: testId != null
                      ? ValueKey<String>('$testId-backdrop')
                      : null,
                  behavior: HitTestBehavior.opaque,
                  onTap: canBackdropDismiss ? onClose : null,
                  child: ColoredBox(
                    color: scheme.scrim.withValues(alpha: 0.45),
                  ),
                ),
              ),
              if (isFullscreen)
                Positioned.fill(child: dialogTree)
              else
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                      maxHeight: (constraints.maxHeight - 48).clamp(
                        120,
                        double.infinity,
                      ),
                    ),
                    child: dialogTree,
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
