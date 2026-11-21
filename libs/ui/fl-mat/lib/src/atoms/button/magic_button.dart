/// Material 3 button atom supporting all 5 variants, 5 structural kinds,
/// 4 corner shapes, 7 semantic color intents, 5 sizes, icons, loading states,
/// and accessible interaction modes.
library;

import 'package:flutter/material.dart';

import '../../core/magic_icon.dart';
import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Material 3 button atom implementing the full `ButtonAtomProps` contract.
///
/// Supports:
/// - All 5 [ButtonVariant] emphasis levels (`filled`, `tonal`, `outlined`,
///   `elevated`, `text`)
/// - All 5 [ButtonKind] structures (`standard`, `icon`, `fab`, `miniFab`,
///   `extendedFab`)
/// - All 4 [ButtonShape] presets (`standard`, `square`, `rounded`, `pill`)
/// - All 7 [ColorIntent] semantic tokens resolved dynamically via
///   [MagicTheme.resolveIntent]
/// - All 5 [AtomicSize] metric presets via [MagicTheme.metricsFor]
/// - Native [IconData] and string-name icons via [MagicIcon]
/// - Loading indicator with optional [loadingLabel]
/// - [disabledInteractive] focusable disabled mode and [disableRipple]
class MagicButton extends StatelessWidget {
  /// Creates a [MagicButton].
  const MagicButton({
    super.key,
    this.label = '',
    this.variant = ButtonVariant.filled,
    this.kind = ButtonKind.standard,
    this.shape = ButtonShape.standard,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.disabled = false,
    this.disabledInteractive = false,
    this.disableRipple = false,
    this.loading = false,
    this.loadingLabel,
    this.fullWidth = false,
    this.leadingIcon,
    this.leadingIconName,
    this.trailingIcon,
    this.trailingIconName,
    this.child,
    this.focusNode,
    this.heroTag,
    this.id,
    this.testId,
    this.ariaLabel,
    this.onPressed,
  });

  /// Primary text label rendered on standard and extended FAB buttons, and used
  /// as tooltip/semantics fallback on icon and FAB buttons.
  final String label;

  /// Material 3 visual emphasis variant.
  final ButtonVariant variant;

  /// Structural button family (`standard`, `icon`, `fab`, `miniFab`,
  /// `extendedFab`).
  final ButtonKind kind;

  /// Corner shape override (`standard`, `square`, `rounded`, `pill`).
  final ButtonShape shape;

  /// Semantic color intent resolved from [ThemeData] and [MagicSemanticColors].
  final ColorIntent color;

  /// Standardized component size governing height, font size, icon size, and
  /// padding.
  final AtomicSize size;

  /// Whether the button is disabled.
  final bool disabled;

  /// When `true` alongside [disabled], keeps the button focusable and hoverable
  /// (e.g. for tooltips) while styled visually disabled and suppressing
  /// [onPressed].
  final bool disabledInteractive;

  /// Whether ink splash/ripple feedback is disabled.
  final bool disableRipple;

  /// Whether the button is in an active loading state.
  final bool loading;

  /// Optional label replacing [label] while [loading] is `true`.
  final String? loadingLabel;

  /// Whether standard buttons expand to fill available horizontal width.
  final bool fullWidth;

  /// Optional native Material [IconData] rendered before the label (or as the
  /// primary icon on `icon` / `fab` / `miniFab` buttons).
  final IconData? leadingIcon;

  /// Optional Material icon string name resolved via [MagicIcon] for the leading
  /// icon slot.
  final String? leadingIconName;

  /// Optional native Material [IconData] rendered after the label.
  final IconData? trailingIcon;

  /// Optional Material icon string name resolved via [MagicIcon] for the
  /// trailing icon slot.
  final String? trailingIconName;

  /// Optional custom child widget overriding [label] (or the default icon on
  /// icon/FAB kinds).
  final Widget? child;

  /// Optional [FocusNode] for programmatic focus control.
  final FocusNode? focusNode;

  /// Optional hero tag for FAB button kinds. Defaults to `null` (hero disabled)
  /// so multiple FABs on the same screen never collide.
  final Object? heroTag;

  /// Optional logical identifier for the button.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>` on the underlying Material
  /// button widget.
  final String? testId;

  /// Optional accessible semantics label (and tooltip on icon/FAB buttons).
  final String? ariaLabel;

  /// Callback invoked when the button is pressed while enabled and not loading.
  final VoidCallback? onPressed;

  bool get _hasLeadingIcon =>
      resolveMagicIconData(icon: leadingIcon, iconName: leadingIconName) !=
      null;

