/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.doOnNext()', function () {
  it('should execute callback', function () {
    var actual = null;
    Observable.of('something').doOnNext(function (x) {
      actual = x;
    })
    .subscribe();

    expect(actual).toBe('something');
  });
});
