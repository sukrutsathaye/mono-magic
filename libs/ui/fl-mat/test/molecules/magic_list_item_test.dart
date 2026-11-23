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

  group('MagicListItem', () {
    testWidgets('renders overline, primary, secondary, leading icon, trailing text/badge/icon', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const MagicListItem(
            testId: 'li-full',
            overlineText: 'CATEGORY',
            primaryText: 'Primary Headline',
            secondaryText: 'Supporting copy',
            leadingIcon: 'palette',
            trailingText: 'New',
            trailingBadge: 7,
            trailingIcon: 'chevron_right',
            divider: true,
          ),
        ),
      );

      expect(find.byKey(const ValueKey<String>('li-full')), findsOneWidget);
      expect(find.text('CATEGORY'), findsOneWidget);
      expect(find.text('Primary Headline'), findsOneWidget);
      expect(find.text('Supporting copy'), findsOneWidget);
      expect(find.text('New'), findsOneWidget);
      expect(find.text('7'), findsOneWidget);
      expect(find.byIcon(Icons.palette), findsOneWidget);
      expect(find.byIcon(Icons.chevron_right), findsOneWidget);
      expect(find.byType(Divider), findsOneWidget);
    });

    testWidgets('supports leading avatar, uncontrolled selectable toggle, and appearances', (
      tester,
    ) async {
      bool? latestSelected;
      var tapped = 0;

      await tester.pumpWidget(
        wrap(
          Column(
            children: <Widget>[
              MagicListItem(
                testId: 'li-select',
                primaryText: 'Ada Lovelace',
                leadingAvatarText: 'AL',
                selectable: true,
                defaultSelected: false,
                appearance: MagicListItemAppearance.outlined,
                color: ColorIntent.secondary,
                size: AtomicSize.sm,
                dense: true,
                onSelectedChange: (v) => latestSelected = v,
                onTap: () => tapped++,
              ),
              const MagicListItem(
                testId: 'li-filled',
                primaryText: 'Filled Row',
                appearance: MagicListItemAppearance.filled,
                selected: true,
              ),
            ],
          ),
        ),
      );

      expect(find.text('AL'), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey<String>('li-select')));
      await tester.pump();
      expect(latestSelected, isTrue);
      expect(tapped, 1);

      await tester.tap(find.byKey(const ValueKey<String>('li-select')));
      await tester.pump();
      expect(latestSelected, isFalse);
      expect(tapped, 2);
    });

    testWidgets('respects controlled selected, disabled state, and semantics', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      bool? selectedChange;
      var tapped = false;

      await tester.pumpWidget(
        wrap(
          MagicListItem(
            testId: 'li-disabled',
            ariaLabel: 'Locked Setting Row',
            primaryText: 'Locked Setting',
            leadingIcon: 'lock',
            trailingIcon: 'visibility',
            selectable: true,
            selected: true,
            disabled: true,
            onSelectedChange: (v) => selectedChange = v,
            onTap: () => tapped = true,
          ),
        ),
      );

      await tester.tap(find.byKey(const ValueKey<String>('li-disabled')));
      await tester.pump();
      expect(selectedChange, isNull);
      expect(tapped, isFalse);
      expect(find.bySemanticsLabel('Locked Setting Row'), findsOneWidget);
      handle.dispose();
    });
  });
}
