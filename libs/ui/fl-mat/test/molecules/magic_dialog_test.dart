import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget wrap(Widget child) {
    return MaterialApp(
      theme: MagicTheme.azureBlue,
      home: Scaffold(body: child),
    );
  }

  group('MagicDialog', () {
    testWidgets('renders nothing when open is false and displays header/body/actions when open is true', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const MagicDialog(
            testId: 'hidden-dialog',
            open: false,
            title: 'Hidden',
          ),
        ),
      );
      expect(find.text('Hidden'), findsNothing);

      DialogActionItem? clicked;
      await tester.pumpWidget(
        wrap(
          MagicDialog(
            testId: 'open-dialog',
            open: true,
            title: 'Confirm Action',
            subtitle: 'Irreversible change',
            content: 'Are you sure you want to proceed?',
            alignActions: DialogActionsAlignment.start,
            actions: const <DialogActionItem>[
              DialogActionItem(
                id: 'cancel',
                label: 'Cancel',
                variant: ButtonVariant.text,
              ),
              DialogActionItem(
                id: 'confirm',
                label: 'Confirm',
                variant: ButtonVariant.filled,
                color: ColorIntent.error,
                iconName: 'check',
              ),
              DialogActionItem(
                id: 'blocked',
                label: 'Blocked',
                disabled: true,
              ),
            ],
            onActionClick: (action) => clicked = action,
          ),
        ),
      );

      expect(find.text('Confirm Action'), findsOneWidget);
      expect(find.text('Irreversible change'), findsOneWidget);
      expect(find.text('Are you sure you want to proceed?'), findsOneWidget);
      expect(find.text('Cancel'), findsOneWidget);
      expect(find.text('Confirm'), findsOneWidget);
      expect(find.text('Blocked'), findsOneWidget);

      await tester.tap(find.text('Confirm'));
      await tester.pump();
      expect(clicked?.id, 'confirm');

      clicked = null;
      await tester.tap(find.text('Blocked'));
      await tester.pump();
      expect(clicked, isNull);
    });

    testWidgets('supports size presets (sm, md, lg, fullscreen), scrollable, and custom slots', (
      tester,
    ) async {
      for (final size in DialogSize.values) {
        await tester.pumpWidget(
          wrap(
            MagicDialog(
              testId: 'sized-dialog',
              open: true,
              size: size,
              scrollable: true,
              title: 'Dialog ${size.name}',
              content: 'Body for ${size.name}',
              child: const Text('Extra Widget Child'),
            ),
          ),
        );
        expect(find.text('Dialog ${size.name}'), findsOneWidget);
        expect(find.text('Extra Widget Child'), findsOneWidget);
      }

      await tester.pumpWidget(
        wrap(
          const MagicDialog(
            open: true,
            headerSlot: Text('Custom Header Slot'),
            actionsSlot: Text('Custom Actions Slot'),
          ),
        ),
      );
      expect(find.text('Custom Header Slot'), findsOneWidget);
      expect(find.text('Custom Actions Slot'), findsOneWidget);
    });

    testWidgets('handles close button, backdrop tap, Escape key, and dismissible=false / disabled=true', (
      tester,
    ) async {
      var closeCount = 0;

      await tester.pumpWidget(
        wrap(
          MagicDialog(
            testId: 'dismiss-dialog',
            open: true,
            title: 'Dismiss Test',
            onClose: () => closeCount++,
          ),
        ),
      );

      // Tap close button
      await tester.tap(find.byKey(const ValueKey<String>('dismiss-dialog-close')));
      await tester.pump();
      expect(closeCount, 1);

      // Tap backdrop
      await tester.tapAt(const Offset(5, 5));
      await tester.pump();
      expect(closeCount, 2);

      // Press Escape key
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pump();
      expect(closeCount, 3);

      // Non-dismissible blocks close button, backdrop, and Escape
      await tester.pumpWidget(
        wrap(
          MagicDialog(
            testId: 'locked-dialog',
            open: true,
            title: 'Locked Dialog',
            dismissible: false,
            onClose: () => closeCount++,
          ),
        ),
      );
      expect(find.byKey(const ValueKey<String>('locked-dialog-close')), findsNothing);
      await tester.tapAt(const Offset(5, 5));
      await tester.sendKeyEvent(LogicalKeyboardKey.escape);
      await tester.pump();
      expect(closeCount, 3);

      // Disabled blocks close button and backdrop
      await tester.pumpWidget(
        wrap(
          MagicDialog(
            testId: 'disabled-dialog',
            open: true,
            disabled: true,
            title: 'Disabled Dialog',
            onClose: () => closeCount++,
          ),
        ),
      );
      await tester.tap(find.byKey(const ValueKey<String>('disabled-dialog-close')));
      await tester.tapAt(const Offset(5, 5));
      await tester.pump();
      expect(closeCount, 3);
    });

    testWidgets('showMagicDialog opens route modal and closes via close button or Navigator', (
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

      showMagicDialog<void>(
        context: rootContext,
        testId: 'route-dialog',
        title: 'Route Modal',
        content: 'Inside Navigator dialog route',
        onClose: () => closed = true,
      );
      await tester.pumpAndSettle();

      expect(find.text('Route Modal'), findsOneWidget);
      await tester.tap(find.byKey(const ValueKey<String>('route-dialog-close')));
      await tester.pumpAndSettle();

      expect(closed, isTrue);
      expect(find.text('Route Modal'), findsNothing);
    });

    testWidgets('exposes accessible dialog semantics', (tester) async {
      final handle = tester.ensureSemantics();
      await tester.pumpWidget(
        wrap(
          const MagicDialog(
            open: true,
            ariaLabel: 'Delete confirmation',
            title: 'Delete Item',
          ),
        ),
      );

      expect(find.bySemanticsLabel('Delete confirmation'), findsOneWidget);
      handle.dispose();
    });
  });
}
