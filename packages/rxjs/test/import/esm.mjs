import assert from 'node:assert/strict';
import { ColdObservable, Subject, TimeoutError } from 'rxjs';
import { map } from 'rxjs/map';
import { pipe } from 'rxjs/pipe';
import { scan } from 'rxjs/scan';
import { switchMap } from 'rxjs/switch-map';
import { timeout } from 'rxjs/timeout';
import { timer } from 'rxjs/timer';

assert.equal(typeof globalThis.Observable, 'function');
assert.equal(typeof ColdObservable, 'function');
assert.equal(typeof Subject, 'function');
assert.equal(typeof TimeoutError, 'function');
assert.equal(typeof map, 'symbol');
assert.equal(typeof globalThis.Observable.prototype[map], 'function');
for (const symbol of [pipe, scan, switchMap, timeout, timer]) {
  assert.equal(typeof symbol, 'symbol');
}
for (const symbol of [map, pipe, scan, switchMap, timeout]) {
  assert.equal(typeof globalThis.Observable.prototype[symbol], 'function');
  assert.equal(Object.getOwnPropertyDescriptor(globalThis.Observable.prototype, symbol).enumerable, true);
}
for (const symbol of [pipe, timer]) {
  assert.equal(typeof globalThis.Observable[symbol], 'function');
  assert.equal(Object.getOwnPropertyDescriptor(globalThis.Observable, symbol).enumerable, true);
}
