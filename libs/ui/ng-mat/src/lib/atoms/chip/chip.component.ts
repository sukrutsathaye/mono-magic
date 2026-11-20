import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  CdkDrag,
  CdkDropList,
  moveItemInArray,
  type CdkDragDrop,
} from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import {
  MatChip,
  MatChipAvatar,
  MatChipGrid,
  MatChipInput,
  MatChipListbox,
  MatChipOption,
  MatChipRemove,
  MatChipRow,
  MatChipSet,
  type MatChipEditedEvent,
  type MatChipInputEvent,
  type MatChipSelectionChange,
} from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import type {
  AtomicSize,
  ChipAtomProps,
  ChipItem,
  ChipOrientation,
  ChipVariant,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import type { SignalProps } from '../../core/signal-props';
import { MagicFormFieldComponent } from '../../molecules/form-field/form-field.component';

export type { ChipItem };

/**
 * Wraps Angular Material's chip set, selectable listbox, input grid and
 * CDK drag-drop list behind one signal-based API.
 *
 * Updates `chips` immutably on add, remove, edit, select and drag-drop, and
 * falls back to projecting a single `<magic-chip>Tag</magic-chip>` when `chips`
 * is empty in `basic` mode.
 *
 * @see https://material.angular.dev/components/chips/overview
 */
@Component({
  selector: 'magic-chip',
  imports: [
    MatChipSet,
    MatChip,
    MatChipListbox,
    MatChipOption,
    MatChipGrid,
    MatChipRow,
    MatChipInput,
    MatChipRemove,
    MatChipAvatar,
    MatIcon,
    CdkDropList,
    CdkDrag,
    MagicFormFieldComponent,
  ],
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[class]': 'hostClasses()',
  },
})
export class MagicChipComponent implements SignalProps<ChipAtomProps> {
  private readonly announcer = inject(LiveAnnouncer);

  /** Id applied to the inner chip container (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the inner chip container. */
  readonly testId = input<string>();
  /** Accessible name for the chip set/listbox/grid. */
  readonly ariaLabel = input<string>();
  /** Items rendered as chips. Two-way bindable and updated immutably. */
  readonly chips = model<readonly ChipItem[]>([]);
  /** Single-chip fallback label or field label in `input` variant. */
  readonly label = input<string>();
  /** Chip interaction mode. */
  readonly variant = input<ChipVariant>('basic');
  /** Semantic color role. */
  readonly color = input<ColorIntent>('primary');
  /** Size token (`xs`..`xl`). */
  readonly size = input<AtomicSize>('md');
  /** Disables all chips and input. */
  readonly disabled = input(false);
  /** Shows remove buttons on chips (can be overridden per item). */
  readonly removable = input(false);
  /** Enables inline editing on `input` chip rows. */
  readonly editable = input(false);
  /** Allows selection in `selectable` mode. */
  readonly selectable = input(true);
  /** Allows multiple selection in `selectable` mode. */
  readonly multiple = input(false);
  /** Hides selection checkmarks in `selectable` mode. */
  readonly hideSelectionIndicator = input(false);
  /** Chip layout / drag orientation. */
  readonly orientation = input<ChipOrientation>('horizontal');
  /** Disables the ripple animation. */
  readonly disableRipple = input(false);
  /** Input placeholder shown in `'input'` mode. */
  readonly inputPlaceholder = input('New chip...');

  /** Emits the newly added chip item. */
  readonly chipAdded = output<ChipItem>();
  /** Emits the removed chip item. */
  readonly chipRemoved = output<ChipItem>();
  /** Emits the updated chip item after inline editing. */
  readonly chipEdited = output<ChipItem>();
  /** Emits the reordered chip array after drag-and-drop. */
  readonly chipReordered = output<readonly ChipItem[]>();
  /** Emits when a selectable chip option changes selection. */
  readonly selectionChanged = output<{ chip: ChipItem; selected: boolean }>();

  protected readonly hostClasses = computed(
    () => `magic-size-${this.size()} magic-color-${this.color()}`,
  );

  /** Immutably removes the chip at `index`. */
  removeChip(index: number): void {
    const current = this.chips();
    const target = current[index];
    if (!target) {
      return;
    }
    const next = current.filter((_, idx) => idx !== index);
    this.chips.set(next);
    this.chipRemoved.emit(target);
    void this.announcer.announce(`Removed ${target.label}`);
  }

  /** Immutably adds a chip from `<input matChipInputFor>`. */
  addChip(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const created: ChipItem = { label: value };
      this.chips.set([...this.chips(), created]);
      this.chipAdded.emit(created);
      void this.announcer.announce(`Added ${value}`);
    }
    event.chipInput.clear();
  }

  /** Immutably updates the label of the chip at `index` (or removes if empty). */
  editChip(index: number, event: MatChipEditedEvent): void {
    const value = event.value.trim();
    if (!value) {
      this.removeChip(index);
      return;
    }
    const current = this.chips();
    const target = current[index];
    if (!target) {
      return;
    }
    const updatedItem: ChipItem = { ...target, label: value };
    const next = current.map((chip, idx) =>
      idx === index ? updatedItem : chip,
    );
    this.chips.set(next);
    this.chipEdited.emit(updatedItem);
    void this.announcer.announce(`Edited ${value}`);
  }

  /** Immutably reorders chips on CDK drag-drop. */
  onDrop(event: CdkDragDrop<readonly ChipItem[]>): void {
    const next = [...this.chips()];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.chips.set(next);
    this.chipReordered.emit(next);
  }

  protected onChipSelection(
    chip: ChipItem,
    index: number,
    event: MatChipSelectionChange,
  ): void {
    const next = this.chips().map((item, idx) =>
      idx === index ? { ...item, selected: event.selected } : item,
    );
    this.chips.set(next);
    this.selectionChanged.emit({ chip: next[index], selected: event.selected });
    void this.announcer.announce(
      `${chip.label} ${event.selected ? 'selected' : 'deselected'}`,
    );
  }
}
