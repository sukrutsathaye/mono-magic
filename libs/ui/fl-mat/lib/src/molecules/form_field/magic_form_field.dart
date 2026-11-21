/// Form-field molecule providing Material 3 label, hint, error, appearance,
/// sizing, and affix slots via [MagicFormFieldScope].
library;

import 'package:flutter/material.dart';

import '../../core/magic_form_field_scope.dart';
import '../../interfaces/atomic_interfaces.dart';

/// Material 3 form-field shell wrapping a bare form control such as
/// `MagicTextInput` or `MagicSelect`.
///
/// Propagates [label], [hint], [errorText], [appearance], [size], [floatLabel],
/// [subscriptSizing], [hideRequiredMarker], [prefix], [suffix], [requiredField],
/// and [disabled] through [MagicFormFieldScope] so child controls apply the
/// decoration natively without double borders.
///
/// When wrapping an arbitrary non-scope-aware widget, set [decorateChild] to
/// `true` to wrap [child] inside a Material [InputDecorator].
class MagicFormField extends StatelessWidget {
  /// Creates a [MagicFormField] wrapping [child].
  const MagicFormField({
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
    this.decorateChild = false,
    this.id,
    this.testId,
    this.ariaLabel,
    required this.child,
  });

  /// Floating field label text.
  final String? label;

  /// Helper hint text displayed beneath the field when [errorText] is absent.
  final String? hint;

  /// Validation error message replacing [hint] and applying error styling.
  final String? errorText;

  /// Material 3 container style (`outlined` or `filled`).
  final FormFieldAppearance appearance;

  /// Standardized component size governing density and padding.
  final AtomicSize size;

  /// Floating label behavior (`auto` or `always`).
  final FormFieldFloatLabel floatLabel;

  /// Subscript space sizing strategy (`fixed` or `dynamic`).
  final FormFieldSubscriptSizing subscriptSizing;

  /// Whether to suppress the trailing `*` indicator on required fields.
  final bool hideRequiredMarker;

  /// Optional leading affix widget inside the field container.
  final Widget? prefix;

  /// Optional trailing affix widget inside the field container.
  final Widget? suffix;

  /// Whether the associated form control is marked as required.
  final bool requiredField;

  /// Whether the form field and its nested control are disabled.
  final bool disabled;

  /// When `true`, wraps [child] directly in an [InputDecorator] using the
  /// propagated [MagicFormFieldScope] decoration.
  ///
  /// Leave `false` (default) for scope-aware controls (`MagicTextInput`,
  /// `MagicSelect`) so they render their own [InputDecoration] without double
  /// boxing.
  final bool decorateChild;

  /// Optional logical identifier for the field.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>`.
  final String? testId;

  /// Optional accessible semantics label announced for this field container.
  final String? ariaLabel;

  /// The bare form control rendered inside this field shell.
  final Widget child;

  @override
  Widget build(BuildContext context) {
    Widget content = MagicFormFieldScope(
      label: label,
      hint: hint,
      errorText: errorText,
      appearance: appearance,
      size: size,
      floatLabel: floatLabel,
      subscriptSizing: subscriptSizing,
      hideRequiredMarker: hideRequiredMarker,
      prefix: prefix,
      suffix: suffix,
      requiredField: requiredField,
      disabled: disabled,
      child: decorateChild
          ? Builder(
              builder: (scopeContext) {
                final scope = MagicFormFieldScope.maybeOf(scopeContext)!;
                return InputDecorator(
                  decoration: scope.buildDecoration(context: scopeContext),
                  child: child,
                );
              },
            )
          : child,
    );

    if (ariaLabel != null) {
      content = Semantics(container: true, label: ariaLabel, child: content);
    }

    if (testId != null) {
      content = KeyedSubtree(key: ValueKey<String>(testId!), child: content);
    }

    return content;
  }
}
