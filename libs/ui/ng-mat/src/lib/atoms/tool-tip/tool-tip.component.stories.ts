import {
  argsToTemplate,
  moduleMetadata,
  type Meta,
  type StoryObj,
} from '@storybook/angular';
import { expect, userEvent, within } from 'storybook/test';
import { MagicButtonComponent } from '../button/button.component';
import { MagicToolTipComponent } from './tool-tip.component';

/**
 * `MagicToolTipComponent` wraps Material's `matTooltip` around projected
 * trigger content (`<magic-button>`, icons, text) with `label` fallback.
 *
 * - **References**:
 *   - [Angular Material Tooltip](https://material.angular.dev/components/tooltip/overview)
 *   - [Material 3 Tooltips](https://m3.material.io/components/tooltips/overview)
 */
const meta: Meta<MagicToolTipComponent> = {
  title: 'Atoms/ToolTip',
  component: MagicToolTipComponent,
  decorators: [
    moduleMetadata({
      imports: [MagicButtonComponent],
    }),
  ],
  args: {
    message: 'Save changes to workspace',
    label: 'Hover for tooltip',
    position: 'below',
    showDelay: 0,
    hideDelay: 0,
    disabled: false,
    touchGestures: 'auto',
  },
  argTypes: {
    message: { control: 'text', table: { category: 'Content' } },
    label: { control: 'text', table: { category: 'Content' } },
    position: {
      control: 'select',
      options: ['above', 'below', 'left', 'right', 'before', 'after'],
      table: { category: 'Appearance' },
    },
    showDelay: { control: 'number', table: { category: 'Timing' } },
    hideDelay: { control: 'number', table: { category: 'Timing' } },
    disabled: { control: 'boolean', table: { category: 'State' } },
    touchGestures: {
      control: 'select',
      options: ['auto', 'on', 'off'],
      table: { category: 'Behavior' },
    },
  },
};

export default meta;
type Story = StoryObj<MagicToolTipComponent>;

/**
 * Default tooltip anchored below a projected `<magic-button>` trigger.
 *
 * Inputs: `message="Save changes to workspace"`, `position="below"`, `showDelay=0`, `hideDelay=0`, projected `<magic-button>`.
 */
export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 32px; display: flex; justify-content: center;">
        <magic-tool-tip ${argsToTemplate(args)}>
          <magic-button variant="outlined" label="Hover me" />
        </magic-tool-tip>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: 'Hover me' });
    await userEvent.hover(btn);
    await expect(btn).toBeInTheDocument();
  },
};

/**
 * Comparison of directional tooltip placement options around triggers.
 *
 * Inputs: `position="above" | "below" | "left" | "right"`, `message` matching each placement.
 */
export const Positions: Story = {
  render: () => ({
    template: `
      <div style="padding: 48px; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
        <magic-tool-tip position="above" message="Above"><magic-button variant="tonal" label="Above" /></magic-tool-tip>
        <magic-tool-tip position="below" message="Below"><magic-button variant="tonal" label="Below" /></magic-tool-tip>
        <magic-tool-tip position="left" message="Left"><magic-button variant="tonal" label="Left" /></magic-tool-tip>
        <magic-tool-tip position="right" message="Right"><magic-button variant="tonal" label="Right" /></magic-tool-tip>
      </div>
    `,
  }),
};

/**
 * Suppressed tooltip state using `label` fallback content that will not open on hover.
 *
 * Inputs: `disabled=true`, `label="Hover for tooltip"`, `message="Save changes to workspace"`.
 */
export const Disabled: Story = {
  args: { disabled: true },
};
