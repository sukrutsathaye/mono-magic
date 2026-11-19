import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import type {
  CardActionItem,
  CardAppearance,
  CardImageSize,
  ChipItem,
} from '@mono-magic/atomic-design-interfaces';
import {
  MagicCardActionsDirective,
  MagicCardComponent,
  MagicCardFooterDirective,
  MagicCardHeaderDirective,
} from './card.component';

const SAMPLE_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="%236750a4"/></svg>';

const SAMPLE_ACTIONS: readonly CardActionItem[] = [
  { id: 'act-save', label: 'Save', variant: 'filled', color: 'primary', icon: 'save' },
  { id: 'act-share', label: 'Share', variant: 'outlined', color: 'secondary' },
  { id: 'act-disabled', label: 'Locked', disabled: true },
];

const SAMPLE_CHIPS: readonly ChipItem[] = [
  { id: 'ng', label: 'Angular' },
  { id: 'md3', label: 'Material 3' },
];

@Component({
  imports: [
    MagicCardComponent,
    MagicCardHeaderDirective,
    MagicCardActionsDirective,
    MagicCardFooterDirective,
  ],
  template: `
    <magic-card [title]="'Ignored when directive header used'" [testId]="'projected-card'">
      <div magicCardHeader class="custom-header">Custom Header Slot</div>
      <p class="custom-body">Projected body content</p>
      <button type="button" magicCardActions class="custom-action">Custom Action</button>
      <span magicCardFooter class="custom-footer">Custom Footer Note</span>
    </magic-card>
  `,
})
class DirectiveSlotsHostComponent {}

@Component({
  imports: [MagicCardComponent],
  template: `
    <magic-card [testId]="'attr-card'">
      <div card-header class="attr-header">Attribute Header</div>
      <p class="attr-body">Body</p>
      <button type="button" card-actions class="attr-action">Attr Action</button>
      <span card-footer class="attr-footer">Attr Footer</span>
    </magic-card>
  `,
})
class AttrSlotsHostComponent {
  readonly placeholder = signal(true);
}

