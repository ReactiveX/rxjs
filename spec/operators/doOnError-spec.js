/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.doOnError()', function () {
  it('should execute callback on ', function () {
    Observable.throw('something').doOnError(function (x) {
      expect(x).toBe('something');
    })
    .subscribe(null, function (err) {
      expect(err).toBe('something');
    });
  });
  it('should skip callback without errors', function () {
    var actual = null;
    Observable.of(1, 2).doOnError(function (x) {
      actual = x;
    })
    .subscribe();

    expect(actual).toBe(null);
  });
});
