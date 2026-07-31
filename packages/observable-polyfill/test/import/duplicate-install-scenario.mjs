import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const order = process.argv[2];
assert.ok(order === 'esm-first' || order === 'commonjs-first', `Unknown duplicate-install order: ${order}`);

Reflect.deleteProperty(globalThis, 'Observable');
Reflect.deleteProperty(globalThis, 'Subscriber');
Reflect.deleteProperty(EventTarget.prototype, 'when');

const require = createRequire(import.meta.url);
const loadEsm = () => import('@rxjs/observable-polyfill');
const loadCommonJs = () => Promise.resolve(require('@rxjs/observable-polyfill'));
const [loadFirst, loadSecond] = order === 'esm-first' ? [loadEsm, loadCommonJs] : [loadCommonJs, loadEsm];

const firstModule = await loadFirst();
const firstIdentities = {
  abort: AbortController.prototype.abort,
  observable: globalThis.Observable,
  subscriber: globalThis.Subscriber,
  when: EventTarget.prototype.when,
};
const firstInfo = firstModule.getObservablePolyfillInfo();
assert.equal(typeof firstIdentities.observable, 'function');
assert.equal(typeof firstIdentities.subscriber, 'function');
assert.equal(typeof firstIdentities.when, 'function');
assert.equal(typeof firstIdentities.abort, 'function');
assert.equal(firstInfo?.packageName, '@rxjs/observable-polyfill');
assert.equal(Object.isFrozen(firstInfo), true);

const secondModule = await loadSecond();

assert.equal(globalThis.Observable, firstIdentities.observable);
assert.equal(globalThis.Subscriber, firstIdentities.subscriber);
assert.equal(EventTarget.prototype.when, firstIdentities.when);
assert.equal(AbortController.prototype.abort, firstIdentities.abort);
assert.equal(secondModule.getObservablePolyfillInfo(), firstInfo);
assert.equal(globalThis.Observable[Symbol.for('rxjs.observable.polyfill.info.v1')], firstInfo);