describe('MagicCardComponent', () => {
  let fixture: ComponentFixture<MagicCardComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const matCard = (root: HTMLElement = host()): HTMLElement =>
    root.querySelector('mat-card') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicCardComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicCardComponent);
    fixture.detectChanges();
  });

  describe('rendering, attributes & appearance', () => {
    it('renders unified mat-card with clean host id and accessibility attributes', () => {
      setInputs({
        id: 'profile-card',
        testId: 'profile',
        ariaLabel: 'User summary',
        title: 'Ada Lovelace',
        subtitle: 'Pioneer mathematician',
        content: 'Wrote the first algorithm intended for a machine.',
        avatarSrc: SAMPLE_IMAGE,
        avatarAlt: 'Portrait',
        width: '360px',
      });

      expect(host().getAttribute('id')).toBeNull();
      expect(host().style.getPropertyValue('--card-width')).toBe('360px');
      expect(matCard().id).toBe('profile-card');
      expect(matCard().getAttribute('data-testid')).toBe('profile');
      expect(matCard().getAttribute('aria-label')).toBe('User summary');
      expect(host().querySelector('mat-card-title')?.textContent).toContain(
        'Ada Lovelace',
      );
      expect(host().querySelector('mat-card-subtitle')?.textContent).toContain(
        'Pioneer mathematician',
      );
      expect(host().querySelector('img[mat-card-avatar]')?.getAttribute('alt')).toBe(
        'Portrait',
      );
      expect(host().querySelector('.magic-card__text')?.textContent).toContain(
        'Wrote the first algorithm',
      );
      expect(host().querySelector('mat-card-actions')).toBeNull();
      expect(host().querySelector('mat-card-footer')).toBeNull();
    });

    it.each(['outlined', 'raised'] as CardAppearance[])(
      'supports appearance=%s',
      (appearance) => {
        setInputs({ appearance });
        if (appearance === 'outlined') {
          expect(matCard().classList).toContain('mat-mdc-card-outlined');
        } else {
          expect(matCard().classList).not.toContain('mat-mdc-card-outlined');
        }
      },
    );

    const imageSizes: CardImageSize[] = [
      'small',
      'medium',
      'large',
      'extra-large',
      'full',
    ];
    it.each(imageSizes)('applies imageSize=%s class to card image', (imageSize) => {
      setInputs({
        imageSrc: SAMPLE_IMAGE,
        imageAlt: 'Preview graphic',
        imageSize,
      });

      const img = host().querySelector('.magic-card__image') as HTMLImageElement;
      expect(img).toBeTruthy();
      expect(img.getAttribute('alt')).toBe('Preview graphic');
      expect(img.classList).toContain(`magic-card__image--${imageSize}`);
    });
  });

  describe('variants, actions & chips', () => {
    it('renders actions via magic-button, aligns actions, and emits actionClicked for enabled buttons only', () => {
      const clickSpy = vi.fn();
      fixture.componentInstance.actionClicked.subscribe(clickSpy);

      setInputs({
        variant: 'with-actions',
        actions: SAMPLE_ACTIONS,
        alignActions: 'end',
      });

      const actionsEl = host().querySelector('mat-card-actions') as HTMLElement;
      expect(actionsEl).toBeTruthy();
      expect(actionsEl.classList).toContain('mat-mdc-card-actions-align-end');

      const buttons = Array.from(
        actionsEl.querySelectorAll('button'),
      ) as HTMLButtonElement[];
      expect(buttons).toHaveLength(3);
      expect(buttons[0].textContent).toContain('Save');
      expect(buttons[2].disabled).toBe(true);

      buttons[0].click();
      expect(clickSpy).toHaveBeenCalledWith(SAMPLE_ACTIONS[0]);

      buttons[2].click();
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('renders footer chips via magic-chip when chips or with-chips variant are set', () => {
      setInputs({
        variant: 'with-chips',
        chips: SAMPLE_CHIPS,
      });

      const footerEl = host().querySelector('mat-card-footer') as HTMLElement;
      expect(footerEl).toBeTruthy();
      const chipEl = footerEl.querySelector('magic-chip');
      expect(chipEl).toBeTruthy();
      expect(footerEl.textContent).toContain('Angular');
      expect(footerEl.textContent).toContain('Material 3');
    });
  });

  describe('content projection slots', () => {
    it('projects [magicCardHeader], default body, [magicCardActions], and [magicCardFooter]', () => {
      const slotFixture = TestBed.createComponent(DirectiveSlotsHostComponent);
      slotFixture.detectChanges();

      const el = slotFixture.nativeElement as HTMLElement;
      expect(el.querySelector('.custom-header')?.textContent).toContain(
        'Custom Header Slot',
      );
      expect(el.querySelector('mat-card-title')).toBeNull();
      expect(el.querySelector('.custom-body')?.textContent).toContain(
        'Projected body content',
      );
      expect(
        el.querySelector('mat-card-actions .custom-action')?.textContent,
      ).toContain('Custom Action');
      expect(
        el.querySelector('mat-card-footer .custom-footer')?.textContent,
      ).toContain('Custom Footer Note');
    });

    it('supports attribute-based [card-header], [card-actions], and [card-footer] slots', () => {
      const attrFixture = TestBed.createComponent(AttrSlotsHostComponent);
      attrFixture.detectChanges();

      const el = attrFixture.nativeElement as HTMLElement;
      expect(el.querySelector('.attr-header')?.textContent).toContain(
        'Attribute Header',
      );
      expect(el.querySelector('.attr-body')?.textContent).toContain('Body');
      expect(el.querySelector('.attr-action')?.textContent).toContain(
        'Attr Action',
      );
      expect(el.querySelector('.attr-footer')?.textContent).toContain(
        'Attr Footer',
      );
    });
  });
});
