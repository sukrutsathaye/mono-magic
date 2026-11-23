import { signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicRatingComponent } from './rating.component';

/**
 * `MagicRatingComponent` provides interactive star/icon ratings supporting
 * full-star (`precision = 1`) and half-star (`precision = 0.5`) increments,
 * keyboard navigation (`ArrowLeft`/`ArrowRight`/`Home`/`End`), live numeric
 * value & reviewCount display, `readOnly` / `disabled` modes, and custom `max`
 * & icon glyphs.
 *
 * - **References**:
 *   - [WAI-ARIA Slider Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)
 */
const meta: Meta<MagicRatingComponent> = {
  title: 'Molecules/Rating',
  component: MagicRatingComponent,
  args: {
    defaultValue: 4,
    max: 5,
    precision: 1,
    readOnly: false,
    disabled: false,
    showValue: true,
    reviewCount: 128,
    icon: 'star',
    emptyIcon: 'star_border',
    color: 'warning',
    size: 'md',
    label: 'Overall rating',
    valueChange: fn(),
  },
  argTypes: {
    value: { control: 'number', table: { category: 'Value' } },
    defaultValue: { control: 'number', table: { category: 'Value' } },
    max: { control: 'number', table: { category: 'Configuration' } },
    precision: {
      control: 'select',
      options: [0.5, 1],
      table: { category: 'Configuration' },
    },
    readOnly: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    showValue: { control: 'boolean', table: { category: 'Display' } },
    reviewCount: { control: 'number', table: { category: 'Display' } },
    icon: { control: 'text', table: { category: 'Appearance' } },
    emptyIcon: { control: 'text', table: { category: 'Appearance' } },
    label: { control: 'text', table: { category: 'Content' } },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'tertiary',
        'success',
        'warning',
        'error',
        'neutral',
      ],
      table: { category: 'Appearance' },
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: { category: 'Appearance' },
    },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    valueChange: { action: 'valueChange', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<MagicRatingComponent>;

/**
 * Interactive full-star rating updating live value and review count.
 */
export const InteractiveFullStar: Story = {
  render: (args) => {
    const rating = signal(3);
    const reviews = signal(42);

    return {
      props: {
        ...args,
        rating,
        reviews,
        onRate(next: number) {
          rating.set(next);
          reviews.update((count) => count + 1);
          args.valueChange?.(next);
        },
      },
      template: `
        <div style="display: grid; gap: 8px;">
          <magic-rating
            label="Rate this component"
            [value]="rating()"
            [max]="max"
            [precision]="1"
            [showValue]="true"
            [reviewCount]="reviews()"
            [color]="color"
            [size]="size"
            testId="full-rating"
            (valueChange)="onRate($event)"
          />
          <p data-testid="rating-readout" style="margin: 0; font-size: 0.875rem;">
            Live rating: {{ rating() }} / {{ max }} ({{ reviews() }} reviews)
          </p>
        </div>
      `,
    };
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('full-rating-star-5'));
    await expect(args.valueChange).toHaveBeenCalledWith(5);
    await expect(canvas.getByTestId('rating-readout')).toHaveTextContent(
      'Live rating: 5 / 5 (43 reviews)',
    );
  },
};

/**
 * Interactive half-star rating (`precision = 0.5`) supporting keyboard ArrowRight/ArrowLeft increments.
 */
export const HalfPrecisionInteractive: Story = {
  render: (args) => {
    const rating = signal(3.5);

    return {
      props: {
        ...args,
        rating,
        onRate(next: number) {
          rating.set(next);
          args.valueChange?.(next);
        },
      },
      template: `
        <magic-rating
          label="Half-star precision"
          [value]="rating()"
          [precision]="0.5"
          [showValue]="true"
          [reviewCount]="128"
          color="warning"
          size="lg"
          testId="half-rating"
          (valueChange)="onRate($event)"
        />
      `,
    };
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider');
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(args.valueChange).toHaveBeenCalledWith(4);
    await expect(canvas.getByTestId('half-rating-value')).toHaveTextContent(
      '4.0',
    );
  },
};

/**
 * Comparison of readOnly, disabled, custom max (10), heart icons, colors, and sizes.
 */
export const ReadOnlyDisabledCustomAndSizes: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 12px;">
        <magic-rating label="Read-only (4.5)" [defaultValue]="4.5" [precision]="0.5" [readOnly]="true" [showValue]="true" [reviewCount]="312" />
        <magic-rating label="Disabled (2)" [defaultValue]="2" [disabled]="true" [showValue]="true" />
        <magic-rating label="Hearts (5/5)" [defaultValue]="4" icon="favorite" emptyIcon="favorite_border" color="error" [showValue]="true" />
        <magic-rating label="10-point scale" [defaultValue]="7" [max]="10" color="primary" [showValue]="true" />
        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
          <magic-rating [defaultValue]="4" size="xs" />
          <magic-rating [defaultValue]="4" size="sm" />
          <magic-rating [defaultValue]="4" size="md" />
          <magic-rating [defaultValue]="4" size="lg" />
          <magic-rating [defaultValue]="4" size="xl" />
        </div>
      </div>
    `,
  }),
};
