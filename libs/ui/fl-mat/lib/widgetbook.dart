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
          children: [
            WidgetbookComponent(
              name: 'MagicFormField',
              useCases: [
                WidgetbookUseCase(
                  name: 'Outlined',
                  builder: (context) => const Center(
                    child: SizedBox(
                      width: 320,
                      child: MagicFormField(
                        label: 'Full Name',
                        hint: 'Enter your legal name',
                        requiredField: true,
                        child: MagicTextInput(placeholder: 'Ada Lovelace'),
                      ),
                    ),
                  ),
                ),
                WidgetbookUseCase(
                  name: 'Filled',
                  builder: (context) => const Center(
                    child: SizedBox(
                      width: 320,
                      child: MagicFormField(
                        label: 'Search',
                        appearance: FormFieldAppearance.filled,
                        prefix: Icon(Icons.search),
                        child: MagicTextInput(
                          type: TextInputTypeKind.search,
                          placeholder: 'Filter components...',
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
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
