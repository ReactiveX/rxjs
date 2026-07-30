const assert = require('node:assert/strict');
const { ColdObservable, Subject, TimeoutError } = require('rxjs');
const { map } = require('rxjs/map');

assert.equal(typeof globalThis.Observable, 'function');
assert.equal(typeof ColdObservable, 'function');
assert.equal(typeof Subject, 'function');
assert.equal(typeof TimeoutError, 'function');
assert.equal(typeof map, 'symbol');
assert.equal(typeof globalThis.Observable.prototype[map], 'function');
