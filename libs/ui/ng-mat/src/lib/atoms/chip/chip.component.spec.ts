import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import type {
  AtomicSize,
  ChipItem,
  ColorIntent,
} from '@mono-magic/atomic-design-interfaces';
import { MagicChipComponent } from './chip.component';

const SAMPLE_CHIPS: ChipItem[] = [
  { id: 'ng', label: 'Angular' },
  { id: 'mat', label: 'Material', removable: true },
];

@Component({
  imports: [MagicChipComponent],
  template: `<magic-chip>Projected Chip</magic-chip>`,
})
class ProjectionHostComponent {}

describe('MagicChipComponent', () => {
  let fixture: ComponentFixture<MagicChipComponent>;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  const host = (): HTMLElement => fixture.nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagicChipComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(MagicChipComponent);
    fixture.detectChanges();
  });

  it('supports single-chip label fallback and projected content when chips is empty', () => {
    setInputs({ label: 'Single Tag' });
    expect(host().querySelector('mat-chip')?.textContent?.trim()).toBe(
      'Single Tag',
    );

    const pFixture = TestBed.createComponent(ProjectionHostComponent);
    pFixture.detectChanges();
    expect(pFixture.nativeElement.textContent).toContain('Projected Chip');
  });

  it('renders basic chips, avatars, icons and removable buttons', () => {
    setInputs({
      id: 'tags-set',
      testId: 'tags',
      ariaLabel: 'Tags',
      chips: [
        { label: 'One', leadingIcon: 'star' },
        { label: 'Two', avatarSrc: '/a.png', avatarAlt: 'Avatar Two' },
      ],
      removable: true,
    });

    const setEl = host().querySelector('mat-chip-set') as HTMLElement;
    expect(host().getAttribute('id')).toBeNull();
    expect(setEl.id).toBe('tags-set');
    expect(setEl.getAttribute('data-testid')).toBe('tags');
    expect(setEl.getAttribute('aria-label')).toBe('Tags');
    expect(host().querySelectorAll('mat-chip')).toHaveLength(2);
    expect(host().querySelector('img[matChipAvatar]')).toBeTruthy();
    expect(host().querySelectorAll('button[matChipRemove]')).toHaveLength(2);
  });

  it('updates chips immutably across add, edit, remove and drag-drop', () => {
    const initial = [...SAMPLE_CHIPS];
    const addedSpy = vi.fn();
    const removedSpy = vi.fn();
    const editedSpy = vi.fn();
    const reorderSpy = vi.fn();
    fixture.componentInstance.chipAdded.subscribe(addedSpy);
    fixture.componentInstance.chipRemoved.subscribe(removedSpy);
    fixture.componentInstance.chipEdited.subscribe(editedSpy);
    fixture.componentInstance.chipReordered.subscribe(reorderSpy);

    setInputs({ chips: initial, variant: 'input', removable: true, editable: true });

    const clear = vi.fn();
    fixture.componentInstance.addChip({
      value: '  Signals ',
      chipInput: { clear },
    } as never);
    expect(clear).toHaveBeenCalledTimes(1);
    expect(addedSpy).toHaveBeenCalledWith({ label: 'Signals' });
    expect(initial).toHaveLength(2);
    expect(fixture.componentInstance.chips()).toHaveLength(3);

    fixture.componentInstance.editChip(0, { value: 'Angular 22' } as never);
    expect(editedSpy).toHaveBeenCalledWith({ id: 'ng', label: 'Angular 22' });
    expect(initial[0].label).toBe('Angular');
    expect(fixture.componentInstance.chips()[0].label).toBe('Angular 22');

    fixture.componentInstance.onDrop({
      previousIndex: 0,
      currentIndex: 2,
    } as CdkDragDrop<readonly ChipItem[]>);
    expect(reorderSpy).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.chips()[2].label).toBe('Angular 22');

    fixture.componentInstance.editChip(0, { value: '   ' } as never);
    expect(removedSpy).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.chips()).toHaveLength(2);
  });

  it('supports selectable stacked mode and selectionChanged output', () => {
    const selectSpy = vi.fn();
    fixture.componentInstance.selectionChanged.subscribe(selectSpy);
    setInputs({
      variant: 'selectable',
      orientation: 'vertical',
      multiple: true,
      chips: SAMPLE_CHIPS,
    });

    const listbox = host().querySelector('mat-chip-listbox') as HTMLElement;
    expect(listbox.classList).toContain('mat-mdc-chip-set-stacked');
    const options = host().querySelectorAll('mat-chip-option button, mat-chip-option');
    expect(options.length).toBeGreaterThan(0);

    const opt = host().querySelector('mat-chip-option .mdc-evolution-chip__action--primary') as HTMLElement;
    opt.click();
    fixture.detectChanges();
    expect(selectSpy).toHaveBeenCalledWith({
      chip: { id: 'ng', label: 'Angular', selected: true },
      selected: true,
    });
  });

  it('renders draggable variant with cdkDropList and cdkDrag', () => {
    setInputs({ variant: 'draggable', chips: SAMPLE_CHIPS });
    expect(host().querySelector('[cdkDropList]')).toBeTruthy();
    expect(host().querySelectorAll('[cdkDrag]')).toHaveLength(2);
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
