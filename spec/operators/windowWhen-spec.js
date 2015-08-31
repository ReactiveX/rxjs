/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.windowWhen', function () {
  it('should emit windows that close and reopen', function (done) {
    var expected = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8]
    ];
    Observable.interval(100)
      .windowWhen(function () { return Observable.timer(320); })
      .take(3)
      .flatMap(function (x) { return x.toArray(); })
      .subscribe(function (w) {
        expect(w).toEqual(expected.shift())
      }, null, done);
  }, 2000);
});