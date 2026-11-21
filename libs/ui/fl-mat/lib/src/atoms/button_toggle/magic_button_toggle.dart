/// Material 3 segmented button toggle atom wrapping Flutter 3.50's
/// [SegmentedButton] with single/multiple selection, horizontal/vertical
/// direction, icons, and empty/single-selection safety guards.
library;

import 'package:flutter/material.dart';

import '../../core/magic_icon.dart';
import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Material 3 button toggle group atom wrapping [SegmentedButton<T>].
///
/// Supports:
/// - Single ([ButtonToggleSelectionMode.single]) and multiple
///   ([ButtonToggleSelectionMode.multiple]) selection modes
/// - Horizontal and vertical layouts via Flutter 3.50 `SegmentedButton.direction`
/// - [ButtonToggleAppearance.standard] and [ButtonToggleAppearance.legacy]
/// - Segment icons via [MagicIcon] and optional [hideSelectionIndicator]
/// - Safe guards for empty [options] and single-select set cardinality
class MagicButtonToggle<T> extends StatelessWidget {
  /// Creates a [MagicButtonToggle].
  const MagicButtonToggle({
    super.key,
    required this.options,
    this.value,
    this.selectedValues,
    this.onChanged,
    this.onMultiChanged,
    this.selectionMode = ButtonToggleSelectionMode.single,
    this.vertical = false,
    this.appearance = ButtonToggleAppearance.standard,
    this.hideSelectionIndicator = false,
    this.disabled = false,
    this.disabledInteractive = false,
    this.size = AtomicSize.md,
    this.color = ColorIntent.primary,
    this.name,
    this.requiredField = false,
    this.id,
    this.testId,
    this.ariaLabel,
  });

  /// Segment descriptors rendered inside the toggle group.
  final List<ButtonToggleOption<T>> options;

  /// Currently selected value when [selectionMode] is
  /// [ButtonToggleSelectionMode.single].
  final T? value;

  /// Currently selected values when [selectionMode] is
  /// [ButtonToggleSelectionMode.multiple].
  final Set<T>? selectedValues;

  /// Callback invoked in [ButtonToggleSelectionMode.single] mode when the
  /// selected value changes (`null` when deselected).
  final ValueChanged<T?>? onChanged;

  /// Callback invoked in [ButtonToggleSelectionMode.multiple] mode when the
  /// selected value set changes.
  final ValueChanged<Set<T>>? onMultiChanged;

  /// Single or multiple selection cardinality.
  final ButtonToggleSelectionMode selectionMode;

  /// Whether segments are stacked vertically instead of horizontally.
  final bool vertical;

  /// Visual appearance preset (`standard` or `legacy`).
  final ButtonToggleAppearance appearance;

  /// Whether to hide the leading checkmark icon on selected segments.
  final bool hideSelectionIndicator;

  /// Whether the entire toggle group is disabled.
  final bool disabled;

  /// When `true` alongside [disabled], keeps segments visually disabled while
  /// preserving interactive focusability and suppressing callbacks.
  final bool disabledInteractive;

  /// Standardized component size governing height, font size, icon size, and
  /// padding.
  final AtomicSize size;

  /// Semantic color intent applied to selected segment fill and foreground.
  final ColorIntent color;

  /// Optional logical field name for form integration.
  final String? name;

  /// Whether at least one selection is required in form contexts.
  final bool requiredField;

  /// Optional logical identifier for the toggle group.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>`.
  final String? testId;

  /// Optional accessible semantics label.
  final String? ariaLabel;

  bool get _isMulti => selectionMode == ButtonToggleSelectionMode.multiple;

  bool get _isVisuallyDisabledInteractive => disabled && disabledInteractive;

  Set<T> _resolveSelectedSet() {
    final validValues = options.map((opt) => opt.value).toSet();
    if (_isMulti) {
      final raw = selectedValues ?? <T>{};
      return raw.where(validValues.contains).toSet();
    }
    if (value != null && validValues.contains(value as T)) {
      return <T>{value as T};
    }
    return <T>{};
  }