  bool get _hasTrailingIcon =>
      resolveMagicIconData(icon: trailingIcon, iconName: trailingIconName) !=
      null;

  bool get _isVisuallyDisabledInteractive =>
      disabled && disabledInteractive && !loading;

  bool get _isEffectivelyDisabled => disabled || loading;

  VoidCallback? get _effectiveOnPressed {
    if (loading) {
      return null;
    }
    if (disabled) {
      return disabledInteractive ? _noOp : null;
    }
    return onPressed;
  }

  static void _noOp() {}

  String get _effectiveDisplayLabel =>
      loading && loadingLabel != null ? loadingLabel! : label;

  String? get _effectiveTooltip {
    final candidate = ariaLabel ?? _effectiveDisplayLabel;
    return candidate.isNotEmpty ? candidate : null;
  }

  Key? get _buttonKey => testId != null ? ValueKey<String>(testId!) : null;

  Color _outlineBorderColor(
    ColorScheme scheme,
    MagicIntentColorSet intentColors,
  ) {
    return color == ColorIntent.neutral ? scheme.outline : intentColors.main;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final intentColors = MagicTheme.resolveIntent(context, color);
    final metrics = MagicTheme.metricsFor(size);
    final borderRadius = MagicTheme.borderRadiusFor(shape);

    final Widget buttonWidget = switch (kind) {
      ButtonKind.standard => _buildStandardButton(
        scheme: scheme,
        intentColors: intentColors,
        metrics: metrics,
        borderRadius: borderRadius,
      ),
      ButtonKind.icon => _buildIconButton(
        scheme: scheme,
        intentColors: intentColors,
        metrics: metrics,
        borderRadius: borderRadius,
      ),
      ButtonKind.fab || ButtonKind.miniFab || ButtonKind.extendedFab =>
        _buildFabButton(
          theme: theme,
          scheme: scheme,
          intentColors: intentColors,
          metrics: metrics,
          borderRadius: borderRadius,
        ),
    };

    return Semantics(
      button: true,
      enabled: !_isEffectivelyDisabled,
      label: _effectiveTooltip,
      child: buttonWidget,
    );
  }

