/// Widgetbook 3.25 use cases for [MagicStepper].
library;

import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:widgetbook/widgetbook.dart';

import '../widgetbook_helpers.dart';

/// Builds the [WidgetbookComponent] catalog entry for [MagicStepper].
WidgetbookComponent buildMagicStepperComponent() {
  return WidgetbookComponent(
    name: 'MagicStepper',
    useCases: <WidgetbookUseCase>[
      WidgetbookUseCase(
        name: 'Interactive Workflow Playground',
        builder: (context) {
          final orientation =
              context.knobs.object.dropdown<MagicStepperOrientation>(
                label: 'Orientation',
                options: MagicStepperOrientation.values,
                initialOption: MagicStepperOrientation.horizontal,
                labelBuilder: (v) => v.name,
              );
          final color = colorIntentKnob(context);
          final size = atomicSizeKnob(context);
          final linear = context.knobs.boolean(
            label: 'Linear',
            initialValue: true,
          );
          final alternativeLabel = context.knobs.boolean(
            label: 'Alternative Label',
            initialValue: false,
          );
          final disabled = context.knobs.boolean(
            label: 'Disabled',
            initialValue: false,
          );

          return _StepperPlayground(
            orientation: orientation,
            color: color,
            size: size,
            linear: linear,
            alternativeLabel: alternativeLabel,
            disabled: disabled,
          );
        },
      ),
      WidgetbookUseCase(
        name: 'Vertical With Step Content',
        builder: (context) => Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: MagicStepper(
                orientation: MagicStepperOrientation.vertical,
                defaultActiveStep: 1,
                steps: const <MagicStepItem>[
                  MagicStepItem(
                    id: 'account',
                    label: 'Create Account',
                    description: 'Verify workspace email',
                    completed: true,
                  ),
                  MagicStepItem(
                    id: 'profile',
                    label: 'Team Preferences',
                    description: 'Optional role customization',
                    optional: true,
                  ),
                  MagicStepItem(
                    id: 'deploy',
                    label: 'Launch Workspace',
                    description: 'Provision services and keys',
                  ),
                ],
                stepContentBuilder: (context, step, index) => Text(
                  'Step ${index + 1}: Configure ${step.label}.',
                ),
              ),
            ),
          ),
        ),
      ),
    ],
  );
}

class _StepperPlayground extends StatefulWidget {
  const _StepperPlayground({
    required this.orientation,
    required this.color,
    required this.size,
    required this.linear,
    required this.alternativeLabel,
    required this.disabled,
  });

  final MagicStepperOrientation orientation;
  final ColorIntent color;
  final AtomicSize size;
  final bool linear;
  final bool alternativeLabel;
  final bool disabled;

  @override
  State<_StepperPlayground> createState() => _StepperPlaygroundState();
}

class _StepperPlaygroundState extends State<_StepperPlayground> {
  int _activeStep = 0;
  final Set<int> _completedSteps = <int>{};
  bool _hasStepError = false;

  void _next() {
    setState(() {
      _hasStepError = false;
      _completedSteps.add(_activeStep);
      if (_activeStep < 3) {
        _activeStep++;
      }
    });
  }

  void _back() {
    setState(() {
      if (_activeStep > 0) {
        _activeStep--;
      }
    });
  }

  void _reset() {
    setState(() {
      _activeStep = 0;
      _completedSteps.clear();
      _hasStepError = false;
    });
  }

  void _toggleError() {
    setState(() {
      _hasStepError = !_hasStepError;
    });
  }

  @override
  Widget build(BuildContext context) {
    final List<MagicStepItem> steps = <MagicStepItem>[
      MagicStepItem(
        id: 'details',
        label: 'Account',
        description: 'Credentials',
        iconName: 'person',
        completed: _completedSteps.contains(0),
      ),
      MagicStepItem(
        id: 'billing',
        label: 'Billing',
        description: 'Payment method',
        completed: _completedSteps.contains(1),
        error: _hasStepError && _activeStep == 1,
        errorMessage: _hasStepError && _activeStep == 1
            ? 'Card validation failed'
            : null,
      ),
      MagicStepItem(
        id: 'addons',
        label: 'Add-ons',
        optional: true,
        optionalLabel: 'Optional',
        completed: _completedSteps.contains(2),
      ),
      MagicStepItem(
        id: 'review',
        label: 'Review',
        description: 'Confirm & submit',
        completed: _completedSteps.contains(3),
      ),
    ];

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 680),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              MagicStepper(
                steps: steps,
                activeStep: _activeStep,
                orientation: widget.orientation,
                linear: widget.linear,
                alternativeLabel: widget.alternativeLabel,
                color: widget.color,
                size: widget.size,
                disabled: widget.disabled,
                onStepChange: (index) {
                  setState(() {
                    _activeStep = index;
                  });
                },
              ),
              const SizedBox(height: 20),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: <Widget>[
                  MagicButton(
                    label: 'Back',
                    variant: ButtonVariant.outlined,
                    disabled: widget.disabled || _activeStep == 0,
                    onPressed: _back,
                  ),
                  MagicButton(
                    label: _activeStep == steps.length - 1 ? 'Finish' : 'Next',
                    variant: ButtonVariant.filled,
                    color: widget.color,
                    disabled: widget.disabled,
                    onPressed: _next,
                  ),
                  MagicButton(
                    label: _hasStepError ? 'Clear Error' : 'Simulate Error',
                    variant: ButtonVariant.tonal,
                    color: ColorIntent.error,
                    disabled: widget.disabled || _activeStep != 1,
                    onPressed: _toggleError,
                  ),
                  MagicButton(
                    label: 'Reset',
                    variant: ButtonVariant.text,
                    disabled: widget.disabled,
                    onPressed: _reset,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
