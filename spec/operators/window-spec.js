/* globals describe, it, expect, expectObservable, hot, rxTestScheduler */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.window', function () {
  it('should emit windows that close and reopen', function () {
    var source = hot('---a---b---c---d---e---f---g---h---i---|');
    var expected =   '-------------x------------y------------(z|)';

    expectObservable(source.window(Observable.interval(130, rxTestScheduler)).mergeMap(function (x) { return x.toArray(); }))
      .toBe(expected, {x: ['a','b','c'], y: ['d','e','f'], z: ['g','h','i'] });
  });
});