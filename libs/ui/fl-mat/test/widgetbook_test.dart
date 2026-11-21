import 'package:fl_mat/fl_mat.dart';
import 'package:fl_mat/widgetbook.dart';
import 'package:fl_mat/widgetbook/atoms/badge_use_cases.dart';
import 'package:fl_mat/widgetbook/atoms/button_toggle_use_cases.dart';
import 'package:fl_mat/widgetbook/atoms/button_use_cases.dart';
import 'package:fl_mat/widgetbook/atoms/check_box_use_cases.dart';
import 'package:fl_mat/widgetbook/atoms/chip_use_cases.dart';
import 'package:fl_mat/widgetbook/atoms/progress_indicator_use_cases.dart';
import 'package:fl_mat/widgetbook/atoms/radio_button_use_cases.dart';
import 'package:fl_mat/widgetbook/atoms/slide_toggle_use_cases.dart';
import 'package:fl_mat/widgetbook/atoms/slider_use_cases.dart';
import 'package:fl_mat/widgetbook/atoms/text_input_use_cases.dart';
import 'package:fl_mat/widgetbook/atoms/tool_tip_use_cases.dart';
import 'package:fl_mat/widgetbook/molecules/card_use_cases.dart';
import 'package:fl_mat/widgetbook/molecules/form_field_use_cases.dart';
import 'package:fl_mat/widgetbook/molecules/menu_use_cases.dart';
import 'package:fl_mat/widgetbook/molecules/search_bar_use_cases.dart';
import 'package:fl_mat/widgetbook/molecules/select_use_cases.dart';
import 'package:fl_mat/widgetbook/widgetbook_helpers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:widgetbook/widgetbook.dart';

/// Wraps a Widgetbook use-case [builder] inside a [MaterialApp] and
/// [WidgetbookScope] so `context.knobs.*` calls resolve cleanly in widget tests.
Widget _wrapUseCase(WidgetBuilder builder) {
  final state = WidgetbookState(
    root: WidgetbookRoot(children: const <WidgetbookNode>[]),
  );
  return MaterialApp(
    theme: MagicTheme.azureBlue,
    home: Scaffold(
      body: WidgetbookScope(
        state: state,
        child: Builder(builder: builder),
      ),
    ),
  );
}

