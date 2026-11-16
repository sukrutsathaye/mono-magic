import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MagicButtonComponent } from './button.component';

describe('MagicButtonComponent (Angular Material)', () => {
  let component: MagicButtonComponent;
  let fixture: ComponentFixture<MagicButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MagicButtonComponent);
    component = fixture.componentInstance;
    component.label = 'Submit';
    component.testId = 'ng-btn';
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('renders label and emits clicked on button click', () => {
    const spy = vi.fn();
    component.clicked.subscribe(spy);

    const buttonEl: HTMLButtonElement =
      fixture.nativeElement.querySelector('[data-testid="ng-btn"]');
    expect(buttonEl.textContent?.trim()).toBe('Submit');

    buttonEl.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled or loading', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const buttonEl: HTMLButtonElement =
      fixture.nativeElement.querySelector('[data-testid="ng-btn"]');
    expect(buttonEl.disabled).toBe(true);
  });
});
