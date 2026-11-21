import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget wrap(Widget child, {ThemeData? theme}) {
    return MaterialApp(
      theme: theme ?? MagicTheme.azureBlue,
      home: Scaffold(
        body: Center(
          child: SizedBox(width: 240, child: child),
        ),
      ),
    );
  }

  group('MagicProgressIndicator', () {
    testWidgets('renders bar determinate and indeterminate with 0..100 scale', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              MagicProgressIndicator(
                type: ProgressIndicatorType.bar,
                mode: ProgressIndicatorMode.determinate,
                value: 65,
                testId: 'bar-det',
                ariaLabel: 'Upload progress',
              ),
              SizedBox(height: 16),
              MagicProgressIndicator(
                type: ProgressIndicatorType.bar,
                mode: ProgressIndicatorMode.indeterminate,
                testId: 'bar-indet',
              ),
            ],
          ),
        ),
      );

      final det = tester.widget<LinearProgressIndicator>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('bar-det')),
          matching: find.byType(LinearProgressIndicator),
        ),
      );
      expect(det.value, closeTo(0.65, 0.001));
      expect(det.minHeight, 4);

      final indet = tester.widget<LinearProgressIndicator>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('bar-indet')),
          matching: find.byType(LinearProgressIndicator),
        ),
      );
      expect(indet.value, isNull);
    });

    testWidgets('renders bar buffer and query modes', (tester) async {
      await tester.pumpWidget(
        wrap(
          const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              MagicProgressIndicator(
                type: ProgressIndicatorType.bar,
                mode: ProgressIndicatorMode.buffer,
                value: 30,
                bufferValue: 75,
                testId: 'bar-buffer',
              ),
              SizedBox(height: 16),
              MagicProgressIndicator(
                type: ProgressIndicatorType.bar,
                mode: ProgressIndicatorMode.query,
                testId: 'bar-query',
              ),
            ],
          ),
        ),
      );

      final bufferBars = tester.widgetList<LinearProgressIndicator>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('bar-buffer')),
          matching: find.byType(LinearProgressIndicator),
        ),
      ).toList();
      expect(bufferBars, hasLength(2));
      expect(bufferBars[0].value, closeTo(0.75, 0.001));
      expect(bufferBars[1].value, closeTo(0.30, 0.001));

      expect(
        find.descendant(
          of: find.byKey(const ValueKey<String>('bar-query')),
          matching: find.byType(Transform),
        ),
        findsOneWidget,
      );
    });

    testWidgets('renders spinner determinate, indeterminate, and clamps buffer/query', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const Wrap(
            spacing: 12,
            children: [
              MagicProgressIndicator(
                type: ProgressIndicatorType.spinner,
                mode: ProgressIndicatorMode.determinate,
                value: 80,
                diameter: 48,
                strokeWidth: 5,
                testId: 'spin-det',
              ),
              MagicProgressIndicator(
                type: ProgressIndicatorType.spinner,
                mode: ProgressIndicatorMode.buffer,
                value: 50,
                testId: 'spin-buffer-clamped',
              ),
            ],
          ),
        ),
      );

      final spinDet = tester.widget<CircularProgressIndicator>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('spin-det')),
          matching: find.byType(CircularProgressIndicator),
        ),
      );
      expect(spinDet.value, closeTo(0.8, 0.001));
      expect(spinDet.strokeWidth, 5);
      expect(
        tester.getSize(find.byKey(const ValueKey<String>('spin-det'))),
        const Size(48, 48),
      );

      final clamped = tester.widget<CircularProgressIndicator>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('spin-buffer-clamped')),
          matching: find.byType(CircularProgressIndicator),
        ),
      );
      expect(clamped.value, isNull);
    });

    testWidgets('scales default bar heights and spinner sizes across AtomicSize', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              MagicProgressIndicator(
                type: ProgressIndicatorType.bar,
                mode: ProgressIndicatorMode.determinate,
                value: 50,
                size: AtomicSize.xs,
                testId: 'bar-xs',
              ),
              MagicProgressIndicator(
                type: ProgressIndicatorType.bar,
                mode: ProgressIndicatorMode.determinate,
                value: 50,
                size: AtomicSize.xl,
                testId: 'bar-xl',
              ),
              MagicProgressIndicator(
                type: ProgressIndicatorType.spinner,
                size: AtomicSize.xs,
                testId: 'spin-xs',
              ),
              MagicProgressIndicator(
                type: ProgressIndicatorType.spinner,
                size: AtomicSize.xl,
                testId: 'spin-xl',
              ),
            ],
          ),
        ),
      );

      final barXs = tester.widget<LinearProgressIndicator>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('bar-xs')),
          matching: find.byType(LinearProgressIndicator),
        ),
      );
      final barXl = tester.widget<LinearProgressIndicator>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('bar-xl')),
          matching: find.byType(LinearProgressIndicator),
        ),
      );
      expect(barXs.minHeight, 2);
      expect(barXl.minHeight, 8);

      expect(
        tester.getSize(find.byKey(const ValueKey<String>('spin-xs'))),
        const Size(20, 20),
      );
      expect(
        tester.getSize(find.byKey(const ValueKey<String>('spin-xl'))),
        const Size(72, 72),
      );
    });

    testWidgets('resolves all 7 ColorIntent tokens from MagicTheme', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final intent in ColorIntent.values)
                MagicProgressIndicator(
                  type: ProgressIndicatorType.bar,
                  mode: ProgressIndicatorMode.determinate,
                  value: 40,
                  color: intent,
                  testId: 'intent-${intent.name}',
                ),
            ],
          ),
          theme: MagicTheme.darkTheme,
        ),
      );

      final successBar = tester.widget<LinearProgressIndicator>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('intent-success')),
          matching: find.byType(LinearProgressIndicator),
        ),
      );
      expect(successBar.color, MagicSemanticColors.dark.success);
      expect(
        successBar.backgroundColor,
        MagicSemanticColors.dark.successContainer,
      );
    });
  });
}