void main() {
  group('MagicWidgetbookApp & Catalog Use Cases', () {
    test('defines all 7 Material 3 themes and 4 viewports', () {
      expect(magicWidgetbookThemes, hasLength(7));
      expect(
        magicWidgetbookThemes.map((t) => t.name).toList(),
        <String>[
          'Azure Blue (Light)',
          'Violet / Orange (Light)',
          'Green / Orange (Dark)',
          'Rose Red (Light)',
          'Cyan Orange (Dark)',
          'Orange Red (Light)',
          'Magenta Violet (Dark)',
        ],
      );
      expect(magicWidgetbookViewports, hasLength(4));
      expect(magicWidgetbookViewports.first, Viewports.none);
    });

    test('all 11 atom and 5 molecule builders register expected use cases', () {
      final atomComponents = <WidgetbookComponent>[
        buildBadgeComponent(),
        buildButtonComponent(),
        buildButtonToggleComponent(),
        buildCheckBoxComponent(),
        buildChipComponent(),
        buildProgressIndicatorComponent(),
        buildRadioButtonComponent(),
        buildSlideToggleComponent(),
        buildSliderComponent(),
        buildTextInputComponent(),
        buildToolTipComponent(),
      ];
      expect(
        atomComponents.map((c) => c.name).toList(),
        <String>[
          'MagicBadge',
          'MagicButton',
          'MagicButtonToggle',
          'MagicCheckBox',
          'MagicChip',
          'MagicProgressIndicator',
          'MagicRadioButton',
          'MagicSlideToggle',
          'MagicSlider',
          'MagicTextInput',
          'MagicToolTip',
        ],
      );
      for (final comp in atomComponents) {
        expect(comp.useCases, isNotEmpty, reason: '${comp.name} has use cases');
      }

      final moleculeComponents = <WidgetbookComponent>[
        buildMagicCardComponent(),
        buildMagicFormFieldComponent(),
        buildMagicMenuComponent(),
        buildMagicSearchBarComponent(),
        buildMagicSelectComponent(),
      ];
      expect(
        moleculeComponents.map((c) => c.name).toList(),
        <String>[
          'MagicCard',
          'MagicFormField',
          'MagicMenu',
          'MagicSearchBar',
          'MagicSelect',
        ],
      );
      for (final comp in moleculeComponents) {
        expect(comp.useCases, isNotEmpty, reason: '${comp.name} has use cases');
      }
    });

    testWidgets('renders MagicWidgetbookApp shell with addons and categories', (
      tester,
    ) async {
      tester.view.physicalSize = const Size(1440, 2400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(const MagicWidgetbookApp());
      await tester.pumpAndSettle();

      expect(find.byType(MagicWidgetbookApp), findsOneWidget);
      expect(find.text('Atoms'), findsWidgets);
      expect(find.text('Molecules'), findsWidgets);
    });

    testWidgets('renders all 11 atom use cases cleanly', (tester) async {
      tester.view.physicalSize = const Size(1280, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final atomComponents = <WidgetbookComponent>[
        buildBadgeComponent(),
        buildButtonComponent(),
        buildButtonToggleComponent(),
        buildCheckBoxComponent(),
        buildChipComponent(),
        buildProgressIndicatorComponent(),
        buildRadioButtonComponent(),
        buildSlideToggleComponent(),
        buildSliderComponent(),
        buildTextInputComponent(),
        buildToolTipComponent(),
      ];

      for (final comp in atomComponents) {
        for (final useCase in comp.useCases) {
          await tester.pumpWidget(_wrapUseCase(useCase.builder));
          await tester.pump();
          expect(
            tester.takeException(),
            isNull,
            reason: '${comp.name} / ${useCase.name} threw an exception',
          );
        }
      }
    });

    testWidgets('renders all 5 molecule use cases cleanly', (tester) async {
      tester.view.physicalSize = const Size(1280, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final moleculeComponents = <WidgetbookComponent>[
        buildMagicCardComponent(),
        buildMagicFormFieldComponent(),
        buildMagicMenuComponent(),
        buildMagicSearchBarComponent(),
        buildMagicSelectComponent(),
      ];

      for (final comp in moleculeComponents) {
        for (final useCase in comp.useCases) {
          await tester.pumpWidget(_wrapUseCase(useCase.builder));
          await tester.pump();
          expect(
            tester.takeException(),
            isNull,
            reason: '${comp.name} / ${useCase.name} threw an exception',
          );
        }
      }
    });

    testWidgets('interactive atom & molecule use-case callbacks update state', (
      tester,
    ) async {
      tester.view.physicalSize = const Size(1280, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      // MagicButtonToggle interactive use cases
      final toggleComp = buildButtonToggleComponent();
      await tester.pumpWidget(_wrapUseCase(toggleComp.useCases.first.builder));
      await tester.pump();
      await tester.tap(find.text('Center'));
      await tester.pump();

      await tester.pumpWidget(_wrapUseCase(toggleComp.useCases.last.builder));
      await tester.pump();
      await tester.tap(find.text('List'));
      await tester.tap(find.text('Italic'));
      await tester.pump();

      // MagicCheckBox interactive & subtasks use cases
      final checkComp = buildCheckBoxComponent();
      await tester.pumpWidget(_wrapUseCase(checkComp.useCases[0].builder));
      await tester.pump();
      await tester.tap(find.text('Accept terms and conditions'));
      await tester.pump();

      await tester.pumpWidget(_wrapUseCase(checkComp.useCases[1].builder));
      await tester.pump();
      await tester.tap(find.text('Verify widget test coverage >= 85%'));
      await tester.pump();

      // MagicChip interactive, selectable, input, and draggable use cases
      final chipComp = buildChipComponent();
      await tester.pumpWidget(_wrapUseCase(chipComp.useCases[0].builder));
      await tester.pump();
      await tester.tap(find.text('Flutter 3.50'));
      await tester.pump();

      await tester.pumpWidget(_wrapUseCase(chipComp.useCases[1].builder));
      await tester.pump();
      await tester.tap(find.text('TypeScript'));
      await tester.pump();

      await tester.pumpWidget(_wrapUseCase(chipComp.useCases[2].builder));
      await tester.pump();
      await tester.enterText(find.byType(TextField).first, 'Widgetbook');
      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pump();
      expect(find.text('Widgetbook'), findsOneWidget);

      await tester.tap(find.byTooltip('Move Second backward'));
      await tester.pump();

      // MagicRadioButton interactive & gallery
      final radioComp = buildRadioButtonComponent();
      await tester.pumpWidget(_wrapUseCase(radioComp.useCases[0].builder));
      await tester.pump();
      await tester.tap(find.text('Express (2-Day)'));
      await tester.pump();

      await tester.pumpWidget(_wrapUseCase(radioComp.useCases[1].builder));
      await tester.pump();
      await tester.tap(find.text('SMS'));
      await tester.tap(find.text('Light'));
      await tester.pump();

      // MagicSlideToggle interactive
      final slideComp = buildSlideToggleComponent();
      await tester.pumpWidget(_wrapUseCase(slideComp.useCases[0].builder));
      await tester.pump();
      await tester.tap(find.text('Enable Notifications'));
      await tester.pump();

      // MagicSlider interactive & range
      final sliderComp = buildSliderComponent();
      await tester.pumpWidget(_wrapUseCase(sliderComp.useCases[0].builder));
      await tester.pump();
      await tester.drag(find.byType(Slider), const Offset(40, 0));
      await tester.pump();

      await tester.pumpWidget(_wrapUseCase(sliderComp.useCases[1].builder));
      await tester.pump();
      await tester.drag(find.byType(Slider), const Offset(30, 0));
      await tester.pump();
    });
  });
}
