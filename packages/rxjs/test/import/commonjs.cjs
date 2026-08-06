const assert = require('node:assert/strict');
const { ColdObservable, Subject, TimeoutError, filter, map, rx } = require('rxjs');
const { map: mapSymbol } = require('rxjs/map');
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
assert.equal(typeof mapSymbol, 'symbol');
assert.equal(typeof globalThis.Observable.prototype[mapSymbol], 'function');
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
