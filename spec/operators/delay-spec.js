/* globals describe, it, expect, expectObservable, hot, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.delay()', function () {
  it('should delay by specified timeframe', function () {
    var source = hot('--a--|');
    var expected =   '-----a--|';
    
    expectObservable(source.delay(30, rxTestScheduler)).toBe(expected);
  });
});