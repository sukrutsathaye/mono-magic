import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget wrap(Widget child) {
    return MaterialApp(
      theme: MagicTheme.azureBlue,
      home: Scaffold(
        body: SingleChildScrollView(child: child),
      ),
    );
  }

  const List<MagicStepItem> baseSteps = <MagicStepItem>[
    MagicStepItem(
      id: 'one',
      label: 'Account',
      description: 'Setup credentials',
      completed: true,
    ),
    MagicStepItem(
      id: 'two',
      label: 'Profile',
      optional: true,
      optionalLabel: 'Optional',
    ),
    MagicStepItem(
      id: 'three',
      label: 'Confirm',
      iconName: 'verified',
    ),
  ];

  group('MagicStepper', () {
    testWidgets('renders horizontal steps, enforces linear navigation, and allows non-linear jumps', (
      tester,
    ) async {
      int? changedStep;

      await tester.pumpWidget(
        wrap(
          MagicStepper(
            testId: 'stepper-linear',
            steps: baseSteps,
            defaultActiveStep: 1,
            linear: true,
            alternativeLabel: true,
            onStepChange: (i) => changedStep = i,
          ),
        ),
      );

      expect(find.text('Account'), findsOneWidget);
      expect(find.text('Profile'), findsOneWidget);
      expect(find.text('Optional'), findsOneWidget);
      expect(find.text('Confirm'), findsOneWidget);

      // Step 2 (Profile) is NOT completed yet, though it IS optional, so step 3 is reachable.
      // Let's test a non-optional incomplete blocker.
      await tester.pumpWidget(
        wrap(
          MagicStepper(
            testId: 'stepper-blocked',
            linear: true,
            defaultActiveStep: 0,
            steps: const <MagicStepItem>[
              MagicStepItem(id: 's1', label: 'First'),
              MagicStepItem(id: 's2', label: 'Second'),
              MagicStepItem(id: 's3', label: 'Third'),
            ],
            onStepChange: (i) => changedStep = i,
          ),
        ),
      );

      await tester.tap(find.byKey(const ValueKey<String>('stepper-blocked-step-s3')));
      await tester.pump();
      expect(changedStep, isNull);

      // Non-linear allows direct jump
      await tester.pumpWidget(
        wrap(
          MagicStepper(
            testId: 'stepper-free',
            linear: false,
            steps: baseSteps,
            onStepChange: (i) => changedStep = i,
          ),
        ),
      );

      await tester.tap(find.byKey(const ValueKey<String>('stepper-free-step-three')));
      await tester.pump();
      expect(changedStep, 2);
    });

    testWidgets('supports vertical orientation, error state, stepContentBuilder, and disabled state', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      int? latestStep;

      await tester.pumpWidget(
        wrap(
          MagicStepper(
            testId: 'stepper-vert',
            ariaLabel: 'Checkout Steps',
            orientation: MagicStepperOrientation.vertical,
            activeStep: 1,
            size: AtomicSize.lg,
            color: ColorIntent.tertiary,
            steps: const <MagicStepItem>[
              MagicStepItem(id: 'a', label: 'Cart', completed: true),
              MagicStepItem(
                id: 'b',
                label: 'Payment',
                error: true,
                errorMessage: 'Card declined',
              ),
              MagicStepItem(id: 'c', label: 'Receipt', disabled: true),
            ],
            stepContentBuilder: (context, step, index) =>
                Text('Content for ${step.id} ($index)'),
            onStepChange: (i) => latestStep = i,
          ),
        ),
      );

      expect(find.text('Card declined'), findsOneWidget);
      expect(find.text('Content for b (1)'), findsOneWidget);
      expect(find.bySemanticsLabel('Checkout Steps'), findsOneWidget);

      // Tapping disabled step c does nothing
      await tester.tap(find.byKey(const ValueKey<String>('stepper-vert-step-c')));
      await tester.pump();
      expect(latestStep, isNull);

      // Tapping step a navigates backward
      await tester.tap(find.byKey(const ValueKey<String>('stepper-vert-step-a')));
      await tester.pump();
      expect(latestStep, 0);

      // Empty steps renders nothing
      await tester.pumpWidget(
        wrap(const MagicStepper(testId: 'empty-stepper', steps: <MagicStepItem>[])),
      );
      expect(find.byKey(const ValueKey<String>('empty-stepper')), findsOneWidget);
      handle.dispose();
    });
  });
}
