/// Select molecule composing [MagicFormField] and Material 3 [MenuAnchor]
/// supporting single-select, multi-select checkboxes, flat options, option
/// groups, and custom trigger summaries.
library;

import 'package:flutter/material.dart';

import '../../core/magic_form_field_scope.dart';
import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';
import '../form_field/magic_form_field.dart';

/// Material 3 dropdown select molecule composing [MagicFormField] with a
/// [MenuAnchor] dropdown overlay.
///
/// Supports:
/// - Single selection ([value] + [onChanged]) and multi-selection
///   ([multiple]: `true`, [values] + [onMultiChanged])
/// - Flat [options] and categorized [optionGroups] with group headers and
///   cascading `group.disabled || option.disabled` state
/// - Optional [customTriggerSummary] formatting multi-selections as
///   `"FirstLabel (+1 other)"` or `"FirstLabel (+N others)"`
/// - Full [MagicFormField] decoration (label, hint, errorText, appearance,
///   size, floatLabel, subscriptSizing, hideRequiredMarker, requiredField)
class MagicSelect<T> extends StatefulWidget {
  /// Creates a [MagicSelect].
  const MagicSelect({
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
    this.floatLabel = FormFieldFloatLabel.auto,
    this.subscriptSizing = FormFieldSubscriptSizing.fixed,
    this.hideRequiredMarker = false,
    this.options = const [],
    this.optionGroups = const [],
    this.value,
    this.values,
    this.placeholder = 'Select an option',
    this.multiple = false,
    this.requiredField = false,
    this.disableRipple = false,
    this.customTriggerSummary = false,
    this.panelClass,
    this.onChanged,
    this.onMultiChanged,
    this.onOpenChange,
  });

  /// Optional logical identifier for the select control.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>`.
  final String? testId;

  /// Optional accessible semantics label for the select combobox.
  final String? ariaLabel;

  /// Whether the select trigger and panel are disabled.
  final bool disabled;

  /// Floating label displayed by the wrapping [MagicFormField].
  final String? label;

  /// Helper hint text displayed beneath the field when no error is active.
  final String? hint;

  /// Validation error message replacing [hint] and applying error styling.
  final String? errorText;

  /// Material 3 form-field container style (`outlined` or `filled`).
  final FormFieldAppearance appearance;

  /// Standardized component size governing height, font size, and padding.
  final AtomicSize size;

  /// Floating label behavior (`auto` or `always`).
  final FormFieldFloatLabel floatLabel;

  /// Subscript space sizing strategy (`fixed` or `dynamic`).
  final FormFieldSubscriptSizing subscriptSizing;

  /// Whether to suppress the trailing `*` indicator on required fields.
  final bool hideRequiredMarker;

  /// Flat list of selectable options.
  final List<SelectOption<T>> options;

  /// Categorized option groups with group heading labels.
  final List<SelectOptionGroup<T>> optionGroups;

  /// Selected option value in single-select mode ([multiple] == `false`).
  final T? value;

  /// Selected option values in multi-select mode ([multiple] == `true`).
  final List<T>? values;

  /// Placeholder text displayed when no option is currently selected.
  final String placeholder;

  /// Whether multiple options can be selected simultaneously.
  final bool multiple;

  /// Whether the field is marked as required.
  final bool requiredField;

  /// Whether ink splash/ripple feedback is suppressed on trigger and options.
  final bool disableRipple;

  /// When `true` in [multiple] mode with 2 or more selected values, formats
  /// the trigger text as `"FirstLabel (+1 other)"` or `"FirstLabel (+N others)"`.
  final bool customTriggerSummary;

  /// Optional logical panel class name preserved for parity with `ng-mat`.
  final String? panelClass;

  /// Callback invoked with the selected value in single-select mode.
  final ValueChanged<T?>? onChanged;

  /// Callback invoked with the updated immutable selection list in
  /// multi-select mode.
  final ValueChanged<List<T>>? onMultiChanged;

  /// Callback invoked with `true` when the dropdown panel opens and `false`
  /// when it closes.
  final ValueChanged<bool>? onOpenChange;

  @override
  State<MagicSelect<T>> createState() => _MagicSelectState<T>();
}

class _MagicSelectState<T> extends State<MagicSelect<T>> {
  final MenuController _menuController = MenuController();
  T? _internalSingleValue;
  late List<T> _internalMultiValues;

  @override
  void initState() {
    super.initState();
    _internalSingleValue = widget.value;
    _internalMultiValues = List<T>.of(widget.values ?? <T>[]);
  }

