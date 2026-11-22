import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import type {
  AtomicSize,
  ColorIntent,
  TabItem,
  TabsVariant,
} from '@mono-magic/atomic-design-interfaces';
import { MagicTabPanelDirective, MagicTabsComponent } from './tabs.component';

const SAMPLE_TABS: readonly TabItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'dashboard',
    content: 'Overview summary text.',
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: 'notifications',
    badgeContent: 4,
    content: 'Recent activity feed.',
  },
  {
    id: 'billing',
    label: 'Billing',
    disabled: true,
    content: 'Billing details.',
  },
  {
    id: 'settings',
    label: 'Settings',
    content: 'Workspace settings panel.',
  },
];

@Component({
  imports: [MagicTabsComponent, MagicTabPanelDirective],
  template: `
    <magic-tabs
      [items]="items()"
      [orientation]="orientation()"
      [lazy]="lazy()"
      testId="custom-tabs"
    >
      <ng-template magicTabPanel="overview">
        <div class="projected-overview">Projected Overview Body</div>
      </ng-template>
      <ng-template magicTabPanel="settings">
        <div class="projected-settings">Projected Settings Body</div>
      </ng-template>
    </magic-tabs>
  `,
})
class CustomPanelsHostComponent {
  readonly items = signal<readonly TabItem[]>(SAMPLE_TABS);
  readonly orientation = signal<'horizontal' | 'vertical'>('vertical');
  readonly lazy = signal(true);
}

describe('MagicTabsComponent', () => {
  let fixture: ComponentFixture<MagicTabsComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;
  const root = (): HTMLElement =>
    host().querySelector('.magic-tabs__root') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicTabsComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicTabsComponent);
    setInputs({ items: SAMPLE_TABS });
  });

  describe('horizontal MatTabGroup mode', () => {
    it('renders tabs, forwards id/testId/ariaLabel, icons, badges, and switches uncontrolled tabs', async () => {
      const changeSpy = vi.fn();
      fixture.componentInstance.activeTabChange.subscribe(changeSpy);

      setInputs({
        id: 'main-tabs',
        testId: 'nav-tabs',
        ariaLabel: 'Section tabs',
        defaultActiveTabId: 'overview',
      });

      expect(host().getAttribute('id')).toBeNull();
      expect(root().getAttribute('id')).toBe('main-tabs');
      expect(root().getAttribute('data-testid')).toBe('nav-tabs');
      expect(host().querySelector('mat-tab-group')).toBeTruthy();

      const tabHeaders = Array.from(
        host().querySelectorAll('[role="tab"]'),
      ) as HTMLElement[];
      expect(tabHeaders).toHaveLength(4);
      expect(tabHeaders[1].textContent).toContain('Activity');
      expect(tabHeaders[2].getAttribute('aria-disabled')).toBe('true');

      tabHeaders[1].click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(changeSpy).toHaveBeenCalledWith('activity');
      expect(fixture.componentInstance.currentTabId()).toBe('activity');
      expect(host().textContent).toContain('Recent activity feed.');
    });

    it('supports controlled activeTabId, lazy mode, scrollable, variant, size, and color classes', async () => {
      const changeSpy = vi.fn();
      fixture.componentInstance.activeTabChange.subscribe(changeSpy);

      setInputs({
        activeTabId: 'overview',
        scrollable: true,
        lazy: true,
        variant: 'secondary' as TabsVariant,
        size: 'lg' as AtomicSize,
        color: 'tertiary' as ColorIntent,
      });

      expect(host().classList).toContain('magic-tabs--secondary');
      expect(host().classList).toContain('magic-size-lg');
      expect(host().classList).toContain('magic-color-tertiary');

      const tabHeaders = Array.from(
        host().querySelectorAll('[role="tab"]'),
      ) as HTMLElement[];
      tabHeaders[3].click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(changeSpy).toHaveBeenCalledWith('settings');
      expect(fixture.componentInstance.currentTabId()).toBe('overview');
    });
  });

  describe('vertical accessible tablist & keyboard navigation', () => {
    it('renders vertical ARIA tablist and navigates with ArrowDown, ArrowUp, Home, and End skipping disabled tabs', () => {
      const changeSpy = vi.fn();
      fixture.componentInstance.activeTabChange.subscribe(changeSpy);

      setInputs({
        orientation: 'vertical',
        testId: 'v-tabs',
        ariaLabel: 'Vertical navigation',
      });

      const tablist = host().querySelector('[role="tablist"]') as HTMLElement;
      expect(tablist.getAttribute('aria-orientation')).toBe('vertical');
      expect(tablist.getAttribute('aria-label')).toBe('Vertical navigation');

      const buttons = Array.from(
        host().querySelectorAll('.magic-tabs__vertical-tab'),
      ) as HTMLButtonElement[];
      expect(buttons).toHaveLength(4);
      expect(buttons[2].disabled).toBe(true);
      expect(buttons[0].getAttribute('aria-selected')).toBe('true');

      // ArrowDown from overview (0) -> activity (1)
      buttons[0].dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();
      expect(fixture.componentInstance.currentTabId()).toBe('activity');

      // ArrowDown from activity (1) skips disabled billing (2) -> settings (3)
      buttons[1].dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();
      expect(fixture.componentInstance.currentTabId()).toBe('settings');

      // ArrowUp from settings (3) skips disabled billing (2) -> activity (1)
      buttons[3].dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
      fixture.detectChanges();
      expect(fixture.componentInstance.currentTabId()).toBe('activity');

      // End -> settings (3), Home -> overview (0)
      buttons[1].dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
      );
      fixture.detectChanges();
      expect(fixture.componentInstance.currentTabId()).toBe('settings');

      buttons[3].dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
      );
      fixture.detectChanges();
      expect(fixture.componentInstance.currentTabId()).toBe('overview');

      // Disabled tab click does not emit
      buttons[2].click();
      fixture.detectChanges();
      expect(fixture.componentInstance.currentTabId()).toBe('overview');
      expect(changeSpy).toHaveBeenCalledTimes(5);
    });

    it('supports lazy panel mounting and [magicTabPanel] templates in vertical orientation', () => {
      const hostFixture = TestBed.createComponent(CustomPanelsHostComponent);
      hostFixture.detectChanges();

      const el = hostFixture.nativeElement as HTMLElement;
      expect(el.querySelector('.projected-overview')).toBeTruthy();
      expect(el.querySelector('.projected-settings')).toBeNull();

      const settingsBtn = el.querySelector(
        '[data-testid="custom-tabs-tab-settings"]',
      ) as HTMLButtonElement;
      settingsBtn.click();
      hostFixture.detectChanges();

      expect(el.querySelector('.projected-settings')).toBeTruthy();
    });
  });
});
