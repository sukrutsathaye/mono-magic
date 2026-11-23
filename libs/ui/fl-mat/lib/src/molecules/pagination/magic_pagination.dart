/// Material 3 pagination molecule supporting page buttons, smart ellipsis
/// calculation via siblingCount/boundaryCount, first/last jump buttons, page-size
/// selector, total item range label, variants, shapes, and sizes.
library;

import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Material 3 pagination molecule supporting controlled/uncontrolled current
/// page, configurable `siblingCount` & `boundaryCount` ellipsis collapse,
/// optional first/last jump buttons, page-size dropdown selector, total item
/// range summary, `text`/`outlined`/`filled` variants, and
/// `rounded`/`circular` button geometry.
///
/// Mirrors `PaginationMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
class MagicPagination extends StatefulWidget {
  /// Creates a [MagicPagination].
  const MagicPagination({
    super.key,
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    this.page,
    this.defaultPage = 1,
    required this.totalItems,
    this.pageSize = 10,
    this.pageSizeOptions = const <int>[10, 25, 50, 100],
    this.siblingCount = 1,
    this.boundaryCount = 1,
    this.showFirstLast = false,
    this.showPageSizeSelector = false,
    this.showTotalCount = false,
    this.variant = MagicPaginationVariant.text,
    this.shape = MagicPaginationShape.rounded,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.onPageChange,
    this.onPageSizeChange,
  });

  /// Optional logical identifier for the pagination control.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>` on the root container.
  final String? testId;

  /// Optional accessible semantics label for the pagination navigation region.
  final String? ariaLabel;

  /// Whether all pagination controls are disabled.
  final bool disabled;

  /// Controlled 1-indexed current page number.
  final int? page;

  /// Initial 1-indexed page number for uncontrolled usage.
  final int defaultPage;

  /// Total number of items across all pages.
  final int totalItems;

  /// Number of items displayed per page (controlled when [onPageSizeChange]
  /// updates it externally, or initial page size for uncontrolled usage).
  final int pageSize;

  /// Available page-size options displayed when [showPageSizeSelector] is `true`.
  final List<int> pageSizeOptions;

  /// Number of always-visible page buttons on either side of the active page.
  final int siblingCount;

  /// Number of always-visible page buttons at the start and end of the range.
  final int boundaryCount;

  /// Whether to render first-page and last-page jump buttons.
  final bool showFirstLast;

  /// Whether to render a page-size selector dropdown.
  final bool showPageSizeSelector;

  /// Whether to display a summary range/total count label (e.g. `1–10 of 95`).
  final bool showTotalCount;

  /// Visual button variant (`text`, `outlined`, or `filled`).
  final MagicPaginationVariant variant;

  /// Corner geometry for page buttons (`rounded` or `circular`).
  final MagicPaginationShape shape;

  /// Semantic accent color intent for the active page button.
  final ColorIntent color;

  /// Standardized component density/size preset.
  final AtomicSize size;

  /// Callback invoked with the newly selected 1-indexed page number.
  final ValueChanged<int>? onPageChange;

  /// Callback invoked with the newly selected page size.
  final ValueChanged<int>? onPageSizeChange;

  @override
  State<MagicPagination> createState() => _MagicPaginationState();
}

sealed class _PaginationToken {}

class _PageToken extends _PaginationToken {
  _PageToken(this.page);
  final int page;
}

class _EllipsisToken extends _PaginationToken {
  _EllipsisToken(this.keyId);
  final String keyId;
}

class _MagicPaginationState extends State<MagicPagination> {
  late int _internalPage;
  late int _internalPageSize;

  @override
  void initState() {
    super.initState();
    _internalPageSize = math.max(1, widget.pageSize);
    _internalPage = widget.defaultPage;
  }

