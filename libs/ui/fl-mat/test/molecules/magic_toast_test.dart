import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget wrap(Widget child) {
    return MaterialApp(
      theme: MagicTheme.azureBlue,
      home: Scaffold(body: child),
    );
  }

  group('MagicToast', () {
    testWidgets('renders only when open and supports all severities and positions', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const MagicToast(
            open: false,
            message: 'Hidden toast',
            duration: null,
          ),
        ),
      );
      expect(find.text('Hidden toast'), findsNothing);

      for (final severity in AlertSeverity.values) {
        await tester.pumpWidget(
          wrap(
            MagicToast(
              open: true,
              severity: severity,
              title: severity.name,
              message: 'Toast message ${severity.name}',
              duration: null,
            ),
          ),
        );
        expect(find.text('Toast message ${severity.name}'), findsOneWidget);
      }

      for (final position in ToastPosition.values) {
        await tester.pumpWidget(
          wrap(
            MagicToast(
              open: true,
              position: position,
              message: 'Positioned ${position.name}',
              duration: null,
            ),
          ),
        );
        expect(find.text('Positioned ${position.name}'), findsOneWidget);
      }
    });

    testWidgets('invokes onAction and onClose on button taps and auto-dismisses on duration', (
      tester,
    ) async {
      var actionCount = 0;
      var closeCount = 0;

      await tester.pumpWidget(
        wrap(
          MagicToast(
            testId: 'timer-toast',
            open: true,
            title: 'Deleted',
            message: 'Item moved to trash',
            actionLabel: 'Undo',
            duration: 500,
            onAction: () => actionCount++,
            onClose: () => closeCount++,
          ),
        ),
      );

      await tester.tap(find.text('Undo'));
      await tester.pump();
      expect(actionCount, 1);

      // Advance clock past 500ms auto-dismiss timer
      await tester.pump(const Duration(milliseconds: 550));
      expect(closeCount, 1);

      // Manual close via dismiss button with persistent duration=null
      await tester.pumpWidget(
        wrap(
          MagicToast(
            testId: 'manual-toast',
            open: true,
            message: 'Persistent toast',
            duration: null,
            onClose: () => closeCount++,
          ),
        ),
      );
      await tester.tap(find.byKey(const ValueKey<String>('manual-toast-dismiss')));
      await tester.pump();
      expect(closeCount, 2);
    });

    testWidgets('cancels pending timer cleanly when disposed or disabled', (
      tester,
    ) async {
      var closeCount = 0;

      await tester.pumpWidget(
        wrap(
          MagicToast(
            open: true,
            message: 'Pending timer toast',
            duration: 4000,
            onClose: () => closeCount++,
          ),
        ),
      );

      // Unmount immediately before timer fires — must NOT leave pending timer!
      await tester.pumpWidget(wrap(const SizedBox.shrink()));
      await tester.pump(const Duration(seconds: 5));
      expect(closeCount, 0);

      // Disabled blocks callbacks and does not schedule auto-dismiss
      await tester.pumpWidget(
        wrap(
          MagicToast(
            testId: 'disabled-toast',
            open: true,
            disabled: true,
            message: 'Disabled toast',
            actionLabel: 'Undo',
            duration: 200,
            onAction: () => closeCount++,
            onClose: () => closeCount++,
          ),
        ),
      );
      await tester.tap(find.text('Undo'));
      await tester.tap(find.byKey(const ValueKey<String>('disabled-toast-dismiss')));
      await tester.pump(const Duration(milliseconds: 300));
      expect(closeCount, 0);
    });

    testWidgets('showMagicToast inserts and removes OverlayEntry cleanly', (
      tester,
    ) async {
      var closed = false;
      late BuildContext rootContext;

      await tester.pumpWidget(
        MaterialApp(
          theme: MagicTheme.azureBlue,
          home: Scaffold(
            body: Builder(
              builder: (context) {
                rootContext = context;
                return const SizedBox.shrink();
              },
            ),
          ),
        ),
      );

      showMagicToast(
        context: rootContext,
        testId: 'overlay-toast',
        severity: AlertSeverity.success,
        message: 'Overlay saved',
        duration: 300,
        onClose: () => closed = true,
      );
      await tester.pump();
      expect(find.text('Overlay saved'), findsOneWidget);

      await tester.pump(const Duration(milliseconds: 350));
      expect(closed, isTrue);
      expect(find.text('Overlay saved'), findsNothing);
    });
  });
}
