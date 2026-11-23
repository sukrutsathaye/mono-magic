/// Atomic Design taxonomy and shared property contracts for Flutter Material 3
/// components, mirroring `@mono-magic/atomic-design-interfaces`.
library;

import 'package:flutter/widgets.dart';

/// Classification tier within Atomic Design methodology.
enum AtomicTier {
  /// Basic indivisible UI building block.
  atom,

  /// Functional group of atoms operating together.
  molecule,

  /// Complex UI section composed of molecules and atoms.
  organism,

  /// Page-level structural layout template.
  template,
}

/// Standardized cross-library component size scale.
enum AtomicSize {
  /// Extra-small size (28 dp height, 12 sp font).
  xs,

  /// Small size (32 dp height, 13 sp font).
  sm,

  /// Medium default size (40 dp height, 14 sp font).
  md,

  /// Large size (48 dp height, 16 sp font).
  lg,

  /// Extra-large size (56 dp height, 18 sp font).
  xl,
}

/// Semantic color intent mapped onto Material 3 scheme and semantic tokens.
enum ColorIntent {
  /// Primary brand emphasis color.
  primary,

  /// Secondary supporting accent color.
  secondary,

  /// Tertiary complementary highlight color.
  tertiary,

  /// Positive / confirmation semantic color.
  success,

  /// Caution / warning semantic color.
  warning,

  /// Destructive / error semantic color.
  error,

  /// Low-emphasis neutral surface/outline color.
  neutral,
}

/// Material 3 visual emphasis variant for buttons.
enum ButtonVariant {
  /// High-emphasis filled button.
  filled,

  /// Medium-emphasis filled tonal button.
  tonal,

  /// Medium-emphasis outlined button.
  outlined,

  /// Medium-emphasis elevated button with shadow.
  elevated,

  /// Low-emphasis text button.
  text,
}

/// Structural button kind matching Material 3 button families.
enum ButtonKind {
  /// Standard text/icon label button (`default` in TS contracts).
  standard,

  /// Compact circular icon-only button.
  icon,

  /// Standard floating action button (FAB).
  fab,

  /// Small floating action button (Mini FAB).
  miniFab,

  /// Extended floating action button with icon and label.
  extendedFab,
}

/// Corner shape override for buttons.
enum ButtonShape {
  /// Design-system default Material 3 corner radius (`default` in TS contracts).
  standard,

  /// Sharp square corners (0 dp radius).
  square,

  /// Rounded rectangle corners (8 dp radius).
  rounded,

  /// Full capsule / pill corners (999 dp radius).
  pill,
}

/// Anchor placement of a badge relative to its child widget.
enum BadgePosition {
  /// Positioned above and at the trailing edge.
  aboveAfter,

  /// Positioned above and at the leading edge.
  aboveBefore,

  /// Positioned below and at the trailing edge.
  belowAfter,

  /// Positioned below and at the leading edge.
  belowBefore,

  /// Positioned centered above the child.
  above,

  /// Positioned centered below the child.
  below,

  /// Positioned centered at the leading edge.
  before,

  /// Positioned centered at the trailing edge.
  after,
}

/// Selection cardinality for segmented button toggles.
enum ButtonToggleSelectionMode {
  /// Only one option may be selected at a time.
  single,

  /// Zero or more options may be selected simultaneously.
  multiple,
}

/// Visual appearance style for button toggle groups.
enum ButtonToggleAppearance {
  /// Standard Material 3 segmented button appearance.
  standard,

  /// Legacy compact toggle appearance.
  legacy,
}

/// Option descriptor for `MagicButtonToggle`.
@immutable
class ButtonToggleOption<T> {
  /// Creates a button toggle option.
  const ButtonToggleOption({
    required this.value,
    required this.label,
    this.icon,
    this.iconName,
    this.disabled = false,
    this.ariaLabel,
  });

  /// Strongly typed option value emitted when selected.
  final T value;

  /// Human-readable label shown inside the toggle segment.
  final String label;

  /// Optional native Material [IconData] displayed in the segment.
  final IconData? icon;

  /// Optional Material icon string name resolved via `MagicIcon`.
  final String? iconName;

  /// Whether this individual segment is disabled.
  final bool disabled;

  /// Accessible semantics label overriding [label].
  final String? ariaLabel;
}

/// Label placement relative to a checkbox control.
enum CheckBoxLabelPosition {
  /// Renders the label before the checkbox.
  before,

  /// Renders the label after the checkbox.
  after,
}

/// Hierarchical checklist task node used by `MagicCheckBox` subtask lists.
@immutable
class CheckBoxTask {
  /// Creates a checklist task item.
  const CheckBoxTask({
    this.id,
    required this.name,
    this.checked = false,
    this.disabled = false,
    this.subtasks = const <CheckBoxTask>[],
  });

  /// Optional stable identifier for the task.
  final String? id;

  /// Display text for the task.
  final String name;

  /// Whether the task is currently checked.
  final bool checked;

  /// Whether the task cannot be toggled.
  final bool disabled;

  /// Optional child tasks controlled by this parent task.
  final List<CheckBoxTask> subtasks;

  /// Returns a copy of this task with the given fields replaced.
  CheckBoxTask copyWith({
    String? id,
    String? name,
    bool? checked,
    bool? disabled,
    List<CheckBoxTask>? subtasks,
  }) {
    return CheckBoxTask(
      id: id ?? this.id,
      name: name ?? this.name,
      checked: checked ?? this.checked,
      disabled: disabled ?? this.disabled,
      subtasks: subtasks ?? this.subtasks,
    );
  }
}

/// Functional interaction variant for `MagicChip`.
enum ChipVariant {
  /// Static or removable display chip.
  basic,

  /// Selectable filter/choice chip.
  selectable,

  /// Editable/removable input chip set with text entry.
  input,

  /// Reorderable draggable chip list.
  draggable,
}

/// Layout direction for a group of chips.
enum ChipOrientation {
  /// Arranges chips left-to-right wrapping onto lines.
  horizontal,

  /// Arranges chips top-to-bottom in a vertical column.
  vertical,
}

/// Descriptor for an individual chip rendered inside `MagicChip`.
@immutable
class ChipItem {
  /// Creates a chip item descriptor.
  const ChipItem({
    this.id,
    required this.label,
    this.removable,
    this.disabled = false,
    this.editable,
    this.selectable,
    this.selected = false,
    this.avatarSrc,
    this.avatarAlt,
    this.leadingIcon,
    this.leadingIconName,
  });

  /// Optional unique identifier for the chip.
  final String? id;

  /// Display text shown inside the chip.
  final String label;

  /// Per-chip override for whether a remove icon is shown.
  final bool? removable;

  /// Whether this chip is non-interactive.
  final bool disabled;

  /// Per-chip override for whether inline editing is enabled.
  final bool? editable;

  /// Per-chip override for whether the chip can be selected.
  final bool? selectable;

  /// Whether the chip is currently selected.
  final bool selected;

  /// Optional avatar image URL or identifier.
  final String? avatarSrc;

  /// Accessible alt text or initials fallback for [avatarSrc].
  final String? avatarAlt;

  /// Optional native Material [IconData] displayed before [label].
  final IconData? leadingIcon;

