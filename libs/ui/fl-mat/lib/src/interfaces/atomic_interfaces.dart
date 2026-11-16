/// Atomic Design taxonomy and shared property contracts for Flutter Material 3
/// components, mirroring `@mono-magic/atomic-design-interfaces`.
library;

enum AtomicTier { atom, molecule, organism, template }

enum AtomicSize { xs, sm, md, lg, xl }

enum ColorIntent {
  primary,
  secondary,
  tertiary,
  success,
  warning,
  error,
  neutral,
}

enum ButtonVariant { filled, tonal, outlined, elevated, text }

enum TextInputVariant { outlined, filled }

abstract interface class BaseAtomicProps {
  String? get testId;
  String? get ariaLabel;
  bool get disabled;
}

class MagicButtonProps implements BaseAtomicProps {
  const MagicButtonProps({
    required this.label,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    this.variant = ButtonVariant.filled,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.loading = false,
    this.fullWidth = false,
  });

  final String label;
  @override
  final String? testId;
  @override
  final String? ariaLabel;
  @override
  final bool disabled;
  final ButtonVariant variant;
  final ColorIntent color;
  final AtomicSize size;
  final bool loading;
  final bool fullWidth;
}

class MagicTextInputProps implements BaseAtomicProps {
  const MagicTextInputProps({
    required this.label,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    this.value,
    this.placeholder,
    this.helperText,
    this.errorText,
    this.variant = TextInputVariant.outlined,
    this.size = AtomicSize.md,
    this.requiredField = false,
    this.readOnly = false,
  });

  final String label;
  @override
  final String? testId;
  @override
  final String? ariaLabel;
  @override
  final bool disabled;
  final String? value;
  final String? placeholder;
  final String? helperText;
  final String? errorText;
  final TextInputVariant variant;
  final AtomicSize size;
  final bool requiredField;
  final bool readOnly;
}

class MagicSearchBarProps implements BaseAtomicProps {
  const MagicSearchBarProps({
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    this.query,
    this.placeholder = 'Search...',
    this.label = 'Search',
    this.submitLabel = 'Search',
    this.buttonVariant = ButtonVariant.filled,
    this.buttonColor = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.loading = false,
  });

  @override
  final String? testId;
  @override
  final String? ariaLabel;
  @override
  final bool disabled;
  final String? query;
  final String placeholder;
  final String label;
  final String submitLabel;
  final ButtonVariant buttonVariant;
  final ColorIntent buttonColor;
  final AtomicSize size;
  final bool loading;
}
