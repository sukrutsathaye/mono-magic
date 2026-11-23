import 'package:fl_mat/fl_mat.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Atomic Design Dart contracts & copyWith helpers', () {
    test('constructs atom and Wave 1 molecule props at runtime', () {
      final toggleOpt = ButtonToggleOption<String>(
        value: 'a',
        label: 'A',
        disabled: false,
      );
      final radioOpt = RadioOption<int>(value: 1, label: 'One');
      final menuItem = MenuItemData(id: 'm1', label: 'Edit');
      final selectOpt = SelectOption<String>(value: 'us', label: 'US');
      final selectGroup = SelectOptionGroup<String>(
        label: 'North America',
        options: <SelectOption<String>>[selectOpt],
      );
      final buttonProps = MagicButtonProps(label: 'Save');
      final inputProps = MagicTextInputControlProps(placeholder: 'Type');
      final fieldProps = MagicFormFieldProps(label: 'Name');
      final searchProps = MagicSearchBarProps(query: 'hello');

      expect(toggleOpt.value, 'a');
      expect(radioOpt.value, 1);
      expect(menuItem.label, 'Edit');
      expect(selectGroup.options.single.value, 'us');
      expect(buttonProps.label, 'Save');
      expect(inputProps.placeholder, 'Type');
      expect(fieldProps.label, 'Name');
      expect(searchProps.query, 'hello');
    });

    test('constructs Wave 2 molecule props and supports copyWith on item descriptors', () {
      final action = DialogActionItem(
        id: 'confirm',
        label: 'Confirm',
        variant: ButtonVariant.filled,
        color: ColorIntent.primary,
        icon: Icons.check,
        iconName: 'check',
        disabled: false,
      );
      final actionCopied = action.copyWith(label: 'Proceed', disabled: true);
      final actionUnchanged = action.copyWith();

      expect(actionCopied.id, 'confirm');
      expect(actionCopied.label, 'Proceed');
      expect(actionCopied.disabled, isTrue);
      expect(actionUnchanged.label, 'Confirm');
      expect(actionUnchanged.disabled, isFalse);

      final dialogProps = MagicDialogProps(
        id: 'dlg',
        title: 'Title',
        actions: <DialogActionItem>[action],
      );
      final alertProps = MagicAlertProps(message: 'Saved');
      final toastProps = MagicToastProps(message: 'Archived');

      expect(dialogProps.actions, hasLength(1));
      expect(alertProps.message, 'Saved');
      expect(toastProps.message, 'Archived');

      final tab = TabItem(
        id: 'tab-1',
        label: 'Overview',
        icon: Icons.home,
        iconName: 'home',
        badgeContent: 2,
        disabled: false,
        content: 'Overview body',
      );
      final tabCopied = tab.copyWith(label: 'Summary', badgeContent: 5);
      final tabUnchanged = tab.copyWith();

      expect(tabCopied.id, 'tab-1');
      expect(tabCopied.label, 'Summary');
      expect(tabCopied.badgeContent, 5);
      expect(tabUnchanged.label, 'Overview');
      expect(tabUnchanged.content, 'Overview body');

      final tabsProps = MagicTabsProps(items: <TabItem>[tab]);
      expect(tabsProps.items.single.id, 'tab-1');

      final accordionItem = AccordionItem(
        id: 'acc-1',
        title: 'Question',
        summary: 'Short hint',
        content: 'Answer',
        icon: Icons.help_outline,
        iconName: 'help',
        disabled: false,
        expanded: false,
      );
      final accordionCopied = accordionItem.copyWith(expanded: true);
      final accordionUnchanged = accordionItem.copyWith();

      expect(accordionCopied.id, 'acc-1');
      expect(accordionCopied.expanded, isTrue);
      expect(accordionUnchanged.title, 'Question');
      expect(accordionUnchanged.expanded, isFalse);

      final accordionProps = MagicAccordionProps(
        items: <AccordionItem>[accordionItem],
      );
      expect(accordionProps.items.single.id, 'acc-1');

      final avatarProps = MagicAvatarProps(name: 'Ada Lovelace');
      expect(avatarProps.name, 'Ada Lovelace');

      final groupItem = AvatarGroupItem(
        id: 'u1',
        testId: 'u1-test',
        ariaLabel: 'Ada Lovelace',
        src: 'https://example.com/a.png',
        alt: 'Ada',
        name: 'Ada Lovelace',
        initials: 'AL',
        icon: Icons.person,
        iconName: 'person',
        color: ColorIntent.primary,
        shape: AvatarShape.circle,
        status: AvatarStatus.online,
        statusLabel: 'Online',
      );
      final groupItemCopied = groupItem.copyWith(
        status: AvatarStatus.busy,
        statusLabel: 'Busy',
      );
      final groupItemUnchanged = groupItem.copyWith();

      expect(groupItemCopied.id, 'u1');
      expect(groupItemCopied.status, AvatarStatus.busy);
      expect(groupItemUnchanged.name, 'Ada Lovelace');
      expect(groupItemUnchanged.status, AvatarStatus.online);

      final groupProps = MagicAvatarGroupProps(
        items: <AvatarGroupItem>[groupItem],
      );
      expect(groupProps.items.single.id, 'u1');

      const listItemProps = MagicListItemProps(
        primaryText: 'Inbox',
        appearance: MagicListItemAppearance.outlined,
      );
      expect(listItemProps.primaryText, 'Inbox');

      const step = MagicStepItem(id: 's1', label: 'Details');
      final stepCopied = step.copyWith(
        completed: true,
        status: MagicStepStatus.completed,
      );
      expect(stepCopied.completed, isTrue);
      expect(stepCopied.status, MagicStepStatus.completed);

      final stepperProps = MagicStepperProps(
        steps: <MagicStepItem>[stepCopied],
        orientation: MagicStepperOrientation.vertical,
      );
      expect(stepperProps.steps.single.id, 's1');

      const paginationProps = MagicPaginationProps(
        totalItems: 100,
        variant: MagicPaginationVariant.filled,
        shape: MagicPaginationShape.circular,
      );
      expect(paginationProps.totalItems, 100);

      const crumb = MagicBreadcrumbItem(id: 'home', label: 'Home');
      final crumbCopied = crumb.copyWith(current: true);
      expect(crumbCopied.current, isTrue);
      final breadcrumbsProps = MagicBreadcrumbsProps(
        items: <MagicBreadcrumbItem>[crumbCopied],
      );
      expect(breadcrumbsProps.items.single.label, 'Home');

      const range = MagicDateRangeValue(start: '2026-11-01', end: '2026-11-10');
      final rangeCopied = range.copyWith(end: '2026-11-12');
      expect(rangeCopied.end, '2026-11-12');
      const datePickerProps = MagicDatePickerProps(
        mode: MagicDatePickerMode.range,
        rangeValue: range,
      );
      expect(datePickerProps.mode, MagicDatePickerMode.range);

      const ratingProps = MagicRatingProps(
        value: 4.5,
        precision: MagicRatingPrecision.half,
      );
      expect(ratingProps.precision.value, 0.5);
    });
  });
}
