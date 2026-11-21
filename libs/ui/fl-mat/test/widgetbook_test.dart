import 'package:fl_mat/widgetbook.dart';
import 'package:fl_mat/widgetbook/molecules/card_use_cases.dart';
import 'package:fl_mat/widgetbook/molecules/form_field_use_cases.dart';
import 'package:fl_mat/widgetbook/molecules/menu_use_cases.dart';
import 'package:fl_mat/widgetbook/molecules/search_bar_use_cases.dart';
import 'package:fl_mat/widgetbook/molecules/select_use_cases.dart';
import 'package:fl_mat/widgetbook/widgetbook_helpers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:widgetbook/widgetbook.dart';

void main() {
  group('MagicWidgetbookApp & Molecule Use Cases', () {
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

    test('molecule component builders register expected use cases', () {
      final cardComp = buildMagicCardComponent();
      final formFieldComp = buildMagicFormFieldComponent();
      final menuComp = buildMagicMenuComponent();
      final searchBarComp = buildMagicSearchBarComponent();
      final selectComp = buildMagicSelectComponent();

      expect(cardComp.name, 'MagicCard');
      expect(cardComp.useCases, isNotEmpty);

      expect(formFieldComp.name, 'MagicFormField');
      expect(formFieldComp.useCases, isNotEmpty);

      expect(menuComp.name, 'MagicMenu');
      expect(menuComp.useCases, isNotEmpty);

      expect(searchBarComp.name, 'MagicSearchBar');
      expect(searchBarComp.useCases, isNotEmpty);

      expect(selectComp.name, 'MagicSelect');
      expect(selectComp.useCases, isNotEmpty);
    });

    testWidgets('renders MagicWidgetbookApp shell with addons and categories', (
      tester,
    ) async {
      tester.view.physicalSize = const Size(1440, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(const MagicWidgetbookApp());
      await tester.pumpAndSettle();

      expect(find.byType(MagicWidgetbookApp), findsOneWidget);
      expect(find.text('Atoms'), findsWidgets);
      expect(find.text('Molecules'), findsWidgets);
    });
  });
}
