/// Inherited scope connecting `MagicFormField` with bare child controls such as
/// `MagicTextInput` and `MagicSelect`.
library;

import 'package:flutter/material.dart';

import '../interfaces/atomic_interfaces.dart';
import '../theme/magic_theme.dart';

/// Shared form-field configuration propagated from `MagicFormField` to nested
/// input controls.
class MagicFormFieldScope extends InheritedWidget {
  /// Creates a form-field scope wrapping [child].
  const MagicFormFieldScope({
    super.key,
    this.label,
    this.hint,
    this.errorText,
    this.appearance = FormFieldAppearance.outlined,
    this.size = AtomicSize.md,
    this.floatLabel = FormFieldFloatLabel.auto,
    this.subscriptSizing = FormFieldSubscriptSizing.fixed,
    this.hideRequiredMarker = false,
    this.prefix,
    this.suffix,
    this.requiredField = false,
    this.disabled = false,
    required super.child,
  });

  /// Floating field label text.
  final String? label;

  /// Helper hint text displayed beneath the field when no error is active.
  final String? hint;

  /// Validation error message displayed beneath the field.
  final String? errorText;

  /// Material 3 container decoration style (`outlined` or `filled`).
  final FormFieldAppearance appearance;

  /// Standardized component size governing density and padding.
  final AtomicSize size;

  /// Floating label display behavior (`auto` or `always`).
  final FormFieldFloatLabel floatLabel;

  /// Subscript sizing mode (`fixed` or `dynamic`).
  final FormFieldSubscriptSizing subscriptSizing;

  /// Whether to suppress the trailing `*` marker on required fields.
  final bool hideRequiredMarker;

  /// Optional leading affix widget inside the field container.
  final Widget? prefix;

  /// Optional trailing affix widget inside the field container.
  final Widget? suffix;

  /// Whether the associated control is marked as required.
  final bool requiredField;

  /// Whether the form field is disabled.
  final bool disabled;

  /// Returns `true` when [errorText] is non-null and non-empty.
  bool get hasError => errorText != null && errorText!.isNotEmpty;

  /// Returns the nearest enclosing [MagicFormFieldScope], or `null` when the
  /// control is rendered standalone outside `MagicFormField`.
  static MagicFormFieldScope? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<MagicFormFieldScope>();
  }

  /// Builds a Material 3 [InputDecoration] reflecting this scope's appearance,
  /// label, hint, error state, size metrics, and affixes.
  InputDecoration buildDecoration({
    BuildContext? context,
    String? placeholder,
    String? hintText,
    bool? requiredOverride,
    bool? disabledOverride,
    bool isInvalid = false,
    AtomicSize? sizeOverride,
    Widget? prefixOverride,
    Widget? suffixOverride,
  }) {
    final effectiveSize = sizeOverride ?? size;
    final metrics = MagicTheme.metricsFor(effectiveSize);
    final isDense =
        effectiveSize == AtomicSize.xs || effectiveSize == AtomicSize.sm;
    final showRequiredMarker =
        (requiredOverride ?? requiredField) && !hideRequiredMarker;
    final resolvedLabel = label != null && label!.isNotEmpty
        ? (showRequiredMarker ? '$label *' : label)
        : null;
    final isFilled = appearance == FormFieldAppearance.filled;
    final maxSubscriptLines =
        subscriptSizing == FormFieldSubscriptSizing.dynamic ? 3 : 1;
    final errorColor = context != null
        ? Theme.of(context).colorScheme.error
        : null;
    final showInvalidBorder = isInvalid && !hasError && errorColor != null;

    return InputDecoration(
      labelText: resolvedLabel,
      hintText: hintText ?? placeholder,
      helperText: hasError ? null : hint,
      errorText: hasError ? errorText : null,
      helperMaxLines: maxSubscriptLines,
      errorMaxLines: maxSubscriptLines,
      isDense: isDense,
      filled: isFilled,
      enabled: !(disabledOverride ?? disabled),
      floatingLabelBehavior: floatLabel == FormFieldFloatLabel.always
          ? FloatingLabelBehavior.always
          : FloatingLabelBehavior.auto,
      prefixIcon: prefixOverride ?? prefix,
      suffixIcon: suffixOverride ?? suffix,
      contentPadding: EdgeInsets.symmetric(
        horizontal: metrics.horizontalPadding * 0.6,
        vertical: metrics.verticalPadding,
      ),
      border: isFilled
          ? const UnderlineInputBorder()
          : const OutlineInputBorder(),
      enabledBorder: showInvalidBorder
          ? (isFilled
                ? UnderlineInputBorder(borderSide: BorderSide(color: errorColor))
                : OutlineInputBorder(borderSide: BorderSide(color: errorColor)))
          : null,
      focusedBorder: showInvalidBorder
          ? (isFilled
                ? UnderlineInputBorder(
                    borderSide: BorderSide(color: errorColor, width: 2),
                  )
                : OutlineInputBorder(
                    borderSide: BorderSide(color: errorColor, width: 2),
                  ))
          : null,
    );
  }

  @override
  bool updateShouldNotify(covariant MagicFormFieldScope oldWidget) {
    return label != oldWidget.label ||
        hint != oldWidget.hint ||
        errorText != oldWidget.errorText ||
        appearance != oldWidget.appearance ||
        size != oldWidget.size ||
        floatLabel != oldWidget.floatLabel ||
        subscriptSizing != oldWidget.subscriptSizing ||
        hideRequiredMarker != oldWidget.hideRequiredMarker ||
        prefix != oldWidget.prefix ||
        suffix != oldWidget.suffix ||
        requiredField != oldWidget.requiredField ||
        disabled != oldWidget.disabled;
  }
}
