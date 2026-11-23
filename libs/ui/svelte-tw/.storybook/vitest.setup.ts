import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/svelte-vite';
import { vis } from 'storybook-addon-vis/vitest-setup';
import * as projectAnnotations from './preview';

setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);

if (typeof document !== 'undefined') {
  const styleId = 'magic-vis-disable-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

vis.setup({
  animations: 'disabled',
  auto: async () => {
    if (typeof document !== 'undefined' && 'fonts' in document) {
      await document.fonts.ready;
    }
  },
});
