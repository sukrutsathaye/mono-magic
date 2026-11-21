/// Bare Material 3 text input control implementing [MagicTextInputControlProps]
/// and integrating with [MagicFormFieldScope] and Flutter [Form].
library;

import 'package:flutter/material.dart';

import '../../core/magic_form_field_scope.dart';
import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Bare single-line text input atom implementing the `TextInputControlProps`
/// contract.
///
/// Labels, helper hints, error messages, and container appearance belong on
/// `MagicFormField`. When nested inside `MagicFormField`, [MagicTextInput]
/// consumes [MagicFormFieldScope.maybeOf] automatically to render a unified
/// Material 3 [InputDecoration] without double borders. It can also be rendered
/// standalone.
///
/// Built on top of [TextFormField], supporting native Flutter [Form]
/// validation, [onSaved], [autovalidateMode], external [TextEditingController],
/// controlled [value], and uncontrolled usage.
class MagicTextInput extends StatefulWidget {
  /// Creates a bare [MagicTextInput] control.
  const MagicTextInput({
    super.key,
    this.type = TextInputTypeKind.text,
    this.name,
    this.value,
    this.placeholder,
    this.size,
    this.disabled = false,
    this.requiredField = false,
    this.readOnly = false,
    this.autocomplete,
    this.autofillHints,
    this.minLength,
    this.maxLength,
    this.invalid = false,
    this.controller,
    this.focusNode,
    this.validator,
    this.onSaved,
    this.autovalidateMode,
    this.textInputAction,
    this.onChanged,
    this.onSubmitted,
    this.id,
    this.testId,
    this.ariaLabel,
  });

  /// Semantic keyboard and input mode (`text`, `email`, `password`, `search`,
  /// `tel`, `url`, `number`).
  final TextInputTypeKind type;

  /// Optional logical form control name.
  final String? name;

  /// Controlled or initial text value (used when [controller] is not provided).
  final String? value;

  /// Placeholder hint displayed inside the input when empty.
  final String? placeholder;

  /// Optional size override; falls back to `MagicFormFieldScope.size` or
  /// [AtomicSize.md].
  final AtomicSize? size;

  /// Whether user input is disabled.
  final bool disabled;

  /// Whether this control is marked as required.
  final bool requiredField;

  /// Whether the input text is read-only.
  final bool readOnly;

  /// Optional HTML-style autocomplete hint string (mapped to Flutter
  /// [AutofillHints] when [autofillHints] is not supplied).
  final String? autocomplete;

  /// Explicit Flutter autofill hints overriding [autocomplete].
  final Iterable<String>? autofillHints;

  /// Optional minimum character length enforced when no custom [validator] is
  /// supplied.
  final int? minLength;

  /// Optional maximum character length enforced on the input.
  final int? maxLength;

  /// Whether the control is visually marked as invalid even when no error
  /// message text is present.
  final bool invalid;

  /// Optional external [TextEditingController] for imperative text control.
  final TextEditingController? controller;

  /// Optional [FocusNode] for programmatic focus management.
  final FocusNode? focusNode;

  /// Optional Flutter [Form] field validator callback.
  final FormFieldValidator<String>? validator;

  /// Optional Flutter [Form] field save callback.
  final FormFieldSetter<String>? onSaved;

  /// Controls when [validator] runs automatically.
  final AutovalidateMode? autovalidateMode;

  /// Optional soft-keyboard action button (defaults to [TextInputAction.search]
  /// when [type] is [TextInputTypeKind.search]).
  final TextInputAction? textInputAction;

  /// Called whenever the user edits the text value.
  final ValueChanged<String>? onChanged;

  /// Called when the user submits the field from the keyboard.
  final ValueChanged<String>? onSubmitted;

  /// Optional logical identifier for the control.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>` on the inner
  /// [TextFormField].
  final String? testId;

  /// Optional accessible semantics label.
  final String? ariaLabel;

  @override
  State<MagicTextInput> createState() => _MagicTextInputState();
}

class _MagicTextInputState extends State<MagicTextInput> {
  TextEditingController? _internalController;

  TextEditingController get _effectiveController =>
      widget.controller ??
      (_internalController ??= TextEditingController(text: widget.value ?? ''));

  @override
  void initState() {
    super.initState();
    if (widget.controller == null) {
      _internalController = TextEditingController(text: widget.value ?? '');
    }
  }

