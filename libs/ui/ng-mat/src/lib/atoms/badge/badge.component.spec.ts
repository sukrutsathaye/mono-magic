import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type {
  AtomicSize,
  BadgePosition,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicBadgeComponent } from './badge.component';

@Component({
  imports: [MagicBadgeComponent],
  template: `<magic-badge [content]="5"><span>Inbox</span></magic-badge>`,
})
class ProjectionHostComponent {}

describe('MagicBadgeComponent', () => {
  let fixture: ComponentFixture<MagicBadgeComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const anchor = (): HTMLElement =>
    host().querySelector('.magic-badge__anchor') as HTMLElement;
  const badgeBubble = (): HTMLElement | null =>
    host().querySelector('.mat-badge-content');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicBadgeComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicBadgeComponent);
    fixture.componentRef.setInput('content', 4);
    fixture.componentRef.setInput('label', 'Messages');
    fixture.detectChanges();
  });

  it('renders badge content and label fallback', () => {
    expect(anchor().textContent).toContain('Messages');
    expect(badgeBubble()?.textContent?.trim()).toBe('4');
  });

  it('renders icon fallback when icon is provided', () => {
    setInputs({ icon: 'notifications' });
    expect(host().querySelector('mat-icon')?.textContent?.trim()).toBe(
      'notifications',
    );
  });

  it('prefers projected content over fallbacks', () => {
    const pFixture = TestBed.createComponent(ProjectionHostComponent);
    pFixture.detectChanges();
    expect(pFixture.nativeElement.textContent).toContain('Inbox');
    expect(
      pFixture.nativeElement
        .querySelector('.mat-badge-content')
        ?.textContent?.trim(),
    ).toBe('5');
  });

  it('maps AtomicSize onto Material badge sizes', () => {
    const expected: [AtomicSize, string][] = [
      ['xs', 'mat-badge-small'],
      ['sm', 'mat-badge-small'],
      ['md', 'mat-badge-medium'],
      ['lg', 'mat-badge-large'],
      ['xl', 'mat-badge-large'],
    ];
    for (const [size, cls] of expected) {
      setInputs({ size });
      expect(anchor().classList).toContain(cls);
      expect(host().classList).toContain(`magic-size-${size}`);
    }
  });

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

  it('supports hidden, disabled, overlap, position, description and attributes', () => {
    const position: BadgePosition = 'below before';
    setInputs({
      id: 'inbox-badge',
      testId: 'inbox',
      ariaLabel: 'Inbox notifications',
      hidden: true,
      disabled: true,
      overlap: false,
      position,
      description: '4 unread messages',
    });

    expect(host().getAttribute('id')).toBeNull();
    expect(anchor().id).toBe('inbox-badge');
    expect(anchor().getAttribute('data-testid')).toBe('inbox');
    expect(anchor().getAttribute('aria-label')).toBe('Inbox notifications');
    expect(anchor().classList).toContain('mat-badge-hidden');
    expect(anchor().classList).toContain('mat-badge-disabled');
    expect(anchor().classList).not.toContain('mat-badge-overlap');
    expect(anchor().classList).toContain('mat-badge-below');
    expect(anchor().classList).toContain('mat-badge-before');
  });
});
