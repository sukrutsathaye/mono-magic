/// Widgetbook 3.25 use cases for [MagicButton].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicButton].
WidgetbookComponent buildButtonComponent() {
  return WidgetbookComponent(
    name: 'MagicButton',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final label = context.knobs.string(
            label: 'Label',
            initialValue: 'Save Changes',
          );
          final variant = buttonVariantKnob(context);
          final kind = context.knobs.object.dropdown<ButtonKind>(
            label: 'Kind',
            options: ButtonKind.values,
            initialOption: ButtonKind.standard,
            labelBuilder: (value) => value.name,
          );
          final shape = context.knobs.object.dropdown<ButtonShape>(
            label: 'Shape',
            options: ButtonShape.values,
            initialOption: ButtonShape.standard,
            labelBuilder: (value) => value.name,
          );
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);
          final loading = context.knobs.boolean(
            label: 'Loading',
            initialValue: false,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );
          final disabledInteractive = context.knobs.boolean(
            label: 'Disabled Interactive',
            initialValue: false,
          );

          return Center(
            child: MagicButton(
              label: label,
              variant: variant,
              kind: kind,
              shape: shape,
              color: color,
              size: size,
              loading: loading,
              disabled: disabled,
              disabledInteractive: disabledInteractive,
              leadingIcon: kind == ButtonKind.standard ? null : Icons.add,
              onPressed: () {},
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Variants & Kinds Gallery',
        builder: (context) {
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);
          final loading = context.knobs.boolean(
            label: 'Loading',
            initialValue: false,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    alignment: WrapAlignment.center,
                    children: <Widget>[
                      for (final variant in ButtonVariant.values)
                        MagicButton(
                          label: variant.name,
                          variant: variant,
                          color: color,
                          size: size,
                          loading: loading,
                          disabled: disabled,
                          onPressed: () {},
                        ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Wrap(
                    spacing: 16,
                    runSpacing: 12,
                    alignment: WrapAlignment.center,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: <Widget>[
                      MagicButton(
                        label: 'Icon',
                        kind: ButtonKind.icon,
                        variant: ButtonVariant.tonal,
                        color: color,
                        size: size,
                        loading: loading,
                        disabled: disabled,
                        leadingIcon: Icons.favorite,
                        onPressed: () {},
                      ),
                      MagicButton(
                        label: 'Mini FAB',
                        kind: ButtonKind.miniFab,
                        color: color,
                        size: size,
                        loading: loading,
                        disabled: disabled,
                        leadingIcon: Icons.edit,
                        onPressed: () {},
                      ),
                      MagicButton(
                        label: 'FAB',
                        kind: ButtonKind.fab,
                        color: color,
                        size: size,
                        loading: loading,
                        disabled: disabled,
                        leadingIcon: Icons.add,
                        onPressed: () {},
                      ),
                      MagicButton(
                        label: 'Extended FAB',
                        kind: ButtonKind.extendedFab,
                        color: color,
                        size: size,
                        loading: loading,
                        disabled: disabled,
                        leadingIcon: Icons.navigation,
                        onPressed: () {},
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Shapes, Sizes & Colors Gallery',
        builder: (context) {
          final variant = buttonVariantKnob(context);
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    alignment: WrapAlignment.center,
                    children: <Widget>[
                      for (final shape in ButtonShape.values)
                        MagicButton(
                          label: shape.name,
                          shape: shape,
                          variant: variant,
                          disabled: disabled,
                          onPressed: () {},
                        ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    alignment: WrapAlignment.center,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: <Widget>[
                      for (final size in AtomicSize.values)
                        MagicButton(
                          label: size.name.toUpperCase(),
                          size: size,
                          variant: ButtonVariant.outlined,
                          disabled: disabled,
                          onPressed: () {},
                        ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    alignment: WrapAlignment.center,
                    children: <Widget>[
                      for (final intent in ColorIntent.values)
                        MagicButton(
                          label: intent.name,
                          color: intent,
                          variant: variant,
                          disabled: disabled,
                          onPressed: () {},
                        ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Loading & Icons Gallery',
        builder: (context) {
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);

          return Center(
            child: Wrap(
              spacing: 16,
              runSpacing: 16,
              alignment: WrapAlignment.center,
              children: <Widget>[
                MagicButton(
                  label: 'Upload',
                  leadingIconName: 'cloud_upload',
                  color: color,
                  size: size,
                  onPressed: () {},
                ),
                MagicButton(
                  label: 'Next Step',
                  variant: ButtonVariant.tonal,
                  trailingIconName: 'arrow_forward',
                  color: color,
                  size: size,
                  onPressed: () {},
                ),
                MagicButton(
                  label: 'Submit',
                  loading: true,
                  loadingLabel: 'Submitting...',
                  color: color,
                  size: size,
                ),
                MagicButton(
                  label: 'Disabled',
                  disabled: true,
                  color: color,
                  size: size,
                ),
                MagicButton(
                  label: 'Interactive Disabled',
                  disabled: true,
                  disabledInteractive: true,
                  variant: ButtonVariant.outlined,
                  color: color,
                  size: size,
                ),
              ],
            ),
          );
        },
      ),
    ],
  );
}
