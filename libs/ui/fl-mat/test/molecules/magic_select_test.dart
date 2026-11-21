import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget wrap(Widget child) {
    return MaterialApp(
      theme: MagicTheme.azureBlue,
      home: Scaffold(
        body: Center(
          child: SizedBox(width: 340, child: child),
        ),
      ),
    );
  }

  group('MagicSelect', () {
    testWidgets(
      'renders MagicFormField decoration, opens single-select menu, and emits onChanged/onOpenChange',
      (tester) async {
        String? selected;
        final openEvents = <bool>[];

        await tester.pumpWidget(
          wrap(
            StatefulBuilder(
              builder: (context, setState) {
                return MagicSelect<String>(
                  testId: 'framework-select',
                  label: 'Framework',
                  hint: 'Choose your UI framework',
                  requiredField: true,
                  value: selected,
                  placeholder: 'Pick a framework',
                  options: const [
                    SelectOption(value: 'flutter', label: 'Flutter'),
                    SelectOption(value: 'angular', label: 'Angular'),
                    SelectOption(
                      value: 'legacy',
                      label: 'Legacy',
                      disabled: true,
                    ),
                  ],
                  onChanged: (next) => setState(() => selected = next),
                  onOpenChange: openEvents.add,
                );
              },
            ),
          ),
        );

        expect(find.text('Framework *'), findsOneWidget);
        expect(find.text('Choose your UI framework'), findsOneWidget);
        expect(find.text('Pick a framework'), findsOneWidget);

        await tester.tap(
          find.byKey(const ValueKey<String>('framework-select')),
        );
        await tester.pumpAndSettle();
        expect(openEvents, [true]);
        expect(find.text('Flutter'), findsOneWidget);
        expect(find.text('Angular'), findsOneWidget);

        await tester.tap(find.text('Flutter'));
        await tester.pumpAndSettle();
        expect(selected, 'flutter');
        expect(openEvents, [true, false]);
        expect(find.text('Flutter'), findsOneWidget);
      },
    );

    testWidgets(
      'supports multi-select checkboxes, optionGroups with cascading disabled state, and customTriggerSummary',
      (tester) async {
        var selectedValues = <String>['ts'];

        await tester.pumpWidget(
          wrap(
            StatefulBuilder(
              builder: (context, setState) {
                return MagicSelect<String>(
                  testId: 'multi-select',
                  label: 'Languages',
                  multiple: true,
                  customTriggerSummary: true,
                  appearance: FormFieldAppearance.filled,
                  values: selectedValues,
                  optionGroups: const [
                    SelectOptionGroup(
                      label: 'Frontend',
                      options: [
                        SelectOption(value: 'ts', label: 'TypeScript'),
                        SelectOption(value: 'dart', label: 'Dart'),
                        SelectOption(value: 'css', label: 'CSS'),
                      ],
                    ),
                    SelectOptionGroup(
                      label: 'Deprecated',
                      disabled: true,
                      options: [
                        SelectOption(value: 'flash', label: 'ActionScript'),
                      ],
                    ),
                  ],
                  onMultiChanged: (next) =>
                      setState(() => selectedValues = next),
                );
              },
            ),
          ),
        );

        expect(find.text('TypeScript'), findsOneWidget);

        await tester.tap(find.byKey(const ValueKey<String>('multi-select')));
        await tester.pumpAndSettle();
        expect(find.text('Frontend'), findsOneWidget);
        expect(find.text('Deprecated'), findsOneWidget);

        // Select second item -> customTriggerSummary shows "TypeScript (+1 other)"
        await tester.tap(find.text('Dart'));
        await tester.pumpAndSettle();
        expect(selectedValues, ['ts', 'dart']);
        expect(find.text('TypeScript (+1 other)'), findsOneWidget);

        // Select third item -> customTriggerSummary shows "TypeScript (+2 others)"
        await tester.tap(find.text('CSS'));
        await tester.pumpAndSettle();
        expect(selectedValues, ['ts', 'dart', 'css']);
        expect(find.text('TypeScript (+2 others)'), findsOneWidget);

        // Disabled group option cannot be selected
        await tester.tap(find.text('ActionScript'));
        await tester.pumpAndSettle();
        expect(selectedValues, ['ts', 'dart', 'css']);
      },
    );

    testWidgets('respects errorText, disableRipple, and disabled state', (
      tester,
    ) async {
      var opened = false;

      await tester.pumpWidget(
        wrap(
          MagicSelect<String>(
            testId: 'disabled-select',
            label: 'Role',
            errorText: 'Selection is required',
            disabled: true,
            disableRipple: true,
            options: const [SelectOption(value: 'admin', label: 'Admin')],
            onOpenChange: (_) => opened = true,
          ),
        ),
      );

      expect(find.text('Selection is required'), findsOneWidget);

      await tester.tap(find.byKey(const ValueKey<String>('disabled-select')));
      await tester.pumpAndSettle();
      expect(opened, isFalse);
    });
  });
}
