/// Material 3 chip atom supporting `basic`, `selectable`, `input`, and
/// `draggable` variants with horizontal/vertical layouts and full accessibility.
library;

import 'package:flutter/material.dart';

import '../../core/magic_icon.dart';
import '../../interfaces/atomic_interfaces.dart';
import '../../molecules/form_field/magic_form_field.dart';
import '../../theme/magic_theme.dart';
import '../text_input/magic_text_input.dart';

/// Material 3 chip atom unifying display, selectable filter, editable input,
/// and reorderable draggable chip sets behind one API.
///
/// Supports all 4 [ChipVariant] modes:
/// - [ChipVariant.basic]: Material 3 [Chip] items with optional avatars,
///   leading icons, remove buttons, and single-chip fallback when [chips] is
///   empty and [label] or [child] is supplied.
/// - [ChipVariant.selectable]: Material 3 [FilterChip] items with controllable
///   selection checkmarks ([hideSelectionIndicator]) and [onSelectionChanged].
/// - [ChipVariant.input]: Material 3 [InputChip] items with optional removal,
///   inline label editing ([editable] / [onChipEdited]), and an inline
///   [MagicFormField] + [MagicTextInput] for adding new chips ([onChipAdded]).
/// - [ChipVariant.draggable]: Reorderable chips supporting both pointer
///   drag-and-drop ([Draggable] + [DragTarget]) and accessible backward/forward
///   reorder controls emitting [onChipReordered].
class MagicChip extends StatefulWidget {
  /// Creates a [MagicChip] group or fallback single chip.
  const MagicChip({
    super.key,
    this.chips = const <ChipItem>[],
    this.label,
    this.child,
    this.variant = ChipVariant.basic,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.removable = false,
    this.editable = false,
    this.selectable = true,
    this.multiple = false,
    this.hideSelectionIndicator = false,
    this.orientation = ChipOrientation.horizontal,
    this.disabled = false,
    this.disableRipple = false,
    this.inputPlaceholder = 'New chip...',
    this.onChipAdded,
    this.onChipRemoved,
    this.onChipEdited,
    this.onChipReordered,
    this.onSelectionChanged,
    this.id,
    this.testId,
    this.ariaLabel,
  });

  /// Collection of chip descriptors rendered by this widget.
  final List<ChipItem> chips;

  /// Fallback single-chip text in [ChipVariant.basic] when [chips] is empty,
  /// or the [MagicFormField] label in [ChipVariant.input] mode.
  final String? label;

  /// Custom fallback content overriding [label] when [chips] is empty in
  /// [ChipVariant.basic] mode.
  final Widget? child;

  /// Interaction variant (`basic`, `selectable`, `input`, or `draggable`).
  final ChipVariant variant;

  /// Semantic color intent applied to chip containers, borders, and icons.
  final ColorIntent color;

  /// Standardized component size governing font size, icon size, and padding.
  final AtomicSize size;

  /// Whether chips display a remove button (can be overridden per [ChipItem]).
  final bool removable;

  /// Whether chips in [ChipVariant.input] mode can be edited inline (can be
  /// overridden per [ChipItem]).
  final bool editable;

  /// Whether chips in [ChipVariant.selectable] mode respond to selection taps
  /// (can be overridden per [ChipItem]).
  final bool selectable;

  /// Declares whether multiple chips may be selected simultaneously in
  /// [ChipVariant.selectable] mode.
  final bool multiple;

  /// Whether to hide the selection checkmark icon in [ChipVariant.selectable]
  /// mode.
  final bool hideSelectionIndicator;

  /// Layout direction for the chip collection (`horizontal` or `vertical`).
  final ChipOrientation orientation;

  /// Whether all chips and input/reorder controls are disabled.
  final bool disabled;

  /// Whether splash/ripple ink feedback is suppressed.
  final bool disableRipple;

  /// Placeholder text displayed inside the inline [MagicTextInput] in
  /// [ChipVariant.input] mode.
  final String inputPlaceholder;

  /// Callback invoked with a newly created [ChipItem] when the user submits
  /// non-empty text in [ChipVariant.input] mode.
  final ValueChanged<ChipItem>? onChipAdded;

