import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget wrap(Widget child) {
    return MaterialApp(
      theme: MagicTheme.azureBlue,
      home: Scaffold(
        body: Center(
          child: SizedBox(width: 480, child: child),
        ),
      ),
    );
  }

  group('MagicSearchBar', () {
    testWidgets(
      'composes MagicFormField, MagicTextInput, and MagicButton and submits via button or keyboard',
      (tester) async {
        final queries = <String>[];
        final submissions = <String>[];

        await tester.pumpWidget(
          wrap(
            MagicSearchBar(
              testId: 'catalog-search',
              label: 'Catalog',
              placeholder: 'Find widgets...',
              submitLabel: 'Find',
              appearance: FormFieldAppearance.filled,
              buttonVariant: ButtonVariant.tonal,
              buttonColor: ColorIntent.secondary,
              size: AtomicSize.sm,
              onQueryChanged: queries.add,
              onSubmitted: submissions.add,
            ),
          ),
        );

        expect(find.byType(MagicFormField), findsOneWidget);
        expect(find.byType(MagicTextInput), findsOneWidget);
        expect(find.byType(MagicButton), findsOneWidget);
        expect(find.text('Catalog'), findsOneWidget);
        expect(find.text('Find'), findsOneWidget);

        final inputFinder = find.byKey(
          const ValueKey<String>('catalog-search-input'),
        );
        await tester.enterText(inputFinder, 'slider');
        expect(queries, ['slider']);

        // Submit via button tap.
        await tester.tap(
          find.byKey(const ValueKey<String>('catalog-search-submit')),
        );
        expect(submissions, ['slider']);

        // Submit via keyboard action.
        await tester.testTextInput.receiveAction(TextInputAction.search);
        await tester.pump();
        expect(submissions, ['slider', 'slider']);
      },
    );

    testWidgets('supports controlled query updates and blocks submit when disabled or loading', (
      tester,
    ) async {
      var submits = 0;
      String query = 'initial';
      late StateSetter outerSetState;

      await tester.pumpWidget(
        wrap(
          StatefulBuilder(
            builder: (context, setState) {
              outerSetState = setState;
              return MagicSearchBar(
                testId: 'ctrl-search',
                query: query,
                onSubmitted: (_) => submits++,
              );
            },
          ),
        ),
      );

      expect(find.text('initial'), findsOneWidget);

      outerSetState(() {
        query = 'updated';
      });
      await tester.pump();
      expect(find.text('updated'), findsOneWidget);

      // Loading blocks submit.
      await tester.pumpWidget(
        wrap(
          MagicSearchBar(
            testId: 'loading-search',
            query: 'busy',
            loading: true,
            onSubmitted: (_) => submits++,
          ),
        ),
      );
      await tester.tap(
        find.byKey(const ValueKey<String>('loading-search-submit')),
      );
      expect(submits, 0);

      // Disabled blocks submit and disables input.
      await tester.pumpWidget(
        wrap(
          MagicSearchBar(
            testId: 'disabled-search',
            query: 'off',
            disabled: true,
            onSubmitted: (_) => submits++,
          ),
        ),
      );
      await tester.tap(
        find.byKey(const ValueKey<String>('disabled-search-submit')),
      );
      expect(submits, 0);
      expect(tester.widget<TextField>(find.byType(TextField)).enabled, isFalse);
    });
  });
}
