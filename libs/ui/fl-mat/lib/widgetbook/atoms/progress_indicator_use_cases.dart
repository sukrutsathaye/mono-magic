/// Widgetbook 3.25 use cases for [MagicProgressIndicator].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicProgressIndicator].
WidgetbookComponent buildProgressIndicatorComponent() {
  return WidgetbookComponent(
    name: 'MagicProgressIndicator',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final type = context.knobs.object.dropdown<ProgressIndicatorType>(
            label: 'Type',
            options: ProgressIndicatorType.values,
            initialOption: ProgressIndicatorType.bar,
            labelBuilder: (value) => value.name,
          );
          final mode = context.knobs.object.dropdown<ProgressIndicatorMode>(
            label: 'Mode',
            options: ProgressIndicatorMode.values,
            initialOption: ProgressIndicatorMode.determinate,
            labelBuilder: (value) => value.name,
          );
          final value = context.knobs.double.slider(
            label: 'Value',
            initialValue: 64,
            min: 0,
            max: 100,
          );
          final bufferValue = context.knobs.double.slider(
            label: 'Buffer Value',
            initialValue: 84,
            min: 0,
            max: 100,
          );
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          final indicator = MagicProgressIndicator(
            type: type,
            mode: mode,
            value: value,
            bufferValue: bufferValue,
            color: disabled ? ColorIntent.neutral : color,
            size: size,
            ariaLabel: 'Task progress',
          );

          return Center(
            child: Opacity(
              opacity: disabled ? 0.38 : 1.0,
              child: SizedBox(
                width: type == ProgressIndicatorType.bar ? 340 : null,
                child: indicator,
              ),
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Bar Modes & Spinner Sizes Gallery',
        builder: (context) {
          final size = atomicSizeKnob(context);
          final color = colorIntentKnob(context);
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: Opacity(
              opacity: disabled ? 0.38 : 1.0,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: SizedBox(
                  width: 380,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      const Text('Determinate (65%)'),
                      const SizedBox(height: 6),
                      MagicProgressIndicator(
                        type: ProgressIndicatorType.bar,
                        mode: ProgressIndicatorMode.determinate,
                        value: 65,
                        color: disabled ? ColorIntent.neutral : color,
                        size: size,
                      ),
                      const SizedBox(height: 16),
                      const Text('Indeterminate'),
                      const SizedBox(height: 6),
                      MagicProgressIndicator(
                        type: ProgressIndicatorType.bar,
                        mode: ProgressIndicatorMode.indeterminate,
                        color: disabled
                            ? ColorIntent.neutral
                            : ColorIntent.secondary,
                        size: size,
                      ),
                      const SizedBox(height: 16),
                      const Text('Buffer (45% / 78%)'),
                      const SizedBox(height: 6),
                      MagicProgressIndicator(
                        type: ProgressIndicatorType.bar,
                        mode: ProgressIndicatorMode.buffer,
                        value: 45,
                        bufferValue: 78,
                        color: disabled
                            ? ColorIntent.neutral
                            : ColorIntent.tertiary,
                        size: size,
                      ),
                      const SizedBox(height: 16),
                      const Text('Query'),
                      const SizedBox(height: 6),
                      MagicProgressIndicator(
                        type: ProgressIndicatorType.bar,
                        mode: ProgressIndicatorMode.query,
                        color: disabled
                            ? ColorIntent.neutral
                            : ColorIntent.success,
                        size: size,
                      ),
                      const SizedBox(height: 24),
                      Wrap(
                        spacing: 20,
                        runSpacing: 16,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: <Widget>[
                          for (final sz in AtomicSize.values)
                            Column(
                              mainAxisSize: MainAxisSize.min,
                              children: <Widget>[
                                MagicProgressIndicator(
                                  type: ProgressIndicatorType.spinner,
                                  mode: ProgressIndicatorMode.determinate,
                                  value: 72,
                                  color: disabled ? ColorIntent.neutral : color,
                                  size: sz,
                                ),
                                const SizedBox(height: 8),
                                Text(sz.name),
                              ],
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    ],
  );
}
