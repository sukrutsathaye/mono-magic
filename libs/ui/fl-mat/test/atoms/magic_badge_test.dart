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

  group('MagicBadge', () {
    testWidgets('renders int and string content on child', (tester) async {
      await tester.pumpWidget(
        wrap(
          const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              MagicBadge(
                content: 42,
                testId: 'badge-int',
                child: Icon(Icons.mail),
              ),
              MagicBadge(
                content: 'NEW',
                testId: 'badge-str',
                child: Icon(Icons.star),
              ),
            ],
          ),
        ),
      );

      expect(find.byKey(const ValueKey<String>('badge-int')), findsOneWidget);
      expect(find.text('42'), findsOneWidget);
      expect(find.byKey(const ValueKey<String>('badge-str')), findsOneWidget);
      expect(find.text('NEW'), findsOneWidget);
    });

    testWidgets('renders dot badge when content is null or empty', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              MagicBadge(
                testId: 'badge-dot-null',
                child: Icon(Icons.notifications),
              ),
              MagicBadge(
                content: '',
                testId: 'badge-dot-empty',
                child: Icon(Icons.notifications_none),
              ),
            ],
          ),
        ),
      );

      final dotNull = tester.widget<Badge>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('badge-dot-null')),
          matching: find.byType(Badge),
        ),
      );
      expect(dotNull.label, isNull);
      expect(dotNull.isLabelVisible, isTrue);

      final dotEmpty = tester.widget<Badge>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('badge-dot-empty')),
          matching: find.byType(Badge),
        ),
      );
      expect(dotEmpty.label, isNull);
      expect(dotEmpty.isLabelVisible, isTrue);
    });

    testWidgets('respects fallback anchor priority child -> icon -> label', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              MagicBadge(
                content: 1,
                icon: Icons.home,
                label: 'FallbackText',
                child: Text('ExplicitChild'),
              ),
              MagicBadge(
                content: 2,
                iconName: 'notifications',
                label: 'HiddenLabel',
              ),
              MagicBadge(
                content: 3,
                label: 'AnchorLabel',
              ),
              MagicBadge(
                content: 4,
              ),
            ],
          ),
        ),
      );

      expect(find.text('ExplicitChild'), findsOneWidget);
      expect(find.text('FallbackText'), findsNothing);
      expect(find.byIcon(Icons.notifications), findsOneWidget);
      expect(find.text('HiddenLabel'), findsNothing);
      expect(find.text('AnchorLabel'), findsOneWidget);
    });

    testWidgets('maps all 8 BadgePosition values and overlap toggle', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          Wrap(
            spacing: 24,
            runSpacing: 24,
            children: [
              for (final pos in BadgePosition.values)
                MagicBadge(
                  content: '1',
                  position: pos,
                  overlap: true,
                  testId: 'pos-overlap-${pos.name}',
                  child: const Icon(Icons.mail),
                ),
              for (final pos in BadgePosition.values)
                MagicBadge(
                  content: '2',
                  position: pos,
                  overlap: false,
                  testId: 'pos-nooverlap-${pos.name}',
                  child: const Icon(Icons.mail),
                ),
            ],
          ),
        ),
      );

      expect(find.byType(Badge), findsNWidgets(BadgePosition.values.length * 2));

      final aboveAfter = tester.widget<Badge>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('pos-overlap-aboveAfter')),
          matching: find.byType(Badge),
        ),
      );
      expect(aboveAfter.alignment, AlignmentDirectional.topEnd);

      final belowBefore = tester.widget<Badge>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('pos-nooverlap-belowBefore')),
          matching: find.byType(Badge),
        ),
      );
      expect(belowBefore.alignment, AlignmentDirectional.bottomStart);
      expect(belowBefore.offset, isNot(aboveAfter.offset));
    });

    testWidgets('hides badge label when hidden or disabled is true', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              MagicBadge(
                content: 5,
                hidden: true,
                child: Text('HiddenAnchor'),
              ),
              MagicBadge(
                content: 9,
                disabled: true,
                child: Text('DisabledAnchor'),
              ),
            ],
          ),
        ),
      );

      expect(find.text('HiddenAnchor'), findsOneWidget);
      expect(find.text('DisabledAnchor'), findsOneWidget);
      expect(find.text('5'), findsNothing);
      expect(find.text('9'), findsNothing);
    });

    testWidgets('resolves all 7 ColorIntent values and 5 AtomicSize steps', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final intent in ColorIntent.values)
                MagicBadge(
                  content: intent.name,
                  color: intent,
                  testId: 'intent-${intent.name}',
                  child: const Icon(Icons.circle),
                ),
              for (final size in AtomicSize.values)
                MagicBadge(
                  content: size.name,
                  size: size,
                  testId: 'size-${size.name}',
                  child: const Icon(Icons.star),
                ),
            ],
          ),
          theme: MagicTheme.darkTheme,
        ),
      );

      final successBadge = tester.widget<Badge>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('intent-success')),
          matching: find.byType(Badge),
        ),
      );
      expect(successBadge.backgroundColor, MagicSemanticColors.dark.success);
      expect(successBadge.textColor, MagicSemanticColors.dark.onSuccess);

      final xsBadge = tester.widget<Badge>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('size-xs')),
          matching: find.byType(Badge),
        ),
      );
      final xlBadge = tester.widget<Badge>(
        find.descendant(
          of: find.byKey(const ValueKey<String>('size-xl')),
          matching: find.byType(Badge),
        ),
      );
      expect(xsBadge.largeSize!, lessThan(xlBadge.largeSize!));
      expect(xsBadge.smallSize!, lessThan(xlBadge.smallSize!));
    });

    testWidgets('applies ariaLabel or description semantics', (tester) async {
      await tester.pumpWidget(
        wrap(
          const Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              MagicBadge(
                content: 3,
                description: '3 unread messages',
                child: Icon(Icons.mail),
              ),
              MagicBadge(
                content: 7,
                description: 'Fallback desc',
                ariaLabel: '7 alerts',
                child: Icon(Icons.warning),
              ),
            ],
          ),
        ),
      );

      expect(
        find.bySemanticsLabel(RegExp('3 unread messages')),
        findsOneWidget,
      );
      expect(find.bySemanticsLabel(RegExp('7 alerts')), findsOneWidget);
    });
  });
}
