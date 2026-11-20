import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  computed,
  contentChildren,
  input,
  output,
} from '@angular/core';
import {
  MatCard,
  MatCardActions,
  MatCardAvatar,
  MatCardContent,
  MatCardFooter,
  MatCardHeader,
  MatCardImage,
  MatCardSubtitle,
  MatCardTitle,
} from '@angular/material/card';
import type {
  CardActionItem,
  CardAppearance,
  CardImageSize,
  CardMoleculeProps,
  CardVariant,
  ChipItem,
} from '@mono-magic/atomic-design-interfaces';
import { MagicButtonComponent } from '../../atoms/button/button.component';
import { MagicChipComponent } from '../../atoms/chip/chip.component';
import type { SignalProps } from '../../core/signal-props';

export type { CardActionItem };

/** Projects custom header content into `<magic-card>`. */
@Directive({
  selector: '[magicCardHeader]',
})
export class MagicCardHeaderDirective {}

/** Projects custom action buttons into `<magic-card>`'s `mat-card-actions`. */
@Directive({
  selector: '[magicCardActions]',
})
export class MagicCardActionsDirective {}

/** Projects custom footer content into `<magic-card>`'s `mat-card-footer`. */
@Directive({
  selector: '[magicCardFooter]',
})
export class MagicCardFooterDirective {}

/**
 * A flexible card container composing `mat-card` sections (`header`, `media`,
 * `content`, `actions`, `footer`) with `magic-button` and `magic-chip`.
 *
 * Supports outlined and raised Material 3 appearances, configurable image
 * sizes, `--card-width` sizing, and both data-driven inputs (`actions`, `chips`)
 * and content-projected slots (`[magicCardHeader]`, default body,
 * `[magicCardActions]`, `[magicCardFooter]`).
 *
 * @see https://material.angular.dev/components/card/overview
 */
@Component({
  selector: 'magic-card',
  imports: [
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatCardAvatar,
    MatCardImage,
    MatCardContent,
    MatCardActions,
    MatCardFooter,
    MagicButtonComponent,
    MagicChipComponent,
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.id]': 'null',
    '[style.--card-width]': 'width() || null',
  },
})
export class MagicCardComponent implements SignalProps<CardMoleculeProps> {
  /** Id applied to the inner `mat-card` (removed from host). */
  readonly id = input<string>();
  /** Rendered as `data-testid` on the inner `mat-card`. */
  readonly testId = input<string>();
  /** Accessible name applied to the card region (`aria-label`). */
  readonly ariaLabel = input<string>();
  /** Heading rendered inside `<mat-card-title>`. */
  readonly title = input<string>();
  /** Subheading rendered inside `<mat-card-subtitle>`. */
  readonly subtitle = input<string>();
  /** Body paragraph rendered inside `<mat-card-content>` alongside projected content. */
  readonly content = input<string>();
  /** Optional header avatar image URL. */
  readonly avatarSrc = input<string>();
  /** Alt text for the header avatar image. */
  readonly avatarAlt = input('');
  /** Primary card media image URL. */
  readonly imageSrc = input<string>();
  /** Alt text for the card media image. */
  readonly imageAlt = input('');
  /** Media image size preset (`small`..`full`). */
  readonly imageSize = input<CardImageSize>('medium');
  /** Material card elevation/border style (`'outlined'` or `'raised'`). */
  readonly appearance = input<CardAppearance>('raised');
  /** Visual variant controlling default actions/chips layout (`'basic'`, `'with-actions'`, `'with-chips'`). */
  readonly variant = input<CardVariant>('basic');
  /** CSS width value bound to `--card-width` on the host element (e.g. `'360px'`). */
  readonly width = input<string>();
  /** Action buttons rendered inside `<mat-card-actions>`. */
  readonly actions = input<readonly CardActionItem[]>([]);
  /** Status or category chips rendered inside `<mat-card-footer>`. */
  readonly chips = input<readonly ChipItem[]>([]);
  /** Horizontal alignment for card actions (`'start'` or `'end'`). */
  readonly alignActions = input<'start' | 'end'>('start');

  /** Emits the clicked `CardActionItem` when a data-driven action button is activated. */
  readonly actionClicked = output<CardActionItem>();

  private readonly projectedHeaders = contentChildren(
    MagicCardHeaderDirective,
    { descendants: true },
  );
  private readonly projectedActions = contentChildren(
    MagicCardActionsDirective,
    { descendants: true },
  );
  private readonly projectedFooters = contentChildren(
    MagicCardFooterDirective,
    { descendants: true },
  );

  protected readonly hasHeader = computed(
    () =>
      Boolean(this.title() || this.subtitle() || this.avatarSrc()) &&
      this.projectedHeaders().length === 0,
  );

  protected readonly showActions = computed(
    () =>
      this.actions().length > 0 ||
      this.variant() === 'with-actions' ||
      this.projectedActions().length > 0,
  );

  protected readonly showFooter = computed(
    () =>
      this.chips().length > 0 ||
      this.variant() === 'with-chips' ||
      this.projectedFooters().length > 0,
  );

  protected onActionClick(action: CardActionItem): void {
    if (!action.disabled) {
      this.actionClicked.emit(action);
    }
  }
}
