/* globals describe, it, expect */
var Rx = require('../../dist/cjs/Rx');
var Observable = Rx.Observable;

describe('Observable.prototype.bufferTime', function () {
  it('should emit buffers at intervals', function (done) {
    var expected = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8]
    ];
    Observable.interval(100)
      .bufferTime(320)
      .take(3)
      .subscribe(function (w) {
        expect(w).toEqual(expected.shift())
      }, null, done);
  }, 2000);
  
  
  it('should emit buffers that have been created at intervals and close after the specified delay', function (done) {
    var expected = [
      [0, 1, 2, 3, 4],
      [2, 3, 4, 5, 6],
      [4, 5, 6, 7, 8]
    ];
    Observable.interval(100)
      .bufferTime(520, 220)
      .take(3)
      .subscribe(function (w) {
        expect(w).toEqual(expected.shift())
      }, null, done);
  }, 2000);
});