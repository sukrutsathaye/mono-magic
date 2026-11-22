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

  final samplePanels = <AccordionItem>[
    const AccordionItem(
      id: 'one',
      title: 'Panel One',
      summary: 'First summary',
      iconName: 'palette',
      content: 'Panel One Body',
      expanded: true,
    ),
    const AccordionItem(
      id: 'two',
      title: 'Panel Two',
      summary: 'Second summary',
      iconName: 'layers',
      content: 'Panel Two Body',
    ),
    const AccordionItem(
      id: 'three',
      title: 'Panel Three',
      iconName: 'lock',
      disabled: true,
      content: 'Panel Three Body',
    ),
  ];

  group('MagicAccordion', () {
    testWidgets('handles single-expand mode, initial expanded item, and disabled items', (
      tester,
    ) async {
      List<String>? latestExpanded;

      await tester.pumpWidget(
        wrap(
          MagicAccordion(
            testId: 'single-acc',
            items: samplePanels,
            multiple: false,
            onExpandedChange: (ids) => latestExpanded = ids,
          ),
        ),
      );

      expect(find.text('Panel One'), findsOneWidget);
      expect(find.text('First summary'), findsOneWidget);

      await tester.tap(find.text('Panel Two'));
      await tester.pumpAndSettle();
      expect(latestExpanded, <String>['two']);

      // Disabled item ignores tap
      latestExpanded = null;
      await tester.tap(find.text('Panel Three'));
      await tester.pumpAndSettle();
      expect(latestExpanded, isNull);
    });

    testWidgets('supports multi-expand mode, raised appearance, sizes, and controlled expandedIds', (
      tester,
    ) async {
      List<String>? latestExpanded;

      await tester.pumpWidget(
        wrap(
          MagicAccordion(
            testId: 'multi-acc',
            items: samplePanels,
            multiple: true,
            appearance: AccordionAppearance.raised,
            size: AtomicSize.lg,
            defaultExpandedIds: const <String>['one'],
            onExpandedChange: (ids) => latestExpanded = ids,
          ),
        ),
      );

      await tester.tap(find.text('Panel Two'));
      await tester.pumpAndSettle();
      expect(latestExpanded, <String>['one', 'two']);

      // Collapse panel one while panel two stays expanded
      await tester.tap(find.text('Panel One'));
      await tester.pumpAndSettle();
      expect(latestExpanded, <String>['two']);

      // Controlled mode with custom contentBuilder
      await tester.pumpWidget(
        wrap(
          MagicAccordion(
            items: samplePanels,
            expandedIds: const <String>['two'],
            contentBuilder: (context, item, index) =>
                Text('Built-${item.id}-$index'),
          ),
        ),
      );
      expect(find.text('Built-two-1'), findsOneWidget);
    });

    testWidgets('blocks all toggles when disabled=true and exposes semantics', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      var fired = false;

      await tester.pumpWidget(
        wrap(
          MagicAccordion(
            ariaLabel: 'FAQ Sections',
            disabled: true,
            items: samplePanels,
            onExpandedChange: (_) => fired = true,
          ),
        ),
      );

      await tester.tap(find.text('Panel Two'));
      await tester.pump();
      expect(fired, isFalse);
      expect(find.bySemanticsLabel('FAQ Sections'), findsOneWidget);
      handle.dispose();
    });
  });
}
