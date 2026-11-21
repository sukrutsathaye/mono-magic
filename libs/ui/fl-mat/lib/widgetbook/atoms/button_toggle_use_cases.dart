/// Widgetbook 3.25 use cases for [MagicButtonToggle].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

const List<ButtonToggleOption<String>> _alignmentOptions =
    <ButtonToggleOption<String>>[
      ButtonToggleOption<String>(
        value: 'left',
        label: 'Left',
        iconName: 'format_align_left',
      ),
      ButtonToggleOption<String>(
        value: 'center',
        label: 'Center',
        iconName: 'format_align_center',
      ),
      ButtonToggleOption<String>(
        value: 'right',
        label: 'Right',
        iconName: 'format_align_right',
      ),
    ];

/// Builds the [WidgetbookComponent] catalog entry for [MagicButtonToggle].
WidgetbookComponent buildButtonToggleComponent() {
  return WidgetbookComponent(
    name: 'MagicButtonToggle',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final selectionMode =
              context.knobs.object.dropdown<ButtonToggleSelectionMode>(
                label: 'Selection Mode',
                options: ButtonToggleSelectionMode.values,
                initialOption: ButtonToggleSelectionMode.single,
                labelBuilder: (value) => value.name,
              );
          final appearance =
              context.knobs.object.dropdown<ButtonToggleAppearance>(
                label: 'Appearance',
                options: ButtonToggleAppearance.values,
                initialOption: ButtonToggleAppearance.standard,
                labelBuilder: (value) => value.name,
              );
          final vertical = context.knobs.boolean(
            label: 'Vertical',
            initialValue: false,
          );
          final hideSelectionIndicator = context.knobs.boolean(
            label: 'Hide Selection Indicator',
            initialValue: false,
          );
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          String? singleValue = 'left';
          Set<String> multiValues = <String>{'left', 'center'};

          return Center(
            child: StatefulBuilder(
              builder: (context, setState) {
                return MagicButtonToggle<String>(
                  options: _alignmentOptions,
                  value: singleValue,
                  selectedValues: multiValues,
                  selectionMode: selectionMode,
                  appearance: appearance,
                  vertical: vertical,
                  hideSelectionIndicator: hideSelectionIndicator,
                  color: color,
                  size: size,
                  disabled: disabled,
                  onChanged: (next) => setState(() => singleValue = next),
                  onMultiChanged: (next) => setState(() => multiValues = next),
                );
              },
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Single vs Multiple & Vertical Gallery',
        builder: (context) {
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);
          final hideSelectionIndicator = context.knobs.boolean(
            label: 'Hide Selection Indicator',
            initialValue: false,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          String? viewMode = 'grid';
          Set<String> formatting = <String>{'bold'};

          return Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: StatefulBuilder(
                builder: (context, setState) {
                  return Column(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      MagicButtonToggle<String>(
                        options: const <ButtonToggleOption<String>>[
                          ButtonToggleOption<String>(
                            value: 'list',
                            label: 'List',
                            iconName: 'view_list',
                          ),
                          ButtonToggleOption<String>(
                            value: 'grid',
                            label: 'Grid',
                            iconName: 'grid_view',
                          ),
                        ],
                        value: viewMode,
                        color: color,
                        size: size,
                        hideSelectionIndicator: hideSelectionIndicator,
                        disabled: disabled,
                        onChanged: (next) => setState(() => viewMode = next),
                      ),
                      const SizedBox(height: 20),
                      MagicButtonToggle<String>(
                        options: const <ButtonToggleOption<String>>[
                          ButtonToggleOption<String>(
                            value: 'bold',
                            label: 'Bold',
                            iconName: 'format_bold',
                          ),
                          ButtonToggleOption<String>(
                            value: 'italic',
                            label: 'Italic',
                            iconName: 'format_italic',
                          ),
                          ButtonToggleOption<String>(
                            value: 'underline',
                            label: 'Underline',
                            iconName: 'format_underlined',
                          ),
                        ],
                        selectionMode: ButtonToggleSelectionMode.multiple,
                        selectedValues: formatting,
                        color: ColorIntent.secondary,
                        size: size,
                        hideSelectionIndicator: hideSelectionIndicator,
                        disabled: disabled,
                        onMultiChanged: (next) =>
                            setState(() => formatting = next),
                      ),
                      const SizedBox(height: 20),
                      MagicButtonToggle<String>(
                        options: _alignmentOptions,
                        value: 'center',
                        vertical: true,
                        appearance: ButtonToggleAppearance.legacy,
                        color: ColorIntent.tertiary,
                        size: size,
                        hideSelectionIndicator: hideSelectionIndicator,
                        disabled: disabled,
                        onChanged: (_) {},
                      ),
                    ],
                  );
                },
              ),
            ),
          );
        },
      ),
    ],
  );
}
