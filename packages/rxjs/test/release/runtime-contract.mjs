import { ColdObservable, Subject } from 'rxjs';
import { getObservablePolyfillInfo } from '@rxjs/observable-polyfill';
import { map } from 'rxjs/map';
import { pipe } from 'rxjs/pipe';
import { scan } from 'rxjs/scan';

const requiredPrimitives = ['AbortController', 'AbortSignal', 'EventTarget', 'WeakRef'];
for (const primitive of requiredPrimitives) {
  assert(typeof globalThis[primitive] === 'function', `Missing required ${primitive}.`);
}
assert(typeof AbortSignal.any === 'function', 'Missing required AbortSignal.any.');
assert(typeof Symbol.dispose === 'symbol', 'Missing required Symbol.dispose.');
assert(typeof globalThis.Observable === 'function', 'RxJS did not select or install Observable.');
assert(
  typeof globalThis.Subscriber === 'function' || getObservablePolyfillInfo() === undefined,
  'The fallback did not install Subscriber.'
);

const values = await collect(
  new ColdObservable((subscriber) => {
    subscriber.next(1);
    subscriber.next(2);
    subscriber.next(3);
    subscriber.complete();
  })[pipe](
    (source) => source[map]((value) => value * 2),
    (source) => source[scan]((total, value) => total + value, 0)
  )
);
assert(JSON.stringify(values) === JSON.stringify([2, 6, 12]), `Unexpected Symbol pipeline values: ${JSON.stringify(values)}.`);

const subject = new Subject();
const subjectValues = [];
const subjectController = new AbortController();
subject.subscribe((value) => subjectValues.push(value), { signal: subjectController.signal });
subject.next('first');
subjectController.abort();
subject.next('ignored');
assert(JSON.stringify(subjectValues) === JSON.stringify(['first']), 'Subject cancellation failed.');

const resolvedEntry = typeof import.meta.resolve === 'function' ? import.meta.resolve('rxjs/map') : '';
assert(!resolvedEntry || resolvedEntry.includes('/dist/esm/map.js'), `Runtime resolved a non-ESM RxJS entry: ${resolvedEntry}.`);

const runtime = globalThis.Deno?.version?.deno
  ? { name: 'deno', version: globalThis.Deno.version.deno }
  : globalThis.Bun?.version
  ? { name: 'bun', version: globalThis.Bun.version }
  : { name: 'node', version: globalThis.process?.versions?.node ?? 'unknown' };

console.log(
  JSON.stringify({
    runtime,
    resolvedEntry,
    observable: getObservablePolyfillInfo()?.packageName ?? 'native-or-foreign',
    values,
  })
);

function collect(source) {
  return new Promise((resolve, reject) => {
    const values = [];
    source.subscribe({
      next: (value) => values.push(value),
      error: reject,
      complete: () => resolve(values),
    });
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
