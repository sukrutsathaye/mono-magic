import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import type {
  AtomicSize,
  ButtonKind,
  ButtonVariant,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButtonComponent } from './button.component';

@Component({
  imports: [MagicButtonComponent],
  template: `
    <magic-button [label]="label()" (clicked)="onClick($event)">
      <ng-container>{{ projected() }}</ng-container>
    </magic-button>
  `,
})
class ProjectionHostComponent {
  readonly label = signal('Fallback');
  readonly projected = signal('Projected');
  readonly onClick = vi.fn();
}

@Component({
  imports: [MagicButtonComponent],
  template: `<magic-button id="host-id" label="Fallback" />`,
})
class FallbackHostComponent {}

describe('MagicButtonComponent', () => {
  let fixture: ComponentFixture<MagicButtonComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const button = (): HTMLButtonElement =>
    host().querySelector('button') as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicButtonComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicButtonComponent);
    fixture.componentRef.setInput('label', 'Save');
    fixture.detectChanges();
  });

  describe('defaults', () => {
    it('renders a native button with the label fallback', () => {
      expect(button()).toBeTruthy();
      expect(button().textContent?.trim()).toBe('Save');
      expect(button().getAttribute('type')).toBe('button');
    });

    it('applies default size and color classes to the host', () => {
      expect(host().classList).toContain('magic-size-md');
      expect(host().classList).toContain('magic-color-primary');
      expect(host().classList).not.toContain('magic-button--full-width');
    });

    it('is not disabled and not busy', () => {
      expect(button().disabled).toBe(false);
      expect(button().getAttribute('aria-busy')).toBeNull();
    });

    it('uses the label as the accessible name', () => {
      expect(button().getAttribute('aria-label')).toBe('Save');
    });
  });

  describe('variants', () => {
    const variants: [ButtonVariant, string][] = [
      ['filled', 'mat-mdc-unelevated-button'],
      ['tonal', 'mat-tonal-button'],
      ['outlined', 'mat-mdc-outlined-button'],
      ['elevated', 'mat-mdc-raised-button'],
      ['text', 'mat-mdc-button'],
    ];

    it.each(variants)('renders the %s appearance', (variant, cssClass) => {
      setInputs({ variant });
      expect(button().className).toContain(cssClass);
    });
  });

  describe('kinds', () => {
    const kinds: [ButtonKind, string][] = [
      ['default', 'mat-mdc-button-base'],
      ['icon', 'mat-mdc-icon-button'],
      ['fab', 'mat-mdc-fab'],
      ['mini-fab', 'mat-mdc-mini-fab'],
      ['extended-fab', 'mat-mdc-extended-fab'],
    ];

    it.each(kinds)('renders the %s kind', (kind, cssClass) => {
      setInputs({ kind, leadingIcon: 'add' });
      expect(button().className).toContain(cssClass);
    });

    it.each(['icon', 'fab', 'mini-fab'] as ButtonKind[])(
      '%s shows the icon glyph and uses it as the accessible name',
      (kind) => {
        setInputs({ kind, label: '', leadingIcon: 'favorite' });
        expect(host().querySelector('mat-icon')?.textContent?.trim()).toBe(
          'favorite',
        );
        expect(button().getAttribute('aria-label')).toBe('favorite');
      },
    );

    it('prefers an explicit ariaLabel over label and icon', () => {
      setInputs({ kind: 'icon', leadingIcon: 'favorite', ariaLabel: 'Like' });
      expect(button().getAttribute('aria-label')).toBe('Like');
    });
  });

  describe('sizes, colors and shapes', () => {
    const sizes: AtomicSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    it.each(sizes)('applies the %s size class', (size) => {
      setInputs({ size });
      expect(host().classList).toContain(`magic-size-${size}`);
    });

    const colors: ColorIntent[] = [
      'primary',
      'secondary',
      'tertiary',
      'success',
      'warning',
      'error',
      'neutral',
    ];
    it.each(colors)('applies the %s color class', (color) => {
      setInputs({ color });
      expect(host().classList).toContain(`magic-color-${color}`);
    });

    it.each(['square', 'rounded', 'pill'] as const)(
      'applies the %s shape class',
      (shape) => {
        setInputs({ shape });
        expect(host().classList).toContain(`magic-shape-${shape}`);
      },
    );

    it('does not add a shape class for the default shape', () => {
      expect(host().className).not.toContain('magic-shape-');
    });

    it('applies the full-width class', () => {
      setInputs({ fullWidth: true });
      expect(host().classList).toContain('magic-button--full-width');
    });

    it('never uses inline styles', () => {
      setInputs({ size: 'xl', color: 'error', shape: 'pill', fullWidth: true });
      expect(host().getAttribute('style')).toBeNull();
      expect(button().getAttribute('style')).toBeNull();
    });
  });

  describe('icons', () => {
    it('renders a leading icon before the label', () => {
      setInputs({ leadingIcon: 'add' });
      const icon = host().querySelector('mat-icon') as HTMLElement;
      expect(icon.textContent?.trim()).toBe('add');
      expect(icon.hasAttribute('iconPositionEnd')).toBe(false);
    });

    it('renders a trailing icon marked as end-positioned', () => {
      setInputs({ trailingIcon: 'arrow_forward' });
      const icon = host().querySelector('mat-icon[iconPositionEnd]');
      expect(icon?.textContent?.trim()).toBe('arrow_forward');
    });

    it('renders both icons together', () => {
      setInputs({ leadingIcon: 'add', trailingIcon: 'arrow_forward' });
      expect(host().querySelectorAll('mat-icon').length).toBe(2);
    });

    it('hides decorative icons from assistive tech', () => {
      setInputs({ leadingIcon: 'add' });
      expect(host().querySelector('mat-icon')?.getAttribute('aria-hidden')).toBe(
        'true',
      );
    });
  });

  describe('disabled', () => {
    it('disables the native button', () => {
      setInputs({ disabled: true });
      expect(button().disabled).toBe(true);
    });

    it('does not emit clicked while disabled', () => {
      const spy = vi.fn();
      fixture.componentInstance.clicked.subscribe(spy);
      setInputs({ disabled: true });
      button().click();
      expect(spy).not.toHaveBeenCalled();
    });

    it('stays focusable but inert with disabledInteractive', () => {
      const spy = vi.fn();
      fixture.componentInstance.clicked.subscribe(spy);
      setInputs({ disabled: true, disabledInteractive: true });
      expect(button().disabled).toBe(false);
      expect(button().getAttribute('aria-disabled')).toBe('true');
      button().click();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('loading', () => {
    beforeEach(() => setInputs({ loading: true }));

    it('shows a spinner', () => {
      expect(host().querySelector('mat-progress-spinner')).toBeTruthy();
    });

    it('marks the button busy and disabled', () => {
      expect(button().getAttribute('aria-busy')).toBe('true');
      expect(button().disabled).toBe(true);
    });

    it('blocks clicks', () => {
      const spy = vi.fn();
      fixture.componentInstance.clicked.subscribe(spy);
      button().click();
      expect(spy).not.toHaveBeenCalled();
    });

    it('swaps in the loading label', () => {
      setInputs({ loadingLabel: 'Saving…' });
      expect(button().textContent).toContain('Saving…');
      expect(button().textContent).not.toContain('Save ');
    });

    it('keeps the label when no loading label is given', () => {
      expect(button().textContent).toContain('Save');
    });

    it('removes the spinner when loading ends', () => {
      setInputs({ loading: false });
      expect(host().querySelector('mat-progress-spinner')).toBeNull();
    });
  });

  describe('attributes', () => {
    it('applies id and testId to the inner button', () => {
      setInputs({ id: 'save-btn', testId: 'save' });
      expect(button().id).toBe('save-btn');
      expect(button().getAttribute('data-testid')).toBe('save');
    });

    it.each(['button', 'submit', 'reset'] as const)(
      'sets type=%s',
      (type) => {
        setInputs({ type });
        expect(button().getAttribute('type')).toBe(type);
      },
    );

    it('removes the duplicate host id', () => {
      const hostFixture = TestBed.createComponent(FallbackHostComponent);
      hostFixture.detectChanges();
      const el = hostFixture.nativeElement.querySelector('magic-button');
      expect(el.getAttribute('id')).toBeNull();
    });

    it('turns off the ripple when disableRipple is set', () => {
      setInputs({ disableRipple: true });
      const matButton = fixture.debugElement.query(By.css('button'));
      expect(
        matButton.nativeElement.hasAttribute('mat-ripple-loader-disabled'),
      ).toBe(true);
    });
  });

  describe('events', () => {
    it('emits clicked with the mouse event', () => {
      const spy = vi.fn();
      fixture.componentInstance.clicked.subscribe(spy);
      button().click();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toBeInstanceOf(MouseEvent);
    });
  });

  describe('content projection', () => {
    it('prefers projected content over the label fallback', () => {
      const hostFixture = TestBed.createComponent(ProjectionHostComponent);
      hostFixture.detectChanges();
      const text = hostFixture.nativeElement.querySelector('button').textContent;
      expect(text).toContain('Projected');
      expect(text).not.toContain('Fallback');
    });

    it('updates projected content reactively', () => {
      const hostFixture = TestBed.createComponent(ProjectionHostComponent);
      hostFixture.detectChanges();
      hostFixture.componentInstance.projected.set('Changed');
      hostFixture.detectChanges();
      expect(
        hostFixture.nativeElement.querySelector('button').textContent,
      ).toContain('Changed');
    });

    it('forwards clicks from projected usage', () => {
      const hostFixture = TestBed.createComponent(ProjectionHostComponent);
      hostFixture.detectChanges();
      hostFixture.nativeElement.querySelector('button').click();
      expect(hostFixture.componentInstance.onClick).toHaveBeenCalledTimes(1);
    });
  });
});
