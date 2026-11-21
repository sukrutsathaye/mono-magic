import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/react-vite';
import { vis } from 'storybook-addon-vis/vitest-setup';
import projectAnnotations from './preview';

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

function withTimeout(promise: Promise<unknown>, timeoutMs: number): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise.then(() => undefined).catch(() => undefined),
    new Promise<void>((resolve) => {
      timer = setTimeout(resolve, timeoutMs);
    }),
  ]).finally(() => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  });
}

vis.setup({
  animations: 'disabled',
  auto: async () => {
    if (typeof document === 'undefined') {
      return;
    }
    const fontLink = document.getElementById(
      'magic-material-icons-font'
    ) as HTMLLinkElement | null;
    if (fontLink && !fontLink.sheet) {
      await withTimeout(
        new Promise<void>((resolve) => {
          fontLink.addEventListener('load', () => resolve(), { once: true });
          fontLink.addEventListener('error', () => resolve(), { once: true });
        }),
        1500
      );
    }
    if ('fonts' in document) {
      await withTimeout(document.fonts.load('24px "Material Icons"'), 1500);
      await withTimeout(document.fonts.ready, 1500);
    }
  },
});
