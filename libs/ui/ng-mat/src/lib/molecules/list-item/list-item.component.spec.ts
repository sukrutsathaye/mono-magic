import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
  ListItemAppearance,
} from '@mono-magic/atomic-design-interfaces';
import { MagicListItemComponent } from './list-item.component';

describe('MagicListItemComponent', () => {
  let fixture: ComponentFixture<MagicListItemComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const row = (): HTMLElement =>
    host().querySelector('.magic-list-item__row') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicListItemComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicListItemComponent);
    setInputs({ primaryText: 'Notifications' });
  });

  describe('rendering, slots & appearance', () => {
    it('forwards id/testId/ariaLabel cleanly and renders primary, secondary, overline and trailing content', () => {
      setInputs({
        id: 'notif-row',
        testId: 'notif-item',
        ariaLabel: 'Notifications settings',
        overlineText: 'Workspace',
        primaryText: 'Notifications',
        secondaryText: 'Manage email and push alerts',
        leadingIcon: 'notifications',
        trailingText: 'On',
        trailingBadge: 3,
        trailingIcon: 'chevron_right',
        divider: true,
      });

      expect(host().getAttribute('id')).toBeNull();
      expect(row().getAttribute('id')).toBe('notif-row');
      expect(row().getAttribute('data-testid')).toBe('notif-item');
      expect(row().getAttribute('aria-label')).toBe('Notifications settings');
      expect(host().textContent).toContain('Workspace');
      expect(host().textContent).toContain('Notifications');
      expect(host().textContent).toContain('Manage email and push alerts');
      expect(host().textContent).toContain('On');
      expect(host().textContent).toContain('3');
      expect(host().querySelector('mat-divider')).toBeTruthy();
      expect(host().querySelector('.magic-list-item__leading-icon')?.textContent).toContain(
        'notifications',
      );
      expect(host().querySelector('.magic-list-item__trailing-icon')?.textContent).toContain(
        'chevron_right',
      );
    });

    it('renders leading avatar from leadingAvatarText or leadingAvatarSrc', () => {
      setInputs({
        primaryText: 'Ada Lovelace',
        leadingAvatarText: 'AL',
      });
      expect(host().querySelector('magic-avatar')).toBeTruthy();
      expect(host().textContent).toContain('AL');

      setInputs({
        leadingAvatarSrc: 'https://example.com/ada.png',
      });
      const img = host().querySelector('magic-avatar img') as HTMLImageElement;
      expect(img).toBeTruthy();
      expect(img.src).toContain('https://example.com/ada.png');
    });

    it.each(['standard', 'outlined', 'filled'] as ListItemAppearance[])(
      'supports appearance=%s',
      (appearance) => {
        setInputs({ appearance });
        expect(host().classList).toContain(`magic-list-item--${appearance}`);
      },
    );

    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as AtomicSize[])(
      'applies magic-size-%s class',
      (size) => {
        setInputs({ size });
        expect(host().classList).toContain(`magic-size-${size}`);
      },
    );

    it.each(['primary', 'secondary', 'success', 'error', 'neutral'] as ColorIntent[])(
      'applies magic-color-%s class',
      (color) => {
        setInputs({ color });
        expect(host().classList).toContain(`magic-color-${color}`);
      },
    );

    it('applies dense and selected host classes', () => {
      setInputs({ dense: true, selected: true });
      expect(host().classList).toContain('magic-list-item--dense');
      expect(host().classList).toContain('magic-list-item--selected');
      expect(row().classList).toContain('magic-list-item__row--selected');
    });
  });

  describe('interactive & selectable behavior', () => {
    it('renders non-interactive mat-list-item by default and interactive button when interactive=true', () => {
      expect(row().tagName).toBe('MAT-LIST-ITEM');

      setInputs({ interactive: true, testId: 'btn-row' });
      expect(row().tagName).toBe('BUTTON');
      expect(row().getAttribute('aria-label')).toBe('Notifications');
    });

    it('emits clicked and selectedChange when selectable=true', () => {
      const clickSpy = vi.fn();
      const selectSpy = vi.fn();
      fixture.componentInstance.clicked.subscribe(clickSpy);
      fixture.componentInstance.selectedChange.subscribe(selectSpy);

      setInputs({ selectable: true, selected: false });
      expect(row().getAttribute('aria-pressed')).toBe('false');

      row().click();
      fixture.detectChanges();

      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(selectSpy).toHaveBeenCalledWith(true);

      setInputs({ selected: true });
      expect(row().getAttribute('aria-pressed')).toBe('true');
      row().click();
      expect(selectSpy).toHaveBeenLastCalledWith(false);
    });

    it('ignores clicks and applies disabled class when disabled=true', () => {
      const clickSpy = vi.fn();
      const selectSpy = vi.fn();
      fixture.componentInstance.clicked.subscribe(clickSpy);
      fixture.componentInstance.selectedChange.subscribe(selectSpy);

      setInputs({ interactive: true, selectable: true, disabled: true });
      expect(host().classList).toContain('magic-list-item--disabled');
      expect((row() as HTMLButtonElement).disabled).toBe(true);

      row().dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();
      expect(clickSpy).not.toHaveBeenCalled();
      expect(selectSpy).not.toHaveBeenCalled();
    });
  });
});
