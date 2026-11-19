import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
  MenuItem,
} from '@mono-magic/atomic-design-interfaces';
import { MagicMenuComponent, MagicMenuTriggerDirective } from './menu.component';

const SAMPLE_ITEMS: readonly MenuItem[] = [
  { id: 'edit', label: 'Edit', icon: 'edit' },
  { id: 'docs', label: 'Docs', icon: 'open_in_new', link: '#docs' },
  {
    id: 'view-radio',
    label: 'Compact view',
    role: 'menuitemradio',
    disableRipple: true,
  },
  { id: 'archive', label: 'Archive', icon: 'archive', disabled: true },
  {
    id: 'share',
    label: 'Share',
    icon: 'share',
    children: [
      { id: 'email', label: 'Email', icon: 'mail' },
      {
        id: 'social',
        label: 'Social',
        children: [{ id: 'copy-link', label: 'Copy link', icon: 'link' }],
      },
    ],
  },
];

@Component({
  imports: [MagicMenuComponent, MagicMenuTriggerDirective],
  template: `
    <magic-menu
      [items]="items()"
      testId="custom-menu"
      (itemSelected)="onSelect($event)"
    >
      <button type="button" magicMenuTrigger class="custom-trigger-btn">
        Custom Actions
      </button>
    </magic-menu>
  `,
})
class CustomTriggerHostComponent {
  readonly items = signal<readonly MenuItem[]>([
    { id: 'rename', label: 'Rename' },
  ]);
  readonly selected = signal<MenuItem | null>(null);

  onSelect(item: MenuItem): void {
    this.selected.set(item);
  }
}

