/// Material 3 stepper molecule supporting horizontal and vertical layouts,
/// linear and non-linear navigation, alternative label placement, optional
/// steps, error states with messages, and controlled/uncontrolled active step.
library;

import 'package:flutter/material.dart';

import '../../core/magic_icon.dart';
import '../../interfaces/atomic_interfaces.dart';
import '../../theme/magic_theme.dart';

/// Signature for building body content beneath a step in vertical [MagicStepper].
typedef MagicStepContentBuilder = Widget Function(
  BuildContext context,
  MagicStepItem step,
  int index,
);

/// Material 3 stepper molecule rendering a sequence of [MagicStepItem] stages
/// across horizontal or vertical axes, supporting linear/non-linear navigation,
/// completed/active/error states, optional step badges, and custom icons.
///
/// Mirrors `StepperMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
class MagicStepper extends StatefulWidget {
  /// Creates a [MagicStepper].
  const MagicStepper({
    super.key,
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    required this.steps,
    this.activeStep,
    this.defaultActiveStep = 0,
    this.orientation = MagicStepperOrientation.horizontal,
    this.linear = true,
    this.alternativeLabel = false,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.onStepChange,
    this.stepContentBuilder,
  });

  /// Optional logical identifier for the stepper.
  final String? id;

  /// Optional test key mapped to `ValueKey<String>` on the root container.
  final String? testId;

  /// Optional accessible semantics label for the stepper workflow.
  final String? ariaLabel;

  /// Whether all step interactions are disabled.
  final bool disabled;

  /// Ordered list of workflow step descriptors.
  final List<MagicStepItem> steps;

  /// Controlled zero-based index of the active step.
  final int? activeStep;

  /// Initial zero-based active step index for uncontrolled usage.
  final int defaultActiveStep;

  /// Layout axis (`horizontal` or `vertical`).
  final MagicStepperOrientation orientation;

  /// When `true`, prevents skipping ahead past uncompleted non-optional steps.
  final bool linear;

  /// When `true` in horizontal mode, stacks labels beneath step indicators.
  final bool alternativeLabel;

  /// Semantic accent color intent for active and completed steps.
  final ColorIntent color;

  /// Standardized component density/size preset.
  final AtomicSize size;

  /// Callback invoked with the selected step index when a step is activated.
  final ValueChanged<int>? onStepChange;

  /// Optional builder for vertical step body content rendered under the active
  /// step.
  final MagicStepContentBuilder? stepContentBuilder;

  @override
  State<MagicStepper> createState() => _MagicStepperState();
}

class _MagicStepperState extends State<MagicStepper> {
  late int _internalActiveStep;

  @override
  void initState() {
    super.initState();
    _internalActiveStep = _clampIndex(widget.defaultActiveStep);
  }

