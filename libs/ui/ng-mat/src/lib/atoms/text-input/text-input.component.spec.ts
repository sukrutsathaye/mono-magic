import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MagicTextInputComponent } from './text-input.component';

describe('MagicTextInputComponent (Angular Material)', () => {
  let component: MagicTextInputComponent;
  let fixture: ComponentFixture<MagicTextInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicTextInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MagicTextInputComponent);
    component = fixture.componentInstance;
    component.label = 'Email';
    component.placeholder = 'you@example.com';
    component.helperText = 'Work email preferred';
    component.testId = 'ng-input';
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders label, hint, and emits valueChange on input', () => {
    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    expect(fixture.nativeElement.textContent).toContain('Work email preferred');

    const inputEl: HTMLInputElement =
      fixture.nativeElement.querySelector('[data-testid="ng-input"]');
    inputEl.value = 'ada@example.com';
    inputEl.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledWith('ada@example.com');
  });
});
