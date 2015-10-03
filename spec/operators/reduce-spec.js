/* globals describe, it, expect, hot, cold, expectObservable */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.reduce()', function () {
  it('should reduce', function () {
    var source = hot('--a--b--c--|');
    var expected =   '-----------(x|)';

    var reduceFunction = function (o, x) {
      return o + x;
    };

    expectObservable(source.reduce(reduceFunction, '')).toBe(expected, {x: 'abc'});
  });
});