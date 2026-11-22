/// Avatar and AvatarGroup molecules supporting image loading with error
/// fallback, derived initials, [MagicIcon] fallback, shape variants, size
/// presets, semantic intents, presence status badges, and `+N` overflow stacks.
library;

import 'package:flutter/material.dart';

import '../../core/magic_icon.dart';
import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Material 3 avatar molecule supporting network images (with graceful
/// `errorBuilder` fallback), explicit or name-derived initials, [MagicIcon]
/// fallback, `circle`/`rounded`/`square` shapes, 5 [AtomicSize] presets, 7
/// [ColorIntent] palettes, and [AvatarStatus] presence indicator dots.
///
/// Mirrors `AvatarMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
class MagicAvatar extends StatefulWidget {
  /// Creates a [MagicAvatar].
  const MagicAvatar({
    super.key,
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    this.src,
    this.alt,
    this.name,
    this.initials,
    this.icon,
    this.iconName,
    this.size = AtomicSize.md,
    this.color = ColorIntent.primary,
    this.shape = AvatarShape.circle,
    this.status,
    this.statusLabel,
  });

  /// Optional logical identifier for the avatar.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>` on the avatar container.
  final String? testId;

  /// Optional accessible semantics label overriding [alt] and [name].
  final String? ariaLabel;

  /// Whether the avatar renders in a muted disabled state.
  final bool disabled;

  /// Optional image URL rendered inside the avatar.
  final String? src;

  /// Accessible alternative text for [src].
  final String? alt;

  /// Display name used to derive up to 2 fallback initials and semantics.
  final String? name;

  /// Explicit fallback initials overriding derived [name] initials.
  final String? initials;

  /// Optional native Material [IconData] fallback icon.
  final IconData? icon;

  /// Optional Material icon string name fallback resolved via [MagicIcon].
  final String? iconName;

  /// Standardized component size preset.
  final AtomicSize size;

  /// Semantic color intent applied to the fallback container and text/icon.
  final ColorIntent color;

  /// Geometric container shape (`circle`, `rounded`, or `square`).
  final AvatarShape shape;

  /// Optional presence status indicator (`online`, `busy`, or `offline`).
  final AvatarStatus? status;

  /// Accessible label describing the presence [status].
  final String? statusLabel;

  /// Derives up to two uppercase initials from [name], or returns `null` when
  /// [name] is blank.
  static String? deriveInitials(String? name) {
    if (name == null) {
      return null;
    }
    final parts = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .toList();
    if (parts.isEmpty) {
      return null;
    }
    if (parts.length == 1) {
      return parts.first.substring(0, 1).toUpperCase();
    }
    return '${parts.first.substring(0, 1)}${parts.last.substring(0, 1)}'
        .toUpperCase();
  }

  /// Resolves the square bounding dimension in logical pixels for [size].
  static double dimensionFor(AtomicSize size) => switch (size) {
    AtomicSize.xs => 24,
    AtomicSize.sm => 32,
    AtomicSize.md => 40,
    AtomicSize.lg => 52,
    AtomicSize.xl => 64,
  };

  @override
  State<MagicAvatar> createState() => _MagicAvatarState();
}

class _MagicAvatarState extends State<MagicAvatar> {
  bool _imageFailed = false;

  @override
  void didUpdateWidget(covariant MagicAvatar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.src != widget.src) {
      _imageFailed = false;
    }
  }

  BorderRadius _borderRadiusFor(AvatarShape shape, double dimension) =>
      switch (shape) {
        AvatarShape.circle => BorderRadius.circular(dimension / 2),
        AvatarShape.rounded => const BorderRadius.all(Radius.circular(10)),
        AvatarShape.square => BorderRadius.zero,
      };

  double _fontSizeFor(AtomicSize size) => switch (size) {
    AtomicSize.xs => 10,
    AtomicSize.sm => 12,
    AtomicSize.md => 15,
    AtomicSize.lg => 18,
    AtomicSize.xl => 22,
  };

  double _iconSizeFor(AtomicSize size) => switch (size) {
    AtomicSize.xs => 14,
    AtomicSize.sm => 18,
    AtomicSize.md => 22,
    AtomicSize.lg => 28,
    AtomicSize.xl => 34,
  };

  double _statusDotSizeFor(AtomicSize size) => switch (size) {
    AtomicSize.xs => 7,
    AtomicSize.sm => 9,
    AtomicSize.md => 11,
    AtomicSize.lg => 13,
    AtomicSize.xl => 15,
  };

  Color _statusColor(BuildContext context, AvatarStatus status) {
    final scheme = Theme.of(context).colorScheme;
    final semantic =
        Theme.of(context).extension<MagicSemanticColors>() ??
        MagicSemanticColors.forColorScheme(scheme);
    return switch (status) {
      AvatarStatus.online => semantic.success,
      AvatarStatus.busy => scheme.error,
      AvatarStatus.offline => scheme.outline,
    };
  }

  String _defaultStatusText(AvatarStatus status) => switch (status) {
    AvatarStatus.online => 'online',
    AvatarStatus.busy => 'busy',
    AvatarStatus.offline => 'offline',
  };

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final intentColors = MagicTheme.resolveIntent(context, widget.color);
    final double dimension = MagicAvatar.dimensionFor(widget.size);
    final BorderRadius radius = _borderRadiusFor(widget.shape, dimension);

    final Color bgColor = widget.disabled
        ? scheme.surfaceContainerHighest
        : intentColors.container;
    final Color fgColor = widget.disabled
        ? scheme.onSurface.withValues(alpha: 0.38)
        : intentColors.onContainer;

    final String? trimmedSrc = widget.src?.trim();
    final bool hasSrc =
        trimmedSrc != null && trimmedSrc.isNotEmpty && !_imageFailed;

    final Widget fallbackContent = _buildFallback(fgColor);

    Widget avatarBox = Container(
      key: widget.testId != null ? ValueKey<String>(widget.testId!) : null,
      width: dimension,
      height: dimension,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: radius,
      ),
      clipBehavior: Clip.antiAlias,
      alignment: Alignment.center,
      child: hasSrc
          ? Image.network(
              trimmedSrc,
              width: dimension,
              height: dimension,
              fit: BoxFit.cover,
              semanticLabel: widget.alt ?? widget.name,
              errorBuilder: (context, error, stackTrace) {
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (mounted && !_imageFailed) {
                    setState(() => _imageFailed = true);
                  }
                });
                return fallbackContent;
              },
            )
          : fallbackContent,
    );

    if (widget.status != null) {
      final double dotSize = _statusDotSizeFor(widget.size);
      final Color dotColor = widget.disabled
          ? scheme.outlineVariant
          : _statusColor(context, widget.status!);

      avatarBox = Stack(
        clipBehavior: Clip.none,
        children: <Widget>[
          avatarBox,
          Positioned(
            right: -1,
            bottom: -1,
            child: Semantics(
              label:
                  widget.statusLabel ?? _defaultStatusText(widget.status!),
              child: Container(
                key: widget.testId != null
                    ? ValueKey<String>('${widget.testId}-status')
                    : null,
                width: dotSize,
                height: dotSize,
                decoration: BoxDecoration(
                  color: dotColor,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: scheme.surface,
                    width: 1.5,
                  ),
                ),
              ),
            ),
          ),
        ],
      );
    }

    final String baseLabel =
        widget.ariaLabel ?? widget.alt ?? widget.name ?? 'Avatar';
    final String fullLabel = widget.status != null
        ? '$baseLabel (${widget.statusLabel ?? _defaultStatusText(widget.status!)})'
        : baseLabel;

    return Semantics(
      container: true,
      explicitChildNodes: true,
      image: hasSrc,
      enabled: !widget.disabled,
      label: fullLabel,
      child: SizedBox(
        width: dimension,
        height: dimension,
        child: avatarBox,
      ),
    );
  }

  Widget _buildFallback(Color fgColor) {
    final String? explicitInitials = widget.initials?.trim();
    final String? resolvedInitials =
        (explicitInitials != null && explicitInitials.isNotEmpty)
        ? explicitInitials
        : MagicAvatar.deriveInitials(widget.name);

    if (resolvedInitials != null && resolvedInitials.isNotEmpty) {
      return Text(
        resolvedInitials,
        maxLines: 1,
        overflow: TextOverflow.clip,
        style: TextStyle(
          color: fgColor,
          fontSize: _fontSizeFor(widget.size),
          fontWeight: FontWeight.w600,
        ),
      );
    }

    return MagicIcon(
      icon: widget.icon,
      iconName: widget.iconName,
      fallbackIcon: Icons.person,
      size: _iconSizeFor(widget.size),
      color: fgColor,
    );
  }
}