  @override
  void didUpdateWidget(covariant MagicTextInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.controller == null && widget.controller != null) {
      _internalController?.dispose();
      _internalController = null;
    } else if (oldWidget.controller != null && widget.controller == null) {
      _internalController = TextEditingController(text: widget.value ?? '');
    } else if (widget.controller == null &&
        widget.value != null &&
        widget.value != _effectiveController.text) {
      _effectiveController.value = TextEditingValue(
        text: widget.value!,
        selection: TextSelection.collapsed(offset: widget.value!.length),
      );
    }
  }

  @override
  void dispose() {
    _internalController?.dispose();
    super.dispose();
  }

  TextInputType get _keyboardType => switch (widget.type) {
    TextInputTypeKind.text => TextInputType.text,
    TextInputTypeKind.email => TextInputType.emailAddress,
    TextInputTypeKind.password => TextInputType.visiblePassword,
    TextInputTypeKind.search => TextInputType.text,
    TextInputTypeKind.tel => TextInputType.phone,
    TextInputTypeKind.url => TextInputType.url,
    TextInputTypeKind.number => TextInputType.number,
  };

  TextInputAction? get _textInputAction =>
      widget.textInputAction ??
      (widget.type == TextInputTypeKind.search ? TextInputAction.search : null);

  Iterable<String>? get _effectiveAutofillHints {
    if (widget.autofillHints != null) {
      return widget.autofillHints;
    }
    final raw = widget.autocomplete?.trim().toLowerCase();
    if (raw != null && raw.isNotEmpty) {
      if (raw == 'off') {
        return null;
      }
      return switch (raw) {
        'email' => const <String>[AutofillHints.email],
        'username' => const <String>[AutofillHints.username],
        'current-password' => const <String>[AutofillHints.password],
        'new-password' => const <String>[AutofillHints.newPassword],
        'name' => const <String>[AutofillHints.name],
        'given-name' => const <String>[AutofillHints.givenName],
        'family-name' => const <String>[AutofillHints.familyName],
        'tel' => const <String>[AutofillHints.telephoneNumber],
        'url' => const <String>[AutofillHints.url],
        'one-time-code' => const <String>[AutofillHints.oneTimeCode],
        'street-address' => const <String>[AutofillHints.fullStreetAddress],
        'postal-code' => const <String>[AutofillHints.postalCode],
        _ => <String>[raw],
      };
    }
    return switch (widget.type) {
      TextInputTypeKind.email => const <String>[AutofillHints.email],
      TextInputTypeKind.password => const <String>[AutofillHints.password],
      TextInputTypeKind.tel => const <String>[AutofillHints.telephoneNumber],
      TextInputTypeKind.url => const <String>[AutofillHints.url],
      _ => null,
    };
  }

  FormFieldValidator<String>? get _effectiveValidator {
    if (widget.validator != null) {
      return widget.validator;
    }
    if (widget.minLength != null) {
      final min = widget.minLength!;
      return (String? value) {
        if (value != null && value.isNotEmpty && value.length < min) {
          return 'Must be at least $min characters.';
        }
        return null;
      };
    }
    return null;
  }

  InputDecoration _buildDecoration(
    BuildContext context,
    MagicFormFieldScope? scope,
    AtomicSize effectiveSize,
    bool effectiveDisabled,
    bool effectiveRequired,
  ) {
    if (scope != null) {
      return scope.buildDecoration(
        context: context,
        hintText: widget.placeholder,
        requiredOverride: effectiveRequired,
        disabledOverride: effectiveDisabled,
        isInvalid: widget.invalid,
        sizeOverride: effectiveSize,
      );
    }

    final metrics = MagicTheme.metricsFor(effectiveSize);
    final isDense =
        effectiveSize == AtomicSize.xs || effectiveSize == AtomicSize.sm;
    final errorColor = Theme.of(context).colorScheme.error;

    return InputDecoration(
      hintText: widget.placeholder,
      isDense: isDense,
      enabled: !effectiveDisabled,
      contentPadding: EdgeInsets.symmetric(
        horizontal: metrics.horizontalPadding * 0.6,
        vertical: metrics.verticalPadding,
      ),
      border: const OutlineInputBorder(),
      enabledBorder: widget.invalid
          ? OutlineInputBorder(borderSide: BorderSide(color: errorColor))
          : null,
      focusedBorder: widget.invalid
          ? OutlineInputBorder(
              borderSide: BorderSide(color: errorColor, width: 2),
            )
          : null,
    );
  }

  @override
  Widget build(BuildContext context) {
    final scope = MagicFormFieldScope.maybeOf(context);
    final effectiveSize = widget.size ?? scope?.size ?? AtomicSize.md;
    final effectiveDisabled = widget.disabled || (scope?.disabled ?? false);
    final effectiveRequired =
        widget.requiredField || (scope?.requiredField ?? false);
    final metrics = MagicTheme.metricsFor(effectiveSize);
    final decoration = _buildDecoration(
      context,
      scope,
      effectiveSize,
      effectiveDisabled,
      effectiveRequired,
    );

    return Semantics(
      textField: true,
      label: widget.ariaLabel ?? scope?.label ?? widget.placeholder,
      enabled: !effectiveDisabled,
      readOnly: widget.readOnly,
      child: TextFormField(
        key: widget.testId != null ? ValueKey<String>(widget.testId!) : null,
        controller: _effectiveController,
        focusNode: widget.focusNode,
        enabled: !effectiveDisabled,
        readOnly: widget.readOnly,
        obscureText: widget.type == TextInputTypeKind.password,
        keyboardType: _keyboardType,
        textInputAction: _textInputAction,
        autofillHints: _effectiveAutofillHints,
        maxLength: widget.maxLength,
        validator: _effectiveValidator,
        onSaved: widget.onSaved,
        autovalidateMode: widget.autovalidateMode,
        onChanged: widget.onChanged,
        onFieldSubmitted: widget.onSubmitted,
        style: TextStyle(fontSize: metrics.fontSize),
        decoration: decoration,
      ),
    );
  }
}
