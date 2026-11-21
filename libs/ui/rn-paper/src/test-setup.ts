import Module from 'node:module';

const require = Module.createRequire(import.meta.url);
const reactNativeWebPath = require.resolve('react-native-web');

type ResolveFilenameFn = (
  request: string,
  parent: unknown,
  isMain: boolean,
  options?: unknown
) => string;

const mod = Module as unknown as { _resolveFilename: ResolveFilenameFn };
const originalResolveFilename = mod._resolveFilename;

mod._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'react-native') {
    return reactNativeWebPath;
  }
  if (request.startsWith('@expo/vector-icons')) {
    const err = new Error(
      `Cannot find module '${request}'`
    ) as NodeJS.ErrnoException;
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

// jsdom layout polyfills so React Native Paper Menu & Tooltip anchor measurements
// resolve with non-zero bounds in unit tests without affecting real browsers.
if (typeof window !== 'undefined' && typeof HTMLElement !== 'undefined') {
  const originalGetBoundingClientRect =
    HTMLElement.prototype.getBoundingClientRect;

  HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
    const rect = originalGetBoundingClientRect.call(this);
    if (rect.width === 0 && rect.height === 0) {
      const fallback = {
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        width: 120,
        height: 40,
        right: 120,
        bottom: 40,
      };
      return {
        ...fallback,
        toJSON: () => fallback,
      } as DOMRect;
    }
    return rect;
  };

  if (typeof window.matchMedia !== 'function') {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }),
    });
  }

  if (typeof globalThis.ResizeObserver === 'undefined') {
    class JsdomResizeObserver {
      observe(): void {
        // no-op in jsdom
      }

      unobserve(): void {
        // no-op in jsdom
      }

      disconnect(): void {
        // no-op in jsdom
      }
    }

    globalThis.ResizeObserver =
      JsdomResizeObserver as unknown as typeof ResizeObserver;
  }
}
