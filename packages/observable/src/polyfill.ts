import { Observable } from './observable.js';

// get the global variable so we can polyfill Observable on it
// the environment may be a web worker, Node.js, or a browser
// we need to use the correct global context

// @ts-ignore
const _globalThis = typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : global;

// @ts-ignore
if (typeof _globalThis.Observable !== 'function') {
  // @ts-ignore
  _globalThis.Observable = Observable;
}
