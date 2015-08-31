/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.bufferCount', function () {
  it('should emit buffers at intervals', function (done) {
    var expected = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3]
    ];
    Observable.range(0, 4)
      .bufferCount(2, 1)
      .take(3)
      .subscribe(function (w) {
        expect(w).toEqual(expected.shift())
      }, null, done);
  }, 2000);
});