  /// Optional Material icon string name resolved via `MagicIcon`.
  final String? leadingIconName;

  /// Returns a copy of this chip item with the given fields replaced.
  ChipItem copyWith({
    String? id,
    String? label,
    bool? removable,
    bool? disabled,
    bool? editable,
    bool? selectable,
    bool? selected,
    String? avatarSrc,
    String? avatarAlt,
    IconData? leadingIcon,
    String? leadingIconName,
  }) {
    return ChipItem(
      id: id ?? this.id,
      label: label ?? this.label,
      removable: removable ?? this.removable,
      disabled: disabled ?? this.disabled,
      editable: editable ?? this.editable,
      selectable: selectable ?? this.selectable,
      selected: selected ?? this.selected,
      avatarSrc: avatarSrc ?? this.avatarSrc,
      avatarAlt: avatarAlt ?? this.avatarAlt,
      leadingIcon: leadingIcon ?? this.leadingIcon,
      leadingIconName: leadingIconName ?? this.leadingIconName,
    );
  }
}

/// Visual presentation style for `MagicProgressIndicator`.
enum ProgressIndicatorType {
  /// Horizontal linear progress bar.
  bar,

  /// Circular spinning progress indicator.
  spinner,
}

/// Behavioral mode for `MagicProgressIndicator`.
enum ProgressIndicatorMode {
  /// Displays explicit progress between 0 and 100.
  determinate,

  /// Displays continuous indeterminate activity animation.
  indeterminate,

  /// Displays primary progress alongside secondary buffered progress.
  buffer,

  /// Displays reverse-indeterminate query progress.
  query,
}

/// Label placement relative to a radio button control.
enum RadioLabelPosition {
  /// Renders the label before the radio indicator.
  before,

  /// Renders the label after the radio indicator.
  after,
}

/// Option descriptor for `MagicRadioButton`.
@immutable
class RadioOption<T> {
  /// Creates a radio button option.
  const RadioOption({
    required this.value,
    required this.label,
    this.disabled = false,
    this.labelPosition,
    this.requiredField = false,
  });

  /// Strongly typed option value emitted when selected.
  final T value;

  /// Human-readable option label.
  final String label;

  /// Whether this individual option is disabled.
  final bool disabled;

  /// Optional per-option label placement override.
  final RadioLabelPosition? labelPosition;

  /// Whether this option is marked as required.
  final bool requiredField;
}

/// Label placement relative to a slide toggle switch.
enum SlideToggleLabelPosition {
  /// Renders the label before the switch.
  before,

  /// Renders the label after the switch.
  after,
}

/// Semantic keyboard and input mode for `MagicTextInput`.
enum TextInputTypeKind {
  /// Plain single-line text input.
  text,

  /// Email address input.
  email,

  /// Obscured password input.
  password,

  /// Search query input.
  search,

  /// Telephone number input.
  tel,

  /// URL input.
  url,

  /// Numeric input.
  number,
}

/// Preferred overlay position for `MagicToolTip`.
enum ToolTipPosition {
  /// Displays the tooltip above its trigger.
  above,

  /// Displays the tooltip below its trigger.
  below,

  /// Displays the tooltip to the left of its trigger.
  left,

  /// Displays the tooltip to the right of its trigger.
  right,

  /// Displays the tooltip before its trigger (reading-direction aware).
  before,

  /// Displays the tooltip after its trigger (reading-direction aware).
  after,
}

/// Touch gesture trigger mode for `MagicToolTip`.
enum ToolTipTouchGestures {
  /// Automatically uses platform-default touch behavior.
  auto,

  /// Explicitly enables touch gestures (tap/long-press).
  on,

  /// Disables touch gestures (hover/manual only).
  off,
}

/// Visual surface style for `MagicCard`.
enum CardAppearance {
  /// Outlined surface with subtle hairline border.
  outlined,

  /// Elevated raised surface with Material 3 shadow.
  raised,
}

/// Structural layout preset for `MagicCard`.
enum CardVariant {
  /// Basic card with header and body content.
  basic,

  /// Card displaying an action button bar.
  withActions,

  /// Card displaying a chip collection in its footer/content.
  withChips,
}

/// Media image size preset for `MagicCard`.
enum CardImageSize {
  /// Small thumbnail image (80 dp).
  small,

  /// Medium image (112 dp).
  medium,

  /// Large image (152 dp).
  large,

  /// Extra-large image (240 dp).
  extraLarge,

  /// Full-bleed responsive media banner.
  full,
}

/// Action button descriptor rendered inside `MagicCard`.
@immutable
class CardActionItem {
  /// Creates a card action item.
  const CardActionItem({
    this.id,
    required this.label,
    this.variant,
    this.color,
    this.icon,
    this.iconName,
    this.disabled = false,
  });

  /// Optional unique identifier for the action.
  final String? id;

  /// Button text label.
  final String label;

  /// Optional button emphasis variant (defaults to [ButtonVariant.text]).
  final ButtonVariant? variant;

  /// Optional semantic color intent.
  final ColorIntent? color;

  /// Optional native Material [IconData] for the action button.
  final IconData? icon;

  /// Optional Material icon string name resolved via `MagicIcon`.
  final String? iconName;

  /// Whether the action button is disabled.
  final bool disabled;
}

/// Horizontal alignment of actions in `MagicCard`.
enum CardActionsAlignment {
  /// Aligns actions to the start (leading) edge.
  start,

  /// Aligns actions to the end (trailing) edge.
  end,
}

/// Decoration container style for `MagicFormField`.
enum FormFieldAppearance {
  /// Outlined border container.
  outlined,

  /// Filled container with bottom indicator border.
  filled,
}

/// Floating label display behavior for `MagicFormField`.
enum FormFieldFloatLabel {
  /// Floats the label when focused or non-empty.
  auto,

  /// Always keeps the label floated above the field.
  always,
}

/// Helper and error subscript sizing strategy for `MagicFormField`.
enum FormFieldSubscriptSizing {
  /// Reserves fixed single-line subscript space.
  fixed,

  /// Expands subscript space dynamically as needed.
  dynamic,
}

/// Trigger control style for `MagicMenu`.
enum MenuTriggerType {
  /// Renders a standard labeled button trigger.
  button,

  /// Renders a compact icon button trigger.
  icon,
}

/// Horizontal opening alignment for `MagicMenu`.
enum MenuPositionX {
  /// Aligns menu before (leading side of) the trigger.
  before,

  /// Aligns menu after (trailing side of) the trigger.
  after,
}

/// Vertical opening alignment for `MagicMenu`.
enum MenuPositionY {
  /// Opens menu above the trigger.
  above,

  /// Opens menu below the trigger.
  below,
}

/// Recursive menu item descriptor for `MagicMenu`.
@immutable
class MenuItemData {
  /// Creates a menu item descriptor.
  const MenuItemData({
    this.id,
    required this.label,
    this.icon,
    this.iconName,
    this.link,
    this.disabled = false,
    this.children = const <MenuItemData>[],
  });

  /// Optional unique identifier for the menu item.
  final String? id;

  /// Display text of the menu item.
  final String label;

  /// Optional native Material [IconData] leading icon.
  final IconData? icon;

