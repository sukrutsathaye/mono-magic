import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget wrap(Widget child) {
    return MaterialApp(
      theme: MagicTheme.azureBlue,
      home: Scaffold(body: Center(child: child)),
    );
  }

  group('MagicToolTip', () {
    testWidgets('renders Tooltip with message and trigger child', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const MagicToolTip(
            message: 'Save changes',
            testId: 'tip-save',
            child: Icon(Icons.save),
          ),
        ),
      );

      expect(find.byKey(const ValueKey<String>('tip-save')), findsOneWidget);
      expect(find.byIcon(Icons.save), findsOneWidget);
      final tooltip = tester.widget<Tooltip>(find.byType(Tooltip));
      expect(tooltip.message, 'Save changes');
      expect(tooltip.preferBelow, isTrue);
      expect(tooltip.constraints, isNotNull);
    });

    testWidgets('falls back to Text(label) when child is null', (tester) async {
      await tester.pumpWidget(
        wrap(
          const MagicToolTip(
            message: 'Helpful info',
            label: 'Hover me',
          ),
        ),
      );

      expect(find.text('Hover me'), findsOneWidget);
      expect(find.byType(Tooltip), findsOneWidget);
    });

    testWidgets('configures position, delays, and touchGestures', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              MagicToolTip(
                message: 'Above tip',
                position: ToolTipPosition.above,
                showDelay: 250,
                hideDelay: 800,
                touchGestures: ToolTipTouchGestures.on,
                testId: 'tip-on',
                child: Text('Trigger 1'),
              ),
              MagicToolTip(
                message: 'Off tip',
                touchGestures: ToolTipTouchGestures.off,
                testId: 'tip-off',
                child: Text('Trigger 2'),
              ),
            ],
          ),
        ),
      );

      final tipOn = tester.widget<Tooltip>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('tip-on')),
          matching: find.byType(Tooltip),
        ),
      );
      expect(tipOn.preferBelow, isFalse);
      expect(tipOn.waitDuration, const Duration(milliseconds: 250));
      expect(tipOn.showDuration, const Duration(milliseconds: 800));
      expect(tipOn.triggerMode, TooltipTriggerMode.tap);

      final tipOff = tester.widget<Tooltip>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('tip-off')),
          matching: find.byType(Tooltip),
        ),
      );
      expect(tipOff.triggerMode, TooltipTriggerMode.manual);
    });

    testWidgets('omits Tooltip widget when disabled or message is empty', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              MagicToolTip(
                message: 'Disabled tip',
                disabled: true,
                child: Text('DisabledTrigger'),
              ),
              MagicToolTip(
                message: '',
                child: Text('EmptyTrigger'),
              ),
            ],
          ),
        ),
      );

      expect(find.text('DisabledTrigger'), findsOneWidget);
      expect(find.text('EmptyTrigger'), findsOneWidget);
      expect(find.byType(Tooltip), findsNothing);
    });

    testWidgets('shows tooltip overlay on tap when touchGestures is on', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const MagicToolTip(
            message: 'Tap tooltip visible',
            touchGestures: ToolTipTouchGestures.on,
            ariaLabel: 'Info action',
            child: Text('TapTarget'),
          ),
        ),
      );

      expect(find.bySemanticsLabel(RegExp('Info action')), findsOneWidget);
      await tester.tap(find.text('TapTarget'));
      await tester.pump();
      expect(find.text('Tap tooltip visible'), findsOneWidget);
    });
  });
}
