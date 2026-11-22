import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  TemplateRef,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {
  MatTab,
  MatTabContent,
  MatTabGroup,
  MatTabLabel,
} from '@angular/material/tabs';
import type {
  AtomicSize,
  ColorIntent,
  TabItem,
  TabsMoleculeProps,
  TabsOrientation,
  TabsVariant,
} from '@mono-magic/atomic-design-interfaces';
import { MagicBadgeComponent } from '../../atoms/badge/badge.component';
import type { SignalProps } from '../../core/signal-props';

export type { TabItem, TabsOrientation, TabsVariant };

/**
 * Marks a custom `<ng-template>` panel body inside `<magic-tabs>` keyed by
 * `magicTabPanel` (matching `TabItem.id`).
 */
@Directive({
  selector: 'ng-template[magicTabPanel]',
})
export class MagicTabPanelDirective {
  /** Identifier matching `TabItem.id`. */
  readonly tabId = input.required<string>({ alias: 'magicTabPanel' });
  /** Template reference captured for lazy or eager rendering. */
  readonly templateRef = inject(TemplateRef<unknown>);
}

/**
 * A Material 3 tabs molecule composing `MatTabGroup` / `MatTab` for horizontal
 * layouts and a WAI-ARIA `tablist` (`aria-orientation="vertical"`) with
 * `ArrowUp`/`ArrowDown`/`Home`/`End` keyboard navigation for vertical layouts,
 * supporting icons, badges (`magic-badge`), scrollable headers, lazy panel
 * rendering, and controlled/uncontrolled active tab state.
 *
 * @see https://material.angular.dev/components/tabs/overview
 */
@Component({
  selector: 'magic-tabs',
  imports: [
    NgTemplateOutlet,
    MatTabGroup,
    MatTab,
    MatTabLabel,
    MatTabContent,
    MatIcon,
    MagicBadgeComponent,
  ],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicTabsComponent implements SignalProps<TabsMoleculeProps> {
  /** Id applied to the inner tabs root container (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the inner tabs container (`-tab-<id>`, `-panel-<id>` on parts). */
  readonly testId = input<string>();
  /** Accessible name applied to the tablist (`aria-label`). */
  readonly ariaLabel = input<string>();
  /** Ordered list of tab descriptors. */
  readonly items = input.required<readonly TabItem[]>();
  /** Controlled active tab identifier. */
  readonly activeTabId = input<string>();
  /** Initial active tab identifier for uncontrolled usage. */
  readonly defaultActiveTabId = input<string>();
  /** Tab strip layout orientation (`horizontal` or `vertical`). */
  readonly orientation = input<TabsOrientation>('horizontal');
  /** Material 3 tab indicator hierarchy (`primary` or `secondary`). */
  readonly variant = input<TabsVariant>('primary');
  /** Whether overflowing tab headers scroll rather than stretching. */
  readonly scrollable = input<boolean>(false);
  /** Whether inactive tab panels defer mounting until first selected. */
  readonly lazy = input<boolean>(false);
  /** Semantic color intent applied to active tab text and indicator. */
  readonly color = input<ColorIntent>('primary');
  /** Standardized component size token (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');

  /** Emits the newly selected tab identifier (`TabItem.id`) when selection changes. */
  readonly activeTabChange = output<string>();

  private readonly projectedPanels = contentChildren(MagicTabPanelDirective);
  private readonly verticalTabButtons =
    viewChildren<ElementRef<HTMLButtonElement>>('verticalTabBtn');

  private readonly uncontrolledTabId = signal<string | undefined>(undefined);
  private readonly visitedTabIds = signal<ReadonlySet<string>>(new Set());

  /** Effective active tab identifier (controlled `activeTabId` takes precedence). */
  readonly currentTabId = computed(() => {
    const list = this.items();
    const controlled = this.activeTabId();
    if (controlled !== undefined) {
      return controlled;
    }
    const local = this.uncontrolledTabId();
    if (local !== undefined && list.some((item) => item.id === local)) {
      return local;
    }
    const defaultId = this.defaultActiveTabId();
    if (defaultId !== undefined && list.some((item) => item.id === defaultId)) {
      return defaultId;
    }
    return list.find((item) => !item.disabled)?.id ?? list[0]?.id ?? '';
  });

  protected readonly selectedIndex = computed(() => {
    const activeId = this.currentTabId();
    const idx = this.items().findIndex((item) => item.id === activeId);
    return idx >= 0 ? idx : 0;
  });

  protected readonly panelMap = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const panel of this.projectedPanels()) {
      map.set(panel.tabId(), panel.templateRef);
    }
    return map;
  });

  protected readonly hostClasses = computed(() =>
    [
      'magic-tabs',
      `magic-size-${this.size()}`,
      `magic-color-${this.color()}`,
      `magic-tabs--${this.orientation()}`,
      `magic-tabs--${this.variant()}`,
    ].join(' '),
  );

  constructor() {
    effect(() => {
      const current = this.currentTabId();
      if (!current) {
        return;
      }
      this.visitedTabIds.update((prev) => {
        if (prev.has(current)) {
          return prev;
        }
        const next = new Set(prev);
        next.add(current);
        return next;
      });
    });
  }

  protected customPanelFor(tabId: string): TemplateRef<unknown> | null {
    return this.panelMap().get(tabId) ?? null;
  }

  protected shouldMountVerticalPanel(tabId: string): boolean {
    if (!this.lazy()) {
      return true;
    }
    return this.currentTabId() === tabId || this.visitedTabIds().has(tabId);
  }

  protected selectTab(item: TabItem): void {
    if (item.disabled) {
      return;
    }
    const prevId = this.currentTabId();
    if (this.activeTabId() === undefined) {
      this.uncontrolledTabId.set(item.id);
    }
    if (prevId !== item.id) {
      this.activeTabChange.emit(item.id);
    }
  }

  protected onHorizontalIndexChange(index: number): void {
    const item = this.items()[index];
    if (item) {
      this.selectTab(item);
    }
  }

  protected onVerticalKeydown(event: KeyboardEvent, currentIndex: number): void {
    const list = this.items();
    const enabledIndices: number[] = [];
    for (let i = 0; i < list.length; i += 1) {
      if (!list[i]?.disabled) {
        enabledIndices.push(i);
      }
    }
    if (enabledIndices.length === 0) {
      return;
    }

    let nextIndex: number | undefined;
    if (event.key === 'ArrowDown') {
      const pos = enabledIndices.indexOf(currentIndex);
      nextIndex =
        enabledIndices[(pos + 1) % enabledIndices.length] ?? enabledIndices[0];
    } else if (event.key === 'ArrowUp') {
      const pos = enabledIndices.indexOf(currentIndex);
      nextIndex =
        enabledIndices[
          (pos - 1 + enabledIndices.length) % enabledIndices.length
        ] ?? enabledIndices[enabledIndices.length - 1];
    } else if (event.key === 'Home') {
      nextIndex = enabledIndices[0];
    } else if (event.key === 'End') {
      nextIndex = enabledIndices[enabledIndices.length - 1];
    } else {
      return;
    }

    event.preventDefault();
    const targetItem = list[nextIndex];
    if (targetItem) {
      this.selectTab(targetItem);
      this.focusVerticalTab(nextIndex);
    }
  }

  private focusVerticalTab(index: number): void {
    const buttons = this.verticalTabButtons();
    buttons[index]?.nativeElement.focus();
  }
}
