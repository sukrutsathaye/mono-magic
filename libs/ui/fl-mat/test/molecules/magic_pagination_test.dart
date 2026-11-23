import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget wrap(Widget child) {
    return MaterialApp(
      theme: MagicTheme.azureBlue,
      home: Scaffold(
        body: SingleChildScrollView(child: child),
      ),
    );
  }

  group('MagicPagination', () {
    testWidgets('renders page buttons, ellipsis, total count, and navigates uncontrolled', (
      tester,
    ) async {
      int? latestPage;

      await tester.pumpWidget(
        wrap(
          MagicPagination(
            testId: 'pg-uncontrolled',
            totalItems: 120,
            pageSize: 10,
            defaultPage: 6,
            showFirstLast: true,
            showTotalCount: true,
            variant: MagicPaginationVariant.outlined,
            shape: MagicPaginationShape.circular,
            onPageChange: (p) => latestPage = p,
          ),
        ),
      );

      expect(find.text('51-60 of 120'), findsOneWidget);
      expect(find.text('...'), findsNWidgets(2));
      expect(find.text('1'), findsOneWidget);
      expect(find.text('12'), findsOneWidget);

      await tester.tap(find.byKey(const ValueKey<String>('pg-uncontrolled-next')));
      await tester.pump();
      expect(latestPage, 7);
      expect(find.text('61-70 of 120'), findsOneWidget);

      await tester.tap(find.byKey(const ValueKey<String>('pg-uncontrolled-prev')));
      await tester.pump();
      expect(latestPage, 6);

      await tester.tap(find.byKey(const ValueKey<String>('pg-uncontrolled-last')));
      await tester.pump();
      expect(latestPage, 12);

      await tester.tap(find.byKey(const ValueKey<String>('pg-uncontrolled-first')));
      await tester.pump();
      expect(latestPage, 1);

      await tester.tap(find.byKey(const ValueKey<String>('pg-uncontrolled-page-3')));
      await tester.pump();
      expect(latestPage, 3);
    });

    testWidgets('supports pageSize selector, filled variant, controlled page, and disabled state', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      int? changedSize;
      int? changedPage;

      await tester.pumpWidget(
        wrap(
          MagicPagination(
            testId: 'pg-ctrl',
            ariaLabel: 'Table Pagination',
            page: 2,
            totalItems: 100,
            pageSize: 10,
            showPageSizeSelector: true,
            showTotalCount: true,
            variant: MagicPaginationVariant.filled,
            color: ColorIntent.secondary,
            size: AtomicSize.sm,
            onPageChange: (p) => changedPage = p,
            onPageSizeChange: (s) => changedSize = s,
          ),
        ),
      );

      expect(find.bySemanticsLabel('Table Pagination'), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey<String>('pg-ctrl-page-size')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('25 / page').last);
      await tester.pumpAndSettle();
      expect(changedSize, 25);
      expect(changedPage, 1);

      // Disabled blocks taps
      changedPage = null;
      await tester.pumpWidget(
        wrap(
          MagicPagination(
            testId: 'pg-disabled',
            totalItems: 0,
            disabled: true,
            showFirstLast: true,
            showTotalCount: true,
            onPageChange: (p) => changedPage = p,
          ),
        ),
      );
      expect(find.text('0-0 of 0'), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey<String>('pg-disabled-next')));
      await tester.pump();
      expect(changedPage, isNull);
      handle.dispose();
    });
  });
}
