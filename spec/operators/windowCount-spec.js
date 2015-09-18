/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.windowCount', function () {
  it('should emit windows at intervals', function (done) {
    var expected = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3]
    ];
    Observable.range(0, 4)
      .windowCount(2, 1)
      .take(3)
      .mergeMap(function (x) { return x.toArray(); })
      .subscribe(function (w) {
        expect(w).toEqual(expected.shift())
      }, null, done);
  }, 2000);
  
  it('should emit buffers at buffersize of intervals if not specified', function (done) {
    var expected = [
      [0, 1],
      [2, 3],
      [4, 5]
    ];
    Observable.range(0, 6)
      .windowCount(2)
      .mergeMap(function (x) { return x.toArray(); })
      .subscribe(function (w) {
        expect(w).toEqual(expected.shift())
      }, null, done);
  }, 2000);
});