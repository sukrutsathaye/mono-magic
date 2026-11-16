import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MagicSearchBarComponent } from './search-bar.component';

describe('MagicSearchBarComponent (Angular Material)', () => {
  let component: MagicSearchBarComponent;
  let fixture: ComponentFixture<MagicSearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicSearchBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MagicSearchBarComponent);
    component = fixture.componentInstance;
    component.testId = 'ng-search';
    component.submitLabel = 'Go';
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('composes mm-text-input and mm-button and emits searched on submit', () => {
    const querySpy = vi.fn();
    const searchSpy = vi.fn();
    component.queryChange.subscribe(querySpy);
    component.searched.subscribe(searchSpy);

    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector(
      '[data-testid="ng-search-input"]'
    );
    inputEl.value = 'atomic';
    inputEl.dispatchEvent(new Event('input'));
    expect(querySpy).toHaveBeenCalledWith('atomic');

    const formEl: HTMLFormElement = fixture.nativeElement.querySelector(
      '[data-testid="ng-search"]'
    );
    formEl.dispatchEvent(new Event('submit'));
    expect(searchSpy).toHaveBeenCalledWith('atomic');
  });
});