  /// Callback invoked when a removable chip's delete action is triggered.
  final ValueChanged<ChipItem>? onChipRemoved;

  /// Callback invoked with the original [ChipItem] and its updated trimmed
  /// label after inline editing completes in [ChipVariant.input] mode.
  final void Function(ChipItem chip, String newLabel)? onChipEdited;

  /// Callback invoked with the reordered immutable chip list in
  /// [ChipVariant.draggable] mode.
  final ValueChanged<List<ChipItem>>? onChipReordered;

  /// Callback invoked when a chip's selection state changes in
  /// [ChipVariant.selectable] mode.
  final void Function(ChipItem chip, bool selected)? onSelectionChanged;

  /// Optional logical identifier for the chip container.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>`.
  final String? testId;

  /// Optional accessible semantics label for the chip group.
  final String? ariaLabel;

  @override
  State<MagicChip> createState() => _MagicChipState();
}

class _MagicChipState extends State<MagicChip> {
  final TextEditingController _inputController = TextEditingController();
  final TextEditingController _editController = TextEditingController();
  final FocusNode _editFocusNode = FocusNode();

  int? _editingIndex;

  @override
  void didUpdateWidget(covariant MagicChip oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (_editingIndex != null && _editingIndex! >= widget.chips.length) {
      _editingIndex = null;
    }
    if (oldWidget.variant != widget.variant || widget.disabled) {
      _editingIndex = null;
    }
  }

  @override
  void dispose() {
    _inputController.dispose();
    _editController.dispose();
    _editFocusNode.dispose();
    super.dispose();
  }

  EdgeInsets _chipPadding(AtomicSize size) => switch (size) {
    AtomicSize.xs => const EdgeInsets.symmetric(horizontal: 6, vertical: 0),
    AtomicSize.sm => const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
    AtomicSize.md => const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
    AtomicSize.lg => const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
    AtomicSize.xl => const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
  };

  double _chipIconSize(AtomicSize size) => switch (size) {
    AtomicSize.xs => 14,
    AtomicSize.sm => 16,
    AtomicSize.md => 18,
    AtomicSize.lg => 20,
    AtomicSize.xl => 22,
  };

  String _initialsFor(ChipItem chip) {
    final source = (chip.avatarAlt ?? chip.label).trim();
    if (source.isEmpty) {
      return '?';
    }
    final parts = source.split(RegExp(r'\s+'));
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return source[0].toUpperCase();
  }

  Widget? _buildAvatar({
    required ChipItem chip,
    required Color iconColor,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
  }) {
    final iconSize = _chipIconSize(widget.size);
    final src = chip.avatarSrc?.trim();
    if (src != null && src.isNotEmpty) {
      final radius = (iconSize / 2) + 2;
      final initials = _initialsFor(chip);
      return CircleAvatar(
        radius: radius,
        backgroundColor: intentColors.container,
        foregroundColor: intentColors.onContainer,
        child: ClipOval(
          child: Image.network(
            src,
            width: radius * 2,
            height: radius * 2,
            fit: BoxFit.cover,
            semanticLabel: chip.avatarAlt ?? chip.label,
            errorBuilder: (context, error, stackTrace) => Center(
              child: Text(
                initials,
                style: TextStyle(
                  fontSize: (metrics.fontSize - 3).clamp(9, 14).toDouble(),
                  fontWeight: FontWeight.w600,
                  color: intentColors.onContainer,
                ),
              ),
            ),
          ),
        ),
      );
    }

    final resolvedIcon = resolveMagicIconData(
      icon: chip.leadingIcon,
      iconName: chip.leadingIconName,
    );
    if (resolvedIcon != null) {
      return Icon(resolvedIcon, size: iconSize, color: iconColor);
    }
    return null;
  }

  void _handleAddChip(String rawValue) {
    if (widget.disabled) {
      return;
    }
    final trimmed = rawValue.trim();
    if (trimmed.isEmpty) {
      return;
    }
    _inputController.clear();
    widget.onChipAdded?.call(ChipItem(label: trimmed));
  }

