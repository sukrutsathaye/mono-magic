/// Widgetbook 3.25 use cases for [MagicAccordion].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicAccordion].
WidgetbookComponent buildMagicAccordionComponent() {
  return WidgetbookComponent(
    name: 'MagicAccordion',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Playground',
        builder: (context) {
          final appearance =
              context.knobs.object.dropdown<AccordionAppearance>(
                label: 'Appearance',
                options: AccordionAppearance.values,
                initialOption: AccordionAppearance.outlined,
                labelBuilder: (v) => v.name,
              );
          final size = atomicSizeKnob(context);
          final multiple = context.knobs.boolean(
            label: 'Multiple Expand',
            initialValue: false,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 560),
                child: MagicAccordion(
                  appearance: appearance,
                  size: size,
                  multiple: multiple,
                  disabled: disabled,
                  defaultExpandedIds: const <String>['tokens'],
                  items: const <AccordionItem>[
                    AccordionItem(
                      id: 'tokens',
                      title: 'Material 3 Tokens',
                      summary: 'ColorIntent & AtomicSize scales',
                      iconName: 'palette',
                      content:
                          'All components consume MagicTheme.resolveIntent and MagicTheme.metricsFor.',
                    ),
                    AccordionItem(
                      id: 'parity',
                      title: 'Cross-Framework Parity',
                      summary: 'React, Angular, RN, and Flutter',
                      iconName: 'layers',
                      content:
                          'Contracts mirror @mono-magic/atomic-design-interfaces 1:1.',
                    ),
                    AccordionItem(
                      id: 'locked',
                      title: 'Locked Section',
                      summary: 'Disabled item example',
                      iconName: 'lock',
                      disabled: true,
                      content: 'Cannot be toggled.',
                    ),
                  ],
                  onExpandedChange: (_) {},
                ),
              ),
            ),
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Raised Multi-Expand',
        builder: (context) => const Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(24),
            child: SizedBox(
              width: 520,
              child: MagicAccordion(
                appearance: AccordionAppearance.raised,
                multiple: true,
                defaultExpandedIds: <String>['one', 'two'],
                items: <AccordionItem>[
                  AccordionItem(
                    id: 'one',
                    title: 'First Raised Panel',
                    content: 'Expanded alongside the second panel.',
                  ),
                  AccordionItem(
                    id: 'two',
                    title: 'Second Raised Panel',
                    content: 'Simultaneous expansion enabled via multiple: true.',
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    ],
  );
}
