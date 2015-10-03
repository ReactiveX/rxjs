/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.windowTime', function () {
  it('should emit windows at intervals', function (done) {
    var expected = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8]
    ];
    Observable.interval(100)
      .windowTime(320)
      .take(3)
      .mergeMap(function (x) { return x.toArray(); })
      .subscribe(function (w) {
        expect(w).toEqual(expected.shift());
      }, null, done);
  }, 2000);

  it('should emit windows that have been created at intervals and close after the specified delay', function (done) {
    var expected = [
      [0, 1, 2, 3, 4],
      [2, 3, 4, 5, 6],
      [4, 5, 6, 7, 8]
    ];
    Observable.interval(100)
      .windowTime(520, 220)
      .take(3)
      .mergeMap(function (x) { return x.toArray(); })
      .subscribe(function (w) {
        expect(w).toEqual(expected.shift());
      }, null, done);
  }, 2000);
});