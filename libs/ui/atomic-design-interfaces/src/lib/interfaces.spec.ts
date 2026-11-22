import {
  ACCORDION_APPEARANCES,
  ALERT_SEVERITIES,
  ALERT_VARIANTS,
  ATOMIC_TIERS,
  AVATAR_GROUP_SPACINGS,
  AVATAR_SHAPES,
  AVATAR_STATUSES,
  DATE_PICKER_MODES,
  DIALOG_SIZES,
  LIST_ITEM_APPEARANCES,
  PAGINATION_SHAPES,
  PAGINATION_VARIANTS,
  RATING_PRECISIONS,
  STEP_STATUSES,
  STEPPER_ORIENTATIONS,
  TABS_ORIENTATIONS,
  TABS_VARIANTS,
  TOAST_POSITIONS,
  type AccordionItem,
  type AccordionMoleculeProps,
  type AlertMoleculeProps,
  type AvatarGroupItem,
  type AvatarGroupMoleculeProps,
  type AvatarMoleculeProps,
  type BadgeAtomProps,
  type BreadcrumbItem,
  type BreadcrumbsMoleculeProps,
  type ButtonAtomProps,
  type ButtonToggleAtomProps,
  type CardMoleculeProps,
  type CheckBoxAtomProps,
  type ChipAtomProps,
  type DatePickerMoleculeProps,
  type DateRangeValue,
  type DialogActionItem,
  type DialogMoleculeProps,
  type FormFieldMoleculeProps,
  type ListItemMoleculeProps,
  type MagicAccordionProps,
  type MagicAlertProps,
  type MagicAvatarGroupProps,
  type MagicAvatarProps,
  type MagicBreadcrumbItem,
  type MagicBreadcrumbsProps,
  type MagicDatePickerProps,
  type MagicDialogProps,
  type MagicListItemProps,
  type MagicPaginationProps,
  type MagicRatingProps,
  type MagicStepItem,
  type MagicStepperProps,
  type MagicTabsProps,
  type MagicToastProps,
  type MenuMoleculeProps,
  type PaginationMoleculeProps,
  type ProgressIndicatorAtomProps,
  type RadioButtonAtomProps,
  type RatingMoleculeProps,
  type SearchBarMoleculeProps,
  type SelectMoleculeProps,
  type SlideToggleAtomProps,
  type SliderAtomProps,
  type StepItem,
  type StepperMoleculeProps,
  type TabItem,
  type TabsMoleculeProps,
  type TextInputAtomProps,
  type TextInputControlProps,
  type ToastMoleculeProps,
  type ToolTipAtomProps,
} from '../index.js';

