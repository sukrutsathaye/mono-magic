import 'package:flutter/material.dart';
import '../../interfaces/atomic_interfaces.dart';

class MagicTextInput extends StatefulWidget {
  const MagicTextInput({
    super.key,
    required this.label,
    this.value,
    this.controller,
    this.placeholder,
    this.helperText,
    this.errorText,
    this.variant = TextInputVariant.outlined,
    this.size = AtomicSize.md,
    this.disabled = false,
    this.requiredField = false,
    this.readOnly = false,
    this.testId,
    this.ariaLabel,
    this.onChanged,
    this.onSubmitted,
  });

  final String label;
  final String? value;
  final TextEditingController? controller;
  final String? placeholder;
  final String? helperText;
  final String? errorText;
  final TextInputVariant variant;
  final AtomicSize size;
  final bool disabled;
  final bool requiredField;
  final bool readOnly;
  final String? testId;
  final String? ariaLabel;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;

  @override
  State<MagicTextInput> createState() => _MagicTextInputState();
}

class _MagicTextInputState extends State<MagicTextInput> {
  TextEditingController? _internalController;

  TextEditingController get _effectiveController =>
      widget.controller ??
      (_internalController ??= TextEditingController(text: widget.value ?? ''));

  @override
  void didUpdateWidget(covariant MagicTextInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.controller == null &&
        widget.value != null &&
        widget.value != _effectiveController.text) {
      _effectiveController.text = widget.value!;
    }
  }

  @override
  void dispose() {
    _internalController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDense =
        widget.size == AtomicSize.xs || widget.size == AtomicSize.sm;
    final labelText = widget.requiredField ? '${widget.label} *' : widget.label;

    return Semantics(
      textField: true,
      label: widget.ariaLabel ?? widget.label,
      child: TextField(
        key: widget.testId != null ? ValueKey<String>(widget.testId!) : null,
        controller: _effectiveController,
        enabled: !widget.disabled,
        readOnly: widget.readOnly,
        onChanged: widget.onChanged,
        onSubmitted: widget.onSubmitted,
        decoration: InputDecoration(
          labelText: labelText,
          hintText: widget.placeholder,
          helperText: widget.errorText == null ? widget.helperText : null,
          errorText: widget.errorText,
          isDense: isDense,
          filled: widget.variant == TextInputVariant.filled,
          border: widget.variant == TextInputVariant.filled
              ? const UnderlineInputBorder()
              : const OutlineInputBorder(),
        ),
      ),
    );
  }
}
