/// Card molecule composing Material 3 [Card], [MagicButton], and [MagicChip]
/// with header, media, content, action, chip, and footer slots.
library;

import 'package:flutter/material.dart';

import '../../atoms/button/magic_button.dart';
import '../../atoms/chip/magic_chip.dart';
import '../../interfaces/atomic_interfaces.dart';

/// Material 3 card molecule supporting outlined and raised appearances,
/// header/media/footer custom slots, media image size presets, action buttons,
/// and chip collections.
///
/// Mirrors `CardMoleculeProps` from `@mono-magic/atomic-design-interfaces`
/// and `ng-mat`'s `MagicCardComponent`.
class MagicCard extends StatelessWidget {
  /// Creates a [MagicCard].
  const MagicCard({
    super.key,
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    this.title,
    this.subtitle,
    this.content,
    this.imageSrc,
    this.imageAlt = '',
    this.imageSize = CardImageSize.full,
    this.appearance = CardAppearance.outlined,
    this.variant = CardVariant.basic,
    this.width,
    this.actions = const <CardActionItem>[],
    this.chips = const <ChipItem>[],
    this.alignActions = CardActionsAlignment.start,
    this.onActionClick,
    this.onChipSelect,
    this.headerSlot,
    this.mediaSlot,
    this.footerSlot,
    this.child,
  });

  /// Optional logical identifier for the card.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>`.
  final String? testId;

  /// Optional accessible semantics label for the card container.
  final String? ariaLabel;

  /// Whether interactive actions and chips inside the card are disabled.
  final bool disabled;

  /// Primary heading text displayed in the card header when [headerSlot] is
  /// `null`.
  final String? title;

  /// Secondary subheading text displayed beneath [title] when [headerSlot] is
  /// `null`.
  final String? subtitle;

  /// Body text paragraph rendered inside the card content area.
  final String? content;

  /// Optional media image URL rendered when [mediaSlot] is `null`.
  final String? imageSrc;

  /// Accessible description for [imageSrc].
  final String imageAlt;

  /// Media image size preset (`small`, `medium`, `large`, `extraLarge`,
  /// `full`).
  final CardImageSize imageSize;

  /// Material 3 card surface style (`outlined` or `raised`).
  final CardAppearance appearance;

  /// Structural card layout preset (`basic`, `withActions`, `withChips`).
  final CardVariant variant;

  /// Optional card width constraint. Accepts a CSS-style pixel string (e.g.
  /// `'360px'` or `'360'`) or `null` for unconstrained width.
  final Object? width;

  /// Data-driven action button descriptors rendered via [MagicButton].
  final List<CardActionItem> actions;

  /// Data-driven chip descriptors rendered via [MagicChip].
  final List<ChipItem> chips;

  /// Horizontal alignment of the action button row (`start` or `end`).
  final CardActionsAlignment alignActions;

  /// Callback invoked when an enabled [CardActionItem] button is pressed.
  final ValueChanged<CardActionItem>? onActionClick;

  /// Callback invoked when an enabled [ChipItem] is tapped/selected.
  final ValueChanged<ChipItem>? onChipSelect;

  /// Optional custom header widget replacing the default [title]/[subtitle]
  /// header.
  final Widget? headerSlot;

  /// Optional custom media widget replacing the default [imageSrc] image.
  final Widget? mediaSlot;

  /// Optional custom footer widget rendered at the bottom of the card.
  final Widget? footerSlot;

  /// Optional custom body widget rendered inside the card content section.
  final Widget? child;

  double? _resolveWidth() {
    final raw = width;
    if (raw == null) {
      return null;
    }
    if (raw is num) {
      return raw.toDouble();
    }
    if (raw is String) {
      final cleaned = raw.trim().replaceAll(RegExp(r'px$', caseSensitive: false), '').trim();
      return double.tryParse(cleaned);
    }
    return null;
  }

  double _imageDimension(CardImageSize size) => switch (size) {
    CardImageSize.small => 80,
    CardImageSize.medium => 140,
    CardImageSize.large => 200,
    CardImageSize.extraLarge => 280,
    CardImageSize.full => 220,
  };

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final textTheme = theme.textTheme;

    final bool hasHeader =
        headerSlot != null ||
        (title != null && title!.isNotEmpty) ||
        (subtitle != null && subtitle!.isNotEmpty);
    final bool hasMedia =
        mediaSlot != null || (imageSrc != null && imageSrc!.trim().isNotEmpty);
    final bool hasBody =
        (content != null && content!.isNotEmpty) || child != null;
    final bool showChips =
        chips.isNotEmpty || variant == CardVariant.withChips;
    final bool showActions =
        actions.isNotEmpty || variant == CardVariant.withActions;
    final bool hasFooter = footerSlot != null;

    final List<Widget> sections = <Widget>[];

