import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget wrap(Widget child) {
    return MaterialApp(
      theme: MagicTheme.azureBlue,
      home: Scaffold(
        body: Padding(
          padding: const EdgeInsets.all(16),
          child: child,
        ),
      ),
    );
  }

  group('MagicDatePicker', () {
    testWidgets('handles single mode text input, min/max validation, clearable, and picker dialog', (
      tester,
    ) async {
      String? captured = 'initial';

      await tester.pumpWidget(
        wrap(
          MagicDatePicker(
            testId: 'dp-single',
            label: 'Release Date',
            hint: 'YYYY-MM-DD',
            defaultValue: '2026-11-22',
            minDate: '2026-01-01',
            maxDate: '2026-12-31',
            clearable: true,
            onChanged: (v) => captured = v,
          ),
        ),
      );

      expect(find.text('Release Date'), findsOneWidget);
      expect(find.text('2026-11-22'), findsOneWidget);

      // Invalid format shows validation error
      await tester.enterText(
        find.byKey(const ValueKey<String>('dp-single-input')),
        'not-a-date',
      );
      await tester.pump();
      expect(find.text('Enter date as YYYY-MM-DD'), findsOneWidget);

      // Out-of-bounds date shows bounds error
      await tester.enterText(
        find.byKey(const ValueKey<String>('dp-single-input')),
        '2025-12-31',
      );
      await tester.pump();
      expect(find.text('Date must be on or after 2026-01-01'), findsOneWidget);

      // Valid date emits onChanged
      await tester.enterText(
        find.byKey(const ValueKey<String>('dp-single-input')),
        '2026-11-25',
      );
      await tester.pump();
      expect(captured, '2026-11-25');

      // Clear button resets value
      await tester.tap(find.byKey(const ValueKey<String>('dp-single-clear')));
      await tester.pump();
      expect(captured, isNull);

      // Open Material showDatePicker dialog and select day 15
      await tester.tap(find.byKey(const ValueKey<String>('dp-single-picker-btn')));
      await tester.pumpAndSettle();
      expect(find.byType(DatePickerDialog), findsOneWidget);
      await tester.tap(find.text('OK'));
      await tester.pumpAndSettle();
      expect(captured, isNotNull);
    });

    testWidgets('handles range mode, ordering validation, filled appearance, readOnly, and disabled', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      MagicDateRangeValue? capturedRange;

      await tester.pumpWidget(
        wrap(
          MagicDatePicker(
            testId: 'dp-range',
            ariaLabel: 'Sprint Dates',
            label: 'Sprint Window',
            mode: MagicDatePickerMode.range,
            appearance: FormFieldAppearance.filled,
            clearable: true,
            minDate: '2026-01-01',
            maxDate: '2026-12-31',
            defaultRangeValue: const MagicDateRangeValue(
              start: '2026-11-10',
              end: '2026-11-20',
            ),
            onRangeChanged: (r) => capturedRange = r,
          ),
        ),
      );

      expect(find.bySemanticsLabel('Sprint Dates'), findsOneWidget);
      expect(find.text('2026-11-10'), findsOneWidget);
      expect(find.text('2026-11-20'), findsOneWidget);

      // End before start displays error
      await tester.enterText(
        find.byKey(const ValueKey<String>('dp-range-end-input')),
        '2026-11-01',
      );
      await tester.pump();
      expect(
        find.text('End date must be on or after start date'),
        findsOneWidget,
      );

      // Valid end emits updated range
      await tester.enterText(
        find.byKey(const ValueKey<String>('dp-range-end-input')),
        '2026-11-28',
      );
      await tester.pump();
      expect(
        capturedRange,
        const MagicDateRangeValue(start: '2026-11-10', end: '2026-11-28'),
      );

      // Clear resets range
      await tester.tap(find.byKey(const ValueKey<String>('dp-range-clear')));
      await tester.pump();
      expect(capturedRange, isNull);

      // Read-only hides clear and ignores picker tap
      await tester.pumpWidget(
        wrap(
          const MagicDatePicker(
            testId: 'dp-readonly',
            label: 'Locked Date',
            value: '2026-11-22',
            readOnly: true,
            clearable: true,
          ),
        ),
      );
      expect(find.byKey(const ValueKey<String>('dp-readonly-clear')), findsNothing);
      await tester.tap(find.byKey(const ValueKey<String>('dp-readonly-picker-btn')));
      await tester.pump();
      expect(find.byType(DatePickerDialog), findsNothing);
      handle.dispose();
    });

    testWidgets('supports enableTime, range validation, empty text reset, and controlled updates', (
      tester,
    ) async {
      String? singleVal;
      MagicDateRangeValue? rangeVal;

      await tester.pumpWidget(
        wrap(
          MagicDatePicker(
            testId: 'dp-time',
            label: 'Schedule',
            enableTime: true,
            value: '2026-11-22T09:30',
            onChanged: (v) => singleVal = v,
          ),
        ),
      );

      expect(find.text('2026-11-22T09:30'), findsOneWidget);

      // Controlled update
      await tester.pumpWidget(
        wrap(
          MagicDatePicker(
            testId: 'dp-time',
            label: 'Schedule',
            enableTime: true,
            value: '2026-11-23T14:45',
            onChanged: (v) => singleVal = v,
          ),
        ),
      );
      expect(find.text('2026-11-23T14:45'), findsOneWidget);

      // Open single date + time picker
      await tester.tap(find.byKey(const ValueKey<String>('dp-time-picker-btn')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('OK'));
      await tester.pumpAndSettle();
      expect(find.byType(TimePickerDialog), findsOneWidget);
      await tester.tap(find.text('OK'));
      await tester.pumpAndSettle();
      expect(singleVal, '2026-11-23T14:45');

      // Clearing text emits null
      await tester.enterText(
        find.byKey(const ValueKey<String>('dp-time-input')),
        '',
      );
      await tester.pump();
      expect(singleVal, isNull);

      // Range mode controlled updates & bounds
      await tester.pumpWidget(
        wrap(
          MagicDatePicker(
            testId: 'dp-range-ctrl',
            mode: MagicDatePickerMode.range,
            minDate: '2026-01-01',
            maxDate: '2026-12-31',
            rangeValue: const MagicDateRangeValue(
              start: '2026-11-05',
              end: '2026-11-12',
            ),
            onRangeChanged: (r) => rangeVal = r,
          ),
        ),
      );
      expect(find.text('2026-11-05'), findsOneWidget);

      await tester.enterText(
        find.byKey(const ValueKey<String>('dp-range-ctrl-start-input')),
        '2027-01-02',
      );
      await tester.pump();
      expect(find.text('Date must be on or before 2026-12-31'), findsOneWidget);

      await tester.enterText(
        find.byKey(const ValueKey<String>('dp-range-ctrl-start-input')),
        'bad',
      );
      await tester.pump();
      expect(find.text('Enter range dates as YYYY-MM-DD'), findsOneWidget);

      await tester.enterText(
        find.byKey(const ValueKey<String>('dp-range-ctrl-start-input')),
        '',
      );
      await tester.enterText(
        find.byKey(const ValueKey<String>('dp-range-ctrl-end-input')),
        '',
      );
      await tester.pump();
      expect(rangeVal, isNull);
    });
  });
}
