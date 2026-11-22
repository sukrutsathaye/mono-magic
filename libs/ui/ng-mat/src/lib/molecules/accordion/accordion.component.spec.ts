import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import type {
  AccordionAppearance,
  AccordionItem,
  AtomicSize,
} from '@mono-magic/atomic-design-interfaces';
import {
  MagicAccordionComponent,
  MagicAccordionPanelDirective,
} from './accordion.component';

const SAMPLE_ITEMS: readonly AccordionItem[] = [
  {
    id: 'general',
    title: 'General',
    summary: 'Core preferences',
    icon: 'tune',
    content: 'General configuration details.',
    expanded: true,
  },
  {
    id: 'security',
    title: 'Security',
    summary: '2FA & sessions',
    icon: 'shield',
    content: 'Security keys and active sessions.',
  },
  {
    id: 'billing',
    title: 'Billing',
    disabled: true,
    content: 'Enterprise billing managed by admin.',
  },
];

@Component({
  imports: [MagicAccordionComponent, MagicAccordionPanelDirective],
  template: `
    <magic-accordion [items]="items()" [defaultExpandedIds]="['general']" testId="proj-acc">
      <ng-template magicAccordionPanel="general">
        <div class="custom-panel-body">Custom Projected Accordion Body</div>
      </ng-template>
    </magic-accordion>
  `,
})
class ProjectedAccordionHostComponent {
  readonly items = signal<readonly AccordionItem[]>(SAMPLE_ITEMS);
}

describe('MagicAccordionComponent', () => {
  let fixture: ComponentFixture<MagicAccordionComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const matAccordion = (): HTMLElement =>
    host().querySelector('mat-accordion') as HTMLElement;
  const headers = (): HTMLElement[] =>
    Array.from(host().querySelectorAll('mat-expansion-panel-header'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicAccordionComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicAccordionComponent);
    setInputs({ items: SAMPLE_ITEMS });
  });

  describe('rendering, attributes & appearance', () => {
    it('forwards id/testId/ariaLabel cleanly and respects item.expanded fallback', () => {
      setInputs({
        id: 'faq-acc',
        testId: 'faq',
        ariaLabel: 'Frequently asked questions',
      });

      expect(host().getAttribute('id')).toBeNull();
      expect(matAccordion().getAttribute('id')).toBe('faq-acc');
      expect(matAccordion().getAttribute('data-testid')).toBe('faq');
      expect(matAccordion().getAttribute('aria-label')).toBe(
        'Frequently asked questions',
      );
      expect(fixture.componentInstance.currentExpandedIds()).toEqual(['general']);
      expect(headers()).toHaveLength(3);
      expect(headers()[0].textContent).toContain('General');
      expect(headers()[0].textContent).toContain('Core preferences');
      expect(headers()[2].getAttribute('aria-disabled')).toBe('true');
    });

    it.each(['outlined', 'raised'] as AccordionAppearance[])(
      'supports appearance=%s',
      (appearance) => {
        setInputs({ appearance });
        expect(host().classList).toContain(`magic-accordion--${appearance}`);
      },
    );

    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as AtomicSize[])(
      'applies magic-size-%s class',
      (size) => {
        setInputs({ size });
        expect(host().classList).toContain(`magic-size-${size}`);
      },
    );
  });

  describe('single & multi-expand state & outputs', () => {
    it('collapses previous panel when multiple=false and emits expandedIdsChange', () => {
      const changeSpy = vi.fn();
      fixture.componentInstance.expandedIdsChange.subscribe(changeSpy);

      setInputs({ multiple: false, defaultExpandedIds: ['general'] });
      expect(fixture.componentInstance.currentExpandedIds()).toEqual(['general']);

      headers()[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.currentExpandedIds()).toEqual([
        'security',
      ]);
      expect(changeSpy).toHaveBeenCalledWith(['security']);

      // Clicking open security panel closes it
      headers()[1].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.currentExpandedIds()).toEqual([]);
      expect(changeSpy).toHaveBeenLastCalledWith([]);
    });

    it('keeps multiple panels open when multiple=true and ignores disabled panel clicks', () => {
      const changeSpy = vi.fn();
      fixture.componentInstance.expandedIdsChange.subscribe(changeSpy);

      setInputs({
        multiple: true,
        defaultExpandedIds: ['general', 'general', 'missing'],
      });
      expect(fixture.componentInstance.currentExpandedIds()).toEqual(['general']);

      headers()[1].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.currentExpandedIds()).toEqual([
        'general',
        'security',
      ]);
      expect(changeSpy).toHaveBeenCalledWith(['general', 'security']);

      headers()[2].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.currentExpandedIds()).toEqual([
        'general',
        'security',
      ]);
    });

    it('honors controlled expandedIds without mutating internal state', () => {
      const changeSpy = vi.fn();
      fixture.componentInstance.expandedIdsChange.subscribe(changeSpy);

      setInputs({ multiple: false, expandedIds: ['general', 'security'] });
      expect(fixture.componentInstance.currentExpandedIds()).toEqual(['general']);

      headers()[1].click();
      fixture.detectChanges();
      expect(changeSpy).toHaveBeenCalledWith(['security']);
      expect(fixture.componentInstance.currentExpandedIds()).toEqual(['general']);
    });
  });

  describe('custom panel projection', () => {
    it('renders [magicAccordionPanel] template for matching item id', () => {
      const hostFixture = TestBed.createComponent(ProjectedAccordionHostComponent);
      hostFixture.detectChanges();

      const el = hostFixture.nativeElement as HTMLElement;
      expect(el.querySelector('.custom-panel-body')?.textContent).toContain(
        'Custom Projected Accordion Body',
      );
    });
  });
});
