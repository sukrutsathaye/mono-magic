import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fl_mat/fl_mat.dart';

void main() {
  Widget wrapWithMaterial(Widget child) {
    return MaterialApp(
      theme: ThemeData(useMaterial3: true),
      home: Scaffold(body: Center(child: child)),
    );
  }

  group('MagicButton', () {
    testWidgets('renders label and invokes onPressed when tapped', (tester) async {
      var taps = 0;

      await tester.pumpWidget(
        wrapWithMaterial(
          MagicButton(
            label: 'Submit',
            testId: 'fl-btn',
            onPressed: () => taps++,
          ),
        ),
      );

      expect(find.text('Submit'), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey<String>('fl-btn')));
      expect(taps, 1);
    });

    testWidgets('disables tap when loading is true', (tester) async {
      var taps = 0;

      await tester.pumpWidget(
        wrapWithMaterial(
          MagicButton(
            label: 'Saving',
            loading: true,
            testId: 'fl-loading-btn',
            onPressed: () => taps++,
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey<String>('fl-loading-btn')));
      expect(taps, 0);
    });
  });

  group('MagicTextInput + MagicFormField', () {
    testWidgets('renders hint via MagicFormField and emits onChanged', (
      tester,
    ) async {
      String? captured;

      await tester.pumpWidget(
        wrapWithMaterial(
          MagicFormField(
            label: 'Email',
            hint: 'Work email preferred',
            child: MagicTextInput(
              type: TextInputTypeKind.email,
              placeholder: 'you@example.com',
              testId: 'fl-input',
              onChanged: (value) => captured = value,
            ),
          ),
        ),
      );

      expect(find.text('Work email preferred'), findsOneWidget);
      await tester.enterText(
        find.byKey(const ValueKey<String>('fl-input')),
        'ada@example.com',
      );
      expect(captured, 'ada@example.com');
    });

    testWidgets('prefers errorText over hint on MagicFormField', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrapWithMaterial(
          const MagicFormField(
            label: 'Username',
            hint: 'Choose a handle',
            errorText: 'Handle is required',
            child: MagicTextInput(testId: 'fl-err-input'),
          ),
        ),
      );

      expect(find.text('Handle is required'), findsOneWidget);
      expect(find.text('Choose a handle'), findsNothing);
    });
  });

  group('MagicSearchBar', () {
    testWidgets('composes MagicTextInput and MagicButton and submits query',
        (tester) async {
      String? changedQuery;
      String? submittedQuery;

      await tester.pumpWidget(
        wrapWithMaterial(
          SizedBox(
            width: 400,
            child: MagicSearchBar(
              testId: 'fl-search',
              label: 'Catalog',
              submitLabel: 'Go',
              onQueryChanged: (value) => changedQuery = value,
              onSubmitted: (value) => submittedQuery = value,
            ),
          ),
        ),
      );

      await tester.enterText(
        find.byKey(const ValueKey<String>('fl-search-input')),
        'atomic',
      );
      expect(changedQuery, 'atomic');

      await tester.tap(find.byKey(const ValueKey<String>('fl-search-submit')));
      expect(submittedQuery, 'atomic');
    });
  });
}
