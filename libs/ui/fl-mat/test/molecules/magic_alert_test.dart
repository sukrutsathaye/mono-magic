import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget wrap(Widget child) {
    return MaterialApp(
      theme: MagicTheme.azureBlue,
      home: Scaffold(
        body: Center(
          child: SingleChildScrollView(child: child),
        ),
      ),
    );
  }

  group('MagicAlert', () {
    testWidgets('renders all severities and variants across sizes', (
      tester,
    ) async {
      for (final severity in AlertSeverity.values) {
        for (final variant in AlertVariant.values) {
          await tester.pumpWidget(
            wrap(
              MagicAlert(
                testId: 'alert-${severity.name}-${variant.name}',
                severity: severity,
                variant: variant,
                title: '${severity.name} title',
                message: 'Message for ${variant.name}',
              ),
            ),
          );

          expect(find.text('${severity.name} title'), findsOneWidget);
          expect(find.text('Message for ${variant.name}'), findsOneWidget);
        }
      }

      for (final size in AtomicSize.values) {
        await tester.pumpWidget(
          wrap(
            MagicAlert(
              size: size,
              message: 'Sized ${size.name}',
            ),
          ),
        );
        expect(find.text('Sized ${size.name}'), findsOneWidget);
      }
    });

    testWidgets('supports hideIcon, custom iconName, action button, dismissible, and disabled states', (
      tester,
    ) async {
      var dismissed = false;
      var actionClicked = false;

      await tester.pumpWidget(
        wrap(
          MagicAlert(
            testId: 'interactive-alert',
            severity: AlertSeverity.warning,
            variant: AlertVariant.filled,
            title: 'Warning',
            message: 'Low storage remaining',
            iconName: 'notifications',
            dismissible: true,
            actionLabel: 'Upgrade',
            onAction: () => actionClicked = true,
            onDismiss: () => dismissed = true,
          ),
        ),
      );

      expect(find.byIcon(Icons.notifications), findsOneWidget);
      await tester.tap(find.text('Upgrade'));
      await tester.pump();
      expect(actionClicked, isTrue);

      await tester.tap(find.byKey(const ValueKey<String>('interactive-alert-dismiss')));
      await tester.pump();
      expect(dismissed, isTrue);

      // Hide icon & disabled blocks callbacks
      actionClicked = false;
      dismissed = false;
      await tester.pumpWidget(
        wrap(
          MagicAlert(
            testId: 'disabled-alert',
            message: 'Locked alert',
            hideIcon: true,
            dismissible: true,
            disabled: true,
            actionLabel: 'Retry',
            onAction: () => actionClicked = true,
            onDismiss: () => dismissed = true,
          ),
        ),
      );

      expect(find.byIcon(Icons.info_outline), findsNothing);
      await tester.tap(find.text('Retry'));
      await tester.tap(find.byKey(const ValueKey<String>('disabled-alert-dismiss')));
      await tester.pump();
      expect(actionClicked, isFalse);
      expect(dismissed, isFalse);
    });

    testWidgets('exposes live-region semantics label', (tester) async {
      final handle = tester.ensureSemantics();
      await tester.pumpWidget(
        wrap(
          const MagicAlert(
            ariaLabel: 'Critical error alert',
            severity: AlertSeverity.error,
            message: 'Connection failed',
          ),
        ),
      );

      expect(find.bySemanticsLabel('Critical error alert'), findsOneWidget);
      handle.dispose();
    });
  });
}
