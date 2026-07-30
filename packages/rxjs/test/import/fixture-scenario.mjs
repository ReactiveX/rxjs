import assert from 'node:assert/strict';
import { Worker } from 'node:worker_threads';

const scenario = process.argv[2];

if (scenario === 'missing-global-subpath') {
  Reflect.deleteProperty(globalThis, 'Observable');
  Reflect.deleteProperty(globalThis, 'Subscriber');
  Reflect.deleteProperty(EventTarget.prototype, 'when');

  const { map } = await import('rxjs/map');
  const { getObservablePolyfillInfo } = await import('@rxjs/observable-polyfill');

  assert.equal(typeof globalThis.Observable, 'function');
  assert.equal(typeof globalThis.Subscriber, 'function');
  assert.equal(typeof globalThis.Observable.prototype[map], 'function');
  assert.deepEqual(
    Object.getOwnPropertySymbols(globalThis.Observable.prototype).map((symbol) => symbol.description),
    ['Symbol.toStringTag', 'rxjs.kernel.create.v1', 'map']
  );
  const info = getObservablePolyfillInfo();
  assert.deepEqual(info, {
    packageName: '@rxjs/observable-polyfill',
    version: '8.0.0-alpha.14',
  });
  assert.equal(Object.isFrozen(info), true);
  const markerDescriptor = Object.getOwnPropertyDescriptor(globalThis.Observable, Symbol.for('rxjs.observable.polyfill.info.v1'));
  assert.equal(markerDescriptor?.value, info);
  assert.deepEqual(
    {
      configurable: markerDescriptor?.configurable,
      enumerable: markerDescriptor?.enumerable,
      writable: markerDescriptor?.writable,
    },
    { configurable: false, enumerable: false, writable: false }
  );
} else if (scenario === 'root-core-only') {
  Reflect.deleteProperty(globalThis, 'Observable');
  Reflect.deleteProperty(globalThis, 'Subscriber');
  Reflect.deleteProperty(EventTarget.prototype, 'when');

  const root = await import('rxjs');
  const constructorDescriptions = Object.getOwnPropertySymbols(globalThis.Observable).map((symbol) => symbol.description);
  const prototypeDescriptions = Object.getOwnPropertySymbols(globalThis.Observable.prototype).map((symbol) => symbol.description);

  assert.equal(typeof root.Subject, 'function');
  assert.equal('map' in root, false);
  assert.equal('filter' in root, false);
  assert.deepEqual(constructorDescriptions, ['rxjs.observable.polyfill.info.v1', 'rxjs.kernel.create.v1']);
  assert.deepEqual(prototypeDescriptions, ['Symbol.toStringTag', 'rxjs.kernel.create.v1']);
} else if (scenario === 'foreign-constructor') {
  class ForeignObservable {}
  class ForeignSubscriber {}
  const foreignWhen = () => 'foreign';
  globalThis.Observable = ForeignObservable;
  globalThis.Subscriber = ForeignSubscriber;
  EventTarget.prototype.when = foreignWhen;

  const { getObservablePolyfillInfo } = await import('@rxjs/observable-polyfill');

  assert.equal(globalThis.Observable, ForeignObservable);
  assert.equal(globalThis.Subscriber, ForeignSubscriber);
  assert.equal(EventTarget.prototype.when, foreignWhen);
  assert.equal(getObservablePolyfillInfo(), undefined);
} else if (scenario === 'earlier-version') {
  class EarlierObservable {}
  Reflect.deleteProperty(globalThis, 'Subscriber');
  const earlierInfo = Object.freeze({
    packageName: '@rxjs/observable-polyfill',
    version: '7.0.0-test',
  });
  Object.defineProperty(EarlierObservable, Symbol.for('rxjs.observable.polyfill.info.v1'), {
    configurable: false,
    enumerable: false,
    value: earlierInfo,
    writable: false,
  });
  globalThis.Observable = EarlierObservable;

  const { getObservablePolyfillInfo } = await import('@rxjs/observable-polyfill');

  assert.equal(globalThis.Observable, EarlierObservable);
  assert.equal(globalThis.Subscriber, undefined);
  assert.equal(getObservablePolyfillInfo(), earlierInfo);
} else if (scenario === 'event-target-when') {
  class ExistingObservable {
    constructor(init) {
      this.init = init;
    }
  }
  globalThis.Observable = ExistingObservable;
  Reflect.deleteProperty(EventTarget.prototype, 'when');

  await import('@rxjs/observable-polyfill');

  assert.equal(globalThis.Observable, ExistingObservable);
  assert.equal(typeof EventTarget.prototype.when, 'function');
  assert.ok(new EventTarget().when('event') instanceof ExistingObservable);
} else if (scenario === 'frozen-target') {
  Reflect.deleteProperty(globalThis, 'Observable');
  Reflect.deleteProperty(globalThis, 'Subscriber');
  Reflect.deleteProperty(EventTarget.prototype, 'when');
  const originalAbort = AbortController.prototype.abort;
  Object.preventExtensions(EventTarget.prototype);

  await assert.rejects(
    import('@rxjs/observable-polyfill'),
    /Cannot initialize @rxjs\/observable-polyfill: EventTarget\.prototype\.when is not writable or configurable/
  );
  assert.equal(globalThis.Observable, undefined);
  assert.equal(globalThis.Subscriber, undefined);
  assert.equal(AbortController.prototype.abort, originalAbort);
  assert.equal(EventTarget.prototype.when, undefined);
} else if (scenario === 'separate-realm') {
  class ParentObservable {}
  globalThis.Observable = ParentObservable;
  const parentSymbols = Object.getOwnPropertySymbols(ParentObservable.prototype);

  const workerResult = await new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./fixture-worker.mjs', import.meta.url), { type: 'module' });
    worker.once('message', resolve);
    worker.once('error', reject);
  });

  assert.deepEqual(workerResult, {
    hasMap: true,
    info: {
      packageName: '@rxjs/observable-polyfill',
      version: '8.0.0-alpha.14',
    },
  });
  assert.equal(globalThis.Observable, ParentObservable);
  assert.deepEqual(Object.getOwnPropertySymbols(ParentObservable.prototype), parentSymbols);
} else {
  throw new Error(`Unknown fixture scenario: ${scenario}`);
}
