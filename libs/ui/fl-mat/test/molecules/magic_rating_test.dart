import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget wrap(Widget child) {
    return MaterialApp(
      theme: MagicTheme.azureBlue,
      home: Scaffold(
        body: Center(child: child),
      ),
    );
  }

  group('MagicRating', () {
    testWidgets('supports full-star uncontrolled taps, showValue, and reviewCount', (
      tester,
    ) async {
      double? latest;

      await tester.pumpWidget(
        wrap(
          MagicRating(
            testId: 'rt-full',
            label: 'Quality',
            defaultValue: 2,
            showValue: true,
            reviewCount: 42,
            onChanged: (v) => latest = v,
          ),
        ),
      );

      expect(find.text('Quality'), findsOneWidget);
      expect(find.text('2.0'), findsOneWidget);
      expect(find.text('(42)'), findsOneWidget);

      await tester.tap(find.byKey(const ValueKey<String>('rt-full-star-4')));
      await tester.pump();
      expect(latest, 4.0);
      expect(find.text('4.0'), findsOneWidget);
    });

    testWidgets('supports half-star precision taps on left and right halves', (
      tester,
    ) async {
      double? latest;

      await tester.pumpWidget(
        wrap(
          MagicRating(
            testId: 'rt-half',
            precision: MagicRatingPrecision.half,
            defaultValue: 1.5,
            showValue: true,
            size: AtomicSize.lg,
            onChanged: (v) => latest = v,
          ),
        ),
      );

      expect(find.byIcon(Icons.star_half), findsOneWidget);
      expect(find.text('1.5'), findsOneWidget);

      final star3Finder = find.byKey(const ValueKey<String>('rt-half-star-3'));
      final rect = tester.getRect(star3Finder);

      // Tap left half -> 2.5
      await tester.tapAt(Offset(rect.left + 4, rect.center.dy));
      await tester.pump();
      expect(latest, 2.5);

      // Tap right half -> 3.0
      await tester.tapAt(Offset(rect.right - 4, rect.center.dy));
      await tester.pump();
      expect(latest, 3.0);
    });

    testWidgets('blocks interaction in readOnly and disabled modes and exposes semantics', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      double? changed;

      await tester.pumpWidget(
        wrap(
          MagicRating(
            testId: 'rt-readonly',
            ariaLabel: 'Product Score',
            value: 3.5,
            precision: MagicRatingPrecision.half,
            readOnly: true,
            showValue: true,
            onChanged: (v) => changed = v,
          ),
        ),
      );

      await tester.tap(find.byKey(const ValueKey<String>('rt-readonly-star-5')));
      await tester.pump();
      expect(changed, isNull);
      expect(
        find.bySemanticsLabel('Product Score: 3.5 out of 5'),
        findsOneWidget,
      );

      await tester.pumpWidget(
        wrap(
          MagicRating(
            testId: 'rt-disabled',
            value: 2.0,
            disabled: true,
            icon: 'favorite',
            emptyIcon: 'favorite_border',
            color: ColorIntent.error,
            onChanged: (v) => changed = v,
          ),
        ),
      );
      await tester.tap(find.byKey(const ValueKey<String>('rt-disabled-star-4')));
      await tester.pump();
      expect(changed, isNull);
      handle.dispose();
    });
  });
}
