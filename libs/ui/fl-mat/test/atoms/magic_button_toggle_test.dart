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

  const alignOptions = <ButtonToggleOption<String>>[
    ButtonToggleOption<String>(
      value: 'left',
      label: 'Left',
      icon: Icons.format_align_left,
    ),
    ButtonToggleOption<String>(
      value: 'center',
      label: 'Center',
      iconName: 'format_align_center',
    ),
    ButtonToggleOption<String>(
      value: 'right',
      label: 'Right',
      iconName: 'format_align_right',
    ),
  ];

  group('MagicButtonToggle', () {
    testWidgets('returns SizedBox.shrink when options are empty', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const MagicButtonToggle<String>(
            options: <ButtonToggleOption<String>>[],
          ),
        ),
      );

      expect(find.byType(SegmentedButton<String>), findsNothing);
      expect(find.byType(SizedBox), findsOneWidget);
    });

    testWidgets('supports single selection including empty initial and deselection', (
      tester,
    ) async {
      String? current;

      await tester.pumpWidget(
        wrap(
          StatefulBuilder(
            builder: (context, setState) {
              return MagicButtonToggle<String>(
                options: alignOptions,
                value: current,
                testId: 'single-toggle',
                ariaLabel: 'Text alignment',
                onChanged: (next) => setState(() => current = next),
              );
            },
          ),
        ),
      );

      expect(find.byType(SegmentedButton<String>), findsOneWidget);
      expect(find.bySemanticsLabel(RegExp('Text alignment')), findsOneWidget);

      await tester.tap(find.text('Center'));
      await tester.pump();
      expect(current, 'center');

      // Deselecting in emptySelectionAllowed mode emits null.
      await tester.tap(find.text('Center'));
      await tester.pump();
      expect(current, isNull);
    });

    testWidgets('supports multiple selection mode and filters invalid values', (
      tester,
    ) async {
      Set<String> selected = <String>{'left', 'nonexistent'};

      await tester.pumpWidget(
        wrap(
          StatefulBuilder(
            builder: (context, setState) {
              return MagicButtonToggle<String>(
                options: alignOptions,
                selectionMode: ButtonToggleSelectionMode.multiple,
                selectedValues: selected,
                onMultiChanged: (next) => setState(() => selected = next),
              );
            },
          ),
        ),
      );

      final segmented = tester.widget<SegmentedButton<String>>(
        find.byType(SegmentedButton<String>),
      );
      expect(segmented.selected, <String>{'left'});
      expect(segmented.multiSelectionEnabled, isTrue);

      await tester.tap(find.text('Right'));
      await tester.pump();
      expect(selected, <String>{'left', 'right'});
    });

    testWidgets('configures vertical direction, appearance, hideSelectionIndicator, and disabled', (
      tester,
    ) async {
      String? singleValue = 'left';

      await tester.pumpWidget(
        wrap(
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              MagicButtonToggle<String>(
                options: alignOptions,
                value: 'left',
                vertical: true,
                appearance: ButtonToggleAppearance.legacy,
                hideSelectionIndicator: true,
                color: ColorIntent.secondary,
                size: AtomicSize.sm,
                testId: 'vertical-legacy',
                onChanged: (_) {},
              ),
              const SizedBox(height: 16),
              MagicButtonToggle<String>(
                options: alignOptions,
                value: singleValue,
                disabled: true,
                testId: 'disabled-toggle',
                onChanged: (next) => singleValue = next,
              ),
            ],
          ),
          theme: MagicTheme.darkTheme,
        ),
      );

      final verticalSegmented = tester.widget<SegmentedButton<String>>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('vertical-legacy')),
          matching: find.byType(SegmentedButton<String>),
        ),
      );
      expect(verticalSegmented.direction, Axis.vertical);
      expect(verticalSegmented.showSelectedIcon, isFalse);

      final disabledSegmented = tester.widget<SegmentedButton<String>>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('disabled-toggle')),
          matching: find.byType(SegmentedButton<String>),
        ),
      );
      expect(disabledSegmented.onSelectionChanged, isNull);

      await tester.tap(
        find.descendant(
          of: find.byKey(const ValueKey<String>('disabled-toggle')),
          matching: find.text('Right'),
        ),
      );
      await tester.pump();
      expect(singleValue, 'left');
    });
  });
}
