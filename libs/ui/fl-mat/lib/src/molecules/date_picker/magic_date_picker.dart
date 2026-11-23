/// Material 3 date picker molecule supporting single date/datetime and date
/// range modes, min/max ISO bounds, clearable state, readOnly/disabled states,
/// outlined/filled appearances, Material picker dialogs, and direct ISO input.
library;

import 'package:flutter/material.dart';

import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';
import '../form_field/magic_form_field.dart';

/// Material 3 date picker molecule supporting `single` and `range` selection
/// modes, `minDate`/`maxDate` ISO boundaries, optional time-of-day selection
/// (`enableTime`), `clearable` reset button, `readOnly` and `disabled` states,
/// `outlined`/`filled` [MagicFormField] appearances, Material picker dialogs,
/// and direct ISO text entry.
///
/// Mirrors `DatePickerMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
class MagicDatePicker extends StatefulWidget {
  /// Creates a [MagicDatePicker].
  const MagicDatePicker({
    super.key,
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    this.label,
    this.hint,
    this.errorText,
    this.appearance = FormFieldAppearance.outlined,
    this.size = AtomicSize.md,
    this.mode = MagicDatePickerMode.single,
    this.value,
    this.defaultValue,
    this.rangeValue,
    this.defaultRangeValue,
    this.minDate,
    this.maxDate,
    this.enableTime = false,
    this.placeholder,
    this.startPlaceholder = 'Start date',
    this.endPlaceholder = 'End date',
    this.format,
    this.requiredField = false,
    this.readOnly = false,
    this.clearable = false,
    this.color = ColorIntent.primary,
    this.onChanged,
    this.onRangeChanged,
  });

  /// Optional logical identifier for the date picker.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>` on the root container.
  final String? testId;

  /// Optional accessible semantics label for the date picker.
  final String? ariaLabel;

  /// Whether the date picker is disabled and non-interactive.
  final bool disabled;

  /// Floating field label text.
  final String? label;

  /// Helper hint text displayed beneath the field.
  final String? hint;

  /// Validation error message overriding [hint] and internal validation errors.
  final String? errorText;

  /// Material 3 container style (`outlined` or `filled`).
  final FormFieldAppearance appearance;

  /// Standardized component density/size preset.
  final AtomicSize size;

  /// Selection mode (`single` or `range`).
  final MagicDatePickerMode mode;

  /// Controlled single date/datetime ISO string (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm`).
  final String? value;

  /// Initial uncontrolled single date/datetime ISO string.
  final String? defaultValue;

  /// Controlled date range value when [mode] is [MagicDatePickerMode.range].
  final MagicDateRangeValue? rangeValue;

  /// Initial uncontrolled date range value when [mode] is [MagicDatePickerMode.range].
  final MagicDateRangeValue? defaultRangeValue;

  /// Earliest selectable ISO date/datetime boundary.
  final String? minDate;

  /// Latest selectable ISO date/datetime boundary.
  final String? maxDate;

  /// Whether time-of-day (`HH:mm`) selection is enabled in single mode.
  final bool enableTime;

  /// Placeholder hint shown in single-date mode when empty.
  final String? placeholder;

  /// Placeholder hint shown for the start input in range mode.
  final String startPlaceholder;

  /// Placeholder hint shown for the end input in range mode.
  final String endPlaceholder;

  /// Display format hint (e.g. `'YYYY-MM-DD'`).
  final String? format;

  /// Whether a value is required for form validation.
  final bool requiredField;

  /// Whether the date picker displays its value without allowing edits.
  final bool readOnly;

  /// Whether a clear button is displayed when a value is set.
  final bool clearable;

  /// Semantic accent color intent for picker highlights.
  final ColorIntent color;

  /// Callback invoked in single mode when the selected date changes.
  final ValueChanged<String?>? onChanged;

  /// Callback invoked in range mode when the selected range changes.
  final ValueChanged<MagicDateRangeValue?>? onRangeChanged;

  @override
  State<MagicDatePicker> createState() => _MagicDatePickerState();
}

class _MagicDatePickerState extends State<MagicDatePicker> {
  static final RegExp _datePattern = RegExp(
    r'^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$',
  );

  late final TextEditingController _singleController;
  late final TextEditingController _startController;
  late final TextEditingController _endController;

  String? _internalSingle;
  MagicDateRangeValue? _internalRange;
  String? _validationError;

  @override
  void initState() {
    super.initState();
    _internalSingle = widget.value ?? widget.defaultValue;
    _internalRange = widget.rangeValue ?? widget.defaultRangeValue;
    _singleController = TextEditingController(text: _internalSingle ?? '');
    _startController = TextEditingController(text: _internalRange?.start ?? '');
    _endController = TextEditingController(text: _internalRange?.end ?? '');
  }

