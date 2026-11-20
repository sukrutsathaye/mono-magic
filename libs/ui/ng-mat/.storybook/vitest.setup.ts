import '@angular/compiler';
import { vis } from 'storybook-addon-vis/vitest-setup';

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
        fontLink.addEventListener('load', () => resolve(), { once: true });
        fontLink.addEventListener('error', () => resolve(), { once: true });
      });
    }
    if ('fonts' in document) {
      await document.fonts.load('24px "Material Icons"').catch(() => undefined);
      await document.fonts.ready;
    }
  },
});
