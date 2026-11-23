import { OverlayContainer } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
  PaginationShape,
  PaginationVariant,
} from '@mono-magic/atomic-design-interfaces';
import {
  MagicPaginationComponent,
  computePaginationTokens,
} from './pagination.component';

describe('MagicPaginationComponent', () => {
  let fixture: ComponentFixture<MagicPaginationComponent>;
  let overlayContainer: OverlayContainer;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const nav = (): HTMLElement => host().querySelector('nav') as HTMLElement;
  const btn = (suffix: string): HTMLButtonElement | null =>
    host().querySelector(`[data-testid="pg-${suffix}"]`);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicPaginationComponent],
    }).compileComponents();
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture = TestBed.createComponent(MagicPaginationComponent);
    setInputs({ totalItems: 95, pageSize: 10, testId: 'pg' });
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  describe('token computation & rendering', () => {
    it('computes ellipses cleanly across start, middle, end, and small page ranges', () => {
      const middleTokens = computePaginationTokens(12, 6, 1, 1);
      expect(middleTokens.map((t) => (t.kind === 'page' ? t.page : '…'))).toEqual([
        1,
        '…',
        5,
        6,
        7,
        '…',
        12,
      ]);

      const startTokens = computePaginationTokens(10, 2, 1, 1);
      expect(startTokens.map((t) => (t.kind === 'page' ? t.page : '…'))).toEqual([
        1,
        2,
        3,
        4,
        5,
        '…',
        10,
      ]);

      const endTokens = computePaginationTokens(10, 9, 1, 1);
      expect(endTokens.map((t) => (t.kind === 'page' ? t.page : '…'))).toEqual([
        1,
        '…',
        6,
        7,
        8,
        9,
        10,
      ]);

      const compactTokens = computePaginationTokens(5, 3, 1, 1);
      expect(compactTokens.map((t) => (t.kind === 'page' ? t.page : '…'))).toEqual([
        1, 2, 3, 4, 5,
      ]);

      const noBoundary = computePaginationTokens(5, 3, 0, 1);
      expect(noBoundary.length).toBeGreaterThan(0);

      expect(computePaginationTokens(0, 1, 1, 1)).toEqual([]);
    });

    it('forwards id/testId/ariaLabel cleanly and displays total count summary', () => {
      setInputs({
        id: 'results-pg',
        ariaLabel: 'Search results pages',
        showTotalCount: true,
        showFirstLast: true,
      });

      expect(host().getAttribute('id')).toBeNull();
      expect(nav().getAttribute('id')).toBe('results-pg');
      expect(nav().getAttribute('data-testid')).toBe('pg');
      expect(nav().getAttribute('aria-label')).toBe('Search results pages');
      expect(
        host().querySelector('[data-testid="pg-total"]')?.textContent?.trim(),
      ).toBe('1-10 of 95');
      expect(btn('first')?.disabled).toBe(true);
      expect(btn('prev')?.disabled).toBe(true);
      expect(btn('page-1')?.getAttribute('aria-current')).toBe('page');
    });

    it('handles zero totalItems cleanly and includes custom pageSize in sorted options', async () => {
      setInputs({
        totalItems: 0,
        showTotalCount: true,
        showPageSizeSelector: true,
        pageSize: 15,
        pageSizeOptions: [10, 25],
      });
      expect(
        host().querySelector('[data-testid="pg-total"]')?.textContent?.trim(),
      ).toBe('0 of 0');
      expect(fixture.componentInstance.totalPages()).toBe(1);

      const selectTrigger = host().querySelector(
        'mat-select .mat-mdc-select-trigger',
      ) as HTMLElement;
      selectTrigger.click();
      fixture.detectChanges();
      await fixture.whenStable();
      const options = Array.from(
        overlayContainer.getContainerElement().querySelectorAll('mat-option'),
      );
      expect(options.map((o) => o.textContent?.trim())).toEqual(['10', '15', '25']);
    });

    it.each(['text', 'outlined', 'filled'] as PaginationVariant[])(
      'supports variant=%s',
      (variant) => {
        setInputs({ variant });
        expect(host().classList).toContain(`magic-pagination--${variant}`);
      },
    );

    it.each(['rounded', 'circular'] as PaginationShape[])(
      'supports shape=%s',
      (shape) => {
        setInputs({ shape });
        expect(host().classList).toContain(`magic-pagination--${shape}`);
      },
    );

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

  describe('navigation, pageSize selector, controlled/uncontrolled & disabled states', () => {
    it('navigates pages via numbered buttons, prev/next, and first/last without duplicate emits', () => {
      const pageSpy = vi.fn();
      fixture.componentInstance.pageChange.subscribe(pageSpy);

      setInputs({ showFirstLast: true, defaultPage: 1 });

      // Clicking active page 1 does not emit
      btn('page-1')?.click();
      expect(pageSpy).not.toHaveBeenCalled();

      btn('page-2')?.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.currentPage()).toBe(2);
      expect(pageSpy).toHaveBeenCalledWith(2);

      btn('last')?.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.currentPage()).toBe(10);
      expect(pageSpy).toHaveBeenLastCalledWith(10);
      expect(btn('next')?.disabled).toBe(true);
      expect(btn('last')?.disabled).toBe(true);

      btn('prev')?.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.currentPage()).toBe(9);

      btn('first')?.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.currentPage()).toBe(1);
    });

    it('changes pageSize via MatSelect and clamps current page in both uncontrolled and controlled modes', async () => {
      const sizeSpy = vi.fn();
      const pageSpy = vi.fn();
      fixture.componentInstance.pageSizeChange.subscribe(sizeSpy);
      fixture.componentInstance.pageChange.subscribe(pageSpy);

      setInputs({
        totalItems: 100,
        pageSize: 10,
        defaultPage: 10,
        showPageSizeSelector: true,
        pageSizeOptions: [10, 25, 50],
      });

      const selectTrigger = host().querySelector(
        'mat-select .mat-mdc-select-trigger',
      ) as HTMLElement;
      selectTrigger.click();
      fixture.detectChanges();
      await fixture.whenStable();

      const options = Array.from(
        overlayContainer.getContainerElement().querySelectorAll('mat-option'),
      ) as HTMLElement[];
      options[2].click(); // 50 rows/page -> 2 total pages
      fixture.detectChanges();
      await fixture.whenStable();

      expect(sizeSpy).toHaveBeenCalledWith(50);
      expect(fixture.componentInstance.currentPageSize()).toBe(50);
      expect(fixture.componentInstance.totalPages()).toBe(2);
      expect(fixture.componentInstance.currentPage()).toBe(2);
      expect(pageSpy).toHaveBeenCalledWith(2);

      // Selecting same page size does not emit
      sizeSpy.mockClear();
      selectTrigger.click();
      fixture.detectChanges();
      await fixture.whenStable();
      const nextOptions = Array.from(
        overlayContainer.getContainerElement().querySelectorAll('mat-option'),
      ) as HTMLElement[];
      nextOptions[2].click();
      fixture.detectChanges();
      expect(sizeSpy).not.toHaveBeenCalled();
    });

    it('honors controlled page and ignores interaction when disabled=true', () => {
      const pageSpy = vi.fn();
      fixture.componentInstance.pageChange.subscribe(pageSpy);

      setInputs({ page: 3 });
      btn('next')?.click();
      fixture.detectChanges();
      expect(pageSpy).toHaveBeenCalledWith(4);
      expect(fixture.componentInstance.currentPage()).toBe(3);

      pageSpy.mockClear();
      setInputs({ disabled: true });
      expect(host().classList).toContain('magic-pagination--disabled');
      expect(btn('next')?.disabled).toBe(true);
      btn('next')?.click();
      expect(pageSpy).not.toHaveBeenCalled();
    });
  });
});
