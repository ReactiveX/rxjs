/**
 * @prettier
 */

/**
 * The global root we can use, given different runtimes
 */
export const root: (typeof globalThis | Window & typeof globalThis | NodeJS.Global) = (() => {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }
  if (typeof self !== 'undefined') {
    return self;
  }
  if (typeof global !== 'undefined') {
    return global;
  }
  throw new Error(
    'RxJS is unable to find global context (globalThis, self, global)'
  );
})();
