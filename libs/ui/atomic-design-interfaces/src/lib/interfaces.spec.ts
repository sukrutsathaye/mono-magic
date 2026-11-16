import {
  ATOMIC_TIERS,
  type ButtonAtomProps,
  type SearchBarMoleculeProps,
  type TextInputAtomProps,
} from '../index.js';

describe('atomic-design-interfaces', () => {
  it('exposes the four UI library Atomic Design tiers in order', () => {
    expect(ATOMIC_TIERS).toEqual(['atom', 'molecule', 'organism', 'template']);
  });

  it('supports compliant ButtonAtomProps, TextInputAtomProps, and SearchBarMoleculeProps', () => {
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

    const searchBar: SearchBarMoleculeProps = {
      label: input.label,
      placeholder: input.placeholder,
      submitLabel: button.label,
      buttonVariant: button.variant,
      buttonColor: button.color,
      size: 'md',
    };

    expect(button.label).toBe('Search');
    expect(input.variant).toBe('outlined');
    expect(searchBar.submitLabel).toBe('Search');
  });
});
