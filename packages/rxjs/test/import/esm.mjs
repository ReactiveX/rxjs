import assert from 'node:assert/strict';
import { ColdObservable, Subject, TimeoutError } from 'rxjs';
import { map } from 'rxjs/map';

assert.equal(typeof globalThis.Observable, 'function');
assert.equal(typeof ColdObservable, 'function');
assert.equal(typeof Subject, 'function');
assert.equal(typeof TimeoutError, 'function');
assert.equal(typeof map, 'symbol');
assert.equal(typeof globalThis.Observable.prototype[map], 'function');
