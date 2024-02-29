import { Observable } from './observable.js';

// get the global variable so we can polyfill Observable on it
// the environment may be a web worker, Node.js, or a browser
// we need to use the correct global context

const _globalThis = typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : global;

// @ts-expect-error we're adding a property to the global object here
if (typeof _globalThis.Observable !== 'function') {
  // @ts-expect-error we're adding a property to the global object here
  _globalThis.Observable = Observable;
}
