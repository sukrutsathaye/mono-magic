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

  group('MagicTextInput', () {
    testWidgets('renders standalone with placeholder, size, and invalid border', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const MagicTextInput(
            placeholder: 'Enter text',
            size: AtomicSize.xs,
            invalid: true,
            testId: 'standalone-input',
          ),
        ),
      );

      final textField = tester.widget<TextField>(find.byType(TextField));
      expect(textField.decoration?.hintText, 'Enter text');
      expect(textField.decoration?.isDense, isTrue);
      expect(textField.decoration?.enabledBorder, isA<OutlineInputBorder>());
      final enabledBorder =
          textField.decoration?.enabledBorder as OutlineInputBorder?;
      expect(
        enabledBorder?.borderSide.color,
        MagicTheme.azureBlue.colorScheme.error,
      );
      expect(textField.style?.fontSize, 12);
    });

    testWidgets('maps all TextInputTypeKind values and password obscureText', (
      tester,
    ) async {
      final expectedKeyboardTypes = <TextInputTypeKind, TextInputType>{
        TextInputTypeKind.text: TextInputType.text,
        TextInputTypeKind.email: TextInputType.emailAddress,
        TextInputTypeKind.password: TextInputType.visiblePassword,
        TextInputTypeKind.search: TextInputType.text,
        TextInputTypeKind.tel: TextInputType.phone,
        TextInputTypeKind.url: TextInputType.url,
        TextInputTypeKind.number: TextInputType.number,
      };

      for (final entry in expectedKeyboardTypes.entries) {
        await tester.pumpWidget(
          wrap(MagicTextInput(type: entry.key, testId: 'kind-${entry.key.name}')),
        );

        final textField = tester.widget<TextField>(find.byType(TextField));
        expect(textField.keyboardType, entry.value);
        expect(
          textField.obscureText,
          entry.key == TextInputTypeKind.password,
        );
        if (entry.key == TextInputTypeKind.search) {
          expect(textField.textInputAction, TextInputAction.search);
        }
      }
    });

    testWidgets('maps autocomplete strings and explicit autofillHints', (
      tester,
    ) async {
      final cases = <String, String>{
        'email': AutofillHints.email,
        'username': AutofillHints.username,
        'current-password': AutofillHints.password,
        'new-password': AutofillHints.newPassword,
        'name': AutofillHints.name,
        'given-name': AutofillHints.givenName,
        'family-name': AutofillHints.familyName,
        'tel': AutofillHints.telephoneNumber,
        'url': AutofillHints.url,
        'one-time-code': AutofillHints.oneTimeCode,
        'street-address': AutofillHints.fullStreetAddress,
        'postal-code': AutofillHints.postalCode,
      };

      for (final entry in cases.entries) {
        await tester.pumpWidget(
          wrap(MagicTextInput(autocomplete: entry.key)),
        );
        final textField = tester.widget<TextField>(find.byType(TextField));
        expect(textField.autofillHints, contains(entry.value));
      }

      await tester.pumpWidget(wrap(const MagicTextInput(autocomplete: 'off')));
      expect(
        tester.widget<TextField>(find.byType(TextField)).autofillHints,
        isNull,
      );

      await tester.pumpWidget(
        wrap(
          const MagicTextInput(
            autocomplete: 'email',
            autofillHints: <String>[AutofillHints.nickname],
          ),
        ),
      );
      expect(
        tester.widget<TextField>(find.byType(TextField)).autofillHints,
        contains(AutofillHints.nickname),
      );
    });

    testWidgets('integrates with Flutter Form validator, minLength, and onSaved', (
      tester,
    ) async {
      final formKey = GlobalKey<FormState>();
      String? savedEmail;

      await tester.pumpWidget(
        wrap(
          Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                MagicFormField(
                  label: 'Email',
                  child: MagicTextInput(
                    type: TextInputTypeKind.email,
                    testId: 'form-email',
                    validator: (value) {
                      if (value == null || !value.contains('@')) {
                        return 'Enter a valid email';
                      }
                      return null;
                    },
                    onSaved: (value) => savedEmail = value,
                  ),
                ),
                const MagicFormField(
                  label: 'Bio',
                  child: MagicTextInput(
                    minLength: 5,
                    testId: 'form-bio',
                  ),
                ),
              ],
            ),
          ),
        ),
      );

      await tester.enterText(
        find.byKey(const ValueKey<String>('form-email')),
        'invalid',
      );
      await tester.enterText(
        find.byKey(const ValueKey<String>('form-bio')),
        'hi',
      );

      expect(formKey.currentState!.validate(), isFalse);
      await tester.pump();
      expect(find.text('Enter a valid email'), findsOneWidget);
      expect(find.text('Must be at least 5 characters.'), findsOneWidget);

      await tester.enterText(
        find.byKey(const ValueKey<String>('form-email')),
        'ada@example.com',
      );
      await tester.enterText(
        find.byKey(const ValueKey<String>('form-bio')),
        'Mathematician',
      );
      expect(formKey.currentState!.validate(), isTrue);
      formKey.currentState!.save();
      expect(savedEmail, 'ada@example.com');
    });

    testWidgets('syncs controlled value updates without breaking typing', (
      tester,
    ) async {
      String currentValue = 'initial';
      late StateSetter outerSetState;

      await tester.pumpWidget(
        wrap(
          StatefulBuilder(
            builder: (context, setState) {
              outerSetState = setState;
              return MagicTextInput(
                value: currentValue,
                testId: 'controlled-input',
                onChanged: (next) => currentValue = next,
              );
            },
          ),
        ),
      );

      expect(find.text('initial'), findsOneWidget);

      outerSetState(() {
        currentValue = 'updated from parent';
      });
      await tester.pump();
      expect(find.text('updated from parent'), findsOneWidget);
    });

    testWidgets('supports external TextEditingController and FocusNode', (
      tester,
    ) async {
      final controller = TextEditingController(text: 'hello');
      final focusNode = FocusNode();
      addTearDown(controller.dispose);
      addTearDown(focusNode.dispose);

      await tester.pumpWidget(
        wrap(
          MagicTextInput(
            controller: controller,
            focusNode: focusNode,
            testId: 'ext-ctrl-input',
          ),
        ),
      );

      expect(find.text('hello'), findsOneWidget);
      focusNode.requestFocus();
      await tester.pump();
      expect(focusNode.hasFocus, isTrue);

      controller.text = 'programmatic';
      await tester.pump();
      expect(find.text('programmatic'), findsOneWidget);

      // Switching back from external controller to internal controller works cleanly.
      await tester.pumpWidget(
        wrap(const MagicTextInput(value: 'internal', testId: 'ext-ctrl-input')),
      );
      expect(find.text('internal'), findsOneWidget);
    });

    testWidgets('respects readOnly, disabled, maxLength, and onSubmitted', (
      tester,
    ) async {
      String? submitted;

      await tester.pumpWidget(
        wrap(
          MagicFormField(
            label: 'Code',
            child: MagicTextInput(
              maxLength: 4,
              testId: 'code-input',
              onSubmitted: (value) => submitted = value,
            ),
          ),
        ),
      );

      await tester.enterText(
        find.byKey(const ValueKey<String>('code-input')),
        '123456',
      );
      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pump();
      expect(submitted, '1234');

      await tester.pumpWidget(
        wrap(
          const MagicTextInput(
            value: 'locked',
            readOnly: true,
            disabled: true,
            testId: 'locked-input',
          ),
        ),
      );
      final textField = tester.widget<TextField>(find.byType(TextField));
      expect(textField.readOnly, isTrue);
      expect(textField.enabled, isFalse);
    });

    testWidgets('applies invalid border inside MagicFormField without errorText', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const MagicFormField(
            label: 'Token',
            appearance: FormFieldAppearance.filled,
            child: MagicTextInput(invalid: true),
          ),
        ),
      );

      final textField = tester.widget<TextField>(find.byType(TextField));
      expect(textField.decoration?.enabledBorder, isA<UnderlineInputBorder>());
      final border = textField.decoration?.enabledBorder as UnderlineInputBorder?;
      expect(border?.borderSide.color, MagicTheme.azureBlue.colorScheme.error);
    });
  });
}
