/// Widgetbook 3.25 use cases for [MagicAlert].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicAlert].
WidgetbookComponent buildMagicAlertComponent() {
  return WidgetbookComponent(
    name: 'MagicAlert',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final title = context.knobs.string(
            label: 'Title',
            initialValue: 'System Status',
          );
          final message = context.knobs.string(
            label: 'Message',
            initialValue:
                'All workspace targets passed lint, typecheck, and test gates.',
          );
          final severity = context.knobs.object.dropdown<AlertSeverity>(
            label: 'Severity',
            options: AlertSeverity.values,
            initialOption: AlertSeverity.info,
            labelBuilder: (v) => v.name,
          );
          final variant = context.knobs.object.dropdown<AlertVariant>(
            label: 'Variant',
            options: AlertVariant.values,
            initialOption: AlertVariant.standard,
            labelBuilder: (v) => v.name,
          );
          final size = atomicSizeKnob(context);
          final hideIcon = context.knobs.boolean(
            label: 'Hide Icon',
            initialValue: false,
          );
          final dismissible = context.knobs.boolean(
            label: 'Dismissible',
            initialValue: true,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return _InteractiveAlertPreview(
            title: title,
            message: message,
            severity: severity,
            variant: variant,
            size: size,
            hideIcon: hideIcon,
            dismissible: dismissible,
            disabled: disabled,
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Severity & Variant Matrix',
        builder: (context) => SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 560),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  for (final severity in AlertSeverity.values) ...<Widget>[
                    MagicAlert(
                      severity: severity,
                      variant: AlertVariant.standard,
                      title: '${severity.name.toUpperCase()} (Standard)',
                      message: 'Standard surface alert for ${severity.name}.',
                    ),
                    const SizedBox(height: 8),
                    MagicAlert(
                      severity: severity,
                      variant: AlertVariant.filled,
                      title: '${severity.name.toUpperCase()} (Filled)',
                      message: 'High-emphasis filled alert for ${severity.name}.',
                    ),
                    const SizedBox(height: 8),
                    MagicAlert(
                      severity: severity,
                      variant: AlertVariant.outlined,
                      title: '${severity.name.toUpperCase()} (Outlined)',
                      message: 'Outlined alert for ${severity.name}.',
                    ),
                    const SizedBox(height: 16),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    ],
  );
}

class _InteractiveAlertPreview extends StatefulWidget {
  const _InteractiveAlertPreview({
    required this.title,
    required this.message,
    required this.severity,
    required this.variant,
    required this.size,
    required this.hideIcon,
    required this.dismissible,
    required this.disabled,
  });

  final String title;
  final String message;
  final AlertSeverity severity;
  final AlertVariant variant;
  final AtomicSize size;
  final bool hideIcon;
  final bool dismissible;
  final bool disabled;

  @override
  State<_InteractiveAlertPreview> createState() =>
      _InteractiveAlertPreviewState();
}

class _InteractiveAlertPreviewState extends State<_InteractiveAlertPreview> {
  bool _visible = true;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 520),
        child: _visible
            ? MagicAlert(
                title: widget.title,
                message: widget.message,
                severity: widget.severity,
                variant: widget.variant,
                size: widget.size,
                hideIcon: widget.hideIcon,
                dismissible: widget.dismissible,
                disabled: widget.disabled,
                actionLabel: 'View Logs',
                onAction: () {},
                onDismiss: () => setState(() => _visible = false),
              )
            : MagicButton(
                label: 'Show Alert',
                variant: ButtonVariant.tonal,
                onPressed: () => setState(() => _visible = true),
              ),
      ),
    );
  }
}
