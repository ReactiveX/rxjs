const assert = require('node:assert/strict');
const { getObservablePolyfillInfo, observablePolyfillInfo } = require('@rxjs/observable-polyfill');

assert.equal(typeof globalThis.Observable, 'function');
assert.equal(typeof globalThis.Subscriber, 'function');
assert.equal(typeof EventTarget.prototype.when, 'function');

const info = getObservablePolyfillInfo();
assert.deepEqual(info, {
  packageName: '@rxjs/observable-polyfill',
  version: '9.0.0-beta.0',
});
assert.ok(Object.isFrozen(info));
assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis.Observable, observablePolyfillInfo), {
  configurable: false,
  enumerable: false,
  value: info,
  writable: false,
});
