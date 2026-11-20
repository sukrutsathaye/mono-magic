import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicSliderComponent } from './slider.component';

@Component({
  imports: [MagicSliderComponent],
  template: `
    <magic-slider
      [range]="true"
      [(startValue)]="start"
      [(endValue)]="end"
      (rangeChanged)="onRange($event)"
    />
  `,
})
class RangeHostComponent {
  readonly start = signal(20);
  readonly end = signal(80);
  readonly onRange = vi.fn();
}

@Component({
  imports: [ReactiveFormsModule, MagicSliderComponent],
  template: `<magic-slider [formControl]="control" />`,
})
class ReactiveHostComponent {
  readonly control = new FormControl(40, { nonNullable: true });
}

@Component({
  imports: [FormsModule, MagicSliderComponent],
  template: `<magic-slider [(ngModel)]="val" />`,
})
class NgModelHostComponent {
  val = 25;
}

@Component({
  imports: [FormField, MagicSliderComponent],
  template: `<magic-slider [formField]="modelForm.volume" />`,
})
class SignalFormHostComponent {
  readonly data = signal({ volume: 65 });
  readonly modelForm = form(this.data);
}

describe('MagicSliderComponent', () => {
  let fixture: ComponentFixture<MagicSliderComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const thumbs = (): HTMLInputElement[] =>
    Array.from(host().querySelectorAll('input[type="range"]'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicSliderComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicSliderComponent);
    fixture.detectChanges();
  });

  it('renders a single thumb by default and updates value + emits changed', () => {
    const spy = vi.fn();
    fixture.componentInstance.changed.subscribe(spy);
    expect(thumbs()).toHaveLength(1);

    thumbs()[0].value = '75';
    thumbs()[0].dispatchEvent(new Event('input'));
    thumbs()[0].dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBe(75);
    expect(spy).toHaveBeenCalledWith(75);
  });

  it('renders start and end thumbs in range mode', () => {
    const rFixture = TestBed.createComponent(RangeHostComponent);
    rFixture.detectChanges();
    const rangeThumbs = Array.from(
      rFixture.nativeElement.querySelectorAll('input[type="range"]'),
    ) as HTMLInputElement[];

    expect(rangeThumbs).toHaveLength(2);
    expect(rangeThumbs[0].value).toBe('20');
    expect(rangeThumbs[1].value).toBe('80');

    rangeThumbs[0].value = '30';
    rangeThumbs[0].dispatchEvent(new Event('input'));
    rangeThumbs[0].dispatchEvent(new Event('change'));
    expect(rFixture.componentInstance.start()).toBe(30);
    expect(rFixture.componentInstance.onRange).toHaveBeenCalledWith([30, 80]);
  });

  it('formats k / M / B labels accurately with defaultDisplayWith', () => {
    const fmt = fixture.componentInstance.displayWith();
    expect(fmt(500)).toBe('500');
    expect(fmt(1500)).toBe('2k');
    expect(fmt(2_000_000)).toBe('2M');
    expect(fmt(3_000_000_000)).toBe('3B');
  });

  it('supports min, max, step, discrete, showTickMarks, disabled and attributes', () => {
    setInputs({
      id: 'vol-slider',
      testId: 'vol',
      ariaLabel: 'Volume',
      min: 10,
      max: 200,
      step: 10,
      discrete: true,
      showTickMarks: true,
      disabled: true,
    });

    const sliderEl = host().querySelector('mat-slider') as HTMLElement;
    expect(host().getAttribute('id')).toBeNull();
    expect(sliderEl.id).toBe('vol-slider');
    expect(sliderEl.getAttribute('data-testid')).toBe('vol');
    expect(sliderEl.getAttribute('aria-label')).toBe('Volume');
    expect(thumbs()[0].min).toBe('10');
    expect(thumbs()[0].max).toBe('200');
    expect(thumbs()[0].step).toBe('10');
    expect(thumbs()[0].disabled).toBe(true);
    expect(sliderEl.className).toContain('mdc-slider--discrete');
    expect(sliderEl.className).toContain('mdc-slider--tick-marks');
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as AtomicSize[])(
    'applies magic-size-%s class',
    (size) => {
      setInputs({ size });
      expect(host().classList).toContain(`magic-size-${size}`);
    },
  );

  it.each([
    'primary',
    'secondary',
    'tertiary',
    'success',
    'warning',
    'error',
    'neutral',
  ] as ColorIntent[])('applies magic-color-%s class', (color) => {
    setInputs({ color });
    expect(host().classList).toContain(`magic-color-${color}`);
  });

  it('integrates with Reactive Forms, ngModel and Signal Forms', async () => {
    const rxFixture = TestBed.createComponent(ReactiveHostComponent);
    rxFixture.detectChanges();
    const rxThumb = rxFixture.nativeElement.querySelector(
      'input[type="range"]',
    ) as HTMLInputElement;
    expect(rxThumb.value).toBe('40');
    rxThumb.value = '60';
    rxThumb.dispatchEvent(new Event('input'));
    expect(rxFixture.componentInstance.control.value).toBe(60);

    const ngFixture = TestBed.createComponent(NgModelHostComponent);
    ngFixture.detectChanges();
    await ngFixture.whenStable();
    ngFixture.detectChanges();
    const ngThumb = ngFixture.nativeElement.querySelector(
      'input[type="range"]',
    ) as HTMLInputElement;
    expect(ngThumb.value).toBe('25');

    const sfFixture = TestBed.createComponent(SignalFormHostComponent);
    sfFixture.detectChanges();
    await sfFixture.whenStable();
    sfFixture.detectChanges();
    const sfThumb = sfFixture.nativeElement.querySelector(
      'input[type="range"]',
    ) as HTMLInputElement;
    expect(sfThumb.value).toBe('65');
    sfThumb.value = '90';
    sfThumb.dispatchEvent(new Event('input'));
    expect(sfFixture.componentInstance.data().volume).toBe(90);
  });
});
