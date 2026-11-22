import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  TemplateRef,
  computed,
  contentChildren,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import type {
  AccordionAppearance,
  AccordionItem,
  AccordionMoleculeProps,
  AtomicSize,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';

export type { AccordionAppearance, AccordionItem };

/**
 * Marks a custom `<ng-template>` body inside `<magic-accordion>` keyed by
 * `magicAccordionPanel` (matching `AccordionItem.id`).
 */
@Directive({
  selector: 'ng-template[magicAccordionPanel]',
})
export class MagicAccordionPanelDirective {
  /** Identifier matching `AccordionItem.id`. */
  readonly itemId = input.required<string>({ alias: 'magicAccordionPanel' });
  /** Template reference rendered inside the matching expansion panel body. */
  readonly templateRef = inject(TemplateRef<unknown>);
}

/**
 * A Material 3 collapsible panel group composing `MatAccordion` and
 * `MatExpansionPanel` (`[expanded]`, `[disabled]`, `(opened)`, `(closed)`),
 * supporting single-expand (`multiple=false`) and multi-expand
 * (`multiple=true`) modes, controlled (`expandedIds`) and uncontrolled
 * (`defaultExpandedIds` / item `expanded`) state, icons, summaries, and
 * `outlined` / `raised` appearances.
 *
 * @see https://material.angular.dev/components/expansion/overview
 */
@Component({
  selector: 'magic-accordion',
  imports: [
    NgTemplateOutlet,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatIcon,
  ],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicAccordionComponent
  implements SignalProps<AccordionMoleculeProps>
{
  /** Id applied to the inner `mat-accordion` (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on `mat-accordion` (`-panel-<id>` on items). */
  readonly testId = input<string>();
  /** Accessible name applied to the accordion container (`aria-label`). */
  readonly ariaLabel = input<string>();
  /** Ordered list of accordion panel items. */
  readonly items = input.required<readonly AccordionItem[]>();
  /** Allows multiple panels to remain expanded simultaneously when `true`. */
  readonly multiple = input<boolean>(false);
  /** Controlled list of expanded panel identifiers. */
  readonly expandedIds = input<readonly string[]>();
  /** Initial list of expanded panel identifiers for uncontrolled usage. */
  readonly defaultExpandedIds = input<readonly string[]>();
  /** Material 3 surface appearance (`outlined` or `raised`). */
  readonly appearance = input<AccordionAppearance>('outlined');
  /** Standardized density/size token (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');

  /** Emits the updated ordered list of expanded panel identifiers when expansion changes. */
  readonly expandedIdsChange = output<readonly string[]>();

  private readonly projectedPanels = contentChildren(
    MagicAccordionPanelDirective,
  );
  private readonly uncontrolledExpandedIds = signal<readonly string[] | undefined>(
    undefined,
  );

  /** Effective list of expanded panel IDs (`expandedIds` overrides local state). */
  readonly currentExpandedIds = computed<readonly string[]>(() => {
    const controlled = this.expandedIds();
    if (controlled !== undefined) {
      return this.normalizeIds(controlled);
    }
    const local = this.uncontrolledExpandedIds();
    if (local !== undefined) {
      return this.normalizeIds(local);
    }
    const defaults = this.defaultExpandedIds();
    if (defaults !== undefined) {
      return this.normalizeIds(defaults);
    }
    const itemDefaults = this.items()
      .filter((item) => item.expanded)
      .map((item) => item.id);
    return this.normalizeIds(itemDefaults);
  });

  protected readonly panelMap = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const panel of this.projectedPanels()) {
      map.set(panel.itemId(), panel.templateRef);
    }
    return map;
  });

  protected readonly hostClasses = computed(() =>
    [
      'magic-accordion',
      `magic-size-${this.size()}`,
      `magic-accordion--${this.appearance()}`,
    ].join(' '),
  );

  protected isPanelExpanded(itemId: string): boolean {
    return this.currentExpandedIds().includes(itemId);
  }

  protected customPanelFor(itemId: string): TemplateRef<unknown> | null {
    return this.panelMap().get(itemId) ?? null;
  }

  protected onPanelOpened(item: AccordionItem): void {
    if (item.disabled) {
      return;
    }
    const current = this.currentExpandedIds();
    if (current.includes(item.id)) {
      return;
    }
    const next = this.multiple() ? [...current, item.id] : [item.id];
    this.commitExpandedIds(next);
  }

  protected onPanelClosed(item: AccordionItem): void {
    if (item.disabled) {
      return;
    }
    const current = this.currentExpandedIds();
    if (!current.includes(item.id)) {
      return;
    }
    const next = current.filter((id) => id !== item.id);
    this.commitExpandedIds(next);
  }

  private commitExpandedIds(next: readonly string[]): void {
    if (this.expandedIds() === undefined) {
      this.uncontrolledExpandedIds.set(next);
    }
    this.expandedIdsChange.emit(next);
  }

  private normalizeIds(ids: readonly string[]): readonly string[] {
    const valid = new Set(this.items().map((item) => item.id));
    const unique: string[] = [];
    for (const id of ids) {
      if (valid.has(id) && !unique.includes(id)) {
        unique.push(id);
      }
    }
    if (!this.multiple() && unique.length > 1) {
      return [unique[0]];
    }
    return unique;
  }
}