  @override
  void didUpdateWidget(covariant MagicPagination oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.pageSize != oldWidget.pageSize) {
      _internalPageSize = math.max(1, widget.pageSize);
    }
    if (widget.page == null && oldWidget.page != null) {
      _internalPage = oldWidget.page!;
    }
  }

  int get _effectivePageSize => math.max(1, _internalPageSize);

  int get _totalPages {
    if (widget.totalItems <= 0) {
      return 1;
    }
    return ((widget.totalItems - 1) ~/ _effectivePageSize) + 1;
  }

  int get _effectivePage {
    final int raw = widget.page ?? _internalPage;
    return raw.clamp(1, _totalPages);
  }

  void _goToPage(int targetPage) {
    if (widget.disabled) {
      return;
    }
    final int clamped = targetPage.clamp(1, _totalPages);
    if (clamped == _effectivePage) {
      return;
    }
    if (widget.page == null) {
      setState(() {
        _internalPage = clamped;
      });
    }
    widget.onPageChange?.call(clamped);
  }

  void _changePageSize(int nextSize) {
    if (widget.disabled || nextSize <= 0) {
      return;
    }
    setState(() {
      _internalPageSize = nextSize;
      if (widget.page == null) {
        _internalPage = 1;
      }
    });
    widget.onPageSizeChange?.call(nextSize);
    if (_effectivePage != 1) {
      widget.onPageChange?.call(1);
    }
  }

  List<_PaginationToken> _buildTokens(int currentPage, int totalPages) {
    final int boundary = math.max(0, widget.boundaryCount);
    final int sibling = math.max(0, widget.siblingCount);

    final List<int> startPages = <int>[
      for (int p = 1; p <= math.min(boundary, totalPages); p++) p,
    ];
    final List<int> endPages = <int>[
      for (int p = math.max(totalPages - boundary + 1, boundary + 1);
          p <= totalPages;
          p++)
        p,
    ];

    final int siblingsStart = math.max(
      math.min(
        currentPage - sibling,
        totalPages - boundary - sibling * 2 - 1,
      ),
      boundary + 2,
    );

    final int siblingsEnd = math.min(
      math.max(
        currentPage + sibling,
        boundary + sibling * 2 + 2,
      ),
      endPages.isNotEmpty ? endPages.first - 2 : totalPages - 1,
    );

    final List<_PaginationToken> tokens = <_PaginationToken>[
      for (final p in startPages) _PageToken(p),
    ];

    if (siblingsStart > boundary + 2) {
      tokens.add(_EllipsisToken('start-ellipsis'));
    } else if (boundary + 1 < totalPages - boundary) {
      tokens.add(_PageToken(boundary + 1));
    }

    for (int p = siblingsStart; p <= siblingsEnd; p++) {
      if (p >= 1 && p <= totalPages) {
        tokens.add(_PageToken(p));
      }
    }

    if (siblingsEnd < totalPages - boundary - 1) {
      tokens.add(_EllipsisToken('end-ellipsis'));
    } else if (totalPages - boundary > boundary) {
      tokens.add(_PageToken(totalPages - boundary));
    }

    for (final p in endPages) {
      tokens.add(_PageToken(p));
    }

    return tokens;
  }

  double _buttonDimensionFor(AtomicSize size) => switch (size) {
    AtomicSize.xs => 28,
    AtomicSize.sm => 32,
    AtomicSize.md => 36,
    AtomicSize.lg => 42,
    AtomicSize.xl => 48,
  };

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final intentColors = MagicTheme.resolveIntent(context, widget.color);
    final metrics = MagicTheme.metricsFor(widget.size);
    final double dim = _buttonDimensionFor(widget.size);

    final int totalPages = _totalPages;
    final int currentPage = _effectivePage;
    final List<_PaginationToken> tokens = _buildTokens(currentPage, totalPages);

    final BorderRadius borderRadius =
        widget.shape == MagicPaginationShape.circular
        ? BorderRadius.circular(dim / 2)
        : const BorderRadius.all(Radius.circular(8));

    final int startItem = widget.totalItems == 0
        ? 0
        : ((currentPage - 1) * _effectivePageSize) + 1;
    final int endItem = widget.totalItems == 0
        ? 0
        : math.min(currentPage * _effectivePageSize, widget.totalItems);

    final List<int> sizeOptions = <int>{
      ...widget.pageSizeOptions,
      _effectivePageSize,
    }.toList()
      ..sort();

    return Semantics(
      container: true,
      explicitChildNodes: true,
      enabled: !widget.disabled,
      label: widget.ariaLabel ?? 'Pagination',
      child: KeyedSubtree(
        key: widget.testId != null ? ValueKey<String>(widget.testId!) : null,
        child: Wrap(
          spacing: 6,
          runSpacing: 8,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: <Widget>[
            if (widget.showTotalCount)
              Padding(
                padding: const EdgeInsets.only(right: 6),
                child: Text(
                  '$startItem-$endItem of ${widget.totalItems}',
                  style: theme.textTheme.bodySmall?.copyWith(
                    fontSize: (metrics.fontSize - 1).clamp(11, 16).toDouble(),
                    color: widget.disabled
                        ? scheme.onSurface.withValues(alpha: 0.38)
                        : scheme.onSurfaceVariant,
                  ),
                ),
              ),
            if (widget.showPageSizeSelector)
              Container(
                height: dim,
                padding: const EdgeInsets.symmetric(horizontal: 8),
                decoration: BoxDecoration(
                  borderRadius: const BorderRadius.all(Radius.circular(8)),
                  border: Border.all(color: scheme.outlineVariant),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<int>(
                    key: widget.testId != null
                        ? ValueKey<String>('${widget.testId}-page-size')
                        : null,
                    value: _effectivePageSize,
                    isDense: true,
                    style: TextStyle(
                      fontSize: metrics.fontSize,
                      color: widget.disabled
                          ? scheme.onSurface.withValues(alpha: 0.38)
                          : scheme.onSurface,
                    ),
                    onChanged: widget.disabled
                        ? null
                        : (int? value) {
                            if (value != null) {
                              _changePageSize(value);
                            }
                          },
                    items: <DropdownMenuItem<int>>[
                      for (final opt in sizeOptions)
                        DropdownMenuItem<int>(
                          value: opt,
                          child: Text('$opt / page'),
                        ),
                    ],
                  ),
                ),
              ),
            if (widget.showFirstLast)
              _buildIconControl(
                keyId: 'first',
                icon: Icons.first_page,
                tooltip: 'First page',
                enabled: !widget.disabled && currentPage > 1,
                dim: dim,
                borderRadius: borderRadius,
                scheme: scheme,
                metrics: metrics,
                onTap: () => _goToPage(1),
              ),
            _buildIconControl(
              keyId: 'prev',
              icon: Icons.chevron_left,
              tooltip: 'Previous page',
              enabled: !widget.disabled && currentPage > 1,
              dim: dim,
              borderRadius: borderRadius,
              scheme: scheme,
              metrics: metrics,
              onTap: () => _goToPage(currentPage - 1),
            ),
            for (final token in tokens)
              if (token is _EllipsisToken)
                SizedBox(
                  key: widget.testId != null
                      ? ValueKey<String>('${widget.testId}-${token.keyId}')
                      : null,
                  width: dim,
                  height: dim,
                  child: Center(
                    child: Text(
                      '...',
                      style: TextStyle(
                        fontSize: metrics.fontSize,
                        color: scheme.onSurfaceVariant,
                      ),
                    ),
                  ),
                )
              else if (token is _PageToken)
                _buildPageButton(
                  pageNumber: token.page,
                  isActive: token.page == currentPage,
                  dim: dim,
                  borderRadius: borderRadius,
                  scheme: scheme,
                  intentColors: intentColors,
                  metrics: metrics,
                ),
            _buildIconControl(
              keyId: 'next',
              icon: Icons.chevron_right,
              tooltip: 'Next page',
              enabled: !widget.disabled && currentPage < totalPages,
              dim: dim,
              borderRadius: borderRadius,
              scheme: scheme,
              metrics: metrics,
              onTap: () => _goToPage(currentPage + 1),
            ),
            if (widget.showFirstLast)
              _buildIconControl(
                keyId: 'last',
                icon: Icons.last_page,
                tooltip: 'Last page',
                enabled: !widget.disabled && currentPage < totalPages,
                dim: dim,
                borderRadius: borderRadius,
                scheme: scheme,
                metrics: metrics,
                onTap: () => _goToPage(totalPages),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildIconControl({
    required String keyId,
    required IconData icon,
    required String tooltip,
    required bool enabled,
    required double dim,
    required BorderRadius borderRadius,
    required ColorScheme scheme,
    required MagicSizeMetrics metrics,
    required VoidCallback onTap,
  }) {
    final Color fgColor = enabled
        ? scheme.onSurface
        : scheme.onSurface.withValues(alpha: 0.38);

    return Semantics(
      button: true,
      enabled: enabled,
      label: tooltip,
      child: Material(
        color: widget.variant == MagicPaginationVariant.filled
            ? scheme.surfaceContainerLow
            : Colors.transparent,
        borderRadius: borderRadius,
        child: InkWell(
          key: widget.testId != null
              ? ValueKey<String>('${widget.testId}-$keyId')
              : null,
          borderRadius: borderRadius,
          onTap: enabled ? onTap : null,
          child: Container(
            width: dim,
            height: dim,
            decoration: widget.variant == MagicPaginationVariant.outlined
                ? BoxDecoration(
                    borderRadius: borderRadius,
                    border: Border.all(
                      color: enabled
                          ? scheme.outlineVariant
                          : scheme.outlineVariant.withValues(alpha: 0.4),
                    ),
                  )
                : null,
            alignment: Alignment.center,
            child: Icon(icon, size: metrics.iconSize + 2, color: fgColor),
          ),
        ),
      ),
    );
  }

  Widget _buildPageButton({
    required int pageNumber,
    required bool isActive,
    required double dim,
    required BorderRadius borderRadius,
    required ColorScheme scheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
  }) {
    final bool enabled = !widget.disabled;

    final Color bgColor;
    final Color fgColor;
    final Border? border;

    if (!enabled) {
      bgColor = isActive
          ? scheme.surfaceContainerHighest
          : Colors.transparent;
      fgColor = scheme.onSurface.withValues(alpha: 0.38);
      border = widget.variant == MagicPaginationVariant.outlined
          ? Border.all(color: scheme.outlineVariant.withValues(alpha: 0.4))
          : null;
    } else if (isActive) {
      bgColor = widget.variant == MagicPaginationVariant.outlined
          ? intentColors.container.withValues(alpha: 0.35)
          : intentColors.main;
      fgColor = widget.variant == MagicPaginationVariant.outlined
          ? intentColors.main
          : intentColors.onMain;
      border = widget.variant == MagicPaginationVariant.outlined
          ? Border.all(color: intentColors.main, width: 1.5)
          : null;
    } else {
      bgColor = widget.variant == MagicPaginationVariant.filled
          ? scheme.surfaceContainerLow
          : Colors.transparent;
      fgColor = scheme.onSurface;
      border = widget.variant == MagicPaginationVariant.outlined
          ? Border.all(color: scheme.outlineVariant)
          : null;
    }

    return Semantics(
      button: true,
      selected: isActive,
      enabled: enabled,
      label: 'Page $pageNumber',
      child: Material(
        color: bgColor,
        borderRadius: borderRadius,
        child: InkWell(
          key: widget.testId != null
              ? ValueKey<String>('${widget.testId}-page-$pageNumber')
              : null,
          borderRadius: borderRadius,
          onTap: enabled ? () => _goToPage(pageNumber) : null,
          child: Container(
            constraints: BoxConstraints(minWidth: dim, minHeight: dim),
            padding: const EdgeInsets.symmetric(horizontal: 6),
            decoration: BoxDecoration(
              borderRadius: borderRadius,
              border: border,
            ),
            alignment: Alignment.center,
            child: Text(
              '$pageNumber',
              style: TextStyle(
                fontSize: metrics.fontSize,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                color: fgColor,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
