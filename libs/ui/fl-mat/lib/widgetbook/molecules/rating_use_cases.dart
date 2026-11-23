/// Widgetbook 3.25 use cases for [MagicRating].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicRating].
WidgetbookComponent buildMagicRatingComponent() {
  return WidgetbookComponent(
    name: 'MagicRating',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Star Rating Playground',
        builder: (context) {
          final precision =
              context.knobs.object.dropdown<MagicRatingPrecision>(
                label: 'Precision',
                options: MagicRatingPrecision.values,
                initialOption: MagicRatingPrecision.half,
                labelBuilder: (v) => '${v.value}',
              );
          final max = context.knobs.int.slider(
            label: 'Max Stars',
            initialValue: 5,
            min: 3,
            max: 10,
          );
          final color = colorIntentKnob(
            context,
            initialValue: ColorIntent.warning,
          );
          final size = atomicSizeKnob(context);
          final showValue = context.knobs.boolean(
            label: 'Show Value',
            initialValue: true,
          );
          final readOnly = context.knobs.boolean(
            label: 'Read Only',
            initialValue: false,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return _RatingPlayground(
            precision: precision,
            max: max,
            color: color,
            size: size,
            showValue: showValue,
            readOnly: readOnly,
            disabled: disabled,
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Read-Only & Custom Icons',
        builder: (context) => const Center(
          child: Padding(
            padding: EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                MagicRating(
                  label: 'Verified Score',
                  value: 4.5,
                  precision: MagicRatingPrecision.half,
                  readOnly: true,
                  showValue: true,
                  reviewCount: 256,
                ),
                SizedBox(height: 16),
                MagicRating(
                  label: 'Favorites',
                  defaultValue: 3,
                  icon: 'favorite',
                  emptyIcon: 'favorite_border',
                  color: ColorIntent.error,
                  showValue: true,
                ),
              ],
            ),
          ),
        ),
      ),
    ],
  );
}

class _RatingPlayground extends StatefulWidget {
  const _RatingPlayground({
    required this.precision,
    required this.max,
    required this.color,
    required this.size,
    required this.showValue,
    required this.readOnly,
    required this.disabled,
  });

  final MagicRatingPrecision precision;
  final int max;
  final ColorIntent color;
  final AtomicSize size;
  final bool showValue;
  final bool readOnly;
  final bool disabled;

  @override
  State<_RatingPlayground> createState() => _RatingPlaygroundState();
}

class _RatingPlaygroundState extends State<_RatingPlayground> {
  double _rating = 3.5;
  int _reviews = 128;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            MagicRating(
              label: 'Rate Package',
              value: _rating.clamp(0, widget.max.toDouble()),
              max: widget.max,
              precision: widget.precision,
              color: widget.color,
              size: widget.size,
              showValue: widget.showValue,
              reviewCount: _reviews,
              readOnly: widget.readOnly,
              disabled: widget.disabled,
              onChanged: (next) {
                setState(() {
                  _rating = next;
                  _reviews++;
                });
              },
            ),
            const SizedBox(height: 12),
            Text(
              'Current score: ${_rating.toStringAsFixed(1)} / ${widget.max} ($_reviews reviews)',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}
