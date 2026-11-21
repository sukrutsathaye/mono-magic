import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget wrap(Widget child) {
    return MaterialApp(
      theme: MagicTheme.azureBlue,
      home: Scaffold(
        body: Center(
          child: SizedBox(width: 360, child: child),
        ),
      ),
    );
  }

  group('MagicFormField', () {
    testWidgets(
      'propagates label, hint, outlined appearance, and required marker without double InputDecorator',
      (tester) async {
        await tester.pumpWidget(
          wrap(
            const MagicFormField(
              label: 'Email',
              hint: 'Used for account recovery',
              requiredField: true,
              testId: 'email-field',
              ariaLabel: 'Email field wrapper',
              child: MagicTextInput(
                placeholder: 'ada@example.com',
                testId: 'email-input',
              ),
            ),
          ),
        );

        expect(find.byKey(const ValueKey<String>('email-field')), findsOneWidget);
        expect(find.text('Email *'), findsOneWidget);
        expect(find.text('Used for account recovery'), findsOneWidget);

        // Single InputDecorator rendered by TextFormField (no double-boxing).
        expect(find.byType(InputDecorator), findsOneWidget);

        final decorator = tester.widget<InputDecorator>(
          find.byType(InputDecorator),
        );
        expect(decorator.decoration.border, isA<OutlineInputBorder>());
        expect(decorator.decoration.filled, isFalse);
      },
    );

    testWidgets(
      'supports hideRequiredMarker, filled appearance, floatLabel, subscriptSizing, prefix, and suffix',
      (tester) async {
        await tester.pumpWidget(
          wrap(
            const MagicFormField(
              label: 'Phone',
              hint: 'Include country code',
              appearance: FormFieldAppearance.filled,
              size: AtomicSize.sm,
              floatLabel: FormFieldFloatLabel.always,
              subscriptSizing: FormFieldSubscriptSizing.dynamic,
              requiredField: true,
              hideRequiredMarker: true,
              prefix: Icon(Icons.phone),
              suffix: Icon(Icons.check),
              child: MagicTextInput(type: TextInputTypeKind.tel),
            ),
          ),
        );

        expect(find.text('Phone'), findsOneWidget);
        expect(find.text('Phone *'), findsNothing);
        expect(find.byIcon(Icons.phone), findsOneWidget);
        expect(find.byIcon(Icons.check), findsOneWidget);

        final decorator = tester.widget<InputDecorator>(
          find.byType(InputDecorator),
        );
        expect(decorator.decoration.filled, isTrue);
        expect(decorator.decoration.border, isA<UnderlineInputBorder>());
        expect(decorator.decoration.isDense, isTrue);
        expect(
          decorator.decoration.floatingLabelBehavior,
          FloatingLabelBehavior.always,
        );
        expect(decorator.decoration.helperMaxLines, 3);
      },
    );

    testWidgets('replaces hint with errorText when errorText is present', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const MagicFormField(
            label: 'Handle',
            hint: '3-20 characters',
            errorText: 'Handle already taken',
            child: MagicTextInput(),
          ),
        ),
      );

      expect(find.text('Handle already taken'), findsOneWidget);
      expect(find.text('3-20 characters'), findsNothing);
    });

    testWidgets('propagates disabled state to nested MagicTextInput', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const MagicFormField(
            label: 'Readonly Account',
            disabled: true,
            child: MagicTextInput(testId: 'disabled-input'),
          ),
        ),
      );

      final textField = tester.widget<TextField>(find.byType(TextField));
      expect(textField.enabled, isFalse);
    });

    testWidgets('decorates custom non-scope-aware child when decorateChild is true', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const MagicFormField(
            label: 'Custom Value',
            hint: 'Decorated directly',
            decorateChild: true,
            child: Text('Static value'),
          ),
        ),
      );

      expect(find.byType(InputDecorator), findsOneWidget);
      expect(find.text('Custom Value'), findsOneWidget);
      expect(find.text('Decorated directly'), findsOneWidget);
      expect(find.text('Static value'), findsOneWidget);
    });

    test('MagicFormFieldProps preserves defaults and explicit fields', () {
      const defaults = MagicFormFieldProps();
      expect(defaults.appearance, FormFieldAppearance.outlined);
      expect(defaults.size, AtomicSize.md);
      expect(defaults.floatLabel, FormFieldFloatLabel.auto);
      expect(defaults.subscriptSizing, FormFieldSubscriptSizing.fixed);
      expect(defaults.hideRequiredMarker, isFalse);
      expect(defaults.requiredField, isFalse);
      expect(defaults.disabled, isFalse);

      const custom = MagicFormFieldProps(
        id: 'ff-1',
        testId: 'ff-test',
        ariaLabel: 'Custom Field',
        label: 'Name',
        hint: 'First and last',
        errorText: 'Required',
        appearance: FormFieldAppearance.filled,
        size: AtomicSize.lg,
        floatLabel: FormFieldFloatLabel.always,
        subscriptSizing: FormFieldSubscriptSizing.dynamic,
        hideRequiredMarker: true,
        requiredField: true,
        disabled: true,
      );
      expect(custom.id, 'ff-1');
      expect(custom.testId, 'ff-test');
      expect(custom.ariaLabel, 'Custom Field');
      expect(custom.label, 'Name');
      expect(custom.appearance, FormFieldAppearance.filled);
    });
  });
}
