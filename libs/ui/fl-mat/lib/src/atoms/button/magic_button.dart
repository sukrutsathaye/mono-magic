import 'package:flutter/material.dart';
import '../../interfaces/atomic_interfaces.dart';

class MagicButton extends StatelessWidget {
  const MagicButton({
    super.key,
    required this.label,
    this.variant = ButtonVariant.filled,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.disabled = false,
    this.loading = false,
    this.fullWidth = false,
    this.testId,
    this.ariaLabel,
    this.leadingIcon,
    this.onPressed,
  });

  final String label;
  final ButtonVariant variant;
  final ColorIntent color;
  final AtomicSize size;
  final bool disabled;
  final bool loading;
  final bool fullWidth;
  final String? testId;
  final String? ariaLabel;
  final IconData? leadingIcon;
  final VoidCallback? onPressed;

  EdgeInsetsGeometry get _padding => switch (size) {
        AtomicSize.xs => const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        AtomicSize.sm => const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        AtomicSize.md => const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
        AtomicSize.lg => const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
        AtomicSize.xl => const EdgeInsets.symmetric(horizontal: 26, vertical: 16),
      };

  Color _resolveColor(ColorScheme scheme) => switch (color) {
        ColorIntent.primary => scheme.primary,
        ColorIntent.secondary => scheme.secondary,
        ColorIntent.tertiary => scheme.tertiary,
        ColorIntent.success => const Color(0xFF2E7D32),
        ColorIntent.warning => const Color(0xFFED6C02),
        ColorIntent.error => scheme.error,
        ColorIntent.neutral => scheme.onSurfaceVariant,
      };

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final intentColor = _resolveColor(scheme);
    final effectiveOnPressed = (disabled || loading) ? null : onPressed;

    final Widget child = Row(
      mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (loading) ...[
          const SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
          const SizedBox(width: 8),
        ] else if (leadingIcon != null) ...[
          Icon(leadingIcon, size: 18),
          const SizedBox(width: 8),
        ],
        Text(label),
      ],
    );

    final baseStyle = ButtonStyle(
      padding: WidgetStatePropertyAll(_padding),
      minimumSize: fullWidth
          ? const WidgetStatePropertyAll(Size.fromHeight(40))
          : null,
    );

    final Widget button = switch (variant) {
      ButtonVariant.filled => FilledButton(
          key: testId != null ? ValueKey<String>(testId!) : null,
          style: FilledButton.styleFrom(backgroundColor: intentColor).merge(baseStyle),
          onPressed: effectiveOnPressed,
          child: child,
        ),
      ButtonVariant.tonal => FilledButton.tonal(
          key: testId != null ? ValueKey<String>(testId!) : null,
          style: baseStyle,
          onPressed: effectiveOnPressed,
          child: child,
        ),
      ButtonVariant.outlined => OutlinedButton(
          key: testId != null ? ValueKey<String>(testId!) : null,
          style: OutlinedButton.styleFrom(foregroundColor: intentColor).merge(baseStyle),
          onPressed: effectiveOnPressed,
          child: child,
        ),
      ButtonVariant.elevated => ElevatedButton(
          key: testId != null ? ValueKey<String>(testId!) : null,
          style: ElevatedButton.styleFrom(foregroundColor: intentColor).merge(baseStyle),
          onPressed: effectiveOnPressed,
          child: child,
        ),
      ButtonVariant.text => TextButton(
          key: testId != null ? ValueKey<String>(testId!) : null,
          style: TextButton.styleFrom(foregroundColor: intentColor).merge(baseStyle),
          onPressed: effectiveOnPressed,
          child: child,
        ),
    };

    return Semantics(
      button: true,
      label: ariaLabel ?? label,
      enabled: !disabled && !loading,
      child: button,
    );
  }
}
