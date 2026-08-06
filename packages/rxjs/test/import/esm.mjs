import assert from 'node:assert/strict';
import { ColdObservable, Subject, TimeoutError, filter, map, rx, subscribe, take, toArray } from 'rxjs';
import * as deepMapModule from 'rxjs/pipeable/map';
import * as deepTakeModule from 'rxjs/pipeable/take';
import { rx as deepRx } from 'rxjs/rx';
import { subscribe as deepSubscribe } from 'rxjs/subscribe';
import { filter as filterSymbol } from 'rxjs/symbol/filter';
import { map as mapSymbol } from 'rxjs/symbol/map';
import { take as takeSymbol } from 'rxjs/symbol/take';
import { toArray as deepToArray } from 'rxjs/to-array';
import { pipe } from 'rxjs/pipe';
import { scan } from 'rxjs/scan';
import { switchMap } from 'rxjs/switch-map';
import { timeout } from 'rxjs/timeout';
import { timer } from 'rxjs/timer';

assert.equal(typeof globalThis.Observable, 'function');
assert.equal(typeof ColdObservable, 'function');
assert.equal(typeof Subject, 'function');
assert.equal(typeof TimeoutError, 'function');
assert.equal(typeof rx, 'function');
assert.equal(typeof map, 'function');
assert.equal(typeof filter, 'function');
assert.equal(typeof take, 'function');
assert.equal(typeof toArray, 'function');
assert.equal(typeof subscribe, 'function');
assert.equal(typeof deepMapModule.map, 'function');
assert.equal(typeof deepTakeModule.take, 'function');
assert.equal('mapOperator' in deepMapModule, false);
assert.equal('takeOperator' in deepTakeModule, false);
assert.equal(typeof deepRx, 'function');
assert.equal(typeof deepSubscribe, 'function');
assert.equal(typeof deepToArray, 'function');
assert.equal(typeof mapSymbol, 'symbol');
assert.equal(typeof filterSymbol, 'symbol');
assert.equal(typeof takeSymbol, 'symbol');
assert.equal(typeof globalThis.Observable.prototype[mapSymbol], 'function');
assert.equal(typeof globalThis.Observable.prototype[filterSymbol], 'function');
assert.equal(typeof globalThis.Observable.prototype[takeSymbol], 'function');
for (const symbol of [pipe, scan, switchMap, timeout, timer]) {
  assert.equal(typeof symbol, 'symbol');
}
for (const symbol of [mapSymbol, pipe, scan, switchMap, timeout]) {
  assert.equal(typeof globalThis.Observable.prototype[symbol], 'function');
  assert.equal(Object.getOwnPropertyDescriptor(globalThis.Observable.prototype, symbol).enumerable, true);
}
for (const symbol of [pipe, timer]) {
  assert.equal(typeof globalThis.Observable[symbol], 'function');
  assert.equal(Object.getOwnPropertyDescriptor(globalThis.Observable, symbol).enumerable, true);
}
