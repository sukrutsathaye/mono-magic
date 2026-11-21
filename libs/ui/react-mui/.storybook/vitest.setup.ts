import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/react-vite';
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
    if (typeof document === 'undefined') {
      return;
    }
    const fontLink = document.getElementById(
      'magic-material-icons-font',
    ) as HTMLLinkElement | null;
    if (fontLink && !fontLink.sheet) {
      await new Promise<void>((resolve) => {
        const timer = window.setTimeout(() => resolve(), 3000);
        const done = () => {
          window.clearTimeout(timer);
          resolve();
        };
        fontLink.addEventListener('load', done, { once: true });
        fontLink.addEventListener('error', done, { once: true });
      });
    }
    if ('fonts' in document) {
      await document.fonts.load('24px "Material Icons"').catch(() => undefined);
      await document.fonts.ready;
    }
  },
});