describe('atomic-design-interfaces', () => {
  it('exposes the four UI library Atomic Design tiers in order', () => {
    expect(ATOMIC_TIERS).toEqual(['atom', 'molecule', 'organism', 'template']);
  });

  it('exposes Wave 2 molecule runtime enum constant arrays in order', () => {
    expect(DIALOG_SIZES).toEqual(['sm', 'md', 'lg', 'fullscreen']);
    expect(ALERT_SEVERITIES).toEqual(['info', 'success', 'warning', 'error']);
    expect(ALERT_VARIANTS).toEqual(['standard', 'filled', 'outlined']);
    expect(TOAST_POSITIONS).toEqual([
      'top-left',
      'top-center',
      'top-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ]);
    expect(TABS_ORIENTATIONS).toEqual(['horizontal', 'vertical']);
    expect(TABS_VARIANTS).toEqual(['primary', 'secondary']);
    expect(ACCORDION_APPEARANCES).toEqual(['outlined', 'raised']);
    expect(AVATAR_STATUSES).toEqual(['online', 'busy', 'offline']);
    expect(AVATAR_SHAPES).toEqual(['circle', 'rounded', 'square']);
    expect(AVATAR_GROUP_SPACINGS).toEqual(['tight', 'normal']);
    expect(LIST_ITEM_APPEARANCES).toEqual(['standard', 'outlined', 'filled']);
    expect(STEPPER_ORIENTATIONS).toEqual(['horizontal', 'vertical']);
    expect(STEP_STATUSES).toEqual(['pending', 'active', 'completed', 'error']);
    expect(PAGINATION_VARIANTS).toEqual(['text', 'outlined', 'filled']);
    expect(PAGINATION_SHAPES).toEqual(['rounded', 'circular']);
    expect(DATE_PICKER_MODES).toEqual(['single', 'range']);
    expect(RATING_PRECISIONS).toEqual([0.5, 1]);
  });

  it('supports compliant atom prop contracts', () => {
    const button: ButtonAtomProps = {
      label: 'Search',
      variant: 'filled',
      color: 'primary',
      size: 'md',
      disabled: false,
      loading: false,
    };
    const input: TextInputAtomProps = {
      label: 'Query',
      placeholder: 'Search items...',
      variant: 'outlined',
      size: 'md',
    };
    const control: TextInputControlProps = {
      type: 'email',
      placeholder: 'name@example.com',
      size: 'md',
    };
    const badge: BadgeAtomProps = { content: 4, color: 'primary', overlap: true };
    const toggle: ButtonToggleAtomProps = {
      options: [{ value: 'a', label: 'A' }],
      selectionMode: 'single',
    };
    const check: CheckBoxAtomProps = { label: 'Accept', checked: false };
    const chip: ChipAtomProps = { chips: [{ label: 'Tag' }], variant: 'basic' };
    const progress: ProgressIndicatorAtomProps = {
      type: 'spinner',
      mode: 'indeterminate',
    };
    const radio: RadioButtonAtomProps = {
      options: [{ value: 'one', label: 'One' }],
      value: 'one',
    };
    const slide: SlideToggleAtomProps = { label: 'Dark mode', checked: true };
    const slider: SliderAtomProps = { min: 0, max: 100, value: 50 };
    const tooltip: ToolTipAtomProps = {
      message: 'More info',
      position: 'below',
    };

    expect(button.label).toBe('Search');
    expect(input.variant).toBe('outlined');
    expect(control.type).toBe('email');
    expect(badge.content).toBe(4);
    expect(toggle.options).toHaveLength(1);
    expect(check.checked).toBe(false);
    expect(chip.chips).toHaveLength(1);
    expect(progress.type).toBe('spinner');
    expect(radio.value).toBe('one');
    expect(slide.checked).toBe(true);
    expect(slider.value).toBe(50);
    expect(tooltip.message).toBe('More info');
  });

  it('supports compliant Wave 1 molecule prop contracts', () => {
    const formField: FormFieldMoleculeProps = {
      label: 'Email',
      appearance: 'outlined',
    };
    const searchBar: SearchBarMoleculeProps = {
      label: 'Search',
      submitLabel: 'Go',
      size: 'md',
    };
    const select: SelectMoleculeProps<number> = {
      label: 'Fruit',
      options: [{ value: 1, label: 'Apple' }],
      multiple: false,
    };
    const menu: MenuMoleculeProps = {
      items: [{ label: 'Settings', icon: 'settings' }],
      triggerLabel: 'Menu',
    };
    const card: CardMoleculeProps = {
      title: 'Summary',
      appearance: 'raised',
      variant: 'with-actions',
      actions: [{ label: 'Open' }],
    };

    expect(formField.appearance).toBe('outlined');
    expect(searchBar.submitLabel).toBe('Go');
    expect(select.options).toHaveLength(1);
    expect(menu.items).toHaveLength(1);
    expect(card.actions).toHaveLength(1);
  });

  it('supports compliant Wave 2 molecule prop contracts, item descriptors, and Magic*Props aliases', () => {
    const dialogAction: DialogActionItem = {
      id: 'confirm',
      label: 'Confirm',
      variant: 'filled',
      color: 'primary',
      icon: 'check_circle',
      disabled: false,
    };
    const dialog: DialogMoleculeProps = {
      id: 'delete-dialog',
      testId: 'delete-dialog',
      ariaLabel: 'Confirm deletion',
      open: true,
      title: 'Delete project',
      subtitle: 'This action cannot be undone.',
      content: 'All associated records will be removed.',
      size: 'md',
      dismissible: true,
      closeOnBackdropClick: true,
      closeOnEscape: true,
      showCloseButton: true,
      scrollable: false,
      actions: [dialogAction],
      alignActions: 'end',
    };
    const magicDialog: MagicDialogProps = dialog;

    const alert: AlertMoleculeProps = {
      id: 'sync-alert',
      severity: 'info',
      variant: 'standard',
      title: 'Heads up',
      message: 'Workspace indexing is in progress.',
      icon: 'info',
      hideIcon: false,
      dismissible: true,
      actionLabel: 'Retry',
      size: 'md',
    };
    const magicAlert: MagicAlertProps = alert;

    const toast: ToastMoleculeProps = {
      id: 'save-toast',
      open: true,
      severity: 'success',
      title: 'Saved',
      message: 'Changes persisted.',
      duration: 4000,
      position: 'bottom-right',
      dismissible: true,
      actionLabel: 'Undo',
    };
    const magicToast: MagicToastProps = toast;

    const tabItem: TabItem = {
      id: 'overview',
      label: 'Overview',
      icon: 'home',
      badgeContent: 3,
      disabled: false,
      content: 'Overview content',
    };
    const tabs: TabsMoleculeProps = {
      items: [tabItem],
      activeTabId: 'overview',
      defaultActiveTabId: 'overview',
      orientation: 'horizontal',
      variant: 'primary',
      scrollable: true,
      lazy: true,
      color: 'primary',
      size: 'md',
    };
    const magicTabs: MagicTabsProps = tabs;

    const accordionItem: AccordionItem = {
      id: 'faq-1',
      title: 'How does Nx caching work?',
      summary: 'Inputs and outputs hashing',
      content: 'Nx hashes inputs and restores cached outputs.',
      icon: 'info',
      disabled: false,
      expanded: true,
    };
    const accordion: AccordionMoleculeProps = {
      items: [accordionItem],
      multiple: true,
      expandedIds: ['faq-1'],
      defaultExpandedIds: ['faq-1'],
      appearance: 'outlined',
      size: 'md',
    };
    const magicAccordion: MagicAccordionProps = accordion;

    const avatar: AvatarMoleculeProps = {
      src: 'https://example.com/avatar.png',
      alt: 'Ada Lovelace',
      name: 'Ada Lovelace',
      initials: 'AL',
      icon: 'person',
      size: 'lg',
      color: 'tertiary',
      shape: 'circle',
      status: 'online',
      statusLabel: 'Online',
    };
    const magicAvatar: MagicAvatarProps = avatar;

    const avatarGroupItem: AvatarGroupItem = {
      id: 'member-1',
      name: 'Grace Hopper',
      initials: 'GH',
      color: 'secondary',
      shape: 'circle',
      status: 'busy',
    };
    const avatarGroup: AvatarGroupMoleculeProps = {
      items: [avatarGroupItem],
      max: 4,
      size: 'md',
      spacing: 'tight',
    };
    const magicAvatarGroup: MagicAvatarGroupProps = avatarGroup;

    expect(magicDialog.actions).toHaveLength(1);
    expect(magicDialog.size).toBe('md');
    expect(magicAlert.severity).toBe('info');
    expect(magicToast.position).toBe('bottom-right');
    expect(magicTabs.items[0]?.badgeContent).toBe(3);
    expect(magicAccordion.items[0]?.expanded).toBe(true);
    expect(magicAvatar.status).toBe('online');
    expect(magicAvatarGroup.spacing).toBe('tight');
  });

  it('supports compliant Wave 2 Batch 2 molecule contracts, aliases, and FormField inheritance', () => {
    const listItem: ListItemMoleculeProps = {
      id: 'item-1',
      testId: 'list-item-1',
      ariaLabel: 'Inbox row',
      primaryText: 'Inbox',
      secondaryText: '12 unread messages',
      overlineText: 'MAILBOX',
      leadingIcon: 'inbox',
      leadingAvatarText: 'IN',
      leadingAvatarSrc: 'https://example.com/inbox.png',
      trailingIcon: 'chevron_right',
      trailingText: '2m ago',
      trailingBadge: 12,
      interactive: true,
      selectable: true,
      selected: false,
      disabled: false,
      divider: true,
      dense: false,
      color: 'primary',
      size: 'md',
      appearance: 'outlined',
    };
    const magicListItem: MagicListItemProps = listItem;

    const stepItem: StepItem = {
      id: 'step-account',
      label: 'Account Details',
      description: 'Enter your workspace credentials',
      optional: false,
      optionalLabel: 'Optional',
      completed: true,
      error: false,
      errorMessage: undefined,
      disabled: false,
      icon: 'person',
      status: 'completed',
    };
    const magicStepItem: MagicStepItem = stepItem;
    const stepper: StepperMoleculeProps = {
      id: 'onboarding-stepper',
      steps: [magicStepItem],
      activeStep: 0,
      defaultActiveStep: 0,
      orientation: 'horizontal',
      linear: true,
      alternativeLabel: false,
      color: 'primary',
      size: 'md',
      disabled: false,
    };
    const magicStepper: MagicStepperProps = stepper;

    const pagination: PaginationMoleculeProps = {
      id: 'results-pagination',
      page: 2,
      defaultPage: 1,
      totalItems: 120,
      pageSize: 10,
      pageSizeOptions: [10, 25, 50],
      siblingCount: 1,
      boundaryCount: 1,
      showFirstLast: true,
      showPageSizeSelector: true,
      showTotalCount: true,
      variant: 'outlined',
      shape: 'rounded',
      color: 'primary',
      size: 'md',
      disabled: false,
    };
    const magicPagination: MagicPaginationProps = pagination;

    const breadcrumbItem: BreadcrumbItem = {
      id: 'crumb-home',
      label: 'Home',
      href: '/',
      icon: 'home',
      disabled: false,
      current: false,
    };
    const magicBreadcrumbItem: MagicBreadcrumbItem = breadcrumbItem;
    const breadcrumbs: BreadcrumbsMoleculeProps = {
      id: 'page-breadcrumbs',
      items: [
        magicBreadcrumbItem,
        { id: 'crumb-settings', label: 'Settings', current: true },
      ],
      separator: '/',
      maxItems: 4,
      itemsBeforeCollapse: 1,
      itemsAfterCollapse: 2,
      color: 'primary',
      size: 'sm',
      disabled: false,
    };
    const magicBreadcrumbs: MagicBreadcrumbsProps = breadcrumbs;

    const rangeValue: DateRangeValue = {
      start: '2026-11-01',
      end: '2026-11-15',
    };
    const datePicker: DatePickerMoleculeProps = {
      id: 'booking-date',
      label: 'Booking dates',
      hint: 'Select check-in and check-out dates',
      errorText: undefined,
      appearance: 'outlined',
      size: 'md',
      floatLabel: 'auto',
      subscriptSizing: 'fixed',
      hideRequiredMarker: false,
      mode: 'range',
      value: '2026-11-01',
      defaultValue: '2026-11-01',
      rangeValue,
      defaultRangeValue: rangeValue,
      minDate: '2026-01-01',
      maxDate: '2026-12-31',
      enableTime: false,
      placeholder: 'YYYY-MM-DD',
      startPlaceholder: 'Start date',
      endPlaceholder: 'End date',
      format: 'YYYY-MM-DD',
      required: true,
      disabled: false,
      readOnly: false,
      clearable: true,
      color: 'primary',
    };
    const magicDatePicker: MagicDatePickerProps = datePicker;
    // Verify DatePickerMoleculeProps is assignable to FormFieldMoleculeProps
    const datePickerAsFormField: FormFieldMoleculeProps = datePicker;

    const rating: RatingMoleculeProps = {
      id: 'product-rating',
      value: 4.5,
      defaultValue: 4,
      max: 5,
      precision: 0.5,
      readOnly: false,
      disabled: false,
      showValue: true,
      reviewCount: 128,
      icon: 'star',
      emptyIcon: 'star_border',
      color: 'warning',
      size: 'md',
      label: 'Overall rating',
    };
    const magicRating: MagicRatingProps = rating;

    expect(magicListItem.appearance).toBe('outlined');
    expect(magicListItem.trailingBadge).toBe(12);
    expect(magicStepper.steps[0]?.status).toBe('completed');
    expect(magicPagination.totalItems).toBe(120);
    expect(magicPagination.pageSizeOptions).toEqual([10, 25, 50]);
    expect(magicBreadcrumbs.items).toHaveLength(2);
    expect(magicBreadcrumbs.items[1]?.current).toBe(true);
    expect(magicDatePicker.rangeValue?.end).toBe('2026-11-15');
    expect(datePickerAsFormField.label).toBe('Booking dates');
    expect(magicRating.precision).toBe(0.5);
    expect(magicRating.reviewCount).toBe(128);
  });
});