  void _handleSelectionChanged(Set<T> next) {
    if (disabled) {
      return;
    }
    if (_isMulti) {
      onMultiChanged?.call(next);
    } else {
      onChanged?.call(next.isEmpty ? null : next.first);
    }
  }

  static void _noOpSelection<V>(Set<V> _) {}

  @override
  Widget build(BuildContext context) {
    if (options.isEmpty) {
      return const SizedBox.shrink();
    }

    final scheme = Theme.of(context).colorScheme;
    final intentColors = MagicTheme.resolveIntent(context, color);
    final metrics = MagicTheme.metricsFor(size);
    final disabledFg = scheme.onSurface.withValues(alpha: 0.38);
    final disabledBg = scheme.onSurface.withValues(alpha: 0.12);
    final isLegacy = appearance == ButtonToggleAppearance.legacy;

    final BorderRadius borderRadius = isLegacy
        ? const BorderRadius.all(Radius.circular(4))
        : const BorderRadius.all(Radius.circular(20));

    final ButtonStyle style = SegmentedButton.styleFrom(
      backgroundColor: _isVisuallyDisabledInteractive
          ? disabledBg
          : scheme.surface,
      foregroundColor: _isVisuallyDisabledInteractive
          ? disabledFg
          : scheme.onSurface,
      selectedBackgroundColor: _isVisuallyDisabledInteractive
          ? disabledBg
          : (isLegacy ? intentColors.main : intentColors.container),
      selectedForegroundColor: _isVisuallyDisabledInteractive
          ? disabledFg
          : (isLegacy ? intentColors.onMain : intentColors.onContainer),
      disabledForegroundColor: disabledFg,
      disabledBackgroundColor: disabledBg,
      textStyle: TextStyle(
        fontSize: metrics.fontSize,
        fontWeight: FontWeight.w500,
      ),
      padding: EdgeInsets.symmetric(
        horizontal: metrics.horizontalPadding * 0.6,
        vertical: metrics.verticalPadding * 0.5,
      ),
      minimumSize: Size(0, metrics.height),
      side: BorderSide(
        color: (disabled || _isVisuallyDisabledInteractive)
            ? disabledBg
            : scheme.outline,
      ),
      shape: RoundedRectangleBorder(borderRadius: borderRadius),
      visualDensity: isLegacy ? VisualDensity.compact : VisualDensity.standard,
    );

    final segments = <ButtonSegment<T>>[
      for (final opt in options)
        ButtonSegment<T>(
          value: opt.value,
          enabled: !disabled && !opt.disabled,
          tooltip: opt.ariaLabel,
          icon:
              resolveMagicIconData(icon: opt.icon, iconName: opt.iconName) !=
                  null
              ? MagicIcon(
                  icon: opt.icon,
                  iconName: opt.iconName,
                  size: metrics.iconSize,
                )
              : null,
          label: Text(opt.label),
        ),
    ];

    final void Function(Set<T>)? onSelectionChanged = disabled
        ? (disabledInteractive ? _noOpSelection<T> : null)
        : _handleSelectionChanged;

    Widget button = SegmentedButton<T>(
      segments: segments,
      selected: _resolveSelectedSet(),
      onSelectionChanged: onSelectionChanged,
      multiSelectionEnabled: _isMulti,
      emptySelectionAllowed: true,
      showSelectedIcon: !hideSelectionIndicator,
      direction: vertical ? Axis.vertical : Axis.horizontal,
      style: style,
    );

    if (testId != null) {
      button = KeyedSubtree(
        key: ValueKey<String>(testId!),
        child: button,
      );
    }

    if (ariaLabel != null) {
      button = Semantics(
        label: ariaLabel,
        child: button,
      );
    }

    return button;
  }
}
