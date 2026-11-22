/// Widgetbook 3.25 use cases for [MagicDialog].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicDialog].
WidgetbookComponent buildMagicDialogComponent() {
  return WidgetbookComponent(
    name: 'MagicDialog',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final title = context.knobs.string(
            label: 'Title',
            initialValue: 'Publish Release v3.50?',
          );
          final subtitle = context.knobs.string(
            label: 'Subtitle',
            initialValue: 'This will deploy all verified Material 3 packages.',
          );
          final content = context.knobs.string(
            label: 'Content',
            initialValue:
                'Confirming publishes artifacts across Flutter, Angular, React, and React Native.',
          );
          final size = context.knobs.object.dropdown<DialogSize>(
            label: 'Size',
            options: DialogSize.values,
            initialOption: DialogSize.md,
            labelBuilder: (v) => v.name,
          );
          final alignActions =
              context.knobs.object.dropdown<DialogActionsAlignment>(
                label: 'Align Actions',
                options: DialogActionsAlignment.values,
                initialOption: DialogActionsAlignment.end,
                labelBuilder: (v) => v.name,
              );
          final showCloseButton = context.knobs.boolean(
            label: 'Show Close Button',
            initialValue: true,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return _InteractiveDialogPreview(
            title: title,
            subtitle: subtitle,
            content: content,
            size: size,
            alignActions: alignActions,
            showCloseButton: showCloseButton,
            disabled: disabled,
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Modal Route Trigger',
        builder: (context) => Center(
          child: MagicButton(
            label: 'Open Modal Dialog',
            variant: ButtonVariant.filled,
            leadingIconName: 'open_in_new',
            onPressed: () {
              showMagicDialog<void>(
                context: context,
                title: 'Confirmation Required',
                subtitle: 'Route-hosted MagicDialog',
                content:
                    'Opened via showMagicDialog with barrier and Escape dismissal.',
                actions: const <DialogActionItem>[
                  DialogActionItem(
                    id: 'cancel',
                    label: 'Cancel',
                    variant: ButtonVariant.text,
                  ),
                  DialogActionItem(
                    id: 'confirm',
                    label: 'Confirm',
                    variant: ButtonVariant.filled,
                  ),
                ],
                onActionClick: (_) => Navigator.of(context).maybePop(),
              );
            },
          ),
        ),
      ),
    ],
  );
}

class _InteractiveDialogPreview extends StatefulWidget {
  const _InteractiveDialogPreview({
    required this.title,
    required this.subtitle,
    required this.content,
    required this.size,
    required this.alignActions,
    required this.showCloseButton,
    required this.disabled,
  });

  final String title;
  final String subtitle;
  final String content;
  final DialogSize size;
  final DialogActionsAlignment alignActions;
  final bool showCloseButton;
  final bool disabled;

  @override
  State<_InteractiveDialogPreview> createState() =>
      _InteractiveDialogPreviewState();
}

class _InteractiveDialogPreviewState extends State<_InteractiveDialogPreview> {
  bool _open = true;

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: <Widget>[
        MagicButton(
          label: 'Reopen Dialog',
          variant: ButtonVariant.tonal,
          onPressed: () => setState(() => _open = true),
        ),
        MagicDialog(
          open: _open,
          title: widget.title,
          subtitle: widget.subtitle,
          content: widget.content,
          size: widget.size,
          alignActions: widget.alignActions,
          showCloseButton: widget.showCloseButton,
          disabled: widget.disabled,
          actions: const <DialogActionItem>[
            DialogActionItem(
              id: 'cancel',
              label: 'Cancel',
              variant: ButtonVariant.text,
            ),
            DialogActionItem(
              id: 'publish',
              label: 'Publish',
              variant: ButtonVariant.filled,
            ),
          ],
          onClose: () => setState(() => _open = false),
          onActionClick: (_) => setState(() => _open = false),
        ),
      ],
    );
  }
}
