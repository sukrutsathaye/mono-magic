import { ComponentFixture, TestBed } from '@angular/core/testing';
import type {
  AtomicSize,
  AvatarGroupItem,
  AvatarGroupSpacing,
  AvatarShape,
  AvatarStatus,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import {
  MagicAvatarComponent,
  MagicAvatarGroupComponent,
} from './avatar.component';

const SAMPLE_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="%236750a4"/></svg>';

describe('MagicAvatarComponent & MagicAvatarGroupComponent', () => {
  describe('MagicAvatarComponent', () => {
    let fixture: ComponentFixture<MagicAvatarComponent>;

    const setInputs = (inputs: Record<string, unknown>) => {
      for (const [name, value] of Object.entries(inputs)) {
        fixture.componentRef.setInput(name, value);
      }
      fixture.detectChanges();
    };

    const host = (): HTMLElement => fixture.nativeElement;
    const root = (): HTMLElement =>
      host().querySelector('.magic-avatar__root') as HTMLElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MagicAvatarComponent],
      }).compileComponents();
      fixture = TestBed.createComponent(MagicAvatarComponent);
      fixture.detectChanges();
    });

    it('renders image, cleans host id, and falls back to derived initials on image error', () => {
      setInputs({
        id: 'ada-avatar',
        testId: 'ada',
        ariaLabel: 'Ada Lovelace',
        name: 'Ada Lovelace',
        src: SAMPLE_IMAGE,
        alt: 'Ada portrait',
      });

      expect(host().getAttribute('id')).toBeNull();
      expect(root().getAttribute('id')).toBe('ada-avatar');
      expect(root().getAttribute('data-testid')).toBe('ada');

      const img = host().querySelector('img') as HTMLImageElement;
      expect(img).toBeTruthy();
      expect(img.getAttribute('alt')).toBe('Ada portrait');

      img.dispatchEvent(new Event('error'));
      fixture.detectChanges();

      expect(host().querySelector('img')).toBeNull();
      expect(
        host().querySelector('.magic-avatar__initials')?.textContent?.trim(),
      ).toBe('AL');
      expect(root().getAttribute('role')).toBe('img');
      expect(root().getAttribute('aria-label')).toBe('Ada Lovelace');

      // Updating src resets imageFailed
      setInputs({ src: SAMPLE_IMAGE + '?v=2' });
      expect(host().querySelector('img')).toBeTruthy();
    });

    it('derives initials from single-word name, respects explicit initials, and falls back to icon', () => {
      setInputs({ name: '   ' });
      expect(host().querySelector('mat-icon')?.textContent?.trim()).toBe(
        'person',
      );

      setInputs({ icon: 'smart_toy' });
      expect(host().querySelector('mat-icon')?.textContent?.trim()).toBe(
        'smart_toy',
      );

      setInputs({ name: 'Grace' });
      expect(
        host().querySelector('.magic-avatar__initials')?.textContent?.trim(),
      ).toBe('GR');

      setInputs({ initials: 'gh' });
      expect(
        host().querySelector('.magic-avatar__initials')?.textContent?.trim(),
      ).toBe('GH');
    });

    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as AtomicSize[])(
      'applies size=%s classes',
      (size) => {
        setInputs({ size });
        expect(host().classList).toContain(`magic-size-${size}`);
        expect(host().classList).toContain(`magic-avatar--${size}`);
      },
    );

    it.each(['circle', 'rounded', 'square'] as AvatarShape[])(
      'applies shape=%s classes',
      (shape) => {
        setInputs({ shape });
        expect(host().classList).toContain(`magic-avatar--${shape}`);
        expect(
          host().querySelector('.magic-avatar__frame')?.classList,
        ).toContain(`magic-avatar__frame--${shape}`);
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
    ] as ColorIntent[])('applies color=%s token class', (color) => {
      setInputs({ color });
      expect(host().classList).toContain(`magic-color-${color}`);
    });

    it.each(['online', 'busy', 'offline'] as AvatarStatus[])(
      'renders status=%s dot with accessible statusLabel',
      (status) => {
        setInputs({
          testId: 'status-av',
          status,
          statusLabel: `User is ${status}`,
        });
        const dot = host().querySelector(
          '[data-testid="status-av-status"]',
        ) as HTMLElement;
        expect(dot).toBeTruthy();
        expect(dot.classList).toContain(`magic-avatar__status--${status}`);
        expect(dot.getAttribute('aria-label')).toBe(`User is ${status}`);
      },
    );
  });

  describe('MagicAvatarGroupComponent', () => {
    let fixture: ComponentFixture<MagicAvatarGroupComponent>;

    const ITEMS: readonly AvatarGroupItem[] = [
      { id: 'u1', name: 'Ada Lovelace', status: 'online' },
      { id: 'u2', name: 'Alan Turing', color: 'secondary' },
      { id: 'u3', name: 'Grace Hopper', color: 'tertiary' },
      { id: 'u4', name: 'Margaret Hamilton' },
    ];

    const setInputs = (inputs: Record<string, unknown>) => {
      for (const [name, value] of Object.entries(inputs)) {
        fixture.componentRef.setInput(name, value);
      }
      fixture.detectChanges();
    };

    const host = (): HTMLElement => fixture.nativeElement;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MagicAvatarGroupComponent],
      }).compileComponents();
      fixture = TestBed.createComponent(MagicAvatarGroupComponent);
      setInputs({ items: ITEMS });
    });

    it('renders all avatars when max is unset and collapses overflow into +N when max is set', () => {
      setInputs({
        id: 'team-group',
        testId: 'team',
        ariaLabel: 'Engineering team',
      });

      expect(host().getAttribute('id')).toBeNull();
      const groupEl = host().querySelector(
        '.magic-avatar-group__list',
      ) as HTMLElement;
      expect(groupEl.getAttribute('id')).toBe('team-group');
      expect(groupEl.getAttribute('data-testid')).toBe('team');
      expect(groupEl.getAttribute('aria-label')).toBe('Engineering team');
      expect(host().querySelectorAll('magic-avatar')).toHaveLength(4);
      expect(host().querySelector('[data-testid="team-overflow"]')).toBeNull();

      setInputs({ max: 2, spacing: 'tight' as AvatarGroupSpacing, size: 'lg' });
      expect(host().classList).toContain('magic-avatar-group--tight');
      expect(host().classList).toContain('magic-avatar-group--lg');
      expect(host().querySelectorAll('magic-avatar')).toHaveLength(2);
      const overflow = host().querySelector(
        '[data-testid="team-overflow"]',
      ) as HTMLElement;
      expect(overflow).toBeTruthy();
      expect(overflow.textContent?.trim()).toBe('+2');
      expect(overflow.getAttribute('aria-label')).toBe('2 more');
    });
  });
});
