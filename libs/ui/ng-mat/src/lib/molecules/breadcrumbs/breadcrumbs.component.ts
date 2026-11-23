import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import type {
  AtomicSize,
  BreadcrumbItem,
  BreadcrumbsMoleculeProps,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';

export type { BreadcrumbItem };

const MATERIAL_SEPARATOR_ICONS = new Set([
  'chevron_right',
  'navigate_next',
  'arrow_forward_ios',
  'arrow_right',
]);

/**
 * A Material 3 navigational breadcrumb trail molecule supporting icons,
 * custom text or Material icon separators (`'/'`, `'>'`, `'chevron_right'`),
 * `maxItems` middle-item collapsing with interactive ellipsis expansion,
 * `aria-current="page"` on the current item, and disabled states.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/
 */
@Component({
  selector: 'magic-breadcrumbs',
  imports: [MatIcon],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicBreadcrumbsComponent
  implements SignalProps<BreadcrumbsMoleculeProps>
{
  /** Id applied to the inner `<nav>` landmark (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the inner `<nav>` landmark. */
  readonly testId = input<string>();
  /** Accessible name applied to the `<nav>` landmark (defaults to `'Breadcrumb'`). */
  readonly ariaLabel = input<string>();
  /** Ordered trail of navigation breadcrumb items from root to current location. */
  readonly items = input.required<readonly BreadcrumbItem[]>();
  /** Separator string or Material icon token rendered between breadcrumb items. */
  readonly separator = input<string>('/');
  /** Maximum number of visible items before collapsing middle items behind an ellipsis. */
  readonly maxItems = input<number>();
  /** Number of leading items kept visible when collapsed (defaults to `1`). */
  readonly itemsBeforeCollapse = input<number>(1);
  /** Number of trailing items kept visible when collapsed (defaults to `1`). */
  readonly itemsAfterCollapse = input<number>(1);
  /** Semantic accent color intent for interactive breadcrumb links. */
  readonly color = input<ColorIntent>('primary');
  /** Standardized component density/size preset (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');
  /** Whether all breadcrumb interactions are disabled. */
  readonly disabled = input<boolean>(false);

  /** Emits the clicked `BreadcrumbItem` when an enabled crumb is activated. */
  readonly itemClicked = output<BreadcrumbItem>();

  private readonly expanded = signal(false);

  constructor() {
    effect(() => {
      this.items();
      this.maxItems();
      this.expanded.set(false);
    });
  }

  protected readonly isSeparatorIcon = computed(() =>
    MATERIAL_SEPARATOR_ICONS.has(this.separator()),
  );

  protected readonly isCollapsed = computed(() => {
    if (this.expanded()) {
      return false;
    }
    const max = this.maxItems();
    const list = this.items();
    return (
      max !== undefined &&
      max > 0 &&
      list.length > max &&
      this.itemsBeforeCollapse() + this.itemsAfterCollapse() < list.length
    );
  });

  protected readonly leadingItems = computed(() => {
    const list = this.items();
    if (!this.isCollapsed()) {
      return list;
    }
    const before = Math.max(1, this.itemsBeforeCollapse());
    return list.slice(0, before);
  });

  protected readonly trailingItems = computed(() => {
    const list = this.items();
    if (!this.isCollapsed()) {
      return [] as readonly BreadcrumbItem[];
    }
    const after = Math.max(1, this.itemsAfterCollapse());
    return list.slice(list.length - after);
  });

  protected readonly hostClasses = computed(() =>
    [
      'magic-breadcrumbs',
      `magic-size-${this.size()}`,
      `magic-color-${this.color()}`,
      this.disabled() ? 'magic-breadcrumbs--disabled' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  /** Expands collapsed middle breadcrumb items. */
  expand(): void {
    if (!this.disabled()) {
      this.expanded.set(true);
    }
  }

  protected isCurrentItem(item: BreadcrumbItem, globalIndex: number): boolean {
    if (item.current !== undefined) {
      return item.current;
    }
    const list = this.items();
    const hasExplicitCurrent = list.some((entry) => entry.current === true);
    return !hasExplicitCurrent && globalIndex === list.length - 1;
  }

  protected trailingGlobalIndex(localIdx: number): number {
    return this.items().length - this.trailingItems().length + localIdx;
  }

  protected onItemActivate(event: Event, item: BreadcrumbItem): void {
    if (this.disabled() || item.disabled) {
      event.preventDefault();
      return;
    }
    if (!item.href) {
      event.preventDefault();
    } else {
      event.preventDefault();
    }
    this.itemClicked.emit(item);
  }
}
