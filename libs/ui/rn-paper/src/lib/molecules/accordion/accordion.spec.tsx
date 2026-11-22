import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Text, type View } from 'react-native';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MagicPaperProvider } from '../../theme/paper-theme';
import { MagicAccordion, type AccordionItem } from './accordion';

afterEach(cleanup);

const ITEMS: readonly AccordionItem[] = [
  {
    id: 'one',
    title: 'General Settings',
    summary: 'Theme & defaults',
    icon: 'tune',
    content: 'General settings panel content.',
    expanded: true,
  },
  {
    id: 'two',
    title: 'Security',
    summary: 'Tokens & permissions',
    content: 'Security panel content.',
  },
  {
    id: 'three',
    title: 'Billing',
    disabled: true,
    content: 'Billing panel content.',
  },
];

describe('MagicAccordion', () => {
  it('expands single item at a time by default and forwards ref and ARIA attrs', () => {
    const ref = createRef<View>();
    const onExpandedChange = vi.fn();
    const onItemToggle = vi.fn();

    render(
      <MagicPaperProvider palette="azure-blue">
        <MagicAccordion
          ref={ref}
          id="faq-accordion"
          testId="rn-accordion"
          ariaLabel="FAQ sections"
          items={ITEMS}
          onExpandedChange={onExpandedChange}
          onItemToggle={onItemToggle}
        />
      </MagicPaperProvider>
    );

    expect(ref.current).toBeTruthy();
    expect(screen.getByTestId('rn-accordion').getAttribute('id')).toBe(
      'faq-accordion'
    );
    expect(
      screen.getByTestId('rn-accordion-header-one').getAttribute('aria-expanded')
    ).toBe('true');
    expect(screen.getByText('General settings panel content.')).toBeTruthy();
    expect(screen.queryByTestId('rn-accordion-panel-two')).toBeNull();

    // Expand 'two' — collapses 'one' in single mode
    fireEvent.click(screen.getByTestId('rn-accordion-header-two'));
    expect(onExpandedChange).toHaveBeenCalledWith(['two']);
    expect(onItemToggle).toHaveBeenCalledWith(ITEMS[1], true);
    expect(screen.queryByTestId('rn-accordion-panel-one')).toBeNull();
    expect(screen.getByText('Security panel content.')).toBeTruthy();

    // Disabled item does not toggle
    fireEvent.click(screen.getByTestId('rn-accordion-header-three'));
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('rn-accordion-panel-three')).toBeNull();
  });

  it('supports multiple expansion, collapse, raised appearance, sizes, and renderContent', () => {
    const onExpandedChange = vi.fn();

    render(
      <MagicPaperProvider palette="dark-theme">
        <MagicAccordion
          testId="multi-acc"
          items={ITEMS}
          multiple
          defaultExpandedIds={['one']}
          appearance="raised"
          size="lg"
          onExpandedChange={onExpandedChange}
          renderContent={(item) => <Text>Rendered: {item.title}</Text>}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByText('Rendered: General Settings')).toBeTruthy();

    // Expanding second keeps first open
    fireEvent.click(screen.getByTestId('multi-acc-header-two'));
    expect(onExpandedChange).toHaveBeenLastCalledWith(['one', 'two']);
    expect(screen.getByText('Rendered: General Settings')).toBeTruthy();
    expect(screen.getByText('Rendered: Security')).toBeTruthy();

    // Collapsing first leaves second open
    fireEvent.click(screen.getByTestId('multi-acc-header-one'));
    expect(onExpandedChange).toHaveBeenLastCalledWith(['two']);
    expect(screen.queryByTestId('multi-acc-panel-one')).toBeNull();
  });

  it('supports controlled expandedIds mode', () => {
    const onExpandedChange = vi.fn();

    const { rerender } = render(
      <MagicPaperProvider>
        <MagicAccordion
          testId="ctrl-acc"
          items={ITEMS}
          expandedIds={['two']}
          size="xs"
          onExpandedChange={onExpandedChange}
        />
      </MagicPaperProvider>
    );

    expect(screen.getByTestId('ctrl-acc-panel-two')).toBeTruthy();
    fireEvent.click(screen.getByTestId('ctrl-acc-header-one'));
    expect(onExpandedChange).toHaveBeenCalledWith(['one']);
    // Still controlled at ['two'] until parent updates
    expect(screen.queryByTestId('ctrl-acc-panel-one')).toBeNull();

    rerender(
      <MagicPaperProvider>
        <MagicAccordion
          testId="ctrl-acc"
          items={ITEMS}
          expandedIds={['one']}
          size="xs"
          onExpandedChange={onExpandedChange}
        />
      </MagicPaperProvider>
    );
    expect(screen.getByTestId('ctrl-acc-panel-one')).toBeTruthy();
  });

  it('handles single-mode clamping, missing testId, and panels without content', () => {
    const multiHintItems: readonly AccordionItem[] = [
      { id: 'a', title: 'Alpha', expanded: true },
      { id: 'b', title: 'Beta', expanded: true, content: 'Beta body' },
    ];

    render(
      <MagicPaperProvider>
        <MagicAccordion items={multiHintItems} multiple={false} />
      </MagicPaperProvider>
    );

    // Only the first expanded item remains open in single mode and empty content renders cleanly
    expect(screen.getByText('Alpha')).toBeTruthy();
    expect(screen.queryByText('Beta body')).toBeNull();

    cleanup();

    render(
      <MagicPaperProvider>
        <MagicAccordion
          items={multiHintItems}
          multiple={false}
          defaultExpandedIds={['a', 'b']}
        />
      </MagicPaperProvider>
    );
    expect(screen.queryByText('Beta body')).toBeNull();
  });
});
