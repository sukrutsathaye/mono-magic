import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ThemePreview from './ThemePreview.svelte';

const meta: Meta<typeof ThemePreview> = {
  title: 'Foundation/ThemePalette',
  component: ThemePreview,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllIntents: Story = {};
