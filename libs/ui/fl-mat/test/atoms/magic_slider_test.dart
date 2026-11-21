import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget wrap(Widget child, {ThemeData? theme}) {
    return MaterialApp(
      theme: theme ?? MagicTheme.azureBlue,
      home: Scaffold(
        body: Center(
          child: SizedBox(width: 300, child: child),
        ),
      ),
    );
  }

  group('MagicSlider', () {
    test('defaultMagicSliderDisplayWith formats compact k/M/B numbers', () {
      expect(defaultMagicSliderDisplayWith(42), '42');
      expect(defaultMagicSliderDisplayWith(12.5), '12.5');
      expect(defaultMagicSliderDisplayWith(1500), '1.5k');
      expect(defaultMagicSliderDisplayWith(2000), '2k');
      expect(defaultMagicSliderDisplayWith(3400000), '3.4M');
      expect(defaultMagicSliderDisplayWith(1000000000), '1B');
    });

    testWidgets(
      'renders single Slider with discrete divisions, tick marks, and emits onChanged',
      (tester) async {
        double current = 20;

        await tester.pumpWidget(
          wrap(
            StatefulBuilder(
              builder: (context, setState) {
                return MagicSlider(
                  min: 0,
                  max: 100,
                  step: 10,
                  value: current,
                  discrete: true,
                  showTickMarks: true,
                  color: ColorIntent.primary,
                  size: AtomicSize.lg,
                  testId: 'single-slider',
                  onChanged: (next) => setState(() => current = next),
                );
              },
            ),
          ),
        );

        expect(
          find.byKey(const ValueKey<String>('single-slider')),
          findsOneWidget,
        );
        final slider = tester.widget<Slider>(find.byType(Slider));
        expect(slider.value, 20);
        expect(slider.divisions, 10);
        expect(slider.label, '20');

        await tester.drag(find.byType(Slider), const Offset(80, 0));
        await tester.pump();
        expect(current, greaterThan(20));
      },
    );

    testWidgets(
      'renders RangeSlider when range is true and normalizes reversed or out-of-range bounds',
      (tester) async {
        RangeValues? changedRange;

        await tester.pumpWidget(
          wrap(
            MagicSlider(
              range: true,
              min: 0,
              max: 100,
              step: 5,
              startValue: 80,
              endValue: 30,
              discrete: true,
              showTickMarks: false,
              color: ColorIntent.tertiary,
              size: AtomicSize.sm,
              displayWith: (v) => '${v.round()}%',
              onRangeChanged: (next) => changedRange = next,
            ),
          ),
        );

        final rangeSlider = tester.widget<RangeSlider>(
          find.byType(RangeSlider),
        );
        expect(rangeSlider.values, const RangeValues(30, 80));
        expect(rangeSlider.labels, const RangeLabels('30%', '80%'));
        expect(changedRange, isNull);
      },
    );

    testWidgets('respects disabled and disableRipple', (tester) async {
      await tester.pumpWidget(
        wrap(
          const MagicSlider(
            value: 50,
            disabled: true,
            disableRipple: true,
            size: AtomicSize.xl,
          ),
        ),
      );

      final slider = tester.widget<Slider>(find.byType(Slider));
      expect(slider.onChanged, isNull);
    });
  });
}