    if (hasHeader) {
      sections.add(
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child:
              headerSlot ??
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  if (title != null && title!.isNotEmpty)
                    Text(
                      title!,
                      style: textTheme.titleLarge?.copyWith(
                        color: disabled
                            ? scheme.onSurface.withValues(alpha: 0.38)
                            : scheme.onSurface,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  if (subtitle != null && subtitle!.isNotEmpty) ...<Widget>[
                    if (title != null && title!.isNotEmpty)
                      const SizedBox(height: 4),
                    Text(
                      subtitle!,
                      style: textTheme.bodyMedium?.copyWith(
                        color: disabled
                            ? scheme.onSurface.withValues(alpha: 0.38)
                            : scheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ],
              ),
        ),
      );
    }

    if (hasMedia) {
      sections.add(_buildMediaSection(scheme));
    }

    if (hasBody) {
      sections.add(
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              if (content != null && content!.isNotEmpty)
                Text(
                  content!,
                  style: textTheme.bodyMedium?.copyWith(
                    color: disabled
                        ? scheme.onSurface.withValues(alpha: 0.38)
                        : scheme.onSurface,
                  ),
                ),
              if (content != null && content!.isNotEmpty && child != null)
                const SizedBox(height: 8),
              ?child,
            ],
          ),
        ),
      );
    }

    if (showChips && chips.isNotEmpty) {
      sections.add(
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
          child: MagicChip(
            variant: onChipSelect != null
                ? ChipVariant.selectable
                : ChipVariant.basic,
            disabled: disabled,
            chips: chips,
            onSelectionChanged: (chip, _) {
              if (!disabled && !chip.disabled) {
                onChipSelect?.call(chip);
              }
            },
          ),
        ),
      );
    }

    if (showActions && actions.isNotEmpty) {
      sections.add(
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 4, 12, 12),
          child: Row(
            mainAxisAlignment: alignActions == CardActionsAlignment.end
                ? MainAxisAlignment.end
                : MainAxisAlignment.start,
            children: <Widget>[
              Flexible(
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  alignment: alignActions == CardActionsAlignment.end
                      ? WrapAlignment.end
                      : WrapAlignment.start,
                  children: <Widget>[
                    for (final action in actions)
                      MagicButton(
                        id: action.id,
                        label: action.label,
                        variant: action.variant ?? ButtonVariant.text,
                        color: action.color ?? ColorIntent.primary,
                        leadingIcon: action.icon,
                        leadingIconName: action.iconName,
                        disabled: disabled || action.disabled,
                        onPressed: (disabled || action.disabled)
                            ? null
                            : () => onActionClick?.call(action),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (hasFooter) {
      sections.add(
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
          child: footerSlot,
        ),
      );
    }

    final ShapeBorder cardShape = RoundedRectangleBorder(
      borderRadius: const BorderRadius.all(Radius.circular(12)),
      side: appearance == CardAppearance.outlined
          ? BorderSide(color: scheme.outlineVariant)
          : BorderSide.none,
    );

    Widget cardWidget = Card(
      key: testId != null ? ValueKey<String>(testId!) : null,
      margin: EdgeInsets.zero,
      clipBehavior: Clip.antiAlias,
      elevation: appearance == CardAppearance.outlined ? 0 : 2,
      color: appearance == CardAppearance.outlined
          ? scheme.surface
          : scheme.surfaceContainerLow,
      shape: cardShape,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: sections,
      ),
    );

    final resolvedWidth = _resolveWidth();
    if (resolvedWidth != null) {
      cardWidget = SizedBox(width: resolvedWidth, child: cardWidget);
    }

    return Semantics(
      container: true,
      enabled: !disabled,
      label: ariaLabel ?? title,
      child: cardWidget,
    );
  }

  Widget _buildMediaSection(ColorScheme scheme) {
    if (mediaSlot != null) {
      return mediaSlot!;
    }
    final src = imageSrc!.trim();
    final dimension = _imageDimension(imageSize);
    final isFull = imageSize == CardImageSize.full;

    final Widget imageWidget = Image.network(
      src,
      width: isFull ? double.infinity : dimension,
      height: dimension,
      fit: BoxFit.cover,
      semanticLabel: imageAlt.isNotEmpty ? imageAlt : title,
      errorBuilder: (context, error, stackTrace) => Container(
        width: isFull ? double.infinity : dimension,
        height: dimension,
        color: scheme.surfaceContainerHighest,
        alignment: Alignment.center,
        child: Icon(
          Icons.image_outlined,
          color: scheme.onSurfaceVariant,
          semanticLabel: imageAlt.isNotEmpty ? imageAlt : 'Card image',
        ),
      ),
    );

    if (isFull) {
      return imageWidget;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Align(
        alignment: Alignment.centerLeft,
        child: ClipRRect(
          borderRadius: const BorderRadius.all(Radius.circular(8)),
          child: imageWidget,
        ),
      ),
    );
  }
}
