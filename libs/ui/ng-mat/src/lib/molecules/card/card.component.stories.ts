import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import {
  MagicCardActionsDirective,
  MagicCardComponent,
  MagicCardFooterDirective,
  MagicCardHeaderDirective,
} from './card.component';

const SAMPLE_MEDIA =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%236750a4"/><stop offset="100%25" stop-color="%237d5260"/></linearGradient></defs><rect width="640" height="360" fill="url(%23g)"/></svg>';

const SAMPLE_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="%23381e72"/></svg>';

/**
 * `MagicCardComponent` wraps `mat-card` with unified header, media, body,
 * action buttons (`magic-button`), and footer chips (`magic-chip`), plus
 * typed content-projection directives.
 *
 * - **References**:
 *   - [Angular Material Card](https://material.angular.dev/components/card/overview)
 *   - [Material 3 Cards](https://m3.material.io/components/cards/overview)
 */
const meta: Meta<MagicCardComponent> = {
  title: 'Molecules/Card',
  component: MagicCardComponent,
  args: {
    title: 'Design System Kit',
    subtitle: 'Material 3 · Angular 22',
    content:
      'Compose accessible molecules and organisms from atomic signal-first primitives.',
    appearance: 'raised',
    variant: 'basic',
    imageSize: 'full',
    width: '380px',
    alignActions: 'start',
    actions: [],
    chips: [],
    actionClicked: fn(),
  },
  argTypes: {
    title: { control: 'text', table: { category: 'Content' } },
    subtitle: { control: 'text', table: { category: 'Content' } },
    content: { control: 'text', table: { category: 'Content' } },
    avatarSrc: { control: 'text', table: { category: 'Media' } },
    avatarAlt: { control: 'text', table: { category: 'Media' } },
    imageSrc: { control: 'text', table: { category: 'Media' } },
    imageAlt: { control: 'text', table: { category: 'Media' } },
    imageSize: {
      control: 'select',
      options: ['small', 'medium', 'large', 'extra-large', 'full'],
      table: { category: 'Media' },
    },
    appearance: {
      control: 'select',
      options: ['raised', 'outlined'],
      table: { category: 'Appearance' },
    },
    variant: {
      control: 'select',
      options: ['basic', 'with-actions', 'with-chips'],
      table: { category: 'Appearance' },
    },
    width: { control: 'text', table: { category: 'Layout' } },
    alignActions: {
      control: 'select',
      options: ['start', 'end'],
      table: { category: 'Actions' },
    },
    actions: { control: 'object', table: { category: 'Actions' } },
    chips: { control: 'object', table: { category: 'Footer' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    actionClicked: { action: 'actionClicked', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<MagicCardComponent>;

/**
 * Basic raised card featuring an avatar, title, subtitle, full-bleed media, and body copy.
 *
 * Inputs: `appearance="raised"`, `variant="basic"`, `imageSize="full"`, `avatarSrc`, `imageSrc`, `title`, `subtitle`, `content`.
 */
export const Basic: Story = {
  args: {
    avatarSrc: SAMPLE_AVATAR,
    avatarAlt: 'Kit emblem',
    imageSrc: SAMPLE_MEDIA,
    imageAlt: 'Gradient showcase artwork',
  },
};

/**
 * Card with media and end-aligned action buttons emitting `actionClicked`.
 *
 * Inputs: `variant="with-actions"`, `alignActions="end"`, `imageSrc`, `actions` (Preview, Install).
 */
export const WithActions: Story = {
  args: {
    variant: 'with-actions',
    imageSrc: SAMPLE_MEDIA,
    imageAlt: 'Card artwork',
    alignActions: 'end',
    actions: [
      { id: 'preview', label: 'Preview', variant: 'outlined' },
      { id: 'install', label: 'Install', variant: 'filled', color: 'primary', icon: 'download' },
    ],
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Install' }));
    await expect(args.actionClicked).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'install' }),
    );
  },
};

/**
 * Card displaying metadata chips in the footer region.
 *
 * Inputs: `variant="with-chips"`, `chips` (Atomic Design, Signal Forms, WCAG AA).
 */
export const WithChips: Story = {
  args: {
    variant: 'with-chips',
    chips: [
      { id: 'atomic', label: 'Atomic Design' },
      { id: 'signals', label: 'Signal Forms' },
      { id: 'a11y', label: 'WCAG AA' },
    ],
  },
};

/**
 * Outlined card variant with a single text action button.
 *
 * Inputs: `appearance="outlined"`, `variant="with-actions"`, `actions` (Learn more).
 */
export const Outlined: Story = {
  args: {
    appearance: 'outlined',
    variant: 'with-actions',
    actions: [{ id: 'learn-more', label: 'Learn more', variant: 'text' }],
  },
};

/**
 * Responsive grid comparing Material card thumbnail image sizes.
 *
 * Inputs: `imageSize="small" | "medium" | "large" | "extra-large"`, `imageSrc`.
 */
export const ImageSizes: Story = {
  render: (args) => ({
    props: { ...args, sampleMedia: SAMPLE_MEDIA },
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
        <magic-card title="Small" imageSize="small" [imageSrc]="sampleMedia" imageAlt="Small" />
        <magic-card title="Medium" imageSize="medium" [imageSrc]="sampleMedia" imageAlt="Medium" />
        <magic-card title="Large" imageSize="large" [imageSrc]="sampleMedia" imageAlt="Large" />
        <magic-card title="Extra Large" imageSize="extra-large" [imageSrc]="sampleMedia" imageAlt="Extra Large" />
      </div>
    `,
  }),
};

/**
 * Custom slot composition using `[magicCardHeader]`, default body, `[magicCardActions]`, and `[magicCardFooter]` directives.
 *
 * Inputs: `width="380px"`, `appearance="outlined"`, projected slot directives.
 */
export const ProjectedSlots: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [
        MagicCardHeaderDirective,
        MagicCardActionsDirective,
        MagicCardFooterDirective,
      ],
    },
    template: `
      <magic-card width="380px" appearance="outlined">
        <div magicCardHeader style="padding: 16px 16px 0; font-weight: 600;">
          Custom Projected Header
        </div>
        <p style="margin: 8px 0 0;">Arbitrary body markup projected directly inside the card.</p>
        <div magicCardActions>
          <span style="font-size: 0.875rem; opacity: 0.75;">Updated today</span>
        </div>
        <div magicCardFooter style="font-size: 0.75rem;">Projected footer slot</div>
      </magic-card>
    `,
  }),
};
