import assert from 'node:assert/strict';

Reflect.deleteProperty(globalThis, 'Observable');
Reflect.deleteProperty(globalThis, 'Subscriber');

const { rxTest } = await import('@rxjs/test');

assert.equal(globalThis.Observable, undefined);
assert.equal(globalThis.Subscriber, undefined);
await assert.rejects(
  rxTest(() => {}),
  /@rxjs\/test requires the active realm to initialize the platform Observable before rxTest is called/
);
