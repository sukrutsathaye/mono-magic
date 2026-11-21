import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget wrap(Widget child, {ThemeData? theme}) {
    return MaterialApp(
      theme: theme ?? MagicTheme.azureBlue,
      home: Scaffold(body: Center(child: child)),
    );
  }

  group('MagicCheckBox', () {
    testWidgets(
      'renders single Checkbox with label and toggles via Checkbox or label tap',
      (tester) async {
        var checked = false;

        await tester.pumpWidget(
          wrap(
            StatefulBuilder(
              builder: (context, setState) {
                return MagicCheckBox(
                  label: 'Accept terms',
                  checked: checked,
                  testId: 'check-box',
                  onChanged: (next) => setState(() => checked = next),
                );
              },
            ),
          ),
        );

        expect(
          find.byKey(const ValueKey<String>('check-box')),
          findsOneWidget,
        );
        expect(find.text('Accept terms'), findsOneWidget);

        await tester.tap(find.byType(Checkbox));
        await tester.pump();
        expect(checked, isTrue);

        await tester.tap(find.text('Accept terms'));
        await tester.pump();
        expect(checked, isFalse);
      },
    );

    testWidgets(
      'supports indeterminate, requiredField, labelPosition before/after, and custom child',
      (tester) async {
        await tester.pumpWidget(
          wrap(
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                MagicCheckBox(
                  label: 'Indeterminate',
                  indeterminate: true,
                  requiredField: true,
                  labelPosition: CheckBoxLabelPosition.before,
                  testId: 'indeterminate-cb',
                  onChanged: (_) {},
                ),
                MagicCheckBox(
                  checked: true,
                  onChanged: (_) {},
                  child: const Text('CustomChildLabel'),
                ),
              ],
            ),
          ),
        );

        expect(find.text('Indeterminate *'), findsOneWidget);
        expect(find.text('CustomChildLabel'), findsOneWidget);

        final indeterminateCb = tester.widget<Checkbox>(
          find.descendant(
            of: find.byKey(const ValueKey<String>('indeterminate-cb')),
            matching: find.byType(Checkbox),
          ),
        );
        expect(indeterminateCb.tristate, isTrue);
        expect(indeterminateCb.value, isNull);

        final beforeLabelDx = tester.getTopLeft(find.text('Indeterminate *')).dx;
        final firstCbDx = tester.getTopLeft(find.byType(Checkbox).at(0)).dx;
        expect(beforeLabelDx, lessThan(firstCbDx));

        final afterLabelDx =
            tester.getTopLeft(find.text('CustomChildLabel')).dx;
        final secondCbDx = tester.getTopLeft(find.byType(Checkbox).at(1)).dx;
        expect(afterLabelDx, greaterThan(secondCbDx));
      },
    );

    testWidgets(
      'supports recursive subtask tree with tri-state calculation and immutable updates',
      (tester) async {
        var tasks = const <CheckBoxTask>[
          CheckBoxTask(
            id: 'root',
            name: 'All Tasks',
            subtasks: <CheckBoxTask>[
              CheckBoxTask(id: 'sub-1', name: 'Subtask 1', checked: true),
              CheckBoxTask(id: 'sub-2', name: 'Subtask 2', checked: false),
              CheckBoxTask(
                id: 'sub-disabled',
                name: 'Disabled Subtask',
                checked: false,
                disabled: true,
              ),
            ],
          ),
        ];

        await tester.pumpWidget(
          wrap(
            StatefulBuilder(
              builder: (context, setState) {
                return MagicCheckBox(
                  tasks: tasks,
                  testId: 'task-tree',
                  onTasksChanged: (next) => setState(() => tasks = next),
                );
              },
            ),
          ),
        );

        expect(find.text('All Tasks'), findsOneWidget);
        expect(find.text('Subtask 1'), findsOneWidget);
        expect(find.text('Subtask 2'), findsOneWidget);
        expect(find.text('Disabled Subtask'), findsOneWidget);

        // Parent is initially indeterminate (null) because 1 true, 2 false.
        final parentCbBefore = tester.widget<Checkbox>(
          find.byType(Checkbox).at(0),
        );
        expect(parentCbBefore.tristate, isTrue);
        expect(parentCbBefore.value, isNull);

        // Tapping Subtask 2 checks it.
        await tester.tap(find.text('Subtask 2'));
        await tester.pump();
        expect(tasks[0].subtasks[1].checked, isTrue);
        expect(tasks[0].subtasks[2].checked, isFalse);

        // Tapping parent ("All Tasks") toggles all non-disabled subtasks to true
        // (since parent was indeterminate != true, nextChecked = true, then
        // tapping again when subtasks 1 & 2 are checked).
        await tester.tap(find.text('All Tasks'));
        await tester.pump();
        expect(tasks[0].subtasks[0].checked, isTrue);
        expect(tasks[0].subtasks[1].checked, isTrue);
        // Disabled subtask remains untouched.
        expect(tasks[0].subtasks[2].checked, isFalse);

        // Tapping Subtask 1 unchecks it.
        await tester.tap(find.text('Subtask 1'));
        await tester.pump();
        expect(tasks[0].subtasks[0].checked, isFalse);
      },
    );

    testWidgets(
      'respects disabled, disabledInteractive, disableRipple, sizes, and ColorIntent',
      (tester) async {
        var changed = false;

        await tester.pumpWidget(
          wrap(
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                MagicCheckBox(
                  label: 'Hard Disabled',
                  disabled: true,
                  size: AtomicSize.xs,
                  testId: 'hard-disabled',
                  onChanged: (_) => changed = true,
                ),
                MagicCheckBox(
                  label: 'Interactive Disabled',
                  disabled: true,
                  disabledInteractive: true,
                  disableRipple: true,
                  checked: true,
                  color: ColorIntent.success,
                  size: AtomicSize.xl,
                  testId: 'interactive-disabled',
                  onChanged: (_) => changed = true,
                ),
              ],
            ),
          ),
        );

        await tester.tap(find.text('Hard Disabled'));
        await tester.tap(find.text('Interactive Disabled'));
        await tester.pump();
        expect(changed, isFalse);

        final hardCb = tester.widget<Checkbox>(
          find.descendant(
            of: find.byKey(const ValueKey<String>('hard-disabled')),
            matching: find.byType(Checkbox),
          ),
        );
        expect(hardCb.onChanged, isNull);

        final interactiveCb = tester.widget<Checkbox>(
          find.descendant(
            of: find.byKey(const ValueKey<String>('interactive-disabled')),
            matching: find.byType(Checkbox),
          ),
        );
        expect(interactiveCb.onChanged, isNotNull);
        expect(interactiveCb.splashRadius, 0);
      },
    );
  });
}
