/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.sampleTime', function () {
  it('should get samples on a delay', function (done) {
    var expected = [1, 3, 5];
    Observable.interval(100)
      .sampleTime(220)
      .take(3)
      .subscribe(function (x) {
        expect(x).toBe(expected.shift());
      }, null, done);
  }, 2000);
});