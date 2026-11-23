/// Widgetbook 3.25 use cases for [MagicPagination].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicPagination].
WidgetbookComponent buildMagicPaginationComponent() {
  return WidgetbookComponent(
    name: 'MagicPagination',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final variant =
              context.knobs.object.dropdown<MagicPaginationVariant>(
                label: 'Variant',
                options: MagicPaginationVariant.values,
                initialOption: MagicPaginationVariant.outlined,
                labelBuilder: (v) => v.name,
              );
          final shape = context.knobs.object.dropdown<MagicPaginationShape>(
            label: 'Shape',
            options: MagicPaginationShape.values,
            initialOption: MagicPaginationShape.rounded,
            labelBuilder: (v) => v.name,
          );
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);
          final totalItems = context.knobs.int.slider(
            label: 'Total Items',
            initialValue: 145,
            min: 10,
            max: 500,
          );
          final siblingCount = context.knobs.int.slider(
            label: 'Sibling Count',
            initialValue: 1,
            min: 0,
            max: 3,
          );
          final boundaryCount = context.knobs.int.slider(
            label: 'Boundary Count',
            initialValue: 1,
            min: 1,
            max: 3,
          );
          final showFirstLast = context.knobs.boolean(
            label: 'Show First/Last',
            initialValue: true,
          );
          final showPageSizeSelector = context.knobs.boolean(
            label: 'Show Page Size Selector',
            initialValue: true,
          );
          final showTotalCount = context.knobs.boolean(
            label: 'Show Total Count',
            initialValue: true,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return _PaginationPlayground(
            variant: variant,
            shape: shape,
            color: color,
            size: size,
            totalItems: totalItems,
            siblingCount: siblingCount,
            boundaryCount: boundaryCount,
            showFirstLast: showFirstLast,
            showPageSizeSelector: showPageSizeSelector,
            showTotalCount: showTotalCount,
            disabled: disabled,
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Circular Filled Compact',
        builder: (context) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: MagicPagination(
              totalItems: 120,
              pageSize: 10,
              defaultPage: 6,
              variant: MagicPaginationVariant.filled,
              shape: MagicPaginationShape.circular,
              color: ColorIntent.secondary,
              size: AtomicSize.sm,
              onPageChange: (_) {},
            ),
          ),
        ),
      ),
    ],
  );
}

class _PaginationPlayground extends StatefulWidget {
  const _PaginationPlayground({
    required this.variant,
    required this.shape,
    required this.color,
    required this.size,
    required this.totalItems,
    required this.siblingCount,
    required this.boundaryCount,
    required this.showFirstLast,
    required this.showPageSizeSelector,
    required this.showTotalCount,
    required this.disabled,
  });

  final MagicPaginationVariant variant;
  final MagicPaginationShape shape;
  final ColorIntent color;
  final AtomicSize size;
  final int totalItems;
  final int siblingCount;
  final int boundaryCount;
  final bool showFirstLast;
  final bool showPageSizeSelector;
  final bool showTotalCount;
  final bool disabled;

  @override
  State<_PaginationPlayground> createState() => _PaginationPlaygroundState();
}

class _PaginationPlaygroundState extends State<_PaginationPlayground> {
  int _page = 1;
  int _pageSize = 10;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            MagicPagination(
              page: _page,
              totalItems: widget.totalItems,
              pageSize: _pageSize,
              siblingCount: widget.siblingCount,
              boundaryCount: widget.boundaryCount,
              showFirstLast: widget.showFirstLast,
              showPageSizeSelector: widget.showPageSizeSelector,
              showTotalCount: widget.showTotalCount,
              variant: widget.variant,
              shape: widget.shape,
              color: widget.color,
              size: widget.size,
              disabled: widget.disabled,
              onPageChange: (next) => setState(() => _page = next),
              onPageSizeChange: (nextSize) => setState(() {
                _pageSize = nextSize;
                _page = 1;
              }),
            ),
            const SizedBox(height: 16),
            Text(
              'Active page: $_page | Page size: $_pageSize',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}