  void _startEditing(int index, ChipItem chip) {
    setState(() {
      _editingIndex = index;
      _editController.text = chip.label;
      _editController.selection = TextSelection(
        baseOffset: 0,
        extentOffset: chip.label.length,
      );
    });
    _editFocusNode.requestFocus();
  }

  void _commitEdit(int index, ChipItem chip, bool isRemovable) {
    final trimmed = _editController.text.trim();
    setState(() {
      _editingIndex = null;
    });
    if (trimmed.isEmpty) {
      if (isRemovable) {
        widget.onChipRemoved?.call(chip);
      }
      return;
    }
    if (trimmed != chip.label) {
      widget.onChipEdited?.call(chip, trimmed);
    }
  }

  void _cancelEdit() {
    setState(() {
      _editingIndex = null;
    });
  }

  void _reorderChip(int fromIndex, int toIndex) {
    if (widget.disabled ||
        fromIndex == toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= widget.chips.length ||
        toIndex >= widget.chips.length) {
      return;
    }
    final updated = List<ChipItem>.of(widget.chips);
    final moved = updated.removeAt(fromIndex);
    updated.insert(toIndex, moved);
    widget.onChipReordered?.call(List<ChipItem>.unmodifiable(updated));
  }

  Widget _layoutChips(List<Widget> children) {
    if (widget.orientation == ChipOrientation.vertical) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          for (int i = 0; i < children.length; i++) ...<Widget>[
            if (i > 0) const SizedBox(height: 8),
            children[i],
          ],
        ],
      );
    }

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: children,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final intentColors = MagicTheme.resolveIntent(context, widget.color);
    final metrics = MagicTheme.metricsFor(widget.size);
    final disabledTextColor = scheme.onSurface.withValues(alpha: 0.38);

    Widget content = switch (widget.variant) {
      ChipVariant.basic => _buildBasicVariant(
        scheme: scheme,
        intentColors: intentColors,
        metrics: metrics,
        disabledTextColor: disabledTextColor,
      ),
      ChipVariant.selectable => _buildSelectableVariant(
        scheme: scheme,
        intentColors: intentColors,
        metrics: metrics,
        disabledTextColor: disabledTextColor,
      ),
      ChipVariant.input => _buildInputVariant(
        scheme: scheme,
        intentColors: intentColors,
        metrics: metrics,
        disabledTextColor: disabledTextColor,
      ),
      ChipVariant.draggable => _buildDraggableVariant(
        scheme: scheme,
        intentColors: intentColors,
        metrics: metrics,
        disabledTextColor: disabledTextColor,
      ),
    };

    if (widget.disableRipple) {
      content = Theme(
        data: theme.copyWith(splashFactory: NoSplash.splashFactory),
        child: content,
      );
    }

    if (widget.testId != null) {
      content = KeyedSubtree(
        key: ValueKey<String>(widget.testId!),
        child: content,
      );
    }

    return Semantics(
      container: true,
      enabled: !widget.disabled,
      label: widget.ariaLabel ?? widget.label,
      child: content,
    );
  }

  Widget _buildBasicVariant({
    required ColorScheme scheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
    required Color disabledTextColor,
  }) {
    final padding = _chipPadding(widget.size);
    final iconSize = _chipIconSize(widget.size);

    if (widget.chips.isEmpty) {
      if (widget.child == null &&
          (widget.label == null || widget.label!.isEmpty)) {
        return const SizedBox.shrink();
      }
      final isDisabled = widget.disabled;
      final isRemovable = widget.removable && !isDisabled;
      final labelStyle = TextStyle(
        fontSize: metrics.fontSize,
        color: isDisabled ? disabledTextColor : intentColors.onContainer,
      );

      return Chip(
        label: widget.child != null
            ? DefaultTextStyle.merge(style: labelStyle, child: widget.child!)
            : Text(widget.label!, style: labelStyle),
        labelStyle: labelStyle,
        backgroundColor: isDisabled
            ? scheme.onSurface.withValues(alpha: 0.08)
            : intentColors.container.withValues(alpha: 0.55),
        side: BorderSide(
          color: isDisabled
              ? scheme.onSurface.withValues(alpha: 0.12)
              : intentColors.main.withValues(alpha: 0.35),
        ),
        padding: padding,
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
        deleteIcon: isRemovable
            ? Icon(Icons.cancel, size: iconSize, color: intentColors.onContainer)
            : null,
        deleteButtonTooltipMessage: isRemovable
            ? 'Remove ${widget.label ?? 'chip'}'
            : null,
        onDeleted: isRemovable
            ? () => widget.onChipRemoved?.call(
                ChipItem(label: widget.label ?? ''),
              )
            : null,
      );
    }

    final chipWidgets = <Widget>[
      for (final chip in widget.chips)
        _buildSingleBasicChip(
          chip: chip,
          scheme: scheme,
          intentColors: intentColors,
          metrics: metrics,
          disabledTextColor: disabledTextColor,
          padding: padding,
          iconSize: iconSize,
        ),
    ];

    return _layoutChips(chipWidgets);
  }

  Widget _buildSingleBasicChip({
    required ChipItem chip,
    required ColorScheme scheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
    required Color disabledTextColor,
    required EdgeInsets padding,
    required double iconSize,
  }) {
    final isDisabled = widget.disabled || chip.disabled;
    final isRemovable = (chip.removable ?? widget.removable) && !isDisabled;
    final foreground = isDisabled
        ? disabledTextColor
        : intentColors.onContainer;

    return Chip(
      avatar: _buildAvatar(
        chip: chip,
        iconColor: foreground,
        intentColors: intentColors,
        metrics: metrics,
      ),
      label: Text(chip.label),
      labelStyle: TextStyle(fontSize: metrics.fontSize, color: foreground),
      backgroundColor: isDisabled
          ? scheme.onSurface.withValues(alpha: 0.08)
          : intentColors.container.withValues(alpha: 0.55),
      side: BorderSide(
        color: isDisabled
            ? scheme.onSurface.withValues(alpha: 0.12)
            : intentColors.main.withValues(alpha: 0.35),
      ),
      padding: padding,
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      deleteIcon: isRemovable
          ? Icon(Icons.cancel, size: iconSize, color: foreground)
          : null,
      deleteButtonTooltipMessage: isRemovable ? 'Remove ${chip.label}' : null,
      onDeleted: isRemovable ? () => widget.onChipRemoved?.call(chip) : null,
    );
  }

  Widget _buildSelectableVariant({
    required ColorScheme scheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
    required Color disabledTextColor,
  }) {
    final padding = _chipPadding(widget.size);

    final chipWidgets = <Widget>[
      for (final chip in widget.chips)
        Builder(
          builder: (context) {
            final isDisabled = widget.disabled || chip.disabled;
            final canSelect =
                (chip.selectable ?? widget.selectable) && !isDisabled;
            final foreground = isDisabled
                ? disabledTextColor
                : (chip.selected ? intentColors.onContainer : scheme.onSurface);

            return FilterChip(
              avatar: _buildAvatar(
                chip: chip,
                iconColor: foreground,
                intentColors: intentColors,
                metrics: metrics,
              ),
              label: Text(chip.label),
              labelStyle: TextStyle(
                fontSize: metrics.fontSize,
                color: foreground,
              ),
              selected: chip.selected,
              showCheckmark: !widget.hideSelectionIndicator,
              checkmarkColor: intentColors.onContainer,
              selectedColor: intentColors.container,
              backgroundColor: scheme.surface,
              disabledColor: scheme.onSurface.withValues(alpha: 0.08),
              side: BorderSide(
                color: isDisabled
                    ? scheme.onSurface.withValues(alpha: 0.12)
                    : (chip.selected ? intentColors.main : scheme.outline),
              ),
              padding: padding,
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              onSelected: canSelect
                  ? (bool nextSelected) {
                      widget.onSelectionChanged?.call(chip, nextSelected);
                    }
                  : null,
            );
          },
        ),
    ];

    return _layoutChips(chipWidgets);
  }

  Widget _buildInputVariant({
    required ColorScheme scheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
    required Color disabledTextColor,
  }) {
    final padding = _chipPadding(widget.size);
    final iconSize = _chipIconSize(widget.size);

    final chipWidgets = <Widget>[
      for (int i = 0; i < widget.chips.length; i++)
        _buildSingleInputChip(
          index: i,
          chip: widget.chips[i],
          scheme: scheme,
          intentColors: intentColors,
          metrics: metrics,
          disabledTextColor: disabledTextColor,
          padding: padding,
          iconSize: iconSize,
        ),
    ];

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        if (chipWidgets.isNotEmpty) ...<Widget>[
          _layoutChips(chipWidgets),
          const SizedBox(height: 8),
        ],
        MagicFormField(
          label: widget.label,
          size: widget.size,
          disabled: widget.disabled,
          child: MagicTextInput(
            controller: _inputController,
            placeholder: widget.inputPlaceholder,
            size: widget.size,
            disabled: widget.disabled,
            textInputAction: TextInputAction.done,
            onSubmitted: _handleAddChip,
          ),
        ),
      ],
    );
  }

  Widget _buildSingleInputChip({
    required int index,
    required ChipItem chip,
    required ColorScheme scheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
    required Color disabledTextColor,
    required EdgeInsets padding,
    required double iconSize,
  }) {
    final isDisabled = widget.disabled || chip.disabled;
    final isRemovable = (chip.removable ?? widget.removable) && !isDisabled;
    final isEditable = (chip.editable ?? widget.editable) && !isDisabled;
    final foreground = isDisabled
        ? disabledTextColor
        : intentColors.onContainer;

    if (_editingIndex == index && isEditable) {
      return Container(
        key: ValueKey<String>('magic-chip-editor-$index'),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(
          color: intentColors.container.withValues(alpha: 0.4),
          borderRadius: const BorderRadius.all(Radius.circular(8)),
          border: Border.all(color: intentColors.main, width: 1.5),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            SizedBox(
              width: 120,
              child: TextField(
                key: ValueKey<String>('magic-chip-edit-field-$index'),
                controller: _editController,
                focusNode: _editFocusNode,
                autofocus: true,
                style: TextStyle(fontSize: metrics.fontSize),
                decoration: const InputDecoration(
                  isDense: true,
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 4),
                ),
                onSubmitted: (_) => _commitEdit(index, chip, isRemovable),
              ),
            ),
            IconButton(
              icon: Icon(Icons.check, size: iconSize),
              tooltip: 'Save ${chip.label}',
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
              onPressed: () => _commitEdit(index, chip, isRemovable),
            ),
            IconButton(
              icon: Icon(Icons.close, size: iconSize),
              tooltip: 'Cancel editing ${chip.label}',
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 28, minHeight: 28),
              onPressed: _cancelEdit,
            ),
          ],
        ),
      );
    }

    return InputChip(
      avatar: _buildAvatar(
        chip: chip,
        iconColor: foreground,
        intentColors: intentColors,
        metrics: metrics,
      ),
      label: Text(chip.label),
      labelStyle: TextStyle(fontSize: metrics.fontSize, color: foreground),
      isEnabled: !isDisabled,
      selected: chip.selected,
      selectedColor: intentColors.container,
      backgroundColor: isDisabled
          ? scheme.onSurface.withValues(alpha: 0.08)
          : intentColors.container.withValues(alpha: 0.45),
      disabledColor: scheme.onSurface.withValues(alpha: 0.08),
      side: BorderSide(
        color: isDisabled
            ? scheme.onSurface.withValues(alpha: 0.12)
            : intentColors.main.withValues(alpha: 0.35),
      ),
      padding: padding,
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      tooltip: isEditable ? 'Edit ${chip.label}' : null,
      onPressed: isEditable ? () => _startEditing(index, chip) : null,
      deleteIcon: isRemovable
          ? Icon(Icons.cancel, size: iconSize, color: foreground)
          : null,
      deleteButtonTooltipMessage: isRemovable ? 'Remove ${chip.label}' : null,
      onDeleted: isRemovable ? () => widget.onChipRemoved?.call(chip) : null,
    );
  }

  Widget _buildDraggableVariant({
    required ColorScheme scheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
    required Color disabledTextColor,
  }) {
    final padding = _chipPadding(widget.size);
    final iconSize = _chipIconSize(widget.size);
    final isVertical = widget.orientation == ChipOrientation.vertical;

    final chipWidgets = <Widget>[
      for (int i = 0; i < widget.chips.length; i++)
        _buildSingleDraggableChip(
          index: i,
          chip: widget.chips[i],
          isVertical: isVertical,
          scheme: scheme,
          intentColors: intentColors,
          metrics: metrics,
          disabledTextColor: disabledTextColor,
          padding: padding,
          iconSize: iconSize,
        ),
    ];

    return _layoutChips(chipWidgets);
  }

  Widget _buildSingleDraggableChip({
    required int index,
    required ChipItem chip,
    required bool isVertical,
    required ColorScheme scheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
    required Color disabledTextColor,
    required EdgeInsets padding,
    required double iconSize,
  }) {
    final isDisabled = widget.disabled || chip.disabled;
    final isRemovable = (chip.removable ?? widget.removable) && !isDisabled;
    final foreground = isDisabled
        ? disabledTextColor
        : intentColors.onContainer;
    final canMoveBack = !isDisabled && index > 0;
    final canMoveForward = !isDisabled && index < widget.chips.length - 1;

    Widget buildChipVisual({required bool isDropTarget}) {
      final leadingAvatar =
          _buildAvatar(
            chip: chip,
            iconColor: foreground,
            intentColors: intentColors,
            metrics: metrics,
          ) ??
          Icon(Icons.drag_indicator, size: iconSize, color: foreground);

      return Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Chip(
            avatar: leadingAvatar,
            label: Text(
              chip.label,
              style: TextStyle(fontSize: metrics.fontSize, color: foreground),
            ),
            backgroundColor: isDisabled
                ? scheme.onSurface.withValues(alpha: 0.08)
                : (isDropTarget
                      ? intentColors.container
                      : intentColors.container.withValues(alpha: 0.55)),
            side: BorderSide(
              color: isDropTarget
                  ? intentColors.main
                  : (isDisabled
                        ? scheme.onSurface.withValues(alpha: 0.12)
                        : intentColors.main.withValues(alpha: 0.35)),
              width: isDropTarget ? 2 : 1,
            ),
            padding: padding,
            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
            deleteIcon: isRemovable
                ? Icon(Icons.cancel, size: iconSize, color: foreground)
                : null,
            deleteButtonTooltipMessage: isRemovable
                ? 'Remove ${chip.label}'
                : null,
            onDeleted: isRemovable
                ? () => widget.onChipRemoved?.call(chip)
                : null,
          ),
          if (canMoveBack)
            IconButton(
              icon: Icon(
                isVertical ? Icons.arrow_upward : Icons.arrow_back,
                size: (iconSize - 2).clamp(12, 20).toDouble(),
                color: foreground,
              ),
              tooltip: 'Move ${chip.label} backward',
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 24, minHeight: 24),
              onPressed: () => _reorderChip(index, index - 1),
            ),
          if (canMoveForward)
            IconButton(
              icon: Icon(
                isVertical ? Icons.arrow_downward : Icons.arrow_forward,
                size: (iconSize - 2).clamp(12, 20).toDouble(),
                color: foreground,
              ),
              tooltip: 'Move ${chip.label} forward',
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 24, minHeight: 24),
              onPressed: () => _reorderChip(index, index + 1),
            ),
        ],
      );
    }

    return DragTarget<int>(
      onWillAcceptWithDetails: (details) =>
          !widget.disabled && details.data != index,
      onAcceptWithDetails: (details) => _reorderChip(details.data, index),
      builder: (context, candidateData, rejectedData) {
        final isDropTarget = candidateData.isNotEmpty;
        final chipWidget = buildChipVisual(isDropTarget: isDropTarget);

        if (isDisabled) {
          return chipWidget;
        }

        return Draggable<int>(
          data: index,
          feedback: Material(
            elevation: 4,
            color: Colors.transparent,
            borderRadius: const BorderRadius.all(Radius.circular(8)),
            child: chipWidget,
          ),
          childWhenDragging: Opacity(opacity: 0.4, child: chipWidget),
          child: chipWidget,
        );
      },
    );
  }
}
