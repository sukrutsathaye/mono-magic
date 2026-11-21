/// Widgetbook 3.25 catalog shell for `fl_mat` configured with all 7 Material 3
/// palettes, ViewportAddon, TextScaleAddon, AlignmentAddon, and InspectorAddon.
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import 'widgetbook/molecules/card_use_cases.dart';
import 'widgetbook/molecules/form_field_use_cases.dart';
import 'widgetbook/molecules/menu_use_cases.dart';
import 'widgetbook/molecules/search_bar_use_cases.dart';
import 'widgetbook/molecules/select_use_cases.dart';
import 'widgetbook/widgetbook_helpers.dart';

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
            WidgetbookComponent(
              name: 'MagicButton',
              useCases: <WidgetbookUseCase>[
                WidgetbookUseCase(
                  name: 'Filled Primary',
                  builder: (context) => Center(
                    child: MagicButton(
                      label: 'Filled Button',
                      variant: ButtonVariant.filled,
                      color: ColorIntent.primary,
                      onPressed: () {},
                    ),
                  ),
                ),
                WidgetbookUseCase(
                  name: 'Tonal & Outlined',
                  builder: (context) => Center(
                    child: Wrap(
                      spacing: 12,
                      children: <Widget>[
                        MagicButton(
                          label: 'Tonal',
                          variant: ButtonVariant.tonal,
                          onPressed: () {},
                        ),
                        MagicButton(
                          label: 'Outlined',
                          variant: ButtonVariant.outlined,
                          color: ColorIntent.secondary,
                          onPressed: () {},
                        ),
                      ],
                    ),
                  ),
                ),
                WidgetbookUseCase(
                  name: 'Loading',
                  builder: (context) => const Center(
                    child: MagicButton(
                      label: 'Saving...',
                      loading: true,
                    ),
                  ),
                ),
              ],
            ),
            WidgetbookComponent(
              name: 'MagicTextInput',
              useCases: <WidgetbookUseCase>[
                WidgetbookUseCase(
                  name: 'Outlined',
                  builder: (context) => const Center(
                    child: SizedBox(
                      width: 320,
                      child: MagicFormField(
                        label: 'Email Address',
                        hint: 'We will never share your email.',
                        appearance: FormFieldAppearance.outlined,
                        child: MagicTextInput(
                          type: TextInputTypeKind.email,
                          placeholder: 'you@example.com',
                        ),
                      ),
                    ),
                  ),
                ),
                WidgetbookUseCase(
                  name: 'With Error',
                  builder: (context) => const Center(
                    child: SizedBox(
                      width: 320,
                      child: MagicFormField(
                        label: 'Username',
                        errorText: 'Must be at least 3 characters.',
                        child: MagicTextInput(value: 'ab'),
                      ),
                    ),
                  ),
                ),
              ],
            ),
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
