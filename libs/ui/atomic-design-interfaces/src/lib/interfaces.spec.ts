import {
  ATOMIC_TIERS,
  type BadgeAtomProps,
  type ButtonAtomProps,
  type ButtonToggleAtomProps,
  type CardMoleculeProps,
  type CheckBoxAtomProps,
  type ChipAtomProps,
  type FormFieldMoleculeProps,
  type MenuMoleculeProps,
  type ProgressIndicatorAtomProps,
  type RadioButtonAtomProps,
  type SearchBarMoleculeProps,
  type SelectMoleculeProps,
  type SlideToggleAtomProps,
  type SliderAtomProps,
  type TextInputAtomProps,
  type TextInputControlProps,
  type ToolTipAtomProps,
} from '../index.js';

describe('atomic-design-interfaces', () => {
  it('exposes the four UI library Atomic Design tiers in order', () => {
    expect(ATOMIC_TIERS).toEqual(['atom', 'molecule', 'organism', 'template']);
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

  it('supports compliant molecule prop contracts', () => {
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
});
