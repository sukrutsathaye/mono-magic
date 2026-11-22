import { signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicButtonComponent } from '../../atoms/button/button.component';
import { MagicDialogComponent } from './dialog.component';

const renderStatefulDialog: Story['render'] = (args) => {
  const isOpen = signal(Boolean(args.open));

  return {
    props: {
      ...args,
      isOpen,
      handleOpen() {
        isOpen.set(true);
      },
      handleClosed() {
        isOpen.set(false);
        args.closed?.();
      },
      handleAction(action: unknown) {
        args.actionClicked?.(action as never);
        isOpen.set(false);
      },
    },
    template: `
      @if (!isOpen()) {
        <magic-button
          [label]="open ? 'Reopen Dialog' : 'Open Dialog'"
          [variant]="open ? 'tonal' : 'filled'"
          color="primary"
          leadingIcon="open_in_new"
          (clicked)="handleOpen()"
        />
      }
      <magic-dialog
        [open]="isOpen()"
        [title]="title"
        [subtitle]="subtitle"
        [content]="content"
        [size]="size"
        [dismissible]="dismissible"
        [closeOnBackdropClick]="closeOnBackdropClick"
        [closeOnEscape]="closeOnEscape"
        [showCloseButton]="showCloseButton"
        [scrollable]="scrollable"
        [actions]="actions"
        [alignActions]="alignActions"
        [id]="id"
        [testId]="testId"
        [ariaLabel]="ariaLabel"
        (closed)="handleClosed()"
        (actionClicked)="handleAction($event)"
      />
    `,
  };
};

/**
 * `MagicDialogComponent` composes Angular Material's `MatDialog` overlay
 * with `CdkTrapFocus`, M3 surface styling, responsive size presets (`sm`,
 * `md`, `lg`, `fullscreen`), dismissal controls, and `magic-button` actions.
 *
 * - **References**:
 *   - [Angular Material Dialog](https://material.angular.dev/components/dialog/overview)
 *   - [Material 3 Dialogs](https://m3.material.io/components/dialogs/overview)
 */
const meta: Meta<MagicDialogComponent> = {
  title: 'Molecules/Dialog',
  component: MagicDialogComponent,
  decorators: [
    moduleMetadata({
      imports: [MagicButtonComponent],
    }),
  ],
  args: {
    open: false,
    title: 'Publish changes?',
    subtitle: 'Workspace release v2.4.0',
    content:
      'All approved tokens and component baselines will be promoted to the release channel.',
    size: 'md',
    dismissible: true,
    closeOnBackdropClick: true,
    closeOnEscape: true,
    showCloseButton: true,
    scrollable: false,
    alignActions: 'end',
    actions: [
      { id: 'cancel', label: 'Cancel', variant: 'text', color: 'neutral' },
      {
        id: 'publish',
        label: 'Publish',
        variant: 'filled',
        color: 'primary',
        icon: 'rocket_launch',
      },
    ],
    closed: fn(),
    actionClicked: fn(),
  },
  argTypes: {
    open: { control: 'boolean', table: { category: 'State' } },
    title: { control: 'text', table: { category: 'Content' } },
    subtitle: { control: 'text', table: { category: 'Content' } },
    content: { control: 'text', table: { category: 'Content' } },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'fullscreen'],
      table: { category: 'Layout' },
    },
    dismissible: { control: 'boolean', table: { category: 'Behavior' } },
    closeOnBackdropClick: { control: 'boolean', table: { category: 'Behavior' } },
    closeOnEscape: { control: 'boolean', table: { category: 'Behavior' } },
    showCloseButton: { control: 'boolean', table: { category: 'Behavior' } },
    scrollable: { control: 'boolean', table: { category: 'Layout' } },
    alignActions: {
      control: 'select',
      options: ['start', 'end'],
      table: { category: 'Actions' },
    },
    actions: { control: 'object', table: { category: 'Actions' } },
    id: { control: 'text', table: { category: 'Accessibility' } },
    testId: { control: 'text', table: { category: 'Accessibility' } },
    ariaLabel: { control: 'text', table: { category: 'Accessibility' } },
    closed: { action: 'closed', table: { category: 'Events' } },
    actionClicked: { action: 'actionClicked', table: { category: 'Events' } },
  },
  render: renderStatefulDialog,
};

export default meta;
type Story = StoryObj<MagicDialogComponent>;

/**
 * Interactive trigger-driven dialog opening a modal overlay and verifying action emission + close.
 *
 * Inputs: `size="md"`, `dismissible=true`, `actions` (Cancel, Publish).
 */
export const InteractiveTrigger: Story = {
  args: {
    open: false,
    testId: 'story-dialog',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Open Dialog/i }));
    const doc = within(document.body);
    await expect(doc.getByText('Publish changes?')).toBeInTheDocument();
    await userEvent.click(doc.getByRole('button', { name: /Publish/i }));
    await expect(args.actionClicked).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'publish' }),
    );
  },
};

/**
 * Open modal dialog snapshot showcasing header, subtitle, body, and M3 action footer.
 *
 * Inputs: `open=true`, `size="md"`, `title`, `subtitle`, `content`, `actions`.
 */
export const OpenPreview: Story = {
  args: {
    open: true,
    testId: 'preview-dialog',
  },
};

/**
 * Scrollable dialog with long body content constrained inside the dialog body viewport.
 *
 * Inputs: `open=true`, `size="sm"`, `scrollable=true`.
 */
export const Scrollable: Story = {
  args: {
    open: true,
    size: 'sm',
    scrollable: true,
    title: 'Terms of Service',
    subtitle: 'Updated November 2026',
    content: Array.from(
      { length: 8 },
      (_, idx) =>
        `Section ${idx + 1}: Design system tokens and accessibility commitments apply across all supported Material 3 viewports.`,
    ).join('\n\n'),
  },
};

/**
 * Non-dismissible confirmation dialog hiding the close button and ignoring Escape/backdrop clicks.
 *
 * Inputs: `open=true`, `dismissible=false`, `showCloseButton=false`.
 */
export const NonDismissible: Story = {
  args: {
    open: true,
    dismissible: false,
    showCloseButton: false,
    title: 'Session expiring',
    subtitle: 'Action required',
    content: 'Choose whether to extend your session or sign out cleanly.',
    actions: [
      { id: 'signout', label: 'Sign out', variant: 'outlined', color: 'error' },
      { id: 'extend', label: 'Stay signed in', variant: 'filled', color: 'primary' },
    ],
  },
};
