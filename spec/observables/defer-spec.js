/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.defer', function () {
  it('should create an observable from the provided observbale factory', function (done) {
    var i = 0;
    var expected = [1, 2, 3];
    Observable.defer(function () {
      return Observable.of(1, 2, 3);
    })
    .subscribe(function (x) {
      expect(x).toBe(expected[i++]);
    }, null, done);
  });
});