  @override
  void didUpdateWidget(covariant MagicDatePicker oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != oldWidget.value && widget.value != _singleController.text) {
      _internalSingle = widget.value;
      _singleController.text = widget.value ?? '';
    }
    if (widget.rangeValue != oldWidget.rangeValue) {
      _internalRange = widget.rangeValue;
      final nextStart = widget.rangeValue?.start ?? '';
      final nextEnd = widget.rangeValue?.end ?? '';
      if (_startController.text != nextStart) {
        _startController.text = nextStart;
      }
      if (_endController.text != nextEnd) {
        _endController.text = nextEnd;
      }
    }
  }

  @override
  void dispose() {
    _singleController.dispose();
    _startController.dispose();
    _endController.dispose();
    super.dispose();
  }

  String? get _effectiveSingle => widget.value ?? _internalSingle;

  MagicDateRangeValue? get _effectiveRange =>
      widget.rangeValue ?? _internalRange;

  DateTime? _parseIso(String? raw) {
    if (raw == null) {
      return null;
    }
    final trimmed = raw.trim();
    if (trimmed.isEmpty) {
      return null;
    }
    final match = _datePattern.firstMatch(trimmed);
    if (match == null) {
      return null;
    }
    final int year = int.parse(match.group(1)!);
    final int month = int.parse(match.group(2)!);
    final int day = int.parse(match.group(3)!);
    final int hour = match.group(4) != null ? int.parse(match.group(4)!) : 0;
    final int minute = match.group(5) != null ? int.parse(match.group(5)!) : 0;

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }
    if (hour > 23 || minute > 59) {
      return null;
    }
    final dt = DateTime(year, month, day, hour, minute);
    if (dt.year != year || dt.month != month || dt.day != day) {
      return null;
    }
    return dt;
  }

  String _formatDate(DateTime dt, {bool includeTime = false}) {
    final String y = dt.year.toString().padLeft(4, '0');
    final String m = dt.month.toString().padLeft(2, '0');
    final String d = dt.day.toString().padLeft(2, '0');
    if (!includeTime) {
      return '$y-$m-$d';
    }
    final String hh = dt.hour.toString().padLeft(2, '0');
    final String mm = dt.minute.toString().padLeft(2, '0');
    return '$y-$m-$d' 'T$hh:$mm';
  }

  DateTime get _firstDate =>
      _parseIso(widget.minDate) ?? DateTime(1900, 1, 1);

  DateTime get _lastDate =>
      _parseIso(widget.maxDate) ?? DateTime(2100, 12, 31);

  DateTime _clampDate(DateTime date, DateTime first, DateTime last) {
    if (date.isBefore(first)) {
      return first;
    }
    if (date.isAfter(last)) {
      return last;
    }
    return date;
  }

  String? _validateBounds(DateTime dt) {
    final DateTime? minDt = _parseIso(widget.minDate);
    final DateTime? maxDt = _parseIso(widget.maxDate);
    final DateTime dayOnly = DateTime(dt.year, dt.month, dt.day);
    if (minDt != null) {
      final minDay = DateTime(minDt.year, minDt.month, minDt.day);
      if (dayOnly.isBefore(minDay)) {
        return 'Date must be on or after ${widget.minDate}';
      }
    }
    if (maxDt != null) {
      final maxDay = DateTime(maxDt.year, maxDt.month, maxDt.day);
      if (dayOnly.isAfter(maxDay)) {
        return 'Date must be on or before ${widget.maxDate}';
      }
    }
    return null;
  }

  void _handleSingleTextChanged(String text) {
    if (widget.disabled || widget.readOnly) {
      return;
    }
    final trimmed = text.trim();
    if (trimmed.isEmpty) {
      setState(() {
        _validationError = null;
        if (widget.value == null) {
          _internalSingle = null;
        }
      });
      widget.onChanged?.call(null);
      return;
    }

    final parsed = _parseIso(trimmed);
    if (parsed == null) {
      setState(() {
        _validationError = widget.enableTime
            ? 'Enter date as YYYY-MM-DDTHH:mm'
            : 'Enter date as YYYY-MM-DD';
      });
      return;
    }

    final boundsError = _validateBounds(parsed);
    if (boundsError != null) {
      setState(() {
        _validationError = boundsError;
      });
      return;
    }

    setState(() {
      _validationError = null;
      if (widget.value == null) {
        _internalSingle = trimmed;
      }
    });
    widget.onChanged?.call(trimmed);
  }

  void _handleRangeTextChanged() {
    if (widget.disabled || widget.readOnly) {
      return;
    }
    final startRaw = _startController.text.trim();
    final endRaw = _endController.text.trim();

    if (startRaw.isEmpty && endRaw.isEmpty) {
      setState(() {
        _validationError = null;
        if (widget.rangeValue == null) {
          _internalRange = null;
        }
      });
      widget.onRangeChanged?.call(null);
      return;
    }

    final startDt = startRaw.isEmpty ? null : _parseIso(startRaw);
    final endDt = endRaw.isEmpty ? null : _parseIso(endRaw);

    if ((startRaw.isNotEmpty && startDt == null) ||
        (endRaw.isNotEmpty && endDt == null)) {
      setState(() {
        _validationError = 'Enter range dates as YYYY-MM-DD';
      });
      return;
    }

    if (startDt != null) {
      final err = _validateBounds(startDt);
      if (err != null) {
        setState(() => _validationError = err);
        return;
      }
    }
    if (endDt != null) {
      final err = _validateBounds(endDt);
      if (err != null) {
        setState(() => _validationError = err);
        return;
      }
    }
    if (startDt != null && endDt != null && endDt.isBefore(startDt)) {
      setState(() => _validationError = 'End date must be on or after start date');
      return;
    }

    final next = MagicDateRangeValue(
      start: startRaw.isEmpty ? null : startRaw,
      end: endRaw.isEmpty ? null : endRaw,
    );
    setState(() {
      _validationError = null;
      if (widget.rangeValue == null) {
        _internalRange = next;
      }
    });
    widget.onRangeChanged?.call(next);
  }

  Future<void> _openSinglePicker() async {
    if (widget.disabled || widget.readOnly) {
      return;
    }
    final first = _firstDate;
    final last = _lastDate;
    final initial = _clampDate(
      _parseIso(_effectiveSingle) ?? DateTime.now(),
      first,
      last,
    );

    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: first,
      lastDate: last,
    );
    if (pickedDate == null || !mounted) {
      return;
    }

    DateTime finalDt = pickedDate;
    if (widget.enableTime) {
      final TimeOfDay? pickedTime = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(initial),
      );
      if (!mounted) {
        return;
      }
      if (pickedTime != null) {
        finalDt = DateTime(
          pickedDate.year,
          pickedDate.month,
          pickedDate.day,
          pickedTime.hour,
          pickedTime.minute,
        );
      }
    }

    final formatted = _formatDate(finalDt, includeTime: widget.enableTime);
    setState(() {
      _validationError = null;
      _singleController.text = formatted;
      if (widget.value == null) {
        _internalSingle = formatted;
      }
    });
    widget.onChanged?.call(formatted);
  }

  Future<void> _openRangePicker() async {
    if (widget.disabled || widget.readOnly) {
      return;
    }
    final first = _firstDate;
    final last = _lastDate;
    final current = _effectiveRange;
    final startDt = _parseIso(current?.start);
    final endDt = _parseIso(current?.end);

    DateTimeRange? initialRange;
    if (startDt != null && endDt != null && !endDt.isBefore(startDt)) {
      initialRange = DateTimeRange(
        start: _clampDate(startDt, first, last),
        end: _clampDate(endDt, first, last),
      );
    }

    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: first,
      lastDate: last,
      initialDateRange: initialRange,
    );
    if (picked == null || !mounted) {
      return;
    }

    final next = MagicDateRangeValue(
      start: _formatDate(picked.start),
      end: _formatDate(picked.end),
    );
    setState(() {
      _validationError = null;
      _startController.text = next.start ?? '';
      _endController.text = next.end ?? '';
      if (widget.rangeValue == null) {
        _internalRange = next;
      }
    });
    widget.onRangeChanged?.call(next);
  }

  void _clearValue() {
    if (widget.disabled || widget.readOnly) {
      return;
    }
    if (widget.mode == MagicDatePickerMode.single) {
      setState(() {
        _validationError = null;
        _singleController.clear();
        if (widget.value == null) {
          _internalSingle = null;
        }
      });
      widget.onChanged?.call(null);
    } else {
      setState(() {
        _validationError = null;
        _startController.clear();
        _endController.clear();
        if (widget.rangeValue == null) {
          _internalRange = null;
        }
      });
      widget.onRangeChanged?.call(null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final intentColors = MagicTheme.resolveIntent(context, widget.color);
    final metrics = MagicTheme.metricsFor(widget.size);

    final String? effectiveError =
        (widget.errorText != null && widget.errorText!.isNotEmpty)
        ? widget.errorText
        : _validationError;

    final bool hasSingleValue =
        (_effectiveSingle != null && _effectiveSingle!.isNotEmpty) ||
        _singleController.text.isNotEmpty;
    final bool hasRangeValue =
        (_effectiveRange?.start != null &&
            _effectiveRange!.start!.isNotEmpty) ||
        (_effectiveRange?.end != null && _effectiveRange!.end!.isNotEmpty) ||
        _startController.text.isNotEmpty ||
        _endController.text.isNotEmpty;

    final bool showClear =
        widget.clearable &&
        !widget.disabled &&
        !widget.readOnly &&
        (widget.mode == MagicDatePickerMode.single
            ? hasSingleValue
            : hasRangeValue);

    final Widget suffixControls = Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        if (showClear)
          IconButton(
            key: widget.testId != null
                ? ValueKey<String>('${widget.testId}-clear')
                : null,
            tooltip: 'Clear date',
            icon: Icon(Icons.clear, size: metrics.iconSize),
            onPressed: _clearValue,
          ),
        IconButton(
          key: widget.testId != null
              ? ValueKey<String>('${widget.testId}-picker-btn')
              : null,
          tooltip: widget.mode == MagicDatePickerMode.range
              ? 'Open date range picker'
              : 'Open date picker',
          icon: Icon(
            widget.mode == MagicDatePickerMode.range
                ? Icons.date_range
                : Icons.calendar_today,
            size: metrics.iconSize,
            color: widget.disabled
                ? scheme.onSurface.withValues(alpha: 0.38)
                : intentColors.main,
          ),
          onPressed: (widget.disabled || widget.readOnly)
              ? null
              : (widget.mode == MagicDatePickerMode.range
                    ? _openRangePicker
                    : _openSinglePicker),
        ),
      ],
    );

    final String singleHint =
        widget.placeholder ??
        widget.format ??
        (widget.enableTime ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD');

    final Widget fieldWidget;
    if (widget.mode == MagicDatePickerMode.single) {
      fieldWidget = MagicFormField(
        label: widget.label,
        hint: widget.hint,
        errorText: effectiveError,
        appearance: widget.appearance,
        size: widget.size,
        requiredField: widget.requiredField,
        disabled: widget.disabled,
        suffix: suffixControls,
        decorateChild: true,
        child: TextField(
          key: widget.testId != null
              ? ValueKey<String>('${widget.testId}-input')
              : null,
          controller: _singleController,
          enabled: !widget.disabled,
          readOnly: widget.readOnly,
          style: TextStyle(fontSize: metrics.fontSize),
          decoration: InputDecoration.collapsed(hintText: singleHint),
          onChanged: _handleSingleTextChanged,
        ),
      );
    } else {
      fieldWidget = MagicFormField(
        label: widget.label,
        hint: widget.hint,
        errorText: effectiveError,
        appearance: widget.appearance,
        size: widget.size,
        requiredField: widget.requiredField,
        disabled: widget.disabled,
        suffix: suffixControls,
        decorateChild: true,
        child: Row(
          children: <Widget>[
            Expanded(
              child: TextField(
                key: widget.testId != null
                    ? ValueKey<String>('${widget.testId}-start-input')
                    : null,
                controller: _startController,
                enabled: !widget.disabled,
                readOnly: widget.readOnly,
                style: TextStyle(fontSize: metrics.fontSize),
                decoration: InputDecoration.collapsed(
                  hintText: widget.startPlaceholder,
                ),
                onChanged: (_) => _handleRangeTextChanged(),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 6),
              child: Text(
                '–',
                style: TextStyle(
                  fontSize: metrics.fontSize,
                  color: scheme.onSurfaceVariant,
                ),
              ),
            ),
            Expanded(
              child: TextField(
                key: widget.testId != null
                    ? ValueKey<String>('${widget.testId}-end-input')
                    : null,
                controller: _endController,
                enabled: !widget.disabled,
                readOnly: widget.readOnly,
                style: TextStyle(fontSize: metrics.fontSize),
                decoration: InputDecoration.collapsed(
                  hintText: widget.endPlaceholder,
                ),
                onChanged: (_) => _handleRangeTextChanged(),
              ),
            ),
          ],
        ),
      );
    }

    return Semantics(
      container: true,
      explicitChildNodes: true,
      enabled: !widget.disabled,
      readOnly: widget.readOnly,
      label: widget.ariaLabel ?? widget.label ?? 'Date picker',
      child: KeyedSubtree(
        key: widget.testId != null ? ValueKey<String>(widget.testId!) : null,
        child: fieldWidget,
      ),
    );
  }
}
