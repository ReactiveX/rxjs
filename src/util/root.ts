declare let global: NodeJS.Global;

declare module NodeJS {
  interface Global {
    window: any;
    global: any;
  }
}

/**
 * window: browser in DOM main thread
 * self: browser in WebWorker
 * global: Node.js/other
 */
export let root: any;
if (typeof window == 'object' && window.window === window) {
  root = window;
} else if (typeof self == 'object' && self.self === self) {
  root = self;
} else if (typeof global == 'object' && global.global === global) {
  root = global;
} else {
  // Workaround Closure Compiler restriction: The body of a goog.module cannot use throw.
  // This is needed when used with angular/tsickle which inserts a goog.module statement.
  // Wrap in IIFE
  (function () {
    throw new Error('RxJS could not find any global context (window, self, global)');
  })();
}
