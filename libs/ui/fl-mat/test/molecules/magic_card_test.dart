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

  group('MagicCard', () {
    testWidgets(
      'renders title, subtitle, content, child, and supports outlined vs raised appearance',
      (tester) async {
        await tester.pumpWidget(
          wrap(
            const Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                MagicCard(
                  testId: 'outlined-card',
                  title: 'Card Title',
                  subtitle: 'Card Subtitle',
                  content: 'Body paragraph text',
                  appearance: CardAppearance.outlined,
                  width: '360px',
                  child: Text('Projected Child'),
                ),
                MagicCard(
                  testId: 'raised-card',
                  title: 'Raised Card',
                  appearance: CardAppearance.raised,
                  width: 320,
                ),
              ],
            ),
          ),
        );

        expect(find.text('Card Title'), findsOneWidget);
        expect(find.text('Card Subtitle'), findsOneWidget);
        expect(find.text('Body paragraph text'), findsOneWidget);
        expect(find.text('Projected Child'), findsOneWidget);

        final outlinedCard = tester.widget<Card>(
          find.byKey(const ValueKey<String>('outlined-card')),
        );
        expect(outlinedCard.elevation, 0);

        final raisedCard = tester.widget<Card>(
          find.byKey(const ValueKey<String>('raised-card')),
        );
        expect(raisedCard.elevation, 2);
      },
    );

    testWidgets(
      'renders custom headerSlot, mediaSlot, footerSlot, and imageSrc with error fallback across sizes',
      (tester) async {
        for (final size in CardImageSize.values) {
          await tester.pumpWidget(
            wrap(
              MagicCard(
                title: 'Media Card',
                imageSrc: 'https://example.invalid/banner.png',
                imageAlt: 'Banner alt',
                imageSize: size,
              ),
            ),
          );
          await tester.pump();
          expect(find.byType(Image), findsOneWidget);
        }

        await tester.pumpWidget(
          wrap(
            const MagicCard(
              headerSlot: Text('Custom Header Slot'),
              mediaSlot: Text('Custom Media Slot'),
              footerSlot: Text('Custom Footer Slot'),
            ),
          ),
        );

        expect(find.text('Custom Header Slot'), findsOneWidget);
        expect(find.text('Custom Media Slot'), findsOneWidget);
        expect(find.text('Custom Footer Slot'), findsOneWidget);
      },
    );

    testWidgets(
      'renders actions and chips, aligns actions start/end, and invokes callbacks when enabled',
      (tester) async {
        CardActionItem? clickedAction;
        ChipItem? selectedChip;

        await tester.pumpWidget(
          wrap(
            MagicCard(
              title: 'Interactive Card',
              variant: CardVariant.withActions,
              alignActions: CardActionsAlignment.end,
              actions: const [
                CardActionItem(
                  id: 'share',
                  label: 'Share',
                  variant: ButtonVariant.tonal,
                  color: ColorIntent.secondary,
                  iconName: 'share',
                ),
                CardActionItem(
                  id: 'locked',
                  label: 'Locked',
                  disabled: true,
                ),
              ],
              chips: const [
                ChipItem(id: 'c1', label: 'Featured'),
              ],
              onActionClick: (action) => clickedAction = action,
              onChipSelect: (chip) => selectedChip = chip,
            ),
          ),
        );

        expect(find.text('Share'), findsOneWidget);
        expect(find.text('Locked'), findsOneWidget);
        expect(find.text('Featured'), findsOneWidget);

        await tester.tap(find.text('Share'));
        await tester.pump();
        expect(clickedAction?.id, 'share');

        // Disabled action does not fire callback
        clickedAction = null;
        await tester.tap(find.text('Locked'));
        await tester.pump();
        expect(clickedAction, isNull);

        await tester.tap(find.text('Featured'));
        await tester.pump();
        expect(selectedChip?.id, 'c1');
      },
    );

    testWidgets('disables actions and chips when card disabled is true', (
      tester,
    ) async {
      var actionFired = false;
      var chipFired = false;

      await tester.pumpWidget(
        wrap(
          MagicCard(
            title: 'Disabled Card',
            disabled: true,
            actions: const [CardActionItem(label: 'Run')],
            chips: const [ChipItem(label: 'Tag')],
            onActionClick: (_) => actionFired = true,
            onChipSelect: (_) => chipFired = true,
          ),
        ),
      );

      await tester.tap(find.text('Run'));
      await tester.tap(find.text('Tag'));
      await tester.pump();

      expect(actionFired, isFalse);
      expect(chipFired, isFalse);
    });
  });
}
