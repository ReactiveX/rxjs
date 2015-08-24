/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.bufferWhen', function () {
  it('should emit buffers that close and reopen', function (done) {
    var expected = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8]
    ];
    Observable.interval(100)
      .bufferWhen(function () { return Observable.timer(320); })
      .take(3)
      .subscribe(function (w) {
        expect(w).toEqual(expected.shift())
      }, null, done);
  }, 2000);
});