  Widget _buildStandardButton({
    required ColorScheme scheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
    required BorderRadius? borderRadius,
  }) {
    final disabledFg = scheme.onSurface.withValues(alpha: 0.38);
    final disabledBg = scheme.onSurface.withValues(alpha: 0.12);
    final outlineColor = _outlineBorderColor(scheme, intentColors);

    final Color normalForeground = switch (variant) {
      ButtonVariant.filled => intentColors.onMain,
      ButtonVariant.tonal => intentColors.onContainer,
      ButtonVariant.outlined ||
      ButtonVariant.elevated ||
      ButtonVariant.text => intentColors.main,
    };

    final Color? normalBackground = switch (variant) {
      ButtonVariant.filled => intentColors.main,
      ButtonVariant.tonal => intentColors.container,
      ButtonVariant.elevated => scheme.surfaceContainerLow,
      ButtonVariant.outlined || ButtonVariant.text => null,
    };

    final Color activeForeground = _isEffectivelyDisabled
        ? disabledFg
        : normalForeground;

    final OutlinedBorder? shapeBorder = borderRadius != null
        ? RoundedRectangleBorder(borderRadius: borderRadius)
        : null;

    final ButtonStyle baseStyle = ButtonStyle(
      padding: WidgetStatePropertyAll<EdgeInsetsGeometry>(
        EdgeInsets.symmetric(
          horizontal: metrics.horizontalPadding,
          vertical: metrics.verticalPadding,
        ),
      ),
      minimumSize: WidgetStatePropertyAll<Size>(
        fullWidth ? Size.fromHeight(metrics.height) : Size(0, metrics.height),
      ),
      textStyle: WidgetStatePropertyAll<TextStyle>(
        TextStyle(fontSize: metrics.fontSize, fontWeight: FontWeight.w500),
      ),
      shape: shapeBorder != null
          ? WidgetStatePropertyAll<OutlinedBorder>(shapeBorder)
          : null,
      splashFactory: (disableRipple || _isVisuallyDisabledInteractive)
          ? NoSplash.splashFactory
          : null,
      overlayColor: _isVisuallyDisabledInteractive
          ? const WidgetStatePropertyAll<Color>(Colors.transparent)
          : null,
      elevation: _isVisuallyDisabledInteractive
          ? const WidgetStatePropertyAll<double>(0)
          : null,
      mouseCursor: _isVisuallyDisabledInteractive
          ? const WidgetStatePropertyAll<MouseCursor>(
              SystemMouseCursors.forbidden,
            )
          : null,
    );

    final ButtonStyle variantStyle = switch (variant) {
      ButtonVariant.filled => FilledButton.styleFrom(
        backgroundColor: _isVisuallyDisabledInteractive
            ? disabledBg
            : normalBackground,
        foregroundColor: _isVisuallyDisabledInteractive
            ? disabledFg
            : normalForeground,
        disabledBackgroundColor: disabledBg,
        disabledForegroundColor: disabledFg,
      ),
      ButtonVariant.tonal => FilledButton.styleFrom(
        backgroundColor: _isVisuallyDisabledInteractive
            ? disabledBg
            : normalBackground,
        foregroundColor: _isVisuallyDisabledInteractive
            ? disabledFg
            : normalForeground,
        disabledBackgroundColor: disabledBg,
        disabledForegroundColor: disabledFg,
      ),
      ButtonVariant.outlined => OutlinedButton.styleFrom(
        foregroundColor: _isVisuallyDisabledInteractive
            ? disabledFg
            : normalForeground,
        disabledForegroundColor: disabledFg,
        side: BorderSide(
          color: _isEffectivelyDisabled ? disabledBg : outlineColor,
        ),
      ),
      ButtonVariant.elevated => ElevatedButton.styleFrom(
        backgroundColor: _isVisuallyDisabledInteractive
            ? disabledBg
            : normalBackground,
        foregroundColor: _isVisuallyDisabledInteractive
            ? disabledFg
            : normalForeground,
        disabledBackgroundColor: disabledBg,
        disabledForegroundColor: disabledFg,
      ),
      ButtonVariant.text => TextButton.styleFrom(
        foregroundColor: _isVisuallyDisabledInteractive
            ? disabledFg
            : normalForeground,
        disabledForegroundColor: disabledFg,
      ),
    };

    final mergedStyle = variantStyle.merge(baseStyle);
    final Widget content = _buildStandardContent(
      metrics: metrics,
      spinnerColor: activeForeground,
    );

    final Widget button = switch (variant) {
      ButtonVariant.filled => FilledButton(
        key: _buttonKey,
        focusNode: focusNode,
        style: mergedStyle,
        onPressed: _effectiveOnPressed,
        child: content,
      ),
      ButtonVariant.tonal => FilledButton.tonal(
        key: _buttonKey,
        focusNode: focusNode,
        style: mergedStyle,
        onPressed: _effectiveOnPressed,
        child: content,
      ),
      ButtonVariant.outlined => OutlinedButton(
        key: _buttonKey,
        focusNode: focusNode,
        style: mergedStyle,
        onPressed: _effectiveOnPressed,
        child: content,
      ),
      ButtonVariant.elevated => ElevatedButton(
        key: _buttonKey,
        focusNode: focusNode,
        style: mergedStyle,
        onPressed: _effectiveOnPressed,
        child: content,
      ),
      ButtonVariant.text => TextButton(
        key: _buttonKey,
        focusNode: focusNode,
        style: mergedStyle,
        onPressed: _effectiveOnPressed,
        child: content,
      ),
    };

    if (fullWidth) {
      return SizedBox(width: double.infinity, child: button);
    }
    return button;
  }

