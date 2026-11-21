import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('MagicTheme palettes and tokens', () {
    test('exposes all 7 Material 3 palettes with metadata and exact colors', () {
      final all = MagicTheme.allThemes;
      expect(all.length, 7);
      expect(MagicPaletteName.values.length, 7);

      expect(MagicPaletteName.azureBlue.id, 'azure-blue');
      expect(MagicPaletteName.azureBlue.displayName, 'Azure Blue (Light)');
      expect(MagicPaletteName.azureBlue.brightness, Brightness.light);

      expect(MagicPaletteName.lightTheme.id, 'light-theme');
      expect(MagicPaletteName.lightTheme.displayName, 'Violet / Orange (Light)');
      expect(MagicPaletteName.lightTheme.brightness, Brightness.light);

      expect(MagicPaletteName.darkTheme.id, 'dark-theme');
      expect(MagicPaletteName.darkTheme.displayName, 'Green / Orange (Dark)');
      expect(MagicPaletteName.darkTheme.brightness, Brightness.dark);

      expect(MagicPaletteName.roseRed.id, 'rose-red');
      expect(MagicPaletteName.roseRed.displayName, 'Rose Red (Light)');
      expect(MagicPaletteName.roseRed.brightness, Brightness.light);

      expect(MagicPaletteName.cyanOrange.id, 'cyan-orange');
      expect(MagicPaletteName.cyanOrange.displayName, 'Cyan Orange (Dark)');
      expect(MagicPaletteName.cyanOrange.brightness, Brightness.dark);

      expect(MagicPaletteName.orangeRed.id, 'orange-red');
      expect(MagicPaletteName.orangeRed.displayName, 'Orange Red (Light)');
      expect(MagicPaletteName.orangeRed.brightness, Brightness.light);

      expect(MagicPaletteName.magentaViolet.id, 'magenta-violet');
      expect(
        MagicPaletteName.magentaViolet.displayName,
        'Magenta Violet (Dark)',
      );
      expect(MagicPaletteName.magentaViolet.brightness, Brightness.dark);

      // Verify exact key tokens for every palette.
      final azure = MagicTheme.byPalette(MagicPaletteName.azureBlue);
      expect(azure.colorScheme.brightness, Brightness.light);
      expect(azure.colorScheme.primary, const Color(0xFF005CBB));
      expect(azure.colorScheme.primaryContainer, const Color(0xFFD7E3FF));
      expect(azure.colorScheme.secondary, const Color(0xFF565E71));
      expect(azure.colorScheme.secondaryContainer, const Color(0xFFDAE2F9));
      expect(azure.colorScheme.tertiary, const Color(0xFF343DFF));
      expect(azure.colorScheme.tertiaryContainer, const Color(0xFFE0E0FF));
      expect(azure.colorScheme.surface, const Color(0xFFFAF9FD));
      expect(
        azure.colorScheme.surfaceContainerHighest,
        const Color(0xFFE3E2E6),
      );
      expect(azure.colorScheme.onSurface, const Color(0xFF1A1B1F));
      expect(azure.colorScheme.outline, const Color(0xFF74777F));
      expect(azure.colorScheme.error, const Color(0xFFBA1A1A));
      expect(azure.colorScheme.onError, const Color(0xFFFFFFFF));
      expect(azure.colorScheme.errorContainer, const Color(0xFFFFDAD6));
      expect(azure.colorScheme.onErrorContainer, const Color(0xFF410002));

      final violet = MagicTheme.byPalette(MagicPaletteName.lightTheme);
      expect(violet.colorScheme.primary, const Color(0xFF7D00FA));
      expect(violet.colorScheme.tertiary, const Color(0xFF964900));

      final greenDark = MagicTheme.byPalette(MagicPaletteName.darkTheme);
      expect(greenDark.colorScheme.brightness, Brightness.dark);
      expect(greenDark.colorScheme.primary, const Color(0xFF02E600));
      expect(greenDark.colorScheme.primaryContainer, const Color(0xFF015300));
      expect(greenDark.colorScheme.surface, const Color(0xFF121410));
      expect(greenDark.colorScheme.error, const Color(0xFFFFB4AB));
      expect(greenDark.colorScheme.onError, const Color(0xFF690005));
      expect(greenDark.colorScheme.errorContainer, const Color(0xFF93000A));
      expect(greenDark.colorScheme.onErrorContainer, const Color(0xFFFFDAD6));

      final rose = MagicTheme.byPalette(MagicPaletteName.roseRed);
      expect(rose.colorScheme.primary, const Color(0xFFBA005C));
      expect(rose.colorScheme.tertiary, const Color(0xFFC00100));

      final cyan = MagicTheme.byPalette(MagicPaletteName.cyanOrange);
      expect(cyan.colorScheme.brightness, Brightness.dark);
      expect(cyan.colorScheme.primary, const Color(0xFF00DDDD));
      expect(cyan.colorScheme.tertiary, const Color(0xFFFFB787));

      final orange = MagicTheme.byPalette(MagicPaletteName.orangeRed);
      expect(orange.colorScheme.primary, const Color(0xFF964900));
      expect(orange.colorScheme.surface, const Color(0xFFFFF8F5));

      final magenta = MagicTheme.byPalette(MagicPaletteName.magentaViolet);
      expect(magenta.colorScheme.brightness, Brightness.dark);
      expect(magenta.colorScheme.primary, const Color(0xFFFFABF3));
      expect(magenta.colorScheme.tertiary, const Color(0xFFD5BAFF));

      for (final entry in all.entries) {
        expect(entry.value.colorScheme.brightness, entry.key.brightness);
        expect(entry.value.extension<MagicSemanticColors>(), isNotNull);
      }
    });

    test('MagicSemanticColors supports copyWith, lerp, and value equality', () {
      const light = MagicSemanticColors.light;
      const dark = MagicSemanticColors.dark;

      expect(light.success, const Color(0xFF1B6E3A));
      expect(light.onSuccess, const Color(0xFFFFFFFF));
      expect(light.successContainer, const Color(0xFFA0F5B4));
      expect(light.onSuccessContainer, const Color(0xFF00210C));
      expect(light.warning, const Color(0xFF8A5100));
      expect(light.warningContainer, const Color(0xFFFFDCBD));

      expect(dark.success, const Color(0xFF7FDC99));
      expect(dark.onSuccess, const Color(0xFF00391A));
      expect(dark.successContainer, const Color(0xFF00522A));
      expect(dark.warning, const Color(0xFFFFB870));
      expect(dark.warningContainer, const Color(0xFF693C00));

      final copied = light.copyWith(success: const Color(0xFF00AA00));
      expect(copied.success, const Color(0xFF00AA00));
      expect(copied.warning, light.warning);
      expect(copied == light, isFalse);

      final unchanged = light.copyWith();
      expect(unchanged, equals(light));
      expect(unchanged.hashCode, equals(light.hashCode));

      expect(light.lerp(null, 0.5), equals(light));
      expect(light.lerp(dark, 0.0), equals(light));
      expect(light.lerp(dark, 1.0), equals(dark));

      final mid = light.lerp(dark, 0.5);
      expect(mid.success, Color.lerp(light.success, dark.success, 0.5));
      expect(mid.warning, Color.lerp(light.warning, dark.warning, 0.5));
      expect(mid.neutral, Color.lerp(light.neutral, dark.neutral, 0.5));
    });

    testWidgets('resolveIntent resolves all 7 intents with extension attached',
        (tester) async {
      final resolvedLight = <ColorIntent, MagicIntentColorSet>{};

      await tester.pumpWidget(
        MaterialApp(
          theme: MagicTheme.azureBlue,
          home: Builder(
            builder: (context) {
              for (final intent in ColorIntent.values) {
                resolvedLight[intent] = MagicTheme.resolveIntent(
                  context,
                  intent,
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ),
      );

      expect(
        resolvedLight[ColorIntent.primary]?.main,
        const Color(0xFF005CBB),
      );
      expect(
        resolvedLight[ColorIntent.secondary]?.main,
        const Color(0xFF565E71),
      );
      expect(
        resolvedLight[ColorIntent.tertiary]?.main,
        const Color(0xFF343DFF),
      );
      expect(
        resolvedLight[ColorIntent.success]?.main,
        const Color(0xFF1B6E3A),
      );
      expect(
        resolvedLight[ColorIntent.warning]?.main,
        const Color(0xFF8A5100),
      );
      expect(
        resolvedLight[ColorIntent.error]?.main,
        const Color(0xFFBA1A1A),
      );
      expect(
        resolvedLight[ColorIntent.neutral]?.container,
        const Color(0xFFE3E2E6),
      );

      // Value equality on MagicIntentColorSet.
      final primarySet = resolvedLight[ColorIntent.primary]!;
      expect(
        primarySet,
        equals(
          MagicIntentColorSet(
            main: primarySet.main,
            onMain: primarySet.onMain,
            container: primarySet.container,
            onContainer: primarySet.onContainer,
          ),
        ),
      );
      expect(
        primarySet.hashCode,
        equals(
          MagicIntentColorSet(
            main: primarySet.main,
            onMain: primarySet.onMain,
            container: primarySet.container,
            onContainer: primarySet.onContainer,
          ).hashCode,
        ),
      );
    });

    testWidgets(
      'resolveIntent safely falls back when ThemeData omits MagicSemanticColors',
      (tester) async {
        late MagicIntentColorSet darkSuccess;
        late MagicIntentColorSet darkWarning;
        late MagicIntentColorSet darkNeutral;

        await tester.pumpWidget(
          MaterialApp(
            theme: ThemeData.dark(useMaterial3: true),
            home: Builder(
              builder: (context) {
                darkSuccess = MagicTheme.resolveIntent(
                  context,
                  ColorIntent.success,
                );
                darkWarning = MagicTheme.resolveIntent(
                  context,
                  ColorIntent.warning,
                );
                darkNeutral = MagicTheme.resolveIntent(
                  context,
                  ColorIntent.neutral,
                );
                return const SizedBox.shrink();
              },
            ),
          ),
        );

        expect(darkSuccess.main, const Color(0xFF7FDC99));
        expect(darkWarning.main, const Color(0xFFFFB870));
        expect(darkNeutral.onContainer, isNotNull);
      },
    );

    test('metricsFor returns exact metrics for all 5 AtomicSize values', () {
      expect(
        MagicTheme.metricsFor(AtomicSize.xs),
        const MagicSizeMetrics(
          height: 28,
          fontSize: 12,
          iconSize: 16,
          horizontalPadding: 12,
          verticalPadding: 4,
        ),
      );
      expect(
        MagicTheme.metricsFor(AtomicSize.sm),
        const MagicSizeMetrics(
          height: 32,
          fontSize: 13,
          iconSize: 18,
          horizontalPadding: 14,
          verticalPadding: 6,
        ),
      );
      expect(
        MagicTheme.metricsFor(AtomicSize.md),
        const MagicSizeMetrics(
          height: 40,
          fontSize: 14,
          iconSize: 18,
          horizontalPadding: 24,
          verticalPadding: 10,
        ),
      );
      expect(
        MagicTheme.metricsFor(AtomicSize.lg),
        const MagicSizeMetrics(
          height: 48,
          fontSize: 16,
          iconSize: 22,
          horizontalPadding: 28,
          verticalPadding: 12,
        ),
      );
      expect(
        MagicTheme.metricsFor(AtomicSize.xl),
        const MagicSizeMetrics(
          height: 56,
          fontSize: 18,
          iconSize: 24,
          horizontalPadding: 32,
          verticalPadding: 16,
        ),
      );
      expect(
        MagicTheme.metricsFor(AtomicSize.md).hashCode,
        const MagicSizeMetrics(
          height: 40,
          fontSize: 14,
          iconSize: 18,
          horizontalPadding: 24,
          verticalPadding: 10,
        ).hashCode,
      );
    });

    test('borderRadiusFor returns expected radius for all ButtonShape values',
        () {
      expect(MagicTheme.borderRadiusFor(ButtonShape.standard), isNull);
      expect(MagicTheme.borderRadiusFor(ButtonShape.square), BorderRadius.zero);
      expect(
        MagicTheme.borderRadiusFor(ButtonShape.rounded),
        const BorderRadius.all(Radius.circular(8)),
      );
      expect(
        MagicTheme.borderRadiusFor(ButtonShape.pill),
        const BorderRadius.all(Radius.circular(999)),
      );
    });
  });

  group('MagicIcon', () {
    test('resolveMagicIconData maps >= 70 names and normalizes input', () {
      expect(magicIconMap.length, greaterThanOrEqualTo(70));
      expect(resolveMagicIconData(icon: Icons.home, iconName: 'search'), Icons.home);
      expect(resolveMagicIconData(iconName: 'search'), Icons.search);
      expect(resolveMagicIconData(iconName: 'more-vert'), Icons.more_vert);
      expect(resolveMagicIconData(iconName: '  Check Circle  '), Icons.check_circle);
      expect(resolveMagicIconData(iconName: ''), isNull);
      expect(resolveMagicIconData(iconName: 'does_not_exist_xyz'), isNull);
      expect(resolveMagicIconData(), isNull);
    });

    testWidgets('renders IconData, iconName, customIcon, fallbackIcon, or empty',
        (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                MagicIcon(icon: Icons.star, size: 20, color: Colors.amber),
                MagicIcon(iconName: 'arrow-forward', semanticLabel: 'Next'),
                MagicIcon(
                  iconName: 'unknown_icon',
                  fallbackIcon: Icons.help_outline,
                ),
                MagicIcon(
                  key: ValueKey<String>('empty-icon'),
                  iconName: 'unknown_icon',
                ),
                MagicIcon(
                  customIcon: Icon(Icons.bolt),
                  size: 28,
                  semanticLabel: 'Custom Bolt',
                ),
              ],
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.star), findsOneWidget);
      expect(find.byIcon(Icons.arrow_forward), findsOneWidget);
      expect(find.byIcon(Icons.help_outline), findsOneWidget);
      expect(find.byIcon(Icons.bolt), findsOneWidget);
      expect(
        find.descendant(
          of: find.byKey(const ValueKey<String>('empty-icon')),
          matching: find.byType(SizedBox),
        ),
        findsOneWidget,
      );
      expect(
        find.descendant(
          of: find.byKey(const ValueKey<String>('empty-icon')),
          matching: find.byType(Icon),
        ),
        findsNothing,
      );
    });
  });

  group('MagicFormFieldScope', () {
    testWidgets('maybeOf returns null outside scope and scope inside tree',
        (tester) async {
      MagicFormFieldScope? outside;
      MagicFormFieldScope? inside;

      await tester.pumpWidget(
        MaterialApp(
          home: Column(
            children: [
              Builder(
                builder: (context) {
                  outside = MagicFormFieldScope.maybeOf(context);
                  return const SizedBox.shrink();
                },
              ),
              MagicFormFieldScope(
                label: 'Email',
                hint: 'Enter your work email',
                errorText: 'Invalid email',
                appearance: FormFieldAppearance.filled,
                size: AtomicSize.sm,
                floatLabel: FormFieldFloatLabel.always,
                subscriptSizing: FormFieldSubscriptSizing.dynamic,
                requiredField: true,
                prefix: const Icon(Icons.email),
                suffix: const Icon(Icons.clear),
                child: Builder(
                  builder: (context) {
                    inside = MagicFormFieldScope.maybeOf(context);
                    return const SizedBox.shrink();
                  },
                ),
              ),
            ],
          ),
        ),
      );

      expect(outside, isNull);
      expect(inside, isNotNull);
      expect(inside!.hasError, isTrue);

      final decoration = inside!.buildDecoration(placeholder: 'ada@acme.com');
      expect(decoration.labelText, 'Email *');
      expect(decoration.hintText, 'ada@acme.com');
      expect(decoration.helperText, isNull);
      expect(decoration.errorText, 'Invalid email');
      expect(decoration.filled, isTrue);
      expect(decoration.isDense, isTrue);
      expect(decoration.floatingLabelBehavior, FloatingLabelBehavior.always);
      expect(decoration.border, isA<UnderlineInputBorder>());
      expect(decoration.helperMaxLines, 3);
      expect(decoration.errorMaxLines, 3);
      expect(decoration.prefixIcon, isNotNull);
      expect(decoration.suffixIcon, isNotNull);
    });

    test('buildDecoration handles outlined, hideRequiredMarker, and overrides',
        () {
      const scope = MagicFormFieldScope(
        label: 'Username',
        hint: '3-20 characters',
        hideRequiredMarker: true,
        requiredField: true,
        child: SizedBox.shrink(),
      );

      expect(scope.hasError, isFalse);

      final decoration = scope.buildDecoration(
        disabledOverride: true,
        suffixOverride: const Icon(Icons.check),
      );
      expect(decoration.labelText, 'Username');
      expect(decoration.helperText, '3-20 characters');
      expect(decoration.errorText, isNull);
      expect(decoration.filled, isFalse);
      expect(decoration.isDense, isFalse);
      expect(decoration.enabled, isFalse);
      expect(decoration.border, isA<OutlineInputBorder>());
      expect(decoration.helperMaxLines, 1);
      expect(decoration.suffixIcon, isA<Icon>());

      const sameScope = MagicFormFieldScope(
        label: 'Username',
        hint: '3-20 characters',
        hideRequiredMarker: true,
        requiredField: true,
        child: SizedBox.shrink(),
      );
      const changedScope = MagicFormFieldScope(
        label: 'Handle',
        hint: '3-20 characters',
        hideRequiredMarker: true,
        requiredField: true,
        child: SizedBox.shrink(),
      );
      expect(scope.updateShouldNotify(sameScope), isFalse);
      expect(scope.updateShouldNotify(changedScope), isTrue);
    });
  });

  group('Atomic interface contracts', () {
    test('copyWith and constructors work across all 16-component models', () {
      const task = CheckBoxTask(
        id: 't1',
        name: 'Parent',
        subtasks: [CheckBoxTask(id: 't1-1', name: 'Child')],
      );
      final updatedTask = task.copyWith(checked: true);
      expect(updatedTask.id, 't1');
      expect(updatedTask.name, 'Parent');
      expect(updatedTask.checked, isTrue);
      expect(updatedTask.subtasks.length, 1);

      const chip = ChipItem(
        id: 'c1',
        label: 'Flutter',
        leadingIconName: 'bolt',
      );
      final selectedChip = chip.copyWith(selected: true, removable: true);
      expect(selectedChip.label, 'Flutter');
      expect(selectedChip.selected, isTrue);
      expect(selectedChip.removable, isTrue);

      const btnProps = MagicButtonProps(
        label: 'Save',
        kind: ButtonKind.extendedFab,
        shape: ButtonShape.pill,
        loadingLabel: 'Saving...',
      );
      expect(btnProps.kind, ButtonKind.extendedFab);
      expect(btnProps.shape, ButtonShape.pill);

      const inputControl = MagicTextInputControlProps(
        type: TextInputTypeKind.email,
        name: 'email',
        placeholder: 'you@example.com',
        requiredField: true,
        maxLength: 100,
      );
      expect(inputControl.type, TextInputTypeKind.email);
      expect(inputControl.requiredField, isTrue);

      const toggleOpt = ButtonToggleOption<String>(
        value: 'bold',
        label: 'Bold',
        iconName: 'format_bold',
      );
      expect(toggleOpt.value, 'bold');

      const radioOpt = RadioOption<int>(value: 1, label: 'One');
      expect(radioOpt.value, 1);

      const cardAction = CardActionItem(label: 'Open', iconName: 'open_in_new');
      expect(cardAction.label, 'Open');

      const menuItem = MenuItemData(
        label: 'File',
        children: [MenuItemData(label: 'New')],
      );
      expect(menuItem.children.single.label, 'New');

      const selectGroup = SelectOptionGroup<String>(
        label: 'Fruits',
        options: [SelectOption<String>(value: 'apple', label: 'Apple')],
      );
      expect(selectGroup.options.single.value, 'apple');
    });
  });
}
