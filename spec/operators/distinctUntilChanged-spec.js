/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.distinctUntilChanged()', function () {
  it('should distinguish between values', function (done) {
    var expected = [1, 2, 1];
    Observable
      .of(1, 1, 1, 2, 2, 1)
      .distinctUntilChanged()
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, null, done);
  });
});