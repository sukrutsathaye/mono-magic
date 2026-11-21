/// Search-bar molecule composing [MagicFormField], bare [MagicTextInput], and
/// [MagicButton].
library;

import 'package:flutter/material.dart';

import '../../atoms/button/magic_button.dart';
import '../../atoms/text_input/magic_text_input.dart';
import '../../interfaces/atomic_interfaces.dart';
import '../form_field/magic_form_field.dart';

/// Material 3 search-bar molecule pairing a labeled search input with a submit
/// action button.
///
/// Composes [MagicFormField], [MagicTextInput] (`TextInputTypeKind.search`),
/// and [MagicButton] in a horizontal layout.
class MagicSearchBar extends StatefulWidget {
  /// Creates a [MagicSearchBar].
  const MagicSearchBar({
    super.key,
    this.query,
    this.placeholder = 'Search...',
    this.label = 'Search',
    this.submitLabel = 'Search',
    this.appearance = FormFieldAppearance.outlined,
    this.buttonVariant = ButtonVariant.filled,
    this.buttonColor = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.disabled = false,
    this.loading = false,
    this.id,
    this.testId,
    this.ariaLabel,
    this.onQueryChanged,
    this.onSubmitted,
  });

  /// Controlled search query string; when omitted the widget manages query
  /// state internally.
  final String? query;

  /// Placeholder hint displayed inside the search input.
  final String placeholder;

  /// Label displayed by the wrapping [MagicFormField].
  final String label;

  /// Label displayed on the trailing submit [MagicButton].
  final String submitLabel;

  /// Material 3 form-field appearance (`outlined` or `filled`).
  final FormFieldAppearance appearance;

  /// Material 3 visual variant applied to the submit [MagicButton].
  final ButtonVariant buttonVariant;

  /// Semantic color intent applied to the submit [MagicButton].
  final ColorIntent buttonColor;

  /// Standardized component size shared by the field and submit button.
  final AtomicSize size;

  /// Whether both the input and submit button are disabled.
  final bool disabled;

  /// Whether a search submission is currently in progress.
  final bool loading;

  /// Optional logical identifier for the search bar.
  final String? id;

  /// Optional test key root (`<testId>`, `<testId>-input`, `<testId>-submit`).
  final String? testId;

  /// Optional accessible semantics label for the search bar region.
  final String? ariaLabel;

  /// Called whenever the search query text changes.
  final ValueChanged<String>? onQueryChanged;

  /// Called with the current query when submitted via keyboard or button tap.
  final ValueChanged<String>? onSubmitted;

  @override
  State<MagicSearchBar> createState() => _MagicSearchBarState();
}

class _MagicSearchBarState extends State<MagicSearchBar> {
  late String _internalQuery;
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _internalQuery = widget.query ?? '';
    _controller = TextEditingController(text: _internalQuery);
  }

  @override
  void didUpdateWidget(covariant MagicSearchBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.query != null && widget.query != _controller.text) {
      _internalQuery = widget.query!;
      _controller.value = TextEditingValue(
        text: widget.query!,
        selection: TextSelection.collapsed(offset: widget.query!.length),
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleChanged(String next) {
    if (widget.query == null) {
      _internalQuery = next;
    }
    widget.onQueryChanged?.call(next);
  }

  void _handleSubmit() {
    if (!widget.disabled && !widget.loading) {
      widget.onSubmitted?.call(widget.query ?? _internalQuery);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: widget.ariaLabel ?? widget.label,
      child: Row(
        key: widget.testId != null ? ValueKey<String>(widget.testId!) : null,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: MagicFormField(
              label: widget.label,
              appearance: widget.appearance,
              size: widget.size,
              subscriptSizing: FormFieldSubscriptSizing.dynamic,
              disabled: widget.disabled,
              child: MagicTextInput(
                type: TextInputTypeKind.search,
                placeholder: widget.placeholder,
                controller: _controller,
                size: widget.size,
                disabled: widget.disabled,
                testId: widget.testId != null ? '${widget.testId}-input' : null,
                onChanged: _handleChanged,
                onSubmitted: (_) => _handleSubmit(),
              ),
            ),
          ),
          const SizedBox(width: 12),
          MagicButton(
            label: widget.submitLabel,
            variant: widget.buttonVariant,
            color: widget.buttonColor,
            size: widget.size,
            disabled: widget.disabled,
            loading: widget.loading,
            testId: widget.testId != null ? '${widget.testId}-submit' : null,
            onPressed: _handleSubmit,
          ),
        ],
      ),
    );
  }
}
