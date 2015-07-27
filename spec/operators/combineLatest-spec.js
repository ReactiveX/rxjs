/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('combineLatest', function () {
  it('should combineLatest the source with the provided observables', function (done) {
    var expected = ['00', '01', '11', '12', '22', '23'];
    var i = 0;
    Observable.interval(50).take(3)
      .combineLatest(Observable.interval(45).take(4), function (a, b) {
        return '' + a + b;
      })
      .subscribe(function (x) {
        expect(x).toBe(expected[i++]);
      }, null, done);
  }, 300);
});