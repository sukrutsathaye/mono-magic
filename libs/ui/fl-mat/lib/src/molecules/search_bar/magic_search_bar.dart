import 'package:flutter/material.dart';
import '../../atoms/button/magic_button.dart';
import '../../atoms/text_input/magic_text_input.dart';
import '../../interfaces/atomic_interfaces.dart';

class MagicSearchBar extends StatefulWidget {
  const MagicSearchBar({
    super.key,
    this.query,
    this.placeholder = 'Search...',
    this.label = 'Search',
    this.submitLabel = 'Search',
    this.buttonVariant = ButtonVariant.filled,
    this.buttonColor = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.disabled = false,
    this.loading = false,
    this.testId,
    this.ariaLabel,
    this.onQueryChanged,
    this.onSubmitted,
  });

  final String? query;
  final String placeholder;
  final String label;
  final String submitLabel;
  final ButtonVariant buttonVariant;
  final ColorIntent buttonColor;
  final AtomicSize size;
  final bool disabled;
  final bool loading;
  final String? testId;
  final String? ariaLabel;
  final ValueChanged<String>? onQueryChanged;
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
      _controller.text = widget.query!;
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
            child: MagicTextInput(
              label: widget.label,
              placeholder: widget.placeholder,
              controller: _controller,
              size: widget.size,
              disabled: widget.disabled,
              testId: widget.testId != null ? '${widget.testId}-input' : null,
              onChanged: _handleChanged,
              onSubmitted: (_) => _handleSubmit(),
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
