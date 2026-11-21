/// Widgetbook 3.25 catalog shell for `fl_mat` configured with all 7 Material 3
/// palettes, ViewportAddon, TextScaleAddon, AlignmentAddon, and InspectorAddon.
library;

import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import 'widgetbook/atoms/badge_use_cases.dart';
import 'widgetbook/atoms/button_toggle_use_cases.dart';
import 'widgetbook/atoms/button_use_cases.dart';
import 'widgetbook/atoms/check_box_use_cases.dart';
import 'widgetbook/atoms/chip_use_cases.dart';
import 'widgetbook/atoms/progress_indicator_use_cases.dart';
import 'widgetbook/atoms/radio_button_use_cases.dart';
import 'widgetbook/atoms/slide_toggle_use_cases.dart';
import 'widgetbook/atoms/slider_use_cases.dart';
import 'widgetbook/atoms/text_input_use_cases.dart';
import 'widgetbook/atoms/tool_tip_use_cases.dart';
import 'widgetbook/molecules/card_use_cases.dart';
import 'widgetbook/molecules/form_field_use_cases.dart';
import 'widgetbook/molecules/menu_use_cases.dart';
import 'widgetbook/molecules/search_bar_use_cases.dart';
import 'widgetbook/molecules/select_use_cases.dart';
import 'widgetbook/widgetbook_helpers.dart';

/// Launches the `fl_mat` Widgetbook 3.25 catalog application.
void main() {
  runApp(const MagicWidgetbookApp());
}

/// Root Widgetbook 3.25 Material application for the `fl_mat` UI library.
class MagicWidgetbookApp extends StatelessWidget {
  /// Creates a [MagicWidgetbookApp].
  const MagicWidgetbookApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Widgetbook.material(
      addons: <WidgetbookAddon<dynamic>>[
        MaterialThemeAddon(themes: magicWidgetbookThemes),
        ViewportAddon(magicWidgetbookViewports),
        TextScaleAddon(min: 0.75, max: 2.0, initialScale: 1.0),
        AlignmentAddon(),
        InspectorAddon(),
      ],
      directories: <WidgetbookNode>[
        WidgetbookCategory(
          name: 'Atoms',
          children: <WidgetbookNode>[
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
          ],
        ),
        WidgetbookCategory(
          name: 'Molecules',
          children: <WidgetbookNode>[
            buildMagicCardComponent(),
            buildMagicFormFieldComponent(),
            buildMagicMenuComponent(),
            buildMagicSearchBarComponent(),
            buildMagicSelectComponent(),
          ],
        ),
      ],
    );
  }
}
