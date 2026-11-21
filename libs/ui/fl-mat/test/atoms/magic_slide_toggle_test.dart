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

  group('MagicSlideToggle', () {
    testWidgets('renders Switch with label and toggles via Switch or label tap', (
      tester,
    ) async {
      var checked = false;

      await tester.pumpWidget(
        wrap(
          StatefulBuilder(
            builder: (context, setState) {
              return MagicSlideToggle(
                label: 'Dark mode',
                checked: checked,
                testId: 'slide-toggle',
                onChanged: (next) => setState(() => checked = next),
              );
            },
          ),
        ),
      );

      expect(find.byKey(const ValueKey<String>('slide-toggle')), findsOneWidget);
      expect(find.text('Dark mode'), findsOneWidget);

      await tester.tap(find.byType(Switch));
      await tester.pump();
      expect(checked, isTrue);

      await tester.tap(find.text('Dark mode'));
      await tester.pump();
      expect(checked, isFalse);
    });

    testWidgets('supports labelPosition before/after, custom child, and requiredField', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              MagicSlideToggle(
                label: 'Terms',
                requiredField: true,
                labelPosition: SlideToggleLabelPosition.before,
                checked: true,
                onChanged: (_) {},
              ),
              MagicSlideToggle(
                checked: false,
                onChanged: (_) {},
                child: const Text('CustomToggleLabel'),
              ),
            ],
          ),
        ),
      );

      expect(find.text('Terms *'), findsOneWidget);
      expect(find.text('CustomToggleLabel'), findsOneWidget);

      final beforeLabelDx = tester.getTopLeft(find.text('Terms *')).dx;
      final firstSwitchDx = tester.getTopLeft(find.byType(Switch).at(0)).dx;
      expect(beforeLabelDx, lessThan(firstSwitchDx));

      final afterLabelDx = tester.getTopLeft(find.text('CustomToggleLabel')).dx;
      final secondSwitchDx = tester.getTopLeft(find.byType(Switch).at(1)).dx;
      expect(afterLabelDx, greaterThan(secondSwitchDx));
    });

    testWidgets('configures thumbIcon unless hideIcon is true', (tester) async {
      await tester.pumpWidget(
        wrap(
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              MagicSlideToggle(
                label: 'With Icon',
                checked: true,
                testId: 'with-icon',
                onChanged: (_) {},
              ),
              MagicSlideToggle(
                label: 'Hidden Icon',
                hideIcon: true,
                checked: true,
                testId: 'hidden-icon',
                onChanged: (_) {},
              ),
            ],
          ),
        ),
      );

      final withIconSwitch = tester.widget<Switch>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('with-icon')),
          matching: find.byType(Switch),
        ),
      );
      expect(
        withIconSwitch.thumbIcon?.resolve(<WidgetState>{WidgetState.selected})?.icon,
        Icons.check,
      );
      expect(
        withIconSwitch.thumbIcon?.resolve(<WidgetState>{})?.icon,
        Icons.close,
      );

      final hiddenIconSwitch = tester.widget<Switch>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('hidden-icon')),
          matching: find.byType(Switch),
        ),
      );
      expect(hiddenIconSwitch.thumbIcon, isNull);
    });

    testWidgets('respects disabled, disabledInteractive, disableRipple, and ColorIntent', (
      tester,
    ) async {
      var changed = false;

      await tester.pumpWidget(
        wrap(
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              MagicSlideToggle(
                label: 'Hard Disabled',
                disabled: true,
                testId: 'hard-disabled',
                onChanged: (_) => changed = true,
              ),
              MagicSlideToggle(
                label: 'Interactive Disabled',
                disabled: true,
                disabledInteractive: true,
                disableRipple: true,
                checked: true,
                color: ColorIntent.success,
                size: AtomicSize.lg,
                testId: 'interactive-disabled',
                onChanged: (_) => changed = true,
              ),
              MagicSlideToggle(
                label: 'Success Active',
                checked: true,
                color: ColorIntent.success,
                testId: 'success-active',
                onChanged: (_) {},
              ),
            ],
          ),
          theme: MagicTheme.darkTheme,
        ),
      );

      await tester.tap(find.text('Hard Disabled'));
      await tester.tap(find.text('Interactive Disabled'));
      await tester.pump();
      expect(changed, isFalse);

      final hardSwitch = tester.widget<Switch>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('hard-disabled')),
          matching: find.byType(Switch),
        ),
      );
      expect(hardSwitch.onChanged, isNull);

      final interactiveSwitch = tester.widget<Switch>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('interactive-disabled')),
          matching: find.byType(Switch),
        ),
      );
      expect(interactiveSwitch.onChanged, isNotNull);
      expect(interactiveSwitch.splashRadius, 0);

      final successSwitch = tester.widget<Switch>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('success-active')),
          matching: find.byType(Switch),
        ),
      );
      expect(successSwitch.activeTrackColor, MagicSemanticColors.dark.success);
      expect(successSwitch.activeThumbColor, MagicSemanticColors.dark.onSuccess);
    });
  });
}
