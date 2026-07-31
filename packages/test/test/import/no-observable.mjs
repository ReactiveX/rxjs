import assert from 'node:assert/strict';

Reflect.deleteProperty(globalThis, 'Observable');
Reflect.deleteProperty(globalThis, 'Subscriber');

const { rxTest } = await import('@rxjs/test');

assert.equal(typeof globalThis.Observable, 'function');
assert.equal(typeof globalThis.Subscriber, 'function');
await rxTest(({ cold, expectObservable }) => {
  expectObservable(cold('a|')).toBe('a|');
});
