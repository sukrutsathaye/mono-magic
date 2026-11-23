/// Widgetbook 3.25 use cases for [MagicDatePicker].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicDatePicker].
WidgetbookComponent buildMagicDatePickerComponent() {
  return WidgetbookComponent(
    name: 'MagicDatePicker',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Single & Range Picker',
        builder: (context) {
          final mode = context.knobs.object.dropdown<MagicDatePickerMode>(
            label: 'Mode',
            options: MagicDatePickerMode.values,
            initialOption: MagicDatePickerMode.single,
            labelBuilder: (v) => v.name,
          );
          final appearance = formFieldAppearanceKnob(context);
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);
          final enableTime = context.knobs.boolean(
            label: 'Enable Time',
            initialValue: false,
          );
          final clearable = context.knobs.boolean(
            label: 'Clearable',
            initialValue: true,
          );
          final readOnly = context.knobs.boolean(
            label: 'Read Only',
            initialValue: false,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return _DatePickerPlayground(
            mode: mode,
            appearance: appearance,
            color: color,
            size: size,
            enableTime: enableTime,
            clearable: clearable,
            readOnly: readOnly,
            disabled: disabled,
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Filled Range With Bounds',
        builder: (context) => Center(
          child: SizedBox(
            width: 380,
            child: MagicDatePicker(
              label: 'Sprint Window',
              hint: 'Select dates within Q4 2026',
              appearance: FormFieldAppearance.filled,
              mode: MagicDatePickerMode.range,
              defaultRangeValue: const MagicDateRangeValue(
                start: '2026-11-10',
                end: '2026-11-24',
              ),
              minDate: '2026-10-01',
              maxDate: '2026-12-31',
              clearable: true,
              onRangeChanged: (_) {},
            ),
          ),
        ),
      ),
    ],
  );
}

class _DatePickerPlayground extends StatefulWidget {
  const _DatePickerPlayground({
    required this.mode,
    required this.appearance,
    required this.color,
    required this.size,
    required this.enableTime,
    required this.clearable,
    required this.readOnly,
    required this.disabled,
  });

  final MagicDatePickerMode mode;
  final FormFieldAppearance appearance;
  final ColorIntent color;
  final AtomicSize size;
  final bool enableTime;
  final bool clearable;
  final bool readOnly;
  final bool disabled;

  @override
  State<_DatePickerPlayground> createState() => _DatePickerPlaygroundState();
}

class _DatePickerPlaygroundState extends State<_DatePickerPlayground> {
  String? _singleDate = '2026-11-22';
  MagicDateRangeValue? _range = const MagicDateRangeValue(
    start: '2026-11-15',
    end: '2026-11-22',
  );

  @override
  Widget build(BuildContext context) {
    final String summary = widget.mode == MagicDatePickerMode.single
        ? 'Selected date: ${_singleDate ?? 'none'}'
        : 'Selected range: ${_range?.start ?? 'none'} -> ${_range?.end ?? 'none'}';

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: SizedBox(
          width: 380,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              MagicDatePicker(
                label: widget.mode == MagicDatePickerMode.single
                    ? 'Target Release Date'
                    : 'Deployment Window',
                hint: 'Bounds: 2026-01-01 to 2026-12-31',
                mode: widget.mode,
                appearance: widget.appearance,
                color: widget.color,
                size: widget.size,
                value: widget.mode == MagicDatePickerMode.single
                    ? _singleDate
                    : null,
                rangeValue: widget.mode == MagicDatePickerMode.range
                    ? _range
                    : null,
                minDate: '2026-01-01',
                maxDate: '2026-12-31',
                enableTime: widget.enableTime,
                clearable: widget.clearable,
                readOnly: widget.readOnly,
                disabled: widget.disabled,
                onChanged: (next) => setState(() => _singleDate = next),
                onRangeChanged: (next) => setState(() => _range = next),
              ),
              const SizedBox(height: 12),
              Text(summary, style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
        ),
      ),
    );
  }
}
