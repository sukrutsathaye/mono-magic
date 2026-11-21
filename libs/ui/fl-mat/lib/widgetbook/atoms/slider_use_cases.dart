/// Widgetbook 3.25 use cases for [MagicSlider].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicSlider].
WidgetbookComponent buildSliderComponent() {
  return WidgetbookComponent(
    name: 'MagicSlider',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final min = context.knobs.double.slider(
            label: 'Min',
            initialValue: 0,
            min: 0,
            max: 50,
          );
          final max = context.knobs.double.slider(
            label: 'Max',
            initialValue: 100,
            min: 50,
            max: 200,
          );
          final value = context.knobs.double.slider(
            label: 'Value',
            initialValue: 40,
            min: 0,
            max: 200,
          );
          final range = context.knobs.boolean(
            label: 'Range',
            initialValue: false,
          );
          final discrete = context.knobs.boolean(
            label: 'Discrete',
            initialValue: true,
          );
          final showTickMarks = context.knobs.boolean(
            label: 'Show Tick Marks',
            initialValue: false,
          );
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          var currentVal = value;
          var currentRange = RangeValues(min + 20, max - 20);

          return Center(
            child: SizedBox(
              width: 360,
              child: StatefulBuilder(
                builder: (context, setState) {
                  return MagicSlider(
                    min: min,
                    max: max,
                    step: 10,
                    value: currentVal,
                    range: range,
                    startValue: currentRange.start,
                    endValue: currentRange.end,
                    discrete: discrete,
                    showTickMarks: showTickMarks,
                    color: color,
                    size: size,
                    disabled: disabled,
                    onChanged: (next) => setState(() => currentVal = next),
                    onRangeChanged: (next) =>
                        setState(() => currentRange = next),
                  );
                },
              ),
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Range Slider & Tick Marks',
        builder: (context) {
          final color = colorIntentKnob(
            context,
            initialValue: ColorIntent.secondary,
          );
          final size = atomicSizeKnob(context);
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          var budget = const RangeValues(2500, 7500);
          var stepValue = 50.0;

          return Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: SizedBox(
                width: 380,
                child: StatefulBuilder(
                  builder: (context, setState) {
                    return Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          'Range Budget: ${defaultMagicSliderDisplayWith(budget.start)} – ${defaultMagicSliderDisplayWith(budget.end)}',
                        ),
                        MagicSlider(
                          min: 0,
                          max: 10000,
                          step: 500,
                          range: true,
                          startValue: budget.start,
                          endValue: budget.end,
                          discrete: true,
                          showTickMarks: true,
                          color: color,
                          size: size,
                          disabled: disabled,
                          onRangeChanged: (next) =>
                              setState(() => budget = next),
                        ),
                        const SizedBox(height: 24),
                        Text('Discrete with Tick Marks: ${stepValue.round()}%'),
                        MagicSlider(
                          min: 0,
                          max: 100,
                          step: 25,
                          value: stepValue,
                          discrete: true,
                          showTickMarks: true,
                          color: ColorIntent.tertiary,
                          size: size,
                          disabled: disabled,
                          onChanged: (next) =>
                              setState(() => stepValue = next),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ),
          );
        },
      ),
    ],
  );
}
