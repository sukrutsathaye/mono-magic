import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget wrap(Widget child) {
    return MaterialApp(
      theme: MagicTheme.azureBlue,
      home: Scaffold(body: child),
    );
  }

  final sampleTabs = <TabItem>[
    const TabItem(
      id: 'first',
      label: 'First',
      iconName: 'home',
      content: 'First Panel Content',
    ),
    const TabItem(
      id: 'second',
      label: 'Second',
      iconName: 'notifications',
      badgeContent: 3,
      content: 'Second Panel Content',
    ),
    const TabItem(
      id: 'disabled',
      label: 'Locked',
      disabled: true,
      content: 'Locked Panel Content',
    ),
  ];

  group('MagicTabs', () {
    testWidgets('switches tabs in uncontrolled mode, skips disabled tabs, and emits onTabChange', (
      tester,
    ) async {
      TabItem? changedTo;

      await tester.pumpWidget(
        wrap(
          MagicTabs(
            testId: 'tabs-uncontrolled',
            items: sampleTabs,
            defaultActiveTabId: 'first',
            onTabChange: (tab) => changedTo = tab,
          ),
        ),
      );

      expect(find.text('First Panel Content'), findsOneWidget);
      expect(find.text('3'), findsOneWidget);

      await tester.tap(find.text('Second'));
      await tester.pump();
      expect(changedTo?.id, 'second');

      // Tapping disabled tab does nothing
      changedTo = null;
      await tester.tap(find.text('Locked'));
      await tester.pump();
      expect(changedTo, isNull);
    });

    testWidgets('supports lazy panel mounting, controlled activeTabId, and custom panelBuilder', (
      tester,
    ) async {
      final builtPanels = <String>[];

      await tester.pumpWidget(
        wrap(
          MagicTabs(
            testId: 'lazy-tabs',
            items: sampleTabs,
            activeTabId: 'first',
            lazy: true,
            panelBuilder: (context, item, index) {
              builtPanels.add(item.id);
              return Text('Custom ${item.id}');
            },
          ),
        ),
      );

      expect(builtPanels, <String>['first']);
      expect(find.text('Custom second'), findsNothing);

      // Controlled update activates second panel lazily
      await tester.pumpWidget(
        wrap(
          MagicTabs(
            testId: 'lazy-tabs',
            items: sampleTabs,
            activeTabId: 'second',
            lazy: true,
            panelBuilder: (context, item, index) {
              builtPanels.add(item.id);
              return Text('Custom ${item.id}');
            },
          ),
        ),
      );

      expect(find.text('Custom second'), findsOneWidget);
      expect(builtPanels, contains('second'));
    });

    testWidgets('renders horizontal/vertical orientations, primary/secondary variants, scrollable, and bounded/unbounded height cleanly', (
      tester,
    ) async {
      // Bounded height horizontal scrollable
      await tester.pumpWidget(
        wrap(
          SizedBox(
            width: 320,
            height: 240,
            child: MagicTabs(
              items: sampleTabs,
              orientation: TabsOrientation.horizontal,
              variant: TabsVariant.secondary,
              scrollable: true,
              color: ColorIntent.tertiary,
              size: AtomicSize.sm,
            ),
          ),
        ),
      );
      expect(find.text('First Panel Content'), findsOneWidget);

      // Unbounded height vertical inside SingleChildScrollView
      await tester.pumpWidget(
        wrap(
          SingleChildScrollView(
            child: MagicTabs(
              items: sampleTabs,
              orientation: TabsOrientation.vertical,
              variant: TabsVariant.primary,
              scrollable: true,
              color: ColorIntent.secondary,
              size: AtomicSize.lg,
            ),
          ),
        ),
      );
      expect(find.text('First Panel Content'), findsOneWidget);

      // Empty items renders cleanly
      await tester.pumpWidget(
        wrap(
          const MagicTabs(
            testId: 'empty-tabs',
            items: <TabItem>[],
          ),
        ),
      );
      expect(find.byKey(const ValueKey<String>('empty-tabs')), findsOneWidget);
    });

    testWidgets('blocks selection when disabled=true and exposes semantics', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      var fired = false;

      await tester.pumpWidget(
        wrap(
          MagicTabs(
            ariaLabel: 'Account sections',
            disabled: true,
            items: sampleTabs,
            onTabChange: (_) => fired = true,
          ),
        ),
      );

      await tester.tap(find.text('Second'));
      await tester.pump();
      expect(fired, isFalse);
      expect(find.bySemanticsLabel('Account sections'), findsOneWidget);
      handle.dispose();
    });
  });
}
