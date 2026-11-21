/// Shared Widgetbook 3.25 knob helpers and viewport frame presets for `fl_mat`.
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

/// Standard Widgetbook viewport list combining unconstrained preview with
/// mobile, tablet, and desktop device viewports.
final List<ViewportData> magicWidgetbookViewports = <ViewportData>[
  Viewports.none,
  IosViewports.iPhone13,
  AndroidViewports.samsungGalaxyS20,
  MacosViewports.macbookPro,
];

/// Standard Widgetbook Material 3 themes corresponding to all 7
/// [MagicPaletteName] palettes.
final List<WidgetbookTheme<ThemeData>> magicWidgetbookThemes =
    <WidgetbookTheme<ThemeData>>[
      for (final palette in MagicPaletteName.values)
        WidgetbookTheme<ThemeData>(
          name: palette.displayName,
          data: MagicTheme.byPalette(palette),
        ),
    ];

/// Shared enum dropdown knob for [ColorIntent].
ColorIntent colorIntentKnob(
  BuildContext context, {
  String label = 'Color Intent',
  ColorIntent initialValue = ColorIntent.primary,
}) {
  return context.knobs.object.dropdown<ColorIntent>(
    label: label,
    options: ColorIntent.values,
    initialOption: initialValue,
    labelBuilder: (value) => value.name,
  );
}

/// Shared enum dropdown knob for [AtomicSize].
AtomicSize atomicSizeKnob(
  BuildContext context, {
  String label = 'Size',
  AtomicSize initialValue = AtomicSize.md,
}) {
  return context.knobs.object.dropdown<AtomicSize>(
    label: label,
    options: AtomicSize.values,
    initialOption: initialValue,
    labelBuilder: (value) => value.name,
  );
}

/// Shared enum dropdown knob for [ButtonVariant].
ButtonVariant buttonVariantKnob(
  BuildContext context, {
  String label = 'Button Variant',
  ButtonVariant initialValue = ButtonVariant.filled,
}) {
  return context.knobs.object.dropdown<ButtonVariant>(
    label: label,
    options: ButtonVariant.values,
    initialOption: initialValue,
    labelBuilder: (value) => value.name,
  );
}

/// Shared enum dropdown knob for [FormFieldAppearance].
FormFieldAppearance formFieldAppearanceKnob(
  BuildContext context, {
  String label = 'Appearance',
  FormFieldAppearance initialValue = FormFieldAppearance.outlined,
}) {
  return context.knobs.object.dropdown<FormFieldAppearance>(
    label: label,
    options: FormFieldAppearance.values,
    initialOption: initialValue,
    labelBuilder: (value) => value.name,
  );
}
