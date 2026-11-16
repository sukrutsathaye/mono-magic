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
