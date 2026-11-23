import { signal } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { expect, fn, userEvent, within } from 'storybook/test';
import { MagicListItemComponent } from './list-item.component';

/**
 * `MagicListItemComponent` renders a Material 3 list row composing `MatList`,
 * `MatListItem`, `MagicAvatarComponent`, `MagicBadgeComponent`, `MatIcon`, and
 * `MatDivider`, with overline/primary/secondary text, leading icon/avatar,
 * trailing badge/text/icon, `interactive` / `selectable` toggle state, `dense`
 * density, and `standard` / `outlined` / `filled` appearances.
 *
 * - **References**:
 *   - [Angular Material List](https://material.angular.dev/components/list/overview)
 *   - [Material 3 Lists](https://m3.material.io/components/lists/overview)
 */
const meta: Meta<MagicListItemComponent> = {
  title: 'Molecules/ListItem',
  component: MagicListItemComponent,
  args: {
    primaryText: 'Design System Updates',
    secondaryText: 'New M3 tokens and polyglot molecule parity published',
    overlineText: 'Workspace',
    leadingIcon: 'palette',
    trailingText: '2m',
    trailingBadge: 4,
    trailingIcon: 'chevron_right',
    interactive: true,
    selectable: false,
    selected: false,
    disabled: false,
    divider: true,
    dense: false,
    color: 'primary',
    size: 'md',
    appearance: 'outlined',
    clicked: fn(),
    selectedChange: fn(),
  },
  argTypes: {
    primaryText: { control: 'text', table: { category: 'Content' } },
    secondaryText: { control: 'text', table: { category: 'Content' } },
    overlineText: { control: 'text', table: { category: 'Content' } },
    leadingIcon: { control: 'text', table: { category: 'Slots' } },
    leadingAvatarText: { control: 'text', table: { category: 'Slots' } },
    leadingAvatarSrc: { control: 'text', table: { category: 'Slots' } },
    trailingIcon: { control: 'text', table: { category: 'Slots' } },
    trailingText: { control: 'text', table: { category: 'Slots' } },
    trailingBadge: { control: 'text', table: { category: 'Slots' } },
    interactive: { control: 'boolean', table: { category: 'Behavior' } },
    selectable: { control: 'boolean', table: { category: 'Behavior' } },
    selected: { control: 'boolean', table: { category: 'State' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    divider: { control: 'boolean', table: { category: 'Appearance' } },
    dense: { control: 'boolean', table: { category: 'Appearance' } },
    appearance: {
      control: 'select',
      options: ['standard', 'outlined', 'filled'],
      table: { category: 'Appearance' },
    },
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
    clicked: { action: 'clicked', table: { category: 'Events' } },
    selectedChange: { action: 'selectedChange', table: { category: 'Events' } },
  },
};

export default meta;
type Story = StoryObj<MagicListItemComponent>;

/**
 * Default interactive outlined list item with overline, icon, trailing badge, and click play test.
 */
export const Default: Story = {
  args: {
    testId: 'default-list-item',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const item = canvas.getByTestId('default-list-item');
    await userEvent.click(item);
    await expect(args.clicked).toHaveBeenCalledTimes(1);
  },
};

/**
 * Stateful selectable inbox list where clicking rows toggles live selected state and unread count.
 */
export const InteractiveSelectableList: Story = {
  render: (args) => {
    const selectedIds = signal<ReadonlySet<string>>(new Set(['ada']));
    const items = [
      {
        id: 'ada',
        primary: 'Ada Lovelace',
        secondary: 'Shared the Wave 2 architecture spec',
        avatarText: 'AL',
        trailing: '10:24',
        badge: 2,
      },
      {
        id: 'alan',
        primary: 'Alan Turing',
        secondary: 'Requested review on token parity PR',
        avatarText: 'AT',
        trailing: '09:15',
        badge: 1,
      },
      {
        id: 'grace',
        primary: 'Grace Hopper',
        secondary: 'Archived deployment checklist (Disabled)',
        avatarText: 'GH',
        trailing: 'Yesterday',
        disabled: true,
      },
    ];

    return {
      props: {
        ...args,
        items,
        selectedIds,
        isSelected(id: string) {
          return selectedIds().has(id);
        },
        toggleItem(id: string, next: boolean) {
          const updated = new Set(selectedIds());
          if (next) {
            updated.add(id);
          } else {
            updated.delete(id);
          }
          selectedIds.set(updated);
          args.selectedChange?.(next);
        },
      },
      template: `
        <div style="max-width: 480px; display: grid; gap: 8px;">
          @for (item of items; track item.id) {
            <magic-list-item
              [primaryText]="item.primary"
              [secondaryText]="item.secondary"
              [leadingAvatarText]="item.avatarText"
              [trailingText]="item.trailing"
              [trailingBadge]="item.badge"
              [selectable]="true"
              [selected]="isSelected(item.id)"
              [disabled]="item.disabled ?? false"
              [appearance]="appearance"
              [color]="color"
              [size]="size"
              [dense]="dense"
              [testId]="'row-' + item.id"
              (selectedChange)="toggleItem(item.id, $event)"
            />
          }
          <p data-testid="selected-summary" style="margin: 4px 0 0; font-size: 0.875rem;">
            Selected count: {{ selectedIds().size }}
          </p>
        </div>
      `,
    };
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('selected-summary')).toHaveTextContent(
      'Selected count: 1',
    );
    await userEvent.click(canvas.getByTestId('row-alan'));
    await expect(args.selectedChange).toHaveBeenCalledWith(true);
    await expect(canvas.getByTestId('selected-summary')).toHaveTextContent(
      'Selected count: 2',
    );
    await userEvent.click(canvas.getByTestId('row-ada'));
    await expect(canvas.getByTestId('selected-summary')).toHaveTextContent(
      'Selected count: 1',
    );
  },
};

/**
 * Comparison of `standard`, `outlined`, and `filled` appearances plus `dense` and `disabled` rows.
 */
export const AppearancesAndDensity: Story = {
  render: () => ({
    template: `
      <div style="max-width: 460px; display: grid; gap: 12px;">
        <magic-list-item
          primaryText="Standard Appearance"
          secondaryText="Default hairline divider row"
          leadingIcon="inbox"
          appearance="standard"
          [divider]="true"
        />
        <magic-list-item
          primaryText="Outlined Appearance"
          secondaryText="M3 bordered surface card row"
          leadingIcon="layers"
          appearance="outlined"
          color="secondary"
        />
        <magic-list-item
          primaryText="Filled Dense Selected"
          secondaryText="Compact padding with active highlight"
          leadingIcon="check_circle"
          appearance="filled"
          color="success"
          [dense]="true"
          [selected]="true"
        />
        <magic-list-item
          primaryText="Disabled Item"
          secondaryText="Non-interactive muted row"
          leadingIcon="block"
          appearance="outlined"
          [interactive]="true"
          [disabled]="true"
        />
      </div>
    `,
  }),
};

/**
 * Size scale comparison across `xs`, `sm`, `md`, `lg`, and `xl`.
 */
export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="max-width: 420px; display: grid; gap: 8px;">
        <magic-list-item primaryText="Extra Small (xs)" leadingIcon="star" size="xs" appearance="outlined" />
        <magic-list-item primaryText="Small (sm)" leadingIcon="star" size="sm" appearance="outlined" />
        <magic-list-item primaryText="Medium (md)" leadingIcon="star" size="md" appearance="outlined" />
        <magic-list-item primaryText="Large (lg)" leadingIcon="star" size="lg" appearance="outlined" />
        <magic-list-item primaryText="Extra Large (xl)" leadingIcon="star" size="xl" appearance="outlined" />
      </div>
    `,
  }),
};