  /// Optional Material icon string name resolved via `MagicIcon`.
  final String? iconName;

  /// Optional link target associated with this item.
  final String? link;

  /// Whether this item is non-interactive.
  final bool disabled;

  /// Nested submenu items; non-empty renders a recursive submenu.
  final List<MenuItemData> children;
}

/// Option descriptor for `MagicSelect`.
@immutable
class SelectOption<T> {
  /// Creates a selectable option.
  const SelectOption({
    required this.value,
    required this.label,
    this.disabled = false,
  });

  /// Strongly typed option value.
  final T value;

  /// Human-readable option label.
  final String label;

  /// Whether this individual option is disabled.
  final bool disabled;
}

/// Categorized option group descriptor for `MagicSelect`.
@immutable
class SelectOptionGroup<T> {
  /// Creates a labeled group of select options.
  const SelectOptionGroup({
    required this.label,
    this.disabled = false,
    required this.options,
  });

  /// Group heading label.
  final String label;

  /// Whether all options inside this group are disabled.
  final bool disabled;

  /// Options belonging to this group.
  final List<SelectOption<T>> options;
}

/// Common base property contract shared across atomic components.
abstract interface class BaseAtomicProps {
  /// Optional identifier for the component.
  String? get id;

  /// Optional test key identifier mapped to `ValueKey<String>`.
  String? get testId;

  /// Optional accessible semantics label.
  String? get ariaLabel;

  /// Whether the component is disabled.
  bool get disabled;
}

/// Property contract for `MagicButton`.
@immutable
class MagicButtonProps implements BaseAtomicProps {
  /// Creates a button property contract instance.
  const MagicButtonProps({
    required this.label,
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    this.variant = ButtonVariant.filled,
    this.kind = ButtonKind.standard,
    this.shape = ButtonShape.standard,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.loading = false,
    this.loadingLabel,
    this.fullWidth = false,
    this.leadingIcon,
    this.leadingIconName,
    this.trailingIcon,
    this.trailingIconName,
    this.disabledInteractive = false,
    this.disableRipple = false,
  });

  /// Button text label.
  final String label;

  @override
  final String? id;

  @override
  final String? testId;

  @override
  final String? ariaLabel;

  @override
  final bool disabled;

  /// Material 3 visual emphasis variant.
  final ButtonVariant variant;

  /// Structural button kind (standard, icon, FAB, mini FAB, extended FAB).
  final ButtonKind kind;

  /// Corner radius shape preset.
  final ButtonShape shape;

  /// Semantic color intent.
  final ColorIntent color;

  /// Standardized component size.
  final AtomicSize size;

  /// Whether the button is in a loading state.
  final bool loading;

  /// Optional text replacing [label] while [loading] is `true`.
  final String? loadingLabel;

  /// Whether the button expands to fill available horizontal width.
  final bool fullWidth;

  /// Optional native Material [IconData] shown before the label.
  final IconData? leadingIcon;

  /// Optional Material icon string name shown before the label.
  final String? leadingIconName;

  /// Optional native Material [IconData] shown after the label.
  final IconData? trailingIcon;

  /// Optional Material icon string name shown after the label.
  final String? trailingIconName;

  /// Whether a disabled button remains focusable for tooltips/accessibility.
  final bool disabledInteractive;

  /// Whether splash/ripple ink feedback is suppressed.
  final bool disableRipple;
}

/// Strict bare control property contract for `MagicTextInput`.
///
/// Mirrors `TextInputControlProps` from `@mono-magic/atomic-design-interfaces`.
/// Labels, hints, and error messages belong on `MagicFormField`.
@immutable
class MagicTextInputControlProps implements BaseAtomicProps {
  /// Creates a bare text input control property contract instance.
  const MagicTextInputControlProps({
    this.type = TextInputTypeKind.text,
    this.name,
    this.value,
    this.placeholder,
    this.size = AtomicSize.md,
    this.disabled = false,
    this.requiredField = false,
    this.readOnly = false,
    this.autocomplete,
    this.minLength,
    this.maxLength,
    this.id,
    this.testId,
    this.ariaLabel,
  });

  /// Semantic keyboard and input mode.
  final TextInputTypeKind type;

  /// Optional form field name.
  final String? name;

  /// Controlled or initial text value.
  final String? value;

  /// Placeholder hint displayed when the input is empty.
  final String? placeholder;

  /// Standardized component size.
  final AtomicSize size;

  @override
  final bool disabled;

  /// Whether the control requires a non-empty value.
  final bool requiredField;

  /// Whether the text cannot be edited by the user.
  final bool readOnly;

  /// Optional autofill/autocomplete hint identifier.
  final String? autocomplete;

  /// Minimum character count validation hint.
  final int? minLength;

  /// Maximum character count enforced on the input.
  final int? maxLength;

  @override
  final String? id;

  @override
  final String? testId;

  @override
  final String? ariaLabel;
}

/// Property contract for `MagicFormField`.
///
/// Mirrors `FormFieldMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
@immutable
class MagicFormFieldProps implements BaseAtomicProps {
  /// Creates a form-field property contract instance.
  const MagicFormFieldProps({
    this.label,
    this.hint,
    this.errorText,
    this.appearance = FormFieldAppearance.outlined,
    this.size = AtomicSize.md,
    this.floatLabel = FormFieldFloatLabel.auto,
    this.subscriptSizing = FormFieldSubscriptSizing.fixed,
    this.hideRequiredMarker = false,
    this.requiredField = false,
    this.disabled = false,
    this.id,
    this.testId,
    this.ariaLabel,
  });

  /// Floating field label text.
  final String? label;

  /// Helper hint text displayed beneath the field when no error is active.
  final String? hint;

  /// Validation error message replacing [hint] when non-empty.
  final String? errorText;

  /// Material 3 container appearance (`outlined` or `filled`).
  final FormFieldAppearance appearance;

  /// Standardized component size.
  final AtomicSize size;

  /// Floating label behavior (`auto` or `always`).
  final FormFieldFloatLabel floatLabel;

  /// Subscript space sizing strategy (`fixed` or `dynamic`).
  final FormFieldSubscriptSizing subscriptSizing;

  /// Whether to suppress the trailing `*` marker on required fields.
  final bool hideRequiredMarker;

  /// Whether the associated form control is marked as required.
  final bool requiredField;

  @override
  final bool disabled;

  @override
  final String? id;

  @override
  final String? testId;

  @override
  final String? ariaLabel;
}