  Widget _buildStandardContent({
    required MagicSizeMetrics metrics,
    required Color spinnerColor,
  }) {
    final displayLabel = _effectiveDisplayLabel;
    final hasBody = child != null || displayLabel.isNotEmpty;

    return Row(
      mainAxisSize: fullWidth ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (loading) ...[
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: spinnerColor,
            ),
          ),
          if (hasBody) const SizedBox(width: 8),
        ] else if (_hasLeadingIcon) ...[
          MagicIcon(
            icon: leadingIcon,
            iconName: leadingIconName,
            size: metrics.iconSize,
          ),
          if (hasBody) const SizedBox(width: 8),
        ],
        if (child != null && !(loading && loadingLabel != null))
          child!
        else if (displayLabel.isNotEmpty)
          Text(displayLabel),
        if (!loading && _hasTrailingIcon) ...[
          if (hasBody) const SizedBox(width: 8),
          MagicIcon(
            icon: trailingIcon,
            iconName: trailingIconName,
            size: metrics.iconSize,
          ),
        ],
      ],
    );
  }

  Widget _buildIconButton({
    required ColorScheme scheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
    required BorderRadius? borderRadius,
  }) {
    final disabledFg = scheme.onSurface.withValues(alpha: 0.38);
    final disabledBg = scheme.onSurface.withValues(alpha: 0.12);
    final outlineColor = _outlineBorderColor(scheme, intentColors);

    final Color normalForeground = switch (variant) {
      ButtonVariant.filled => intentColors.onMain,
      ButtonVariant.tonal => intentColors.onContainer,
      ButtonVariant.outlined ||
      ButtonVariant.elevated ||
      ButtonVariant.text => intentColors.main,
    };

    final Color? normalBackground = switch (variant) {
      ButtonVariant.filled => intentColors.main,
      ButtonVariant.tonal => intentColors.container,
      ButtonVariant.elevated => scheme.surfaceContainerLow,
      ButtonVariant.outlined || ButtonVariant.text => null,
    };

    final Color spinnerColor = _isEffectivelyDisabled
        ? disabledFg
        : normalForeground;

    final OutlinedBorder? shapeBorder = borderRadius != null
        ? RoundedRectangleBorder(borderRadius: borderRadius)
        : null;

    final ButtonStyle style = ButtonStyle(
      backgroundColor: normalBackground != null
          ? WidgetStatePropertyAll<Color>(
              _isEffectivelyDisabled ? disabledBg : normalBackground,
            )
          : null,
      foregroundColor: WidgetStatePropertyAll<Color>(
        _isEffectivelyDisabled ? disabledFg : normalForeground,
      ),
      side: variant == ButtonVariant.outlined
          ? WidgetStatePropertyAll<BorderSide>(
              BorderSide(
                color: _isEffectivelyDisabled ? disabledBg : outlineColor,
              ),
            )
          : null,
      elevation: variant == ButtonVariant.elevated
          ? WidgetStatePropertyAll<double>(_isEffectivelyDisabled ? 0 : 2)
          : (_isVisuallyDisabledInteractive
                ? const WidgetStatePropertyAll<double>(0)
                : null),
      minimumSize: WidgetStatePropertyAll<Size>(
        Size(metrics.height, metrics.height),
      ),
      shape: shapeBorder != null
          ? WidgetStatePropertyAll<OutlinedBorder>(shapeBorder)
          : null,
      splashFactory: (disableRipple || _isVisuallyDisabledInteractive)
          ? NoSplash.splashFactory
          : null,
      overlayColor: _isVisuallyDisabledInteractive
          ? const WidgetStatePropertyAll<Color>(Colors.transparent)
          : null,
      mouseCursor: _isVisuallyDisabledInteractive
          ? const WidgetStatePropertyAll<MouseCursor>(
              SystemMouseCursors.forbidden,
            )
          : null,
    );

    final Widget iconWidget = loading
        ? SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: spinnerColor,
            ),
          )
        : (child ??
              MagicIcon(
                icon: leadingIcon ?? trailingIcon,
                iconName: leadingIconName ?? trailingIconName,
                fallbackIcon: Icons.circle,
                size: metrics.iconSize,
              ));

    return switch (variant) {
      ButtonVariant.filled => IconButton.filled(
        key: _buttonKey,
        focusNode: focusNode,
        iconSize: metrics.iconSize,
        tooltip: _effectiveTooltip,
        style: style,
        onPressed: _effectiveOnPressed,
        icon: iconWidget,
      ),
      ButtonVariant.tonal => IconButton.filledTonal(
        key: _buttonKey,
        focusNode: focusNode,
        iconSize: metrics.iconSize,
        tooltip: _effectiveTooltip,
        style: style,
        onPressed: _effectiveOnPressed,
        icon: iconWidget,
      ),
      ButtonVariant.outlined => IconButton.outlined(
        key: _buttonKey,
        focusNode: focusNode,
        iconSize: metrics.iconSize,
        tooltip: _effectiveTooltip,
        style: style,
        onPressed: _effectiveOnPressed,
        icon: iconWidget,
      ),
      ButtonVariant.elevated || ButtonVariant.text => IconButton(
        key: _buttonKey,
        focusNode: focusNode,
        iconSize: metrics.iconSize,
        tooltip: _effectiveTooltip,
        style: style,
        onPressed: _effectiveOnPressed,
        icon: iconWidget,
      ),
    };
  }

  Widget _buildFabButton({
    required ThemeData theme,
    required ColorScheme scheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
    required BorderRadius? borderRadius,
  }) {
    final disabledFg = scheme.onSurface.withValues(alpha: 0.38);
    final disabledBg = scheme.onSurface.withValues(alpha: 0.12);
    final outlineColor = _outlineBorderColor(scheme, intentColors);

    final Color backgroundColor = _isEffectivelyDisabled
        ? disabledBg
        : switch (variant) {
            ButtonVariant.filled => intentColors.main,
            ButtonVariant.tonal => intentColors.container,
            ButtonVariant.elevated => scheme.surfaceContainerLow,
            ButtonVariant.outlined || ButtonVariant.text => scheme.surface,
          };

    final Color foregroundColor = _isEffectivelyDisabled
        ? disabledFg
        : switch (variant) {
            ButtonVariant.filled => intentColors.onMain,
            ButtonVariant.tonal => intentColors.onContainer,
            ButtonVariant.outlined ||
            ButtonVariant.elevated ||
            ButtonVariant.text => intentColors.main,
          };

    final double? elevation =
        (_isEffectivelyDisabled || variant == ButtonVariant.text) ? 0 : null;

    final ShapeBorder? fabShape = variant == ButtonVariant.outlined
        ? RoundedRectangleBorder(
            borderRadius:
                borderRadius ?? const BorderRadius.all(Radius.circular(16)),
            side: BorderSide(
              color: _isEffectivelyDisabled ? disabledBg : outlineColor,
            ),
          )
        : (borderRadius != null
              ? RoundedRectangleBorder(borderRadius: borderRadius)
              : null);

    final bool suppressRipple = disableRipple || _isVisuallyDisabledInteractive;
    final Color? splashColor = suppressRipple ? Colors.transparent : null;
    final double? interactionElevation = _isVisuallyDisabledInteractive
        ? 0
        : null;

    final Widget fab = switch (kind) {
      ButtonKind.miniFab => FloatingActionButton.small(
        key: _buttonKey,
        heroTag: heroTag,
        focusNode: focusNode,
        tooltip: _effectiveTooltip,
        backgroundColor: backgroundColor,
        foregroundColor: foregroundColor,
        splashColor: splashColor,
        elevation: elevation,
        hoverElevation: interactionElevation,
        focusElevation: interactionElevation,
        highlightElevation: interactionElevation,
        shape: fabShape,
        onPressed: _effectiveOnPressed,
        child: loading
            ? SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: foregroundColor,
                ),
              )
            : (child ??
                  MagicIcon(
                    icon: leadingIcon ?? trailingIcon,
                    iconName: leadingIconName ?? trailingIconName,
                    fallbackIcon: Icons.add,
                    size: 20,
                  )),
      ),
      ButtonKind.extendedFab => FloatingActionButton.extended(
        key: _buttonKey,
        heroTag: heroTag,
        focusNode: focusNode,
        tooltip: _effectiveTooltip,
        backgroundColor: backgroundColor,
        foregroundColor: foregroundColor,
        splashColor: splashColor,
        elevation: elevation,
        hoverElevation: interactionElevation,
        focusElevation: interactionElevation,
        highlightElevation: interactionElevation,
        shape: fabShape,
        onPressed: _effectiveOnPressed,
        icon: loading
            ? SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: foregroundColor,
                ),
              )
            : (_hasLeadingIcon
                  ? MagicIcon(
                      icon: leadingIcon,
                      iconName: leadingIconName,
                      size: metrics.iconSize,
                    )
                  : null),
        label: child != null && !(loading && loadingLabel != null)
            ? child!
            : Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _effectiveDisplayLabel,
                    style: TextStyle(fontSize: metrics.fontSize),
                  ),
                  if (!loading && _hasTrailingIcon) ...[
                    const SizedBox(width: 8),
                    MagicIcon(
                      icon: trailingIcon,
                      iconName: trailingIconName,
                      size: metrics.iconSize,
                    ),
                  ],
                ],
              ),
      ),
      ButtonKind.fab ||
      ButtonKind.standard ||
      ButtonKind.icon => FloatingActionButton(
        key: _buttonKey,
        heroTag: heroTag,
        focusNode: focusNode,
        tooltip: _effectiveTooltip,
        backgroundColor: backgroundColor,
        foregroundColor: foregroundColor,
        splashColor: splashColor,
        elevation: elevation,
        hoverElevation: interactionElevation,
        focusElevation: interactionElevation,
        highlightElevation: interactionElevation,
        shape: fabShape,
        onPressed: _effectiveOnPressed,
        child: loading
            ? SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: foregroundColor,
                ),
              )
            : (child ??
                  MagicIcon(
                    icon: leadingIcon ?? trailingIcon,
                    iconName: leadingIconName ?? trailingIconName,
                    fallbackIcon: Icons.add,
                    size: 24,
                  )),
      ),
    };

    if (suppressRipple) {
      return Theme(
        data: theme.copyWith(splashFactory: NoSplash.splashFactory),
        child: fab,
      );
    }
    return fab;
  }
}
