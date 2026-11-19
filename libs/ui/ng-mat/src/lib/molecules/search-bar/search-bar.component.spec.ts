import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import type {
  AtomicSize,
  ButtonVariant,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicSearchBarComponent } from './search-bar.component';

describe('MagicSearchBarComponent', () => {
  let fixture: ComponentFixture<MagicSearchBarComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const form = (): HTMLFormElement =>
    host().querySelector('form') as HTMLFormElement;
  const input = (): HTMLInputElement =>
    host().querySelector('input') as HTMLInputElement;
  const submitButton = (): HTMLButtonElement =>
    host().querySelector('button[type="submit"]') as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicSearchBarComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicSearchBarComponent);
    fixture.detectChanges();
  });

  it('composes magic-form-field, magic-text-input and magic-button', () => {
    expect(host().querySelector('magic-form-field')).toBeTruthy();
    expect(host().querySelector('magic-text-input')).toBeTruthy();
    expect(host().querySelector('magic-button')).toBeTruthy();
    expect(form().getAttribute('role')).toBe('search');
  });

  it('forwards id, testId, ariaLabel, label, placeholder and submitLabel', () => {
    setInputs({
      id: 'catalog-search',
      testId: 'catalog',
      ariaLabel: 'Search catalog',
      label: 'Find items',
      placeholder: 'Type keyword...',
      submitLabel: 'Go',
    });

    expect(host().getAttribute('id')).toBeNull();
    expect(form().id).toBe('catalog-search');
    expect(form().getAttribute('data-testid')).toBe('catalog');
    expect(form().getAttribute('aria-label')).toBe('Search catalog');
    expect(input().getAttribute('data-testid')).toBe('catalog-input');
    expect(submitButton().getAttribute('data-testid')).toBe('catalog-submit');
    expect(input().placeholder).toBe('Type keyword...');
    expect(submitButton().textContent?.trim()).toBe('Go');
  });

  it('updates query model and emits searched on form submit', () => {
    const querySpy = vi.fn();
    const searchSpy = vi.fn();
    fixture.componentInstance.query.subscribe(querySpy);
    fixture.componentInstance.searched.subscribe(searchSpy);

    input().value = 'angular';
    input().dispatchEvent(new Event('input'));
    expect(querySpy).toHaveBeenCalledWith('angular');

    form().dispatchEvent(new Event('submit'));
    expect(searchSpy).toHaveBeenCalledWith('angular');
  });

  it('blocks input and submission when disabled or loading', () => {
    const searchSpy = vi.fn();
    fixture.componentInstance.searched.subscribe(searchSpy);

    setInputs({ query: 'test', disabled: true });
    expect(input().disabled).toBe(true);
    expect(submitButton().disabled).toBe(true);
    form().dispatchEvent(new Event('submit'));
    expect(searchSpy).not.toHaveBeenCalled();

    setInputs({ disabled: false, loading: true });
    expect(submitButton().disabled).toBe(true);
    expect(submitButton().getAttribute('aria-busy')).toBe('true');
    form().dispatchEvent(new Event('submit'));
    expect(searchSpy).not.toHaveBeenCalled();
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as AtomicSize[])(
    'propagates size=%s to child atoms and molecules',
    (size) => {
      setInputs({ size });
      expect(host().querySelector('magic-form-field')?.classList).toContain(
        `magic-size-${size}`,
      );
      expect(host().querySelector('magic-button')?.classList).toContain(
        `magic-size-${size}`,
      );
    },
  );

  it.each(['filled', 'tonal', 'outlined', 'elevated', 'text'] as ButtonVariant[])(
    'forwards buttonVariant=%s and buttonColor',
    (buttonVariant) => {
      const buttonColor: ColorIntent = 'tertiary';
      setInputs({ buttonVariant, buttonColor });
      expect(host().querySelector('magic-button')?.classList).toContain(
        'magic-color-tertiary',
      );
    },
  );
});
