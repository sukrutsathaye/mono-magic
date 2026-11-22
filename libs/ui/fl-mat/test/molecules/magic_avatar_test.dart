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

  group('MagicAvatar & MagicAvatarGroup', () {
    testWidgets('derives initials from name, honors explicit initials, and falls back to MagicIcon person', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              MagicAvatar(testId: 'derived', name: 'Ada Lovelace'),
              MagicAvatar(testId: 'single-name', name: 'Cher'),
              MagicAvatar(
                testId: 'explicit',
                name: 'Ada Lovelace',
                initials: 'VIP',
              ),
              MagicAvatar(testId: 'icon-fallback'),
            ],
          ),
        ),
      );

      expect(find.text('AL'), findsOneWidget);
      expect(find.text('C'), findsOneWidget);
      expect(find.text('VIP'), findsOneWidget);
      expect(find.byIcon(Icons.person), findsOneWidget);
    });

    testWidgets('renders sizes, shapes, colors, status indicator dots, and image error fallback', (
      tester,
    ) async {
      for (final size in AtomicSize.values) {
        for (final shape in AvatarShape.values) {
          await tester.pumpWidget(
            wrap(
              MagicAvatar(
                initials: 'MM',
                size: size,
                shape: shape,
                color: ColorIntent.secondary,
                status: AvatarStatus.online,
                statusLabel: 'Active now',
              ),
            ),
          );
          expect(find.text('MM'), findsOneWidget);
        }
      }

      // Status enum variants
      for (final status in AvatarStatus.values) {
        await tester.pumpWidget(
          wrap(
            MagicAvatar(
              testId: 'status-${status.name}',
              name: 'Grace Hopper',
              status: status,
            ),
          ),
        );
        expect(
          find.byKey(ValueKey<String>('status-${status.name}-status')),
          findsOneWidget,
        );
      }

      // Invalid network src renders Image and falls back gracefully
      await tester.pumpWidget(
        wrap(
          const MagicAvatar(
            src: 'https://example.invalid/avatar.png',
            name: 'Alan Turing',
          ),
        ),
      );
      await tester.pump();
      expect(find.byType(Image), findsOneWidget);
    });

    testWidgets('MagicAvatarGroup enforces max overflow +N badge and spacing presets', (
      tester,
    ) async {
      const items = <AvatarGroupItem>[
        AvatarGroupItem(name: 'Ada Lovelace', color: ColorIntent.primary),
        AvatarGroupItem(name: 'Grace Hopper', color: ColorIntent.secondary),
        AvatarGroupItem(name: 'Alan Turing', color: ColorIntent.tertiary),
        AvatarGroupItem(name: 'Linus Torvalds', color: ColorIntent.success),
        AvatarGroupItem(name: 'Margaret Hamilton', color: ColorIntent.warning),
      ];

      await tester.pumpWidget(
        wrap(
          const MagicAvatarGroup(
            testId: 'group-normal',
            items: items,
            max: 3,
            spacing: AvatarGroupSpacing.normal,
          ),
        ),
      );

      expect(find.text('AL'), findsOneWidget);
      expect(find.text('GH'), findsOneWidget);
      expect(find.text('AT'), findsOneWidget);
      expect(find.text('LT'), findsNothing);
      expect(find.text('+2'), findsOneWidget);

      await tester.pumpWidget(
        wrap(
          const MagicAvatarGroup(
            testId: 'group-tight',
            items: items,
            max: 2,
            size: AtomicSize.lg,
            spacing: AvatarGroupSpacing.tight,
            disabled: true,
          ),
        ),
      );
      expect(find.text('+3'), findsOneWidget);

      // Empty group renders SizedBox.shrink
      await tester.pumpWidget(
        wrap(
          const MagicAvatarGroup(
            testId: 'empty-group',
            items: <AvatarGroupItem>[],
          ),
        ),
      );
      expect(find.byKey(const ValueKey<String>('empty-group')), findsOneWidget);
    });

    testWidgets('exposes accessible semantics for avatar and status', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await tester.pumpWidget(
        wrap(
          const MagicAvatar(
            name: 'Ada Lovelace',
            status: AvatarStatus.busy,
            statusLabel: 'In a meeting',
          ),
        ),
      );

      expect(
        find.bySemanticsLabel('Ada Lovelace (In a meeting)'),
        findsOneWidget,
      );
      handle.dispose();
    });
  });
}
