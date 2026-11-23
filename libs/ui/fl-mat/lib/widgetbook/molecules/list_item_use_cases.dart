/// Widgetbook 3.25 use cases for [MagicListItem].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicListItem].
WidgetbookComponent buildMagicListItemComponent() {
  return WidgetbookComponent(
    name: 'MagicListItem',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final appearance =
              context.knobs.object.dropdown<MagicListItemAppearance>(
                label: 'Appearance',
                options: MagicListItemAppearance.values,
                initialOption: MagicListItemAppearance.outlined,
                labelBuilder: (v) => v.name,
              );
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);
          final selectable = context.knobs.boolean(
            label: 'Selectable',
            initialValue: true,
          );
          final divider = context.knobs.boolean(
            label: 'Divider',
            initialValue: false,
          );
          final dense = context.knobs.boolean(
            label: 'Dense',
            initialValue: false,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return _ListItemPlayground(
            appearance: appearance,
            color: color,
            size: size,
            selectable: selectable,
            divider: divider,
            dense: dense,
            disabled: disabled,
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Surface & Slot Gallery',
        builder: (context) => Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 520),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  MagicListItem(
                    overlineText: 'WORKSPACE',
                    primaryText: 'Design Tokens Sync',
                    secondaryText: 'Updated 5 minutes ago across 4 frameworks',
                    leadingIcon: 'palette',
                    trailingBadge: 3,
                    trailingIcon: 'chevron_right',
                    appearance: MagicListItemAppearance.filled,
                    interactive: true,
                    onTap: () {},
                  ),
                  const SizedBox(height: 10),
                  MagicListItem(
                    primaryText: 'Ada Lovelace',
                    secondaryText: 'Principal Systems Architect',
                    leadingAvatarText: 'AL',
                    trailingText: 'Owner',
                    appearance: MagicListItemAppearance.outlined,
                    selected: true,
                    selectable: true,
                    onSelectedChange: (_) {},
                  ),
                  const SizedBox(height: 10),
                  const MagicListItem(
                    primaryText: 'Locked Audit Log',
                    secondaryText: 'Read-only compliance feed',
                    leadingIcon: 'lock',
                    trailingIcon: 'visibility',
                    divider: true,
                    disabled: true,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    ],
  );
}

class _ListItemPlayground extends StatefulWidget {
  const _ListItemPlayground({
    required this.appearance,
    required this.color,
    required this.size,
    required this.selectable,
    required this.divider,
    required this.dense,
    required this.disabled,
  });

  final MagicListItemAppearance appearance;
  final ColorIntent color;
  final AtomicSize size;
  final bool selectable;
  final bool divider;
  final bool dense;
  final bool disabled;

  @override
  State<_ListItemPlayground> createState() => _ListItemPlaygroundState();
}

class _ListItemPlaygroundState extends State<_ListItemPlayground> {
  final Set<String> _selectedIds = <String>{'tokens'};
  String _lastAction = 'Tap a row to interact';

  void _toggleRow(String id, String label, bool nextSelected) {
    setState(() {
      if (widget.selectable) {
        if (nextSelected) {
          _selectedIds.add(id);
        } else {
          _selectedIds.remove(id);
        }
        _lastAction =
            '$label ${nextSelected ? 'selected' : 'deselected'} (${_selectedIds.length} active)';
      } else {
        _lastAction = 'Activated $label';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 520),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              MagicListItem(
                overlineText: 'CORE',
                primaryText: 'Material 3 Design Tokens',
                secondaryText: 'ColorIntent, AtomicSize & elevation scales',
                leadingIcon: 'palette',
                trailingText: 'v2.4',
                trailingBadge: 4,
                appearance: widget.appearance,
                color: widget.color,
                size: widget.size,
                selectable: widget.selectable,
                selected: widget.selectable && _selectedIds.contains('tokens'),
                interactive: true,
                divider: widget.divider,
                dense: widget.dense,
                disabled: widget.disabled,
                onSelectedChange: (v) =>
                    _toggleRow('tokens', 'Design Tokens', v),
                onTap: widget.selectable
                    ? null
                    : () => _toggleRow('tokens', 'Design Tokens', false),
              ),
              const SizedBox(height: 8),
              MagicListItem(
                primaryText: 'Grace Hopper',
                secondaryText: 'Compiler & Runtime Engineering',
                leadingAvatarText: 'GH',
                trailingText: 'Online',
                trailingIcon: 'chevron_right',
                appearance: widget.appearance,
                color: widget.color,
                size: widget.size,
                selectable: widget.selectable,
                selected: widget.selectable && _selectedIds.contains('grace'),
                interactive: true,
                divider: widget.divider,
                dense: widget.dense,
                disabled: widget.disabled,
                onSelectedChange: (v) =>
                    _toggleRow('grace', 'Grace Hopper', v),
                onTap: widget.selectable
                    ? null
                    : () => _toggleRow('grace', 'Grace Hopper', false),
              ),
              const SizedBox(height: 12),
              Text(
                _lastAction,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
