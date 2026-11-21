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