/// Material 3 stacked avatar group molecule displaying overlapping [MagicAvatar]
/// entries and an optional `+N` overflow badge when [items] exceeds [max].
///
/// Mirrors `AvatarGroupMoleculeProps` from
/// `@mono-magic/atomic-design-interfaces`.
class MagicAvatarGroup extends StatelessWidget {
  /// Creates a [MagicAvatarGroup].
  const MagicAvatarGroup({
    super.key,
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    required this.items,
    this.max,
    this.size = AtomicSize.md,
    this.spacing = AvatarGroupSpacing.normal,
  });

  /// Optional logical identifier for the avatar group.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>` on the root group widget.
  final String? testId;

  /// Optional accessible semantics label for the avatar group.
  final String? ariaLabel;

  /// Whether all avatars inside the group render in a disabled state.
  final bool disabled;

  /// Ordered list of avatar descriptors rendered in the stack.
  final List<AvatarGroupItem> items;

  /// Maximum number of avatars rendered before collapsing remaining entries
  /// into a `+N` overflow badge.
  final int? max;

  /// Standardized size preset applied uniformly across all avatars.
  final AtomicSize size;

  /// Overlap density between adjacent avatars (`tight` or `normal`).
  final AvatarGroupSpacing spacing;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final double dimension = MagicAvatar.dimensionFor(size);
    final double overlapRatio = spacing == AvatarGroupSpacing.tight
        ? 0.38
        : 0.24;
    final double overlap = dimension * overlapRatio;
    final double step = dimension - overlap;

