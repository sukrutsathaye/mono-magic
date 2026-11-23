import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
  RatingPrecision,
} from '@mono-magic/atomic-design-interfaces';
import { MagicRatingComponent } from './rating.component';

describe('MagicRatingComponent', () => {
  let fixture: ComponentFixture<MagicRatingComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const slider = (): HTMLElement =>
    host().querySelector('[role="slider"]') as HTMLElement;
  const starBtn = (n: number): HTMLButtonElement =>
    host().querySelector(`[data-testid="rate-star-${n}"]`) as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicRatingComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicRatingComponent);
    setInputs({ testId: 'rate', label: 'Quality' });
  });

  describe('rendering, precision & appearance', () => {
    it('forwards id/testId/ariaLabel cleanly and renders showValue and reviewCount', () => {
      setInputs({
        id: 'product-rating',
        ariaLabel: 'Product rating',
        defaultValue: 3.5,
        precision: 0.5,
        showValue: true,
        reviewCount: 128,
      });

      expect(host().getAttribute('id')).toBeNull();
      expect(
        host().querySelector('.magic-rating__root')?.getAttribute('id'),
      ).toBe('product-rating');
      expect(slider().getAttribute('aria-label')).toBe('Product rating');
      expect(slider().getAttribute('aria-valuenow')).toBe('3.5');
      expect(slider().getAttribute('aria-valuemax')).toBe('5');
      expect(
        host().querySelector('[data-testid="rate-value"]')?.textContent?.trim(),
      ).toBe('3.5');
      expect(
        host().querySelector('[data-testid="rate-count"]')?.textContent?.trim(),
      ).toBe('(128)');
      expect(starBtn(4).textContent?.trim()).toBe('star_half');
      expect(starBtn(5).textContent?.trim()).toBe('star_border');
    });

    it('supports custom max, clamping, and custom icon/emptyIcon glyphs', () => {
      setInputs({
        max: 3,
        defaultValue: 9,
        icon: 'favorite',
        emptyIcon: 'favorite_border',
      });

      expect(host().querySelectorAll('.magic-rating__star')).toHaveLength(3);
      expect(fixture.componentInstance.currentValue()).toBe(3);
      expect(starBtn(2).textContent?.trim()).toBe('favorite');

      setInputs({ defaultValue: 2 });
      expect(starBtn(3).textContent?.trim()).toBe('favorite_border');
    });

    it.each([0.5, 1] as RatingPrecision[])(
      'supports precision=%s snapping',
      (precision) => {
        setInputs({ precision, defaultValue: 3.4 });
        expect(fixture.componentInstance.currentValue()).toBe(
          precision === 0.5 ? 3.5 : 3,
        );
      },
    );

    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as AtomicSize[])(
      'applies magic-size-%s class',
      (size) => {
        setInputs({ size });
        expect(host().classList).toContain(`magic-size-${size}`);
      },
    );

    it.each(['primary', 'warning', 'error', 'success'] as ColorIntent[])(
      'applies magic-color-%s class',
      (color) => {
        setInputs({ color });
        expect(host().classList).toContain(`magic-color-${color}`);
      },
    );
  });

  describe('pointer, keyboard, readOnly, disabled & controlled interactions', () => {
    it('selects full stars and both first/second half stars on click and previews on hover', () => {
      const valueSpy = vi.fn();
      fixture.componentInstance.valueChange.subscribe(valueSpy);

      setInputs({ precision: 1, defaultValue: 1 });
      starBtn(4).click();
      fixture.detectChanges();
      expect(fixture.componentInstance.currentValue()).toBe(4);
      expect(valueSpy).toHaveBeenCalledWith(4);

      setInputs({ precision: 0.5, defaultValue: 1 });
      const thirdStar = starBtn(3);
      vi.spyOn(thirdStar, 'getBoundingClientRect').mockReturnValue({
        left: 100,
        width: 24,
        top: 0,
        right: 124,
        bottom: 24,
        height: 24,
        x: 100,
        y: 0,
        toJSON: () => ({}),
      });

      thirdStar.dispatchEvent(
        new MouseEvent('mousemove', { clientX: 104, bubbles: true }),
      );
      fixture.detectChanges();
      expect(thirdStar.textContent?.trim()).toBe('star_half');

      slider().dispatchEvent(new MouseEvent('mouseleave'));
      fixture.detectChanges();

      thirdStar.dispatchEvent(
        new MouseEvent('click', { clientX: 104, bubbles: true }),
      );
      fixture.detectChanges();
      expect(fixture.componentInstance.currentValue()).toBe(2.5);
      expect(valueSpy).toHaveBeenLastCalledWith(2.5);

      // Click second half of star 3 -> 3.0
      thirdStar.dispatchEvent(
        new MouseEvent('click', { clientX: 120, bubbles: true }),
      );
      fixture.detectChanges();
      expect(fixture.componentInstance.currentValue()).toBe(3);

      // Clicking same value does not re-emit
      valueSpy.mockClear();
      thirdStar.dispatchEvent(
        new MouseEvent('click', { clientX: 120, bubbles: true }),
      );
      expect(valueSpy).not.toHaveBeenCalled();
    });

    it('supports keyboard ArrowRight, ArrowUp, ArrowLeft, ArrowDown, Home, End and ignores other keys', () => {
      const valueSpy = vi.fn();
      fixture.componentInstance.valueChange.subscribe(valueSpy);

      setInputs({ precision: 0.5, defaultValue: 2 });

      slider().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
      );
      fixture.detectChanges();
      expect(fixture.componentInstance.currentValue()).toBe(2.5);

      slider().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
      fixture.detectChanges();
      expect(fixture.componentInstance.currentValue()).toBe(3);

      slider().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
      );
      fixture.detectChanges();
      expect(fixture.componentInstance.currentValue()).toBe(2.5);

      slider().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();
      expect(fixture.componentInstance.currentValue()).toBe(2);

      slider().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
      );
      fixture.detectChanges();
      expect(fixture.componentInstance.currentValue()).toBe(5);

      slider().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
      );
      fixture.detectChanges();
      expect(fixture.componentInstance.currentValue()).toBe(0);
      expect(valueSpy).toHaveBeenLastCalledWith(0);

      valueSpy.mockClear();
      slider().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      expect(valueSpy).not.toHaveBeenCalled();
    });

    it('honors controlled value, readOnly, and disabled states', () => {
      const valueSpy = vi.fn();
      fixture.componentInstance.valueChange.subscribe(valueSpy);

      setInputs({ value: 2 });
      starBtn(5).click();
      fixture.detectChanges();
      expect(valueSpy).toHaveBeenCalledWith(5);
      expect(fixture.componentInstance.currentValue()).toBe(2);

      valueSpy.mockClear();
      setInputs({ readOnly: true });
      expect(host().classList).toContain('magic-rating--readonly');
      expect(slider().getAttribute('aria-readonly')).toBe('true');
      starBtn(4).dispatchEvent(
        new MouseEvent('mousemove', { clientX: 100, bubbles: true }),
      );
      starBtn(4).click();
      slider().dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
      );
      expect(valueSpy).not.toHaveBeenCalled();

      setInputs({ readOnly: false, disabled: true });
      expect(host().classList).toContain('magic-rating--disabled');
      expect(slider().getAttribute('aria-disabled')).toBe('true');
      expect(starBtn(4).disabled).toBe(true);
    });
  });
});