describe('MagicMenuComponent', () => {
  let fixture: ComponentFixture<MagicMenuComponent>;
  let overlayContainer: OverlayContainer;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const triggerWrapper = (root: HTMLElement = host()): HTMLElement =>
    root.querySelector('.magic-menu__trigger') as HTMLElement;
  const triggerButton = (root: HTMLElement = host()): HTMLButtonElement =>
    root.querySelector('button') as HTMLButtonElement;
  const overlayMenus = (): HTMLElement[] =>
    Array.from(
      overlayContainer.getContainerElement().querySelectorAll('[role="menu"]'),
    );
  const overlayMenuItems = (menuIndex = 0): HTMLElement[] => {
    const menu = overlayMenus()[menuIndex];
    if (!menu) {
      return [];
    }
    return Array.from(menu.querySelectorAll('[mat-menu-item]'));
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicMenuComponent],
    }).compileComponents();
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture = TestBed.createComponent(MagicMenuComponent);
    setInputs({ items: SAMPLE_ITEMS, triggerLabel: 'Actions' });
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  describe('triggers & host attributes', () => {
    it('renders default tonal button trigger and cleans host id', () => {
      setInputs({
        id: 'actions-id',
        testId: 'actions-menu',
        ariaLabel: 'Row actions',
        triggerLabel: 'Options',
        triggerIcon: 'tune',
      });

      expect(host().getAttribute('id')).toBeNull();
      expect(triggerWrapper().getAttribute('data-testid')).toBe('actions-menu');
      expect(triggerButton().id).toBe('actions-id');
      expect(triggerButton().getAttribute('data-testid')).toBe(
        'actions-menu-button',
      );
      expect(triggerButton().getAttribute('aria-label')).toBe('Row actions');
      expect(triggerButton().textContent).toContain('Options');
      expect(triggerButton().textContent).toContain('tune');
    });

    it('renders icon trigger with default more_vert icon', () => {
      setInputs({
        triggerType: 'icon',
        triggerLabel: 'More actions',
      });

      expect(triggerButton().classList).toContain('mat-mdc-icon-button');
      expect(triggerButton().textContent).toContain('more_vert');
      expect(triggerButton().getAttribute('aria-label')).toBe('More actions');
    });

    it('projects custom [magicMenuTrigger] content instead of default magic-button', () => {
      const customFixture = TestBed.createComponent(CustomTriggerHostComponent);
      customFixture.detectChanges();

      const customBtn = customFixture.nativeElement.querySelector(
        '.custom-trigger-btn',
      ) as HTMLButtonElement;
      expect(customBtn).toBeTruthy();
      expect(customFixture.nativeElement.querySelector('magic-button')).toBeNull();

      customBtn.click();
      customFixture.detectChanges();

      const items = overlayMenuItems();
      expect(items).toHaveLength(1);
      items[0].click();
      customFixture.detectChanges();

      expect(customFixture.componentInstance.selected()?.id).toBe('rename');
    });
  });

  describe('menu items, links, nested submenus & outputs', () => {
    it('opens panel, renders icons, links, roles, disabled items and emits itemSelected + closed', () => {
      const openedSpy = vi.fn();
      const selectedSpy = vi.fn();
      const closedSpy = vi.fn();
      fixture.componentInstance.opened.subscribe(openedSpy);
      fixture.componentInstance.itemSelected.subscribe(selectedSpy);
      fixture.componentInstance.closed.subscribe(closedSpy);

      triggerButton().click();
      fixture.detectChanges();

      expect(openedSpy).toHaveBeenCalledTimes(1);
      const items = overlayMenuItems();
      expect(items).toHaveLength(5);
      expect(items[0].textContent).toContain('Edit');
      expect(items[1].tagName).toBe('A');
      expect(items[1].getAttribute('href')).toBe('#docs');
      expect(items[2].getAttribute('role')).toBe('menuitemradio');
      expect((items[3] as HTMLButtonElement).disabled).toBe(true);

      items[0].click();
      fixture.detectChanges();

      expect(selectedSpy).toHaveBeenCalledWith(SAMPLE_ITEMS[0]);
      expect(closedSpy).toHaveBeenCalledWith('click');
    });

    it('supports nested children submenus across multiple levels', () => {
      const selectedSpy = vi.fn();
      fixture.componentInstance.itemSelected.subscribe(selectedSpy);

      triggerButton().click();
      fixture.detectChanges();

      const rootItems = overlayMenuItems(0);
      rootItems[4].click();
      fixture.detectChanges();

      const subItems = overlayMenuItems(1);
      expect(subItems).toHaveLength(2);
      expect(subItems[0].textContent).toContain('Email');

      subItems[1].click();
      fixture.detectChanges();

      const thirdLevelItems = overlayMenuItems(2);
      expect(thirdLevelItems).toHaveLength(1);
      expect(thirdLevelItems[0].textContent).toContain('Copy link');

      thirdLevelItems[0].click();
      fixture.detectChanges();

      expect(selectedSpy).toHaveBeenCalledWith(
        SAMPLE_ITEMS[4].children?.[1].children?.[0],
      );
    });
  });

  describe('positioning, backdrop, disabled & programmatic methods', () => {
    it('applies positioning classes, panelClass, hasBackdrop=false and programmatic open/close', () => {
      const closedSpy = vi.fn();
      fixture.componentInstance.closed.subscribe(closedSpy);

      setInputs({
        xPosition: 'before',
        yPosition: 'above',
        overlapTrigger: true,
        hasBackdrop: false,
        panelClass: 'custom-menu-panel',
      });

      fixture.componentInstance.openMenu();
      fixture.detectChanges();

      const panel = overlayMenus()[0];
      expect(panel).toBeTruthy();
      expect(panel.classList).toContain('mat-menu-before');
      expect(panel.classList).toContain('mat-menu-above');
      expect(panel.classList).toContain('custom-menu-panel');
      expect(
        overlayContainer.getContainerElement().querySelector('.cdk-overlay-backdrop'),
      ).toBeNull();

      fixture.componentInstance.closeMenu();
      fixture.detectChanges();
      expect(closedSpy).toHaveBeenCalledTimes(1);
    });

    it('blocks opening via click and openMenu() when disabled', () => {
      setInputs({ disabled: true });

      expect(triggerButton().disabled).toBe(true);
      triggerWrapper().click();
      fixture.detectChanges();
      expect(overlayMenus()).toHaveLength(0);

      fixture.componentInstance.openMenu();
      fixture.detectChanges();
      expect(overlayMenus()).toHaveLength(0);
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
  });
});
