import 'package:flutter/material.dart';
import 'package:fl_mat/fl_mat.dart';
import 'package:widgetbook/widgetbook.dart';

void main() {
  runApp(const MagicWidgetbookApp());
}

class MagicWidgetbookApp extends StatelessWidget {
  const MagicWidgetbookApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Widgetbook.material(
      directories: [
        WidgetbookCategory(
          name: 'Atoms',
          children: [
            WidgetbookComponent(
              name: 'MagicButton',
              useCases: [
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
                      children: [
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
              useCases: [
                WidgetbookUseCase(
                  name: 'Outlined',
                  builder: (context) => const Center(
                    child: SizedBox(
                      width: 320,
                      child: MagicTextInput(
                        label: 'Email Address',
                        placeholder: 'you@example.com',
                        helperText: 'We will never share your email.',
                        variant: TextInputVariant.outlined,
                      ),
                    ),
                  ),
                ),
                WidgetbookUseCase(
                  name: 'With Error',
                  builder: (context) => const Center(
                    child: SizedBox(
                      width: 320,
                      child: MagicTextInput(
                        label: 'Username',
                        value: 'ab',
                        errorText: 'Must be at least 3 characters.',
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
          children: [
            WidgetbookComponent(
              name: 'MagicSearchBar',
              useCases: [
                WidgetbookUseCase(
                  name: 'Default',
                  builder: (context) => Center(
                    child: SizedBox(
                      width: 420,
                      child: MagicSearchBar(
                        label: 'Search components',
                        placeholder: 'Type an atom or molecule...',
                        submitLabel: 'Search',
                        onSubmitted: (_) {},
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }
}