  @override
  void didUpdateWidget(covariant MagicStepper oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.activeStep == null && oldWidget.activeStep != null) {
      _internalActiveStep = _clampIndex(oldWidget.activeStep!);
    } else if (widget.steps.length != oldWidget.steps.length) {
      _internalActiveStep = _clampIndex(_internalActiveStep);
    }
  }

  int _clampIndex(int index) {
    if (widget.steps.isEmpty) {
      return 0;
    }
    return index.clamp(0, widget.steps.length - 1);
  }

  int get _effectiveActiveStep {
    if (widget.steps.isEmpty) {
      return 0;
    }
    return _clampIndex(widget.activeStep ?? _internalActiveStep);
  }

  MagicStepStatus _resolveStatus(MagicStepItem step, int index, int active) {
    if (step.status != null) {
      return step.status!;
    }
    if (step.error) {
      return MagicStepStatus.error;
    }
    if (step.completed) {
      return MagicStepStatus.completed;
    }
    if (index == active) {
      return MagicStepStatus.active;
    }
    return MagicStepStatus.pending;
  }

  bool _canActivateStep(int index, int active) {
    if (widget.disabled || widget.steps[index].disabled) {
      return false;
    }
    if (!widget.linear || index <= active) {
      return true;
    }
    for (int i = 0; i < index; i++) {
      final prior = widget.steps[i];
      final status = _resolveStatus(prior, i, active);
      if (status != MagicStepStatus.completed && !prior.optional) {
        return false;
      }
    }
    return true;
  }

  void _handleStepTap(int index, int active) {
    if (!_canActivateStep(index, active)) {
      return;
    }
    if (widget.activeStep == null) {
      setState(() {
        _internalActiveStep = index;
      });
    }
    widget.onStepChange?.call(index);
  }

  double _circleDiameterFor(AtomicSize size) => switch (size) {
    AtomicSize.xs => 22,
    AtomicSize.sm => 26,
    AtomicSize.md => 30,
    AtomicSize.lg => 34,
    AtomicSize.xl => 38,
  };

  Widget _buildStepCircle({
    required MagicStepItem step,
    required int index,
    required MagicStepStatus status,
    required ColorScheme scheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
  }) {
    final bool stepDisabled = widget.disabled || step.disabled;
    final double diameter = _circleDiameterFor(widget.size);

    Color bgColor;
    Color fgColor;
    Border? border;

    if (stepDisabled) {
      bgColor = scheme.surfaceContainerHighest;
      fgColor = scheme.onSurface.withValues(alpha: 0.38);
    } else {
      switch (status) {
        case MagicStepStatus.error:
          bgColor = scheme.error;
          fgColor = scheme.onError;
        case MagicStepStatus.completed:
        case MagicStepStatus.active:
          bgColor = intentColors.main;
          fgColor = intentColors.onMain;
        case MagicStepStatus.pending:
          bgColor = scheme.surfaceContainerHighest;
          fgColor = scheme.onSurfaceVariant;
          border = Border.all(color: scheme.outlineVariant);
      }
    }

    final IconData? customIcon = resolveMagicIconData(
      icon: step.icon,
      iconName: step.iconName,
    );

    final Widget indicatorChild;
    if (status == MagicStepStatus.error) {
      indicatorChild = Icon(
        Icons.priority_high,
        size: diameter * 0.56,
        color: fgColor,
      );
    } else if (status == MagicStepStatus.completed) {
      indicatorChild = Icon(
        Icons.check,
        size: diameter * 0.58,
        color: fgColor,
      );
    } else if (customIcon != null) {
      indicatorChild = MagicIcon(
        icon: customIcon,
        size: diameter * 0.56,
        color: fgColor,
      );
    } else {
      indicatorChild = Text(
        '${index + 1}',
        style: TextStyle(
          color: fgColor,
          fontSize: (metrics.fontSize - 1).clamp(11, 16).toDouble(),
          fontWeight: FontWeight.w600,
        ),
      );
    }

    return Container(
      width: diameter,
      height: diameter,
      decoration: BoxDecoration(
        color: bgColor,
        shape: BoxShape.circle,
        border: border,
      ),
      alignment: Alignment.center,
      child: indicatorChild,
    );
  }

  Widget _buildStepText({
    required MagicStepItem step,
    required MagicStepStatus status,
    required ColorScheme scheme,
    required TextTheme textTheme,
    required MagicSizeMetrics metrics,
    required CrossAxisAlignment alignment,
  }) {
    final bool stepDisabled = widget.disabled || step.disabled;
    final bool isError = status == MagicStepStatus.error;
    final bool isActive = status == MagicStepStatus.active;

    final Color labelColor = stepDisabled
        ? scheme.onSurface.withValues(alpha: 0.38)
        : (isError ? scheme.error : scheme.onSurface);
    final Color subtitleColor = stepDisabled
        ? scheme.onSurface.withValues(alpha: 0.38)
        : scheme.onSurfaceVariant;

    final String? optionalText = step.optional
        ? (step.optionalLabel ?? 'Optional')
        : null;
    final bool showErrorMsg =
        isError && step.errorMessage != null && step.errorMessage!.isNotEmpty;

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: alignment,
      children: <Widget>[
        Text(
          step.label,
          textAlign: alignment == CrossAxisAlignment.center
              ? TextAlign.center
              : TextAlign.start,
          style: textTheme.bodyMedium?.copyWith(
            color: labelColor,
            fontSize: metrics.fontSize,
            fontWeight: isActive || isError ? FontWeight.w600 : FontWeight.w500,
          ),
        ),
        if (optionalText != null)
          Text(
            optionalText,
            textAlign: alignment == CrossAxisAlignment.center
                ? TextAlign.center
                : TextAlign.start,
            style: textTheme.bodySmall?.copyWith(
              color: subtitleColor,
              fontSize: (metrics.fontSize - 2).clamp(10, 14).toDouble(),
            ),
          ),
        if (step.description != null && step.description!.isNotEmpty)
          Text(
            step.description!,
            textAlign: alignment == CrossAxisAlignment.center
                ? TextAlign.center
                : TextAlign.start,
            style: textTheme.bodySmall?.copyWith(
              color: subtitleColor,
              fontSize: (metrics.fontSize - 2).clamp(10, 14).toDouble(),
            ),
          ),
        if (showErrorMsg)
          Text(
            step.errorMessage!,
            textAlign: alignment == CrossAxisAlignment.center
                ? TextAlign.center
                : TextAlign.start,
            style: textTheme.bodySmall?.copyWith(
              color: scheme.error,
              fontSize: (metrics.fontSize - 2).clamp(10, 14).toDouble(),
              fontWeight: FontWeight.w500,
            ),
          ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.steps.isEmpty) {
      return SizedBox.shrink(
        key: widget.testId != null ? ValueKey<String>(widget.testId!) : null,
      );
    }

    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final textTheme = theme.textTheme;
    final intentColors = MagicTheme.resolveIntent(context, widget.color);
    final metrics = MagicTheme.metricsFor(widget.size);
    final int active = _effectiveActiveStep;

    final Widget body =
        widget.orientation == MagicStepperOrientation.vertical
        ? _buildVerticalStepper(
            context: context,
            scheme: scheme,
            textTheme: textTheme,
            intentColors: intentColors,
            metrics: metrics,
            active: active,
          )
        : _buildHorizontalStepper(
            context: context,
            scheme: scheme,
            textTheme: textTheme,
            intentColors: intentColors,
            metrics: metrics,
            active: active,
          );

    return Semantics(
      container: true,
      explicitChildNodes: true,
      enabled: !widget.disabled,
      label: widget.ariaLabel ?? 'Stepper',
      child: KeyedSubtree(
        key: widget.testId != null ? ValueKey<String>(widget.testId!) : null,
        child: body,
      ),
    );
  }

  Widget _buildHorizontalStepper({
    required BuildContext context,
    required ColorScheme scheme,
    required TextTheme textTheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
    required int active,
  }) {
    final double circleDiameter = _circleDiameterFor(widget.size);

    return LayoutBuilder(
      builder: (context, constraints) {
        final bool hasBoundedWidth = constraints.hasBoundedWidth;
        final List<Widget> children = <Widget>[];

        for (int i = 0; i < widget.steps.length; i++) {
          final step = widget.steps[i];
          final status = _resolveStatus(step, i, active);
          final bool canTap = _canActivateStep(i, active);

          final Widget circle = _buildStepCircle(
            step: step,
            index: i,
            status: status,
            scheme: scheme,
            intentColors: intentColors,
            metrics: metrics,
          );

          final Widget stepWidget = Semantics(
            button: canTap,
            selected: i == active,
            enabled: !(widget.disabled || step.disabled),
            label: step.label,
            child: InkWell(
              key: widget.testId != null
                  ? ValueKey<String>('${widget.testId}-step-${step.id}')
                  : null,
              borderRadius: const BorderRadius.all(Radius.circular(8)),
              onTap: canTap ? () => _handleStepTap(i, active) : null,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                child: widget.alternativeLabel
                    ? Column(
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          circle,
                          const SizedBox(height: 6),
                          _buildStepText(
                            step: step,
                            status: status,
                            scheme: scheme,
                            textTheme: textTheme,
                            metrics: metrics,
                            alignment: CrossAxisAlignment.center,
                          ),
                        ],
                      )
                    : Row(
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          circle,
                          const SizedBox(width: 8),
                          _buildStepText(
                            step: step,
                            status: status,
                            scheme: scheme,
                            textTheme: textTheme,
                            metrics: metrics,
                            alignment: CrossAxisAlignment.start,
                          ),
                        ],
                      ),
              ),
            ),
          );

          children.add(stepWidget);

          if (i < widget.steps.length - 1) {
            final bool connectorActive = status == MagicStepStatus.completed;
            final Widget connectorLine = Container(
              height: 2,
              margin: EdgeInsets.only(
                left: 6,
                right: 6,
                top: widget.alternativeLabel ? circleDiameter / 2 : 0,
              ),
              color: connectorActive
                  ? intentColors.main
                  : scheme.outlineVariant,
            );

            if (hasBoundedWidth) {
              children.add(Expanded(child: connectorLine));
            } else {
              children.add(SizedBox(width: 32, child: connectorLine));
            }
          }
        }

        final row = Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: widget.alternativeLabel
              ? CrossAxisAlignment.start
              : CrossAxisAlignment.center,
          children: children,
        );

        if (!hasBoundedWidth) {
          return SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: row,
          );
        }

        return SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: ConstrainedBox(
            constraints: BoxConstraints(minWidth: constraints.maxWidth),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: widget.alternativeLabel
                  ? CrossAxisAlignment.start
                  : CrossAxisAlignment.center,
              children: <Widget>[
                for (final child in children)
                  if (child is Expanded)
                    SizedBox(width: 24, child: child.child)
                  else
                    child,
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildVerticalStepper({
    required BuildContext context,
    required ColorScheme scheme,
    required TextTheme textTheme,
    required MagicIntentColorSet intentColors,
    required MagicSizeMetrics metrics,
    required int active,
  }) {
    final double circleDiameter = _circleDiameterFor(widget.size);

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        for (int i = 0; i < widget.steps.length; i++) ...<Widget>[
          Builder(
            builder: (context) {
              final step = widget.steps[i];
              final status = _resolveStatus(step, i, active);
              final bool canTap = _canActivateStep(i, active);
              final bool isLast = i == widget.steps.length - 1;
              final bool showCustomBody =
                  i == active && widget.stepContentBuilder != null;

              return IntrinsicHeight(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: <Widget>[
                    SizedBox(
                      width: circleDiameter,
                      child: Column(
                        children: <Widget>[
                          Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: _buildStepCircle(
                              step: step,
                              index: i,
                              status: status,
                              scheme: scheme,
                              intentColors: intentColors,
                              metrics: metrics,
                            ),
                          ),
                          if (!isLast)
                            Expanded(
                              child: Container(
                                width: 2,
                                margin: const EdgeInsets.symmetric(vertical: 4),
                                color: status == MagicStepStatus.completed
                                    ? intentColors.main
                                    : scheme.outlineVariant,
                              ),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: <Widget>[
                          Semantics(
                            button: canTap,
                            selected: i == active,
                            enabled: !(widget.disabled || step.disabled),
                            label: step.label,
                            child: InkWell(
                              key: widget.testId != null
                                  ? ValueKey<String>(
                                      '${widget.testId}-step-${step.id}',
                                    )
                                  : null,
                              borderRadius: const BorderRadius.all(
                                Radius.circular(8),
                              ),
                              onTap: canTap
                                  ? () => _handleStepTap(i, active)
                                  : null,
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 4,
                                  vertical: 4,
                                ),
                                child: _buildStepText(
                                  step: step,
                                  status: status,
                                  scheme: scheme,
                                  textTheme: textTheme,
                                  metrics: metrics,
                                  alignment: CrossAxisAlignment.start,
                                ),
                              ),
                            ),
                          ),
                          if (showCustomBody)
                            Padding(
                              padding: const EdgeInsets.fromLTRB(4, 8, 4, 12),
                              child: widget.stepContentBuilder!(
                                context,
                                step,
                                i,
                              ),
                            )
                          else if (!isLast)
                            const SizedBox(height: 16),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ],
    );
  }
}