  @override
  void didUpdateWidget(covariant MagicSelect<T> oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != oldWidget.value) {
      _internalSingleValue = widget.value;
    }
    if (widget.values != oldWidget.values && widget.values != null) {
      _internalMultiValues = List<T>.of(widget.values!);
    }
  }

  T? get _effectiveSingleValue => widget.value ?? _internalSingleValue;

  List<T> get _effectiveMultiValues => widget.values ?? _internalMultiValues;

  List<SelectOption<T>> get _allOptions => <SelectOption<T>>[
    ...widget.options,
    for (final group in widget.optionGroups) ...group.options,
  ];

  String _resolveLabel(T target) {
    for (final opt in _allOptions) {
      if (opt.value == target) {
        return opt.label;
      }
    }
    return target.toString();
  }

  bool get _hasSelection {
    if (widget.multiple) {
      return _effectiveMultiValues.isNotEmpty;
    }
    return _effectiveSingleValue != null;
  }

  String get _triggerDisplayText {
    if (widget.multiple) {
      final current = _effectiveMultiValues;
      if (current.isEmpty) {
        return '';
      }
      final firstLabel = _resolveLabel(current.first);
      if (widget.customTriggerSummary && current.length > 1) {
        final extra = current.length - 1;
        final noun = extra == 1 ? 'other' : 'others';
        return '$firstLabel (+$extra $noun)';
      }
      return current.map(_resolveLabel).join(', ');
    }

    final single = _effectiveSingleValue;
    if (single == null) {
      return '';
    }
    return _resolveLabel(single);
  }

  void _handleSingleOptionTap(SelectOption<T> option) {
    setState(() {
      _internalSingleValue = option.value;
    });
    widget.onChanged?.call(option.value);
    _menuController.close();
  }

  void _handleMultiOptionTap(SelectOption<T> option) {
    final next = List<T>.of(_effectiveMultiValues);
    if (next.contains(option.value)) {
      next.remove(option.value);
    } else {
      next.add(option.value);
    }
    setState(() {
      _internalMultiValues = next;
    });
    widget.onMultiChanged?.call(List<T>.unmodifiable(next));
  }

  List<Widget> _buildMenuChildren(
    BuildContext context,
    ColorScheme scheme,
    MagicSizeMetrics metrics,
  ) {
    final List<Widget> children = <Widget>[];

    for (final opt in widget.options) {
      children.add(
        _buildOptionItem(
          option: opt,
          effectiveDisabled: widget.disabled || opt.disabled,
          scheme: scheme,
          metrics: metrics,
        ),
      );
    }

    for (final group in widget.optionGroups) {
      children.add(
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 4),
          child: Text(
            group.label,
            style: TextStyle(
              fontSize: (metrics.fontSize - 1).clamp(11, 16).toDouble(),
              fontWeight: FontWeight.w700,
              color: group.disabled
                  ? scheme.onSurface.withValues(alpha: 0.38)
                  : scheme.primary,
            ),
          ),
        ),
      );
      for (final opt in group.options) {
        children.add(
          _buildOptionItem(
            option: opt,
            effectiveDisabled: widget.disabled || group.disabled || opt.disabled,
            scheme: scheme,
            metrics: metrics,
            indented: true,
          ),
        );
      }
    }

    return children;
  }

  Widget _buildOptionItem({
    required SelectOption<T> option,
    required bool effectiveDisabled,
    required ColorScheme scheme,
    required MagicSizeMetrics metrics,
    bool indented = false,
  }) {
    final bool isSelected = widget.multiple
        ? _effectiveMultiValues.contains(option.value)
        : _effectiveSingleValue == option.value;

    final Widget leadingWidget;
    if (widget.multiple) {
      leadingWidget = IgnorePointer(
        child: Checkbox(
          value: isSelected,
          onChanged: effectiveDisabled ? null : (_) {},
          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
        ),
      );
    } else {
      leadingWidget = SizedBox(
        width: 20,
        child: isSelected
            ? Icon(Icons.check, size: metrics.iconSize, color: scheme.primary)
            : null,
      );
    }

    return MenuItemButton(
      closeOnActivate: !widget.multiple,
      leadingIcon: Padding(
        padding: EdgeInsetsDirectional.only(start: indented ? 12.0 : 0.0),
        child: leadingWidget,
      ),
      onPressed: effectiveDisabled
          ? null
          : () {
              if (widget.multiple) {
                _handleMultiOptionTap(option);
              } else {
                _handleSingleOptionTap(option);
              }
            },
      child: Text(
        option.label,
        style: TextStyle(
          fontSize: metrics.fontSize,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final parentScope = MagicFormFieldScope.maybeOf(context);

    final effectiveLabel = widget.label ?? parentScope?.label;
    final effectiveHint = widget.hint ?? parentScope?.hint;
    final effectiveErrorText = widget.errorText ?? parentScope?.errorText;
    final effectiveAppearance =
        parentScope?.appearance ?? widget.appearance;
    final effectiveSize = parentScope?.size ?? widget.size;
    final effectiveFloatLabel =
        parentScope?.floatLabel ?? widget.floatLabel;
    final effectiveSubscriptSizing =
        parentScope?.subscriptSizing ?? widget.subscriptSizing;
    final effectiveHideRequiredMarker =
        widget.hideRequiredMarker || (parentScope?.hideRequiredMarker ?? false);
    final effectiveRequired =
        widget.requiredField || (parentScope?.requiredField ?? false);
    final effectiveDisabled =
        widget.disabled || (parentScope?.disabled ?? false);

    final metrics = MagicTheme.metricsFor(effectiveSize);
    final displayText = _triggerDisplayText;
    final hasSelection = _hasSelection && displayText.isNotEmpty;

    Widget buildFieldShell(BuildContext fieldContext) {
      final scope = MagicFormFieldScope.maybeOf(fieldContext)!;
      final decoration = scope.buildDecoration(
        context: fieldContext,
        requiredOverride: effectiveRequired,
        disabledOverride: effectiveDisabled,
        sizeOverride: effectiveSize,
        suffixOverride: Icon(
          Icons.arrow_drop_down,
          size: metrics.iconSize + 4,
          color: effectiveDisabled
              ? scheme.onSurface.withValues(alpha: 0.38)
              : scheme.onSurfaceVariant,
        ),
      );

      return MenuAnchor(
        controller: _menuController,
        onOpen: () => widget.onOpenChange?.call(true),
        onClose: () => widget.onOpenChange?.call(false),
        menuChildren: _buildMenuChildren(fieldContext, scheme, metrics),
        builder: (context, controller, child) {
          final isEmpty =
              !hasSelection &&
              effectiveFloatLabel != FormFieldFloatLabel.always &&
              widget.placeholder.isEmpty;

          final Widget triggerContent = Text(
            hasSelection ? displayText : widget.placeholder,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: metrics.fontSize,
              color: effectiveDisabled
                  ? scheme.onSurface.withValues(alpha: 0.38)
                  : (hasSelection
                        ? scheme.onSurface
                        : scheme.onSurfaceVariant),
            ),
          );

          final Widget decorator = InputDecorator(
            isFocused: controller.isOpen,
            isEmpty: isEmpty,
            decoration: decoration,
            child: triggerContent,
          );

          if (widget.disableRipple) {
            return GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: effectiveDisabled
                  ? null
                  : () {
                      if (controller.isOpen) {
                        controller.close();
                      } else {
                        controller.open();
                      }
                    },
              child: decorator,
            );
          }

          return InkWell(
            borderRadius: const BorderRadius.all(Radius.circular(4)),
            onTap: effectiveDisabled
                ? null
                : () {
                    if (controller.isOpen) {
                      controller.close();
                    } else {
                      controller.open();
                    }
                  },
            child: decorator,
          );
        },
      );
    }

    Widget content = MagicFormField(
      label: effectiveLabel,
      hint: effectiveHint,
      errorText: effectiveErrorText,
      appearance: effectiveAppearance,
      size: effectiveSize,
      floatLabel: effectiveFloatLabel,
      subscriptSizing: effectiveSubscriptSizing,
      hideRequiredMarker: effectiveHideRequiredMarker,
      requiredField: effectiveRequired,
      disabled: effectiveDisabled,
      child: Builder(builder: buildFieldShell),
    );

    if (widget.disableRipple) {
      content = Theme(
        data: theme.copyWith(splashFactory: NoSplash.splashFactory),
        child: content,
      );
    }

    if (widget.testId != null) {
      content = KeyedSubtree(
        key: ValueKey<String>(widget.testId!),
        child: content,
      );
    }

    return Semantics(
      container: true,
      enabled: !effectiveDisabled,
      label: widget.ariaLabel ?? effectiveLabel ?? widget.placeholder,
      child: content,
    );
  }
}
