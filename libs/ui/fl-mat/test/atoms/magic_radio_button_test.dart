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

  group('MagicRadioButton', () {
    const sampleOptions = <RadioOption<String>>[
      RadioOption<String>(value: 'email', label: 'Email'),
      RadioOption<String>(value: 'sms', label: 'SMS'),
      RadioOption<String>(value: 'push', label: 'Push', disabled: true),
    ];

    testWidgets('renders RadioGroup + Radio options and emits onChanged', (
      tester,
    ) async {
      String? selected = 'email';

      await tester.pumpWidget(
        wrap(
          StatefulBuilder(
            builder: (context, setState) {
              return MagicRadioButton<String>(
                options: sampleOptions,
                value: selected,
                testId: 'radio-group',
                ariaLabel: 'Notification channel',
                onChanged: (next) => setState(() => selected = next),
              );
            },
          ),
        ),
      );

      expect(find.byType(RadioGroup<String>), findsOneWidget);
      expect(find.byType(Radio<String>), findsNWidgets(3));
      expect(
        find.bySemanticsLabel(RegExp('Notification channel')),
        findsOneWidget,
      );

      // Tapping label selects the option.
      await tester.tap(find.text('SMS'));
      await tester.pump();
      expect(selected, 'sms');

      // Tapping disabled option does not emit.
      await tester.tap(find.text('Push'));
      await tester.pump();
      expect(selected, 'sms');
    });

    testWidgets('supports horizontal Wrap layout and before/after labelPosition', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const MagicRadioButton<int>(
            vertical: false,
            labelPosition: RadioLabelPosition.before,
            requiredField: true,
            options: <RadioOption<int>>[
              RadioOption<int>(value: 1, label: 'One'),
              RadioOption<int>(
                value: 2,
                label: 'Two',
                labelPosition: RadioLabelPosition.after,
              ),
            ],
            value: 1,
          ),
        ),
      );

      expect(find.byType(Wrap), findsOneWidget);
      expect(find.text('One *'), findsOneWidget);
      expect(find.text('Two *'), findsOneWidget);

      final oneLabelDx = tester.getTopLeft(find.text('One *')).dx;
      final twoLabelDx = tester.getTopLeft(find.text('Two *')).dx;
      final radios = find.byType(Radio<int>);
      final firstRadioDx = tester.getTopLeft(radios.at(0)).dx;
      final secondRadioDx = tester.getTopLeft(radios.at(1)).dx;

      expect(oneLabelDx, lessThan(firstRadioDx));
      expect(twoLabelDx, greaterThan(secondRadioDx));
    });

    testWidgets('respects group disabled, disableRipple, and ColorIntent', (
      tester,
    ) async {
      String? selected = 'email';

      await tester.pumpWidget(
        wrap(
          MagicRadioButton<String>(
            options: sampleOptions,
            value: selected,
            disabled: true,
            disableRipple: true,
            color: ColorIntent.success,
            size: AtomicSize.lg,
            onChanged: (next) => selected = next,
          ),
          theme: MagicTheme.darkTheme,
        ),
      );

      await tester.tap(find.text('SMS'));
      await tester.pump();
      expect(selected, 'email');

      final radio = tester.widget<Radio<String>>(find.byType(Radio<String>).first);
      expect(radio.enabled, isFalse);
      expect(
        radio.fillColor?.resolve(<WidgetState>{WidgetState.selected}),
        MagicTheme.darkTheme.colorScheme.onSurface.withValues(alpha: 0.38),
      );
    });

    testWidgets('resolves ColorIntent fill color when enabled', (tester) async {
      await tester.pumpWidget(
        wrap(
          MagicRadioButton<String>(
            options: sampleOptions,
            value: 'email',
            color: ColorIntent.warning,
            onChanged: (_) {},
          ),
          theme: MagicTheme.darkTheme,
        ),
      );

      final radio = tester.widget<Radio<String>>(find.byType(Radio<String>).first);
      expect(
        radio.fillColor?.resolve(<WidgetState>{WidgetState.selected}),
        MagicSemanticColors.dark.warning,
      );
    });
  });
}
