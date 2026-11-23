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

  const List<MagicBreadcrumbItem> trail = <MagicBreadcrumbItem>[
    MagicBreadcrumbItem(id: 'home', label: 'Home', iconName: 'home'),
    MagicBreadcrumbItem(id: 'libs', label: 'Libraries'),
    MagicBreadcrumbItem(id: 'ui', label: 'UI', disabled: true),
    MagicBreadcrumbItem(id: 'fl', label: 'Flutter'),
    MagicBreadcrumbItem(id: 'crumb', label: 'Breadcrumbs', current: true),
  ];

  group('MagicBreadcrumbs', () {
    testWidgets('renders items, custom separator, icons, and handles item taps', (
      tester,
    ) async {
      MagicBreadcrumbItem? tapped;

      await tester.pumpWidget(
        wrap(
          MagicBreadcrumbs(
            testId: 'bc-trail',
            separator: '›',
            items: trail,
            onItemTap: (item) => tapped = item,
          ),
        ),
      );

      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Libraries'), findsOneWidget);
      expect(find.text('Breadcrumbs'), findsOneWidget);
      expect(find.text('›'), findsNWidgets(4));
      expect(find.byIcon(Icons.home), findsOneWidget);

      await tester.tap(find.byKey(const ValueKey<String>('bc-trail-item-libs')));
      await tester.pump();
      expect(tapped?.id, 'libs');

      // Disabled item and current item do not trigger onItemTap
      tapped = null;
      await tester.tap(find.byKey(const ValueKey<String>('bc-trail-item-ui')));
      await tester.tap(find.byKey(const ValueKey<String>('bc-trail-item-crumb')));
      await tester.pump();
      expect(tapped, isNull);
    });

    testWidgets('collapses middle items behind expandable ellipsis and respects disabled group', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();

      await tester.pumpWidget(
        wrap(
          MagicBreadcrumbs(
            testId: 'bc-collapse',
            ariaLabel: 'File Path',
            items: trail,
            maxItems: 3,
            itemsBeforeCollapse: 1,
            itemsAfterCollapse: 1,
            size: AtomicSize.sm,
            color: ColorIntent.secondary,
          ),
        ),
      );

      expect(find.text('Home'), findsOneWidget);
      expect(find.text('...'), findsOneWidget);
      expect(find.text('Breadcrumbs'), findsOneWidget);
      expect(find.text('Libraries'), findsNothing);
      expect(find.bySemanticsLabel('File Path'), findsOneWidget);

      // Expand hidden items
      await tester.tap(find.byKey(const ValueKey<String>('bc-collapse-expand')));
      await tester.pump();
      expect(find.text('Libraries'), findsOneWidget);
      expect(find.text('...'), findsNothing);

      // Disabled group blocks callbacks
      MagicBreadcrumbItem? tapped;
      await tester.pumpWidget(
        wrap(
          MagicBreadcrumbs(
            testId: 'bc-disabled',
            disabled: true,
            items: trail,
            maxItems: 3,
            onItemTap: (item) => tapped = item,
          ),
        ),
      );
      await tester.tap(find.byKey(const ValueKey<String>('bc-disabled-item-home')));
      await tester.tap(find.byKey(const ValueKey<String>('bc-disabled-expand')));
      await tester.pump();
      expect(tapped, isNull);
      expect(find.text('...'), findsOneWidget);
      handle.dispose();
    });
  });
}
