import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import type {
  AtomicSize,
  BreadcrumbItem,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicBreadcrumbsComponent } from './breadcrumbs.component';

const TRAIL: readonly BreadcrumbItem[] = [
  { id: 'home', label: 'Home', href: '#home', icon: 'home' },
  { id: 'products', label: 'Products', href: '#products' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'audio', label: 'Audio', disabled: true },
  { id: 'headphones', label: 'Headphones', current: true },
];

describe('MagicBreadcrumbsComponent', () => {
  let fixture: ComponentFixture<MagicBreadcrumbsComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const nav = (): HTMLElement => host().querySelector('nav') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicBreadcrumbsComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicBreadcrumbsComponent);
    setInputs({ items: TRAIL, testId: 'bc' });
  });

  describe('rendering, separators & accessibility', () => {
    it('forwards id/testId/ariaLabel cleanly and marks current item with aria-current="page"', () => {
      setInputs({ id: 'page-bc', ariaLabel: 'Catalog path' });

      expect(host().getAttribute('id')).toBeNull();
      expect(nav().getAttribute('id')).toBe('page-bc');
      expect(nav().getAttribute('data-testid')).toBe('bc');
      expect(nav().getAttribute('aria-label')).toBe('Catalog path');

      const current = host().querySelector('[aria-current="page"]');
      expect(current?.textContent).toContain('Headphones');
      expect(
        host()
          .querySelector('[data-testid="bc-item-audio"]')
          ?.getAttribute('aria-disabled'),
      ).toBe('true');
    });

    it('defaults last item to current when no explicit current flag is provided', () => {
      setInputs({
        items: [
          { id: 'a', label: 'Root', href: '#root' },
          { id: 'b', label: 'Section' },
          { id: 'c', label: 'Leaf', icon: 'description' },
        ],
      });

      const current = host().querySelector('[aria-current="page"]');
      expect(current?.textContent).toContain('Leaf');
    });

    it('renders text and Material icon separators', () => {
      setInputs({ separator: '>' });
      expect(
        host().querySelector('.magic-breadcrumbs__separator')?.textContent?.trim(),
      ).toBe('>');

      setInputs({ separator: 'chevron_right' });
      expect(
        host().querySelector('.magic-breadcrumbs__sep-icon')?.textContent?.trim(),
      ).toBe('chevron_right');
    });

    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as AtomicSize[])(
      'applies magic-size-%s class',
      (size) => {
        setInputs({ size });
        expect(host().classList).toContain(`magic-size-${size}`);
      },
    );

    it.each(['primary', 'secondary', 'neutral'] as ColorIntent[])(
      'applies magic-color-%s class',
      (color) => {
        setInputs({ color });
        expect(host().classList).toContain(`magic-color-${color}`);
      },
    );
  });

  describe('collapsing, expansion & interactions', () => {
    it('collapses middle items when items.length > maxItems and renders trailing links/buttons', () => {
      const clickSpy = vi.fn();
      fixture.componentInstance.itemClicked.subscribe(clickSpy);

      setInputs({
        maxItems: 3,
        itemsBeforeCollapse: 1,
        itemsAfterCollapse: 3,
        separator: 'chevron_right',
      });

      expect(host().querySelector('[data-testid="bc-item-home"]')).toBeTruthy();
      expect(
        host().querySelector('[data-testid="bc-item-products"]'),
      ).toBeNull();
      expect(
        host().querySelector('[data-testid="bc-item-electronics"]'),
      ).toBeTruthy();
      expect(
        host().querySelector('[data-testid="bc-item-headphones"]'),
      ).toBeTruthy();

      const trailingBtn = host().querySelector(
        '[data-testid="bc-item-electronics"]',
      ) as HTMLButtonElement;
      trailingBtn.click();
      expect(clickSpy).toHaveBeenCalledWith(TRAIL[2]);

      const expandBtn = host().querySelector(
        '[data-testid="bc-expand"]',
      ) as HTMLButtonElement;
      expandBtn.click();
      fixture.detectChanges();

      expect(
        host().querySelector('[data-testid="bc-item-products"]'),
      ).toBeTruthy();
      expect(host().querySelector('[data-testid="bc-expand"]')).toBeNull();
    });

    it('renders trailing href link when collapsed item has href', () => {
      const clickSpy = vi.fn();
      fixture.componentInstance.itemClicked.subscribe(clickSpy);

      setInputs({
        items: [
          { id: 'a', label: 'A', href: '#a' },
          { id: 'b', label: 'B', href: '#b' },
          { id: 'c', label: 'C', href: '#c' },
          { id: 'd', label: 'D', href: '#d' },
          { id: 'e', label: 'E', current: true },
        ],
        maxItems: 3,
        itemsBeforeCollapse: 1,
        itemsAfterCollapse: 2,
      });

      const trailingLink = host().querySelector(
        '[data-testid="bc-item-d"]',
      ) as HTMLAnchorElement;
      expect(trailingLink.tagName).toBe('A');
      trailingLink.click();
      expect(clickSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'd' }),
      );
    });

    it('emits itemClicked for enabled items and ignores disabled items or global disabled state', () => {
      const clickSpy = vi.fn();
      fixture.componentInstance.itemClicked.subscribe(clickSpy);

      const homeLink = host().querySelector(
        '[data-testid="bc-item-home"]',
      ) as HTMLAnchorElement;
      homeLink.click();
      expect(clickSpy).toHaveBeenCalledWith(TRAIL[0]);

      const btnItem = host().querySelector(
        '[data-testid="bc-item-electronics"]',
      ) as HTMLButtonElement;
      btnItem.click();
      expect(clickSpy).toHaveBeenCalledWith(TRAIL[2]);

      clickSpy.mockClear();
      const disabledBtn = host().querySelector(
        '[data-testid="bc-item-audio"]',
      ) as HTMLButtonElement;
      disabledBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(clickSpy).not.toHaveBeenCalled();

      setInputs({ disabled: true, maxItems: 3 });
      expect(host().classList).toContain('magic-breadcrumbs--disabled');
      fixture.componentInstance.expand();
      fixture.detectChanges();
      expect(host().querySelector('[data-testid="bc-expand"]')).toBeTruthy();

      const productsBtn = host().querySelector(
        '[data-testid="bc-item-home"]',
      ) as HTMLButtonElement;
      expect(productsBtn.disabled).toBe(true);
    });
  });
});
