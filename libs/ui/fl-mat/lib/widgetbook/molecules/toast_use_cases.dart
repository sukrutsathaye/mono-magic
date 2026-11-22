/// Widgetbook 3.25 use cases for [MagicToast].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicToast].
WidgetbookComponent buildMagicToastComponent() {
  return WidgetbookComponent(
    name: 'MagicToast',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final title = context.knobs.string(
            label: 'Title',
            initialValue: 'Changes Saved',
          );
          final message = context.knobs.string(
            label: 'Message',
            initialValue: 'Your Material 3 palette preferences were updated.',
          );
          final severity = context.knobs.object.dropdown<AlertSeverity>(
            label: 'Severity',
            options: AlertSeverity.values,
            initialOption: AlertSeverity.success,
            labelBuilder: (v) => v.name,
          );
          final position = context.knobs.object.dropdown<ToastPosition>(
            label: 'Position',
            options: ToastPosition.values,
            initialOption: ToastPosition.bottomRight,
            labelBuilder: (v) => v.name,
          );
          final dismissible = context.knobs.boolean(
            label: 'Dismissible',
            initialValue: true,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return _InteractiveToastPreview(
            title: title,
            message: message,
            severity: severity,
            position: position,
            dismissible: dismissible,
            disabled: disabled,
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Overlay Trigger & Severities',
        builder: (context) => Center(
          child: Wrap(
            spacing: 12,
            runSpacing: 12,
            children: <Widget>[
              for (final severity in AlertSeverity.values)
                MagicButton(
                  label: 'Show ${severity.name}',
                  variant: ButtonVariant.tonal,
                  onPressed: () {
                    showMagicToast(
                      context: context,
                      severity: severity,
                      title: '${severity.name.toUpperCase()} Toast',
                      message: 'Triggered transient ${severity.name} toast.',
                      duration: null,
                      actionLabel: 'Undo',
                      onAction: () {},
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    ],
  );
}

class _InteractiveToastPreview extends StatefulWidget {
  const _InteractiveToastPreview({
    required this.title,
    required this.message,
    required this.severity,
    required this.position,
    required this.dismissible,
    required this.disabled,
  });

  final String title;
  final String message;
  final AlertSeverity severity;
  final ToastPosition position;
  final bool dismissible;
  final bool disabled;

  @override
  State<_InteractiveToastPreview> createState() =>
      _InteractiveToastPreviewState();
}

class _InteractiveToastPreviewState extends State<_InteractiveToastPreview> {
  bool _open = true;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: <Widget>[
        Center(
          child: MagicButton(
            label: 'Show Toast',
            variant: ButtonVariant.filled,
            onPressed: () => setState(() => _open = true),
          ),
        ),
        // Persistent (duration: null) in preview so Widgetbook testers never
        // have pending timers on pump().
        MagicToast(
          open: _open,
          title: widget.title,
          message: widget.message,
          severity: widget.severity,
          position: widget.position,
          dismissible: widget.dismissible,
          disabled: widget.disabled,
          duration: null,
          actionLabel: 'Undo',
          onAction: () {},
          onClose: () => setState(() => _open = false),
        ),
      ],
    );
  }
}
