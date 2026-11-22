import {
  ACCORDION_APPEARANCES,
  ALERT_SEVERITIES,
  ALERT_VARIANTS,
  ATOMIC_TIERS,
  AVATAR_GROUP_SPACINGS,
  AVATAR_SHAPES,
  AVATAR_STATUSES,
  DIALOG_SIZES,
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
  type ButtonAtomProps,
  type ButtonToggleAtomProps,
  type CardMoleculeProps,
  type CheckBoxAtomProps,
  type ChipAtomProps,
  type DialogActionItem,
  type DialogMoleculeProps,
  type FormFieldMoleculeProps,
  type MagicAccordionProps,
  type MagicAlertProps,
  type MagicAvatarGroupProps,
  type MagicAvatarProps,
  type MagicDialogProps,
  type MagicTabsProps,
  type MagicToastProps,
  type MenuMoleculeProps,
  type ProgressIndicatorAtomProps,
  type RadioButtonAtomProps,
  type SearchBarMoleculeProps,
  type SelectMoleculeProps,
  type SlideToggleAtomProps,
  type SliderAtomProps,
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
});
