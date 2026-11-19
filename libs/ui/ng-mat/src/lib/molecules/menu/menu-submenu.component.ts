import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  viewChild,
  viewChildren,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {
  MatMenu,
  MatMenuItem,
  MatMenuTrigger,
  type MenuCloseReason,
  type MenuPositionX,
  type MenuPositionY,
} from '@angular/material/menu';
import type { MenuItem } from '@mono-magic/atomic-design-interfaces';

/**
 * Recursive `mat-menu` panel renderer used internally by `MagicMenuComponent`
 * so each nesting level keeps its `mat-menu-item` children in its own light
 * DOM while supporting arbitrary submenu depth.
 *
 * @internal
 */
@Component({
  selector: 'magic-menu-submenu',
  imports: [MatMenu, MatMenuItem, MatMenuTrigger, MatIcon],
  templateUrl: './menu-submenu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MagicMenuSubmenuComponent {
  /** Menu items rendered at this hierarchy level. */
  readonly items = input<readonly MenuItem[]>([]);
  /** Unique key matching this submenu back to its parent trigger item. */
  readonly ownerKey = input<string>('');
  /** Horizontal panel alignment relative to trigger. */
  readonly xPosition = input<MenuPositionX>('after');
  /** Vertical panel alignment relative to trigger. */
  readonly yPosition = input<MenuPositionY>('below');
  /** Whether the menu overlaps its trigger. */
  readonly overlapTrigger = input(false);
  /** Whether a backdrop appears behind the open menu. */
  readonly hasBackdrop = input(true);
  /** CSS class applied to the menu backdrop. */
  readonly backdropClass = input<string>('');
  /** CSS class applied to the menu overlay panel. */
  readonly panelClass = input<string>('');
  /** Accessible label for the menu panel (`aria-label`). */
  readonly ariaLabel = input<string>();
  /** Accessible `aria-labelledby` reference for the menu panel. */
  readonly ariaLabelledby = input<string>();
  /** Accessible `aria-describedby` reference for the menu panel. */
  readonly ariaDescribedby = input<string>();

  /** Underlying `MatMenu` instance referenced by parent `[matMenuTriggerFor]`. */
  readonly matMenu = viewChild.required(MatMenu);
  private readonly nestedPanels = viewChildren(MagicMenuSubmenuComponent);

  /** Emits when a leaf menu item is activated. */
  readonly itemSelected = output<MenuItem>();
  /** Emits when this menu panel closes. */
  readonly closed = output<MenuCloseReason>();

  protected itemKey(item: MenuItem, index: number): string {
    return `${index}:${item.id ?? item.label}`;
  }

  protected submenuFor(item: MenuItem, index: number): MatMenu | null {
    const key = this.itemKey(item, index);
    return (
      this.nestedPanels()
        .find((panel) => panel.ownerKey() === key)
        ?.matMenu() ?? null
    );
  }

  protected selectItem(item: MenuItem): void {
    if (!item.disabled) {
      this.itemSelected.emit(item);
    }
  }
}
