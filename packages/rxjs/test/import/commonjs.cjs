const assert = require('node:assert/strict');
const { ColdObservable, Subject, TimeoutError, filter, map, rx, subscribe, take, toArray } = require('rxjs');
const deepMapModule = require('rxjs/pipeable/map');
const deepTakeModule = require('rxjs/pipeable/take');
const { rx: deepRx } = require('rxjs/rx');
const { subscribe: deepSubscribe } = require('rxjs/subscribe');
const { filter: filterSymbol } = require('rxjs/symbol/filter');
const { map: mapSymbol } = require('rxjs/symbol/map');
const { take: takeSymbol } = require('rxjs/symbol/take');
const { toArray: deepToArray } = require('rxjs/to-array');
const { pipe } = require('rxjs/pipe');
const { scan } = require('rxjs/scan');
const { switchMap } = require('rxjs/switch-map');
const { timeout } = require('rxjs/timeout');
const { timer } = require('rxjs/timer');

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
