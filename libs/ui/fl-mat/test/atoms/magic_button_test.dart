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

  group('MagicButton variants, intents, sizes, and shapes', () {
    testWidgets('renders all 5 ButtonVariant widgets and fires onPressed', (
      tester,
    ) async {
      var taps = 0;

      await tester.pumpWidget(
        wrap(
          Wrap(
            spacing: 8,
            children: [
              for (final variant in ButtonVariant.values)
                MagicButton(
                  label: variant.name,
                  variant: variant,
                  testId: 'variant-${variant.name}',
                  onPressed: () => taps++,
                ),
            ],
          ),
        ),
      );

      expect(find.byType(FilledButton), findsNWidgets(2));
      expect(find.byType(OutlinedButton), findsOneWidget);
      expect(find.byType(ElevatedButton), findsOneWidget);
      expect(find.byType(TextButton), findsOneWidget);

      for (final variant in ButtonVariant.values) {
        await tester.tap(find.byKey(ValueKey<String>('variant-${variant.name}')));
      }
      expect(taps, ButtonVariant.values.length);
    });

    testWidgets('resolves all 7 ColorIntent values dynamically from MagicTheme', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          Wrap(
            spacing: 8,
            children: [
              for (final intent in ColorIntent.values)
                MagicButton(
                  label: intent.name,
                  color: intent,
                  testId: 'intent-${intent.name}',
                  onPressed: () {},
                ),
            ],
          ),
          theme: MagicTheme.darkTheme,
        ),
      );

      final successButton = tester.widget<FilledButton>(
        find.byKey(const ValueKey<String>('intent-success')),
      );
      expect(
        successButton.style?.backgroundColor?.resolve(<WidgetState>{}),
        MagicSemanticColors.dark.success,
      );

      final warningButton = tester.widget<FilledButton>(
        find.byKey(const ValueKey<String>('intent-warning')),
      );
      expect(
        warningButton.style?.backgroundColor?.resolve(<WidgetState>{}),
        MagicSemanticColors.dark.warning,
      );

      final errorButton = tester.widget<FilledButton>(
        find.byKey(const ValueKey<String>('intent-error')),
      );
      expect(
        errorButton.style?.backgroundColor?.resolve(<WidgetState>{}),
        MagicTheme.darkTheme.colorScheme.error,
      );
    });

    testWidgets('applies all 5 AtomicSize metrics and all 4 ButtonShape radii', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final size in AtomicSize.values)
                MagicButton(
                  label: size.name,
                  size: size,
                  testId: 'size-${size.name}',
                  onPressed: () {},
                ),
              for (final shape in ButtonShape.values)
                MagicButton(
                  label: shape.name,
                  shape: shape,
                  testId: 'shape-${shape.name}',
                  onPressed: () {},
                ),
            ],
          ),
        ),
      );

      for (final size in AtomicSize.values) {
        final btn = tester.widget<FilledButton>(
          find.byKey(ValueKey<String>('size-${size.name}')),
        );
        final expectedMetrics = MagicTheme.metricsFor(size);
        expect(
          btn.style?.minimumSize?.resolve(<WidgetState>{})?.height,
          expectedMetrics.height,
        );
      }

      final squareBtn = tester.widget<FilledButton>(
        find.byKey(const ValueKey<String>('shape-square')),
      );
      final squareShape =
          squareBtn.style?.shape?.resolve(<WidgetState>{})
              as RoundedRectangleBorder?;
      expect(squareShape?.borderRadius, BorderRadius.zero);

      final roundedBtn = tester.widget<FilledButton>(
        find.byKey(const ValueKey<String>('shape-rounded')),
      );
      final roundedShape =
          roundedBtn.style?.shape?.resolve(<WidgetState>{})
              as RoundedRectangleBorder?;
      expect(
        roundedShape?.borderRadius,
        const BorderRadius.all(Radius.circular(8)),
      );

      final pillBtn = tester.widget<FilledButton>(
        find.byKey(const ValueKey<String>('shape-pill')),
      );
      final pillShape =
          pillBtn.style?.shape?.resolve(<WidgetState>{})
              as RoundedRectangleBorder?;
      expect(
        pillShape?.borderRadius,
        const BorderRadius.all(Radius.circular(999)),
      );
    });
  });

  group('MagicButton kinds (icon, fab, miniFab, extendedFab)', () {
    testWidgets('renders ButtonKind.icon across all 5 variants with tooltip', (
      tester,
    ) async {
      var taps = 0;

      await tester.pumpWidget(
        wrap(
          Wrap(
            spacing: 8,
            children: [
              for (final variant in ButtonVariant.values)
                MagicButton(
                  kind: ButtonKind.icon,
                  variant: variant,
                  label: 'Action ${variant.name}',
                  leadingIconName: 'settings',
                  shape: ButtonShape.rounded,
                  testId: 'icon-${variant.name}',
                  onPressed: () => taps++,
                ),
            ],
          ),
        ),
      );

      expect(find.byType(IconButton), findsNWidgets(ButtonVariant.values.length));
      expect(find.byIcon(Icons.settings), findsNWidgets(ButtonVariant.values.length));

      final filledIcon = tester.widget<IconButton>(
        find.byKey(const ValueKey<String>('icon-filled')),
      );
      expect(filledIcon.tooltip, 'Action filled');

      await tester.tap(find.byKey(const ValueKey<String>('icon-outlined')));
      expect(taps, 1);
    });

    testWidgets(
      'renders multiple FABs (fab, miniFab, extendedFab) simultaneously without Hero conflicts',
      (tester) async {
        var fabTaps = 0;
        var miniTaps = 0;
        var extTaps = 0;

        await tester.pumpWidget(
          wrap(
            Wrap(
              spacing: 12,
              children: [
                MagicButton(
                  kind: ButtonKind.fab,
                  label: 'Add Item',
                  leadingIcon: Icons.add,
                  color: ColorIntent.primary,
                  shape: ButtonShape.pill,
                  testId: 'fab-std',
                  onPressed: () => fabTaps++,
                ),
                MagicButton(
                  kind: ButtonKind.miniFab,
                  variant: ButtonVariant.tonal,
                  label: 'Edit',
                  leadingIconName: 'edit',
                  color: ColorIntent.secondary,
                  testId: 'fab-mini',
                  onPressed: () => miniTaps++,
                ),
                MagicButton(
                  kind: ButtonKind.extendedFab,
                  variant: ButtonVariant.outlined,
                  label: 'Compose',
                  leadingIconName: 'send',
                  trailingIcon: Icons.chevron_right,
                  color: ColorIntent.tertiary,
                  testId: 'fab-ext',
                  onPressed: () => extTaps++,
                ),
                const MagicButton(
                  kind: ButtonKind.fab,
                  variant: ButtonVariant.elevated,
                  loading: true,
                  label: 'Loading FAB',
                  testId: 'fab-loading',
                ),
                const MagicButton(
                  kind: ButtonKind.miniFab,
                  loading: true,
                  label: 'Loading Mini',
                  testId: 'fab-mini-loading',
                ),
                const MagicButton(
                  kind: ButtonKind.extendedFab,
                  loading: true,
                  label: 'Save',
                  loadingLabel: 'Saving...',
                  testId: 'fab-ext-loading',
                ),
              ],
            ),
          ),
        );

        expect(tester.takeException(), isNull);
        expect(find.byType(FloatingActionButton), findsNWidgets(6));
        expect(find.text('Compose'), findsOneWidget);
        expect(find.text('Saving...'), findsOneWidget);
        expect(find.byIcon(Icons.send), findsOneWidget);
        expect(find.byIcon(Icons.chevron_right), findsOneWidget);

        await tester.tap(find.byKey(const ValueKey<String>('fab-std')));
        await tester.tap(find.byKey(const ValueKey<String>('fab-mini')));
        await tester.tap(find.byKey(const ValueKey<String>('fab-ext')));
        expect(fabTaps, 1);
        expect(miniTaps, 1);
        expect(extTaps, 1);
      },
    );
  });

  group('MagicButton icons, loading, interaction, layout, and child slot', () {
    testWidgets('renders IconData and string-name leading/trailing icons', (
      tester,
    ) async {
      await tester.pumpWidget(
        wrap(
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              MagicButton(
                label: 'Native Icons',
                leadingIcon: Icons.download,
                trailingIcon: Icons.arrow_forward,
                onPressed: () {},
              ),
              MagicButton(
                label: 'Named Icons',
                leadingIconName: 'cloud-upload',
                trailingIconName: 'check_circle',
                onPressed: () {},
              ),
            ],
          ),
        ),
      );

      expect(find.byIcon(Icons.download), findsOneWidget);
      expect(find.byIcon(Icons.arrow_forward), findsOneWidget);
      expect(find.byIcon(Icons.cloud_upload), findsOneWidget);
      expect(find.byIcon(Icons.check_circle), findsOneWidget);
    });

    testWidgets('shows loadingLabel and CircularProgressIndicator when loading', (
      tester,
    ) async {
      var taps = 0;

      await tester.pumpWidget(
        wrap(
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              MagicButton(
                label: 'Submit',
                loading: true,
                loadingLabel: 'Submitting...',
                testId: 'std-loading',
                onPressed: () => taps++,
              ),
              MagicButton(
                kind: ButtonKind.icon,
                label: 'Refresh',
                leadingIcon: Icons.refresh,
                loading: true,
                testId: 'icon-loading',
                onPressed: () => taps++,
              ),
            ],
          ),
        ),
      );

      expect(find.text('Submitting...'), findsOneWidget);
      expect(find.text('Submit'), findsNothing);
      expect(find.byType(CircularProgressIndicator), findsNWidgets(2));

      await tester.tap(find.byKey(const ValueKey<String>('std-loading')));
      await tester.tap(find.byKey(const ValueKey<String>('icon-loading')));
      expect(taps, 0);
    });

    testWidgets(
      'supports disabled, disabledInteractive focusability, disableRipple, fullWidth, and child slot',
      (tester) async {
        var taps = 0;
        final focusNode = FocusNode();
        addTearDown(focusNode.dispose);

        await tester.pumpWidget(
          wrap(
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                MagicButton(
                  label: 'Hard Disabled',
                  disabled: true,
                  testId: 'hard-disabled',
                  onPressed: () => taps++,
                ),
                MagicButton(
                  label: 'Interactive Disabled',
                  disabled: true,
                  disabledInteractive: true,
                  focusNode: focusNode,
                  testId: 'interactive-disabled',
                  onPressed: () => taps++,
                ),
                MagicButton(
                  label: 'No Ripple Full Width',
                  disableRipple: true,
                  fullWidth: true,
                  testId: 'no-ripple-full',
                  onPressed: () => taps++,
                ),
                MagicButton(
                  ariaLabel: 'Custom Slot Button',
                  testId: 'custom-child',
                  onPressed: () => taps++,
                  child: const Text('Custom Child Content'),
                ),
              ],
            ),
          ),
        );

        // Hard disabled suppresses taps.
        await tester.tap(find.byKey(const ValueKey<String>('hard-disabled')));
        expect(taps, 0);

        // disabledInteractive remains focusable while suppressing onPressed.
        focusNode.requestFocus();
        await tester.pump();
        expect(focusNode.hasFocus, isTrue);
        await tester.tap(
          find.byKey(const ValueKey<String>('interactive-disabled')),
        );
        expect(taps, 0);

        // disableRipple uses NoSplash.splashFactory and fullWidth fills parent.
        final noRippleBtn = tester.widget<FilledButton>(
          find.byKey(const ValueKey<String>('no-ripple-full')),
        );
        expect(noRippleBtn.style?.splashFactory, NoSplash.splashFactory);
        final fullSize = tester.getSize(
          find.byKey(const ValueKey<String>('no-ripple-full')),
        );
        expect(fullSize.width, 800);

        // Custom child renders and triggers callback.
        expect(find.text('Custom Child Content'), findsOneWidget);
        await tester.tap(find.byKey(const ValueKey<String>('custom-child')));
        expect(taps, 1);
      },
    );

    testWidgets(
      'supports disabledInteractive, disableRipple, and variants on icon and FAB kinds',
      (tester) async {
        var taps = 0;
        final iconFocus = FocusNode();
        final fabFocus = FocusNode();
        addTearDown(iconFocus.dispose);
        addTearDown(fabFocus.dispose);

        await tester.pumpWidget(
          wrap(
            Wrap(
              spacing: 12,
              children: [
                MagicButton(
                  kind: ButtonKind.icon,
                  variant: ButtonVariant.elevated,
                  label: 'Disabled Icon',
                  leadingIcon: Icons.star,
                  disabled: true,
                  disabledInteractive: true,
                  focusNode: iconFocus,
                  testId: 'icon-disabled-interactive',
                  onPressed: () => taps++,
                ),
                MagicButton(
                  kind: ButtonKind.fab,
                  variant: ButtonVariant.text,
                  label: 'Disabled FAB',
                  leadingIcon: Icons.bolt,
                  disabled: true,
                  disabledInteractive: true,
                  disableRipple: true,
                  focusNode: fabFocus,
                  testId: 'fab-disabled-interactive',
                  onPressed: () => taps++,
                ),
                MagicButton(
                  kind: ButtonKind.standard,
                  variant: ButtonVariant.outlined,
                  color: ColorIntent.neutral,
                  label: 'Neutral Outlined Disabled',
                  disabled: true,
                  disabledInteractive: true,
                  testId: 'std-outlined-disabled-interactive',
                  onPressed: () => taps++,
                ),
              ],
            ),
          ),
        );

        iconFocus.requestFocus();
        await tester.pump();
        expect(iconFocus.hasFocus, isTrue);

        fabFocus.requestFocus();
        await tester.pump();
        expect(fabFocus.hasFocus, isTrue);

        await tester.tap(
          find.byKey(const ValueKey<String>('icon-disabled-interactive')),
        );
        await tester.tap(
          find.byKey(const ValueKey<String>('fab-disabled-interactive')),
        );
        await tester.tap(
          find.byKey(const ValueKey<String>('std-outlined-disabled-interactive')),
        );
        expect(taps, 0);
      },
    );
  });
}