    final int effectiveMax = (max != null && max! > 0) ? max! : items.length;
    final int visibleCount = items.length > effectiveMax
        ? effectiveMax
        : items.length;
    final int overflowCount = items.length - visibleCount;
    final int totalCircles = visibleCount + (overflowCount > 0 ? 1 : 0);

    if (totalCircles == 0) {
      return SizedBox.shrink(
        key: testId != null ? ValueKey<String>(testId!) : null,
      );
    }

    final double totalWidth = dimension + (totalCircles - 1) * step;

    return Semantics(
      container: true,
      explicitChildNodes: true,
      enabled: !disabled,
      label: ariaLabel ?? 'Avatar group (${items.length})',
      child: SizedBox(
        key: testId != null ? ValueKey<String>(testId!) : null,
        width: totalWidth,
        height: dimension + 4,
        child: Stack(
          clipBehavior: Clip.none,
          children: <Widget>[
            for (int i = 0; i < visibleCount; i++)
              Positioned(
                left: i * step,
                top: 2,
                child: Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: scheme.surface,
                      width: 2,
                    ),
                  ),
                  child: MagicAvatar(
                    id: items[i].id,
                    testId: items[i].testId,
                    ariaLabel: items[i].ariaLabel,
                    disabled: disabled,
                    src: items[i].src,
                    alt: items[i].alt,
                    name: items[i].name,
                    initials: items[i].initials,
                    icon: items[i].icon,
                    iconName: items[i].iconName,
                    size: size,
                    color: items[i].color ?? ColorIntent.primary,
                    shape: items[i].shape ?? AvatarShape.circle,
                    status: items[i].status,
                    statusLabel: items[i].statusLabel,
                  ),
                ),
              ),
            if (overflowCount > 0)
              Positioned(
                left: visibleCount * step,
                top: 2,
                child: Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: scheme.surface,
                      width: 2,
                    ),
                  ),
                  child: MagicAvatar(
                    testId: testId != null ? '$testId-overflow' : null,
                    ariaLabel: '$overflowCount more',
                    disabled: disabled,
                    initials: '+$overflowCount',
                    size: size,
                    color: ColorIntent.neutral,
                    shape: AvatarShape.circle,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
