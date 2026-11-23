/// Widgetbook 3.25 use cases for [MagicBreadcrumbs].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicBreadcrumbs].
WidgetbookComponent buildMagicBreadcrumbsComponent() {
  return WidgetbookComponent(
    name: 'MagicBreadcrumbs',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Trail Playground',
        builder: (context) {
          final separator = context.knobs.string(
            label: 'Separator',
            initialValue: '/',
          );
          final collapseMiddle = context.knobs.boolean(
            label: 'Collapse Middle (maxItems = 3)',
            initialValue: false,
          );
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return _BreadcrumbsPlayground(
            separator: separator.isEmpty ? '/' : separator,
            maxItems: collapseMiddle ? 3 : null,
            color: color,
            size: size,
            disabled: disabled,
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Collapsed Chevron Trail',
        builder: (context) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: MagicBreadcrumbs(
              separator: '›',
              maxItems: 3,
              itemsBeforeCollapse: 1,
              itemsAfterCollapse: 2,
              items: const <MagicBreadcrumbItem>[
                MagicBreadcrumbItem(id: 'home', label: 'Home', iconName: 'home'),
                MagicBreadcrumbItem(id: 'org', label: 'MonoMagic'),
                MagicBreadcrumbItem(id: 'libs', label: 'Libraries'),
                MagicBreadcrumbItem(id: 'ui', label: 'UI'),
                MagicBreadcrumbItem(
                  id: 'fl-mat',
                  label: 'Flutter M3',
                  current: true,
                ),
              ],
              onItemTap: (_) {},
            ),
          ),
        ),
      ),
    ],
  );
}

class _BreadcrumbsPlayground extends StatefulWidget {
  const _BreadcrumbsPlayground({
    required this.separator,
    required this.maxItems,
    required this.color,
    required this.size,
    required this.disabled,
  });

  final String separator;
  final int? maxItems;
  final ColorIntent color;
  final AtomicSize size;
  final bool disabled;

  @override
  State<_BreadcrumbsPlayground> createState() => _BreadcrumbsPlaygroundState();
}

class _BreadcrumbsPlaygroundState extends State<_BreadcrumbsPlayground> {
  static const List<MagicBreadcrumbItem> _fullTrail = <MagicBreadcrumbItem>[
    MagicBreadcrumbItem(id: 'root', label: 'Home', iconName: 'home'),
    MagicBreadcrumbItem(id: 'workspace', label: 'Workspace', iconName: 'folder'),
    MagicBreadcrumbItem(id: 'packages', label: 'Packages'),
    MagicBreadcrumbItem(id: 'molecules', label: 'Molecules'),
    MagicBreadcrumbItem(id: 'breadcrumbs', label: 'Breadcrumbs'),
  ];

  int _activeLength = _fullTrail.length;

  @override
  Widget build(BuildContext context) {
    final List<MagicBreadcrumbItem> visibleItems = <MagicBreadcrumbItem>[
      for (int i = 0; i < _activeLength; i++)
        _fullTrail[i].copyWith(current: i == _activeLength - 1),
    ];

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            MagicBreadcrumbs(
              items: visibleItems,
              separator: widget.separator,
              maxItems: widget.maxItems,
              color: widget.color,
              size: widget.size,
              disabled: widget.disabled,
              onItemTap: (item) {
                final idx = _fullTrail.indexWhere((e) => e.id == item.id);
                if (idx >= 0) {
                  setState(() => _activeLength = idx + 1);
                }
              },
            ),
            const SizedBox(height: 16),
            if (_activeLength < _fullTrail.length)
              MagicButton(
                label: 'Restore Full Path',
                variant: ButtonVariant.tonal,
                onPressed: () =>
                    setState(() => _activeLength = _fullTrail.length),
              ),
          ],
        ),
      ),
    );
  }
}
