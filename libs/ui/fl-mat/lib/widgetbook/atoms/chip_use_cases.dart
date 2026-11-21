/// Widgetbook 3.25 use cases for [MagicChip].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicChip].
WidgetbookComponent buildChipComponent() {
  return WidgetbookComponent(
    name: 'MagicChip',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final variant = context.knobs.object.dropdown<ChipVariant>(
            label: 'Variant',
            options: ChipVariant.values,
            initialOption: ChipVariant.selectable,
            labelBuilder: (value) => value.name,
          );
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);
          final orientation = context.knobs.object.dropdown<ChipOrientation>(
            label: 'Orientation',
            options: ChipOrientation.values,
            initialOption: ChipOrientation.horizontal,
            labelBuilder: (value) => value.name,
          );
          final removable = context.knobs.boolean(
            label: 'Removable',
            initialValue: false,
          );
          final editable = context.knobs.boolean(
            label: 'Editable',
            initialValue: true,
          );
          final multiple = context.knobs.boolean(
            label: 'Multiple',
            initialValue: true,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          var items = const <ChipItem>[
            ChipItem(
              id: 'm3',
              label: 'Material 3',
              leadingIconName: 'palette',
              selected: true,
            ),
            ChipItem(
              id: 'flutter',
              label: 'Flutter 3.50',
              leadingIconName: 'bolt',
            ),
            ChipItem(
              id: 'atomic',
              label: 'Atomic Design',
              leadingIconName: 'layers',
            ),
          ];

          return Center(
            child: SizedBox(
              width: 380,
              child: StatefulBuilder(
                builder: (context, setState) {
                  return MagicChip(
                    chips: items,
                    label: variant == ChipVariant.input ? 'Add Tag' : null,
                    variant: variant,
                    color: color,
                    size: size,
                    orientation: orientation,
                    removable: removable,
                    editable: editable,
                    multiple: multiple,
                    disabled: disabled,
                    onSelectionChanged: (chip, selected) {
                      setState(() {
                        items = <ChipItem>[
                          for (final item in items)
                            if (item.id == chip.id)
                              item.copyWith(selected: selected)
                            else if (!multiple && selected)
                              item.copyWith(selected: false)
                            else
                              item,
                        ];
                      });
                    },
                    onChipAdded: (chip) {
                      setState(() {
                        items = <ChipItem>[...items, chip];
                      });
                    },
                    onChipRemoved: (chip) {
                      setState(() {
                        items = items
                            .where((item) => item.label != chip.label)
                            .toList(growable: false);
                      });
                    },
                    onChipEdited: (chip, nextLabel) {
                      setState(() {
                        items = <ChipItem>[
                          for (final item in items)
                            if (item.label == chip.label)
                              item.copyWith(label: nextLabel)
                            else
                              item,
                        ];
                      });
                    },
                    onChipReordered: (reordered) {
                      setState(() => items = reordered);
                    },
                  );
                },
              ),
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Basic & Selectable Variants',
        builder: (context) {
          final size = atomicSizeKnob(context);
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          var selectableItems = const <ChipItem>[
            ChipItem(id: 'dart', label: 'Dart 3', selected: true),
            ChipItem(id: 'ts', label: 'TypeScript'),
            ChipItem(id: 'nx', label: 'Nx Monorepo', selected: true),
          ];

          return Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: StatefulBuilder(
                builder: (context, setState) {
                  return Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      MagicChip(
                        variant: ChipVariant.basic,
                        color: ColorIntent.primary,
                        size: size,
                        disabled: disabled,
                        chips: const <ChipItem>[
                          ChipItem(label: 'Verified', leadingIconName: 'verified'),
                          ChipItem(label: 'Stable', leadingIconName: 'check_circle'),
                          ChipItem(label: 'Removable', removable: true),
                        ],
                      ),
                      const SizedBox(height: 20),
                      MagicChip(
                        variant: ChipVariant.selectable,
                        multiple: true,
                        color: ColorIntent.secondary,
                        size: size,
                        disabled: disabled,
                        chips: selectableItems,
                        onSelectionChanged: (chip, selected) {
                          setState(() {
                            selectableItems = <ChipItem>[
                              for (final item in selectableItems)
                                item.id == chip.id
                                    ? item.copyWith(selected: selected)
                                    : item,
                            ];
                          });
                        },
                      ),
                    ],
                  );
                },
              ),
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Input & Draggable Variants',
        builder: (context) {
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          var inputChips = const <ChipItem>[
            ChipItem(id: 'ui', label: 'UI Kit'),
            ChipItem(id: 'm3', label: 'M3 Tokens'),
          ];
          var draggableChips = const <ChipItem>[
            ChipItem(id: 'first', label: 'First'),
            ChipItem(id: 'second', label: 'Second'),
            ChipItem(id: 'third', label: 'Third'),
          ];

          return Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: SizedBox(
                width: 380,
                child: StatefulBuilder(
                  builder: (context, setState) {
                    return Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        MagicChip(
                          variant: ChipVariant.input,
                          label: 'Skills',
                          color: color,
                          size: size,
                          disabled: disabled,
                          removable: true,
                          editable: true,
                          chips: inputChips,
                          onChipAdded: (chip) => setState(
                            () => inputChips = <ChipItem>[...inputChips, chip],
                          ),
                          onChipRemoved: (chip) => setState(
                            () => inputChips = inputChips
                                .where((c) => c.label != chip.label)
                                .toList(growable: false),
                          ),
                          onChipEdited: (chip, next) => setState(
                            () => inputChips = <ChipItem>[
                              for (final item in inputChips)
                                item.label == chip.label
                                    ? item.copyWith(label: next)
                                    : item,
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                        MagicChip(
                          variant: ChipVariant.draggable,
                          color: ColorIntent.tertiary,
                          size: size,
                          disabled: disabled,
                          chips: draggableChips,
                          onChipReordered: (next) =>
                              setState(() => draggableChips = next),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ),
          );
        },
      ),
    ],
  );
}
