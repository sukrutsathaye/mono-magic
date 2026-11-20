import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  computed,
  contentChildren,
  input,
  output,
  viewChild,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import type {
  AtomicSize,
  ButtonVariant,
  ColorIntent,
  MenuCloseReason,
  MenuItem,
  MenuMoleculeProps,
  MenuPositionX,
  MenuPositionY,
  MenuTriggerType,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButtonComponent } from '../../atoms/button/button.component';
import type { SignalProps } from '../../core/signal-props';
import { MagicMenuSubmenuComponent } from './menu-submenu.component';

export type { MenuCloseReason, MenuItem };

/** Marks custom trigger content projected into `<magic-menu>`. */
@Directive({
  selector: '[magicMenuTrigger]',
})
export class MagicMenuTriggerDirective {}

/**
 * A dropdown action menu molecule composing `magic-button` (or custom
 * `[magicMenuTrigger]` content) and Angular Material's `mat-menu` with
 * recursive submenu support.
 *
 * @see https://material.angular.dev/components/menu/overview
 */
@Component({
  selector: 'magic-menu',
  imports: [MatMenuTrigger, MagicButtonComponent, MagicMenuSubmenuComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicMenuComponent implements SignalProps<MenuMoleculeProps> {
  /** Id applied to the inner trigger button (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the trigger wrapper (`-button` on default trigger). */
  readonly testId = input<string>();
  /** Accessible name applied to the trigger button and menu panel. */
  readonly ariaLabel = input<string>();
  /** Explicit `aria-labelledby` forwarded to the `mat-menu` panel. */
  readonly ariaLabelledby = input<string>();
  /** Explicit `aria-describedby` forwarded to the `mat-menu` panel. */
  readonly ariaDescribedby = input<string>();
  /** Hierarchy of menu items (supporting nested `children` submenus). */
  readonly items = input<readonly MenuItem[]>([]);
  /** Text displayed on the default `'button'` trigger. */
  readonly triggerLabel = input('Menu');
  /** Material icon name shown on `'icon'` triggers or next to `'button'` text. */
  readonly triggerIcon = input<string>();
  /** Trigger button style (`'button'` text button or `'icon'` icon button). */
  readonly triggerType = input<MenuTriggerType>('button');
  /** Visual variant of the default `'button'` trigger. */
  readonly triggerVariant = input<ButtonVariant>('tonal');
  /** Horizontal alignment of the menu panel (`'before'` or `'after'`). */
  readonly xPosition = input<MenuPositionX>('after');
  /** Vertical alignment of the menu panel (`'above'` or `'below'`). */
  readonly yPosition = input<MenuPositionY>('below');
  /** Whether the root menu overlaps its trigger element. */
  readonly overlapTrigger = input(false);
  /** Whether a backdrop is rendered behind the open menu. */
  readonly hasBackdrop = input(true);
  /** CSS class applied to the overlay backdrop. */
  readonly backdropClass = input<string>('');
  /** CSS class applied to the menu overlay panel. */
  readonly panelClass = input<string>('');
  /** Restores focus to the trigger after closing the menu. */
  readonly restoreFocus = input(true);
  /** Arbitrary context payload forwarded to `matMenuTriggerData`. */
  readonly menuData = input<unknown>(undefined);
  /** Disables the trigger button and suppresses opening the menu. */
  readonly disabled = input(false);
  /** Control size token (`xs`..`xl`) forwarded to the trigger button. */
  readonly size = input<AtomicSize>('md');
  /** Semantic color role forwarded to the trigger button. */
  readonly color = input<ColorIntent>('primary');

  /** Emits the clicked leaf `MenuItem`. */
  readonly itemSelected = output<MenuItem>();
  /** Emits when the menu panel closes with the close reason. */
  readonly closed = output<MenuCloseReason>();
  /** Emits when the root menu panel opens. */
  readonly opened = output<void>();

  private readonly customTriggers = contentChildren(MagicMenuTriggerDirective, {
    descendants: true,
  });
  private readonly menuTrigger = viewChild(MatMenuTrigger);

  protected readonly hasCustomTrigger = computed(
    () => this.customTriggers().length > 0,
  );
  protected readonly hostClasses = computed(
    () => `magic-size-${this.size()} magic-color-${this.color()}`,
  );

  /** Opens the root menu panel programmatically (no-op when disabled). */
  openMenu(): void {
    if (!this.disabled()) {
      this.menuTrigger()?.openMenu();
    }
  }

  /** Closes the root menu panel programmatically. */
  closeMenu(): void {
    this.menuTrigger()?.closeMenu();
  }
}
