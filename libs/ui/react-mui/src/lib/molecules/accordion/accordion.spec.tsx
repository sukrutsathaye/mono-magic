import { createRef } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AccordionItem } from '@mono-magic/atomic-design-interfaces';
import { MagicMuiThemeProvider } from '../../theme/mui-theme';
import { MagicAccordion } from './accordion';

afterEach(cleanup);

const ITEMS: readonly AccordionItem[] = [
  {
    id: 'tokens',
    title: 'Design Tokens',
    summary: 'Color and typography primitives',
    content: 'All 7 palettes share semantic M3 tokens.',
    icon: 'palette',
    expanded: true,
  },
  {
    id: 'testing',
    title: 'Visual Regression',
    summary: 'Playwright Chromium snapshots',
    content: 'Vitest browser tests capture deterministic PNG baselines.',
  },
  {
    id: 'locked',
    title: 'Locked Section',
    content: 'Cannot be expanded',
    disabled: true,
  },
];

describe('MagicAccordion (React MUI)', () => {
  it('renders panels, summary, icons, ARIA controls, and forwards ref', () => {
    const accordionRef = createRef<HTMLDivElement>();
    render(
      <MagicMuiThemeProvider>
        <MagicAccordion
          ref={accordionRef}
          id="faq"
          testId="faq"
          ariaLabel="Architecture FAQ"
          items={ITEMS}
        />
      </MagicMuiThemeProvider>,
    );

    expect(accordionRef.current).toBeInstanceOf(HTMLDivElement);
    const root = screen.getByTestId('faq');
    expect(root.getAttribute('aria-label')).toBe('Architecture FAQ');

    const tokensSummary = screen.getByTestId('faq-summary-tokens');
    const testingSummary = screen.getByTestId('faq-summary-testing');
    expect(tokensSummary.getAttribute('aria-expanded')).toBe('true');
    expect(tokensSummary.getAttribute('aria-controls')).toBe(
      'faq-panel-tokens',
    );
    expect(testingSummary.getAttribute('aria-expanded')).toBe('false');
  });

  it('collapses previous panel in single mode and ignores disabled panels', () => {
    const onExpandedChange = vi.fn();
    render(
      <MagicMuiThemeProvider>
        <MagicAccordion
          testId="single-acc"
          items={ITEMS}
          onExpandedChange={onExpandedChange}
        />
      </MagicMuiThemeProvider>,
    );

    fireEvent.click(screen.getByTestId('single-acc-summary-testing'));
    expect(onExpandedChange).toHaveBeenCalledWith(
      ['testing'],
      expect.objectContaining({ id: 'testing' }),
    );
    expect(
      screen.getByTestId('single-acc-summary-tokens').getAttribute('aria-expanded'),
    ).toBe('false');
    expect(
      screen
        .getByTestId('single-acc-summary-testing')
        .getAttribute('aria-expanded'),
    ).toBe('true');

    fireEvent.click(screen.getByTestId('single-acc-summary-testing'));
    expect(onExpandedChange).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({ id: 'testing' }),
    );

    fireEvent.click(screen.getByTestId('single-acc-summary-locked'));
    expect(onExpandedChange).toHaveBeenCalledTimes(2);
  });

  it('supports multiple expansion mode, defaultExpandedIds, and controlled expandedIds', () => {
    const onExpandedChange = vi.fn();
    const { rerender } = render(
      <MagicMuiThemeProvider>
        <MagicAccordion
          testId="multi-acc"
          items={ITEMS}
          multiple
          defaultExpandedIds={['tokens']}
          onExpandedChange={onExpandedChange}
        />
      </MagicMuiThemeProvider>,
    );

    fireEvent.click(screen.getByTestId('multi-acc-summary-testing'));
    expect(onExpandedChange).toHaveBeenCalledWith(
      ['tokens', 'testing'],
      expect.objectContaining({ id: 'testing' }),
    );

    fireEvent.click(screen.getByTestId('multi-acc-summary-tokens'));
    expect(onExpandedChange).toHaveBeenCalledWith(
      ['testing'],
      expect.objectContaining({ id: 'tokens' }),
    );

    rerender(
      <MagicMuiThemeProvider>
        <MagicAccordion
          testId="multi-acc"
          items={ITEMS}
          multiple
          expandedIds={['tokens', 'testing']}
          onExpandedChange={onExpandedChange}
        />
      </MagicMuiThemeProvider>,
    );

    expect(
      screen.getByTestId('multi-acc-summary-tokens').getAttribute('aria-expanded'),
    ).toBe('true');
    expect(
      screen
        .getByTestId('multi-acc-summary-testing')
        .getAttribute('aria-expanded'),
    ).toBe('true');
  });

  it('supports outlined/raised appearances, all 5 sizes, renderItemContent, and sx', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(
        <MagicMuiThemeProvider>
          <MagicAccordion
            testId={`acc-${size}`}
            items={ITEMS}
            appearance={size === 'lg' ? 'raised' : 'outlined'}
            size={size}
            renderItemContent={(item, isExpanded) => (
              <span data-testid={`rendered-${item.id}`}>
                {item.id}:{isExpanded ? 'open' : 'closed'}
              </span>
            )}
            sx={[{ maxWidth: 480 }]}
          />
        </MagicMuiThemeProvider>,
      );

      expect(screen.getByTestId(`acc-${size}`).getAttribute('data-size')).toBe(
        size,
      );
      expect(screen.getByTestId('rendered-tokens').textContent).toBe(
        'tokens:open',
      );
      unmount();
    }

    render(
      <MagicMuiThemeProvider>
        <MagicAccordion
          testId="minimal-acc"
          items={[{ id: 'plain', title: 'Plain item' }]}
          sx={{ mt: 1 }}
        />
      </MagicMuiThemeProvider>,
    );
    expect(screen.getByText('Plain item')).toBeTruthy();
  });
});
