import assert from 'node:assert/strict';
import { getObservablePolyfillInfo, observablePolyfillInfo } from '@rxjs/observable-polyfill';

assert.equal(typeof globalThis.Observable, 'function');
assert.equal(typeof globalThis.Subscriber, 'function');
assert.equal(typeof EventTarget.prototype.when, 'function');

const info = getObservablePolyfillInfo();
assert.deepEqual(info, {
  packageName: '@rxjs/observable-polyfill',
  version: '8.0.0-alpha.14',
});
assert.ok(Object.isFrozen(info));
assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis.Observable, observablePolyfillInfo), {
  configurable: false,
  enumerable: false,
  value: info,
  writable: false,
});
