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

  group('MagicChip', () {
    testWidgets(
      'renders basic variant with chips, single fallback label, icons, and removal',
      (tester) async {
        ChipItem? removedChip;

        await tester.pumpWidget(
          wrap(
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                MagicChip(
                  testId: 'basic-chips',
                  removable: true,
                  chips: const [
                    ChipItem(
                      id: '1',
                      label: 'Flutter',
                      leadingIconName: 'star',
                    ),
                    ChipItem(
                      id: '2',
                      label: 'Dart',
                      removable: false,
                    ),
                  ],
                  onChipRemoved: (chip) => removedChip = chip,
                ),
                const MagicChip(
                  label: 'SingleFallback',
                  testId: 'single-fallback',
                ),
              ],
            ),
          ),
        );

        expect(
          find.byKey(const ValueKey<String>('basic-chips')),
          findsOneWidget,
        );
        expect(find.text('Flutter'), findsOneWidget);
        expect(find.text('Dart'), findsOneWidget);
        expect(find.text('SingleFallback'), findsOneWidget);

        await tester.tap(find.byIcon(Icons.cancel).first);
        await tester.pump();
        expect(removedChip?.label, 'Flutter');
      },
    );

    testWidgets(
      'renders selectable variant with FilterChip and emits onSelectionChanged',
      (tester) async {
        ChipItem? toggledChip;
        bool? nextState;

        await tester.pumpWidget(
          wrap(
            MagicChip(
              variant: ChipVariant.selectable,
              multiple: true,
              color: ColorIntent.secondary,
              size: AtomicSize.sm,
              chips: const [
                ChipItem(id: 'a', label: 'Design', selected: false),
                ChipItem(id: 'b', label: 'Engineering', selected: true),
              ],
              onSelectionChanged: (chip, selected) {
                toggledChip = chip;
                nextState = selected;
              },
            ),
          ),
        );

        expect(find.byType(FilterChip), findsNWidgets(2));

        await tester.tap(find.text('Design'));
        await tester.pump();
        expect(toggledChip?.label, 'Design');
        expect(nextState, isTrue);
      },
    );

    testWidgets(
      'renders input variant supporting adding, inline editing, and removing chips',
      (tester) async {
        ChipItem? addedChip;
        String? editedNewLabel;
        ChipItem? removedChip;

        await tester.pumpWidget(
          wrap(
            MagicChip(
              variant: ChipVariant.input,
              label: 'Tags',
              inputPlaceholder: 'Add tag...',
              removable: true,
              editable: true,
              chips: const [
                ChipItem(id: 'tag-1', label: 'Alpha'),
              ],
              onChipAdded: (chip) => addedChip = chip,
              onChipEdited: (chip, newLabel) => editedNewLabel = newLabel,
              onChipRemoved: (chip) => removedChip = chip,
            ),
          ),
        );

        expect(find.byType(InputChip), findsOneWidget);
        expect(find.text('Alpha'), findsOneWidget);

        // Add a new chip via inline MagicTextInput submission
        await tester.enterText(find.byType(TextField), 'Beta');
        await tester.testTextInput.receiveAction(TextInputAction.done);
        await tester.pump();
        expect(addedChip?.label, 'Beta');

        // Tap chip to start inline editing
        await tester.tap(find.text('Alpha'));
        await tester.pump();
        final editField = find.byKey(
          const ValueKey<String>('magic-chip-edit-field-0'),
        );
        expect(editField, findsOneWidget);

        await tester.enterText(editField, 'AlphaUpdated');
        await tester.tap(find.byIcon(Icons.check));
        await tester.pump();
        expect(editedNewLabel, 'AlphaUpdated');

        // Delete chip via cancel button
        await tester.tap(find.byIcon(Icons.cancel));
        await tester.pump();
        expect(removedChip?.label, 'Alpha');
      },
    );

    testWidgets(
      'renders draggable variant and reorders chips via accessible move buttons',
      (tester) async {
        List<ChipItem>? reordered;

        await tester.pumpWidget(
          wrap(
            MagicChip(
              variant: ChipVariant.draggable,
              orientation: ChipOrientation.vertical,
              chips: const [
                ChipItem(id: '1', label: 'First'),
                ChipItem(id: '2', label: 'Second'),
              ],
              onChipReordered: (next) => reordered = next,
            ),
          ),
        );

        expect(find.text('First'), findsOneWidget);
        expect(find.text('Second'), findsOneWidget);

        await tester.tap(find.byTooltip('Move First forward'));
        await tester.pump();

        expect(reordered, isNotNull);
        expect(reordered!.map((c) => c.label).toList(), ['Second', 'First']);
      },
    );
  });
}