/// Property contract for `MagicSearchBar`.
@immutable
class MagicSearchBarProps implements BaseAtomicProps {
  /// Creates a search bar property contract instance.
  const MagicSearchBarProps({
    this.id,
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
  final String? id;

  @override
  final String? testId;

  @override
  final String? ariaLabel;

  @override
  final bool disabled;

  /// Current search query text.
  final String? query;

  /// Placeholder text displayed inside the search input.
  final String placeholder;

  /// Field label displayed by the search form field.
  final String label;

  /// Label displayed on the search submit button.
  final String submitLabel;

  /// Material 3 variant applied to the submit button.
  final ButtonVariant buttonVariant;

  /// Semantic color intent applied to the submit button.
  final ColorIntent buttonColor;

  /// Standardized component size applied to both input and button.
  final AtomicSize size;

  /// Whether a search submission is currently in progress.
  final bool loading;
}

/// Responsive width preset for `MagicDialog`.
enum DialogSize {
  /// Compact confirmation dialog width.
  sm,

  /// Standard medium dialog width.
  md,

  /// Wide content dialog width.
  lg,

  /// Fullscreen modal dialog covering the entire viewport.
  fullscreen,
}

/// Horizontal alignment of action buttons in `MagicDialog`.
enum DialogActionsAlignment {
  /// Aligns actions to the start (leading) edge.
  start,

  /// Aligns actions to the end (trailing) edge.
  end,
}

/// Action button descriptor rendered inside `MagicDialog`.
@immutable
class DialogActionItem {
  /// Creates a dialog action item.
  const DialogActionItem({
    this.id,
    required this.label,
    this.variant,
    this.color,
    this.icon,
    this.iconName,
    this.disabled = false,
  });

  /// Optional unique identifier for the action.
  final String? id;

  /// Button text label.
  final String label;

  /// Optional button emphasis variant.
  final ButtonVariant? variant;

  /// Optional semantic color intent.
  final ColorIntent? color;

  /// Optional native Material [IconData] for the action button.
  final IconData? icon;

  /// Optional Material icon string name resolved via `MagicIcon`.
  final String? iconName;

  /// Whether the action button is disabled.
  final bool disabled;

  /// Returns a copy of this dialog action item with the given fields replaced.
  DialogActionItem copyWith({
    String? id,
    String? label,
    ButtonVariant? variant,
    ColorIntent? color,
    IconData? icon,
    String? iconName,
    bool? disabled,
  }) {
    return DialogActionItem(
      id: id ?? this.id,
      label: label ?? this.label,
      variant: variant ?? this.variant,
      color: color ?? this.color,
      icon: icon ?? this.icon,
      iconName: iconName ?? this.iconName,
      disabled: disabled ?? this.disabled,
    );
  }
}

/// Property contract for `MagicDialog`.
///
/// Mirrors `DialogMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
@immutable
class MagicDialogProps implements BaseAtomicProps {
  /// Creates a dialog property contract instance.
  const MagicDialogProps({
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    this.open = false,
    this.title,
    this.subtitle,
    this.content,
    this.size = DialogSize.md,
    this.dismissible = true,
    this.closeOnBackdropClick = true,
    this.closeOnEscape = true,
    this.showCloseButton = true,
    this.scrollable = false,
    this.actions = const <DialogActionItem>[],
    this.alignActions = DialogActionsAlignment.end,
  });

  @override
  final String? id;

  @override
  final String? testId;

  @override
  final String? ariaLabel;

  @override
  final bool disabled;

  /// Whether the dialog is currently visible.
  final bool open;

  /// Primary heading displayed in the dialog header.
  final String? title;

  /// Optional secondary subtitle displayed beneath [title].
  final String? subtitle;

  /// Body message text when custom widget children are not provided.
  final String? content;

  /// Responsive dialog container size preset.
  final DialogSize size;

  /// Whether the dialog can be dismissed by user interaction.
  final bool dismissible;

  /// Whether tapping the modal scrim closes the dialog.
  final bool closeOnBackdropClick;

  /// Whether pressing Escape closes the dialog.
  final bool closeOnEscape;

  /// Whether to render a close icon button in the dialog header.
  final bool showCloseButton;

  /// Whether long body content scrolls independently inside the dialog.
  final bool scrollable;

  /// Action buttons displayed in the dialog footer.
  final List<DialogActionItem> actions;

  /// Horizontal alignment of the footer action buttons.
  final DialogActionsAlignment alignActions;
}

/// Semantic severity level for `MagicAlert` and `MagicToast`.
enum AlertSeverity {
  /// Informational status severity.
  info,

  /// Positive confirmation severity.
  success,

  /// Caution / warning severity.
  warning,

  /// Error / failure severity.
  error,
}

/// Material 3 visual emphasis variant for `MagicAlert`.
enum AlertVariant {
  /// Tinted surface container with subtle accent border.
  standard,

  /// High-emphasis solid semantic fill.
  filled,

  /// Transparent surface with crisp semantic outline.
  outlined,
}

/// Property contract for `MagicAlert`.
///
/// Mirrors `AlertMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
@immutable
class MagicAlertProps implements BaseAtomicProps {
  /// Creates an alert property contract instance.
  const MagicAlertProps({
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    this.severity = AlertSeverity.info,
    this.variant = AlertVariant.standard,
    this.title,
    required this.message,
    this.icon,
    this.iconName,
    this.hideIcon = false,
    this.dismissible = false,
    this.actionLabel,
    this.size = AtomicSize.md,
  });

  @override
  final String? id;

  @override
  final String? testId;

  @override
  final String? ariaLabel;

  @override
  final bool disabled;

  /// Semantic severity controlling icon and color intent.
  final AlertSeverity severity;

  /// Visual container style (`standard`, `filled`, or `outlined`).
  final AlertVariant variant;

  /// Optional bold heading rendered above [message].
  final String? title;

  /// Primary alert body message.
  final String message;

  /// Optional native Material [IconData] overriding the default severity icon.
  final IconData? icon;

  /// Optional Material icon string name resolved via `MagicIcon`.
  final String? iconName;

  /// Whether to suppress the leading severity icon.
  final bool hideIcon;

  /// Whether a dismiss/close button is rendered.
  final bool dismissible;

  /// Optional label for an inline action button.
  final String? actionLabel;

  /// Standardized component density/size preset.
  final AtomicSize size;
}

/// Viewport anchor position for transient `MagicToast` notifications.
enum ToastPosition {
  /// Anchored to the top-left corner of the viewport.
  topLeft,

  /// Anchored to the top-center edge of the viewport.
  topCenter,

  /// Anchored to the top-right corner of the viewport.
  topRight,

  /// Anchored to the bottom-left corner of the viewport.
  bottomLeft,

  /// Anchored to the bottom-center edge of the viewport.
  bottomCenter,

  /// Anchored to the bottom-right corner of the viewport.
  bottomRight,
}

/// Property contract for `MagicToast`.
///
/// Mirrors `ToastMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
@immutable
class MagicToastProps implements BaseAtomicProps {
  /// Creates a toast property contract instance.
  const MagicToastProps({
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    this.open = false,
    this.severity = AlertSeverity.info,
    this.title,
    required this.message,
    this.duration = 4000,
    this.position = ToastPosition.bottomRight,
    this.dismissible = true,
    this.actionLabel,
  });

  @override
  final String? id;

  @override
  final String? testId;

  @override
  final String? ariaLabel;

  @override
  final bool disabled;

  /// Whether the toast notification is currently visible.
  final bool open;

  /// Semantic severity level mapped from [AlertSeverity].
  final AlertSeverity severity;

  /// Optional bold heading rendered above [message].
  final String? title;

  /// Primary notification message text.
  final String message;

  /// Auto-dismiss timeout in milliseconds, or `null` to persist until dismissed.
  final int? duration;

  /// Viewport anchor position for the toast container.
  final ToastPosition position;

  /// Whether a manual close button is rendered.
  final bool dismissible;

  /// Optional label for an inline action button (e.g., `Undo`).
  final String? actionLabel;
}

/// Layout axis orientation for `MagicTabs`.
enum TabsOrientation {
  /// Arranges tab headers in a horizontal row above the active panel.
  horizontal,

  /// Arranges tab headers in a vertical rail beside the active panel.
  vertical,
}

/// Material 3 tab indicator hierarchy variant for `MagicTabs`.
enum TabsVariant {
  /// Primary navigation tabs with rounded active bottom indicator.
  primary,

  /// Secondary sub-navigation tabs with full-width bottom indicator.
  secondary,
}

/// Tab descriptor rendered inside `MagicTabs`.
@immutable
class TabItem {
  /// Creates a tab descriptor.
  const TabItem({
    required this.id,
    required this.label,
    this.icon,
    this.iconName,
    this.badgeContent,
    this.disabled = false,
    this.content,
  });

  /// Unique identifier for the tab and its corresponding panel.
  final String id;

  /// Human-readable tab label.
  final String label;

  /// Optional native Material [IconData] displayed alongside [label].
  final IconData? icon;

  /// Optional Material icon string name resolved via `MagicIcon`.
  final String? iconName;

  /// Optional badge count (`int`) or short status text (`String`) shown on the tab.
  final Object? badgeContent;

  /// Whether this tab cannot be selected.
  final bool disabled;

  /// Optional default text content rendered in the tab panel.
  final String? content;

  /// Returns a copy of this tab descriptor with the given fields replaced.
  TabItem copyWith({
    String? id,
    String? label,
    IconData? icon,
    String? iconName,
    Object? badgeContent,
    bool? disabled,
    String? content,
  }) {
    return TabItem(
      id: id ?? this.id,
      label: label ?? this.label,
      icon: icon ?? this.icon,
      iconName: iconName ?? this.iconName,
      badgeContent: badgeContent ?? this.badgeContent,
      disabled: disabled ?? this.disabled,
      content: content ?? this.content,
    );
  }
}

/// Property contract for `MagicTabs`.
///
/// Mirrors `TabsMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
@immutable
class MagicTabsProps implements BaseAtomicProps {
  /// Creates a tabs property contract instance.
  const MagicTabsProps({
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    required this.items,
    this.activeTabId,
    this.defaultActiveTabId,
    this.orientation = TabsOrientation.horizontal,
    this.variant = TabsVariant.primary,
    this.scrollable = false,
    this.lazy = false,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
  });

  @override
  final String? id;

  @override
  final String? testId;

  @override
  final String? ariaLabel;

  @override
  final bool disabled;

  /// Ordered list of tab descriptors and panel definitions.
  final List<TabItem> items;

  /// Controlled active tab identifier.
  final String? activeTabId;

  /// Initial active tab identifier for uncontrolled usage.
  final String? defaultActiveTabId;

  /// Tab strip layout axis (`horizontal` or `vertical`).
  final TabsOrientation orientation;

  /// Material 3 tab indicator variant (`primary` or `secondary`).
  final TabsVariant variant;

  /// Whether the tab header strip scrolls when items overflow.
  final bool scrollable;

  /// Whether inactive tab panels defer building until first selected.
  final bool lazy;

  /// Semantic color intent applied to active tab text and indicator.
  final ColorIntent color;

  /// Standardized component density/size preset.
  final AtomicSize size;
}

/// Visual surface treatment for `MagicAccordion` panels.
enum AccordionAppearance {
  /// Outlined panel container with hairline border.
  outlined,

  /// Elevated raised panel surface with Material 3 shadow.
  raised,
}

/// Panel descriptor rendered inside `MagicAccordion`.
@immutable
class AccordionItem {
  /// Creates an accordion panel descriptor.
  const AccordionItem({
    required this.id,
    required this.title,
    this.summary,
    this.content,
    this.icon,
    this.iconName,
    this.disabled = false,
    this.expanded = false,
  });

  /// Unique identifier for the accordion panel.
  final String id;

  /// Primary heading displayed in the clickable summary header.
  final String title;

  /// Optional secondary summary text displayed next to [title].
  final String? summary;

  /// Body content revealed when the panel is expanded.
  final String? content;

  /// Optional native Material [IconData] displayed in the panel header.
  final IconData? icon;

  /// Optional Material icon string name resolved via `MagicIcon`.
  final String? iconName;

  /// Whether this individual panel is disabled and non-expandable.
  final bool disabled;

  /// Initial per-item expanded hint when `expandedIds` is not supplied.
  final bool expanded;

  /// Returns a copy of this accordion item with the given fields replaced.
  AccordionItem copyWith({
    String? id,
    String? title,
    String? summary,
    String? content,
    IconData? icon,
    String? iconName,
    bool? disabled,
    bool? expanded,
  }) {
    return AccordionItem(
      id: id ?? this.id,
      title: title ?? this.title,
      summary: summary ?? this.summary,
      content: content ?? this.content,
      icon: icon ?? this.icon,
      iconName: iconName ?? this.iconName,
      disabled: disabled ?? this.disabled,
      expanded: expanded ?? this.expanded,
    );
  }
}

/// Property contract for `MagicAccordion`.
///
/// Mirrors `AccordionMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
@immutable
class MagicAccordionProps implements BaseAtomicProps {
  /// Creates an accordion property contract instance.
  const MagicAccordionProps({
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    required this.items,
    this.multiple = false,
    this.expandedIds,
    this.defaultExpandedIds,
    this.appearance = AccordionAppearance.outlined,
    this.size = AtomicSize.md,
  });

  @override
  final String? id;

  @override
  final String? testId;

  @override
  final String? ariaLabel;

  @override
  final bool disabled;

  /// Ordered list of collapsible accordion panel items.
  final List<AccordionItem> items;

  /// Whether multiple panels may be expanded simultaneously.
  final bool multiple;

  /// Controlled list of currently expanded panel identifiers.
  final List<String>? expandedIds;

  /// Initial list of expanded panel identifiers for uncontrolled usage.
  final List<String>? defaultExpandedIds;

  /// Material 3 surface appearance (`outlined` or `raised`).
  final AccordionAppearance appearance;

  /// Standardized component density/size preset.
  final AtomicSize size;
}

/// Presence indicator status for `MagicAvatar`.
enum AvatarStatus {
  /// User is active and online.
  online,

  /// User is busy or unavailable for interruption.
  busy,

  /// User is currently offline.
  offline,
}

/// Geometric container shape for `MagicAvatar`.
enum AvatarShape {
  /// Fully circular avatar container.
  circle,

  /// Rounded-square avatar container.
  rounded,

  /// Sharp-cornered square avatar container.
  square,
}

/// Overlap spacing density for `MagicAvatarGroup`.
enum AvatarGroupSpacing {
  /// Compact overlap between adjacent avatars.
  tight,

  /// Standard overlap between adjacent avatars.
  normal,
}

/// Property contract for `MagicAvatar`.
///
/// Mirrors `AvatarMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
@immutable
class MagicAvatarProps implements BaseAtomicProps {
  /// Creates an avatar property contract instance.
  const MagicAvatarProps({
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

  @override
  final String? id;

  @override
  final String? testId;

  @override
  final String? ariaLabel;

  @override
  final bool disabled;

  /// Optional image URL rendered inside the avatar.
  final String? src;

  /// Accessible alternative text for the avatar image.
  final String? alt;

  /// Display name used to derive fallback initials and accessible labels.
  final String? name;

  /// Explicit fallback initials overriding derived [name] initials.
  final String? initials;

  /// Optional native Material [IconData] fallback icon.
  final IconData? icon;

  /// Optional Material icon string name resolved via `MagicIcon`.
  final String? iconName;

  /// Standardized component size preset.
  final AtomicSize size;

  /// Semantic color intent applied to the fallback container and foreground.
  final ColorIntent color;

  /// Container corner geometry (`circle`, `rounded`, or `square`).
  final AvatarShape shape;

  /// Optional presence status badge rendered at the avatar corner.
  final AvatarStatus? status;

  /// Accessible label describing the presence [status].
  final String? statusLabel;
}

/// Item descriptor rendered within a `MagicAvatarGroup` stack.
@immutable
class AvatarGroupItem {
  /// Creates an avatar group item descriptor.
  const AvatarGroupItem({
    this.id,
    this.testId,
    this.ariaLabel,
    this.src,
    this.alt,
    this.name,
    this.initials,
    this.icon,
    this.iconName,
    this.color,
    this.shape,
    this.status,
    this.statusLabel,
  });

  /// Optional unique identifier for the avatar group entry.
  final String? id;

  /// Optional test key identifier.
  final String? testId;

  /// Optional accessible semantics label.
  final String? ariaLabel;

  /// Optional image URL rendered inside the avatar.
  final String? src;

  /// Accessible alternative text for the avatar image.
  final String? alt;

  /// Display name used to derive fallback initials.
  final String? name;

  /// Explicit fallback initials overriding derived [name] initials.
  final String? initials;

  /// Optional native Material [IconData] fallback icon.
  final IconData? icon;

  /// Optional Material icon string name resolved via `MagicIcon`.
  final String? iconName;

  /// Optional semantic color intent override.
  final ColorIntent? color;

  /// Optional container corner geometry override.
  final AvatarShape? shape;

  /// Optional presence status badge.
  final AvatarStatus? status;

  /// Accessible label describing the presence [status].
  final String? statusLabel;

  /// Returns a copy of this avatar group item with the given fields replaced.
  AvatarGroupItem copyWith({
    String? id,
    String? testId,
    String? ariaLabel,
    String? src,
    String? alt,
    String? name,
    String? initials,
    IconData? icon,
    String? iconName,
    ColorIntent? color,
    AvatarShape? shape,
    AvatarStatus? status,
    String? statusLabel,
  }) {
    return AvatarGroupItem(
      id: id ?? this.id,
      testId: testId ?? this.testId,
      ariaLabel: ariaLabel ?? this.ariaLabel,
      src: src ?? this.src,
      alt: alt ?? this.alt,
      name: name ?? this.name,
      initials: initials ?? this.initials,
      icon: icon ?? this.icon,
      iconName: iconName ?? this.iconName,
      color: color ?? this.color,
      shape: shape ?? this.shape,
      status: status ?? this.status,
      statusLabel: statusLabel ?? this.statusLabel,
    );
  }
}

/// Property contract for `MagicAvatarGroup`.
///
/// Mirrors `AvatarGroupMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
@immutable
class MagicAvatarGroupProps implements BaseAtomicProps {
  /// Creates an avatar group property contract instance.
  const MagicAvatarGroupProps({
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    required this.items,
    this.max,
    this.size = AtomicSize.md,
    this.spacing = AvatarGroupSpacing.normal,
  });

  @override
  final String? id;

  @override
  final String? testId;

  @override
  final String? ariaLabel;

  @override
  final bool disabled;

  /// Ordered list of avatar descriptors displayed in the stack.
  final List<AvatarGroupItem> items;

  /// Maximum number of avatars rendered before collapsing extras into a `+N` badge.
  final int? max;

  /// Standardized size preset applied uniformly across all avatars in the group.
  final AtomicSize size;

  /// Overlap density between adjacent avatars (`tight` or `normal`).
  final AvatarGroupSpacing spacing;
}

/// Visual surface treatment for `MagicListItem` rows.
enum MagicListItemAppearance {
  /// Standard transparent list row surface.
  standard,

  /// Outlined surface container with hairline border.
  outlined,

  /// Tonal filled surface container.
  filled,
}

/// Property contract for `MagicListItem`.
///
/// Mirrors `ListItemMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
@immutable
class MagicListItemProps implements BaseAtomicProps {
  /// Creates a list item property contract instance.
  const MagicListItemProps({
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    required this.primaryText,
    this.secondaryText,
    this.overlineText,
    this.leadingIcon,
    this.leadingAvatarText,
    this.leadingAvatarSrc,
    this.trailingIcon,
    this.trailingText,
    this.trailingBadge,
    this.interactive = false,
    this.selectable = false,
    this.selected = false,
    this.divider = false,
    this.dense = false,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
    this.appearance = MagicListItemAppearance.standard,
  });

  @override
  final String? id;

  @override
  final String? testId;

  @override
  final String? ariaLabel;

  @override
  final bool disabled;

  /// Primary headline text displayed in the list item row.
  final String primaryText;

  /// Optional supporting text displayed beneath [primaryText].
  final String? secondaryText;

  /// Optional short overline label displayed above [primaryText].
  final String? overlineText;

  /// Optional Material icon string name rendered in the leading slot.
  final String? leadingIcon;

  /// Optional initials or short text rendered inside a leading avatar.
  final String? leadingAvatarText;

  /// Optional image URL rendered inside a leading avatar.
  final String? leadingAvatarSrc;

  /// Optional Material icon string name rendered in the trailing slot.
  final String? trailingIcon;

  /// Optional metadata text rendered in the trailing slot.
  final String? trailingText;

  /// Optional badge content (`String` or `int`) rendered in the trailing slot.
  final Object? trailingBadge;

  /// Whether the list item responds to pointer/keyboard activation.
  final bool interactive;

  /// Whether the list item can be toggled into a selected state.
  final bool selectable;

  /// Whether the list item is currently selected.
  final bool selected;

  /// Whether a bottom hairline divider is rendered beneath the row.
  final bool divider;

  /// Whether compact vertical padding is applied to the row.
  final bool dense;

  /// Semantic accent color intent applied to selection and icon highlights.
  final ColorIntent color;

  /// Standardized component density/size preset.
  final AtomicSize size;

  /// Material 3 surface appearance (`standard`, `outlined`, or `filled`).
  final MagicListItemAppearance appearance;
}

/// Layout axis for `MagicStepper` step indicators and connectors.
enum MagicStepperOrientation {
  /// Arranges step indicators left-to-right in a horizontal row.
  horizontal,

  /// Arranges step indicators top-to-bottom in a vertical column.
  vertical,
}

/// Explicit lifecycle state of an individual step within `MagicStepper`.
enum MagicStepStatus {
  /// Step has not yet been started.
  pending,

  /// Step is currently active.
  active,

  /// Step has been completed.
  completed,

  /// Step is currently in an error state.
  error,
}

/// Individual step descriptor rendered inside `MagicStepper`.
@immutable
class MagicStepItem {
  /// Creates a step item descriptor.
  const MagicStepItem({
    required this.id,
    required this.label,
    this.description,
    this.optional = false,
    this.optionalLabel,
    this.completed = false,
    this.error = false,
    this.errorMessage,
    this.disabled = false,
    this.icon,
    this.iconName,
    this.status,
  });

  /// Unique identifier for the step.
  final String id;

  /// Primary step label displayed beside or beneath the step indicator.
  final String label;

  /// Optional supporting description for the step.
  final String? description;

  /// Whether the step may be skipped without completing it.
  final bool optional;

  /// Custom label displayed when [optional] is `true` (defaults to `"Optional"`).
  final String? optionalLabel;

  /// Whether the step has been completed.
  final bool completed;

  /// Whether the step is currently in an error state.
  final bool error;

  /// Optional error message displayed when [error] is `true`.
  final String? errorMessage;

  /// Whether this individual step is disabled and cannot be selected.
  final bool disabled;

  /// Optional native Material [IconData] overriding the numeric step index.
  final IconData? icon;

  /// Optional Material icon string name resolved via `MagicIcon`.
  final String? iconName;

  /// Explicit status override for the step (`pending`, `active`, `completed`, or `error`).
  final MagicStepStatus? status;

  /// Returns a copy of this step item with the given fields replaced.
  MagicStepItem copyWith({
    String? id,
    String? label,
    String? description,
    bool? optional,
    String? optionalLabel,
    bool? completed,
    bool? error,
    String? errorMessage,
    bool? disabled,
    IconData? icon,
    String? iconName,
    MagicStepStatus? status,
  }) {
    return MagicStepItem(
      id: id ?? this.id,
      label: label ?? this.label,
      description: description ?? this.description,
      optional: optional ?? this.optional,
      optionalLabel: optionalLabel ?? this.optionalLabel,
      completed: completed ?? this.completed,
      error: error ?? this.error,
      errorMessage: errorMessage ?? this.errorMessage,
      disabled: disabled ?? this.disabled,
      icon: icon ?? this.icon,
      iconName: iconName ?? this.iconName,
      status: status ?? this.status,
    );
  }
}

/// Property contract for `MagicStepper`.
///
/// Mirrors `StepperMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
@immutable
class MagicStepperProps implements BaseAtomicProps {
  /// Creates a stepper property contract instance.
  const MagicStepperProps({
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
  });

  @override
  final String? id;

  @override
  final String? testId;

  @override
  final String? ariaLabel;

  @override
  final bool disabled;

  /// Ordered list of workflow steps to display.
  final List<MagicStepItem> steps;

  /// Controlled zero-based index of the currently active step.
  final int? activeStep;

  /// Initial zero-based active step index for uncontrolled usage.
  final int defaultActiveStep;

  /// Layout orientation (`horizontal` or `vertical`).
  final MagicStepperOrientation orientation;

  /// When `true`, users must complete preceding steps before advancing.
  final bool linear;

  /// When `true` in horizontal orientation, places step labels beneath the step icon.
  final bool alternativeLabel;

  /// Semantic accent color intent for active and completed step indicators.
  final ColorIntent color;

  /// Standardized component density/size preset.
  final AtomicSize size;
}

/// Visual button treatment for `MagicPagination` page items.
enum MagicPaginationVariant {
  /// Borderless text page buttons.
  text,

  /// Outlined page buttons with hairline border.
  outlined,

  /// Tonal/solid filled page buttons.
  filled,
}

/// Corner geometry for `MagicPagination` page buttons.
enum MagicPaginationShape {
  /// Rounded-rectangle page buttons.
  rounded,

  /// Fully circular page buttons.
  circular,
}

/// Property contract for `MagicPagination`.
///
/// Mirrors `PaginationMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
@immutable
class MagicPaginationProps implements BaseAtomicProps {
  /// Creates a pagination property contract instance.
  const MagicPaginationProps({
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    this.page,
    this.defaultPage = 1,
    required this.totalItems,
    this.pageSize = 10,
    this.pageSizeOptions = const <int>[10, 25, 50, 100],
    this.siblingCount = 1,
    this.boundaryCount = 1,
    this.showFirstLast = false,
    this.showPageSizeSelector = false,
    this.showTotalCount = false,
    this.variant = MagicPaginationVariant.text,
    this.shape = MagicPaginationShape.rounded,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
  });

  @override
  final String? id;

  @override
  final String? testId;

  @override
  final String? ariaLabel;

  @override
  final bool disabled;

  /// Controlled 1-indexed current page number.
  final int? page;

  /// Initial 1-indexed page number for uncontrolled usage.
  final int defaultPage;

  /// Total number of items across all pages.
  final int totalItems;

  /// Number of items displayed per page.
  final int pageSize;

  /// Available page-size choices when [showPageSizeSelector] is enabled.
  final List<int> pageSizeOptions;

  /// Number of always-visible page buttons on either side of the active page.
  final int siblingCount;

  /// Number of always-visible page buttons at the start and end of the range.
  final int boundaryCount;

  /// Whether to render first-page and last-page jump controls.
  final bool showFirstLast;

  /// Whether to render a page-size selector control.
  final bool showPageSizeSelector;

  /// Whether to display a summary range/total count label.
  final bool showTotalCount;

  /// Visual button style (`text`, `outlined`, or `filled`).
  final MagicPaginationVariant variant;

  /// Button corner geometry (`rounded` or `circular`).
  final MagicPaginationShape shape;

  /// Semantic accent color intent for the active page indicator.
  final ColorIntent color;

  /// Standardized component density/size preset.
  final AtomicSize size;
}

/// Individual navigation crumb descriptor rendered inside `MagicBreadcrumbs`.
@immutable
class MagicBreadcrumbItem {
  /// Creates a breadcrumb item descriptor.
  const MagicBreadcrumbItem({
    required this.id,
    required this.label,
    this.href,
    this.icon,
    this.iconName,
    this.disabled = false,
    this.current = false,
  });

  /// Unique identifier for the breadcrumb segment.
  final String id;

  /// Visible text label for the breadcrumb segment.
  final String label;

  /// Optional target URL when rendered as a navigational link.
  final String? href;

  /// Optional native Material [IconData] displayed before [label].
  final IconData? icon;

  /// Optional Material icon string name resolved via `MagicIcon`.
  final String? iconName;

  /// Whether this individual breadcrumb segment is disabled.
  final bool disabled;

  /// Whether this segment represents the current active location.
  final bool current;

  /// Returns a copy of this breadcrumb item with the given fields replaced.
  MagicBreadcrumbItem copyWith({
    String? id,
    String? label,
    String? href,
    IconData? icon,
    String? iconName,
    bool? disabled,
    bool? current,
  }) {
    return MagicBreadcrumbItem(
      id: id ?? this.id,
      label: label ?? this.label,
      href: href ?? this.href,
      icon: icon ?? this.icon,
      iconName: iconName ?? this.iconName,
      disabled: disabled ?? this.disabled,
      current: current ?? this.current,
    );
  }
}

/// Property contract for `MagicBreadcrumbs`.
///
/// Mirrors `BreadcrumbsMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
@immutable
class MagicBreadcrumbsProps implements BaseAtomicProps {
  /// Creates a breadcrumbs property contract instance.
  const MagicBreadcrumbsProps({
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    required this.items,
    this.separator = '/',
    this.maxItems,
    this.itemsBeforeCollapse = 1,
    this.itemsAfterCollapse = 1,
    this.color = ColorIntent.primary,
    this.size = AtomicSize.md,
  });

  @override
  final String? id;

  @override
  final String? testId;

  @override
  final String? ariaLabel;

  @override
  final bool disabled;

  /// Ordered trail of navigation breadcrumb items from root to current location.
  final List<MagicBreadcrumbItem> items;

  /// Separator string rendered between breadcrumb items.
  final String separator;

  /// Maximum number of visible items before collapsing middle items behind an ellipsis.
  final int? maxItems;

  /// Number of leading items kept visible when the trail is collapsed.
  final int itemsBeforeCollapse;

  /// Number of trailing items kept visible when the trail is collapsed.
  final int itemsAfterCollapse;

  /// Semantic accent color intent for interactive breadcrumb links.
  final ColorIntent color;

  /// Standardized component density/size preset.
  final AtomicSize size;
}

/// Selection mode for `MagicDatePicker` (`single` date or `range` of dates).
enum MagicDatePickerMode {
  /// Selects a single date or datetime value.
  single,

  /// Selects a start/end date range.
  range,
}

/// Framework-agnostic ISO date/datetime range value.
///
/// Dates are serialized as `YYYY-MM-DD` (or `YYYY-MM-DDTHH:mm` when time
/// selection is enabled).
@immutable
class MagicDateRangeValue {
  /// Creates an ISO date range value.
  const MagicDateRangeValue({
    this.start,
    this.end,
  });

  /// Start of the selected range as an ISO date/datetime string, or `null`.
  final String? start;

  /// End of the selected range as an ISO date/datetime string, or `null`.
  final String? end;

  /// Returns a copy of this range value with the given fields replaced.
  MagicDateRangeValue copyWith({
    String? start,
    String? end,
  }) {
    return MagicDateRangeValue(
      start: start ?? this.start,
      end: end ?? this.end,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) {
      return true;
    }
    return other is MagicDateRangeValue &&
        other.start == start &&
        other.end == end;
  }

  @override
  int get hashCode => Object.hash(start, end);
}

/// Property contract for `MagicDatePicker`.
///
/// Mirrors `DatePickerMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
@immutable
class MagicDatePickerProps implements BaseAtomicProps {
  /// Creates a date picker property contract instance.
  const MagicDatePickerProps({
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    this.label,
    this.hint,
    this.errorText,
    this.appearance = FormFieldAppearance.outlined,
    this.size = AtomicSize.md,
    this.mode = MagicDatePickerMode.single,
    this.value,
    this.defaultValue,
    this.rangeValue,
    this.defaultRangeValue,
    this.minDate,
    this.maxDate,
    this.enableTime = false,
    this.placeholder,
    this.startPlaceholder,
    this.endPlaceholder,
    this.format,
    this.requiredField = false,
    this.readOnly = false,
    this.clearable = false,
    this.color = ColorIntent.primary,
  });

  @override
  final String? id;

  @override
  final String? testId;

  @override
  final String? ariaLabel;

  @override
  final bool disabled;

  /// Floating field label text.
  final String? label;

  /// Helper hint text displayed beneath the field.
  final String? hint;

  /// Validation error message replacing [hint].
  final String? errorText;

  /// Material 3 container style (`outlined` or `filled`).
  final FormFieldAppearance appearance;

  /// Standardized component size preset.
  final AtomicSize size;

  /// Selection mode (`single` or `range`).
  final MagicDatePickerMode mode;

  /// Controlled single date/datetime ISO string.
  final String? value;

  /// Initial uncontrolled single date/datetime ISO string.
  final String? defaultValue;

  /// Controlled date range value when [mode] is [MagicDatePickerMode.range].
  final MagicDateRangeValue? rangeValue;

  /// Initial uncontrolled date range value when [mode] is [MagicDatePickerMode.range].
  final MagicDateRangeValue? defaultRangeValue;

  /// Earliest selectable ISO date/datetime boundary.
  final String? minDate;

  /// Latest selectable ISO date/datetime boundary.
  final String? maxDate;

  /// Whether time-of-day selection (`HH:mm`) is enabled alongside the date picker.
  final bool enableTime;

  /// Placeholder text shown in single-date mode when empty.
  final String? placeholder;

  /// Placeholder text shown for the start input in range mode.
  final String? startPlaceholder;

  /// Placeholder text shown for the end input in range mode.
  final String? endPlaceholder;

  /// Display format hint (e.g. `'YYYY-MM-DD'`).
  final String? format;

  /// Whether a value is required for form validation.
  final bool requiredField;

  /// Whether the date picker displays its value without allowing edits.
  final bool readOnly;

  /// Whether a clear button is displayed when a value is set.
  final bool clearable;

  /// Semantic accent color intent for selected dates and focus indicators.
  final ColorIntent color;
}

/// Step increment precision supported by `MagicRating` (`0.5` or `1.0`).
enum MagicRatingPrecision {
  /// Half-unit increment precision (`0.5`).
  half(0.5),

  /// Whole-unit increment precision (`1.0`).
  full(1.0);

  const MagicRatingPrecision(this.value);

  /// Numeric step increment value.
  final double value;
}

/// Property contract for `MagicRating`.
///
/// Mirrors `RatingMoleculeProps` from `@mono-magic/atomic-design-interfaces`.
@immutable
class MagicRatingProps implements BaseAtomicProps {
  /// Creates a rating property contract instance.
  const MagicRatingProps({
    this.id,
    this.testId,
    this.ariaLabel,
    this.disabled = false,
    this.value,
    this.defaultValue,
    this.max = 5,
    this.precision = MagicRatingPrecision.full,
    this.readOnly = false,
    this.showValue = false,
    this.reviewCount,
    this.icon,
    this.emptyIcon,
    this.color = ColorIntent.warning,
    this.size = AtomicSize.md,
    this.label,
  });

  @override
  final String? id;

  @override
  final String? testId;

  @override
  final String? ariaLabel;

  @override
  final bool disabled;

  /// Controlled numeric rating value (between `0` and [max]).
  final double? value;

  /// Initial uncontrolled numeric rating value.
  final double? defaultValue;

  /// Maximum number of rating icons displayed.
  final int max;

  /// Rating increment precision (`half` or `full`).
  final MagicRatingPrecision precision;

  /// Whether the rating is display-only and ignores user input.
  final bool readOnly;

  /// Whether to render the numeric rating value beside the icons.
  final bool showValue;

  /// Optional total review count displayed beside the rating.
  final int? reviewCount;

  /// Optional Material icon string name for filled rating units.
  final String? icon;

  /// Optional Material icon string name for unfilled rating units.
  final String? emptyIcon;

  /// Semantic accent color intent for filled rating icons.
  final ColorIntent color;

  /// Standardized component density/size preset.
  final AtomicSize size;

  /// Optional visible or accessible label describing what is being rated.
  final String? label;
}
